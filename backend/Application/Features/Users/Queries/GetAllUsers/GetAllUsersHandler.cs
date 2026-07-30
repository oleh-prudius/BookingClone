using Application.DTOs;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Users.Queries.GetAllUsers;

public class GetAllUsersHandler(IUserAdminRepository userAdminRepository)
    : IRequestHandler<GetAllUsersQuery, Result<PagedResult<UserAdminDto>>>
{
    public async Task<Result<PagedResult<UserAdminDto>>> Handle(GetAllUsersQuery request, CancellationToken ct)
    {
        var (items, totalCount) = await userAdminRepository.GetFilteredAsync(
            request.Search, request.Role, request.Page, request.PageSize, ct);

        return new PagedResult<UserAdminDto>
        {
            Items = items.Select(UserAdminMappings.MapToDto).ToList().AsReadOnly(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
