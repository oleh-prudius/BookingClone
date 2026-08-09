using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.EntityTypeConfigurations;

internal class TransportRouteEntityTypeConfiguration : IEntityTypeConfiguration<TransportRoute>
{
    public void Configure(EntityTypeBuilder<TransportRoute> builder)
    {
        builder.ToTable("TransportRoutes");

        builder.HasIndex(r => new { r.FromCityId, r.ToCityId, r.DepartureUtc });

        builder.Property(r => r.CarrierName).HasMaxLength(120);
        builder.Property(r => r.VehicleModel).HasMaxLength(120);

        builder.HasOne(r => r.FromCity)
            .WithMany()
            .HasForeignKey(r => r.FromCityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ToCity)
            .WithMany()
            .HasForeignKey(r => r.ToCityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
