namespace Domain.Entities;

public class BookingBreakfast
{
    public long Id { get; set; }

    public long BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public long BreakfastId { get; set; }
    public Breakfast Breakfast { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}
