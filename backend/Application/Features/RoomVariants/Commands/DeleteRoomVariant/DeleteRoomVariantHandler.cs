using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.RoomVariants.Commands.DeleteRoomVariant;

public class DeleteRoomVariantHandler(IRoomVariantRepository repository, IRoomRepository roomRepository, IHotelRepository hotelRepository, ICurrentUserService currentUser)
    : IRequestHandler<DeleteRoomVariantCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteRoomVariantCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity is null)
            return Error.NotFound($"Room variant with id {request.Id} not found.");

        if (!currentUser.IsInRole(Roles.Admin))
        {
            var room = await roomRepository.GetByIdAsync(entity.RoomId, ct);
            if (room is null)
                return Error.NotFound($"Room with id {entity.RoomId} not found.");
            var hotel = await hotelRepository.GetByIdAsync(room.HotelId, ct);
            if (hotel is null || hotel.RealtorId != currentUser.GetUserId())
                return Error.Forbidden("You do not have access to this resource.");
        }

        await repository.DeleteAsync(request.Id, ct);
        return true;
    }
}
