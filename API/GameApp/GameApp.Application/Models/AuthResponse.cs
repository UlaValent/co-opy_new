namespace GameApp.Application.Models;

public sealed class AuthResponse
{
    public string Token { get; init; } = string.Empty;
    public DateTime ExpiresAtUtc { get; init; }
    public string RefreshToken { get; init; } = string.Empty;
    public DateTime RefreshTokenExpiresAtUtc { get; init; }
    public AccountResponse Account { get; init; } = new();
}

public sealed class AccountResponse
{
    public string Id { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}
