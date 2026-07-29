using Application.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Chats.Commands.CreateChat;

public class CreateChatHandler(IChatRepository repository)
    : IRequestHandler<CreateChatCommand, Result<ChatDto>>
{
    public async Task<Result<ChatDto>> Handle(CreateChatCommand request, CancellationToken ct)
    {
        var entity = new Chat { CustomerId = request.CustomerId, RealtorId = request.RealtorId };
        var created = await repository.AddAsync(entity, ct);
        var withIncludes = await repository.GetByIdAsync(created.Id, ct);
        return ChatMappings.MapToDto(withIncludes!);
    }
}
