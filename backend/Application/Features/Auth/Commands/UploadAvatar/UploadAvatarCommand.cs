using Application.DTOs.Auth;
using Domain.Common;
using MediatR;

namespace Application.Features.Auth.Commands.UploadAvatar;

public record UploadAvatarCommand(
    long UserId,
    Stream FileStream,
    string FileName,
    string ContentType
) : IRequest<Result<UserDto>>;
