namespace Domain.Interfaces.Repositories;

public interface ICustomerRepository
{
    Task<bool> ExistsAsync(long customerId, CancellationToken ct = default);
}
