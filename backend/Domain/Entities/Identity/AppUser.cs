using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Domain.Entities.Identity;

public class AppUser : IdentityUser<long>
{
	public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Photo { get; set; } = null!;

    public DateTimeOffset CreatedAtUtc { get; set; }

    public virtual ICollection<AppUserRole> UserRoles { get; set; } = null!;
    public ICollection<Message> Messages { get; set; } = null!;
    public ICollection<RefreshToken> RefreshTokens { get; set; } = null!;
}
