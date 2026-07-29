using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TransportRouteRepository(AppDbContext context) : ITransportRouteRepository
{
    private IQueryable<TransportRoute> WithIncludes() => context.TransportRoutes
        .Include(r => r.FromCity)
        .Include(r => r.ToCity);

    public async Task<(IReadOnlyList<TransportRoute> Items, int TotalCount)> SearchAsync(
        long? fromCityId,
        long? toCityId,
        DateOnly? date,
        TransportType? type,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = WithIncludes();

        if (fromCityId is not null)
            query = query.Where(r => r.FromCityId == fromCityId);
        if (toCityId is not null)
            query = query.Where(r => r.ToCityId == toCityId);
        if (date is not null)
            query = query.Where(r => DateOnly.FromDateTime(r.DepartureUtc.UtcDateTime) == date);
        if (type is not null)
            query = query.Where(r => r.Type == type);

        query = query.OrderBy(r => r.DepartureUtc);

        var totalCount = await query.CountAsync(ct);
        var items = (await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .AsReadOnly();

        return (items, totalCount);
    }

    public Task<TransportRoute?> GetByIdAsync(long id, CancellationToken ct = default) =>
        WithIncludes().FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<int> GetBookedSeatsAsync(long routeId, CancellationToken ct = default)
    {
        var sum = await context.Tickets
            .Where(t => t.TransportRouteId == routeId)
            .SumAsync(t => (int?)t.Seats, ct);
        return sum ?? 0;
    }
}
