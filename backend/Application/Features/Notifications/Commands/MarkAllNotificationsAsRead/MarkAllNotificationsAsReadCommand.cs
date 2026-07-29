using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;

public record MarkAllNotificationsAsReadCommand : IRequest<Result<bool>>;
