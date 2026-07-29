using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.RoomVariants.Commands.CreateRoomVariant;

public class CreateRoomVariantHandler(IRoomVariantRepository repository, IRoomRepository roomRepository, IHotelRepository hotelRepository, ICurrentUserService currentUser)
    : IRequestHandler<CreateRoomVariantCommand, Result<RoomVariantDto>>
{
    public async Task<Result<RoomVariantDto>> Handle(CreateRoomVariantCommand request, CancellationToken ct)
    {
        if (request.Price <= 0)
            return Error.Validation("Price must be greater than zero.");

        if (!currentUser.IsInRole(Roles.Admin))
        {
            var room = await roomRepository.GetByIdAsync(request.RoomId, ct);
            if (room is null)
                return Error.NotFound($"Room with id {request.RoomId} not found.");
            var hotel = await hotelRepository.GetByIdAsync(room.HotelId, ct);
            if (hotel is null || hotel.RealtorId != currentUser.GetUserId())
                return Error.Forbidden("You do not have access to this resource.");
        }

        var entity = new RoomVariant
        {
            Price = request.Price,
            DiscountPrice = request.DiscountPrice,
            RoomId = request.RoomId,
            GuestInfo = new GuestInfo { AdultCount = request.AdultCount, ChildCount = request.ChildCount },
            BedInfo = new BedInfo
            {
                SingleBedCount = request.SingleBedCount,
                DoubleBedCount = request.DoubleBedCount,
                ExtraBedCount = request.ExtraBedCount,
                SofaCount = request.SofaCount,
                KingsizeBedCount = request.KingsizeBedCount
            }
        };
        await repository.AddAsync(entity, ct);
        var created = await repository.GetByIdAsync(entity.Id, ct);
        return RoomVariantMappings.MapToDto(created!);
    }
}
