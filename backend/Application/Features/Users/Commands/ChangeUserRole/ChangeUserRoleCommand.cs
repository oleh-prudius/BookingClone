using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Users.Commands.ChangeUserRole;

public record ChangeUserRoleCommand(long Id, string Role) : IRequest<Result<UserAdminDto>>;
