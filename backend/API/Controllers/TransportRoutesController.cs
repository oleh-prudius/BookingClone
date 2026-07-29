using API.Common;
using Application.Features.TransportRoutes.Queries.GetTransportRouteById;
using Application.Features.TransportRoutes.Queries.SearchTransportRoutes;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/transport-routes")]
public class TransportRoutesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] long? fromCityId,
        [FromQuery] long? toCityId,
        [FromQuery] DateOnly? date,
        [FromQuery] TransportType? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => (await mediator.Send(new SearchTransportRoutesQuery(fromCityId, toCityId, date, type, page, pageSize), ct)).ToActionResult();

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken ct)
        => (await mediator.Send(new GetTransportRouteByIdQuery(id), ct)).ToActionResult();
}
