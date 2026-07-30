using Application.Features.Bookings.Commands.CreateBooking;
using Application.Features.Bookings.Events;
using Application.Interfaces;
using FluentAssertions;
using Infrastructure.Repositories;
using MediatR;
using Moq;
using Tests.Fixtures;
using Tests.Helpers;

namespace Tests.Bookings;

[Collection("Database")]
public class CreateBookingHandlerTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private Infrastructure.Data.AppDbContext _ctx = null!;
    private Mock<IPublisher> _publisher = null!;

    public async Task InitializeAsync()
    {
        _ctx = fixture.CreateContext();
        _publisher = new Mock<IPublisher>();
    }
    
    public async Task DisposeAsync() => await _ctx.DisposeAsync();

    [Fact]
    public async Task Handle_ValidCommand_CreatesBooking()
    {
        var (customer, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new BookingRepository(_ctx);
        var handler = new CreateBookingHandler(repo, new RoomVariantRepository(_ctx), new RoomRepository(_ctx), new HotelBreakfastRepository(_ctx), _publisher.Object);

        var command = new CreateBookingCommand(
            CustomerId: customer.Id,
            RoomVariantId: variant.Id,
            Quantity: 1,
            CheckIn: new DateTime(2027, 5, 10),
            CheckOut: new DateTime(2027, 5, 15),
            TotalPrice: 500m,
            PersonalWishes: null
        );

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_ValidCommand_PublishesBookingCreatedEvent()
    {
        var (customer, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new BookingRepository(_ctx);
        var handler = new CreateBookingHandler(repo, new RoomVariantRepository(_ctx), new RoomRepository(_ctx), new HotelBreakfastRepository(_ctx), _publisher.Object);

        var command = new CreateBookingCommand(
            CustomerId: customer.Id,
            RoomVariantId: variant.Id,
            Quantity: 1,
            CheckIn: new DateTime(2027, 5, 10),
            CheckOut: new DateTime(2027, 5, 15),
            TotalPrice: 500m,
            PersonalWishes: null
        );

        var result = await handler.Handle(command, CancellationToken.None);

        _publisher.Verify(p => p.Publish(
            It.Is<BookingCreatedEvent>(e => e.BookingId == result.Value!.Id),
            It.IsAny<CancellationToken>()), Times.Once);
    }
    
    [Fact]
    public async Task Handle_CheckOutBeforeCheckIn_ReturnsValidationError()
    {
        var (customer, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new BookingRepository(_ctx);
        var handler = new CreateBookingHandler(repo, new RoomVariantRepository(_ctx), new RoomRepository(_ctx), new HotelBreakfastRepository(_ctx), _publisher.Object);

        var command = new CreateBookingCommand(
            CustomerId: customer.Id,
            RoomVariantId: variant.Id,
            Quantity: 1,
            CheckIn: new DateTime(2027, 6, 15),
            CheckOut: new DateTime(2027, 6, 10),
            TotalPrice: 500m,
            PersonalWishes: null
        );

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Validation");
        _publisher.Verify(p => p.Publish(It.IsAny<BookingCreatedEvent>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_RoomAlreadyBooked_ReturnsConflictError()
    {
        var (customer, variant) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new BookingRepository(_ctx);

        await SeedHelper.SeedBookingAsync(_ctx, customer.Id, variant.Id,
            new DateOnly(2027, 7, 10),
            new DateOnly(2027, 7, 20));

        var handler = new CreateBookingHandler(repo, new RoomVariantRepository(_ctx), new RoomRepository(_ctx), new HotelBreakfastRepository(_ctx), _publisher.Object);

        var command = new CreateBookingCommand(
            CustomerId: customer.Id,
            RoomVariantId: variant.Id,
            Quantity: 1,
            CheckIn: new DateTime(2027, 7, 12),
            CheckOut: new DateTime(2027, 7, 18),
            TotalPrice: 500m,
            PersonalWishes: null
        );

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Conflict");
    }
}
