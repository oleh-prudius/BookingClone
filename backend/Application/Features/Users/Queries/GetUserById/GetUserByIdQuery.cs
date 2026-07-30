using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Users.Queries.GetUserById;

public record GetUserByIdQuery(long Id) : IRequest<Result<UserAdminDto>>;
