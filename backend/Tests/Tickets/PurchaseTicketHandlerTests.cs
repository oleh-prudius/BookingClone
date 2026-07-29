using Application.Features.Tickets.Commands.PurchaseTicket;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using FluentAssertions;
using Moq;

namespace Tests.Tickets;

public class PurchaseTicketHandlerTests
{
    private static TransportRoute MakeRoute(int totalSeats = 10, decimal price = 20) => new()
    {
        Id = 1,
        Type = TransportType.Bus,
        FromCityId = 1,
        FromCity = new City { Id = 1, Name = "Kyiv" },
        ToCityId = 2,
        ToCity = new City { Id = 2, Name = "Lviv" },
        DepartureUtc = DateTimeOffset.UtcNow,
        ArrivalUtc = DateTimeOffset.UtcNow.AddHours(6),
        Price = price,
        TotalSeats = totalSeats
    };

    [Fact]
    public async Task Purchase_WithEnoughSeats_Succeeds_AndComputesTotalPrice()
    {
        var routeRepo = new Mock<ITransportRouteRepository>();
        routeRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(MakeRoute());
        routeRepo.Setup(r => r.GetBookedSeatsAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(2);

        var ticketRepo = new Mock<ITicketRepository>();
        ticketRepo.Setup(r => r.AddAsync(It.IsAny<Ticket>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Ticket t, CancellationToken _) => { t.Id = 5; return t; });
        ticketRepo.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Ticket
            {
                Id = 5,
                TransportRoute = MakeRoute(),
                Seats = 3,
                TotalPrice = 60,
                PurchasedAtUtc = DateTimeOffset.UtcNow
            });

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);

        var handler = new PurchaseTicketHandler(routeRepo.Object, ticketRepo.Object, currentUser.Object);

        var result = await handler.Handle(new PurchaseTicketCommand(1, 3), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.TotalPrice.Should().Be(60);
        ticketRepo.Verify(r => r.AddAsync(It.Is<Ticket>(t => t.CustomerId == 17 && t.Seats == 3 && t.TotalPrice == 60), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Purchase_NotEnoughSeats_ReturnsConflict()
    {
        var routeRepo = new Mock<ITransportRouteRepository>();
        routeRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(MakeRoute(totalSeats: 5));
        routeRepo.Setup(r => r.GetBookedSeatsAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(4);

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);

        var handler = new PurchaseTicketHandler(routeRepo.Object, Mock.Of<ITicketRepository>(), currentUser.Object);

        var result = await handler.Handle(new PurchaseTicketCommand(1, 2), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Conflict");
    }

    [Fact]
    public async Task Purchase_RouteNotFound_ReturnsNotFound()
    {
        var routeRepo = new Mock<ITransportRouteRepository>();
        routeRepo.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>())).ReturnsAsync((TransportRoute?)null);

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);

        var handler = new PurchaseTicketHandler(routeRepo.Object, Mock.Of<ITicketRepository>(), currentUser.Object);

        var result = await handler.Handle(new PurchaseTicketCommand(99, 1), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("NotFound");
    }

    [Fact]
    public async Task Purchase_ZeroSeats_ReturnsValidationError()
    {
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);

        var handler = new PurchaseTicketHandler(Mock.Of<ITransportRouteRepository>(), Mock.Of<ITicketRepository>(), currentUser.Object);

        var result = await handler.Handle(new PurchaseTicketCommand(1, 0), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Validation");
    }
}
