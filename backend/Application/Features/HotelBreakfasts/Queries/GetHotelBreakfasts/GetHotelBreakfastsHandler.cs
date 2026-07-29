using Application.DTOs;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.HotelBreakfasts.Queries.GetHotelBreakfasts;

public class GetHotelBreakfastsHandler(IHotelBreakfastRepository repository)
    : IRequestHandler<GetHotelBreakfastsQuery, Result<IReadOnlyList<HotelBreakfastDto>>>
{
    public async Task<Result<IReadOnlyList<HotelBreakfastDto>>> Handle(GetHotelBreakfastsQuery request, CancellationToken ct)
    {
        var items = await repository.GetByHotelIdAsync(request.HotelId, ct);

        return items.Select(hb => new HotelBreakfastDto
        {
            HotelId = hb.HotelId,
            BreakfastId = hb.BreakfastId,
            BreakfastName = hb.Breakfast.Name,
            Price = hb.Price
        }).ToList();
    }
}
