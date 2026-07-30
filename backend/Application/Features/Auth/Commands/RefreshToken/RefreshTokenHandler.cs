using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities.Identity;
using Domain.Interfaces;
using RefreshTokenEntity = Domain.Entities.Identity.RefreshToken;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenHandler(
    IRefreshTokenRepository refreshTokenRepository,
    UserManager<AppUser> userManager,
    ITokenService tokenService) : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var existing = await refreshTokenRepository.GetByTokenAsync(request.Token, ct);

        if (existing is null || existing.IsRevoked || existing.ExpiresAt < DateTimeOffset.UtcNow)
            return Error.Unauthorized("Invalid or expired refresh token.");

        await refreshTokenRepository.RevokeAsync(existing.Id, ct);

        var user = existing.User;
        var roles = await userManager.GetRolesAsync(user);
        var (token, expiresAt) = tokenService.CreateToken(user, roles);
        var newRefreshTokenValue = tokenService.GenerateRefreshToken();

        await refreshTokenRepository.AddAsync(new RefreshTokenEntity
        {
            Token = newRefreshTokenValue,
            UserId = user.Id,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(30)
        }, ct);

        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            RefreshToken = newRefreshTokenValue,
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
