using System.Security.Claims;
using API.Common;
using Application.DTOs;
using Application.Features.Bookings.Commands.ChangeBookingStatus;
using Application.Features.Bookings.Commands.CreateBooking;
using Application.Features.Bookings.Commands.DeleteBooking;
using Application.Features.Bookings.Commands.UpdateBooking;
using Application.Features.Bookings.Queries.GetAllBookings;
using Application.Features.Bookings.Queries.GetAllBookingsAdmin;
using Application.Features.Bookings.Queries.GetBookingById;
using Application.Features.Bookings.Queries.GetBookingsByHotelId;
using Domain.Constants;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(idClaim, out var customerId))
            return Unauthorized();

        return (await mediator.Send(new GetAllBookingsQuery(customerId, page, pageSize), ct)).ToActionResult();
    }

    [HttpGet("admin/all")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetAllAdmin([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => (await mediator.Send(new GetAllBookingsAdminQuery(page, pageSize), ct)).ToActionResult();

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken ct)
        => (await mediator.Send(new GetBookingByIdQuery(id), ct)).ToActionResult();

    [HttpGet("by-hotel/{hotelId:long}")]
    [Authorize(Roles = Roles.Admin + "," + Roles.Realtor)]
    public async Task<IActionResult> GetByHotel(long hotelId, CancellationToken ct)
        => (await mediator.Send(new GetBookingsByHotelIdQuery(hotelId), ct)).ToActionResult();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto, CancellationToken ct)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(idClaim, out var customerId))
            return Unauthorized();

        var command = new CreateBookingCommand(
            customerId,
            dto.RoomVariantId,
            dto.Quantity,
            dto.CheckIn,
            dto.CheckOut,
            dto.TotalPrice,
            dto.PersonalWishes,
            dto.Breakfasts
        );
        return (await mediator.Send(command, ct)).ToCreatedResult();
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] CreateBookingDto dto, CancellationToken ct)
    {
        var command = new UpdateBookingCommand(
            id,
            dto.RoomVariantId,
            dto.Quantity,
            dto.CheckIn,
            dto.CheckOut,
            dto.TotalPrice,
            dto.PersonalWishes
        );
        return (await mediator.Send(command, ct)).ToNoContentResult();
    }

    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> ChangeStatus(long id, [FromBody] ChangeBookingStatusRequest body, CancellationToken ct)
        => (await mediator.Send(new ChangeBookingStatusCommand(id, body.Status), ct)).ToActionResult();

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
        => (await mediator.Send(new DeleteBookingCommand(id), ct)).ToNoContentResult();
}

public record ChangeBookingStatusRequest(BookingStatus Status);
