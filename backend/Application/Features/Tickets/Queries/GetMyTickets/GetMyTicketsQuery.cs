using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Tickets.Queries.GetMyTickets;

public record GetMyTicketsQuery(int Page = 1, int PageSize = 20) : IRequest<Result<PagedResult<TicketDto>>>;
