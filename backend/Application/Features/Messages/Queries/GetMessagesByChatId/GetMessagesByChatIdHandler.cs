using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Messages.Queries.GetMessagesByChatId;

public class GetMessagesByChatIdHandler(IMessageRepository repository, IRepository<Chat> chatRepository, ICurrentUserService currentUser)
    : IRequestHandler<GetMessagesByChatIdQuery, Result<IReadOnlyList<MessageDto>>>
{
    public async Task<Result<IReadOnlyList<MessageDto>>> Handle(GetMessagesByChatIdQuery request, CancellationToken ct)
    {
        var chat = await chatRepository.GetByIdAsync(request.ChatId, ct);
        if (chat is null)
            return Error.NotFound($"Chat with id {request.ChatId} not found.");

        if (!currentUser.IsInRole(Roles.Admin) && chat.CustomerId != currentUser.GetUserId() && chat.RealtorId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        var messages = await repository.GetByChatIdAsync(request.ChatId, ct);
        return messages.Select(MessageMappings.MapToDto).ToList().AsReadOnly();
    }
}
