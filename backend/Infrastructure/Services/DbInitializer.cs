using Domain.Constants;
using Domain.Entities;
using Infrastructure.Data;
using Domain.Entities.Identity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

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
			Photo = "default.jpg"
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
		await SeedLookupTablesAsync(ct);
		await SeedTestHotelAsync(ct);
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
				Photo     = "default.jpg"
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
			RealtorId             = realtor.Id
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
}
