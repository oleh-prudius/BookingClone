using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Chats.Queries.GetChatById;

public class GetChatByIdHandler(IChatRepository repository, ICurrentUserService currentUser)
    : IRequestHandler<GetChatByIdQuery, Result<ChatDto>>
{
    public async Task<Result<ChatDto>> Handle(GetChatByIdQuery request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity is null)
            return Error.NotFound($"Chat with id {request.Id} not found.");

        if (!currentUser.IsInRole(Roles.Admin) && entity.CustomerId != currentUser.GetUserId() && entity.RealtorId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        return ChatMappings.MapToDto(entity);
    }
}
