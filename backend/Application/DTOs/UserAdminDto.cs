namespace Application.DTOs;

public class UserAdminDto
{
    public long Id { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public bool EmailConfirmed { get; set; }
}
