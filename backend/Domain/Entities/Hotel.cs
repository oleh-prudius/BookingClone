using Domain.Entities.Identity;

namespace Domain.Entities;

public class Hotel {
	public long Id { get; set; }

	public string Name { get; set; } = null!;

	public string Description { get; set; } = null!;

	public DateTimeOffset ArrivalTimeUtcFrom { get; set; }

	public DateTimeOffset ArrivalTimeUtcTo { get; set; }

	public DateTimeOffset DepartureTimeUtcFrom { get; set; }

	public DateTimeOffset DepartureTimeUtcTo { get; set; }

	public bool IsArchived { get; set; }

	/// Official hotel classification (1-5 stars), independent of guest review scores.
	public int StarRating { get; set; }

	public long AddressId { get; set; }
	public Address Address { get; set; } = null!;

	public long HotelCategoryId { get; set; }
	public HotelCategory HotelCategory { get; set; } = null!;

	public long RealtorId { get; set; }
	public Realtor Realtor { get; set; } = null!;

	public ICollection<HotelHotelAmenity> HotelHotelAmenities { get; set; } = null!;

	public ICollection<HotelBreakfast> HotelBreakfasts { get; set; } = null!;

	public ICollection<HotelStaffLanguage> HotelStaffLanguages { get; set; } = null!;

	public ICollection<Room> Rooms { get; set; } = null!;

	public ICollection<HotelPhoto> Photos { get; set; } = null!;

	public ICollection<FavoriteHotel> FavoriteHotels { get; set; } = null!;
}
