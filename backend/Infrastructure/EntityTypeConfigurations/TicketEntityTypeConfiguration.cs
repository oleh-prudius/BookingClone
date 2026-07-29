using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.EntityTypeConfigurations;

internal class TicketEntityTypeConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.ToTable("Tickets");

        builder.HasIndex(t => t.TransportRouteId);
        builder.HasIndex(t => t.CustomerId);

        builder.HasOne(t => t.TransportRoute)
            .WithMany(r => r.Tickets)
            .HasForeignKey(t => t.TransportRouteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
