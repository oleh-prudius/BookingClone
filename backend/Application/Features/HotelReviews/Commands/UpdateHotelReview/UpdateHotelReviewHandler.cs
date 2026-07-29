using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.HotelReviews.Commands.UpdateHotelReview;

public class UpdateHotelReviewHandler(
    IRepository<HotelReview> repository,
    IBookingRepository bookingRepository,
    ICurrentUserService currentUser)
    : IRequestHandler<UpdateHotelReviewCommand, Result<HotelReviewDto>>
{
    public async Task<Result<HotelReviewDto>> Handle(UpdateHotelReviewCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity is null)
            return Error.NotFound($"Hotel review with id {request.Id} not found.");

        var booking = await bookingRepository.GetByIdAsync(entity.BookingId);
        if (booking is null || booking.CustomerId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        entity.Description = request.Description;
        entity.Score = request.Score;
        entity.UpdatedAtUtc = DateTime.UtcNow;
        await repository.UpdateAsync(entity, ct);
        entity.Booking = booking;
        return HotelReviewMappings.MapToDto(entity);
    }
}
