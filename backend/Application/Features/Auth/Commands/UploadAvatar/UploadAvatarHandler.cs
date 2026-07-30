using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Features.Auth.Commands.UploadAvatar;

public class UploadAvatarHandler(UserManager<AppUser> userManager, IFileStorageService storage)
    : IRequestHandler<UploadAvatarCommand, Result<UserDto>>
{
    public async Task<Result<UserDto>> Handle(UploadAvatarCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null)
            return Error.NotFound("User not found.");

        var previousPhoto = user.Photo;
        var url = await storage.SaveAsync(request.FileStream, request.FileName, request.ContentType, ct);
        user.Photo = url;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Error.Validation(string.Join("; ", result.Errors.Select(e => e.Description)));

        if (!string.IsNullOrEmpty(previousPhoto) && previousPhoto.StartsWith("http"))
            await storage.DeleteAsync(previousPhoto, ct);

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
