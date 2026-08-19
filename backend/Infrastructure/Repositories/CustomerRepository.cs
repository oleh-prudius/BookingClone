using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CustomerRepository(AppDbContext context) : ICustomerRepository
{
    public Task<bool> ExistsAsync(long customerId, CancellationToken ct = default) =>
        context.Customers.AnyAsync(c => c.Id == customerId, ct);
}
