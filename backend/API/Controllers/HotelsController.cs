using API.Common;
using Application.Features.Hotels.Commands.CreateHotel;
using Application.Features.Hotels.Commands.DeleteHotel;
using Application.Features.Hotels.Commands.UpdateHotel;
using Application.Features.Hotels.Queries.GetAllHotels;
using Application.Features.Hotels.Queries.GetHotelById;
using Application.Features.Hotels.Queries.GetHotelsByRealtorId;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetHotels(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? name = null,
        [FromQuery] long? categoryId = null,
        [FromQuery] long[]? categoryIds = null,
        [FromQuery] int[]? starRatings = null,
        [FromQuery] long[]? amenityIds = null,
        [FromQuery] string? city = null,
        [FromQuery] string? country = null,
        [FromQuery] decimal? priceMin = null,
        [FromQuery] decimal? priceMax = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] DateOnly? checkIn = null,
        [FromQuery] DateOnly? checkOut = null,
        [FromQuery] int? adults = null,
        [FromQuery] int? children = null,
        CancellationToken ct = default)
        => (await mediator.Send(new GetAllHotelsQuery(
            Page: page,
            PageSize: pageSize,
            Name: name,
            CategoryId: categoryId,
            CityName: city,
            CountryName: country,
            PriceMin: priceMin,
            PriceMax: priceMax,
            SortBy: sortBy,
            CategoryIds: categoryIds,
            StarRatings: starRatings,
            AmenityIds: amenityIds), ct)).ToActionResult();

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetHotel(int id, CancellationToken ct)
        => (await mediator.Send(new GetHotelByIdQuery(id), ct)).ToActionResult();

    [HttpGet("by-realtor/{realtorId:long}")]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> GetByRealtor(long realtorId, CancellationToken ct)
        => (await mediator.Send(new GetHotelsByRealtorIdQuery(realtorId), ct)).ToActionResult();

    [HttpPost]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> CreateHotel([FromBody] CreateHotelCommand command, CancellationToken ct)
        => (await mediator.Send(command, ct)).ToCreatedResult();

    [HttpPut("{id:long}")]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> UpdateHotel(long id, [FromBody] UpdateHotelCommand command, CancellationToken ct)
        => (await mediator.Send(command with { Id = (int)id }, ct)).ToNoContentResult();

    [HttpDelete("{id:long}")]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> DeleteHotel(long id, CancellationToken ct)
        => (await mediator.Send(new DeleteHotelCommand((int)id), ct)).ToNoContentResult();
}
