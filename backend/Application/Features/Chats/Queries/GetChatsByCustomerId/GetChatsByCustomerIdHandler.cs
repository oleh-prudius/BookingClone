using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Chats.Queries.GetChatsByCustomerId;

public class GetChatsByCustomerIdHandler(IChatRepository repository, ICurrentUserService currentUser)
    : IRequestHandler<GetChatsByCustomerIdQuery, Result<IReadOnlyList<ChatDto>>>
{
    public async Task<Result<IReadOnlyList<ChatDto>>> Handle(GetChatsByCustomerIdQuery request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Admin) && request.CustomerId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        var chats = await repository.GetByCustomerIdAsync(request.CustomerId, ct);
        return chats.Select(ChatMappings.MapToDto).ToList().AsReadOnly();
    }
}
