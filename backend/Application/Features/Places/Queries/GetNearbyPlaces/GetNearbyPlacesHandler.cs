using Application.DTOs;
using Domain.Common;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Places.Queries.GetNearbyPlaces;

public class GetNearbyPlacesHandler(IPlaceRepository placeRepository, IHotelRepository hotelRepository)
    : IRequestHandler<GetNearbyPlacesQuery, Result<IReadOnlyList<PlaceDto>>>
{
    public async Task<Result<IReadOnlyList<PlaceDto>>> Handle(GetNearbyPlacesQuery request, CancellationToken ct)
    {
        if (request.HotelId is null && request.CityId is null)
            return Error.Validation("Either hotelId or cityId must be provided.");

        long cityId;
        double? refLatitude = null;
        double? refLongitude = null;

        if (request.HotelId is not null)
        {
            var hotel = await hotelRepository.GetByIdAsync(request.HotelId.Value, ct);
            if (hotel is null)
                return Error.NotFound($"Hotel with id {request.HotelId} not found.");

            cityId = hotel.Address.CityId;
            refLatitude = hotel.Address.Latitude;
            refLongitude = hotel.Address.Longitude;
        }
        else
        {
            cityId = request.CityId!.Value;
        }

        var places = await placeRepository.GetByCityIdAsync(cityId, request.Category, ct);

        var dtos = places.Select(p => new PlaceDto
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            PhotoUrl = p.PhotoUrl,
            Description = p.Description,
            Latitude = p.Latitude,
            Longitude = p.Longitude,
            DistanceKm = refLatitude is not null && refLongitude is not null
                ? DistanceKilometers(refLatitude.Value, refLongitude.Value, p.Latitude, p.Longitude)
                : null
        });

        return dtos.OrderBy(d => d.DistanceKm ?? double.MaxValue).ToList();
    }

    private static double DistanceKilometers(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371.0;
        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return Math.Round(earthRadiusKm * c, 2);
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;
}
