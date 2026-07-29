using Application.DTOs;
using Domain.Entities;

namespace Application.Features.Chats;

internal static class ChatMappings
{
    internal static ChatDto MapToDto(Chat e) => new()
    {
        Id = e.Id,
        CustomerId = e.CustomerId,
        CustomerName = e.Customer is not null ? $"{e.Customer.FirstName} {e.Customer.LastName}" : string.Empty,
        RealtorId = e.RealtorId,
        RealtorName = e.Realtor is not null ? $"{e.Realtor.FirstName} {e.Realtor.LastName}" : string.Empty
    };
}
