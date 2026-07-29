using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Commands.MarkNotificationAsRead;

public record MarkNotificationAsReadCommand(long Id) : IRequest<Result<bool>>;
