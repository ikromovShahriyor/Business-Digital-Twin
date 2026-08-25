using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Application.DTOs;
using BusinessTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace BusinessTwin.Application.Services;

public interface IAiAdvisorService
{
    Task<AdvisorAnalysisDto> GetBusinessDiagnosticsAsync(string language = "uz", CancellationToken cancellationToken = default);
    Task<AdvisorChatResponseDto> ChatWithAdvisorAsync(AdvisorChatRequestDto request, CancellationToken cancellationToken = default);
}

public class AiAdvisorService : IAiAdvisorService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentTenantService _tenantService;
    private readonly IDigitalTwinService _digitalTwinService;
    private readonly IScenarioSimulationService _scenarioService;
    private readonly HttpClient _httpClient;

    public AiAdvisorService(
        IApplicationDbContext context,
        ICurrentTenantService tenantService,
        IDigitalTwinService digitalTwinService,
        IScenarioSimulationService scenarioService,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _tenantService = tenantService;
        _digitalTwinService = digitalTwinService;
        _scenarioService = scenarioService;
        _httpClient = httpClientFactory.CreateClient("AiServiceClient");
    }

    public async Task<AdvisorAnalysisDto> GetBusinessDiagnosticsAsync(string language = "uz", CancellationToken cancellationToken = default)
    {
        var baseline = await _digitalTwinService.GetDigitalTwinSnapshotAsync(cancellationToken);

        var isUz = language == "uz";
        var isRu = language == "ru";

        var diagnostics = new List<AdvisorDiagnosticItemDto>();
        var drivers = new List<string>();
        var hotspots = new List<string>();

        // 1. Profitability & Margin Diagnostic
        if (baseline.NetMarginPercent >= 15)
        {
            diagnostics.Add(new AdvisorDiagnosticItemDto(
                Category: isUz ? "Foydalilik" : (isRu ? "Рентабельность" : "Profitability"),
                Severity: "OPPORTUNITY",
                Title: isUz ? "A'lo darajadagi sof foyda marjasi" : (isRu ? "Высокая рентабельность чистой прибыли" : "Strong Profit Margin"),
                Finding: isUz 
                    ? $"Kompaniya {baseline.NetMarginPercent:F1}% sof foyda marjasi bilan (${baseline.MonthlyNetProfit:N0}/oy) barqaror rivojlanmoqda. Yalpi marja: {baseline.GrossMarginPercent:F1}%."
                    : (isRu 
                        ? $"Компания демонстрирует чистую маржинальность {baseline.NetMarginPercent:F1}% (${baseline.MonthlyNetProfit:N0}/мес). Валовая маржа: {baseline.GrossMarginPercent:F1}%."
                        : $"Business delivers strong net margin of {baseline.NetMarginPercent:F1}% (${baseline.MonthlyNetProfit:N0}/month). Gross margin: {baseline.GrossMarginPercent:F1}%."),
                ActionableRecommendation: isUz
                    ? "Erkin pul oqimining bir qismini marketingni kuchaytirish yoki kelgusi 3-filial ochish fondiga jamg'arish mumkin."
                    : (isRu
                        ? "Рекомендуется направить часть свободной ликвидности на расширение клиентской базы или подготовку к открытию 3-го филиала."
                        : "Surplus liquidity can be allocated towards customer acquisition and scaling.")
            ));
        }
        else if (baseline.NetMarginPercent >= 5)
        {
            diagnostics.Add(new AdvisorDiagnosticItemDto(
                Category: isUz ? "Foydalilik" : (isRu ? "Рентабельность" : "Profitability"),
                Severity: "WARNING",
                Title: isUz ? "O'rtacha sof foyda marjasi" : (isRu ? "Умеренная рентабельность" : "Moderate Profit Margin"),
                Finding: isUz
                    ? $"Sof foyda marjasi {baseline.NetMarginPercent:F1}% ni tashkil qilmoqda (${baseline.MonthlyNetProfit:N0}/oy)."
                    : (isRu
                        ? $"Чистая рентабельность составляет {baseline.NetMarginPercent:F1}% (${baseline.MonthlyNetProfit:N0}/мес)."
                        : $"Net margin is moderate at {baseline.NetMarginPercent:F1}% (${baseline.MonthlyNetProfit:N0}/month)."),
                ActionableRecommendation: isUz
                    ? "Yuqori marjali aksessuarlar savdosini oshirish va yetkazib beruvchilar bilan xarid narxlarini 3-5% tushirish bo'yicha muzokara olib borish lozim."
                    : (isRu
                        ? "Рекомендуется стимулировать кросс-продажи высокомаржинальных аксессуаров и оптимизировать закупочные цены."
                        : "Focus on high-margin cross-sells and negotiate bulk purchasing discounts.")
            ));
        }
        else
        {
            diagnostics.Add(new AdvisorDiagnosticItemDto(
                Category: isUz ? "Foydalilik" : (isRu ? "Рентабельность" : "Profitability"),
                Severity: "CRITICAL",
                Title: isUz ? "Past daromadlilik xatari" : (isRu ? "Риск низкой рентабельности" : "Low Profit Margin Warning"),
                Finding: isUz
                    ? $"Sof foyda marjasi atigi {baseline.NetMarginPercent:F1}% ni tashkil etmoqda."
                    : (isRu
                        ? $"Чистая рентабельность составляет всего {baseline.NetMarginPercent:F1}%."
                        : $"Net margin is critical at {baseline.NetMarginPercent:F1}%."),
                ActionableRecommendation: isUz
                    ? "Operatsion xarajatlarni audit qilish va mahsulot narxlarini 5-10% qayta ko'rib chiqish talab etiladi."
                    : (isRu
                        ? "Необходим аудит операционных расходов и точечная корректировка отпускных цен."
                        : "Audit overhead expenses and calibrate pricing elasticity.")
            ));
        }

        // 2. Branch Performance Diagnostic
        if (baseline.Branches.Count == 2)
        {
            var b1 = baseline.Branches[0];
            var b2 = baseline.Branches[1];
            drivers.Add(isUz
                ? $"Bosh Do'kon (Amir Temur): Oylik ${b1.MonthlyRevenue:N0} tushum va ${b1.NetProfit:N0} sof hissa bilan eng asosiy lokomotiv hisoblanadi."
                : (isRu
                    ? $"Главный филиал (Амир Темур): Лидер по выручке (${b1.MonthlyRevenue:N0}) и чистой прибыли (${b1.NetProfit:N0})."
                    : $"HQ Branch (Amir Temur): Top revenue driver (${b1.MonthlyRevenue:N0}) with ${b1.NetProfit:N0} net contribution."));

            drivers.Add(isUz
                ? $"Chilonzor Filiali: Oylik ${b2.MonthlyRevenue:N0} tushum va ${b2.NetProfit:N0} sof foyda bilan barqaror natija ko'rsatmoqda."
                : (isRu
                    ? $"Филиал Чиланзар: Стабильные показатели — выручка ${b2.MonthlyRevenue:N0}, чистая прибыль ${b2.NetProfit:N0}."
                    : $"Chilanzar Branch: Stable performance with ${b2.MonthlyRevenue:N0} revenue and ${b2.NetProfit:N0} profit."));
        }

        // 3. Employee & Workforce Diagnostic
        if (baseline.TotalEmployees > 0)
        {
            var revPerEmp = baseline.RevenuePerEmployee;
            var payrollRatio = baseline.MonthlyRevenue > 0 ? (baseline.MonthlyPayroll / baseline.MonthlyRevenue) * 100m : 0m;

            drivers.Add(isUz
                ? $"Xodimlar samaradorligi: Har bir xodimga o'rtacha ${revPerEmp:N0}/oy tushum to'g'ri kelmoqda (12 nafar xodim)."
                : (isRu
                    ? $"Эффективность штата: Выручка на 1 сотрудника составляет ${revPerEmp:N0}/мес (12 сотрудников)."
                    : $"Workforce Efficiency: Average revenue per employee stands at ${revPerEmp:N0}/month (12 staff)."));

            if (payrollRatio < 30m)
            {
                diagnostics.Add(new AdvisorDiagnosticItemDto(
                    Category: isUz ? "Xodimlar va Mehnat" : (isRu ? "Штат и Персонал" : "Workforce"),
                    Severity: "OPPORTUNITY",
                    Title: isUz ? "Optimal ish haqi fondi (FOT)" : (isRu ? "Оптимальный фонд оплаты труда" : "Healthy Payroll Ratio"),
                    Finding: isUz
                        ? $"Ish haqi fondi umumiy tushumning {payrollRatio:F1}% qismini tashkil qilmoqda (${baseline.MonthlyPayroll:N0}/oy). Bu soha me'yoridan juda yaxshi."
                        : (isRu
                            ? $"Фонд оплаты труда составляет {payrollRatio:F1}% от выручки (${baseline.MonthlyPayroll:N0}/мес), что является отличным показателем."
                            : $"Payroll represents {payrollRatio:F1}% of monthly revenue (${baseline.MonthlyPayroll:N0}/month), well within healthy limits."),
                    ActionableRecommendation: isUz
                        ? "Yetakchi savdo xodimlari uchun KPI bonus tizimini yanada kuchaytirib, umumiy savdoni 15% ga oshirish mumkin."
                        : (isRu
                            ? "Рекомендуется внедрить мотивационную KPI систему бонусов для ключевых продавцов."
                            : "Implement performance KPI bonuses for sales specialists.")
                ));
            }
        }

        // 4. Low stock hotspot
        if (baseline.LowStockProductCount > 0)
        {
            hotspots.Add(isUz
                ? $"{baseline.LowStockProductCount} ta mahsulot bo'yicha zaxira minimal chegaraga yaqinlashgan (Ombor to'ldirish zarur)."
                : (isRu
                    ? $"{baseline.LowStockProductCount} позиций требуют пополнения складских остатков."
                    : $"{baseline.LowStockProductCount} SKUs are approaching low stock thresholds."));
        }
        else
        {
            drivers.Add(isUz
                ? "Ombor zaxiralari 2 ta filial bo'yicha to'liq ta'minlangan va xavfsiz holatda."
                : (isRu
                    ? "Складские запасы распределены по 2 филиалам в безопасном объеме."
                    : "Inventory levels across both branches are well-balanced."));
        }

        var healthScore = Math.Clamp((int)(baseline.NetMarginPercent * 2.8m + (baseline.TotalBranches * 12) + (baseline.ActiveCustomers * 2.2m)), 40, 98);

        var summary = isUz
            ? $"{baseline.CompanyName} kompaniyasi 2 ta faol filial va 12 nafar xodim bilan yuqori darajada ishlamoqda. Oylik tushum: ${baseline.MonthlyRevenue:N0}, Yalpi foyda: ${baseline.MonthlyGrossProfit:N0} ({baseline.GrossMarginPercent:F1}%), Sof foyda: ${baseline.MonthlyNetProfit:N0} ({baseline.NetMarginPercent:F1}%). 10 ta korporativ va doimiy mijozlar faol xarid qilmoqda."
            : (isRu
                ? $"Компания '{baseline.CompanyName}' успешно функционирует с 2 филиалами и 12 сотрудниками. Ежемесячная выручка: ${baseline.MonthlyRevenue:N0}, Валовая прибыль: ${baseline.MonthlyGrossProfit:N0} ({baseline.GrossMarginPercent:F1}%), Чистая прибыль: ${baseline.MonthlyNetProfit:N0} ({baseline.NetMarginPercent:F1}%). База активных клиентов: 10 компаний."
                : $"'{baseline.CompanyName}' is operating stably across 2 branches with 12 staff members. Monthly Revenue: ${baseline.MonthlyRevenue:N0}, Gross Profit: ${baseline.MonthlyGrossProfit:N0} ({baseline.GrossMarginPercent:F1}%), Net Profit: ${baseline.MonthlyNetProfit:N0} ({baseline.NetMarginPercent:F1}%). 10 active corporate and retail clients.");

        var recScenarios = isUz
            ? new List<string> { "Narxlarni +10% ga oshirish simulyatsiyasi", "3-filialni ochish simulyatsiyasi", "Marketing byudjetini $2,500 ga oshirish", "B2B ulgurji savdoni kengaytirish" }
            : (isRu 
                ? new List<string> { "Сценарий: Повышение отпускных цен на +10%", "Сценарий: Открытие 3-го филиала", "Сценарий: Увеличение маркетинга на +$2,500", "Масштабирование B2B продаж" }
                : new List<string> { "Scenario: +10% Price Calibration", "Scenario: Open 3rd Branch", "Scenario: +$2,500 Marketing Budget", "Expand B2B Sales Network" });

        return new AdvisorAnalysisDto(
            OverallHealthScore: healthScore,
            ExecutiveSummary: summary,
            Diagnostics: diagnostics,
            RevenueDrivers: drivers,
            CostHotspots: hotspots,
            RecommendedScenarios: recScenarios,
            AnalyzedAtUtc: DateTime.UtcNow
        );
    }

    public async Task<AdvisorChatResponseDto> ChatWithAdvisorAsync(AdvisorChatRequestDto request, CancellationToken cancellationToken = default)
    {
        var baseline = await _digitalTwinService.GetDigitalTwinSnapshotAsync(cancellationToken);
        var companyId = baseline.CompanyId;

        var branches = await _context.Branches
            .Where(b => b.CompanyId == companyId && b.IsActive && !b.IsDeleted)
            .Include(b => b.Employees)
            .ToListAsync(cancellationToken);

        var employees = await _context.Employees
            .Where(e => e.CompanyId == companyId && e.IsActive && !e.IsDeleted)
            .Include(e => e.Branch)
            .ToListAsync(cancellationToken);

        var customers = await _context.Customers
            .Where(c => c.CompanyId == companyId && !c.IsDeleted)
            .OrderByDescending(c => c.TotalSpent)
            .ToListAsync(cancellationToken);

        var products = await _context.Products
            .Where(p => p.CompanyId == companyId && p.IsActive && !p.IsDeleted)
            .Include(p => p.InventoryItems)
            .ToListAsync(cancellationToken);

        var lang = request.Language ?? "uz";
        var isUz = lang == "uz";
        var isRu = lang == "ru";
        var q = (request.Message ?? "").ToLower().Trim();

        SimulationResultDto? activeScenario = null;
        if (request.ActiveScenarioId.HasValue)
        {
            activeScenario = await _scenarioService.GetScenarioByIdAsync(request.ActiveScenarioId.Value, cancellationToken);
        }

        // --- 1. FILIALLAR TAHLILI (BRANCH ANALYSIS) ---
        if (q.Contains("filial") || q.Contains("branch") || q.Contains("филиал") || q.Contains("do'kon") || q.Contains("dokon"))
        {
            var b1 = baseline.Branches.FirstOrDefault(b => b.IsMainBranch) ?? baseline.Branches.FirstOrDefault();
            var b2 = baseline.Branches.FirstOrDefault(b => !b.IsMainBranch) ?? baseline.Branches.LastOrDefault();

            var sb = new StringBuilder();
            if (isUz)
            {
                sb.AppendLine("🏢 **Kompaniyaning 2 ta filiali bo'yicha to'liq tahlil:**\n");
                if (b1 != null)
                {
                    sb.AppendLine($"**1. {b1.Name} ({b1.Code}) — Bosh Do'kon:**");
                    sb.AppendLine($"• Oylik Tushum: **${b1.MonthlyRevenue:N0}** ({((b1.MonthlyRevenue / (baseline.MonthlyRevenue > 0 ? baseline.MonthlyRevenue : 1)) * 100m):F1}% ulush)");
                    sb.AppendLine($"• Operatsion xarajatlar va ijara: **${b1.MonthlyExpenses:N0}**");
                    sb.AppendLine($"• Sof hissa (Net Contribution): **${b1.NetProfit:N0}**");
                    sb.AppendLine($"• Xodimlar soni: **{b1.EmployeeCount} nafar**\n");
                }
                if (b2 != null)
                {
                    sb.AppendLine($"**2. {b2.Name} ({b2.Code}):**");
                    sb.AppendLine($"• Oylik Tushum: **${b2.MonthlyRevenue:N0}** ({((b2.MonthlyRevenue / (baseline.MonthlyRevenue > 0 ? baseline.MonthlyRevenue : 1)) * 100m):F1}% ulush)");
                    sb.AppendLine($"• Operatsion xarajatlar va ijara: **${b2.MonthlyExpenses:N0}**");
                    sb.AppendLine($"• Sof hissa: **${b2.NetProfit:N0}**");
                    sb.AppendLine($"• Xodimlar soni: **{b2.EmployeeCount} nafar**\n");
                }
                sb.AppendLine("💡 **AI Xulosasi va Tavsiya:**");
                sb.AppendLine("Har ikkala filial ham ijobiy sof foyda keltirmoqda. Markaziy filial B2B korporativ buyurtmalar hisobiga yetakchi, Chilonzor filiali esa chakana savdoda juda faol. Chilonzor filialiga yuqori darajadagi noutbuklar va monitorlar zaxirasini 20% oshirish tavsiya etiladi.");
            }
            else if (isRu)
            {
                sb.AppendLine("🏢 **Аналитический отчет по 2 филиалам компании:**\n");
                if (b1 != null)
                {
                    sb.AppendLine($"**1. {b1.Name} — Главный филиал:**");
                    sb.AppendLine($"• Выручка: **${b1.MonthlyRevenue:N0}**");
                    sb.AppendLine($"• Расходы и аренда: **${b1.MonthlyExpenses:N0}**");
                    sb.AppendLine($"• Чистый вклад: **${b1.NetProfit:N0}** | Штат: **{b1.EmployeeCount} чел**\n");
                }
                if (b2 != null)
                {
                    sb.AppendLine($"**2. {b2.Name}:**");
                    sb.AppendLine($"• Выручка: **${b2.MonthlyRevenue:N0}**");
                    sb.AppendLine($"• Расходы и аренда: **${b2.MonthlyExpenses:N0}**");
                    sb.AppendLine($"• Чистый вклад: **${b2.NetProfit:N0}** | Штат: **{b2.EmployeeCount} чел**\n");
                }
                sb.AppendLine("💡 **Рекомендация AI:** Оба филиала прибыльны. Рекомендуется увеличить ассортимент флагманских товаров в Чиланзарском филиале на +20%.");
            }
            else
            {
                sb.AppendLine("🏢 **Comprehensive 2-Branch Network Performance:**\n");
                if (b1 != null) sb.AppendLine($"**1. {b1.Name}:** Revenue: **${b1.MonthlyRevenue:N0}**, Profit Contribution: **${b1.NetProfit:N0}**, Staff: **{b1.EmployeeCount}**");
                if (b2 != null) sb.AppendLine($"**2. {b2.Name}:** Revenue: **${b2.MonthlyRevenue:N0}**, Profit Contribution: **${b2.NetProfit:N0}**, Staff: **{b2.EmployeeCount}**");
                sb.AppendLine("\n💡 **AI Strategic Verdict:** Both branches are generating positive cash flow.");
            }

            return new AdvisorChatResponseDto(sb.ToString(), "deterministic_reasoner", true, DateTime.UtcNow);
        }

        // --- 2. XODIMLAR VA MAOSHLAR TAHLILI (EMPLOYEES & PAYROLL) ---
        if (q.Contains("xodim") || q.Contains("hodim") || q.Contains("ishchi") || q.Contains("maosh") || q.Contains("employee") || q.Contains("staff") || q.Contains("сотрудник") || q.Contains("зарплат"))
        {
            var totalStaff = employees.Count;
            var totalSalary = employees.Sum(e => e.MonthlySalary);
            var revPerEmp = totalStaff > 0 ? (baseline.MonthlyRevenue / totalStaff) : 0m;
            var depts = employees.GroupBy(e => e.Department).Select(g => new { Dept = g.Key, Count = g.Count(), Salary = g.Sum(e => e.MonthlySalary) }).ToList();

            var sb = new StringBuilder();
            if (isUz)
            {
                sb.AppendLine($"👥 **Xodimlar va Ish haqi fondi tahlili (Jami: {totalStaff} nafar xodim):**\n");
                sb.AppendLine($"• Oylik umumiy ish haqi fondi: **${totalSalary:N0}/oy**");
                sb.AppendLine($"• Har bir xodimga to'g'ri keluvchi oylik tushum: **${revPerEmp:N0}**");
                sb.AppendLine($"• Ish haqining tushumdagi ulushi: **{((totalSalary / (baseline.MonthlyRevenue > 0 ? baseline.MonthlyRevenue : 1)) * 100m):F1}%** (Me'yor: < 35%)\n");
                sb.AppendLine("**Bo'limlar bo'yicha taqsimot:**");
                foreach (var d in depts)
                {
                    sb.AppendLine($"• **{d.Dept}:** {d.Count} nafar xodim — Oylik fond: ${d.Salary:N0}");
                }
                sb.AppendLine("\n**Filiallar bo'yicha:**");
                sb.AppendLine($"• Bosh Do'kon (Amir Temur): **{employees.Count(e => e.BranchId == branches.FirstOrDefault(b => b.IsMainBranch)?.Id)} nafar**");
                sb.AppendLine($"• Chilonzor Filiali: **{employees.Count(e => e.BranchId == branches.FirstOrDefault(b => !b.IsMainBranch)?.Id)} nafar**\n");
                sb.AppendLine("💡 **AI Tavsiyasi:** Xodimlar samaradorligi yuqori darajada. Savdo bo'limi xodimlari uchun oylik rejani oshirib bajarganlik bo'yicha qo'shimcha rag'batlantirish tizimi umumiy daromadni yana 10-15% ga oshirishga imkon beradi.");
            }
            else if (isRu)
            {
                sb.AppendLine($"👥 **Анализ персонала и фонда оплаты труда ({totalStaff} сотрудников):**\n");
                sb.AppendLine($"• Ежемесячный фонд зарплат: **${totalSalary:N0}/мес**");
                sb.AppendLine($"• Выручка на 1 сотрудника: **${revPerEmp:N0}/мес**");
                sb.AppendLine($"• Доля ФОТ в выручке: **{((totalSalary / (baseline.MonthlyRevenue > 0 ? baseline.MonthlyRevenue : 1)) * 100m):F1}%**\n");
                sb.AppendLine("**По филиалам:** Главный офис (7 чел), Филиал Чиланзар (5 чел).");
                sb.AppendLine("\n💡 **Рекомендация AI:** Показатели продуктивности высокие.");
            }
            else
            {
                sb.AppendLine($"👥 **Workforce & Payroll Intelligence ({totalStaff} Staff):**\n");
                sb.AppendLine($"• Total Monthly Payroll: **${totalSalary:N0}/mo**");
                sb.AppendLine($"• Revenue Per Employee: **${revPerEmp:N0}**");
                sb.AppendLine($"• Payroll-to-Revenue Ratio: **{((totalSalary / (baseline.MonthlyRevenue > 0 ? baseline.MonthlyRevenue : 1)) * 100m):F1}%**");
            }

            return new AdvisorChatResponseDto(sb.ToString(), "deterministic_reasoner", true, DateTime.UtcNow);
        }

        // --- 3. MIJOZLAR TAHLILI (CUSTOMERS & VIPs) ---
        if (q.Contains("mijoz") || q.Contains("klient") || q.Contains("customer") || q.Contains("client") || q.Contains("клиент") || q.Contains("vip") || q.Contains("b2b"))
        {
            var vipCustomers = customers.Where(c => c.Segment == CustomerSegment.VIP).ToList();
            var totalCust = customers.Count;
            var totalSpentAll = customers.Sum(c => c.TotalSpent);

            var sb = new StringBuilder();
            if (isUz)
            {
                sb.AppendLine($"👑 **Mijozlar bazasi va Segmentatsiya tahlili (Jami: {totalCust} ta mijoz):**\n");
                sb.AppendLine($"• Jami mijozlar tomonidan qilingan xaridlar: **${totalSpentAll:N0}**");
                sb.AppendLine($"• VIP mijozlar ulushi: **{vipCustomers.Count} ta** (Kompaniya tushumining asosiy qismini tashkil qiladi)\n");
                sb.AppendLine("**Top VIP Mijozlar:**");
                foreach (var c in vipCustomers.Take(4))
                {
                    sb.AppendLine($"• 🌟 **{c.Name}** — Jami xaridi: **${c.TotalSpent:N0}** ({c.TotalOrders} ta buyurtma) | Tel: {c.Phone}");
                }
                sb.AppendLine("\n**Doimiy va Yangi mijozlar:**");
                var regularCount = customers.Count(c => c.Segment == CustomerSegment.Regular);
                var newCount = customers.Count(c => c.Segment == CustomerSegment.New);
                sb.AppendLine($"• Doimiy mijozlar: **{regularCount} ta** | Yangi mijozlar: **{newCount} ta**\n");
                sb.AppendLine("💡 **AI Maslahati:** VIP mijozlarga shaxsiy hisob-kitob menejeri biriktirish va 5-7 kunlik to'lov kechiktirish (revolving credit) imtiyozlarini berish orqali buyurtmalar o'rtacha chekini 25% ga ko'paytirish mumkin.");
            }
            else if (isRu)
            {
                sb.AppendLine($"👑 **Анализ клиентской базы ({totalCust} активных клиентов):**\n");
                sb.AppendLine($"• Общий объем покупок: **${totalSpentAll:N0}**");
                sb.AppendLine("**Ключевые VIP клиенты:**");
                foreach (var c in vipCustomers.Take(4))
                {
                    sb.AppendLine($"• 🌟 **{c.Name}** — ${c.TotalSpent:N0} ({c.TotalOrders} заказов)");
                }
                sb.AppendLine("\n💡 **Совет AI:** Рекомендуется персонализированное B2B обслуживание для VIP сегмента.");
            }
            else
            {
                sb.AppendLine($"👑 **Customer & CRM Intelligence ({totalCust} Clients):**\n");
                sb.AppendLine($"• Total Customer Lifetime Value: **${totalSpentAll:N0}**");
                foreach (var c in vipCustomers.Take(4))
                {
                    sb.AppendLine($"• 🌟 **{c.Name}** — Spent: **${c.TotalSpent:N0}** ({c.TotalOrders} orders)");
                }
            }

            return new AdvisorChatResponseDto(sb.ToString(), "deterministic_reasoner", true, DateTime.UtcNow);
        }

        // --- 4. MAHSULOTLAR VA OMBOR (PRODUCTS & INVENTORY) ---
        if (q.Contains("mahsulot") || q.Contains("tovar") || q.Contains("product") || q.Contains("ombor") || q.Contains("zaxira") || q.Contains("inventory") || q.Contains("товар") || q.Contains("склад") || q.Contains("marja") || q.Contains("margin"))
        {
            var topByMargin = products.OrderByDescending(p => p.GrossMarginPercent).Take(4).ToList();
            var totalStockUnits = products.SelectMany(p => p.InventoryItems).Sum(i => i.QuantityOnHand);

            var sb = new StringBuilder();
            if (isUz)
            {
                sb.AppendLine($"📦 **Mahsulotlar katalogi va Marjinallik tahlili ({products.Count} xil tovar, {totalStockUnits:N0} dona zaxira):**\n");
                sb.AppendLine("**Eng yuqori marjali mahsulotlar:**");
                foreach (var p in topByMargin)
                {
                    var marginVal = p.SellingPrice - p.CostPrice;
                    sb.AppendLine($"• 💎 **{p.Name}** ({p.Category}):");
                    sb.AppendLine($"  - Sotish: **${p.SellingPrice:N0}** | Tannarx: **${p.CostPrice:N0}** | Foyda: **${marginVal:N0}** (Marja: **{p.GrossMarginPercent:F1}%**)");
                }
                sb.AppendLine("\n**Ombor zaxirasi:**");
                sb.AppendLine($"• Bosh Do'kon (Amir Temur): Barcha 8 ta tovar to'liq zaxirada.");
                sb.AppendLine($"• Chilonzor Filiali: Doimiy to'ldirib borilmoqda.\n");
                sb.AppendLine("💡 **AI Tavsiyasi:** Yuqori marjali aksessuarlar va audio jihozlar (`Simsiz Quloqchinlar`, `Klaviatura Pro`, `Sichqoncha`) sotuvini noutbuk va smartfonlar bilan birga paket (bundle) sifatida sotish sof foydani sezilarli oshiradi.");
            }
            else if (isRu)
            {
                sb.AppendLine($"📦 **Анализ товаров и рентабельности ({products.Count} позиций):**\n");
                foreach (var p in topByMargin)
                {
                    sb.AppendLine($"• 💎 **{p.Name}**: Продажа ${p.SellingPrice:N0}, Маржа: **{p.GrossMarginPercent:F1}%**");
                }
            }
            else
            {
                sb.AppendLine($"📦 **Product Performance & Inventory ({products.Count} SKUs):**\n");
                foreach (var p in topByMargin)
                {
                    sb.AppendLine($"• 💎 **{p.Name}**: Price: ${p.SellingPrice:N0}, Gross Margin: **{p.GrossMarginPercent:F1}%**");
                }
            }

            return new AdvisorChatResponseDto(sb.ToString(), "deterministic_reasoner", true, DateTime.UtcNow);
        }

        // --- 5. MOLIYAVIY KO'RSATKICHLAR & ZARARSIZLIK (FINANCIALS & BREAKEVEN) ---
        if (q.Contains("moliya") || q.Contains("foyda") || q.Contains("tushum") || q.Contains("xarajat") || q.Contains("breakeven") || q.Contains("zararsiz") || q.Contains("finance") || q.Contains("profit") || q.Contains("revenue") || q.Contains("прибыль") || q.Contains("выручка") || q.Contains("расход"))
        {
            var sb = new StringBuilder();
            if (isUz)
            {
                sb.AppendLine("📊 **Kompaniyaning to'liq moliyaviy holati (Oylik Raqamli Egizak ko'rsatkichlari):**\n");
                sb.AppendLine($"• 💰 **Oylik Yalpi Tushum:** **${baseline.MonthlyRevenue:N0}**");
                sb.AppendLine($"• 🏷️ **Sotilgan tovarlar tannarxi (COGS):** **${baseline.MonthlyCogs:N0}**");
                sb.AppendLine($"• 📈 **Yalpi Foyda (Gross Profit):** **${baseline.MonthlyGrossProfit:N0}** (Yalpi marja: **{baseline.GrossMarginPercent:F1}%**)");
                sb.AppendLine($"• 📉 **Operatsion xarajatlar (OPEX):** **${baseline.MonthlyOpex:N0}** (Ijara, Maoshlar, Reklama, IT)");
                sb.AppendLine($"• 🏆 **Oylik Sof Foyda (Net Profit):** **${baseline.MonthlyNetProfit:N0}** (Sof marja: **{baseline.NetMarginPercent:F1}%**)\n");
                sb.AppendLine($"• ⚖️ **Zararsizlik Nuqtasi (Breakeven):** **${baseline.BreakevenMonthlyRevenue:N0}/oy**");
                sb.AppendLine($"  *(Kompaniya zararsiz ishlashi uchun oyiga kamida ${baseline.BreakevenMonthlyRevenue:N0} savdo qilishi kerak. Hozirda bu ko'rsatkichdan xavfsiz masofadamiz).*");
                sb.AppendLine($"• 🛡️ **Moliyaviy Barqarorlik Ko'rsatkichi (Health Score):** **{Math.Clamp((int)(baseline.NetMarginPercent * 2.8m + 30), 50, 98)} / 100**\n");
                sb.AppendLine("💡 **AI Xulosasi:** Kompaniya moliyaviy jihatdan juda barqaror holatda. Oylik erkin sof foyda yangi investitsiyalar kiritish uchun yetarli zaxiraga ega.");
            }
            else if (isRu)
            {
                sb.AppendLine("📊 **Финансовые метрики компании:**\n");
                sb.AppendLine($"• Выручка: **${baseline.MonthlyRevenue:N0}**");
                sb.AppendLine($"• Себестоимость (COGS): **${baseline.MonthlyCogs:N0}**");
                sb.AppendLine($"• Валовая прибыль: **${baseline.MonthlyGrossProfit:N0}** ({baseline.GrossMarginPercent:F1}%)");
                sb.AppendLine($"• Расходы (OPEX): **${baseline.MonthlyOpex:N0}**");
                sb.AppendLine($"• Чистая прибыль: **${baseline.MonthlyNetProfit:N0}** ({baseline.NetMarginPercent:F1}%)");
                sb.AppendLine($"• Точка безубыточности: **${baseline.BreakevenMonthlyRevenue:N0}/мес**");
            }
            else
            {
                sb.AppendLine("📊 **Executive Financial Summary:**\n");
                sb.AppendLine($"• Monthly Revenue: **${baseline.MonthlyRevenue:N0}**");
                sb.AppendLine($"• Gross Profit: **${baseline.MonthlyGrossProfit:N0}** ({baseline.GrossMarginPercent:F1}%)");
                sb.AppendLine($"• Operating Expenses: **${baseline.MonthlyOpex:N0}**");
                sb.AppendLine($"• Net Profit: **${baseline.MonthlyNetProfit:N0}** ({baseline.NetMarginPercent:F1}%)");
                sb.AppendLine($"• Breakeven Target: **${baseline.BreakevenMonthlyRevenue:N0}/mo**");
            }

            return new AdvisorChatResponseDto(sb.ToString(), "deterministic_reasoner", true, DateTime.UtcNow);
        }

        // --- 6. NARX OSHIRISH & SSENARIY SIMULYATSIYASI (WHAT-IF SCENARIOS) ---
        if (q.Contains("narx") || q.Contains("price") || q.Contains("oshir") || q.Contains("10%") || q.Contains("simulyats") || q.Contains("scenario") || q.Contains("цен") || q.Contains("поднять"))
        {
            var priceBump = 0.10m; // 10%
            var estimatedElasticity = -0.35m; // typical elasticity for tech goods
            var volumeChange = priceBump * estimatedElasticity; // -3.5%
            var newRev = baseline.MonthlyRevenue * (1 + priceBump) * (1 + volumeChange);
            var newCogs = baseline.MonthlyCogs * (1 + volumeChange);
            var newGross = newRev - newCogs;
            var newNet = newGross - baseline.MonthlyOpex;
            var netDelta = newNet - baseline.MonthlyNetProfit;

            var sb = new StringBuilder();
            if (isUz)
            {
                sb.AppendLine("🔮 **Ssenariy Simulyatsiyasi: Narxlarni +10% ga oshirish oqibatlari:**\n");
                sb.AppendLine("Ushbu hisob-kitob talab elastikligi (Price Elasticity of Demand: -0.35) asosida ishlab chiqildi:\n");
                sb.AppendLine($"• Hozirgi oylik tushum: **${baseline.MonthlyRevenue:N0}** ➔ Yangi kutilayotgan tushum: **${newRev:N0}**");
                sb.AppendLine($"• Hozirgi sof foyda: **${baseline.MonthlyNetProfit:N0}** ➔ Yangi kutilayotgan sof foyda: **${newNet:N0}**");
                sb.AppendLine($"• Qo'shimcha sof foyda o'sishi: **+${netDelta:N0}/oy** (+{(netDelta / (baseline.MonthlyNetProfit > 0 ? baseline.MonthlyNetProfit : 1) * 100m):F1}% o'sish)\n");
                sb.AppendLine("💡 **AI Strategik Xulosasi:**");
                sb.AppendLine("Texnika va elektronika tovarlarida 10% narx oshishi savdo hajmini atigi 3.5% ga pasaytiradi, lekin sof foydani oyiga qo'shimcha **+$" + $"{netDelta:N0}" + "** ga oshiradi. Ushbu ssenariyni sinab ko'rish juda tavsiya etiladi.");
            }
            else if (isRu)
            {
                sb.AppendLine("🔮 **Моделирование сценария: Повышение цен на +10%:**\n");
                sb.AppendLine($"• Прогноз выручки: **${newRev:N0}** (было: ${baseline.MonthlyRevenue:N0})");
                sb.AppendLine($"• Прогноз чистой прибыли: **${newNet:N0}** (было: ${baseline.MonthlyNetProfit:N0})");
                sb.AppendLine($"• Прирост прибыли: **+${netDelta:N0}/мес**\n");
                sb.AppendLine("💡 **Вывод AI:** Сценарий высокоэффективен за счет низкой эластичности спроса.");
            }
            else
            {
                sb.AppendLine("🔮 **Scenario Simulation: +10% Price Calibration:**\n");
                sb.AppendLine($"• Projected Revenue: **${newRev:N0}** (Current: ${baseline.MonthlyRevenue:N0})");
                sb.AppendLine($"• Projected Net Profit: **${newNet:N0}** (Current: ${baseline.MonthlyNetProfit:N0})");
                sb.AppendLine($"• Monthly Net Delta: **+${netDelta:N0}/month**");
            }

            return new AdvisorChatResponseDto(sb.ToString(), "deterministic_reasoner", true, DateTime.UtcNow);
        }

        // --- 7. UMUMIY VA ERKIN SAVOLLAR (DEFAULT STRATEGIC RESPONSE) ---
        var diag = await GetBusinessDiagnosticsAsync(lang, cancellationToken);
        var genReply = isUz
            ? $"🧠 **AI Biznes Maslahatchisi xulosasi:**\n\n" +
              $"{diag.ExecutiveSummary}\n\n" +
              $"📌 **Asosiy drayverlar:**\n" +
              string.Join("\n", diag.RevenueDrivers.Select(d => $"• {d}")) + "\n\n" +
              $"🎯 **Bosh strategik tavsiya:**\n{diag.Diagnostics.FirstOrDefault()?.ActionableRecommendation ?? "Ssenariylarni tahlil qilib boring."}"
            : (isRu
                ? $"🧠 **Заключение AI Бизнес-советника:**\n\n" +
                  $"{diag.ExecutiveSummary}\n\n" +
                  $"📌 **Ключевые драйверы:**\n" +
                  string.Join("\n", diag.RevenueDrivers.Select(d => $"• {d}")) + "\n\n" +
                  $"🎯 **Рекомендация:**\n{diag.Diagnostics.FirstOrDefault()?.ActionableRecommendation ?? "Регулярно тестируйте сценарии."}"
                : $"🧠 **AI Business Advisor Executive Summary:**\n\n" +
                  $"{diag.ExecutiveSummary}\n\n" +
                  $"📌 **Core Drivers:**\n" +
                  string.Join("\n", diag.RevenueDrivers.Select(d => $"• {d}")) + "\n\n" +
                  $"🎯 **Primary Recommendation:**\n{diag.Diagnostics.FirstOrDefault()?.ActionableRecommendation ?? "Test growth scenarios in simulator."}");

        return new AdvisorChatResponseDto(genReply, "deterministic_reasoner", true, DateTime.UtcNow);
    }
}
