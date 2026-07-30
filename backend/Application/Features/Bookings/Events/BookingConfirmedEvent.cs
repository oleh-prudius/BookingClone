using MediatR;

namespace Application.Features.Bookings.Events;

public record BookingConfirmedEvent(long BookingId) : INotification;