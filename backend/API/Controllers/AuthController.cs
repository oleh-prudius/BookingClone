using System.Security.Claims;
using API.Common;
using Application.DTOs.Auth;
using Application.Features.Auth.Commands.ConfirmEmail;
using Application.Features.Auth.Commands.ForgotPassword;
using Application.Features.Auth.Commands.Login;
using Application.Features.Auth.Commands.RefreshToken;
using Application.Features.Auth.Commands.Register;
using Application.Features.Auth.Commands.ResendConfirmationEmail;
using Application.Features.Auth.Commands.ResetPassword;
using Application.Features.Auth.Commands.RevokeToken;
using Application.Features.Auth.Commands.UpdateProfile;
using Application.Features.Auth.Queries.GetCurrentUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken ct)
        => (await mediator.Send(new RegisterCommand(dto), ct)).ToActionResult();

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
        => (await mediator.Send(new LoginCommand(dto), ct)).ToActionResult();

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
        => (await mediator.Send(new RefreshTokenCommand(request.Token), ct)).ToActionResult();

    [HttpPost("revoke")]
    [Authorize]
    public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequest request, CancellationToken ct)
        => (await mediator.Send(new RevokeTokenCommand(request.Token), ct)).ToNoContentResult();

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(idClaim, out var userId))
            return Unauthorized();

        return (await mediator.Send(new GetCurrentUserQuery(userId), ct)).ToActionResult();
    }

    [HttpPatch("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateDto dto, CancellationToken ct)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!long.TryParse(idClaim, out var userId))
            return Unauthorized();

        return (await mediator.Send(new UpdateProfileCommand(userId, dto), ct)).ToActionResult();
    }

    [HttpPost("confirm-email")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request, CancellationToken ct)
        => (await mediator.Send(new ConfirmEmailCommand(request.UserId, request.Token), ct)).ToActionResult();

    [HttpPost("resend-confirmation")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResendConfirmation([FromBody] EmailRequest request, CancellationToken ct)
        => (await mediator.Send(new ResendConfirmationEmailCommand(request.Email), ct)).ToActionResult();

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] EmailRequest request, CancellationToken ct)
        => (await mediator.Send(new ForgotPasswordCommand(request.Email), ct)).ToActionResult();

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
        => (await mediator.Send(new ResetPasswordCommand(request.Email, request.Token, request.NewPassword), ct)).ToActionResult();
}

public record RefreshTokenRequest(string Token);
public record ConfirmEmailRequest(long UserId, string Token);
public record EmailRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);
