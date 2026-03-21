namespace GameApp.Service.Models;

public class RefreshTokenSession
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid AccountId { get; init; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; init; } = DateTime.UtcNow;
    public DateTime? RevokedAtUtc { get; set; }
    public string? RevocationReason { get; set; }

    public Account? Account { get; set; }
}
