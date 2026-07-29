using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.HotelBreakfasts.Commands.CreateHotelBreakfast;

public class CreateHotelBreakfastHandler(
    IHotelBreakfastRepository hotelBreakfastRepository,
    IHotelRepository hotelRepository,
    ICurrentUserService currentUser)
    : IRequestHandler<CreateHotelBreakfastCommand, Result<HotelBreakfastDto>>
{
    public async Task<Result<HotelBreakfastDto>> Handle(CreateHotelBreakfastCommand request, CancellationToken ct)
    {
        if (request.Price < 0)
            return Error.Validation("Price cannot be negative.");

        var hotel = await hotelRepository.GetByIdAsync(request.HotelId, ct);
        if (hotel is null)
            return Error.NotFound($"Hotel with id {request.HotelId} not found.");

        if (!currentUser.IsInRole(Roles.Admin) && hotel.RealtorId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        var existing = await hotelBreakfastRepository.GetAsync(request.HotelId, request.BreakfastId, ct);
        if (existing is not null)
            return Error.Conflict("This hotel already offers this breakfast option.");

        await hotelBreakfastRepository.AddAsync(new HotelBreakfast
        {
            HotelId = request.HotelId,
            BreakfastId = request.BreakfastId,
            Price = request.Price
        }, ct);

        var created = await hotelBreakfastRepository.GetAsync(request.HotelId, request.BreakfastId, ct);

        return new HotelBreakfastDto
        {
            HotelId = created!.HotelId,
            BreakfastId = created.BreakfastId,
            BreakfastName = created.Breakfast.Name,
            Price = created.Price
        };
    }
}
