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

    public void Delete(Account account)
    {
        using var db = _dbFactory.CreateDbContext();
        db.Accounts.Attach(account);
        db.Accounts.Remove(account);
        db.SaveChanges();
    }
}
