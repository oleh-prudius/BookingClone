using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Hotels.Commands.CreateHotel;

public record CreateHotelCommand(
    string Name,
    string Description,
    long AddressId,
    long HotelCategoryId,
    long RealtorId,
    DateTimeOffset ArrivalTimeUtcFrom,
    DateTimeOffset ArrivalTimeUtcTo,
    DateTimeOffset DepartureTimeUtcFrom,
    DateTimeOffset DepartureTimeUtcTo,
    int StarRating = 3
) : IRequest<Result<HotelDto>>;
