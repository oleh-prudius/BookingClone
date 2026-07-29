using Domain.Constants;
using FluentValidation;

namespace Application.Features.Auth.Commands.Register;

public class RegisterValidator : AbstractValidator<RegisterCommand>
{
    private static readonly string[] AllowedAccountTypes = [Roles.Customer, Roles.Realtor];

    public RegisterValidator()
    {
        RuleFor(x => x.dto.Email).NotEmpty().WithName("Email").EmailAddress();
        RuleFor(x => x.dto.UserName).NotEmpty().WithName("UserName").MinimumLength(3).MaximumLength(64);
        RuleFor(x => x.dto.Password).NotEmpty().WithName("Password").MinimumLength(8);
        RuleFor(x => x.dto.FirstName).NotEmpty().WithName("First Name").MaximumLength(100);
        RuleFor(x => x.dto.LastName).NotEmpty().WithName("Last Name").MaximumLength(100);
        RuleFor(x => x.dto.AccountType)
            .Must(t => AllowedAccountTypes.Contains(t))
            .WithMessage($"AccountType must be one of: {string.Join(", ", AllowedAccountTypes)}.");
    }
}
