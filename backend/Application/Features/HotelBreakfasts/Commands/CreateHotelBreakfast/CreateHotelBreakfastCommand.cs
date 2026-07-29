using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.HotelBreakfasts.Commands.CreateHotelBreakfast;

public record CreateHotelBreakfastCommand(long HotelId, long BreakfastId, decimal Price) : IRequest<Result<HotelBreakfastDto>>;
