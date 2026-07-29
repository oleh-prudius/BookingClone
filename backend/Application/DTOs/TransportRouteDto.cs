namespace Application.DTOs;

public class TransportRouteDto
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public long FromCityId { get; set; }
    public string FromCityName { get; set; } = string.Empty;
    public long ToCityId { get; set; }
    public string ToCityName { get; set; } = string.Empty;
    public DateTimeOffset DepartureUtc { get; set; }
    public DateTimeOffset ArrivalUtc { get; set; }
    public decimal Price { get; set; }
    public int TotalSeats { get; set; }
    public int AvailableSeats { get; set; }
}
