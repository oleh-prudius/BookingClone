using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class HotelReviewRepository(AppDbContext context) : Repository<HotelReview>(context), IHotelReviewRepository
{
    public async Task<IReadOnlyList<HotelReview>> GetByHotelIdAsync(long hotelId, CancellationToken ct = default) =>
        (await Context.HotelReviews
            .Include(r => r.Booking)
            .ThenInclude(b => b.Customer)
            .Where(r => r.Booking.BookingRoomVariants
                .Any(brv => brv.RoomVariant.Room.HotelId == hotelId))
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(ct))
            .AsReadOnly();
}
