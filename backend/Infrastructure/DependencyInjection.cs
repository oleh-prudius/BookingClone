using Application.Interfaces;
using Domain.Entities;
using Domain.Entities.Identity;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Infrastructure.Storage;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.EnableRetryOnFailure()
            ));

        services
            .AddIdentity<AppUser, AppRole>(options =>
            {
                options.Stores.MaxLengthForKeys = 128;

                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        services.AddScoped<IHotelRepository, HotelRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IFavoriteHotelRepository, FavoriteHotelRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IPlaceRepository, PlaceRepository>();
        services.AddScoped<IHotelBreakfastRepository, HotelBreakfastRepository>();
        services.AddScoped<ITransportRouteRepository, TransportRouteRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IBankCardRepository, BankCardRepository>();
        services.AddScoped<IChatRepository, ChatRepository>();
        services.AddScoped<IHotelPhotoRepository, HotelPhotoRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IRoomVariantRepository, RoomVariantRepository>();
        services.AddScoped<ICityRepository, CityRepository>();
        services.AddScoped<ICountryRepository, CountryRepository>();
        services.AddScoped<IAddressRepository, AddressRepository>();
        services.AddScoped<IHotelReviewRepository, HotelReviewRepository>();
        services.AddScoped<IRealtorReviewRepository, RealtorReviewRepository>();
        services.AddScoped<IUserAdminRepository, UserAdminRepository>();
        services.AddScoped<IAdminStatsRepository, AdminStatsRepository>();
        
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.Configure<FileStorageOptions>(configuration.GetSection("FileStorage"));
        var storageProvider = configuration["FileStorage:Provider"] ?? "Local";
        if (storageProvider.Equals("S3", StringComparison.OrdinalIgnoreCase))
            services.AddScoped<IFileStorageService, S3FileStorageService>();
        else
            services.AddScoped<IFileStorageService, LocalFileStorageService>();

        services.AddTransient<IDbInicializer, DbInitializer>();
        services.AddTransient<IScopeCoveredDbInicializer, ScopeCoveredDbInicializer>();

        return services;
    }
}
