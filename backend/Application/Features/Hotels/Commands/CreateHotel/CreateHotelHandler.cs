using Application.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Hotels.Commands.CreateHotel;

public class CreateHotelHandler(IHotelRepository hotelRepository)
    : IRequestHandler<CreateHotelCommand, Result<HotelDto>>
{
    public async Task<Result<HotelDto>> Handle(CreateHotelCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Error.Validation("Hotel name is required.");

        var hotel = new Hotel
        {
            Name = request.Name,
            Description = request.Description,
            AddressId = request.AddressId,
            HotelCategoryId = request.HotelCategoryId,
            RealtorId = request.RealtorId,
            ArrivalTimeUtcFrom = request.ArrivalTimeUtcFrom,
            ArrivalTimeUtcTo = request.ArrivalTimeUtcTo,
            DepartureTimeUtcFrom = request.DepartureTimeUtcFrom,
            DepartureTimeUtcTo = request.DepartureTimeUtcTo,
            IsArchived = false,
            StarRating = request.StarRating
        };

        var created = await hotelRepository.AddAsync(hotel);
        return HotelMappings.MapToDto(created);
    }
}
