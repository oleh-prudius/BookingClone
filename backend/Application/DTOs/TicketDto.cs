namespace Application.DTOs;

public class TicketDto
{
    public long Id { get; set; }
    public long TransportRouteId { get; set; }
    public string FromCityName { get; set; } = string.Empty;
    public string ToCityName { get; set; } = string.Empty;
    public DateTimeOffset DepartureUtc { get; set; }
    public DateTimeOffset ArrivalUtc { get; set; }
    public int Seats { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTimeOffset PurchasedAtUtc { get; set; }
}
