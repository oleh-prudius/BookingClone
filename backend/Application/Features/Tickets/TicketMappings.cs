using Application.DTOs;
using Domain.Entities;

namespace Application.Features.Tickets;

internal static class TicketMappings
{
    internal static TicketDto MapToDto(Ticket t) => new()
    {
        Id = t.Id,
        TransportRouteId = t.TransportRouteId,
        FromCityName = t.TransportRoute.FromCity.Name,
        ToCityName = t.TransportRoute.ToCity.Name,
        DepartureUtc = t.TransportRoute.DepartureUtc,
        ArrivalUtc = t.TransportRoute.ArrivalUtc,
        Seats = t.Seats,
        TotalPrice = t.TotalPrice,
        PurchasedAtUtc = t.PurchasedAtUtc
    };
}
