using API.Common;
using Application.Features.AdminStats.Queries.GetAdminStats;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = Roles.Admin)]
public class AdminStatsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int days = 30, [FromQuery] int topHotelsCount = 5, CancellationToken ct = default)
        => (await mediator.Send(new GetAdminStatsQuery(days, topHotelsCount), ct)).ToActionResult();
}
