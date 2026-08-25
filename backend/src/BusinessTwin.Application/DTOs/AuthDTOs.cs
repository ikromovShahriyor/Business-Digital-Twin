using BusinessTwin.Domain.Enums;

namespace BusinessTwin.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string CompanyName,
    string? Currency = "USD"
);

public record RefreshTokenRequest(string RefreshToken);

public record SwitchCompanyRequest(Guid CompanyId);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAtUtc,
    UserDto User,
    CompanyDto CurrentCompany,
    List<CompanySummaryDto> AvailableCompanies
);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    string PreferredLanguage,
    UserRole Role
);

public record CompanyDto(
    Guid Id,
    string Name,
    string TaxNumber,
    string Industry,
    string Currency,
    decimal DefaultTaxRate,
    string? Address,
    string? Phone,
    string? Email,
    string? Website
);

public record CompanySummaryDto(
    Guid Id,
    string Name,
    UserRole Role,
    string Currency
);
