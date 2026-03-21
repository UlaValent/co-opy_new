using GameApp.Service.Models;

namespace GameApp.Service.Services;

public interface IAccountRepository
{
    Account? GetByEmail(string email);
    Account? GetById(Guid id);
    Account? GetByUsername(string username);
    void Add(Account account);
    void Delete(Account account);
}
