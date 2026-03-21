using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwt.ExpirationMinutes);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new Claim(ClaimTypes.Name, account.Username),
            new Claim(ClaimTypes.Email, account.Email)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SigningKey));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expiresAt,
            Account = ToResponse(account)
        };
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
