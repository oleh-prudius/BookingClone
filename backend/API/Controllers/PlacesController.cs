using API.Common;
using Application.Features.Places.Queries.GetNearbyPlaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/places")]
public class PlacesController(IMediator mediator) : ControllerBase
{
    [HttpGet("nearby")]
    public async Task<IActionResult> GetNearby(
        [FromQuery] long? hotelId,
        [FromQuery] long? cityId,
        [FromQuery] string? category,
        CancellationToken ct)
        => (await mediator.Send(new GetNearbyPlacesQuery(hotelId, cityId, category), ct)).ToActionResult();
}
