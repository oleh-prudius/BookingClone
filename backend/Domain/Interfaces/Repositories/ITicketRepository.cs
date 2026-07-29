using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface ITicketRepository
{
    Task<Ticket> AddAsync(Ticket ticket, CancellationToken ct = default);
    Task<Ticket?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<(IReadOnlyList<Ticket> Items, int TotalCount)> GetByCustomerIdAsync(long customerId, int page, int pageSize, CancellationToken ct = default);
}
