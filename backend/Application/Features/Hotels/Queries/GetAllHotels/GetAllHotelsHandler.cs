using Application.DTOs;
using Domain.Common;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Hotels.Queries.GetAllHotels;

public class GetAllHotelsHandler(IHotelRepository hotelRepository)
    : IRequestHandler<GetAllHotelsQuery, Result<PagedResult<HotelDto>>>
{
    public async Task<Result<PagedResult<HotelDto>>> Handle(GetAllHotelsQuery request, CancellationToken ct)
    {
        var (items, totalCount) = await hotelRepository.GetFilteredAsync(
            name: request.Name,
            categoryId: request.CategoryId,
            cityName: request.CityName,
            countryName: request.CountryName,
            priceMin: request.PriceMin,
            priceMax: request.PriceMax,
            sortBy: request.SortBy,
            checkIn: request.CheckIn,
            checkOut: request.CheckOut,
            adults: request.Adults,
            children: request.Children,
            categoryIds: request.CategoryIds,
            starRatings: request.StarRatings,
            amenityIds: request.AmenityIds,
            page: request.Page,
            pageSize: request.PageSize,
            ct: ct);

        return new PagedResult<HotelDto>
        {
            Items = items.Select(HotelMappings.MapToDto).ToList().AsReadOnly(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
