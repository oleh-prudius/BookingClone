using Domain.Constants;
using Domain.Entities;
using Infrastructure.Data;
using Domain.Entities.Identity;
using Domain.Enums;
using Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Services;

public class DbInitializer(
	AppDbContext context,
	IConfiguration configuration,
	UserManager<AppUser> userManager,
	RoleManager<AppRole> roleManager
	//IImageService imageService
) : IDbInicializer {

	public async Task InitializeAsync(CancellationToken cancellationToken = default) {
		await MigrateAsync(cancellationToken);
		await InitializeIdentityAsync(cancellationToken);
		await SeedReferenceDataAsync(cancellationToken);
	}

	public async Task MigrateAsync(CancellationToken cancellationToken) {
		await context.Database.MigrateAsync(cancellationToken);
	}

	public async Task InitializeIdentityAsync(CancellationToken cancellationToken) {
		//using var transaction = await context.BeginTransactionAsync(cancellationToken);

		try {
			if (!await roleManager.Roles.AnyAsync(cancellationToken)) {
				await CreateRolesAsync();
			}

			if (!await userManager.Users.AnyAsync(cancellationToken)) {
				await CreateAdminAsync();
			}

			//await transaction.CommitAsync(cancellationToken);
		}
		catch {
			//transaction.Rollback();
			throw;
		}
	}

	private async Task CreateRolesAsync() {
		foreach (var roleName in Roles.All) {
			await roleManager.CreateAsync(new AppRole {
				Name = roleName
			});
		}
	}

	private async Task CreateAdminAsync() {
		//string defaultBase64Image = configuration.GetValue<string>("DefaultUserImageBase64")
		//	?? throw new Exception("DefaultUserImageBase64 is not inicialized");

		var admin = new Admin {
			FirstName = "Олег",
			LastName = "Ольжич",
			Email = configuration["Admin:Email"]
				?? throw new NullReferenceException("You need to set up Admin:Email in your configuration"),
			UserName = "admin",
			Photo = "default.jpg",
			EmailConfirmed = true
			//Photo = await imageService.SaveImageAsync(defaultBase64Image)
		};

		IdentityResult result = await userManager.CreateAsync(
			admin,
			configuration["Admin:Password"]
				?? throw new NullReferenceException("You need to set up Admin:Password in your configuration")
		);

		if (!result.Succeeded)
			throw new Exception("Error creating admin account");

		result = await userManager.AddToRoleAsync(admin, Roles.Admin);

		if (!result.Succeeded)
			throw new Exception("Role assignment error");
	}

	private async Task SeedReferenceDataAsync(CancellationToken ct)
	{
		await SeedCountriesAndCitiesAsync(ct);
		await SeedWorldCountriesAndCitiesAsync(ct);
		await SeedLookupTablesAsync(ct);
		await SeedTestHotelAsync(ct);
		await SeedGrandKyivPhotosAsync(ct);
		await SeedMoreHotelsAsync(ct);
		await SeedPlacesAsync(ct);
		await SeedTransportRoutesAsync(ct);
	}

	private async Task SeedTransportRoutesAsync(CancellationToken ct)
	{
		if (await context.TransportRoutes.AnyAsync(ct))
			return;

		var kyiv = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Kyiv", ct);
		var lviv = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Lviv", ct);
		var paris = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Paris", ct);
		var rome = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Rome", ct);

		if (kyiv is null || lviv is null || paris is null || rome is null)
			return;

		var today = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);

		await context.TransportRoutes.AddRangeAsync([
			new TransportRoute
			{
				Type = TransportType.Train, FromCityId = kyiv.Id, ToCityId = lviv.Id,
				DepartureUtc = today.AddDays(1).AddHours(8), ArrivalUtc = today.AddDays(1).AddHours(14),
				Price = 25, TotalSeats = 40,
				CarrierName = "Ukrainian Railways", VehicleModel = "Intercity+ EMU"
			},
			new TransportRoute
			{
				Type = TransportType.Bus, FromCityId = kyiv.Id, ToCityId = lviv.Id,
				DepartureUtc = today.AddDays(1).AddHours(9), ArrivalUtc = today.AddDays(1).AddHours(17),
				Price = 12, TotalSeats = 50,
				CarrierName = "FlixBus", VehicleModel = "Setra S 517 HD"
			},
			new TransportRoute
			{
				Type = TransportType.Plane, FromCityId = kyiv.Id, ToCityId = paris.Id,
				DepartureUtc = today.AddDays(2).AddHours(10), ArrivalUtc = today.AddDays(2).AddHours(13),
				Price = 150, TotalSeats = 180,
				CarrierName = "Ukraine International Airlines", VehicleModel = "Boeing 737-800"
			},
			new TransportRoute
			{
				Type = TransportType.Plane, FromCityId = paris.Id, ToCityId = rome.Id,
				DepartureUtc = today.AddDays(3).AddHours(11), ArrivalUtc = today.AddDays(3).AddHours(13),
				Price = 90, TotalSeats = 150,
				CarrierName = "Air France", VehicleModel = "Airbus A320"
			},
		], ct);
		await context.SaveChangesAsync(ct);
	}

	private async Task SeedPlacesAsync(CancellationToken ct)
	{
		if (await context.Places.AnyAsync(ct))
			return;

		var kyiv = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Kyiv", ct);
		var paris = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Paris", ct);
		var rome = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Rome", ct);
		var bangkok = await context.Cities.FirstOrDefaultAsync(c => c.Name == "Bangkok", ct);

		var places = new List<Place>();

		if (kyiv is not null)
		{
			places.AddRange([
				new Place { Name = "Saint Sophia Cathedral", Category = PlaceCategories.Landmark, Latitude = 50.4526, Longitude = 30.5147, CityId = kyiv.Id },
				new Place { Name = "Mystetskyi Arsenal",     Category = PlaceCategories.Museum,   Latitude = 50.4425, Longitude = 30.5461, CityId = kyiv.Id },
				new Place { Name = "Mariinsky Park",         Category = PlaceCategories.Park,     Latitude = 50.4477, Longitude = 30.5442, CityId = kyiv.Id },
				new Place { Name = "Ostannya Barykada",      Category = PlaceCategories.Restaurant, Latitude = 50.4488, Longitude = 30.5238, CityId = kyiv.Id },
				new Place { Name = "TSUM Kyiv",              Category = PlaceCategories.Shopping, Latitude = 50.4479, Longitude = 30.5236, CityId = kyiv.Id },
			]);
		}

		if (paris is not null)
		{
			places.AddRange([
				new Place { Name = "Eiffel Tower",   Category = PlaceCategories.Landmark, Latitude = 48.8584, Longitude = 2.2945, CityId = paris.Id },
				new Place { Name = "Louvre Museum",  Category = PlaceCategories.Museum,   Latitude = 48.8606, Longitude = 2.3376, CityId = paris.Id },
				new Place { Name = "Jardin du Luxembourg", Category = PlaceCategories.Park, Latitude = 48.8462, Longitude = 2.3372, CityId = paris.Id },
				new Place { Name = "Le Comptoir du Relais", Category = PlaceCategories.Restaurant, Latitude = 48.8523, Longitude = 2.3389, CityId = paris.Id },
			]);
		}

		if (rome is not null)
		{
			places.AddRange([
				new Place { Name = "Colosseum",      Category = PlaceCategories.Landmark, Latitude = 41.8902, Longitude = 12.4922, CityId = rome.Id },
				new Place { Name = "Vatican Museums", Category = PlaceCategories.Museum,  Latitude = 41.9065, Longitude = 12.4536, CityId = rome.Id },
				new Place { Name = "Villa Borghese", Category = PlaceCategories.Park,     Latitude = 41.9142, Longitude = 12.4845, CityId = rome.Id },
			]);
		}

		if (bangkok is not null)
		{
			places.AddRange([
				new Place { Name = "Grand Palace",   Category = PlaceCategories.Landmark, Latitude = 13.7500, Longitude = 100.4914, CityId = bangkok.Id },
				new Place { Name = "Chatuchak Market", Category = PlaceCategories.Shopping, Latitude = 13.7999, Longitude = 100.5500, CityId = bangkok.Id },
				new Place { Name = "Lumpini Park",   Category = PlaceCategories.Park,     Latitude = 13.7307, Longitude = 100.5418, CityId = bangkok.Id },
			]);
		}

		if (places.Count > 0)
		{
			await context.Places.AddRangeAsync(places, ct);
			await context.SaveChangesAsync(ct);
		}
	}

	private async Task SeedCountriesAndCitiesAsync(CancellationToken ct)
	{
		if (!await context.Countries.AnyAsync(ct))
		{
			await context.Countries.AddRangeAsync([
				new Country { Name = "Ukraine",  Image = "https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg"                    },
				new Country { Name = "France",   Image = "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg"                     },
				new Country { Name = "Italy",    Image = "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg"                      },
				new Country { Name = "Spain",    Image = "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg"                      },
				new Country { Name = "Turkey",   Image = "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg"                     },
				new Country { Name = "UAE",      Image = "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg"   },
				new Country { Name = "Thailand", Image = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg"                   },
				new Country { Name = "Germany",  Image = "https://upload.wikimedia.org/wikipedia/commons/b/be/Flag_of_Germany.svg"                    },
				new Country { Name = "Greece",   Image = "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Greece.svg"                     },
				new Country { Name = "Croatia",  Image = "https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Croatia.svg"                    },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.Cities.AnyAsync(ct))
		{
			var ukraine  = await context.Countries.FirstAsync(c => c.Name == "Ukraine",  ct);
			var france   = await context.Countries.FirstAsync(c => c.Name == "France",   ct);
			var italy    = await context.Countries.FirstAsync(c => c.Name == "Italy",    ct);
			var spain    = await context.Countries.FirstAsync(c => c.Name == "Spain",    ct);
			var turkey   = await context.Countries.FirstAsync(c => c.Name == "Turkey",   ct);
			var uae      = await context.Countries.FirstAsync(c => c.Name == "UAE",      ct);
			var thailand = await context.Countries.FirstAsync(c => c.Name == "Thailand", ct);
			var germany  = await context.Countries.FirstAsync(c => c.Name == "Germany",  ct);
			var greece   = await context.Countries.FirstAsync(c => c.Name == "Greece",   ct);
			var croatia  = await context.Countries.FirstAsync(c => c.Name == "Croatia",  ct);

			await context.Cities.AddRangeAsync([
				// Ukraine
				new City { Name = "Kyiv",       Longitude =  30.5238, Latitude = 50.4501, CountryId = ukraine.Id,  Image = "https://picsum.photos/seed/kyiv/800/600"       },
				new City { Name = "Lviv",        Longitude =  24.0297, Latitude = 49.8397, CountryId = ukraine.Id,  Image = "https://picsum.photos/seed/lviv/800/600"       },
				new City { Name = "Odesa",       Longitude =  30.7233, Latitude = 46.4825, CountryId = ukraine.Id,  Image = "https://picsum.photos/seed/odesa/800/600"      },
				new City { Name = "Kharkiv",     Longitude =  36.2304, Latitude = 49.9935, CountryId = ukraine.Id,  Image = "https://picsum.photos/seed/kharkiv/800/600"    },
				// France
				new City { Name = "Paris",       Longitude =   2.3522, Latitude = 48.8566, CountryId = france.Id,   Image = "https://picsum.photos/seed/paris/800/600"      },
				new City { Name = "Nice",        Longitude =   7.2620, Latitude = 43.7102, CountryId = france.Id,   Image = "https://picsum.photos/seed/nice/800/600"       },
				new City { Name = "Lyon",        Longitude =   4.8357, Latitude = 45.7640, CountryId = france.Id,   Image = "https://picsum.photos/seed/lyon/800/600"       },
				// Italy
				new City { Name = "Rome",        Longitude =  12.4964, Latitude = 41.9028, CountryId = italy.Id,    Image = "https://picsum.photos/seed/rome/800/600"       },
				new City { Name = "Milan",       Longitude =   9.1900, Latitude = 45.4642, CountryId = italy.Id,    Image = "https://picsum.photos/seed/milan/800/600"      },
				new City { Name = "Venice",      Longitude =  12.3155, Latitude = 45.4408, CountryId = italy.Id,    Image = "https://picsum.photos/seed/venice/800/600"     },
				new City { Name = "Florence",    Longitude =  11.2558, Latitude = 43.7696, CountryId = italy.Id,    Image = "https://picsum.photos/seed/florence/800/600"   },
				// Spain
				new City { Name = "Barcelona",   Longitude =   2.1734, Latitude = 41.3851, CountryId = spain.Id,    Image = "https://picsum.photos/seed/barcelona/800/600"  },
				new City { Name = "Madrid",      Longitude =  -3.7038, Latitude = 40.4168, CountryId = spain.Id,    Image = "https://picsum.photos/seed/madrid/800/600"     },
				new City { Name = "Valencia",    Longitude =  -0.3763, Latitude = 39.4699, CountryId = spain.Id,    Image = "https://picsum.photos/seed/valencia/800/600"   },
				// Turkey
				new City { Name = "Istanbul",    Longitude =  28.9784, Latitude = 41.0082, CountryId = turkey.Id,   Image = "https://picsum.photos/seed/istanbul/800/600"   },
				new City { Name = "Antalya",     Longitude =  30.7133, Latitude = 36.8969, CountryId = turkey.Id,   Image = "https://picsum.photos/seed/antalya/800/600"    },
				new City { Name = "Bodrum",      Longitude =  27.4242, Latitude = 37.0344, CountryId = turkey.Id,   Image = "https://picsum.photos/seed/bodrum/800/600"     },
				// UAE
				new City { Name = "Dubai",       Longitude =  55.2708, Latitude = 25.2048, CountryId = uae.Id,      Image = "https://picsum.photos/seed/dubai/800/600"      },
				new City { Name = "Abu Dhabi",   Longitude =  54.3667, Latitude = 24.4539, CountryId = uae.Id,      Image = "https://picsum.photos/seed/abudhabi/800/600"   },
				// Thailand
				new City { Name = "Bangkok",     Longitude = 100.5018, Latitude = 13.7563, CountryId = thailand.Id, Image = "https://picsum.photos/seed/bangkok/800/600"    },
				new City { Name = "Phuket",      Longitude =  98.3923, Latitude =  7.8804, CountryId = thailand.Id, Image = "https://picsum.photos/seed/phuket/800/600"     },
				new City { Name = "Chiang Mai",  Longitude =  98.9817, Latitude = 18.7061, CountryId = thailand.Id, Image = "https://picsum.photos/seed/chiangmai/800/600"  },
				// Germany
				new City { Name = "Berlin",      Longitude =  13.4050, Latitude = 52.5200, CountryId = germany.Id,  Image = "https://picsum.photos/seed/berlin/800/600"     },
				new City { Name = "Munich",      Longitude =  11.5820, Latitude = 48.1351, CountryId = germany.Id,  Image = "https://picsum.photos/seed/munich/800/600"     },
				// Greece
				new City { Name = "Athens",      Longitude =  23.7275, Latitude = 37.9838, CountryId = greece.Id,   Image = "https://picsum.photos/seed/athens/800/600"     },
				new City { Name = "Santorini",   Longitude =  25.4319, Latitude = 36.3932, CountryId = greece.Id,   Image = "https://picsum.photos/seed/santorini/800/600"  },
				// Croatia
				new City { Name = "Dubrovnik",   Longitude =  18.0944, Latitude = 42.6507, CountryId = croatia.Id,  Image = "https://picsum.photos/seed/dubrovnik/800/600"  },
				new City { Name = "Split",       Longitude =  16.4402, Latitude = 43.5081, CountryId = croatia.Id,  Image = "https://picsum.photos/seed/split/800/600"      },
			], ct);
			await context.SaveChangesAsync(ct);
		}
	}

	private record WorldCitySeed(string Name, double Lat, double Lng);
	private record WorldCountrySeed(string Name, string Iso2, List<WorldCitySeed> Cities);

	/// <summary>
	/// Adds every country/city not already seeded above, from a bundled reference dataset
	/// (dr5hn/countries-states-cities-database), so realtors aren't limited to the ~10
	/// hand-picked countries when creating a hotel.
	/// </summary>
	private async Task SeedWorldCountriesAndCitiesAsync(CancellationToken ct)
	{
		var existingNames = (await context.Countries.Select(c => c.Name).ToListAsync(ct)).ToHashSet();

		await using var stream = Assembly.GetExecutingAssembly()
			.GetManifestResourceStream("Infrastructure.Data.Seed.countries-cities.json")
			?? throw new InvalidOperationException("Embedded resource countries-cities.json not found.");

		var worldCountries = await JsonSerializer.DeserializeAsync<List<WorldCountrySeed>>(
			stream, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, ct)
			?? [];

		var newCountries = worldCountries
			.Where(wc => !existingNames.Contains(wc.Name))
			.Select(wc => new Country
			{
				Name = wc.Name,
				Image = $"https://flagcdn.com/w320/{wc.Iso2.ToLowerInvariant()}.png",
				Cities = wc.Cities.Select(wci => new City
				{
					Name = wci.Name,
					Latitude = wci.Lat,
					Longitude = wci.Lng,
					Image = $"https://picsum.photos/seed/{Slugify(wci.Name)}/800/600"
				}).ToList()
			})
			.ToList();

		if (newCountries.Count > 0)
		{
			await context.Countries.AddRangeAsync(newCountries, ct);
			await context.SaveChangesAsync(ct);
		}
	}

	private static string Slugify(string name)
	{
		var normalized = name.Normalize(NormalizationForm.FormD);
		var sb = new StringBuilder();
		foreach (var ch in normalized)
		{
			if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark && char.IsLetterOrDigit(ch))
				sb.Append(ch);
		}
		return sb.ToString().ToLowerInvariant();
	}

	private async Task SeedLookupTablesAsync(CancellationToken ct)
	{
		if (!await context.HotelCategories.AnyAsync(ct))
		{
			await context.HotelCategories.AddRangeAsync([
				new HotelCategory { Name = "Hotel"     },
				new HotelCategory { Name = "Hostel"    },
				new HotelCategory { Name = "Apartment" },
				new HotelCategory { Name = "Villa"     },
				new HotelCategory { Name = "Resort"    },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.HotelAmenities.AnyAsync(ct))
		{
			await context.HotelAmenities.AddRangeAsync([
				new HotelAmenity { Name = "Wi-Fi",            Image = "wifi.svg"        },
				new HotelAmenity { Name = "Pool",             Image = "pool.svg"        },
				new HotelAmenity { Name = "Parking",          Image = "parking.svg"     },
				new HotelAmenity { Name = "Gym",              Image = "gym.svg"         },
				new HotelAmenity { Name = "Restaurant",       Image = "restaurant.svg"  },
				new HotelAmenity { Name = "Spa",              Image = "spa.svg"         },
				new HotelAmenity { Name = "Airport Shuttle",  Image = "shuttle.svg"     },
				new HotelAmenity { Name = "Air Conditioning", Image = "ac.svg"          },
				new HotelAmenity { Name = "Beach Access",     Image = "beach.svg"       },
				new HotelAmenity { Name = "Pet Friendly",     Image = "pet.svg"         },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.RoomTypes.AnyAsync(ct))
		{
			await context.RoomTypes.AddRangeAsync([
				new RoomType { Name = "Standard" },
				new RoomType { Name = "Superior" },
				new RoomType { Name = "Deluxe"   },
				new RoomType { Name = "Suite"    },
				new RoomType { Name = "Economy"  },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.RoomAmenities.AnyAsync(ct))
		{
			await context.RoomAmenities.AddRangeAsync([
				new RoomAmenity { Name = "Air Conditioning" },
				new RoomAmenity { Name = "TV"               },
				new RoomAmenity { Name = "Mini Bar"         },
				new RoomAmenity { Name = "Safe"             },
				new RoomAmenity { Name = "Hair Dryer"       },
				new RoomAmenity { Name = "Balcony"          },
				new RoomAmenity { Name = "Bathtub"          },
				new RoomAmenity { Name = "Sea View"         },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.Languages.AnyAsync(ct))
		{
			await context.Languages.AddRangeAsync([
				new Language { Name = "English"   },
				new Language { Name = "Ukrainian" },
				new Language { Name = "French"    },
				new Language { Name = "German"    },
				new Language { Name = "Spanish"   },
				new Language { Name = "Italian"   },
				new Language { Name = "Arabic"    },
				new Language { Name = "Turkish"   },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.Citizenships.AnyAsync(ct))
		{
			await context.Citizenships.AddRangeAsync([
				new Citizenship { Name = "Ukrainian" },
				new Citizenship { Name = "French"    },
				new Citizenship { Name = "German"    },
				new Citizenship { Name = "Spanish"   },
				new Citizenship { Name = "Italian"   },
				new Citizenship { Name = "British"   },
				new Citizenship { Name = "American"  },
				new Citizenship { Name = "Turkish"   },
				new Citizenship { Name = "Thai"      },
				new Citizenship { Name = "Croatian"  },
				new Citizenship { Name = "Greek"     },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.Genders.AnyAsync(ct))
		{
			await context.Genders.AddRangeAsync([
				new Gender { Name = "Male"   },
				new Gender { Name = "Female" },
				new Gender { Name = "Other"  },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.Breakfasts.AnyAsync(ct))
		{
			await context.Breakfasts.AddRangeAsync([
				new Breakfast { Name = "No breakfast"       },
				new Breakfast { Name = "Breakfast included" },
				new Breakfast { Name = "Half board"         },
				new Breakfast { Name = "Full board"         },
				new Breakfast { Name = "All inclusive"      },
			], ct);
			await context.SaveChangesAsync(ct);
		}

		if (!await context.RentalPeriods.AnyAsync(ct))
		{
			await context.RentalPeriods.AddRangeAsync([
				new RentalPeriod { Name = "Per night" },
				new RentalPeriod { Name = "Per week"  },
			], ct);
			await context.SaveChangesAsync(ct);
		}
	}

	private async Task SeedTestHotelAsync(CancellationToken ct)
	{
		if (await context.Hotels.AnyAsync(ct)) return;

		// Realtor
		var realtorEmail = "realtor@booking.test";
		var realtor = await userManager.FindByEmailAsync(realtorEmail);
		if (realtor is null)
		{
			realtor = new Realtor
			{
				FirstName = "Test",
				LastName  = "Realtor",
				Email     = realtorEmail,
				UserName  = "test_realtor",
				Photo     = "default.jpg",
				EmailConfirmed = true
			};
			var result = await userManager.CreateAsync(realtor, "Realtor123");
			if (!result.Succeeded)
				throw new Exception("Error creating test realtor: " + string.Join(", ", result.Errors.Select(e => e.Description)));

			await userManager.AddToRoleAsync(realtor, Roles.Realtor);
		}

		var kyiv     = await context.Cities.FirstAsync(c => c.Name == "Kyiv", ct);
		var category = await context.HotelCategories.FirstAsync(c => c.Name == "Hotel", ct);
		var standard = await context.RoomTypes.FirstAsync(r => r.Name == "Standard", ct);
		var deluxe   = await context.RoomTypes.FirstAsync(r => r.Name == "Deluxe",   ct);

		var address = new Address
		{
			Street      = "Khreshchatyk",
			HouseNumber = "1",
			CityId      = kyiv.Id,
			Latitude    = 50.4501,
			Longitude   = 30.5234
		};
		await context.Addresses.AddAsync(address, ct);
		await context.SaveChangesAsync(ct);

		var hotel = new Hotel
		{
			Name                  = "Grand Kyiv Hotel",
			Description           = "A luxurious hotel in the heart of Kyiv.",
			ArrivalTimeUtcFrom    = new DateTimeOffset(2000, 1, 1, 14, 0, 0, TimeSpan.Zero),
			ArrivalTimeUtcTo      = new DateTimeOffset(2000, 1, 1, 22, 0, 0, TimeSpan.Zero),
			DepartureTimeUtcFrom  = new DateTimeOffset(2000, 1, 1,  7, 0, 0, TimeSpan.Zero),
			DepartureTimeUtcTo    = new DateTimeOffset(2000, 1, 1, 12, 0, 0, TimeSpan.Zero),
			IsArchived            = false,
			AddressId             = address.Id,
			HotelCategoryId       = category.Id,
			RealtorId             = realtor.Id,
			StarRating            = 4
		};
		await context.Hotels.AddAsync(hotel, ct);
		await context.SaveChangesAsync(ct);

		var standardRoom = new Room
		{
			Name          = "Standard Room",
			Area          = 22,
			NumberOfRooms = 1,
			Quantity      = 10,
			HotelId       = hotel.Id,
			RoomTypeId    = standard.Id
		};
		var deluxeRoom = new Room
		{
			Name          = "Deluxe Room",
			Area          = 35,
			NumberOfRooms = 2,
			Quantity      = 5,
			HotelId       = hotel.Id,
			RoomTypeId    = deluxe.Id
		};
		await context.Rooms.AddRangeAsync([standardRoom, deluxeRoom], ct);
		await context.SaveChangesAsync(ct);

		await context.RoomVariants.AddRangeAsync([
			new RoomVariant
			{
				Price      = 80m,
				RoomId     = standardRoom.Id,
				GuestInfo  = new GuestInfo { AdultCount = 2, ChildCount = 0 },
				BedInfo    = new BedInfo   { DoubleBedCount = 1 }
			},
			new RoomVariant
			{
				Price         = 65m,
				RoomId        = standardRoom.Id,
				GuestInfo     = new GuestInfo { AdultCount = 1, ChildCount = 0 },
				BedInfo       = new BedInfo   { SingleBedCount = 1 }
			},
			new RoomVariant
			{
				Price         = 150m,
				DiscountPrice = 120m,
				RoomId        = deluxeRoom.Id,
				GuestInfo     = new GuestInfo { AdultCount = 2, ChildCount = 1 },
				BedInfo       = new BedInfo   { KingsizeBedCount = 1, ExtraBedCount = 1 }
			},
		], ct);
		await context.SaveChangesAsync(ct);
	}

	// Real hotel photos (exteriors, lobbies, rooms, pools; sourced from Wikimedia Commons)
	// rotated per hotel so every seeded hotel shows an actual hotel, not a city landmark
	// or an unrelated stock photo.
	private static readonly string[] HotelPhotoPool =
	[
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/25hours_Hotel_The_Goldman%2C_Frankfurt_am_Main_%28P1032662%29.jpg/1280px-25hours_Hotel_The_Goldman%2C_Frankfurt_am_Main_%28P1032662%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Hotel_building_with_blue_sky_%2852829435864%29.jpg/1280px-Hotel_building_with_blue_sky_%2852829435864%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Bavaro_%E2%80%94_Iberostar_%E2%80%94_main_building.JPG/1280px-Bavaro_%E2%80%94_Iberostar_%E2%80%94_main_building.JPG",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Modern_Hotel%2C_Baku_%28IMG_20190714_025335%29.jpg/1280px-Modern_Hotel%2C_Baku_%28IMG_20190714_025335%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/AUS_Perth%2C_Fremantle%2C_Esplanade_Hotel_005.jpg/1280px-AUS_Perth%2C_Fremantle%2C_Esplanade_Hotel_005.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Coop_Hotel%2C_Sofia_%28_1070739%29.jpg/1280px-Coop_Hotel%2C_Sofia_%28_1070739%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Bucharest_-_Athenee_Palace_Hilton_lobby_01.jpg/1280px-Bucharest_-_Athenee_Palace_Hilton_lobby_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Chinggis_Khaan_Hotel_-_Lobby.jpg/1280px-Chinggis_Khaan_Hotel_-_Lobby.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Lobby_Intercontinental_Addis.jpg/1280px-Lobby_Intercontinental_Addis.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Manila_Hotel_Lobby_Lounge.jpg/1280px-Manila_Hotel_Lobby_Lounge.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Praha_Dejvice_Evropska_15_Hotel_Diplomat_vstupni_hala.jpg/1280px-Praha_Dejvice_Evropska_15_Hotel_Diplomat_vstupni_hala.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Deluxe_Suite_bedroom.jpg/1280px-Deluxe_Suite_bedroom.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Cozy_hotel_room_with_warm_lighting_and_refreshments_on_a_small_table.jpg/1280px-Cozy_hotel_room_with_warm_lighting_and_refreshments_on_a_small_table.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Caravelle_Saigon_-_Signature_Studio_Room.jpg/1280px-Caravelle_Saigon_-_Signature_Studio_Room.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Hotel_Italia_Palace_Luxury_bedroom.jpg/1280px-Hotel_Italia_Palace_Luxury_bedroom.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Delmar_hotel_room_sea_side.jpg/1280px-Delmar_hotel_room_sea_side.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2013-01-15_Sangri-La_Cebu_Infinity_pool_pano.jpeg/1280px-2013-01-15_Sangri-La_Cebu_Infinity_pool_pano.jpeg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Best_Western_Swimming_pool%2C_Helen.jpg/1280px-Best_Western_Swimming_pool%2C_Helen.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Alpenresort_Schwarz_-_interior_pool_%2824723499948%29.png/1280px-Alpenresort_Schwarz_-_interior_pool_%2824723499948%29.png",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Atrium_of_Granada_Luxury_Belek_Hotel.jpg/1280px-Atrium_of_Granada_Luxury_Belek_Hotel.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2016_-_Four_Seasons_Hotel_Hong_Kong_%28_Ank_Kumar_%29_01.jpg/1280px-2016_-_Four_Seasons_Hotel_Hong_Kong_%28_Ank_Kumar_%29_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2016_-_Four_Seasons_Hotel_Hong_Kong_%28_Ank_Kumar_%29_02.jpg/1280px-2016_-_Four_Seasons_Hotel_Hong_Kong_%28_Ank_Kumar_%29_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Botanic_Sanctuary_Antwerp_gotische_bogen.jpg/1280px-Botanic_Sanctuary_Antwerp_gotische_bogen.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Keemala_Resort_Overview_at_Sunrise.jpg/1280px-Keemala_Resort_Overview_at_Sunrise.jpg",
	];

	// Picks a deterministic-but-varied set of hotel photos per hotel id, so hotels in the
	// same city don't all show the same picture and every photo actually depicts a hotel.
	private static IEnumerable<HotelPhoto> BuildPhotos(long hotelId)
	{
		const int photosPerHotel = 3;
		var start = (int)(hotelId * 5 % HotelPhotoPool.Length);
		for (var i = 0; i < photosPerHotel; i++)
		{
			var url = HotelPhotoPool[(start + i * 7) % HotelPhotoPool.Length];
			yield return new HotelPhoto { Name = url, Priority = i, HotelId = hotelId };
		}
	}

	// Replaces whatever photos a seeded demo hotel currently has with a fresh pick from
	// HotelPhotoPool. Only ever called for the fixed set of named demo hotels below, so
	// it never touches photos a real host uploaded through the UI.
	private async Task RefreshSeededHotelPhotosAsync(long hotelId, CancellationToken ct)
	{
		var existing = await context.HotelPhotos.Where(p => p.HotelId == hotelId).ToListAsync(ct);
		context.HotelPhotos.RemoveRange(existing);
		await context.HotelPhotos.AddRangeAsync(BuildPhotos(hotelId), ct);
		await context.SaveChangesAsync(ct);
	}

	private async Task SeedGrandKyivPhotosAsync(CancellationToken ct)
	{
		var hotel = await context.Hotels.FirstOrDefaultAsync(h => h.Name == "Grand Kyiv Hotel", ct);
		if (hotel is null) return;

		await RefreshSeededHotelPhotosAsync(hotel.Id, ct);
	}

	private record HotelSeedSpec(
		string HotelName,
		string CityName,
		string CategoryName,
		string Description,
		string[] AmenityNames,
		(string RoomName, string RoomTypeName, int Quantity, (decimal Price, decimal? DiscountPrice, int Adults, int Children) Variant)[] Rooms,
		int StarRating);

	private async Task SeedMoreHotelsAsync(CancellationToken ct)
	{
		HotelSeedSpec[] specs =
		[
			new("Lviv Old Town Boutique Hotel", "Lviv", "Hotel",
				"A charming boutique hotel steps away from Lviv's historic old town.",
				["Wi-Fi", "Restaurant", "Air Conditioning"],
				[("Standard Room", "Standard", 8, (55m, null, 2, 0)), ("Suite", "Suite", 3, (110m, 95m, 2, 1))],
				3),

			new("Le Marais Suites", "Paris", "Apartment",
				"Stylish apartments in the heart of Paris' Le Marais district.",
				["Wi-Fi", "Air Conditioning", "Pet Friendly"],
				[("Studio", "Standard", 6, (140m, null, 2, 0)), ("One-Bedroom Suite", "Suite", 4, (210m, 180m, 2, 2))],
				4),

			new("Roma Colosseo Hotel", "Rome", "Hotel",
				"Elegant hotel with views of the Colosseum and classic Roman hospitality.",
				["Wi-Fi", "Pool", "Restaurant", "Gym"],
				[("Superior Room", "Superior", 10, (130m, null, 2, 1)), ("Deluxe Room", "Deluxe", 5, (190m, 160m, 2, 1))],
				4),

			new("Barcelona Beachfront Resort", "Barcelona", "Resort",
				"A relaxed beachfront resort with direct access to the Mediterranean coast.",
				["Pool", "Beach Access", "Spa", "Restaurant"],
				[("Sea View Room", "Superior", 12, (160m, 140m, 2, 2)), ("Family Suite", "Suite", 4, (240m, null, 4, 2))],
				5),

			new("Bosphorus View Hotel", "Istanbul", "Hotel",
				"Modern hotel overlooking the Bosphorus, minutes from Istanbul's old city.",
				["Wi-Fi", "Restaurant", "Airport Shuttle"],
				[("Standard Room", "Standard", 10, (70m, null, 2, 0)), ("Deluxe Room", "Deluxe", 6, (115m, 95m, 2, 1))],
				3),

			new("Dubai Marina Towers", "Dubai", "Resort",
				"Luxury high-rise resort in Dubai Marina with skyline and sea views.",
				["Pool", "Spa", "Gym", "Air Conditioning", "Airport Shuttle"],
				[("Deluxe Room", "Deluxe", 8, (220m, null, 2, 1)), ("Executive Suite", "Suite", 3, (380m, 340m, 2, 2))],
				5),

			new("Bangkok Riverside Hostel", "Bangkok", "Hostel",
				"Budget-friendly hostel on the Chao Phraya riverside, popular with backpackers.",
				["Wi-Fi", "Air Conditioning"],
				[("Economy Room", "Economy", 15, (25m, null, 1, 0)), ("Standard Room", "Standard", 8, (40m, 35m, 2, 0))],
				1),

			new("Santorini Cliffside Villas", "Santorini", "Villa",
				"Whitewashed cliffside villas overlooking the Aegean Sea and caldera sunsets.",
				["Pool", "Beach Access", "Wi-Fi", "Spa"],
				[("Caldera View Villa", "Deluxe", 4, (280m, 250m, 2, 2)), ("Honeymoon Suite", "Suite", 2, (350m, null, 2, 0))],
				5),

			new("Dubrovnik Old City Hotel", "Dubrovnik", "Hotel",
				"Historic hotel within Dubrovnik's ancient city walls, near the Adriatic coast.",
				["Wi-Fi", "Restaurant", "Air Conditioning"],
				[("Standard Room", "Standard", 9, (90m, null, 2, 0)), ("Superior Room", "Superior", 5, (130m, 115m, 2, 1))],
				4),

			// A second hotel in each city that already had one, plus first hotels for every
			// remaining seeded city, so the catalog has believable depth everywhere.
			new("Podil Riverside Hotel", "Kyiv", "Hotel",
				"Riverside hotel in Kyiv's historic Podil district.",
				["Wi-Fi", "Restaurant", "Parking"],
				[("Standard Room", "Standard", 10, (50m, null, 2, 0)), ("Superior Room", "Superior", 5, (75m, 65m, 2, 1))],
				3),

			new("Rynok Square Apartments", "Lviv", "Apartment",
				"Cozy apartments overlooking Lviv's Rynok Square.",
				["Wi-Fi", "Air Conditioning"],
				[("Studio", "Standard", 6, (45m, null, 2, 0)), ("One-Bedroom Suite", "Suite", 3, (70m, 60m, 2, 1))],
				3),

			new("Montmartre Charm Hotel", "Paris", "Hotel",
				"Romantic hotel near Sacré-Cœur in artistic Montmartre.",
				["Wi-Fi", "Restaurant"],
				[("Standard Room", "Standard", 8, (130m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (190m, 165m, 2, 1))],
				4),

			new("Trastevere Boutique Hotel", "Rome", "Hotel",
				"Boutique hotel in Rome's bohemian Trastevere neighborhood.",
				["Wi-Fi", "Restaurant", "Air Conditioning"],
				[("Standard Room", "Standard", 8, (110m, null, 2, 0)), ("Superior Room", "Superior", 5, (160m, 140m, 2, 1))],
				4),

			new("Gothic Quarter Hostel", "Barcelona", "Hostel",
				"Lively hostel in Barcelona's Gothic Quarter.",
				["Wi-Fi", "Air Conditioning"],
				[("Economy Room", "Economy", 14, (28m, null, 1, 0)), ("Standard Room", "Standard", 6, (40m, null, 2, 0))],
				2),

			new("Sultanahmet Heritage Hotel", "Istanbul", "Hotel",
				"Ottoman-era hotel steps from the Hagia Sophia and Blue Mosque.",
				["Wi-Fi", "Restaurant", "Air Conditioning"],
				[("Standard Room", "Standard", 9, (85m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (135m, 115m, 2, 1))],
				4),

			new("Downtown Dubai Suites", "Dubai", "Apartment",
				"Modern serviced apartments near the Burj Khalifa and Dubai Mall.",
				["Pool", "Gym", "Air Conditioning"],
				[("Studio", "Standard", 6, (160m, null, 2, 0)), ("One-Bedroom Suite", "Suite", 3, (240m, 210m, 2, 1))],
				4),

			new("Sukhumvit Skyline Hotel", "Bangkok", "Hotel",
				"High-rise hotel on Sukhumvit with skyline views and BTS access.",
				["Pool", "Gym", "Restaurant", "Air Conditioning"],
				[("Superior Room", "Superior", 10, (55m, null, 2, 0)), ("Deluxe Room", "Deluxe", 5, (85m, 70m, 2, 1))],
				4),

			new("Fira Sunset Suites", "Santorini", "Villa",
				"Cliffside suites in Fira with unobstructed caldera sunset views.",
				["Pool", "Wi-Fi", "Spa"],
				[("Caldera Suite", "Deluxe", 4, (260m, null, 2, 1)), ("Honeymoon Suite", "Suite", 2, (330m, 290m, 2, 0))],
				5),

			new("Lapad Bay Resort", "Dubrovnik", "Resort",
				"Family-friendly resort on Dubrovnik's Lapad Bay beach.",
				["Pool", "Beach Access", "Restaurant"],
				[("Sea View Room", "Superior", 10, (110m, null, 2, 1)), ("Family Suite", "Suite", 4, (175m, 155m, 4, 2))],
				4),

			new("Odesa Seaside Hotel", "Odesa", "Hotel",
				"Seaside hotel near Odesa's historic Potemkin Stairs and beaches.",
				["Wi-Fi", "Beach Access", "Restaurant"],
				[("Standard Room", "Standard", 9, (55m, null, 2, 0)), ("Superior Room", "Superior", 5, (85m, 70m, 2, 1))],
				4),

			new("Deribasivska Boutique Hostel", "Odesa", "Hostel",
				"Cozy hostel just off Odesa's lively Deribasivska Street.",
				["Wi-Fi", "Air Conditioning"],
				[("Economy Room", "Economy", 12, (20m, null, 1, 0)), ("Standard Room", "Standard", 6, (30m, null, 2, 0))],
				2),

			new("Kharkiv City Center Hotel", "Kharkiv", "Hotel",
				"Business-friendly hotel in downtown Kharkiv, close to Freedom Square.",
				["Wi-Fi", "Parking", "Restaurant"],
				[("Standard Room", "Standard", 10, (45m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (75m, 65m, 2, 1))],
				3),

			new("Promenade des Anglais Hotel", "Nice", "Hotel",
				"Elegant hotel along Nice's famous Promenade des Anglais, steps from the beach.",
				["Wi-Fi", "Beach Access", "Restaurant", "Air Conditioning"],
				[("Superior Room", "Superior", 8, (150m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (210m, 185m, 2, 1))],
				4),

			new("Nice Old Town Apartments", "Nice", "Apartment",
				"Charming self-catering apartments in Nice's Old Town.",
				["Wi-Fi", "Air Conditioning"],
				[("Studio", "Standard", 6, (95m, null, 2, 0)), ("One-Bedroom Suite", "Suite", 3, (140m, 120m, 2, 1))],
				3),

			new("Lyon Presqu'île Hotel", "Lyon", "Hotel",
				"Central hotel between Lyon's two rivers, near Place Bellecour.",
				["Wi-Fi", "Restaurant", "Parking"],
				[("Standard Room", "Standard", 9, (90m, null, 2, 0)), ("Superior Room", "Superior", 4, (130m, 110m, 2, 1))],
				3),

			new("Milano Fashion District Hotel", "Milan", "Hotel",
				"Chic hotel in Milan's fashion district, near the Duomo.",
				["Wi-Fi", "Gym", "Restaurant"],
				[("Superior Room", "Superior", 8, (140m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (210m, 180m, 2, 1))],
				4),

			new("Navigli Loft Apartments", "Milan", "Apartment",
				"Trendy loft apartments along Milan's Navigli canals.",
				["Wi-Fi", "Air Conditioning"],
				[("Studio", "Standard", 6, (100m, null, 2, 0)), ("One-Bedroom Suite", "Suite", 3, (150m, 130m, 2, 1))],
				3),

			new("Canal Grande Palazzo Hotel", "Venice", "Hotel",
				"Historic palazzo hotel with views over the Grand Canal.",
				["Wi-Fi", "Restaurant", "Air Conditioning"],
				[("Superior Room", "Superior", 6, (220m, null, 2, 0)), ("Suite", "Suite", 3, (350m, 300m, 2, 1))],
				5),

			new("Florence Duomo View Hotel", "Florence", "Hotel",
				"Boutique hotel with rooftop views of the Florence Duomo.",
				["Wi-Fi", "Restaurant"],
				[("Standard Room", "Standard", 8, (120m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (180m, 160m, 2, 1))],
				4),

			new("Gran Via Madrid Hotel", "Madrid", "Hotel",
				"Modern hotel on Madrid's Gran Vía, close to nightlife and shopping.",
				["Wi-Fi", "Gym", "Restaurant", "Air Conditioning"],
				[("Superior Room", "Superior", 9, (110m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (165m, 140m, 2, 1))],
				4),

			new("Retiro Park Apartments", "Madrid", "Apartment",
				"Quiet apartments near Madrid's Retiro Park.",
				["Wi-Fi", "Air Conditioning"],
				[("Studio", "Standard", 6, (80m, null, 2, 0)), ("One-Bedroom Suite", "Suite", 3, (120m, 100m, 2, 1))],
				3),

			new("Valencia Beach Resort", "Valencia", "Resort",
				"Beachfront resort near Valencia's City of Arts and Sciences.",
				["Pool", "Beach Access", "Restaurant", "Spa"],
				[("Sea View Room", "Superior", 10, (130m, null, 2, 1)), ("Family Suite", "Suite", 4, (200m, null, 4, 2))],
				4),

			new("Antalya All-Inclusive Resort", "Antalya", "Resort",
				"All-inclusive beach resort on the Turkish Riviera.",
				["Pool", "Beach Access", "Spa", "Restaurant", "Gym"],
				[("Deluxe Room", "Deluxe", 12, (140m, 120m, 2, 1)), ("Suite", "Suite", 4, (220m, null, 4, 2))],
				5),

			new("Kaleici Old Town Hotel", "Antalya", "Hotel",
				"Boutique hotel in Antalya's historic Kaleiçi old town.",
				["Wi-Fi", "Restaurant"],
				[("Standard Room", "Standard", 8, (60m, null, 2, 0)), ("Superior Room", "Superior", 4, (90m, 75m, 2, 1))],
				3),

			new("Bodrum Marina Villas", "Bodrum", "Villa",
				"Private villas overlooking Bodrum's yacht marina.",
				["Pool", "Beach Access", "Wi-Fi"],
				[("Villa Suite", "Deluxe", 5, (260m, null, 2, 1)), ("Honeymoon Villa", "Suite", 2, (320m, 280m, 2, 0))],
				5),

			new("Corniche Abu Dhabi Hotel", "Abu Dhabi", "Hotel",
				"Waterfront hotel along Abu Dhabi's Corniche promenade.",
				["Pool", "Gym", "Restaurant", "Air Conditioning"],
				[("Deluxe Room", "Deluxe", 8, (200m, null, 2, 1)), ("Executive Suite", "Suite", 3, (340m, 300m, 2, 2))],
				5),

			new("Patong Beach Resort", "Phuket", "Resort",
				"Beachfront resort steps from Phuket's Patong Beach nightlife.",
				["Pool", "Beach Access", "Spa", "Restaurant"],
				[("Sea View Room", "Superior", 10, (95m, null, 2, 1)), ("Family Suite", "Suite", 4, (160m, 140m, 4, 2))],
				4),

			new("Phuket Old Town Hostel", "Phuket", "Hostel",
				"Backpacker hostel in colorful Phuket Old Town.",
				["Wi-Fi", "Air Conditioning"],
				[("Economy Room", "Economy", 14, (18m, null, 1, 0)), ("Standard Room", "Standard", 6, (28m, null, 2, 0))],
				2),

			new("Chiang Mai Riverside Hotel", "Chiang Mai", "Hotel",
				"Peaceful hotel on the Ping River, near Chiang Mai's Old City temples.",
				["Wi-Fi", "Pool", "Restaurant"],
				[("Standard Room", "Standard", 9, (35m, null, 2, 0)), ("Superior Room", "Superior", 4, (55m, 45m, 2, 1))],
				3),

			new("Mitte Central Hotel", "Berlin", "Hotel",
				"Modern hotel in Berlin-Mitte, near Museum Island and Alexanderplatz.",
				["Wi-Fi", "Gym", "Restaurant"],
				[("Superior Room", "Superior", 9, (105m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (155m, 135m, 2, 1))],
				4),

			new("Kreuzberg Loft Apartments", "Berlin", "Apartment",
				"Industrial-chic apartments in Berlin's Kreuzberg district.",
				["Wi-Fi", "Air Conditioning", "Pet Friendly"],
				[("Studio", "Standard", 6, (75m, null, 2, 0)), ("One-Bedroom Suite", "Suite", 3, (110m, 95m, 2, 1))],
				3),

			new("Marienplatz Hotel", "Munich", "Hotel",
				"Traditional Bavarian hotel steps from Munich's Marienplatz.",
				["Wi-Fi", "Restaurant", "Parking"],
				[("Standard Room", "Standard", 8, (115m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (170m, 150m, 2, 1))],
				4),

			new("Acropolis View Hotel", "Athens", "Hotel",
				"Rooftop hotel with panoramic views of the Acropolis.",
				["Wi-Fi", "Restaurant", "Air Conditioning"],
				[("Superior Room", "Superior", 8, (100m, null, 2, 0)), ("Deluxe Room", "Deluxe", 4, (150m, 130m, 2, 1))],
				4),

			new("Plaka Boutique Hostel", "Athens", "Hostel",
				"Friendly hostel in Athens' historic Plaka neighborhood.",
				["Wi-Fi", "Air Conditioning"],
				[("Economy Room", "Economy", 12, (22m, null, 1, 0)), ("Standard Room", "Standard", 6, (32m, null, 2, 0))],
				2),

			new("Diocletian's Palace Hotel", "Split", "Hotel",
				"Historic hotel within the walls of Split's Diocletian's Palace.",
				["Wi-Fi", "Restaurant", "Air Conditioning"],
				[("Standard Room", "Standard", 8, (95m, null, 2, 0)), ("Superior Room", "Superior", 4, (135m, 115m, 2, 1))],
				4),
		];

		var realtor = await userManager.FindByEmailAsync("realtor@booking.test")
			?? throw new Exception("Test realtor must be seeded before additional hotels.");

		foreach (var spec in specs)
		{
			var existingHotel = await context.Hotels.FirstOrDefaultAsync(h => h.Name == spec.HotelName, ct);
			if (existingHotel is not null)
			{
				await RefreshSeededHotelPhotosAsync(existingHotel.Id, ct);
				continue;
			}

			var city = await context.Cities.FirstAsync(c => c.Name == spec.CityName, ct);
			var category = await context.HotelCategories.FirstAsync(c => c.Name == spec.CategoryName, ct);

			var address = new Address
			{
				Street = $"{spec.CityName} Central Street",
				HouseNumber = "1",
				CityId = city.Id,
				Latitude = city.Latitude,
				Longitude = city.Longitude
			};
			await context.Addresses.AddAsync(address, ct);
			await context.SaveChangesAsync(ct);

			var hotel = new Hotel
			{
				Name = spec.HotelName,
				Description = spec.Description,
				ArrivalTimeUtcFrom = new DateTimeOffset(2000, 1, 1, 14, 0, 0, TimeSpan.Zero),
				ArrivalTimeUtcTo = new DateTimeOffset(2000, 1, 1, 22, 0, 0, TimeSpan.Zero),
				DepartureTimeUtcFrom = new DateTimeOffset(2000, 1, 1, 7, 0, 0, TimeSpan.Zero),
				DepartureTimeUtcTo = new DateTimeOffset(2000, 1, 1, 12, 0, 0, TimeSpan.Zero),
				IsArchived = false,
				AddressId = address.Id,
				HotelCategoryId = category.Id,
				RealtorId = realtor.Id,
				StarRating = spec.StarRating
			};
			await context.Hotels.AddAsync(hotel, ct);
			await context.SaveChangesAsync(ct);

			foreach (var amenityName in spec.AmenityNames)
			{
				var amenity = await context.HotelAmenities.FirstAsync(a => a.Name == amenityName, ct);
				await context.HotelHotelAmenities.AddAsync(new HotelHotelAmenity { HotelId = hotel.Id, HotelAmenityId = amenity.Id }, ct);
			}
			await context.SaveChangesAsync(ct);

			foreach (var roomSpec in spec.Rooms)
			{
				var roomType = await context.RoomTypes.FirstAsync(rt => rt.Name == roomSpec.RoomTypeName, ct);
				var room = new Room
				{
					Name = roomSpec.RoomName,
					Area = 20,
					NumberOfRooms = 1,
					Quantity = roomSpec.Quantity,
					HotelId = hotel.Id,
					RoomTypeId = roomType.Id
				};
				await context.Rooms.AddAsync(room, ct);
				await context.SaveChangesAsync(ct);

				var (price, discountPrice, adults, children) = roomSpec.Variant;
				await context.RoomVariants.AddAsync(new RoomVariant
				{
					Price = price,
					DiscountPrice = discountPrice,
					RoomId = room.Id,
					GuestInfo = new GuestInfo { AdultCount = adults, ChildCount = children },
					BedInfo = new BedInfo { DoubleBedCount = 1 }
				}, ct);
			}
			await context.SaveChangesAsync(ct);

			await context.HotelPhotos.AddRangeAsync(BuildPhotos(hotel.Id), ct);
			await context.SaveChangesAsync(ct);
		}
	}
}
