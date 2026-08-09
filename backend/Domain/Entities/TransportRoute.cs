using Domain.Enums;

namespace Domain.Entities;

public class TransportRoute
{
    public long Id { get; set; }

    public TransportType Type { get; set; }

    public long FromCityId { get; set; }
    public City FromCity { get; set; } = null!;

    public long ToCityId { get; set; }
    public City ToCity { get; set; } = null!;

    public DateTimeOffset DepartureUtc { get; set; }

    public DateTimeOffset ArrivalUtc { get; set; }

    public decimal Price { get; set; }

    public int TotalSeats { get; set; }

    public string CarrierName { get; set; } = string.Empty;

    public string VehicleModel { get; set; } = string.Empty;

    public ICollection<Ticket> Tickets { get; set; } = null!;
}
