using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class TicketRepository(AppDbContext context) : ITicketRepository
{
    private IQueryable<Ticket> WithIncludes() => context.Tickets
        .Include(t => t.TransportRoute)
            .ThenInclude(r => r.FromCity)
        .Include(t => t.TransportRoute)
            .ThenInclude(r => r.ToCity);

    public async Task<Ticket> AddAsync(Ticket ticket, CancellationToken ct = default)
    {
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync(ct);
        return ticket;
    }

    public Task<Ticket?> GetByIdAsync(long id, CancellationToken ct = default) =>
        WithIncludes().FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<(IReadOnlyList<Ticket> Items, int TotalCount)> GetByCustomerIdAsync(long customerId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = WithIncludes().Where(t => t.CustomerId == customerId).OrderByDescending(t => t.PurchasedAtUtc);

        var totalCount = await query.CountAsync(ct);
        var items = (await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .AsReadOnly();

        return (items, totalCount);
    }
}
