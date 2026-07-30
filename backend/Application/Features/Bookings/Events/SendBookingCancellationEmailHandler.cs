using Application.Interfaces;
using Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Bookings.Events;

public class SendBookingCancellationEmailHandler(
    IBookingRepository bookingRepository,
    IEmailService emailService,
    ILogger<SendBookingCancellationEmailHandler> logger)
    : INotificationHandler<BookingCancelledEvent>
{
    public async Task Handle(BookingCancelledEvent notification, CancellationToken ct)
    {
        try
        {
            var booking = await bookingRepository.GetByIdAsync(notification.BookingId, ct);
            if (booking is null)
            {
                logger.LogWarning("Booking {BookingId} not found for cancellation email.", notification.BookingId);
                return;
            }

            var email = booking.Customer.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                logger.LogWarning("Customer {CustomerId} has no email for booking {BookingId}.", booking.CustomerId, booking.Id);
                return;
            }

            var firstVariant = booking.BookingRoomVariants.First();
            var hotelName = firstVariant.RoomVariant.Room.Hotel.Name;
            var totalGuests = booking.BookingRoomVariants.Sum(brv => brv.Quantity);
            var reference = $"BK-{booking.Id:D6}";

            await emailService.SendAsync(
                email,
                "Your booking has been cancelled – BookingClone",
                $"""
                 <p>Hi {booking.Customer.FirstName},</p>
                 <p>Your booking has been cancelled. Here are the details:</p>
                 <p>Booking reference: <strong>{reference}</strong></p>
                 <p>Hotel: {hotelName}</p>
                 <p>Check-in: {booking.DateFrom:dd.MM.yyyy}</p>
                 <p>Check-out: {booking.DateTo:dd.MM.yyyy}</p>
                 <p>Guests: {totalGuests}</p>
                 <p>If you have any questions, please contact our support team.</p>
                 """,
                ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send cancellation email for booking {BookingId}.", notification.BookingId);
        }
    }
}