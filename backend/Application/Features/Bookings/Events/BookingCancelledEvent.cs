using MediatR;

namespace Application.Features.Bookings.Events;

public record BookingCancelledEvent(long BookingId) : INotification;