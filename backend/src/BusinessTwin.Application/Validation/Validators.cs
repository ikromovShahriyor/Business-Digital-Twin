using FluentValidation;
using BusinessTwin.Application.DTOs;

namespace BusinessTwin.Application.Validation;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).WithMessage("Password must be at least 8 characters");
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(100);
    }
}

public class SimulateScenarioRequestValidator : AbstractValidator<SimulateScenarioRequest>
{
    public SimulateScenarioRequestValidator()
    {
        RuleFor(x => x.ScenarioName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PriceChangePercent).InclusiveBetween(-90m, 500m);
        RuleFor(x => x.PriceElasticity).InclusiveBetween(-10m, 5m);
        RuleFor(x => x.ExpectedSalesVolumeChangePercent).InclusiveBetween(-100m, 1000m);
        RuleFor(x => x.EmployeeHeadcountChange).InclusiveBetween(-500, 1000);
        RuleFor(x => x.AverageNewEmployeeSalary).GreaterThanOrEqualTo(0m);
        RuleFor(x => x.ExistingEmployeeSalaryChangePercent).InclusiveBetween(-50m, 200m);
        RuleFor(x => x.NewBranchesCount).InclusiveBetween(0, 50);
        RuleFor(x => x.CapexPerNewBranch).GreaterThanOrEqualTo(0m);
        RuleFor(x => x.MonthlyOpexPerNewBranch).GreaterThanOrEqualTo(0m);
        RuleFor(x => x.MarketingBudgetMonthly).GreaterThanOrEqualTo(0m);
        RuleFor(x => x.ProjectionMonths).InclusiveBetween(1, 36);
    }
}

public class CreateBranchDtoValidator : AbstractValidator<CreateBranchDto>
{
    public CreateBranchDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20);
        RuleFor(x => x.MonthlyRent).GreaterThanOrEqualTo(0m);
    }
}

public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.CostPrice).GreaterThanOrEqualTo(0m);
        RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0m);
        RuleFor(x => x.MinStockThreshold).GreaterThanOrEqualTo(0m);
    }
}

public class CreateCustomerDtoValidator : AbstractValidator<CreateCustomerDto>
{
    public CreateCustomerDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class CreateExpenseDtoValidator : AbstractValidator<CreateExpenseDto>
{
    public CreateExpenseDtoValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0m);
        RuleFor(x => x.Payee).NotEmpty().MaximumLength(150);
    }
}

public class CreateEmployeeDtoValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeDtoValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Position).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MonthlySalary).GreaterThanOrEqualTo(0m);
    }
}
