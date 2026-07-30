using MediatR;

namespace Application.Features.Bookings.Events;

public record BookingCreatedEvent(long BookingId) : INotification;