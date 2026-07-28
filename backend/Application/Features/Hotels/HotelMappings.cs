using Application.DTOs;
using Domain.Entities;

namespace Application.Features.Hotels;

internal static class HotelMappings
{
    internal static HotelDto MapToDto(Hotel h) => new()
    {
        Id = h.Id,
        Name = h.Name,
        Description = h.Description,
        CityName = h.Address?.City?.Name ?? string.Empty,
        CountryName = h.Address?.City?.Country?.Name ?? string.Empty,
        Street = h.Address is not null ? $"{h.Address.Street} {h.Address.HouseNumber}" : string.Empty,
        Latitude = h.Address?.Latitude,
        Longitude = h.Address?.Longitude,
        HotelCategoryId = h.HotelCategoryId,
        HotelCategoryName = h.HotelCategory?.Name ?? string.Empty,
        RealtorId = h.RealtorId,
        IsArchived = h.IsArchived,
        ArrivalTimeUtcFrom = h.ArrivalTimeUtcFrom,
        ArrivalTimeUtcTo = h.ArrivalTimeUtcTo,
        DepartureTimeUtcFrom = h.DepartureTimeUtcFrom,
        DepartureTimeUtcTo = h.DepartureTimeUtcTo,
        CoverPhotoUrl = h.Photos?
            .OrderBy(p => p.Priority)
            .FirstOrDefault()?.Name,
        PricePerNight = h.Rooms
            .SelectMany(r => r.RoomVariants)
            .Select(rv => (decimal?)rv.Price)
            .Min(),
        Rating = null,
        Amenities = h.HotelHotelAmenities?
            .Select(hha => hha.HotelAmenity.Name)
            .ToList() ?? new List<string>()
    };
}
