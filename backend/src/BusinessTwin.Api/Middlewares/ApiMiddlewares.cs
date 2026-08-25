using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Domain.Enums;
using BusinessTwin.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Security.Claims;
using System.Text.Json;

namespace BusinessTwin.Api.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred while processing request: {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (status, title) = exception switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized access"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Requested resource not found"),
            InvalidOperationException => (HttpStatusCode.BadRequest, "Invalid operation"),
            ArgumentException => (HttpStatusCode.BadRequest, "Invalid argument supplied"),
            _ => (HttpStatusCode.InternalServerError, "An unexpected internal error occurred")
        };

        context.Response.StatusCode = (int)status;

        var problemDetails = new ProblemDetails
        {
            Status = (int)status,
            Title = title,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        var json = JsonSerializer.Serialize(problemDetails);
        return context.Response.WriteAsync(json);
    }
}

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentTenantService tenantService)
    {
        var user = context.User;
        if (user.Identity?.IsAuthenticated == true)
        {
            var companyClaim = user.FindFirst("company_id")?.Value;
            var subClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value;
            var emailClaim = user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value;
            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;

            Guid? validCompanyId = null;
            Guid.TryParse(subClaim, out var userId);
            Enum.TryParse<UserRole>(roleClaim, true, out var role);

            // Optional header override
            if (context.Request.Headers.TryGetValue("X-Company-Id", out var headerCompanyId) && Guid.TryParse(headerCompanyId, out var parsedHeaderId))
            {
                validCompanyId = parsedHeaderId;
            }
            else if (Guid.TryParse(companyClaim, out var parsedCompanyId))
            {
                validCompanyId = parsedCompanyId;
            }

            // Verify company exists in database, fallback to first available company if needed
            var db = context.RequestServices.GetService<ApplicationDbContext>();
            if (db != null && userId != Guid.Empty)
            {
                bool companyExists = validCompanyId.HasValue && await db.Companies.IgnoreQueryFilters().AnyAsync(c => c.Id == validCompanyId.Value);
                if (!companyExists)
                {
                    var userRole = await db.UserCompanyRoles.IgnoreQueryFilters()
                        .Include(r => r.Company)
                        .FirstOrDefaultAsync(r => r.UserId == userId && r.Company.IsActive);

                    if (userRole != null)
                    {
                        validCompanyId = userRole.CompanyId;
                        role = userRole.Role;
                    }
                    else
                    {
                        var firstCompany = await db.Companies.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.IsActive);
                        if (firstCompany != null)
                        {
                            validCompanyId = firstCompany.Id;
                        }
                    }
                }
            }

            if (validCompanyId.HasValue)
            {
                tenantService.SetTenant(validCompanyId.Value, userId != Guid.Empty ? userId : null, emailClaim, role);
            }
        }

        await _next(context);
    }
}
