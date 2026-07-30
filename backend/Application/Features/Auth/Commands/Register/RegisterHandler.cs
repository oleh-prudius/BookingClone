using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities.Identity;
using Domain.Interfaces;
using RefreshTokenEntity = Domain.Entities.Identity.RefreshToken;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Application.Features.Auth.Commands.Register;

public class RegisterHandler(
    UserManager<AppUser> userManager,
    ITokenService tokenService,
    IRefreshTokenRepository refreshTokenRepository,
    IEmailService emailService,
    IConfiguration configuration) : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken ct)
    {
        var dto = request.dto;

        if (await userManager.FindByEmailAsync(dto.Email) is not null)
            return Error.Conflict("Email is already taken.");

        if (await userManager.FindByNameAsync(dto.UserName) is not null)
            return Error.Conflict("Username is already taken.");

        var createdAtUtc = DateTimeOffset.UtcNow;
        AppUser user = dto.AccountType == Roles.Realtor
            ? new Realtor
            {
                Email = dto.Email,
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Photo = "default.jpg",
                CreatedAtUtc = createdAtUtc
            }
            : new Customer
            {
                Email = dto.Email,
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Photo = "default.jpg",
                CreatedAtUtc = createdAtUtc
            };

        var createResult = await userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
            return Error.Validation(string.Join("; ", createResult.Errors.Select(e => e.Description)));

        var roleResult = await userManager.AddToRoleAsync(user, dto.AccountType);
        if (!roleResult.Succeeded)
            return Error.Unexpected(string.Join("; ", roleResult.Errors.Select(e => e.Description)));

        var confirmationToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var frontendUrl = configuration["Frontend:Url"] ?? "http://localhost:5173";
        var link = $"{frontendUrl}/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(confirmationToken)}";

        await emailService.SendAsync(
            dto.Email,
            "Confirm your email – BookingClone",
            $"""
             <p>Hi {user.FirstName},</p>
             <p>Welcome to BookingClone! Please <a href="{link}">confirm your email address</a> to keep access to your account.</p>
             <p>If you did not register, you can ignore this email.</p>
             """,
            ct);

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
