using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Tickets.Commands.PurchaseTicket;

public class PurchaseTicketHandler(
    ITransportRouteRepository routeRepository,
    ITicketRepository ticketRepository,
    ICurrentUserService currentUser)
    : IRequestHandler<PurchaseTicketCommand, Result<TicketDto>>
{
    public async Task<Result<TicketDto>> Handle(PurchaseTicketCommand request, CancellationToken ct)
    {
        if (request.Seats <= 0)
            return Error.Validation("Seats must be greater than zero.");

        var route = await routeRepository.GetByIdAsync(request.TransportRouteId, ct);
        if (route is null)
            return Error.NotFound($"Transport route with id {request.TransportRouteId} not found.");

        var bookedSeats = await routeRepository.GetBookedSeatsAsync(request.TransportRouteId, ct);
        var availableSeats = route.TotalSeats - bookedSeats;
        if (request.Seats > availableSeats)
            return Error.Conflict($"Only {availableSeats} seat(s) available on this route.");

        var ticket = new Ticket
        {
            TransportRouteId = request.TransportRouteId,
            CustomerId = currentUser.GetUserId()!.Value,
            Seats = request.Seats,
            TotalPrice = route.Price * request.Seats,
            PurchasedAtUtc = DateTimeOffset.UtcNow
        };

        var created = await ticketRepository.AddAsync(ticket, ct);
        var withIncludes = await ticketRepository.GetByIdAsync(created.Id, ct);
        return TicketMappings.MapToDto(withIncludes!);
    }
}
