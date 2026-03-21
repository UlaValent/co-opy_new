using GameApp.Service.Models;

namespace GameApp.Service.Services;

public interface IAccountRepository
{
    Account? GetByEmail(string email);
    Account? GetById(Guid id);
    Account? GetByUsername(string username);
    Account? GetByRefreshTokenHash(string tokenHash);
    void Add(Account account);
    void Update(Account account);
    void AddRefreshSession(RefreshTokenSession session);
    void RevokeRefreshSession(string tokenHash, DateTime revokedAtUtc, string reason);
    void RevokeAllRefreshSessions(Guid accountId, DateTime revokedAtUtc, string reason);
    void Delete(Account account);
}
