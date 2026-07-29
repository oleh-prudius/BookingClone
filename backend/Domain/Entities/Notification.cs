using Domain.Entities.Identity;

namespace Domain.Entities;

public class Notification
{
    public long Id { get; set; }

    public long UserId { get; set; }
    public AppUser User { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string Message { get; set; } = null!;

    public bool IsRead { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }
}
