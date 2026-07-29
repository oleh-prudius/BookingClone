using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Tickets.Queries.GetMyTickets;

public class GetMyTicketsHandler(ITicketRepository ticketRepository, ICurrentUserService currentUser)
    : IRequestHandler<GetMyTicketsQuery, Result<PagedResult<TicketDto>>>
{
    public async Task<Result<PagedResult<TicketDto>>> Handle(GetMyTicketsQuery request, CancellationToken ct)
    {
        var userId = currentUser.GetUserId()!.Value;
        var (items, totalCount) = await ticketRepository.GetByCustomerIdAsync(userId, request.Page, request.PageSize, ct);

        return new PagedResult<TicketDto>
        {
            Items = items.Select(TicketMappings.MapToDto).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
