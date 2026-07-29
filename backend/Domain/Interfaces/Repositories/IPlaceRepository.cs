using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IPlaceRepository
{
    Task<IReadOnlyList<Place>> GetByCityIdAsync(long cityId, string? category, CancellationToken ct = default);
}
