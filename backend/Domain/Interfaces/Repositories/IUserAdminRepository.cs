using Domain.Entities.Identity;

namespace Domain.Interfaces.Repositories;

public record UserWithRole(AppUser User, string Role);

public interface IUserAdminRepository
{
    Task<(IReadOnlyList<UserWithRole> Items, int TotalCount)> GetFilteredAsync(
        string? search,
        string? role,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<UserWithRole?> GetByIdAsync(long id, CancellationToken ct = default);
}
