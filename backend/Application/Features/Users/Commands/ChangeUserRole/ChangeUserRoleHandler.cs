using Application.DTOs;
using Domain.Common;
using Domain.Entities.Identity;
using Domain.Interfaces.Repositories;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Features.Users.Commands.ChangeUserRole;

public class ChangeUserRoleHandler(UserManager<AppUser> userManager, IUserAdminRepository userAdminRepository)
    : IRequestHandler<ChangeUserRoleCommand, Result<UserAdminDto>>
{
    public async Task<Result<UserAdminDto>> Handle(ChangeUserRoleCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(request.Id.ToString());
        if (user is null)
            return Error.NotFound($"User with id {request.Id} not found.");

        var currentRoles = await userManager.GetRolesAsync(user);
        if (currentRoles.Count > 0)
            await userManager.RemoveFromRolesAsync(user, currentRoles);

        await userManager.AddToRoleAsync(user, request.Role);

        var updated = await userAdminRepository.GetByIdAsync(request.Id, ct);
        return UserAdminMappings.MapToDto(updated!);
    }
}
