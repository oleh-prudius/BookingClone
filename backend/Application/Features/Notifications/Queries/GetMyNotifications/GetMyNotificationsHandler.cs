using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Notifications.Queries.GetMyNotifications;

public class GetMyNotificationsHandler(INotificationRepository notificationRepository, ICurrentUserService currentUser)
    : IRequestHandler<GetMyNotificationsQuery, Result<PagedResult<NotificationDto>>>
{
    public async Task<Result<PagedResult<NotificationDto>>> Handle(GetMyNotificationsQuery request, CancellationToken ct)
    {
        var userId = currentUser.GetUserId()!.Value;
        var (items, totalCount) = await notificationRepository.GetByUserIdAsync(userId, request.Page, request.PageSize, ct);

        return new PagedResult<NotificationDto>
        {
            Items = items.Select(NotificationMappings.MapToDto).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
