using Domain.Entities;
namespace Domain.Interfaces.Repositories;

public interface ICityRepository : IRepository<City>
{
    Task<City?> GetByNameAndCountryIdAsync(string name, long countryId, CancellationToken ct = default);
}