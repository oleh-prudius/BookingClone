using Domain.Entities;
using Domain.Entities.Identity;
using Infrastructure.Data;

namespace Tests.Helpers;

/// <summary>
/// Inserts the minimum chain of entities needed for booking tests:
/// Country → City → Address → HotelCategory → Hotel
/// RoomType → Room → RoomVariant (with GuestInfo + BedInfo)
/// Customer
/// </summary>
public static class SeedHelper
{
    public static async Task<(Customer customer, RoomVariant variant)> SeedBookingChainAsync(AppDbContext ctx)
    {
        var country = new Country { Name = "TestCountry", Image = "flag.svg" };
        ctx.Countries.Add(country);
        await ctx.SaveChangesAsync();

        var city = new City { Name = "TestCity", Image = "city.jpg", Longitude = 0, Latitude = 0, CountryId = country.Id };
        ctx.Cities.Add(city);
        await ctx.SaveChangesAsync();

        var address = new Address { Street = "Main St", HouseNumber = "1", CityId = city.Id };
        ctx.Addresses.Add(address);
        await ctx.SaveChangesAsync();

        var category = new HotelCategory { Name = "Hotel" };
        ctx.HotelCategories.Add(category);
        await ctx.SaveChangesAsync();

        var customerUserName = $"testuser_{Guid.NewGuid()}";
        var customerEmail = $"test_{Guid.NewGuid()}@test.com";
        var customer = new Customer
        {
            FirstName = "Test",
            LastName = "User",
            Email = customerEmail,
            UserName = customerUserName,
            Photo = "default.jpg",
            // Must stay unique per seed: AspNetUsers has a unique index on NormalizedUserName
            NormalizedEmail = customerEmail.ToUpperInvariant(),
            NormalizedUserName = customerUserName.ToUpperInvariant(),
            SecurityStamp = Guid.NewGuid().ToString()
        };
        ctx.Customers.Add(customer);
        await ctx.SaveChangesAsync();

        var realtorUserName = $"realtor_{Guid.NewGuid()}";
        var realtorEmail = $"realtor_{Guid.NewGuid()}@test.com";
        var realtor = new Realtor
        {
            FirstName = "Realtor",
            LastName = "Test",
            Email = realtorEmail,
            UserName = realtorUserName,
            Photo = "default.jpg",
            NormalizedEmail = realtorEmail.ToUpperInvariant(),
            NormalizedUserName = realtorUserName.ToUpperInvariant(),
            SecurityStamp = Guid.NewGuid().ToString()
        };
        ctx.Realtors.Add(realtor);
        await ctx.SaveChangesAsync();

        var hotel = new Hotel
        {
            Name = "Test Hotel",
            Description = "Test",
            ArrivalTimeUtcFrom = DateTimeOffset.UtcNow,
            ArrivalTimeUtcTo = DateTimeOffset.UtcNow.AddHours(8),
            DepartureTimeUtcFrom = DateTimeOffset.UtcNow,
            DepartureTimeUtcTo = DateTimeOffset.UtcNow.AddHours(4),
            IsArchived = false,
            AddressId = address.Id,
            HotelCategoryId = category.Id,
            RealtorId = realtor.Id
        };
        ctx.Hotels.Add(hotel);
        await ctx.SaveChangesAsync();

        var roomType = new RoomType { Name = "Standard" };
        ctx.RoomTypes.Add(roomType);
        await ctx.SaveChangesAsync();

        var room = new Room { Name = "Room 101", Area = 25, NumberOfRooms = 1, Quantity = 5, HotelId = hotel.Id, RoomTypeId = roomType.Id };
        ctx.Rooms.Add(room);
        await ctx.SaveChangesAsync();

        var variant = new RoomVariant
        {
            Price = 100m,
            RoomId = room.Id,
            GuestInfo = new GuestInfo { AdultCount = 2, ChildCount = 0 },
            BedInfo = new BedInfo { DoubleBedCount = 1 }
        };
        ctx.RoomVariants.Add(variant);
        await ctx.SaveChangesAsync();

        return (customer, variant);
    }

    public static async Task<Booking> SeedBookingAsync(
        AppDbContext ctx,
        long customerId,
        long roomVariantId,
        DateOnly from,
        DateOnly to)
    {
        var booking = new Booking
        {
            CustomerId = customerId,
            DateFrom = from,
            DateTo = to,
            AmountToPay = 200m,
            EstimatedTimeOfArrivalUtc = DateTimeOffset.UtcNow,
            BookingRoomVariants = new List<BookingRoomVariant>
            {
                new() { RoomVariantId = roomVariantId, Quantity = 1 }
            }
        };
        ctx.Bookings.Add(booking);
        await ctx.SaveChangesAsync();
        return booking;
    }
}
