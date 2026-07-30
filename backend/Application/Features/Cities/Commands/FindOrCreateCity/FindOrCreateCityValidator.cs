using FluentValidation;

namespace Application.Features.Cities.Commands.FindOrCreateCity;

public class FindOrCreateCityValidator : AbstractValidator<FindOrCreateCityCommand>
{
    public FindOrCreateCityValidator()
    {
        RuleFor(x => x.CountryName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CityName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180);
    }
}
