using Application.DTOs;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.TransportRoutes.Queries.SearchTransportRoutes;

public class SearchTransportRoutesHandler(ITransportRouteRepository routeRepository)
    : IRequestHandler<SearchTransportRoutesQuery, Result<PagedResult<TransportRouteDto>>>
{
    public async Task<Result<PagedResult<TransportRouteDto>>> Handle(SearchTransportRoutesQuery request, CancellationToken ct)
    {
        var (items, totalCount) = await routeRepository.SearchAsync(
            request.FromCityId, request.ToCityId, request.Date, request.Type, request.Page, request.PageSize, ct);

        var dtos = new List<TransportRouteDto>();
        foreach (var route in items)
        {
            var bookedSeats = await routeRepository.GetBookedSeatsAsync(route.Id, ct);
            dtos.Add(TransportRouteMappings.MapToDto(route, bookedSeats));
        }

        return new PagedResult<TransportRouteDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
