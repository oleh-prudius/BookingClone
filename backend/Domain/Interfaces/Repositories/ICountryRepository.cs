using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface ICountryRepository : IRepository<Country>
{
    Task<Country?> GetByNameAsync(string name, CancellationToken ct = default);
}
