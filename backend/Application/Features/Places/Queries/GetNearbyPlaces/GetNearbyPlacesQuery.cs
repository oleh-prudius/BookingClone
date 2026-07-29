using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Places.Queries.GetNearbyPlaces;

public record GetNearbyPlacesQuery(long? HotelId, long? CityId, string? Category) : IRequest<Result<IReadOnlyList<PlaceDto>>>;
