using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class NotificationRepository(AppDbContext context) : INotificationRepository
{
    public async Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetByUserIdAsync(long userId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc);

        var totalCount = await query.CountAsync(ct);
        var items = (await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .AsReadOnly();

        return (items, totalCount);
    }

    public Task<int> GetUnreadCountAsync(long userId, CancellationToken ct = default) =>
        context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);

    public Task<Notification?> GetByIdAsync(long id, CancellationToken ct = default) =>
        context.Notifications.FirstOrDefaultAsync(n => n.Id == id, ct);

    public async Task AddAsync(Notification notification, CancellationToken ct = default)
    {
        context.Notifications.Add(notification);
        await context.SaveChangesAsync(ct);
    }

    public async Task MarkAsReadAsync(Notification notification, CancellationToken ct = default)
    {
        notification.IsRead = true;
        await context.SaveChangesAsync(ct);
    }

    public async Task MarkAllAsReadAsync(long userId, CancellationToken ct = default)
    {
        await context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(setters => setters.SetProperty(n => n.IsRead, true), ct);
    }
}
