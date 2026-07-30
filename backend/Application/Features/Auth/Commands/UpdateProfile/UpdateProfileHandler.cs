using Application.DTOs.Auth;
using Domain.Common;
using Domain.Entities.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Features.Auth.Commands.UpdateProfile;

public class UpdateProfileHandler(UserManager<AppUser> userManager)
    : IRequestHandler<UpdateProfileCommand, Result<UserDto>>
{
    public async Task<Result<UserDto>> Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null)
            return Error.NotFound("User not found.");

        var dto = request.Dto;

        if (dto.Email != user.Email)
        {
            if (await userManager.FindByEmailAsync(dto.Email) is not null)
                return Error.Conflict("Email is already taken.");
            user.Email = dto.Email;
        }

        if (dto.UserName != user.UserName)
        {
            if (await userManager.FindByNameAsync(dto.UserName) is not null)
                return Error.Conflict("Username is already taken.");
            user.UserName = dto.UserName;
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Error.Validation(string.Join("; ", result.Errors.Select(e => e.Description)));

        var roles = await userManager.GetRolesAsync(user);
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Photo = user.Photo,
            Roles = roles
        };
    }
}
