using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.EntityTypeConfigurations;

internal class HotelPhotoEntityTypeConfiguration : IEntityTypeConfiguration<HotelPhoto> {
	public void Configure(EntityTypeBuilder<HotelPhoto> builder) {
		builder.ToTable("HotelPhotos");

		builder.Property(hp => hp.Name)
			.HasMaxLength(1000)
			.IsRequired();
	}
}
