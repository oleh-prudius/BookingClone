using API.Common;
using Application.Features.Cities.Commands.CreateCity;
using Application.Features.Cities.Commands.DeleteCity;
using Application.Features.Cities.Commands.FindOrCreateCity;
using Application.Features.Cities.Commands.UpdateCity;
using Application.Features.Cities.Queries.GetAllCities;
using Application.Features.Cities.Queries.GetCityById;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitiesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => (await mediator.Send(new GetAllCitiesQuery(page, pageSize), ct)).ToActionResult();

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken ct)
        => (await mediator.Send(new GetCityByIdQuery(id), ct)).ToActionResult();

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create([FromBody] CreateCityCommand command, CancellationToken ct)
        => (await mediator.Send(command, ct)).ToCreatedResult();

    /// <summary>
    /// Finds an existing city by name+country, or creates both the city and (if missing)
    /// its country. Lets a Realtor add a hotel in a location we haven't seeded, without
    /// going through the admin panel or typing raw IDs.
    /// </summary>
    [HttpPost("find-or-create")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Realtor}")]
    public async Task<IActionResult> FindOrCreate([FromBody] FindOrCreateCityCommand command, CancellationToken ct)
        => (await mediator.Send(command, ct)).ToCreatedResult();

    [HttpPut("{id:long}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateCityCommand command, CancellationToken ct)
        => (await mediator.Send(command with { Id = id }, ct)).ToNoContentResult();

    [HttpDelete("{id:long}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
        => (await mediator.Send(new DeleteCityCommand(id), ct)).ToNoContentResult();
}
