using Application.DTOs;
using Domain.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.TransportRoutes.Queries.SearchTransportRoutes;

public record SearchTransportRoutesQuery(
    long? FromCityId,
    long? ToCityId,
    DateOnly? Date,
    TransportType? Type,
    int Page = 1,
    int PageSize = 20
) : IRequest<Result<PagedResult<TransportRouteDto>>>;
