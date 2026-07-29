using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface INotificationRepository
{
    Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetByUserIdAsync(long userId, int page, int pageSize, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(long userId, CancellationToken ct = default);
    Task<Notification?> GetByIdAsync(long id, CancellationToken ct = default);
    Task AddAsync(Notification notification, CancellationToken ct = default);
    Task MarkAsReadAsync(Notification notification, CancellationToken ct = default);
    Task MarkAllAsReadAsync(long userId, CancellationToken ct = default);
}
