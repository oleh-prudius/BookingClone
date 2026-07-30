using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.FavoriteHotels.Queries.GetFavoriteHotelsByCustomerId;

public class GetFavoriteHotelsByCustomerIdHandler(IFavoriteHotelRepository repository, ICurrentUserService currentUser)
    : IRequestHandler<GetFavoriteHotelsByCustomerIdQuery, Result<IReadOnlyList<FavoriteHotelDto>>>
{
    public async Task<Result<IReadOnlyList<FavoriteHotelDto>>> Handle(GetFavoriteHotelsByCustomerIdQuery request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Admin) && request.CustomerId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        var items = await repository.GetByCustomerIdAsync(request.CustomerId, ct);
        return items.Select(f => new FavoriteHotelDto { HotelId = f.HotelId, CustomerId = f.CustomerId })
                    .ToList()
                    .AsReadOnly();
    }
}
