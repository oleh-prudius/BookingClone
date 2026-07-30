using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UserAdminRepository(AppDbContext context) : IUserAdminRepository
{
    public async Task<(IReadOnlyList<UserWithRole> Items, int TotalCount)> GetFilteredAsync(
        string? search,
        string? role,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(u =>
                EF.Functions.ILike(u.Email!, $"%{term}%") ||
                EF.Functions.ILike(u.FirstName, $"%{term}%") ||
                EF.Functions.ILike(u.LastName, $"%{term}%"));
        }

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));

        var totalCount = await query.CountAsync(ct);

        var users = await query
            .OrderBy(u => u.Email)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = users
            .Select(u => new UserWithRole(u, u.UserRoles.Select(ur => ur.Role.Name!).FirstOrDefault() ?? ""))
            .ToList()
            .AsReadOnly();

        return (items, totalCount);
    }

    public async Task<UserWithRole?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var user = await context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user is null) return null;

        var role = user.UserRoles.Select(ur => ur.Role.Name!).FirstOrDefault() ?? "";
        return new UserWithRole(user, role);
    }
}
