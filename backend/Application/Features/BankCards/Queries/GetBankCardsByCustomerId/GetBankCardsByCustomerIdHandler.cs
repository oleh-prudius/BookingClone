using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.BankCards.Queries.GetBankCardsByCustomerId;

public class GetBankCardsByCustomerIdHandler(IBankCardRepository repository, ICurrentUserService currentUser)
    : IRequestHandler<GetBankCardsByCustomerIdQuery, Result<IReadOnlyList<BankCardDto>>>
{
    public async Task<Result<IReadOnlyList<BankCardDto>>> Handle(GetBankCardsByCustomerIdQuery request, CancellationToken ct)
    {
        if (request.CustomerId != currentUser.GetUserId())
            return Error.Forbidden("You do not have access to this resource.");

        var cards = await repository.GetByCustomerIdAsync(request.CustomerId, ct);
        return cards.Select(BankCardMappings.MapToDto).ToList().AsReadOnly();
    }
}
