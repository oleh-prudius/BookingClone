using API.Common;
using Application.Features.HotelBreakfasts.Commands.CreateHotelBreakfast;
using Application.Features.HotelBreakfasts.Queries.GetHotelBreakfasts;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/hotel-breakfasts")]
public class HotelBreakfastsController(IMediator mediator) : ControllerBase
{
    [HttpGet("/api/hotels/{hotelId:long}/breakfasts")]
    public async Task<IActionResult> GetByHotel(long hotelId, CancellationToken ct)
        => (await mediator.Send(new GetHotelBreakfastsQuery(hotelId), ct)).ToActionResult();

    [HttpPost]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> Create([FromBody] CreateHotelBreakfastCommand command, CancellationToken ct)
        => (await mediator.Send(command, ct)).ToCreatedResult();
}
