using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IHotelBreakfastRepository
{
    Task<IReadOnlyList<HotelBreakfast>> GetByHotelIdAsync(long hotelId, CancellationToken ct = default);
    Task<HotelBreakfast?> GetAsync(long hotelId, long breakfastId, CancellationToken ct = default);
    Task AddAsync(HotelBreakfast entity, CancellationToken ct = default);
}
