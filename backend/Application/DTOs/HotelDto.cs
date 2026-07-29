namespace Application.DTOs;

public class HotelDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CityName { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public long HotelCategoryId { get; set; }
    public string HotelCategoryName { get; set; } = string.Empty;
    public long RealtorId { get; set; }
    public bool IsArchived { get; set; }
    public string? CoverPhotoUrl { get; set; }
    public double? Rating { get; set; }
    public int ReviewCount { get; set; }
    public decimal? PricePerNight { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public IReadOnlyList<string> Amenities { get; set; } = new List<string>();
    public DateTimeOffset ArrivalTimeUtcFrom { get; set; }
    public DateTimeOffset ArrivalTimeUtcTo { get; set; }
    public DateTimeOffset DepartureTimeUtcFrom { get; set; }
    public DateTimeOffset DepartureTimeUtcTo { get; set; }
}
