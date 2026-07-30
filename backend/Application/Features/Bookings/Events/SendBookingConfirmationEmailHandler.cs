using Application.Interfaces;
using Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Bookings.Events;

public class SendBookingConfirmationEmailHandler(
    IBookingRepository bookingRepository,
    IEmailService emailService,
    ILogger<SendBookingConfirmationEmailHandler> logger)
    : INotificationHandler<BookingConfirmedEvent>
{
    public async Task Handle(BookingConfirmedEvent notification, CancellationToken ct)
    {
        try
        {
            var booking = await bookingRepository.GetByIdAsync(notification.BookingId, ct);
            if (booking is null)
            {
                logger.LogWarning("Booking {BookingId} not found for confirmation email.", notification.BookingId);
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
                "Your booking is confirmed – BookingClone",
                $"""
                 <p>Hi {booking.Customer.FirstName},</p>
                 <p>Your booking has been confirmed. Here are the details:</p>
                 <p>Booking reference: <strong>{reference}</strong></p>
                 <p>Hotel: {hotelName}</p>
                 <p>Check-in: {booking.DateFrom:dd.MM.yyyy}</p>
                 <p>Check-out: {booking.DateTo:dd.MM.yyyy}</p>
                 <p>Guests: {totalGuests}</p>
                 <p>Total to pay: {booking.AmountToPay:C}</p>
                 """,
                ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send confirmation email for booking {BookingId}.", notification.BookingId);
        }
    }
}