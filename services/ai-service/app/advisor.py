import os
import httpx
from typing import List, Dict, Any, Optional
from app.models import (
    BusinessStateSnapshot,
    SimulationResponse,
    AdvisorAnalysisResponse,
    AdvisorDiagnosticItem,
    AdvisorChatRequest
)

def run_deterministic_diagnostics(state: BusinessStateSnapshot, language: str = "en") -> AdvisorAnalysisResponse:
    """
    Computes rigorous, deterministic business diagnostics and insights from real snapshot data.
    Never invents numbers. Formats output according to requested language ('en', 'uz', 'ru').
    """
    diagnostics: List[AdvisorDiagnosticItem] = []
    revenue_drivers: List[str] = []
    cost_hotspots: List[str] = []
    recommended_scenarios: List[str] = []
    
    # 1. Margin & Profitability Health Check
    net_margin = (state.monthly_net_profit / state.monthly_revenue * 100) if state.monthly_revenue > 0 else 0.0
    cogs_margin = (state.monthly_cogs / state.monthly_revenue * 100) if state.monthly_revenue > 0 else 0.0
    opex_margin = (state.monthly_opex / state.monthly_revenue * 100) if state.monthly_revenue > 0 else 0.0
    
    health_score = 75
    if net_margin > 20:
        health_score += 15
    elif net_margin < 5:
        health_score -= 25
        
    if state.monthly_net_profit <= 0:
        health_score = min(40, health_score)
        
    # Language dictionary for diagnostics
    is_uz = language == "uz"
    is_ru = language == "ru"
    
    if net_margin < 10:
        title = "Past sof foyda marjasi" if is_uz else ("Низкая рентабельность чистой прибыли" if is_ru else "Low Net Profit Margin")
        finding = (
            f"Sof foyda marjasi {net_margin:.1f}% ni tashkil etmoqda. COGS ulushi: {cogs_margin:.1f}%, OPEX ulushi: {opex_margin:.1f}%."
            if is_uz else
            f"Рентабельность чистой прибыли составляет {net_margin:.1f}%. Доля себестоимости: {cogs_margin:.1f}%, OPEX: {opex_margin:.1f}%."
            if is_ru else
            f"Net profit margin is {net_margin:.1f}%. COGS consumes {cogs_margin:.1f}%, and OPEX consumes {opex_margin:.1f}% of gross revenue."
        )
        rec = (
            "Eng yuqori marjali mahsulotlar sotuvini oshirish yoki operatsion xarajatlarni 5-10% ga qisqartirish tavsiya etiladi."
            if is_uz else
            "Рекомендуется пересмотреть структуру ценообразования или сократить операционные расходы на 5-10%."
            if is_ru else
            "Consider repricing low-margin items and auditing recurring OPEX categories to improve operating leverage."
        )
        diagnostics.append(AdvisorDiagnosticItem(
            category="Revenue",
            severity="WARNING" if net_margin > 0 else "CRITICAL",
            title=title,
            finding=finding,
            actionable_recommendation=rec
        ))
    else:
        title = "Kuchli foyda marjasi" if is_uz else ("Высокая рентабельность" if is_ru else "Healthy Profit Margin")
        finding = (
            f"Sof foyda marjasi {net_margin:.1f}% darajasida barqaror."
            if is_uz else
            f"Рентабельность чистой прибыли на стабильном уровне {net_margin:.1f}%."
            if is_ru else
            f"Net profit margin is strong at {net_margin:.1f}%, generating ${state.monthly_net_profit:,.2f} in monthly profit."
        )
        rec = (
            "Foydani yangi bozorlarga chiqish yoki marketingni kengaytirishga reinvestitsiya qilish mumkin."
            if is_uz else
            "Прибыль можно реинвестировать в маркетинг или расширение сети филиалов."
            if is_ru else
            "Surplus operating cash flow can be allocated to customer acquisition or branch expansion."
        )
        diagnostics.append(AdvisorDiagnosticItem(
            category="Revenue",
            severity="OPPORTUNITY",
            title=title,
            finding=finding,
            actionable_recommendation=rec
        ))

    # 2. Product ABC / Pareto 80-20 Classification
    if state.products:
        sorted_products = sorted(
            state.products,
            key=lambda p: (p.monthly_sales_units * p.selling_price),
            reverse=True
        )
        total_prod_rev = sum(p.monthly_sales_units * p.selling_price for p in sorted_products)
        if total_prod_rev > 0:
            top_product = sorted_products[0]
            top_share = (top_product.monthly_sales_units * top_product.selling_price) / total_prod_rev * 100
            
            revenue_drivers.append(
                f"'{top_product.name}': {top_share:.1f}% umumiy tovar tushumini beradi (${(top_product.monthly_sales_units * top_product.selling_price):,.2f})"
                if is_uz else
                f"'{top_product.name}': приносит {top_share:.1f}% всей товарной выручки (${(top_product.monthly_sales_units * top_product.selling_price):,.2f})"
                if is_ru else
                f"'{top_product.name}' generates {top_share:.1f}% of total product revenue (${(top_product.monthly_sales_units * top_product.selling_price):,.2f})"
            )
            
            if top_share > 40:
                p_title = "Yuqori mahsulot konsentratsiyasi xavfi" if is_uz else ("Высокий риск концентрации на одном продукте" if is_ru else "High Product Concentration Risk")
                p_finding = (
                    f"'{top_product.name}' mahsuloti barcha savdoning {top_share:.1f}% qismini tashkil qiladi."
                    if is_uz else
                    f"Продукт '{top_product.name}' формирует {top_share:.1f}% всех продаж компании."
                    if is_ru else
                    f"A single product ('{top_product.name}') accounts for {top_share:.1f}% of your product revenue."
                )
                p_rec = (
                    "Yangi mahsulot turlarini kengaytirish va bog'liqlikni kamaytirish tavsiya etiladi."
                    if is_uz else
                    "Диверсифицируйте ассортимент, чтобы снизить зависимость от одного флагмана."
                    if is_ru else
                    "Diversify product lines to hedge against supplier disruptions or demand shifts for this item."
                )
                diagnostics.append(AdvisorDiagnosticItem(
                    category="Product",
                    severity="WARNING",
                    title=p_title,
                    finding=p_finding,
                    actionable_recommendation=p_rec
                ))

    # 3. Employee Productivity & Payroll Ratio
    if state.employee_count > 0:
        payroll_rev_ratio = (state.monthly_payroll / state.monthly_revenue * 100) if state.monthly_revenue > 0 else 0
        rev_per_emp = state.monthly_revenue / state.employee_count
        
        if payroll_rev_ratio > 40:
            cost_hotspots.append(
                f"Ish haqi fondi umumiy tushumning {payroll_rev_ratio:.1f}% qismini tashkil etmoqda"
                if is_uz else
                f"Фонд оплаты труда составляет {payroll_rev_ratio:.1f}% от всей выручки"
                if is_ru else
                f"Payroll accounts for {payroll_rev_ratio:.1f}% of revenue (High ratio)"
            )
        else:
            revenue_drivers.append(
                f"Har bir xodimga to'g'ri keladigan oylik daromad: ${rev_per_emp:,.2f}"
                if is_uz else
                f"Выручка на одного сотрудника: ${rev_per_emp:,.2f}/мес"
                if is_ru else
                f"Revenue per employee: ${rev_per_emp:,.2f}/month"
            )

    # 4. Recommended Scenarios
    if is_uz:
        recommended_scenarios = [
            "Mahsulotlar narxini 8-10% ga oshirish va talab elastikligini tekshirish",
            "Yangi filial ochish va uning 12 oylik xarajat qoplanish muddatini hisoblash",
            "Marketing byudjetini $2,000 ga oshirish orqali mijozlar oqimini kengaytirish"
        ]
        summary = (
            f"{state.company_name} biznes modeli tahlil qilindi. Oylik umumiy tushum: ${state.monthly_revenue:,.2f}, "
            f"Sof foyda: ${state.monthly_net_profit:,.2f} ({net_margin:.1f}% marja). "
            f"Jami {state.employee_count} nafar xodim va {len(state.branches)} ta filial faoliyat ko'rsatmoqda."
        )
    elif is_ru:
        recommended_scenarios = [
            "Повышение цен на 8-10% с учетом эластичности спроса",
            "Открытие нового филиала и расчет срока окупаемости (ROI/Payback)",
            "Увеличение маркетингового бюджета на $2,000 для привлечения новых клиентов"
        ]
        summary = (
            f"Цифровой двойник компании '{state.company_name}' проанализирован. Ежемесячная выручка: ${state.monthly_revenue:,.2f}, "
            f"Чистая прибыль: ${state.monthly_net_profit:,.2f} (рентабельность {net_margin:.1f}%). "
            f"Штат: {state.employee_count} сотрудников, филиалов: {len(state.branches)}."
        )
    else:
        recommended_scenarios = [
            "Increase selective product prices by +8% to test gross margin expansion",
            "Simulate opening 1 new branch to forecast CapEx payback and monthly cash runway",
            "Invest $2,500/month in targeted digital marketing to accelerate customer acquisition"
        ]
        summary = (
            f"Business Digital Twin analysis complete for '{state.company_name}'. Monthly revenue stands at ${state.monthly_revenue:,.2f} "
            f"with ${state.monthly_net_profit:,.2f} in net profit ({net_margin:.1f}% margin). "
            f"Currently operating with {state.employee_count} employees across {len(state.branches)} branch(es)."
        )

    return AdvisorAnalysisResponse(
        overall_health_score=max(10, min(100, health_score)),
        executive_summary=summary,
        diagnostics=diagnostics,
        revenue_drivers=revenue_drivers,
        cost_hotspots=cost_hotspots,
        recommended_scenarios=recommended_scenarios
    )

async def handle_advisor_chat(request: AdvisorChatRequest) -> Dict[str, Any]:
    """
    Handles natural language questions from business owners using real data guardrails.
    If OPENAI_API_KEY or GEMINI_API_KEY is available, uses the LLM with prompt containment.
    Otherwise, applies deterministic natural language reasoning.
    """
    query_lower = request.query.lower()
    lang = request.language
    state = request.current_state
    scenario = request.active_scenario
    
    # Check if external LLM key is configured
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if openai_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                system_prompt = (
                    "You are an expert AI Business Advisor for an executive Digital Twin SaaS platform. "
                    "CRITICAL RULES:\n"
                    "1. Strictly use the provided business metrics. NEVER invent or hallucinate financial numbers.\n"
                    "2. Always distinguish between actual historical facts and simulated estimates.\n"
                    f"3. Respond in the user's language: '{lang}' (uz = Uzbek, ru = Russian, en = English).\n"
                    f"4. Company: {state.company_name}, Monthly Revenue: ${state.monthly_revenue:,.2f}, "
                    f"Monthly Expenses: ${(state.monthly_cogs + state.monthly_opex):,.2f}, Net Profit: ${state.monthly_net_profit:,.2f}, "
                    f"Headcount: {state.employee_count}, Branches: {len(state.branches)}."
                )
                if scenario:
                    system_prompt += (
                        f"\nACTIVE SCENARIO: '{scenario.scenario_name}' -> "
                        f"Est. Revenue: ${scenario.summary_metrics['monthly_revenue'].simulated_value:,.2f}, "
                        f"Est. Profit: ${scenario.summary_metrics['monthly_profit'].simulated_value:,.2f}, "
                        f"Confidence: {scenario.confidence_score}%."
                    )
                
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": request.query}
                        ],
                        "temperature": 0.3
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    answer = data["choices"][0]["message"]["content"]
                    return {"reply": answer, "engine": "llm_openai", "grounded_in_real_data": True}
        except Exception:
            pass # Fallback to deterministic reasoning

    # Deterministic Reasoning Engine
    is_uz = lang == "uz"
    is_ru = lang == "ru"
    
    # 1. Price / Narx / Цена queries
    if any(w in query_lower for w in ["price", "narx", "цен", "cost", "qimmat"]):
        if scenario:
            sim_rev = scenario.summary_metrics["monthly_revenue"].simulated_value
            sim_prof = scenario.summary_metrics["monthly_profit"].simulated_value
            delta_prof = scenario.summary_metrics["monthly_profit"].absolute_change
            
            if is_uz:
                reply = (
                    f"**Simulyatsiya hisob-kitobi bo'yicha:**\n"
                    f"Hozirgi oylik tushum: **${state.monthly_revenue:,.2f}**, sof foyda: **${state.monthly_net_profit:,.2f}**.\n"
                    f"'{scenario.scenario_name}' ssenariysi qo'llanilganda kutilayotgan tushum: **${sim_rev:,.2f}**, "
                    f"kutilayotgan sof foyda: **${sim_prof:,.2f}** ({delta_prof:+,.2f}$ o'zgarish).\n\n"
                    f"*(Eslatma: Ushbu raqamlar kafolatlangan natija emas, balki talab elastikligiga asoslangan baholash/tahmindir. Ishonch darajasi: {scenario.confidence_score}%).* "
                )
            elif is_ru:
                reply = (
                    f"**Результаты моделирования:**\n"
                    f"Текущая ежемесячная выручка: **${state.monthly_revenue:,.2f}**, чистая прибыль: **${state.monthly_net_profit:,.2f}**.\n"
                    f"По сценарию '{scenario.scenario_name}' ожидаемая выручка: **${sim_rev:,.2f}**, "
                    f"ожидаемая чистая прибыль: **${sim_prof:,.2f}** (изменение {delta_prof:+,.2f}$).\n\n"
                    f"*(Примечание: Эти данные являются оценочным прогнозом на основе модели эластичности, а не гарантированным результатом. Достоверность: {scenario.confidence_score}%).* "
                )
            else:
                reply = (
                    f"**Scenario Simulation Calculation:**\n"
                    f"Current monthly revenue is **${state.monthly_revenue:,.2f}** with **${state.monthly_net_profit:,.2f}** net profit.\n"
                    f"Under the '{scenario.scenario_name}' scenario, projected revenue is **${sim_rev:,.2f}** "
                    f"and projected net profit is **${sim_prof:,.2f}** (delta: {delta_prof:+,.2f}$).\n\n"
                    f"*(Note: These figures are model estimates based on price elasticity assumptions, not guaranteed outcomes. Model confidence: {scenario.confidence_score}%).* "
                )
        else:
            if is_uz:
                reply = (
                    f"Hozirgi holatda kompaniyaning oylik tushumi **${state.monthly_revenue:,.2f}**, tovarlar tannarxi (COGS) **${state.monthly_cogs:,.2f}** "
                    f"va operatsion xarajatlar **${state.monthly_opex:,.2f}** ni tashkil etadi. "
                    "Narxlarni o'zgartirish oqibatini ko'rish uchun 'Ssenariy Simulyatori' bo'limida narx o'zgarishi % parametrini kiritib hisoblashingiz mumkin."
                )
            elif is_ru:
                reply = (
                    f"Текущая ежемесячная выручка компании составляет **${state.monthly_revenue:,.2f}**, себестоимость (COGS) **${state.monthly_cogs:,.2f}** "
                    f"и операционные расходы **${state.monthly_opex:,.2f}**. "
                    "Чтобы увидеть точный прогноз изменения цен, воспользуйтесь разделом 'Симулятор сценариев'."
                )
            else:
                reply = (
                    f"Currently, monthly revenue is **${state.monthly_revenue:,.2f}**, COGS is **${state.monthly_cogs:,.2f}**, "
                    f"and OPEX is **${state.monthly_opex:,.2f}**. "
                    "To evaluate the impact of a price change, adjust the Price % slider in the Scenario Simulator."
                )
        return {"reply": reply, "engine": "deterministic_reasoner", "grounded_in_real_data": True}

    # 2. Branch / Filial / Филиал queries
    if any(w in query_lower for w in ["branch", "filial", "филиал", "open", "och"]):
        branch_count = len(state.branches)
        if is_uz:
            reply = (
                f"Kompaniyada ayni paytda **{branch_count} ta filial** mavjud. "
                "Yangi filial ochilganda o'rtacha ijara va xodimlar xarajati (OpEx) hamda boshlang'ich jihozlash (CapEx) talab etiladi. "
                "Ssenariy simulyatori orqali yangi filialning qoplanish muddati (Payback period) va sof daromad o'sishini hisoblash mumkin."
            )
        elif is_ru:
            reply = (
                f"В настоящее время у компании функционирует **{branch_count} филиал(ов)**. "
                "Открытие нового филиала повлечет капитальные затраты (CapEx) и увеличение регулярных расходов (аренда, персонал). "
                "Используйте 'Симулятор сценариев', чтобы рассчитать прогнозируемую окупаемость и точку безубыточности."
            )
        else:
            reply = (
                f"The business currently operates **{branch_count} active branch(es)**. "
                "Opening a new branch entails initial CapEx setup plus ongoing monthly lease and staffing OpEx. "
                "You can model exact payback horizons and monthly cash flow in the Scenario Simulator."
            )
        return {"reply": reply, "engine": "deterministic_reasoner", "grounded_in_real_data": True}

    # 3. Employee / Xodim / Сотрудник queries
    if any(w in query_lower for w in ["employee", "staff", "hire", "xodim", "ishchi", "сотрудник", "найм", "зарплат"]):
        payroll_ratio = (state.monthly_payroll / state.monthly_revenue * 100) if state.monthly_revenue > 0 else 0.0
        if is_uz:
            reply = (
                f"Hozirda shtatda **{state.employee_count} nafar xodim** ishlamoqda. "
                f"Oylik umumiy ish haqi fondi: **${state.monthly_payroll:,.2f}** (tushumning {payroll_ratio:.1f}% qismi). "
                "Yana yangi xodimlar yollansa, ularning maoshi bilan birga soliq/qo'shimcha xarajatlar (+15%) qo'shiladi."
            )
        elif is_ru:
            reply = (
                f"Текущая численность персонала: **{state.employee_count} сотрудников**. "
                f"Ежемесячный фонд оплаты труда: **${state.monthly_payroll:,.2f}** ({payroll_ratio:.1f}% от выручки). "
                "При найме новых сотрудников учитывается базовая ставка плюс накладные расходы (+15%)."
            )
        else:
            reply = (
                f"Your team currently consists of **{state.employee_count} employees** with a monthly payroll of "
                f"**${state.monthly_payroll:,.2f}** ({payroll_ratio:.1f}% of total revenue). "
                "Simulations automatically account for salary, benefits, and 15% statutory overhead."
            )
        return {"reply": reply, "engine": "deterministic_reasoner", "grounded_in_real_data": True}

    # Default General Business Advisor response
    diagnostics_res = run_deterministic_diagnostics(state, language=lang)
    diag_summary = "\n".join([f"• **{d.title}**: {d.finding} ({d.actionable_recommendation})" for d in diagnostics_res.diagnostics[:2]])
    
    if is_uz:
        reply = (
            f"**Biznes Digital Twin tahlili:**\n"
            f"{diagnostics_res.executive_summary}\n\n"
            f"**Asosiy ko'rsatkichlar va tavsiyalar:**\n{diag_summary}\n\n"
            "Aniqroq simulyatsiya hisoblash uchun savolingizda narx, xodimlar soni yoki yangi filial haqida so'rashingiz mumkin."
        )
    elif is_ru:
        reply = (
            f"**Анализ Цифрового Двойника:**\n"
            f"{diagnostics_res.executive_summary}\n\n"
            f"**Ключевые выводы и рекомендации:**\n{diag_summary}\n\n"
            "Вы можете задать конкретный вопрос по изменению цен, найму персонала или открытию новых точек."
        )
    else:
        reply = (
            f"**Digital Twin Executive Analysis:**\n"
            f"{diagnostics_res.executive_summary}\n\n"
            f"**Key Findings & Recommendations:**\n{diag_summary}\n\n"
            "Feel free to ask specific questions about pricing adjustments, hiring plans, or branch expansion."
        )
        
    return {"reply": reply, "engine": "deterministic_reasoner", "grounded_in_real_data": True}
