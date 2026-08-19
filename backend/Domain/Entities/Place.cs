namespace Domain.Entities;

public class Place
{
    public long Id { get; set; }

    public string Name { get; set; } = null!;

    public string Category { get; set; } = null!;

    public string? PhotoUrl { get; set; }

    public string? Description { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public long CityId { get; set; }
    public City City { get; set; } = null!;
}
