using API.Common;
using Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;
using Application.Features.Notifications.Commands.MarkNotificationAsRead;
using Application.Features.Notifications.Queries.GetMyNotifications;
using Application.Features.Notifications.Queries.GetUnreadCount;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => (await mediator.Send(new GetMyNotificationsQuery(page, pageSize), ct)).ToActionResult();

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
        => (await mediator.Send(new GetUnreadCountQuery(), ct)).ToActionResult();

    [HttpPut("{id:long}/read")]
    public async Task<IActionResult> MarkAsRead(long id, CancellationToken ct)
        => (await mediator.Send(new MarkNotificationAsReadCommand(id), ct)).ToNoContentResult();

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
        => (await mediator.Send(new MarkAllNotificationsAsReadCommand(), ct)).ToNoContentResult();
}
