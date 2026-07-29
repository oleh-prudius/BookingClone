using Domain.Entities;
using Domain.Entities.Identity;
using RefreshToken = Domain.Entities.Identity.RefreshToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<
        AppUser,
        AppRole,
        long,
        IdentityUserClaim<long>,
        AppUserRole,
        IdentityUserLogin<long>,
        IdentityRoleClaim<long>,
        IdentityUserToken<long>
    >(options)
{
    //public DbSet<Hotel> Hotels => Set<Hotel>();
    //public DbSet<Booking> Bookings => Set<Booking>();

    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Realtor> Realtors { get; set; } = null!;
    public DbSet<Admin> Admins { get; set; } = null!;

    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<Address> Addresses { get; set; } = null!;
    public DbSet<Hotel> Hotels { get; set; } = null!;
    public DbSet<HotelCategory> HotelCategories { get; set; } = null!;
    public DbSet<HotelAmenity> HotelAmenities { get; set; } = null!;
    public DbSet<HotelHotelAmenity> HotelHotelAmenities { get; set; } = null!;
    public DbSet<Breakfast> Breakfasts { get; set; } = null!;
    public DbSet<HotelBreakfast> HotelBreakfasts { get; set; } = null!;
    public DbSet<Language> Languages { get; set; } = null!;
    public DbSet<HotelStaffLanguage> HotelStaffLanguages { get; set; } = null!;
    public DbSet<HotelPhoto> HotelPhotos { get; set; } = null!;
    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<RoomType> RoomTypes { get; set; } = null!;
    public DbSet<RentalPeriod> RentalPeriods { get; set; } = null!;
    public DbSet<RoomRentalPeriod> RoomRentalPeriods { get; set; } = null!;
    public DbSet<RoomAmenity> RoomAmenities { get; set; } = null!;
    public DbSet<RoomRoomAmenity> RoomRoomAmenities { get; set; } = null!;
    public DbSet<RoomVariant> RoomVariants { get; set; } = null!;
    public DbSet<GuestInfo> GuestInfos { get; set; } = null!;
    public DbSet<BedInfo> BedInfos { get; set; } = null!;
    public DbSet<RealtorReview> RealtorReviews { get; set; } = null!;
    public DbSet<Chat> Chats { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<Citizenship> Citizenships { get; set; } = null!;
    public DbSet<Gender> Genders { get; set; } = null!;
    public DbSet<BankCard> BankCards { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<BookingRoomVariant> BookingRoomVariants { get; set; } = null!;
    public DbSet<BookingBreakfast> BookingBreakfasts { get; set; } = null!;
    public DbSet<BookingBedSelection> BookingBedSelections { get; set; } = null!;
    public DbSet<HotelReview> HotelReviews { get; set; } = null!;
    public DbSet<FavoriteHotel> FavoriteHotels { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Place> Places { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

       
    }
}
