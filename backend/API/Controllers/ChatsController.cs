using API.Common;
using Application.Features.Chats.Commands.CreateChat;
using Application.Features.Chats.Commands.DeleteChat;
using Application.Features.Chats.Queries.GetChatById;
using Application.Features.Chats.Queries.GetChatsByCustomerId;
using Application.Features.Chats.Queries.GetChatsByRealtorId;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatsController(IMediator mediator) : ControllerBase
{
    [HttpGet("{id:long}")]
    [Authorize]
    public async Task<IActionResult> GetById(long id, CancellationToken ct)
        => (await mediator.Send(new GetChatByIdQuery(id), ct)).ToActionResult();

    [HttpGet("by-customer/{customerId:long}")]
    [Authorize]
    public async Task<IActionResult> GetByCustomerId(long customerId, CancellationToken ct)
        => (await mediator.Send(new GetChatsByCustomerIdQuery(customerId), ct)).ToActionResult();

    [HttpGet("by-realtor/{realtorId:long}")]
    [Authorize]
    public async Task<IActionResult> GetByRealtorId(long realtorId, CancellationToken ct)
        => (await mediator.Send(new GetChatsByRealtorIdQuery(realtorId), ct)).ToActionResult();

    [HttpPost]
    [Authorize(Roles = Roles.Customer)]
    public async Task<IActionResult> Create([FromBody] CreateChatCommand command, CancellationToken ct)
        => (await mediator.Send(command, ct)).ToCreatedResult();

    [HttpDelete("{id:long}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
        => (await mediator.Send(new DeleteChatCommand(id), ct)).ToNoContentResult();
}
