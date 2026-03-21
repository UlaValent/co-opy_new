using GameApp.Service.Models;
using GameApp.Service.Services;
using Microsoft.EntityFrameworkCore;

namespace GameApp.Integration.Data;

public class EfAccountRepository : IAccountRepository
{
    private readonly IDbContextFactory<AppDbContext> _dbFactory;

    public EfAccountRepository(IDbContextFactory<AppDbContext> dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public Account? GetByEmail(string email)
    {
        using var db = _dbFactory.CreateDbContext();
        return db.Accounts.FirstOrDefault(a => a.Email == email);
    }

    public Account? GetById(Guid id)
    {
        using var db = _dbFactory.CreateDbContext();
        return db.Accounts.FirstOrDefault(a => a.Id == id);
    }

    public Account? GetByRefreshTokenHash(string tokenHash)
    {
        using var db = _dbFactory.CreateDbContext();
        var session = db.RefreshTokenSessions
            .AsNoTracking()
            .FirstOrDefault(s => s.TokenHash == tokenHash && s.RevokedAtUtc == null && s.ExpiresAtUtc > DateTime.UtcNow);

        if (session is null)
            return null;

        return db.Accounts.FirstOrDefault(a => a.Id == session.AccountId);
    }

    public Account? GetByUsername(string username)
    {
        using var db = _dbFactory.CreateDbContext();
        return db.Accounts.FirstOrDefault(a => a.Username == username);
    }

    public void Add(Account account)
    {
        using var db = _dbFactory.CreateDbContext();
        db.Accounts.Add(account);
        db.SaveChanges();
    }

    public void Update(Account account)
    {
        using var db = _dbFactory.CreateDbContext();
        db.Accounts.Update(account);
        db.SaveChanges();
    }

    public void AddRefreshSession(RefreshTokenSession session)
    {
        using var db = _dbFactory.CreateDbContext();
        db.RefreshTokenSessions.Add(session);
        db.SaveChanges();
    }

    public void RevokeRefreshSession(string tokenHash, DateTime revokedAtUtc, string reason)
    {
        using var db = _dbFactory.CreateDbContext();
        var session = db.RefreshTokenSessions.FirstOrDefault(s => s.TokenHash == tokenHash);
        if (session is null)
            return;

        session.RevokedAtUtc = revokedAtUtc;
        session.RevocationReason = reason;
        db.SaveChanges();
    }

    public void RevokeAllRefreshSessions(Guid accountId, DateTime revokedAtUtc, string reason)
    {
        using var db = _dbFactory.CreateDbContext();
        var sessions = db.RefreshTokenSessions
            .Where(s => s.AccountId == accountId && s.RevokedAtUtc == null)
            .ToList();

        if (sessions.Count == 0)
            return;

        foreach (var session in sessions)
        {
            session.RevokedAtUtc = revokedAtUtc;
            session.RevocationReason = reason;
        }

        db.SaveChanges();
    }

    public void Delete(Account account)
    {
        using var db = _dbFactory.CreateDbContext();
        db.Accounts.Attach(account);
        db.Accounts.Remove(account);
        db.SaveChanges();
    }
}
