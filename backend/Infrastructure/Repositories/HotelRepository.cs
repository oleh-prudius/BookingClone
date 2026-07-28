using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class HotelRepository(AppDbContext context) : IHotelRepository
{
    private IQueryable<Hotel> WithIncludes() => context.Hotels
        .Include(h => h.Address)
        .ThenInclude(a => a.City)
        .ThenInclude(c => c.Country)
        .Include(h => h.HotelCategory)
        .Include(h => h.Photos)
        .Include(h => h.HotelHotelAmenities)
        .ThenInclude(hha => hha.HotelAmenity)
        .Include(h => h.Rooms)
        .ThenInclude(r => r.RoomVariants);

    public async Task<IReadOnlyList<Hotel>> GetAllAsync(CancellationToken ct = default) =>
        (await WithIncludes().AsNoTracking().ToListAsync(ct)).AsReadOnly();

    public async Task<(IReadOnlyList<Hotel> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var query = WithIncludes().AsNoTracking();
        var totalCount = await query.CountAsync(ct);
        var items = (await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct)).AsReadOnly();
        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Hotel> Items, int TotalCount)> GetFilteredAsync(
        string? name,
        long? categoryId,
        string? cityName,
        decimal? priceMin,
        decimal? priceMax,
        string? sortBy,
        DateOnly? checkIn,
        DateOnly? checkOut,
        int? adults,
        int? children,
        IReadOnlyList<long>? categoryIds,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = WithIncludes().AsNoTracking().Where(h => !h.IsArchived);

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(h => h.Name.ToLower().Contains(name.ToLower()));

        if (categoryId.HasValue)
            query = query.Where(h => h.HotelCategoryId == categoryId.Value);

        if (categoryIds is { Count: > 0 })
            query = query.Where(h => categoryIds.Contains(h.HotelCategoryId));

        if (!string.IsNullOrWhiteSpace(cityName))
            query = query.Where(h => h.Address.City.Name.ToLower() == cityName.ToLower());

        if (priceMin.HasValue || priceMax.HasValue)
            query = query.Where(h => h.Rooms
                .SelectMany(r => r.RoomVariants)
                .Any(rv =>
                    (!priceMin.HasValue || rv.Price >= priceMin.Value) &&
                    (!priceMax.HasValue || rv.Price <= priceMax.Value)));

        query = sortBy switch
        {
            "price" => query.OrderBy(h => h.Rooms
                .SelectMany(r => r.RoomVariants)
                .Select(rv => (decimal?)rv.Price)
                .Min()),
            "popular" => query.OrderByDescending(h => h.Rooms
                .SelectMany(r => r.RoomVariants)
                .SelectMany(rv => rv.BookingRoomVariants)
                .Count(brv => brv.Booking.Status != BookingStatus.Cancelled)),
            _ => query.OrderBy(h => h.Name)
        };
        var totalCount = await query.CountAsync(ct);
        var items = (await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct)).AsReadOnly();
        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Hotel>> GetByRealtorIdAsync(long realtorId, CancellationToken ct = default) =>
        (await WithIncludes().AsNoTracking().Where(h => h.RealtorId == realtorId).ToListAsync(ct)).AsReadOnly();

    // No AsNoTracking — entity may be used for update
    public async Task<Hotel?> GetByIdAsync(long id, CancellationToken ct = default) =>
        await WithIncludes().FirstOrDefaultAsync(h => h.Id == id, ct);

    public async Task<Hotel> AddAsync(Hotel hotel, CancellationToken ct = default)
    {
        context.Hotels.Add(hotel);
        await context.SaveChangesAsync(ct);
        return hotel;
    }

    public async Task UpdateAsync(Hotel hotel, CancellationToken ct = default)
    {
        context.Hotels.Update(hotel);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(long id, CancellationToken ct = default)
    {
        var hotel = await context.Hotels.FindAsync(new object[] { id }, ct);
        if (hotel is not null)
        {
            context.Hotels.Remove(hotel);
            await context.SaveChangesAsync(ct);
        }
    }
}
