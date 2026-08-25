using BusinessTwin.Application.DTOs;
using BusinessTwin.Application.Services;
using BusinessTwin.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessTwin.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AdvisorController : ControllerBase
{
    private readonly IAiAdvisorService _advisorService;

    public AdvisorController(IAiAdvisorService advisorService)
    {
        _advisorService = advisorService;
    }

    [HttpGet("diagnostics")]
    public async Task<ActionResult<AdvisorAnalysisDto>> GetDiagnostics([FromQuery] string language = "uz", CancellationToken cancellationToken = default)
    {
        var result = await _advisorService.GetBusinessDiagnosticsAsync(language, cancellationToken);
        return Ok(result);
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AdvisorChatResponseDto>> ChatWithAdvisor([FromBody] AdvisorChatRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _advisorService.ChatWithAdvisorAsync(request, cancellationToken);
        return Ok(response);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public BranchesController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<BranchDto>>> GetBranches(CancellationToken cancellationToken)
    {
        var list = await _service.GetBranchesAsync(cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<BranchDto>> CreateBranch([FromBody] CreateBranchDto dto, CancellationToken cancellationToken)
    {
        var branch = await _service.CreateBranchAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetBranches), new { id = branch.Id }, branch);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BranchDto>> UpdateBranch(Guid id, [FromBody] UpdateBranchDto dto, CancellationToken cancellationToken)
    {
        var branch = await _service.UpdateBranchAsync(id, dto, cancellationToken);
        return Ok(branch);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteBranch(Guid id, CancellationToken cancellationToken)
    {
        var success = await _service.DeleteBranchAsync(id, cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public EmployeesController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<EmployeeDto>>> GetEmployees([FromQuery] Guid? branchId, CancellationToken cancellationToken)
    {
        var list = await _service.GetEmployeesAsync(branchId, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee([FromBody] CreateEmployeeDto dto, CancellationToken cancellationToken)
    {
        var emp = await _service.CreateEmployeeAsync(dto, cancellationToken);
        return Ok(emp);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> UpdateEmployee(Guid id, [FromBody] UpdateEmployeeDto dto, CancellationToken cancellationToken)
    {
        var emp = await _service.UpdateEmployeeAsync(id, dto, cancellationToken);
        return Ok(emp);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteEmployee(Guid id, CancellationToken cancellationToken)
    {
        var success = await _service.DeleteEmployeeAsync(id, cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public CustomersController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers([FromQuery] string? search, [FromQuery] CustomerSegment? segment, CancellationToken cancellationToken)
    {
        var list = await _service.GetCustomersAsync(search, segment, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerDto dto, CancellationToken cancellationToken)
    {
        var cust = await _service.CreateCustomerAsync(dto, cancellationToken);
        return Ok(cust);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(Guid id, [FromBody] UpdateCustomerDto dto, CancellationToken cancellationToken)
    {
        var cust = await _service.UpdateCustomerAsync(id, dto, cancellationToken);
        return Ok(cust);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteCustomer(Guid id, CancellationToken cancellationToken)
    {
        var success = await _service.DeleteCustomerAsync(id, cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public SuppliersController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<SupplierDto>>> GetSuppliers([FromQuery] string? search, CancellationToken cancellationToken)
    {
        var list = await _service.GetSuppliersAsync(search, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDto>> CreateSupplier([FromBody] CreateSupplierDto dto, CancellationToken cancellationToken)
    {
        var supplier = await _service.CreateSupplierAsync(dto, cancellationToken);
        return Ok(supplier);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SupplierDto>> UpdateSupplier(Guid id, [FromBody] UpdateSupplierDto dto, CancellationToken cancellationToken)
    {
        var supplier = await _service.UpdateSupplierAsync(id, dto, cancellationToken);
        return Ok(supplier);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteSupplier(Guid id, CancellationToken cancellationToken)
    {
        var success = await _service.DeleteSupplierAsync(id, cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public ProductsController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetProducts([FromQuery] string? search, [FromQuery] string? category, CancellationToken cancellationToken)
    {
        var list = await _service.GetProductsAsync(search, category, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var product = await _service.CreateProductAsync(dto, cancellationToken);
        return Ok(product);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto, CancellationToken cancellationToken)
    {
        var product = await _service.UpdateProductAsync(id, dto, cancellationToken);
        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        var success = await _service.DeleteProductAsync(id, cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public InventoryController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<InventoryItemDto>>> GetInventory([FromQuery] Guid? branchId, [FromQuery] string? search, [FromQuery] bool? isLowStock, CancellationToken cancellationToken)
    {
        var list = await _service.GetInventoryAsync(branchId, search, isLowStock, cancellationToken);
        return Ok(list);
    }

    [HttpPost("adjust")]
    public async Task<ActionResult<InventoryItemDto>> AdjustStock([FromBody] UpdateInventoryStockDto dto, CancellationToken cancellationToken)
    {
        var item = await _service.AdjustStockAsync(dto, cancellationToken);
        return Ok(item);
    }

    [HttpGet("movements")]
    public async Task<ActionResult<List<StockMovementDto>>> GetStockMovements([FromQuery] Guid? branchId, [FromQuery] Guid? productId, [FromQuery] int take = 50, CancellationToken cancellationToken = default)
    {
        var list = await _service.GetStockMovementsAsync(branchId, productId, take, cancellationToken);
        return Ok(list);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public SalesController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<SaleDto>>> GetSales([FromQuery] Guid? branchId, [FromQuery] Guid? customerId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
    {
        var list = await _service.GetSalesAsync(branchId, customerId, from, to, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<SaleDto>> CreateSale([FromBody] CreateSaleDto dto, CancellationToken cancellationToken)
    {
        var sale = await _service.CreateSaleAsync(dto, cancellationToken);
        return Ok(sale);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public PurchasesController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<PurchaseDto>>> GetPurchases([FromQuery] Guid? supplierId, [FromQuery] Guid? branchId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
    {
        var list = await _service.GetPurchasesAsync(supplierId, branchId, from, to, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseDto>> CreatePurchase([FromBody] CreatePurchaseDto dto, CancellationToken cancellationToken)
    {
        var purchase = await _service.CreatePurchaseAsync(dto, cancellationToken);
        return Ok(purchase);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DebtsController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public DebtsController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<DebtRecordDto>>> GetDebts([FromQuery] DebtType? type, [FromQuery] DebtStatus? status, CancellationToken cancellationToken)
    {
        var list = await _service.GetDebtsAsync(type, status, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<DebtRecordDto>> CreateDebt([FromBody] CreateDebtRecordDto dto, CancellationToken cancellationToken)
    {
        var debt = await _service.CreateDebtAsync(dto, cancellationToken);
        return Ok(debt);
    }

    [HttpPost("pay")]
    public async Task<ActionResult<DebtRecordDto>> PayDebt([FromBody] PayDebtDto dto, CancellationToken cancellationToken)
    {
        var debt = await _service.PayDebtAsync(dto, cancellationToken);
        return Ok(debt);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DebtSummaryDto>> GetDebtSummary(CancellationToken cancellationToken)
    {
        var summary = await _service.GetDebtSummaryAsync(cancellationToken);
        return Ok(summary);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public PaymentsController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<PaymentDto>>> GetPayments([FromQuery] PaymentType? type, [FromQuery] Guid? branchId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
    {
        var list = await _service.GetPaymentsAsync(type, branchId, from, to, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] CreatePaymentDto dto, CancellationToken cancellationToken)
    {
        var payment = await _service.CreatePaymentAsync(dto, cancellationToken);
        return Ok(payment);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public ExpensesController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExpenseDto>>> GetExpenses([FromQuery] Guid? branchId, [FromQuery] ExpenseCategory? category, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
    {
        var list = await _service.GetExpensesAsync(branchId, category, from, to, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseDto dto, CancellationToken cancellationToken)
    {
        var expense = await _service.CreateExpenseAsync(dto, cancellationToken);
        return Ok(expense);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(Guid id, [FromBody] UpdateExpenseDto dto, CancellationToken cancellationToken)
    {
        var expense = await _service.UpdateExpenseAsync(id, dto, cancellationToken);
        return Ok(expense);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteExpense(Guid id, CancellationToken cancellationToken)
    {
        var success = await _service.DeleteExpenseAsync(id, cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public ReportsController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet("income-statement")]
    public async Task<ActionResult<IncomeStatementDto>> GetIncomeStatement([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, CancellationToken cancellationToken)
    {
        var report = await _service.GetIncomeStatementAsync(startDate, endDate, cancellationToken);
        return Ok(report);
    }

    [HttpGet("cash-flow")]
    public async Task<ActionResult<CashFlowEstimateDto>> GetCashFlow(CancellationToken cancellationToken)
    {
        var report = await _service.GetCashFlowEstimateAsync(cancellationToken);
        return Ok(report);
    }

    [HttpGet("stock-valuation")]
    public async Task<ActionResult<StockValuationDto>> GetStockValuation(CancellationToken cancellationToken)
    {
        var report = await _service.GetStockValuationAsync(cancellationToken);
        return Ok(report);
    }

    [HttpGet("debts")]
    public async Task<ActionResult<DebtSummaryDto>> GetDebtSummary(CancellationToken cancellationToken)
    {
        var report = await _service.GetDebtSummaryAsync(cancellationToken);
        return Ok(report);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IBusinessManagementService _service;

    public AuditController(IBusinessManagementService service)
    {
        _service = service;
    }

    [HttpGet("logs")]
    public async Task<ActionResult<List<AuditLogDto>>> GetLogs([FromQuery] int take = 50, CancellationToken cancellationToken = default)
    {
        var list = await _service.GetAuditLogsAsync(take, cancellationToken);
        return Ok(list);
    }

    [HttpGet("notifications")]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications(CancellationToken cancellationToken)
    {
        var list = await _service.GetNotificationsAsync(cancellationToken);
        return Ok(list);
    }

    [HttpPost("notifications/{id:guid}/read")]
    public async Task<ActionResult> MarkNotificationRead(Guid id, CancellationToken cancellationToken)
    {
        await _service.MarkNotificationReadAsync(id, cancellationToken);
        return NoContent();
    }
}
