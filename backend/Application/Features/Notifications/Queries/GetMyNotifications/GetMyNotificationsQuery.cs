using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Notifications.Queries.GetMyNotifications;

public record GetMyNotificationsQuery(int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<NotificationDto>>>;
