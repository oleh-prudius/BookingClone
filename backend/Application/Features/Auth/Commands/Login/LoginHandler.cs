using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities.Identity;
using Domain.Interfaces;
using RefreshTokenEntity = Domain.Entities.Identity.RefreshToken;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Features.Auth.Commands.Login;

public class LoginHandler(
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager,
    ITokenService tokenService,
    IRefreshTokenRepository refreshTokenRepository) : IRequestHandler<LoginCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(LoginCommand request, CancellationToken ct)
    {
        var dto = request.Dto;

        var user = await userManager.FindByEmailAsync(dto.EmailOrUserName)
                   ?? await userManager.FindByNameAsync(dto.EmailOrUserName);

        if (user is null)
            return Error.Unauthorized("Invalid credentials.");

        var check = await signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);
        if (!check.Succeeded)
            return Error.Unauthorized("Invalid credentials.");

        if (!user.EmailConfirmed)
            return Error.Unauthorized("Email not confirmed. Please check your inbox.");

        var roles = await userManager.GetRolesAsync(user);
        var (token, expiresAt) = tokenService.CreateToken(user, roles);
        var refreshTokenValue = tokenService.GenerateRefreshToken();

        await refreshTokenRepository.AddAsync(new RefreshTokenEntity
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(30)
        }, ct);

        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            RefreshToken = refreshTokenValue,
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Photo = user.Photo,
                Roles = roles
            }
        };
    }
}
