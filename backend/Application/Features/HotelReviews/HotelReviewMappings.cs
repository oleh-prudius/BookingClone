using Application.DTOs;
using Domain.Entities;

namespace Application.Features.HotelReviews;

internal static class HotelReviewMappings
{
    internal static HotelReviewDto MapToDto(HotelReview e) => new()
    {
        Id = e.Id,
        Description = e.Description,
        Score = e.Score,
        BookingId = e.BookingId,
        AuthorName = e.Booking?.Customer is { } customer ? $"{customer.FirstName} {customer.LastName}" : string.Empty,
        CreatedAtUtc = e.CreatedAtUtc,
        UpdatedAtUtc = e.UpdatedAtUtc
    };
}
