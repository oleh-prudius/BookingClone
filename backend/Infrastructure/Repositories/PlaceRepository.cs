using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PlaceRepository(AppDbContext context) : IPlaceRepository
{
    public async Task<IReadOnlyList<Place>> GetByCityIdAsync(long cityId, string? category, CancellationToken ct = default)
    {
        var query = context.Places.Where(p => p.CityId == cityId);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        return (await query.ToListAsync(ct)).AsReadOnly();
    }
}
