using Application.DTOs;
using Domain.Common;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Messages.Commands.CreateMessage;

public class CreateMessageHandler(IRepository<Message> repository, IChatRepository chatRepository, INotificationRepository notificationRepository)
    : IRequestHandler<CreateMessageCommand, Result<MessageDto>>
{
    public async Task<Result<MessageDto>> Handle(CreateMessageCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return Error.Validation("Message text is required.");

        var entity = new Message
        {
            Text = request.Text,
            ChatId = request.ChatId,
            AuthorId = request.AuthorId,
            CreatedAtUtc = DateTime.UtcNow
        };
        var created = await repository.AddAsync(entity, ct);

        var chat = await chatRepository.GetByIdAsync(request.ChatId, ct);
        if (chat is not null)
        {
            var recipientId = chat.CustomerId == request.AuthorId ? chat.RealtorId : chat.CustomerId;
            await notificationRepository.AddAsync(new Notification
            {
                UserId = recipientId,
                Type = NotificationTypes.MessageReceived,
                Message = "You have a new message.",
                CreatedAtUtc = DateTimeOffset.UtcNow
            }, ct);
        }

        return MessageMappings.MapToDto(created);
    }
}
