using Domain.Entities.Identity;
using Domain.Enums;

namespace Domain.Entities;

public class Booking {
	public long Id { get; set; }

	public DateOnly DateFrom { get; set; }

	public DateOnly DateTo { get; set; }

	public string? PersonalWishes { get; set; }

	public DateTimeOffset EstimatedTimeOfArrivalUtc { get; set; }

	public decimal AmountToPay { get; set; }

	public BookingStatus Status { get; set; } = BookingStatus.Pending;

	public DateTimeOffset? CancelledAtUtc { get; set; }

	public DateTimeOffset? ConfirmedAtUtc { get; set; }

	public long CustomerId { get; set; }
	public Customer Customer { get; set; } = null!;

	public long? BankCardId { get; set; }
	public BankCard? BankCard { get; set; }

	public ICollection<BookingRoomVariant> BookingRoomVariants { get; set; } = null!;

	public ICollection<BookingBreakfast> BookingBreakfasts { get; set; } = null!;

	public HotelReview? HotelReview { get; set; } = null!;
}
