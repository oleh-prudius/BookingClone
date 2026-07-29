using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Hotels.Commands.CreateHotel;

public class CreateHotelHandler(IHotelRepository hotelRepository, ICurrentUserService currentUser)
    : IRequestHandler<CreateHotelCommand, Result<HotelDto>>
{
    public async Task<Result<HotelDto>> Handle(CreateHotelCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Error.Validation("Hotel name is required.");

        var realtorId = currentUser.IsInRole(Roles.Admin) ? request.RealtorId : currentUser.GetUserId() ?? request.RealtorId;

        var hotel = new Hotel
        {
            Name = request.Name,
            Description = request.Description,
            AddressId = request.AddressId,
            HotelCategoryId = request.HotelCategoryId,
            RealtorId = realtorId,
            ArrivalTimeUtcFrom = request.ArrivalTimeUtcFrom,
            ArrivalTimeUtcTo = request.ArrivalTimeUtcTo,
            DepartureTimeUtcFrom = request.DepartureTimeUtcFrom,
            DepartureTimeUtcTo = request.DepartureTimeUtcTo,
            IsArchived = false,
            StarRating = request.StarRating
        };

        var created = await hotelRepository.AddAsync(hotel, ct);
        return HotelMappings.MapToDto(created);
    }
}
