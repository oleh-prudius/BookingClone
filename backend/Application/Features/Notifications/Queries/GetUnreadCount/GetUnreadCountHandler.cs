using Application.Interfaces;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Notifications.Queries.GetUnreadCount;

public class GetUnreadCountHandler(INotificationRepository notificationRepository, ICurrentUserService currentUser)
    : IRequestHandler<GetUnreadCountQuery, Result<int>>
{
    public async Task<Result<int>> Handle(GetUnreadCountQuery request, CancellationToken ct)
    {
        var userId = currentUser.GetUserId()!.Value;
        var count = await notificationRepository.GetUnreadCountAsync(userId, ct);
        return count;
    }
}
