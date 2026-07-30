using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CityRepository(AppDbContext context) : Repository<City>(context), ICityRepository
{
    private IQueryable<City> WithIncludes() =>
        Context.Cities.Include(c => c.Country);

    public override async Task<IReadOnlyList<City>> GetAllAsync(CancellationToken ct = default) =>
        (await WithIncludes().AsNoTracking().ToListAsync(ct)).AsReadOnly();

    public override async Task<(IReadOnlyList<City> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var query = WithIncludes().AsNoTracking();
        var totalCount = await query.CountAsync(ct);
        var items = (await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct)).AsReadOnly();
        return (items, totalCount);
    }

    // No AsNoTracking — entity may be used for update
    public override async Task<City?> GetByIdAsync(long id, CancellationToken ct = default) =>
        await WithIncludes().FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<City?> GetByNameAndCountryIdAsync(string name, long countryId, CancellationToken ct = default) =>
        await WithIncludes().FirstOrDefaultAsync(c => c.CountryId == countryId && c.Name.ToLower() == name.ToLower(), ct);
}
