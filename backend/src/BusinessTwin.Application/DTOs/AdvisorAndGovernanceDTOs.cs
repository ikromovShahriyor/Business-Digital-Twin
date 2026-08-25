using BusinessTwin.Domain.Enums;

namespace BusinessTwin.Application.DTOs;

// Advisor
public record AdvisorChatRequestDto(
    string Message,
    Guid? ActiveScenarioId,
    string? Language = "en" // "en", "uz", "ru"
);

public record AdvisorChatResponseDto(
    string Reply,
    string Engine, // "llm" or "deterministic_reasoner"
    bool GroundedInRealData,
    DateTime RepliedAtUtc
);

public record AdvisorDiagnosticItemDto(
    string Category,
    string Severity,
    string Title,
    string Finding,
    string ActionableRecommendation
);

public record AdvisorAnalysisDto(
    int OverallHealthScore,
    string ExecutiveSummary,
    List<AdvisorDiagnosticItemDto> Diagnostics,
    List<string> RevenueDrivers,
    List<string> CostHotspots,
    List<string> RecommendedScenarios,
    DateTime AnalyzedAtUtc
);

// Audit Logs
public record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string UserEmail,
    string Action,
    string EntityName,
    string? EntityId,
    string? OldValuesJson,
    string? NewValuesJson,
    string? IpAddress,
    DateTime CreatedAtUtc
);

// Notifications
public record NotificationDto(
    Guid Id,
    NotificationType Type,
    string Title,
    string Message,
    string? LinkUrl,
    bool IsRead,
    DateTime CreatedAtUtc
);

// Company Settings
public record CompanySettingDto(
    Guid Id,
    string Key,
    string Value,
    string? Description
);

public record UpdateSettingDto(
    string Key,
    string Value
);
