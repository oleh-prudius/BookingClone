using Domain.Entities;
using Domain.Enums;

namespace Domain.Interfaces.Repositories;

public interface ITransportRouteRepository
{
    Task<(IReadOnlyList<TransportRoute> Items, int TotalCount)> SearchAsync(
        long? fromCityId,
        long? toCityId,
        DateOnly? date,
        TransportType? type,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<TransportRoute?> GetByIdAsync(long id, CancellationToken ct = default);

    Task<int> GetBookedSeatsAsync(long routeId, CancellationToken ct = default);
}
