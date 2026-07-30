using Application.DTOs;
using Domain.Interfaces.Repositories;

namespace Application.Features.Users;

internal static class UserAdminMappings
{
    internal static UserAdminDto MapToDto(UserWithRole u) => new()
    {
        Id = u.User.Id,
        Email = u.User.Email ?? string.Empty,
        FirstName = u.User.FirstName,
        LastName = u.User.LastName,
        Role = u.Role,
        EmailConfirmed = u.User.EmailConfirmed
    };
}
