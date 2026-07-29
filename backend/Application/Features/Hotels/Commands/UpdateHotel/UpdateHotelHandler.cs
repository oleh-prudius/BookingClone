using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Hotels.Commands.UpdateHotel;

public class UpdateHotelHandler(IHotelRepository hotelRepository, ICurrentUserService currentUser)
    : IRequestHandler<UpdateHotelCommand, Result<HotelDto>>
{
    public async Task<Result<HotelDto>> Handle(UpdateHotelCommand request, CancellationToken ct)
    {
        var hotel = await hotelRepository.GetByIdAsync(request.Id);
        if (hotel is null)
            return Error.NotFound($"Hotel with id {request.Id} not found.");

        if (!currentUser.IsInRole(Roles.Admin) && hotel.RealtorId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        hotel.Name = request.Name;
        hotel.Description = request.Description;
        hotel.AddressId = request.AddressId;
        hotel.HotelCategoryId = request.HotelCategoryId;
        hotel.ArrivalTimeUtcFrom = request.ArrivalTimeUtcFrom;
        hotel.ArrivalTimeUtcTo = request.ArrivalTimeUtcTo;
        hotel.DepartureTimeUtcFrom = request.DepartureTimeUtcFrom;
        hotel.DepartureTimeUtcTo = request.DepartureTimeUtcTo;
        hotel.StarRating = request.StarRating;

        await hotelRepository.UpdateAsync(hotel);
        return HotelMappings.MapToDto(hotel);
    }
}
