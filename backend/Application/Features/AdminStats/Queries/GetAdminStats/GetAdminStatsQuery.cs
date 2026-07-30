using Application.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.AdminStats.Queries.GetAdminStats;

public record GetAdminStatsQuery(int Days = 30, int TopHotelsCount = 5) : IRequest<Result<AdminStatsDto>>;
