using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class BookingRepository(AppDbContext context) : IBookingRepository
{
    private IQueryable<Booking> WithIncludes() => context.Bookings
        .Include(b => b.Customer)
        .Include(b => b.BookingRoomVariants)
            .ThenInclude(brv => brv.RoomVariant)
                .ThenInclude(rv => rv.Room)
                    .ThenInclude(rv => rv.Hotel);

    public async Task<IReadOnlyList<Booking>> GetAllAsync(CancellationToken ct = default)
    {
        return (await WithIncludes().ToListAsync(ct)).AsReadOnly();
    }

    public async Task<IReadOnlyList<Booking>> GetByCustomerIdAsync(long customerId, CancellationToken ct = default)
    {
        return (await WithIncludes()
            .Where(b => b.CustomerId == customerId)
            .ToListAsync(ct))
            .AsReadOnly();
    }

    public async Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var query = WithIncludes();
        var totalCount = await query.CountAsync(ct);
        var items = (await query
            .OrderByDescending(b => b.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .AsReadOnly();
        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPagedByCustomerIdAsync(long customerId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = WithIncludes().Where(b => b.CustomerId == customerId);
        var totalCount = await query.CountAsync(ct);
        var items = (await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct))
            .AsReadOnly();
        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Booking>> GetByHotelIdAsync(long hotelId, CancellationToken ct = default)
    {
        return (await context.BookingRoomVariants
            .Where(brv => brv.RoomVariant.Room.HotelId == hotelId)
            .Select(brv => brv.Booking)
            .Distinct()
            .ToListAsync(ct))
            .AsReadOnly();
    }

    public async Task<Booking?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        return await WithIncludes().FirstOrDefaultAsync(b => b.Id == id, ct);
    }

    public async Task<bool> IsRoomVariantAvailableAsync(long roomVariantId, DateOnly checkIn, DateOnly checkOut, long? excludeBookingId, CancellationToken ct = default)
    {
        var query = context.BookingRoomVariants
            .Where(brv => brv.RoomVariantId == roomVariantId
                && brv.Booking.DateFrom < checkOut
                && brv.Booking.DateTo > checkIn);

        if (excludeBookingId.HasValue)
            query = query.Where(brv => brv.BookingId != excludeBookingId.Value);

        return !await query.AnyAsync(ct);
    }

    public async Task<Booking> AddAsync(Booking booking, CancellationToken ct = default)
    {
        context.Bookings.Add(booking);
        await context.SaveChangesAsync(ct);
        return booking;
    }

    public async Task UpdateAsync(Booking booking, CancellationToken ct = default)
    {
        context.Bookings.Update(booking);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(long id, CancellationToken ct = default)
    {
        var booking = await context.Bookings.FindAsync(new object[] { id }, ct);
        if (booking != null)
        {
            context.Bookings.Remove(booking);
            await context.SaveChangesAsync(ct);
        }
    }
}
