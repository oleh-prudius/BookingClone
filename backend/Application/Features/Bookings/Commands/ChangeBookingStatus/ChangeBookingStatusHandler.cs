using Application.DTOs;
using Application.Features.Bookings.Events;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Bookings.Commands.ChangeBookingStatus;

public class ChangeBookingStatusHandler(
    IBookingRepository bookingRepository,
    INotificationRepository notificationRepository,
    ICurrentUserService currentUser,
    IPublisher publisher)
    : IRequestHandler<ChangeBookingStatusCommand, Result<BookingDto>>
{
    public async Task<Result<BookingDto>> Handle(ChangeBookingStatusCommand request, CancellationToken ct)
    {
        var booking = await bookingRepository.GetByIdAsync(request.BookingId);
        if (booking is null)
            return Error.NotFound($"Booking with id {request.BookingId} not found.");

        var isAdminOrRealtor = currentUser.IsInRole(Roles.Admin) || currentUser.IsInRole(Roles.Realtor);
        var isOwner = booking.CustomerId == currentUser.GetUserId();

        if (!isAdminOrRealtor && !isOwner)
            return Error.Forbidden("You do not have access to this resource.");

        var (allowed, reason) = IsTransitionAllowed(booking.Status, request.NewStatus, isAdminOrRealtor, isOwner);
        if (!allowed)
            return Error.Validation(reason);

        booking.Status = request.NewStatus;

        if (request.NewStatus == BookingStatus.Cancelled)
            booking.CancelledAtUtc = DateTimeOffset.UtcNow;
        else if (request.NewStatus == BookingStatus.Confirmed)
            booking.ConfirmedAtUtc = DateTimeOffset.UtcNow;

        await bookingRepository.UpdateAsync(booking);

        if (request.NewStatus == BookingStatus.Cancelled)
        {
            await publisher.Publish(new BookingCancelledEvent(booking.Id), ct);
        }
        else if (request.NewStatus == BookingStatus.Confirmed)
        {
            await notificationRepository.AddAsync(new Notification
            {
                UserId = booking.CustomerId,
                Type = NotificationTypes.BookingConfirmed,
                Message = $"Your booking #{booking.Id} has been confirmed.",
                CreatedAtUtc = DateTimeOffset.UtcNow
            }, ct);
            await publisher.Publish(new BookingConfirmedEvent(booking.Id), ct);
        }

        return BookingMappings.MapToDto(booking);
    }

    private static (bool Allowed, string Reason) IsTransitionAllowed(
        BookingStatus current, BookingStatus next, bool isAdminOrRealtor, bool isOwner)
    {
        return (current, next) switch
        {
            // Admin/Realtor: Pending → Confirmed
            (BookingStatus.Pending, BookingStatus.Confirmed) when isAdminOrRealtor => (true, string.Empty),

            // Anyone with access: Pending → Cancelled
            (BookingStatus.Pending, BookingStatus.Cancelled) => (true, string.Empty),

            // Admin/Realtor: Confirmed → Cancelled or Completed
            (BookingStatus.Confirmed, BookingStatus.Cancelled) when isAdminOrRealtor => (true, string.Empty),
            (BookingStatus.Confirmed, BookingStatus.Completed) when isAdminOrRealtor => (true, string.Empty),

            // Customer can cancel their confirmed booking
            (BookingStatus.Confirmed, BookingStatus.Cancelled) when isOwner => (true, string.Empty),

            (BookingStatus.Cancelled, _) => (false, "Cancelled booking cannot be changed."),
            (BookingStatus.Completed, _) => (false, "Completed booking cannot be changed."),

            _ => (false, $"Transition from {current} to {next} is not allowed.")
        };
    }
}
