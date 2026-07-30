using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CountryRepository(AppDbContext context) : Repository<Country>(context), ICountryRepository
{
    public async Task<Country?> GetByNameAsync(string name, CancellationToken ct = default) =>
        await Context.Countries.FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower(), ct);
}
