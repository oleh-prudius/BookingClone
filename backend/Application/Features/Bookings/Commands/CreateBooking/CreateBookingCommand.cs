using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Bookings.Commands.CreateBooking;

public record CreateBookingCommand(
    long CustomerId,
    long RoomVariantId,
    int Quantity,
    DateTime CheckIn,
    DateTime CheckOut,
    decimal TotalPrice,
    string? PersonalWishes,
    IReadOnlyList<BreakfastSelectionDto>? Breakfasts = null
) : IRequest<Result<BookingDto>>;
