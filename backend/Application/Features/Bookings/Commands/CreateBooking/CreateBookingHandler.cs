using Application.DTOs;
using Application.Features.Bookings.Events;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(
    IBookingRepository bookingRepository,
    IRoomVariantRepository roomVariantRepository,
    IRoomRepository roomRepository,
    IHotelBreakfastRepository hotelBreakfastRepository,
    IPublisher publisher)
    : IRequestHandler<CreateBookingCommand, Result<BookingDto>>
{
    public async Task<Result<BookingDto>> Handle(CreateBookingCommand request, CancellationToken ct)
    {
        if (request.CheckOut <= request.CheckIn)
            return Error.Validation("CheckOut must be later than CheckIn.");

        var checkIn = DateOnly.FromDateTime(request.CheckIn);
        var checkOut = DateOnly.FromDateTime(request.CheckOut);

        var available = await bookingRepository.IsRoomVariantAvailableAsync(request.RoomVariantId, checkIn, checkOut, null, ct);
        if (!available)
            return Error.Conflict("Room is not available for selected dates.");

        var bookingBreakfasts = new List<BookingBreakfast>();
        var breakfastsTotal = 0m;

        if (request.Breakfasts is { Count: > 0 })
        {
            var roomVariant = await roomVariantRepository.GetByIdAsync(request.RoomVariantId, ct);
            if (roomVariant is null)
                return Error.NotFound($"Room variant with id {request.RoomVariantId} not found.");

            var room = await roomRepository.GetByIdAsync(roomVariant.RoomId, ct);
            if (room is null)
                return Error.NotFound($"Room with id {roomVariant.RoomId} not found.");

            foreach (var selection in request.Breakfasts)
            {
                if (selection.Quantity <= 0)
                    return Error.Validation("Breakfast quantity must be greater than zero.");

                var hotelBreakfast = await hotelBreakfastRepository.GetAsync(room.HotelId, selection.BreakfastId, ct);
                if (hotelBreakfast is null)
                    return Error.Validation($"This hotel does not offer breakfast option {selection.BreakfastId}.");

                bookingBreakfasts.Add(new BookingBreakfast
                {
                    BreakfastId = selection.BreakfastId,
                    Quantity = selection.Quantity,
                    UnitPrice = hotelBreakfast.Price
                });
                breakfastsTotal += hotelBreakfast.Price * selection.Quantity;
            }
        }

        var booking = new Booking
        {
            CustomerId = request.CustomerId,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            DateFrom = checkIn,
            DateTo = checkOut,
            AmountToPay = request.TotalPrice + breakfastsTotal,
            PersonalWishes = request.PersonalWishes,
            EstimatedTimeOfArrivalUtc = new DateTimeOffset(request.CheckIn, TimeSpan.Zero),
            Status = BookingStatus.Pending,
            BookingRoomVariants = new List<BookingRoomVariant>
            {
                new()
                {
                    RoomVariantId = request.RoomVariantId,
                    Quantity = request.Quantity
                }
            },
            BookingBreakfasts = bookingBreakfasts
        };

        var created = await bookingRepository.AddAsync(booking, ct);
        var withIncludes = await bookingRepository.GetByIdAsync(created.Id, ct);
        await publisher.Publish(new BookingCreatedEvent(created.Id), ct);
        return BookingMappings.MapToDto(withIncludes!);
    }
}
