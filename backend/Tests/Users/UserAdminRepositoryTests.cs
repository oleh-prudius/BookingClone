using Domain.Entities.Identity;
using FluentAssertions;
using Infrastructure.Repositories;
using Tests.Fixtures;
using Tests.Helpers;

namespace Tests.Users;

[Collection("Database")]
public class UserAdminRepositoryTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private Infrastructure.Data.AppDbContext _ctx = null!;

    public async Task InitializeAsync() => _ctx = fixture.CreateContext();
    public async Task DisposeAsync() => await _ctx.DisposeAsync();

    [Fact]
    public async Task GetFiltered_BySearch_ReturnsOnlyMatchingUsers()
    {
        var (customer, _) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new UserAdminRepository(_ctx);

        var (items, _) = await repo.GetFilteredAsync(customer.Email, null, 1, 20);

        items.Should().NotBeEmpty();
        items.Should().AllSatisfy(u => u.User.Email.Should().Be(customer.Email));
    }

    [Fact]
    public async Task GetFiltered_ByRole_ReturnsOnlyUsersInThatRole()
    {
        var (customer, _) = await SeedHelper.SeedBookingChainAsync(_ctx);

        var roleName = $"TestRole_{Guid.NewGuid()}";
        var role = new AppRole { Name = roleName, NormalizedName = roleName.ToUpperInvariant() };
        _ctx.Roles.Add(role);
        await _ctx.SaveChangesAsync();

        _ctx.UserRoles.Add(new AppUserRole { UserId = customer.Id, RoleId = role.Id });
        await _ctx.SaveChangesAsync();

        var repo = new UserAdminRepository(_ctx);

        var (items, _) = await repo.GetFilteredAsync(null, roleName, 1, 20);

        items.Should().ContainSingle(u => u.User.Id == customer.Id);
        items.Should().AllSatisfy(u => u.Role.Should().Be(roleName));
    }

    [Fact]
    public async Task GetById_ExistingUser_ReturnsUserWithRole()
    {
        var (customer, _) = await SeedHelper.SeedBookingChainAsync(_ctx);
        var repo = new UserAdminRepository(_ctx);

        var result = await repo.GetByIdAsync(customer.Id);

        result.Should().NotBeNull();
        result!.User.Email.Should().Be(customer.Email);
    }

    [Fact]
    public async Task GetById_NonExistentUser_ReturnsNull()
    {
        var repo = new UserAdminRepository(_ctx);

        var result = await repo.GetByIdAsync(999_999);

        result.Should().BeNull();
    }
}
