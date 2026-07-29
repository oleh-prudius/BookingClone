using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.HotelBreakfasts.Queries.GetHotelBreakfasts;

public record GetHotelBreakfastsQuery(long HotelId) : IRequest<Result<IReadOnlyList<HotelBreakfastDto>>>;
