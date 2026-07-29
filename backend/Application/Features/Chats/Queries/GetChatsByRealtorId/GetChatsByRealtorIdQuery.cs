using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Chats.Queries.GetChatsByRealtorId;

public record GetChatsByRealtorIdQuery(long RealtorId) : IRequest<Result<IReadOnlyList<ChatDto>>>;
