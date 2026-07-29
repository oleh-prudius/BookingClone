using Domain.Entities.Identity;

namespace Domain.Entities;

public class Ticket
{
    public long Id { get; set; }

    public long TransportRouteId { get; set; }
    public TransportRoute TransportRoute { get; set; } = null!;

    public long CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int Seats { get; set; }

    public decimal TotalPrice { get; set; }

    public DateTimeOffset PurchasedAtUtc { get; set; }
}
