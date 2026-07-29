using Application.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Bookings.Commands.CreateBooking;

public class CreateBookingHandler(IBookingRepository bookingRepository)
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

        var booking = new Booking
        {
            CustomerId = request.CustomerId,
            DateFrom = checkIn,
            DateTo = checkOut,
            AmountToPay = request.TotalPrice,
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
            }
        };

        var created = await bookingRepository.AddAsync(booking, ct);
        var withIncludes = await bookingRepository.GetByIdAsync(created.Id, ct);
        return BookingMappings.MapToDto(withIncludes!);
    }
}
