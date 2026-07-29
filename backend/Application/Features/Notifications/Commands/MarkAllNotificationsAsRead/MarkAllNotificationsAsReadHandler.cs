using Application.Interfaces;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;

public class MarkAllNotificationsAsReadHandler(INotificationRepository notificationRepository, ICurrentUserService currentUser)
    : IRequestHandler<MarkAllNotificationsAsReadCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken ct)
    {
        var userId = currentUser.GetUserId()!.Value;
        await notificationRepository.MarkAllAsReadAsync(userId, ct);
        return true;
    }
}
