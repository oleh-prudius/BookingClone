using Application.Interfaces;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkNotificationAsRead;

public class MarkNotificationAsReadHandler(INotificationRepository notificationRepository, ICurrentUserService currentUser)
    : IRequestHandler<MarkNotificationAsReadCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(MarkNotificationAsReadCommand request, CancellationToken ct)
    {
        var notification = await notificationRepository.GetByIdAsync(request.Id, ct);
        if (notification is null)
            return Error.NotFound($"Notification with id {request.Id} not found.");

        if (notification.UserId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        await notificationRepository.MarkAsReadAsync(notification, ct);
        return true;
    }
}
