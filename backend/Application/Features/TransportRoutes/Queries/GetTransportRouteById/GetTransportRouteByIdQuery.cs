using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.TransportRoutes.Queries.GetTransportRouteById;

public record GetTransportRouteByIdQuery(long Id) : IRequest<Result<TransportRouteDto>>;
