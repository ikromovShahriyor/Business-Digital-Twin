using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Application.DTOs;
using BusinessTwin.Domain.Entities;
using BusinessTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BusinessTwin.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken, string? ipAddress, CancellationToken cancellationToken = default);
    Task<AuthResponse> SwitchCompanyAsync(Guid newCompanyId, string? ipAddress, CancellationToken cancellationToken = default);
    Task<UserDto> GetCurrentUserAsync(CancellationToken cancellationToken = default);
}

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICurrentTenantService _tenantService;

    public AuthService(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        ICurrentTenantService tenantService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _tenantService = tenantService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var existingUser = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email address already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 11);

        var user = new User
        {
            Email = request.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PreferredLanguage = "en",
            IsActive = true,
            LastLoginAtUtc = DateTime.UtcNow
        };

        var company = new Company
        {
            Name = request.CompanyName.Trim(),
            Currency = string.IsNullOrWhiteSpace(request.Currency) ? "USD" : request.Currency.ToUpper(),
            TaxNumber = $"TAX-{Random.Shared.Next(100000, 999999)}",
            IsActive = true
        };

        var role = new UserCompanyRole
        {
            User = user,
            Company = company,
            Role = UserRole.Owner
        };

        // Create Default Main Branch for the company
        var mainBranch = new Branch
        {
            Company = company,
            Name = "Headquarters / Main Branch",
            Code = "HQ-01",
            IsMainBranch = true,
            IsActive = true
        };

        // Create Welcome Notification
        var welcomeNotif = new Notification
        {
            Company = company,
            UserId = user.Id,
            Type = NotificationType.System,
            Title = "Welcome to Business Digital Twin",
            Message = "Your digital twin workspace has been initialized. Explore the Digital Twin canvas and start running scenario simulations!",
            LinkUrl = "/digital-twin"
        };

        _context.Companies.Add(company);
        _context.Users.Add(user);
        _context.UserCompanyRoles.Add(role);
        _context.Branches.Add(mainBranch);
        _context.Notifications.Add(welcomeNotif);

        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress);
        _context.RefreshTokens.Add(refreshToken);

        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user, company.Id, UserRole.Owner);

        return new AuthResponse(
            AccessToken: accessToken,
            RefreshToken: refreshToken.Token,
            ExpiresAtUtc: DateTime.UtcNow.AddMinutes(60),
            User: new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.PreferredLanguage, UserRole.Owner),
            CurrentCompany: new CompanyDto(company.Id, company.Name, company.TaxNumber, company.Industry, company.Currency, company.DefaultTaxRate, company.Address, company.Phone, company.Email, company.Website),
            AvailableCompanies: new List<CompanySummaryDto>
            {
                new(company.Id, company.Name, UserRole.Owner, company.Currency)
            }
        );
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .IgnoreQueryFilters()
            .Include(u => u.CompanyRoles)
                .ThenInclude(r => r.Company)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && !u.IsDeleted, cancellationToken);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("This user account is inactive.");
        }

        var activeRole = user.CompanyRoles.FirstOrDefault(r => !r.IsDeleted && r.Company.IsActive);
        if (activeRole == null)
        {
            throw new UnauthorizedAccessException("No active company workspace found for this user.");
        }

        user.LastLoginAtUtc = DateTime.UtcNow;
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress);
        _context.RefreshTokens.Add(refreshToken);

        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user, activeRole.CompanyId, activeRole.Role);

        var available = user.CompanyRoles
            .Where(r => !r.IsDeleted && r.Company.IsActive)
            .Select(r => new CompanySummaryDto(r.CompanyId, r.Company.Name, r.Role, r.Company.Currency))
            .ToList();

        var currentComp = activeRole.Company;

        return new AuthResponse(
            AccessToken: accessToken,
            RefreshToken: refreshToken.Token,
            ExpiresAtUtc: DateTime.UtcNow.AddMinutes(60),
            User: new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.PreferredLanguage, activeRole.Role),
            CurrentCompany: new CompanyDto(currentComp.Id, currentComp.Name, currentComp.TaxNumber, currentComp.Industry, currentComp.Currency, currentComp.DefaultTaxRate, currentComp.Address, currentComp.Phone, currentComp.Email, currentComp.Website),
            AvailableCompanies: available
        );
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var tokenEntity = await _context.RefreshTokens
            .IgnoreQueryFilters()
            .Include(t => t.User)
                .ThenInclude(u => u.CompanyRoles)
                    .ThenInclude(r => r.Company)
            .FirstOrDefaultAsync(t => t.Token == refreshToken, cancellationToken);

        if (tokenEntity == null || !tokenEntity.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var user = tokenEntity.User;
        var activeRole = user.CompanyRoles.FirstOrDefault(r => !r.IsDeleted && r.Company.IsActive);
        if (activeRole == null)
        {
            throw new UnauthorizedAccessException("No active company workspace found.");
        }

        tokenEntity.RevokedAtUtc = DateTime.UtcNow;
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress);
        tokenEntity.ReplacedByToken = newRefreshToken.Token;
        _context.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync(cancellationToken);

        var newAccessToken = _jwtTokenService.GenerateAccessToken(user, activeRole.CompanyId, activeRole.Role);

        var available = user.CompanyRoles
            .Where(r => !r.IsDeleted && r.Company.IsActive)
            .Select(r => new CompanySummaryDto(r.CompanyId, r.Company.Name, r.Role, r.Company.Currency))
            .ToList();

        var currentComp = activeRole.Company;

        return new AuthResponse(
            AccessToken: newAccessToken,
            RefreshToken: newRefreshToken.Token,
            ExpiresAtUtc: DateTime.UtcNow.AddMinutes(60),
            User: new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.PreferredLanguage, activeRole.Role),
            CurrentCompany: new CompanyDto(currentComp.Id, currentComp.Name, currentComp.TaxNumber, currentComp.Industry, currentComp.Currency, currentComp.DefaultTaxRate, currentComp.Address, currentComp.Phone, currentComp.Email, currentComp.Website),
            AvailableCompanies: available
        );
    }

    public async Task<AuthResponse> SwitchCompanyAsync(Guid newCompanyId, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var userId = _tenantService.UserId ?? throw new UnauthorizedAccessException("User not authenticated.");

        var userRole = await _context.UserCompanyRoles
            .IgnoreQueryFilters()
            .Include(r => r.User)
            .Include(r => r.Company)
            .FirstOrDefaultAsync(r => r.UserId == userId && r.CompanyId == newCompanyId && !r.IsDeleted && r.Company.IsActive, cancellationToken);

        if (userRole == null)
        {
            throw new UnauthorizedAccessException("You do not have access to this company workspace.");
        }

        var newAccessToken = _jwtTokenService.GenerateAccessToken(userRole.User, userRole.CompanyId, userRole.Role);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken(userRole.User.Id, ipAddress);
        _context.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync(cancellationToken);

        var allRoles = await _context.UserCompanyRoles
            .IgnoreQueryFilters()
            .Include(r => r.Company)
            .Where(r => r.UserId == userId && !r.IsDeleted && r.Company.IsActive)
            .Select(r => new CompanySummaryDto(r.CompanyId, r.Company.Name, r.Role, r.Company.Currency))
            .ToListAsync(cancellationToken);

        var comp = userRole.Company;

        return new AuthResponse(
            AccessToken: newAccessToken,
            RefreshToken: newRefreshToken.Token,
            ExpiresAtUtc: DateTime.UtcNow.AddMinutes(60),
            User: new UserDto(userRole.User.Id, userRole.User.Email, userRole.User.FirstName, userRole.User.LastName, userRole.User.Phone, userRole.User.PreferredLanguage, userRole.Role),
            CurrentCompany: new CompanyDto(comp.Id, comp.Name, comp.TaxNumber, comp.Industry, comp.Currency, comp.DefaultTaxRate, comp.Address, comp.Phone, comp.Email, comp.Website),
            AvailableCompanies: allRoles
        );
    }

    public async Task<UserDto> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        var userId = _tenantService.UserId ?? throw new UnauthorizedAccessException("Not authenticated.");
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        return new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.PreferredLanguage, _tenantService.Role ?? UserRole.Viewer);
    }
}
