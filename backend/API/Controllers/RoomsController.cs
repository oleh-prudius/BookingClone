using API.Common;
using Application.Features.Rooms.Commands.CreateRoom;
using Application.Features.Rooms.Commands.DeleteRoom;
using Application.Features.Rooms.Commands.UpdateRoom;
using Application.Features.Rooms.Queries.GetAllRooms;
using Application.Features.Rooms.Queries.GetRoomById;
using Application.Features.Rooms.Queries.GetRoomsByHotelId;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController(IMediator mediator) : ControllerBase
{
    [HttpGet("/api/hotels/{hotelId:long}/rooms")]
    public async Task<IActionResult> GetRoomsByHotel(long hotelId, CancellationToken ct)
        => (await mediator.Send(new GetRoomsByHotelIdQuery(hotelId), ct)).ToActionResult();

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => (await mediator.Send(new GetAllRoomsQuery(page, pageSize), ct)).ToActionResult();

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetRoom(long id, CancellationToken ct)
        => (await mediator.Send(new GetRoomByIdQuery(id), ct)).ToActionResult();

    [HttpPost]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomCommand command, CancellationToken ct)
        => (await mediator.Send(command, ct)).ToCreatedResult();

    [HttpPut("{id:long}")]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> UpdateRoom(long id, [FromBody] UpdateRoomCommand command, CancellationToken ct)
        => (await mediator.Send(command with { Id = id }, ct)).ToNoContentResult();

    [HttpDelete("{id:long}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> DeleteRoom(long id, CancellationToken ct)
        => (await mediator.Send(new DeleteRoomCommand(id), ct)).ToNoContentResult();
}
