using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Hotels.Commands.UpdateHotel;

public record UpdateHotelCommand(
    int Id,
    string Name,
    string Description,
    long AddressId,
    long HotelCategoryId,
    DateTimeOffset ArrivalTimeUtcFrom,
    DateTimeOffset ArrivalTimeUtcTo,
    DateTimeOffset DepartureTimeUtcFrom,
    DateTimeOffset DepartureTimeUtcTo,
    int StarRating = 3
) : IRequest<Result<HotelDto>>;
