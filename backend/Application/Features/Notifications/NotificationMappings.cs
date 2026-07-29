using Application.DTOs;
using Domain.Entities;

namespace Application.Features.Notifications;

internal static class NotificationMappings
{
    internal static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        Type = n.Type,
        Message = n.Message,
        IsRead = n.IsRead,
        CreatedAtUtc = n.CreatedAtUtc
    };
}
