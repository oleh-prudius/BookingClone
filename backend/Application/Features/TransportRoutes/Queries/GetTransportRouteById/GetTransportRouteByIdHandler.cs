using Application.DTOs;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.TransportRoutes.Queries.GetTransportRouteById;

public class GetTransportRouteByIdHandler(ITransportRouteRepository routeRepository)
    : IRequestHandler<GetTransportRouteByIdQuery, Result<TransportRouteDto>>
{
    public async Task<Result<TransportRouteDto>> Handle(GetTransportRouteByIdQuery request, CancellationToken ct)
    {
        var route = await routeRepository.GetByIdAsync(request.Id, ct);
        if (route is null)
            return Error.NotFound($"Transport route with id {request.Id} not found.");

        var bookedSeats = await routeRepository.GetBookedSeatsAsync(route.Id, ct);
        return TransportRouteMappings.MapToDto(route, bookedSeats);
    }
}
