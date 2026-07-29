using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ChatRepository(AppDbContext context) : Repository<Chat>(context), IChatRepository
{
    private IQueryable<Chat> WithIncludes() => Context.Chats
        .Include(c => c.Customer)
        .Include(c => c.Realtor);

    public override async Task<Chat?> GetByIdAsync(long id, CancellationToken ct = default) =>
        await WithIncludes().FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<Chat>> GetByCustomerIdAsync(long customerId, CancellationToken ct = default) =>
        (await WithIncludes().Where(c => c.CustomerId == customerId).ToListAsync(ct)).AsReadOnly();

    public async Task<IReadOnlyList<Chat>> GetByRealtorIdAsync(long realtorId, CancellationToken ct = default) =>
        (await WithIncludes().Where(c => c.RealtorId == realtorId).ToListAsync(ct)).AsReadOnly();
}
