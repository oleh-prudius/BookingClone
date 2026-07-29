using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Hotels.Queries.GetHotelsByRealtorId;

public class GetHotelsByRealtorIdHandler(IHotelRepository hotelRepository, ICurrentUserService currentUser)
    : IRequestHandler<GetHotelsByRealtorIdQuery, Result<IReadOnlyList<HotelDto>>>
{
    public async Task<Result<IReadOnlyList<HotelDto>>> Handle(GetHotelsByRealtorIdQuery request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Admin) && request.RealtorId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        var hotels = await hotelRepository.GetByRealtorIdAsync(request.RealtorId, ct);
        return hotels.Select(HotelMappings.MapToDto).ToList().AsReadOnly();
    }
}
