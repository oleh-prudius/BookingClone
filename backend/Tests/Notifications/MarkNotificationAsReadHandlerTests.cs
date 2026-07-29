using Application.Features.Notifications.Commands.MarkNotificationAsRead;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using FluentAssertions;
using Moq;

namespace Tests.Notifications;

public class MarkNotificationAsReadHandlerTests
{
    [Fact]
    public async Task Owner_CanMarkTheirOwnNotificationAsRead()
    {
        var repo = new Mock<INotificationRepository>();
        repo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notification { Id = 1, UserId = 17, Type = "BookingConfirmed", Message = "Test", CreatedAtUtc = DateTimeOffset.UtcNow });

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);

        var handler = new MarkNotificationAsReadHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new MarkNotificationAsReadCommand(1), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        repo.Verify(r => r.MarkAsReadAsync(It.Is<Notification>(n => n.Id == 1), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task NonOwner_CannotMarkAnotherUsersNotificationAsRead()
    {
        var repo = new Mock<INotificationRepository>();
        repo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Notification { Id = 1, UserId = 999, Type = "BookingConfirmed", Message = "Test", CreatedAtUtc = DateTimeOffset.UtcNow });

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);

        var handler = new MarkNotificationAsReadHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new MarkNotificationAsReadCommand(1), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
        repo.Verify(r => r.MarkAsReadAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task NotFound_ReturnsNotFound()
    {
        var repo = new Mock<INotificationRepository>();
        repo.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Notification?)null);

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);

        var handler = new MarkNotificationAsReadHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new MarkNotificationAsReadCommand(99), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("NotFound");
    }
}
