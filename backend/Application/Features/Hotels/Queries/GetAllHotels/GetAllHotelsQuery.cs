using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Hotels.Queries.GetAllHotels;

public record GetAllHotelsQuery(
    int Page,
    int PageSize,
    string? Name = null,
    long? CategoryId = null,
    string? CityName = null,
    string? CountryName = null,
    decimal? PriceMin = null,
    decimal? PriceMax = null,
    string? SortBy = null,
    DateOnly? CheckIn = null,
    DateOnly? CheckOut = null,
    int? Adults = null,
    int? Children = null,
    IReadOnlyList<long>? CategoryIds = null,
    IReadOnlyList<int>? StarRatings = null,
    IReadOnlyList<long>? AmenityIds = null,
    double? MaxDistanceFromCityCenterKm = null
) : IRequest<Result<PagedResult<HotelDto>>>;
