using Application.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Cities.Commands.FindOrCreateCity;

public class FindOrCreateCityHandler(ICountryRepository countryRepository, ICityRepository cityRepository)
    : IRequestHandler<FindOrCreateCityCommand, Result<CityDto>>
{
    public async Task<Result<CityDto>> Handle(FindOrCreateCityCommand request, CancellationToken ct)
    {
        var countryName = request.CountryName.Trim();
        var cityName = request.CityName.Trim();

        var country = await countryRepository.GetByNameAsync(countryName, ct);
        if (country is null)
        {
            country = await countryRepository.AddAsync(new Country
            {
                Name = countryName,
                // No reliable way to look up a flag for a free-typed country name that
                // isn't in the seeded dataset - use a generic placeholder.
                Image = "https://placehold.co/64x48?text=%F0%9F%8C%90"
            }, ct);
        }

        var existingCity = await cityRepository.GetByNameAndCountryIdAsync(cityName, country.Id, ct);
        if (existingCity is not null)
            return CityMappings.MapToDto(existingCity);

        var city = await cityRepository.AddAsync(new City
        {
            Name = cityName,
            Country = country,
            CountryId = country.Id,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Image = $"https://picsum.photos/seed/{Slugify(cityName)}/800/600"
        }, ct);

        return CityMappings.MapToDto(city);
    }

    private static string Slugify(string name) =>
        new string(name.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
}
