using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class HotelBreakfastRepository(AppDbContext context) : IHotelBreakfastRepository
{
    public async Task<IReadOnlyList<HotelBreakfast>> GetByHotelIdAsync(long hotelId, CancellationToken ct = default) =>
        (await context.HotelBreakfasts
            .Include(hb => hb.Breakfast)
            .Where(hb => hb.HotelId == hotelId)
            .ToListAsync(ct))
            .AsReadOnly();

    public Task<HotelBreakfast?> GetAsync(long hotelId, long breakfastId, CancellationToken ct = default) =>
        context.HotelBreakfasts
            .Include(hb => hb.Breakfast)
            .FirstOrDefaultAsync(hb => hb.HotelId == hotelId && hb.BreakfastId == breakfastId, ct);

    public async Task AddAsync(HotelBreakfast entity, CancellationToken ct = default)
    {
        context.HotelBreakfasts.Add(entity);
        await context.SaveChangesAsync(ct);
    }
}
