using Application.Features.Chats.Queries.GetChatById;
using Application.Features.Chats.Queries.GetChatsByCustomerId;
using Application.Features.Chats.Queries.GetChatsByRealtorId;
using Application.Features.Messages.Queries.GetMessagesByChatId;
using Application.Interfaces;
using Domain.Constants;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using FluentAssertions;
using Moq;

namespace Tests.Chats;

public class ChatOwnershipTests
{
    private static Chat MakeChat(long id, long customerId, long realtorId) => new()
    {
        Id = id,
        CustomerId = customerId,
        RealtorId = realtorId
    };

    [Fact]
    public async Task GetById_ByNonParticipant_ReturnsForbidden()
    {
        var repo = new Mock<IChatRepository>();
        repo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(MakeChat(1, 17, 30));

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(999L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetChatByIdHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new GetChatByIdQuery(1), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task GetById_ByParticipant_Succeeds()
    {
        var repo = new Mock<IChatRepository>();
        repo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(MakeChat(1, 17, 30));

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetChatByIdHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new GetChatByIdQuery(1), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task GetByCustomerId_ForAnotherCustomer_ReturnsForbidden()
    {
        var repo = new Mock<IChatRepository>();
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(17L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetChatsByCustomerIdHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new GetChatsByCustomerIdQuery(999), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task GetByRealtorId_ForAnotherRealtor_ReturnsForbidden()
    {
        var repo = new Mock<IChatRepository>();
        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(30L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetChatsByRealtorIdHandler(repo.Object, currentUser.Object);

        var result = await handler.Handle(new GetChatsByRealtorIdQuery(999), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task GetMessagesByChatId_ByNonParticipant_ReturnsForbidden()
    {
        var chatRepo = new Mock<IRepository<Chat>>();
        chatRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(MakeChat(1, 17, 30));

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(999L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetMessagesByChatIdHandler(Mock.Of<IMessageRepository>(), chatRepo.Object, currentUser.Object);

        var result = await handler.Handle(new GetMessagesByChatIdQuery(1), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Forbidden");
    }

    [Fact]
    public async Task GetMessagesByChatId_ByParticipant_Succeeds()
    {
        var chatRepo = new Mock<IRepository<Chat>>();
        chatRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(MakeChat(1, 17, 30));

        var messageRepo = new Mock<IMessageRepository>();
        messageRepo.Setup(r => r.GetByChatIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(new List<Message>());

        var currentUser = new Mock<ICurrentUserService>();
        currentUser.Setup(x => x.GetUserId()).Returns(30L);
        currentUser.Setup(x => x.IsInRole(Roles.Admin)).Returns(false);

        var handler = new GetMessagesByChatIdHandler(messageRepo.Object, chatRepo.Object, currentUser.Object);

        var result = await handler.Handle(new GetMessagesByChatIdQuery(1), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
    }
}
