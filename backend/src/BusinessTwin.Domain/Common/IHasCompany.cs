namespace BusinessTwin.Domain.Common;

/// <summary>
/// Marks an entity as tenant-isolated belonging to a specific Company.
/// Enforces EF Core Global Query Filter for complete data isolation.
/// </summary>
public interface IHasCompany
{
    Guid CompanyId { get; set; }
}
