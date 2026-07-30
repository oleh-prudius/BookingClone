using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.Cities.Commands.FindOrCreateCity;

public record FindOrCreateCityCommand(
    string CountryName,
    string CityName,
    double Latitude,
    double Longitude
) : IRequest<Result<CityDto>>;
