using System.Security.Claims;
using Application.Features.Messages.Commands.CreateMessage;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

[Authorize]
public class ChatHub(IMediator mediator, IRepository<Chat> chatRepository) : Hub
{
    public async Task JoinChat(long chatId)
    {
        var chat = await RequireAccessAsync(chatId);
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(chat.Id));
    }

    public async Task SendMessage(long chatId, string text)
    {
        var chat = await RequireAccessAsync(chatId);

        var result = await mediator.Send(new CreateMessageCommand(text, chat.Id, GetUserId()));
        if (!result.IsSuccess)
            throw new HubException(result.Error.Message);

        await Clients.Group(GroupName(chat.Id)).SendAsync("ReceiveMessage", result.Value);
    }

    private async Task<Chat> RequireAccessAsync(long chatId)
    {
        var chat = await chatRepository.GetByIdAsync(chatId);
        if (chat is null)
            throw new HubException("Chat not found.");

        var userId = GetUserId();
        if (chat.CustomerId != userId && chat.RealtorId != userId)
            throw new HubException("You do not have access to this chat.");

        return chat;
    }

    private long GetUserId() => long.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static string GroupName(long chatId) => $"chat-{chatId}";
}
