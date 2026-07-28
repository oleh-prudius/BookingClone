namespace Domain.Entities;

public class Address {
	public long Id { get; set; }

	public string Street { get; set; } = null!;

	public string HouseNumber { get; set; } = null!;

	public int? Floor { get; set; }

	public string? ApartmentNumber { get; set; }

	public double? Latitude { get; set; }

	public double? Longitude { get; set; }

	public long CityId { get; set; }
	public City City { get; set; } = null!;

	public Hotel? Hotel { get; set; } = null!;
}
