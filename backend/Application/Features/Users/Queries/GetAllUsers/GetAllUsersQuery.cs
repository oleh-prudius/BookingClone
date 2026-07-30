using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Users.Queries.GetAllUsers;

public record GetAllUsersQuery(
    int Page,
    int PageSize,
    string? Search = null,
    string? Role = null
) : IRequest<Result<PagedResult<UserAdminDto>>>;
