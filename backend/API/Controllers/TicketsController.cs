using API.Common;
using Application.Features.Tickets.Commands.PurchaseTicket;
using Application.Features.Tickets.Queries.GetMyTickets;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => (await mediator.Send(new GetMyTicketsQuery(page, pageSize), ct)).ToActionResult();

    [HttpPost]
    public async Task<IActionResult> Purchase([FromBody] PurchaseTicketCommand command, CancellationToken ct)
        => (await mediator.Send(command, ct)).ToCreatedResult();
}
