using Application.DTOs;
using Domain.Entities;

namespace Application.Features.TransportRoutes;

internal static class TransportRouteMappings
{
    internal static TransportRouteDto MapToDto(TransportRoute r, int bookedSeats) => new()
    {
        Id = r.Id,
        Type = r.Type.ToString(),
        FromCityId = r.FromCityId,
        FromCityName = r.FromCity.Name,
        ToCityId = r.ToCityId,
        ToCityName = r.ToCity.Name,
        DepartureUtc = r.DepartureUtc,
        ArrivalUtc = r.ArrivalUtc,
        Price = r.Price,
        TotalSeats = r.TotalSeats,
        AvailableSeats = r.TotalSeats - bookedSeats,
        CarrierName = r.CarrierName,
        VehicleModel = r.VehicleModel
    };
}
