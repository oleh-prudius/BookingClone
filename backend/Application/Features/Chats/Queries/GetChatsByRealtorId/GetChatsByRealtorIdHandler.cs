using Application.DTOs;
using Application.Features.Chats;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Chats.Queries.GetChatsByRealtorId;

public class GetChatsByRealtorIdHandler(IChatRepository repository, ICurrentUserService currentUser)
    : IRequestHandler<GetChatsByRealtorIdQuery, Result<IReadOnlyList<ChatDto>>>
{
    public async Task<Result<IReadOnlyList<ChatDto>>> Handle(GetChatsByRealtorIdQuery request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Admin) && request.RealtorId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        var chats = await repository.GetByRealtorIdAsync(request.RealtorId, ct);
        return chats.Select(ChatMappings.MapToDto).ToList().AsReadOnly();
    }
}
