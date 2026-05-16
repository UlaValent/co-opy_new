using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GameApp.Application.Models;
using GameApp.Application.Requests;
using GameApp.Service.Models;
using GameApp.Service.Options;
using GameApp.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GameApp.Application.Controllers;

[ApiController]
[Route("account")]
public sealed class AccountController : ControllerBase
{
    private const string TokenVersionClaimType = "token_version";

    private readonly IAccountRepository _accounts;
    private readonly JwtOptions _jwt;
    private readonly PasswordHasher<Account> _passwordHasher = new();

    public AccountController(IAccountRepository accounts, IOptions<JwtOptions> jwt)
    {
        _accounts = accounts;
        _jwt = jwt.Value;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public ActionResult<AuthResponse> Register([FromBody] RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var username = request.Username.Trim();

        if (_accounts.GetByEmail(email) is not null)
            return Conflict("Email is already in use.");

        if (_accounts.GetByUsername(username) is not null)
            return Conflict("Username is already in use.");

        var account = new Account
        {
            Email = email,
            Username = username
        };
        account.PasswordHash = _passwordHasher.HashPassword(account, request.Password);

        _accounts.Add(account);
        return Ok(CreateAuthResponse(account));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var account = _accounts.GetByEmail(email);
        if (account is null)
            return Unauthorized("Invalid email or password.");

        var verify = _passwordHasher.VerifyHashedPassword(account, account.PasswordHash, request.Password);
        if (verify == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid email or password.");

        return Ok(CreateAuthResponse(account));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public ActionResult<AuthResponse> Refresh([FromBody] RefreshTokenRequest request)
    {
        var refreshTokenHash = HashRefreshToken(request.RefreshToken.Trim());
        var account = _accounts.GetByRefreshTokenHash(refreshTokenHash);
        if (account is null)
            return Unauthorized("Invalid refresh token.");

        return Ok(CreateAuthResponse(account, refreshTokenHash));
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout([FromBody] RefreshTokenRequest? request = null)
    {
        if (!string.IsNullOrWhiteSpace(request?.RefreshToken))
        {
            var refreshTokenHash = HashRefreshToken(request.RefreshToken.Trim());
            _accounts.RevokeRefreshSession(refreshTokenHash, DateTime.UtcNow, "manual_logout");
        }

        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<AccountResponse> Me()
    {
        var account = GetAuthenticatedAccount();
        if (account is null)
            return Unauthorized();

        return Ok(ToResponse(account));
    }

    [HttpDelete]
    [Authorize]
    public IActionResult DeleteAccount()
    {
        var account = GetAuthenticatedAccount();
        if (account is null)
            return Unauthorized();

        _accounts.RevokeAllRefreshSessions(account.Id, DateTime.UtcNow, "account_deleted");
        _accounts.Delete(account);
        return NoContent();
    }

    private Account? GetAuthenticatedAccount()
    {
        var accountIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(accountIdClaim, out var accountId))
            return null;

        return _accounts.GetById(accountId);
    }

    private AuthResponse CreateAuthResponse(Account account)
    {
        return CreateAuthResponse(account, null);
    }

    private AuthResponse CreateAuthResponse(Account account, string? previousRefreshTokenHash)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwt.ExpirationMinutes);
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpirationDays);
        var refreshToken = CreateRefreshToken();
        var refreshTokenHash = HashRefreshToken(refreshToken);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Name, account.Username),
            new Claim(ClaimTypes.Email, account.Email),
            new Claim(TokenVersionClaimType, account.TokenVersion.ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SigningKey));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        if (!string.IsNullOrWhiteSpace(previousRefreshTokenHash))
        {
            _accounts.RevokeRefreshSession(previousRefreshTokenHash, DateTime.UtcNow, "rotated");
        }

        _accounts.AddRefreshSession(new RefreshTokenSession
        {
            AccountId = account.Id,
            TokenHash = refreshTokenHash,
            ExpiresAtUtc = refreshTokenExpiresAt
        });

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expiresAt,
            RefreshToken = refreshToken,
            RefreshTokenExpiresAtUtc = refreshTokenExpiresAt,
            Account = ToResponse(account)
        };
    }

    private static string CreateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    private static string HashRefreshToken(string refreshToken)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(hashBytes);
    }

    private static AccountResponse ToResponse(Account account)
    {
        return new AccountResponse
        {
            Id = account.Id.ToString(),
            Username = account.Username,
            Email = account.Email
        };
    }
}
