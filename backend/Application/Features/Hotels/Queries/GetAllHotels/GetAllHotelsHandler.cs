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
            request.Name, 
            request.CategoryId, 
            request.CityName, 
            request.PriceMin, 
            request.PriceMax, 
            request.SortBy, request.CheckIn, 
            request.CheckOut, request.Adults, 
            request.Children, request.Page, 
            request.PageSize, ct);

        return new PagedResult<HotelDto>
        {
            Items = items.Select(HotelMappings.MapToDto).ToList().AsReadOnly(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
