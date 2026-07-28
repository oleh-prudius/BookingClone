using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.EntityTypeConfigurations;

internal class AddressEntityTypeConfiguration : IEntityTypeConfiguration<Address> {
	public void Configure(EntityTypeBuilder<Address> builder) {
		builder.ToTable("Addresses");

		builder.Property(a => a.Street)
			.HasMaxLength(255)
			.IsRequired();

		builder.Property(a => a.HouseNumber)
			.HasMaxLength(20)
			.IsRequired();

		builder.Property(a => a.Floor)
			.IsRequired(false);

		builder.Property(a => a.ApartmentNumber)
			.HasMaxLength(20)
			.IsRequired(false);

		builder.Property(a => a.Latitude)
			.IsRequired(false);

		builder.Property(a => a.Longitude)
			.IsRequired(false);
	}
}
