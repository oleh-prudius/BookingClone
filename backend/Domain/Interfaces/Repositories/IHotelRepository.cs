using Domain.Entities;

namespace Domain.Interfaces;

public interface IHotelRepository
{
    Task<IReadOnlyList<Hotel>> GetAllAsync(CancellationToken ct = default);
    Task<(IReadOnlyList<Hotel> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct = default);
    Task<(IReadOnlyList<Hotel> Items, int TotalCount)> GetFilteredAsync(
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
        IReadOnlyList<int>? starRatings,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<IReadOnlyList<Hotel>> GetByRealtorIdAsync(long realtorId, CancellationToken ct = default);
    Task<Hotel?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<Hotel> AddAsync(Hotel hotel, CancellationToken ct = default);
    Task UpdateAsync(Hotel hotel, CancellationToken ct = default);
    Task DeleteAsync(long id, CancellationToken ct = default);
}
