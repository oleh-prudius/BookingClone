using Application.DTOs;
using Application.Features.Rooms;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Rooms.Commands.CreateRoom;

public class CreateRoomHandler(IRoomRepository roomRepository, IHotelRepository hotelRepository, ICurrentUserService currentUser)
    : IRequestHandler<CreateRoomCommand, Result<RoomDto>>
{
    public async Task<Result<RoomDto>> Handle(CreateRoomCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Error.Validation("Room name is required.");

        if (!currentUser.IsInRole(Roles.Admin))
        {
            var hotel = await hotelRepository.GetByIdAsync(request.HotelId, ct);
            if (hotel is null)
                return Error.NotFound($"Hotel with id {request.HotelId} not found.");
            if (hotel.RealtorId != currentUser.GetUserId())
                return Error.Forbidden("You do not have access to this resource.");
        }

        var room = new Room
        {
            Name = request.Name,
            Area = request.Area,
            NumberOfRooms = request.NumberOfRooms,
            Quantity = request.Quantity,
            HotelId = request.HotelId,
            RoomTypeId = request.RoomTypeId
        };

        var created = await roomRepository.AddAsync(room, ct);
        return RoomMappings.MapToDto(created);
    }
}
