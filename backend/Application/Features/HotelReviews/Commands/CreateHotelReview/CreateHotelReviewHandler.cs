using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.HotelReviews.Commands.CreateHotelReview;

public class CreateHotelReviewHandler(
    IRepository<HotelReview> repository,
    IBookingRepository bookingRepository,
    ICurrentUserService currentUser)
    : IRequestHandler<CreateHotelReviewCommand, Result<HotelReviewDto>>
{
    public async Task<Result<HotelReviewDto>> Handle(CreateHotelReviewCommand request, CancellationToken ct)
    {
        var booking = await bookingRepository.GetByIdAsync(request.BookingId);
        if (booking is null)
            return Error.NotFound($"Booking with id {request.BookingId} not found.");

        if (booking.CustomerId != currentUser.GetUserId())
            return Error.Forbidden("You can only review your own bookings.");

        var entity = new HotelReview
        {
            Description = request.Description,
            Score = request.Score,
            BookingId = request.BookingId,
            CreatedAtUtc = DateTime.UtcNow
        };
        var created = await repository.AddAsync(entity, ct);
        created.Booking = booking;
        return HotelReviewMappings.MapToDto(created);
    }
}
