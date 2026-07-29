using Application.DTOs;
using Application.Features.Rooms;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Rooms.Commands.UpdateRoom;

public class UpdateRoomHandler(IRoomRepository roomRepository, IHotelRepository hotelRepository, ICurrentUserService currentUser)
    : IRequestHandler<UpdateRoomCommand, Result<RoomDto>>
{
    public async Task<Result<RoomDto>> Handle(UpdateRoomCommand request, CancellationToken ct)
    {
        var room = await roomRepository.GetByIdAsync(request.Id, ct);
        if (room is null)
            return Error.NotFound($"Room with id {request.Id} not found.");

        if (!currentUser.IsInRole(Roles.Admin))
        {
            var hotel = await hotelRepository.GetByIdAsync(room.HotelId, ct);
            if (hotel is null || hotel.RealtorId != currentUser.GetUserId())
                return Error.Forbidden("You do not have access to this resource.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
            return Error.Validation("Room name is required.");

        room.Name = request.Name;
        room.Area = request.Area;
        room.NumberOfRooms = request.NumberOfRooms;
        room.Quantity = request.Quantity;
        room.RoomTypeId = request.RoomTypeId;

        await roomRepository.UpdateAsync(room, ct);
        return RoomMappings.MapToDto(room);
    }
}
