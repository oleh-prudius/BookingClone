using Application.DTOs;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Users.Queries.GetUserById;

public class GetUserByIdHandler(IUserAdminRepository userAdminRepository)
    : IRequestHandler<GetUserByIdQuery, Result<UserAdminDto>>
{
    public async Task<Result<UserAdminDto>> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await userAdminRepository.GetByIdAsync(request.Id, ct);
        if (user is null)
            return Error.NotFound($"User with id {request.Id} not found.");

        return UserAdminMappings.MapToDto(user);
    }
}
