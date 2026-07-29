using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Tickets.Commands.PurchaseTicket;

public record PurchaseTicketCommand(long TransportRouteId, int Seats) : IRequest<Result<TicketDto>>;
