using BusinessTwin.Domain.Entities;
using BusinessTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BusinessTwin.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Companies.IgnoreQueryFilters().AnyAsync())
        {
            return; // Already seeded
        }

        // 1. Create Default Demo Company: "Apex Texnologiya va Savdo MCHJ"
        var company = new Company
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Apex Texnologiya va Savdo MCHJ",
            TaxNumber = "STIR-304892100",
            Industry = "Elektronika va Savdo",
            Currency = "USD",
            DefaultTaxRate = 0.12m,
            Address = "Innovatsiyalar ko'chasi 100, Toshkent",
            Phone = "+998 71 200 0000",
            Email = "aloqa@apex-twin.uz",
            Website = "https://apex-twin.uz",
            IsActive = true
        };

        // 2. Create System Users for All Roles
        var ownerUser = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Email = "owner@business-twin.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin12345!", 11),
            FirstName = "Akmal",
            LastName = "Ikromov",
            Phone = "+998 90 123 4567",
            PreferredLanguage = "uz",
            IsActive = true,
            LastLoginAtUtc = DateTime.UtcNow
        };

        var directorUser = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222223"),
            Email = "director@business-twin.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin12345!", 11),
            FirstName = "Shahriyor",
            LastName = "Ikromov",
            Phone = "+998 90 987 6543",
            PreferredLanguage = "uz",
            IsActive = true,
            LastLoginAtUtc = DateTime.UtcNow
        };

        var managerUser = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222224"),
            Email = "manager@business-twin.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin12345!", 11),
            FirstName = "Bobur",
            LastName = "Aliyev",
            Phone = "+998 93 111 2233",
            PreferredLanguage = "uz",
            IsActive = true,
            LastLoginAtUtc = DateTime.UtcNow
        };

        var analystUser = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222225"),
            Email = "analyst@business-twin.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin12345!", 11),
            FirstName = "Dilnoza",
            LastName = "Karimova",
            Phone = "+998 97 444 5566",
            PreferredLanguage = "uz",
            IsActive = true,
            LastLoginAtUtc = DateTime.UtcNow
        };

        var roleOwner = new UserCompanyRole { Id = Guid.NewGuid(), UserId = ownerUser.Id, CompanyId = company.Id, Role = UserRole.Owner };
        var roleDirector = new UserCompanyRole { Id = Guid.NewGuid(), UserId = directorUser.Id, CompanyId = company.Id, Role = UserRole.Admin };
        var roleManager = new UserCompanyRole { Id = Guid.NewGuid(), UserId = managerUser.Id, CompanyId = company.Id, Role = UserRole.Manager };
        var roleAnalyst = new UserCompanyRole { Id = Guid.NewGuid(), UserId = analystUser.Id, CompanyId = company.Id, Role = UserRole.Analyst };

        var user = ownerUser;

        // 3. Branches (Aynan 2 ta filial)
        var mainBranch = new Branch
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333331"),
            CompanyId = company.Id,
            Name = "Markaziy Bosh Do'kon (Amir Temur)",
            Code = "HQ-01",
            Address = "Amir Temur shoh ko'chasi 45, Yunusobod tumani, Toshkent",
            Phone = "+998 71 201 1111",
            ManagerName = "Rustam Karimov",
            IsMainBranch = true,
            MonthlyRent = 3500m,
            IsActive = true
        };

        var branch2 = new Branch
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333332"),
            CompanyId = company.Id,
            Name = "Chilonzor Savdo Filiali",
            Code = "BR-02",
            Address = "Bunyodkor shoh ko'chasi 15, Chilonzor tumani, Toshkent",
            Phone = "+998 71 202 2222",
            ManagerName = "Dilnoza Alimova",
            IsMainBranch = false,
            MonthlyRent = 2200m,
            IsActive = true
        };

        // 4. Suppliers (5 ta yetkazib beruvchilar)
        var sup1 = new Supplier { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "TechGlobal Distribution MCHJ", ContactPerson = "Farxod Temirov", Phone = "+998 71 205 1100", Email = "sales@techglobal.uz", Address = "Sergeli sanoat zonasi 12, Toshkent", TaxNumber = "302918231", Category = "Noutbuk & Smartfon", TotalPurchases = 64000m, OutstandingDebt = 4500m, IsActive = true };
        var sup2 = new Supplier { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "SmartAudio & Acoustics Ltd", ContactPerson = "Anvar Qodirov", Phone = "+998 90 333 4411", Email = "b2b@smartaudio.uz", Address = "Yunusobod 4-mavze, Toshkent", TaxNumber = "305112344", Category = "Audio & Aksessuarlar", TotalPurchases = 28000m, OutstandingDebt = 2100m, IsActive = true };
        var sup3 = new Supplier { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Asia Display Tech MCHJ", ContactPerson = "Ravshan Saidov", Phone = "+998 97 123 7788", Email = "supply@asiadisplay.uz", Address = "Shayxontohur tumani, Navoiy ko'chasi", TaxNumber = "308771239", Category = "Monitorlar & Ekranlar", TotalPurchases = 32000m, OutstandingDebt = 0m, IsActive = true };
        var sup4 = new Supplier { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Orient Hardware Components", ContactPerson = "Sherzod Aliyev", Phone = "+998 93 456 9900", Email = "order@orienthardware.uz", Address = "Uchtepa tumani, Lutfiy ko'chasi", TaxNumber = "304556123", Category = "Aksessuarlar & Qismlar", TotalPurchases = 16500m, OutstandingDebt = 1200m, IsActive = true };
        var sup5 = new Supplier { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "SilkRoad Logistics Supply", ContactPerson = "Bobur Mansurov", Phone = "+998 99 800 5544", Email = "info@silkroadsupply.uz", Address = "Mirobod tumani, Nukus ko'chasi", TaxNumber = "309223118", Category = "Gajetlar & Planshetlar", TotalPurchases = 22000m, OutstandingDebt = 0m, IsActive = true };

        // 5. Products (10 xil saralangan mahsulot)
        var p1 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Pro Noutbuk Ultra 16\"", Sku = "SKU-LAP-01", Barcode = "478001234001", Category = "Kompyuterlar", Unit = "dona", CostPrice = 750m, SellingPrice = 1150m, MinStockThreshold = 10m, Description = "Core i7 / 32GB RAM / 1TB SSD Flagman noutbuk", IsActive = true };
        var p2 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Flagman Smartfon X-Pro 256GB", Sku = "SKU-PHN-02", Barcode = "478001234002", Category = "Smartfonlar", Unit = "dona", CostPrice = 480m, SellingPrice = 720m, MinStockThreshold = 20m, Description = "OLED 120Hz ekran, 50MP kamera", IsActive = true };
        var p3 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Simsiz Quloqchinlar (ANC)", Sku = "SKU-AUD-03", Barcode = "478001234003", Category = "Audio", Unit = "dona", CostPrice = 65m, SellingPrice = 140m, MinStockThreshold = 25m, Description = "Faol shovqinni so'ndirish, 36 soat batareya", IsActive = true };
        var p4 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Smart 4K Monitor 27\" IPS", Sku = "SKU-MON-04", Barcode = "478001234004", Category = "Monitorlar", Unit = "dona", CostPrice = 190m, SellingPrice = 320m, MinStockThreshold = 15m, Description = "4K UHD, HDR400, Type-C 65W zaryadlash", IsActive = true };
        var p5 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Mexanik Klaviatura Pro RGB", Sku = "SKU-ACC-05", Barcode = "478001234005", Category = "Aksessuarlar", Unit = "dona", CostPrice = 38m, SellingPrice = 85m, MinStockThreshold = 30m, Description = "Hot-swap mexanik switchlar, RGB yoritish", IsActive = true };
        var p6 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Planshet Tab Max 11\"", Sku = "SKU-TAB-06", Barcode = "478001234006", Category = "Planshetlar", Unit = "dona", CostPrice = 290m, SellingPrice = 460m, MinStockThreshold = 12m, Description = "2K Displey, Stylus qalam qo'llab-quvvatlaydi", IsActive = true };
        var p7 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Ergonomik Simsiz Sichqoncha", Sku = "SKU-ACC-07", Barcode = "478001234007", Category = "Aksessuarlar", Unit = "dona", CostPrice = 22m, SellingPrice = 55m, MinStockThreshold = 35m, Description = "Bluetooth + 2.4Ghz ulanish, 4000 DPI", IsActive = true };
        var p8 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Portativ PowerBank 20000mAh 65W", Sku = "SKU-ACC-08", Barcode = "478001234008", Category = "Aksessuarlar", Unit = "dona", CostPrice = 18m, SellingPrice = 42m, MinStockThreshold = 40m, Description = "Noutbuk va telefonlarni tezkor zaryadlash", IsActive = true };
        var p9 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Simsiz Gaming Headset 7.1", Sku = "SKU-AUD-09", Barcode = "478001234009", Category = "Audio", Unit = "dona", CostPrice = 45m, SellingPrice = 95m, MinStockThreshold = 20m, Description = "Surround sound, shovqinsiz mikrofon", IsActive = true };
        var p10 = new Product { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Ultra HD 4K Veb-Kamera", Sku = "SKU-ACC-10", Barcode = "478001234010", Category = "Aksessuarlar", Unit = "dona", CostPrice = 35m, SellingPrice = 75m, MinStockThreshold = 15m, Description = "Avtofokus, shovqinsiz mikrofon, konferensiyalar uchun", IsActive = true };

        // 6. Employees (12 nafar xodim — 2 ta filial bo'yicha)
        var emp1 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, FirstName = "Sardor", LastName = "Yusupov", Position = "Katta Do'kon Boshqaruvchisi", Department = "Menejment", Phone = "+998 90 111 2233", Email = "sardor@apex-twin.uz", MonthlySalary = 2200m, HireDateUtc = DateTime.UtcNow.AddMonths(-24), IsActive = true };
        var emp2 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, FirstName = "Jasur", LastName = "Qosimov", Position = "B2B Korporativ Savdo Menejeri", Department = "Savdo", Phone = "+998 90 222 3344", Email = "jasur@apex-twin.uz", MonthlySalary = 1600m, HireDateUtc = DateTime.UtcNow.AddMonths(-18), IsActive = true };
        var emp3 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, FirstName = "Malika", LastName = "Nazarova", Position = "Yetakchi Savdo Mutaxassisi", Department = "Savdo", Phone = "+998 90 333 4455", Email = "malika@apex-twin.uz", MonthlySalary = 1400m, HireDateUtc = DateTime.UtcNow.AddMonths(-14), IsActive = true };
        var emp4 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, FirstName = "Timur", LastName = "Saidov", Position = "Omborxona va Logistika Boshlig'i", Department = "Logistika", Phone = "+998 90 444 5566", Email = "timur@apex-twin.uz", MonthlySalary = 1200m, HireDateUtc = DateTime.UtcNow.AddMonths(-10), IsActive = true };
        var emp5 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, FirstName = "Nigora", LastName = "Karimova", Position = "Bosh Buxgalter va Moliyachi", Department = "Moliya", Phone = "+998 90 555 6677", Email = "nigora@apex-twin.uz", MonthlySalary = 1800m, HireDateUtc = DateTime.UtcNow.AddMonths(-20), IsActive = true };
        var emp6 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, FirstName = "Otabek", LastName = "Rustamov", Position = "Katta Texnik Servis Mutaxassisi", Department = "Texnik xizmat", Phone = "+998 90 666 7788", Email = "otabek@apex-twin.uz", MonthlySalary = 1100m, HireDateUtc = DateTime.UtcNow.AddMonths(-8), IsActive = true };
        var emp7 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, FirstName = "Shahzoda", LastName = "Aliyeva", Position = "Kassir-Operator", Department = "Moliya", Phone = "+998 90 777 8899", Email = "shahzoda@apex-twin.uz", MonthlySalary = 800m, HireDateUtc = DateTime.UtcNow.AddMonths(-6), IsActive = true };

        var emp8 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, FirstName = "Dilnoza", LastName = "Alimova", Position = "Filial Mudiri", Department = "Menejment", Phone = "+998 93 111 2233", Email = "dilnoza@apex-twin.uz", MonthlySalary = 1900m, HireDateUtc = DateTime.UtcNow.AddMonths(-16), IsActive = true };
        var emp9 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, FirstName = "Madina", LastName = "Raximova", Position = "Katta Savdo Konsultanti", Department = "Savdo", Phone = "+998 93 222 3344", Email = "madina@apex-twin.uz", MonthlySalary = 1300m, HireDateUtc = DateTime.UtcNow.AddMonths(-12), IsActive = true };
        var emp10 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, FirstName = "Bekzod", LastName = "Shokirov", Position = "Savdo Konsultanti", Department = "Savdo", Phone = "+998 93 333 4455", Email = "bekzod@apex-twin.uz", MonthlySalary = 950m, HireDateUtc = DateTime.UtcNow.AddMonths(-7), IsActive = true };
        var emp11 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, FirstName = "Sanjar", LastName = "Ergashev", Position = "Filial Omborchisi", Department = "Logistika", Phone = "+998 93 444 5566", Email = "sanjar@apex-twin.uz", MonthlySalary = 900m, HireDateUtc = DateTime.UtcNow.AddMonths(-5), IsActive = true };
        var emp12 = new Employee { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, FirstName = "Gulnoza", LastName = "Xolmatova", Position = "Kassir-Operator", Department = "Moliya", Phone = "+998 93 555 6677", Email = "gulnoza@apex-twin.uz", MonthlySalary = 750m, HireDateUtc = DateTime.UtcNow.AddMonths(-4), IsActive = true };

        // 7. Customers (10 ta mijoz)
        var c1 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Alpha Tech Innovations MCHJ", ContactPerson = "Ulug'bek Mahmudov", Email = "xarid@alphatech.uz", Phone = "+998 90 999 1122", Address = "Yashnobod innovatsiya parki 5", TaxNumber = "305988112", Segment = CustomerSegment.VIP, TotalSpent = 38500m, TotalOrders = 18, OutstandingDebt = 2500m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-14), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-2), IsActive = true };
        var c2 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Orient Logistics Group", ContactPerson = "Jamshid Jo'rayev", Email = "info@orientlogistics.uz", Phone = "+998 97 777 4455", Address = "Sergeli logistika markazi 8", TaxNumber = "307112443", Segment = CustomerSegment.VIP, TotalSpent = 29400m, TotalOrders = 12, OutstandingDebt = 1800m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-11), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-4), IsActive = true };
        var c3 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Samarqand Trade Group MCHJ", ContactPerson = "Shuxrat Akramov", Email = "contact@samtrade.uz", Phone = "+998 93 333 8899", Address = "Samarqand sh., Registon ko'chasi 20", TaxNumber = "201334889", Segment = CustomerSegment.VIP, TotalSpent = 24600m, TotalOrders = 10, OutstandingDebt = 0m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-9), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-6), IsActive = true };
        var c4 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Toshkent City Smart Solutions", ContactPerson = "Mansur Odilov", Email = "corp@tc-smart.uz", Phone = "+998 99 888 2211", Address = "Tashkent City Boulevard 4", TaxNumber = "309445112", Segment = CustomerSegment.VIP, TotalSpent = 19800m, TotalOrders = 8, OutstandingDebt = 1200m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-8), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-8), IsActive = true };
        var c5 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "NextGen Kreativ Studiya", ContactPerson = "Kamron Ergashev", Email = "order@nextgen.uz", Phone = "+998 93 555 4433", Address = "Mirzo Ulug'bek, Ziyolilar 14", TaxNumber = "308119004", Segment = CustomerSegment.Regular, TotalSpent = 14200m, TotalOrders = 7, OutstandingDebt = 0m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-6), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-5), IsActive = true };
        var c6 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Silk Road Media Agentligi", ContactPerson = "Diyorbek Rahimov", Email = "media@silkroad.uz", Phone = "+998 90 111 7788", Address = "Yakkasaroy, Shota Rustaveli 32", TaxNumber = "306774119", Segment = CustomerSegment.Regular, TotalSpent = 11800m, TotalOrders = 6, OutstandingDebt = 0m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-5), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-9), IsActive = true };
        var c7 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Mega Retail Trade MCHJ", ContactPerson = "Botir Shukurov", Email = "supply@megaretail.uz", Phone = "+998 94 666 3322", Address = "Olmazor tumani, Qorasaroy 10", TaxNumber = "304559118", Segment = CustomerSegment.Regular, TotalSpent = 9500m, TotalOrders = 5, OutstandingDebt = 0m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-4), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-11), IsActive = true };
        var c8 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Ziyo O'quv Markazi", ContactPerson = "Shahnoza Malikova", Email = "admin@ziyo-edu.uz", Phone = "+998 91 444 6677", Address = "Chilonzor 2-mavze, Bunyodkor", TaxNumber = "303221990", Segment = CustomerSegment.Regular, TotalSpent = 7200m, TotalOrders = 4, OutstandingDebt = 0m, FirstPurchaseAtUtc = DateTime.UtcNow.AddMonths(-3), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-14), IsActive = true };
        var c9 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Modern IT Systems", ContactPerson = "Olimjon Vohidov", Email = "ceo@modernit.uz", Phone = "+998 95 222 9900", Address = "Yunusobod 12, Ahmad Donish", TaxNumber = "309887113", Segment = CustomerSegment.New, TotalSpent = 3800m, TotalOrders = 2, OutstandingDebt = 0m, FirstPurchaseAtUtc = DateTime.UtcNow.AddDays(-20), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-7), IsActive = true };
        var c10 = new Customer { Id = Guid.NewGuid(), CompanyId = company.Id, Name = "Euro Asia Invest MCHJ", ContactPerson = "Rustam Zokirov", Email = "finance@euroasiainvest.uz", Phone = "+998 98 123 0099", Address = "Shayxontohur, Alisher Navoiy 1", TaxNumber = "301449887", Segment = CustomerSegment.New, TotalSpent = 2400m, TotalOrders = 1, OutstandingDebt = 0m, FirstPurchaseAtUtc = DateTime.UtcNow.AddDays(-10), LastPurchaseAtUtc = DateTime.UtcNow.AddDays(-10), IsActive = true };

        // 8. Inventory Items (2 ta filial bo'yicha 10 ta mahsulot)
        var invList = new List<InventoryItem>
        {
            // Bosh do'kon (Amir Temur)
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p1.Id, QuantityOnHand = 32m, ReorderPoint = 8m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-3) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p2.Id, QuantityOnHand = 55m, ReorderPoint = 15m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-2) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p3.Id, QuantityOnHand = 85m, ReorderPoint = 20m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p4.Id, QuantityOnHand = 28m, ReorderPoint = 10m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-4) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p5.Id, QuantityOnHand = 60m, ReorderPoint = 20m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-6) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p6.Id, QuantityOnHand = 24m, ReorderPoint = 8m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-7) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p7.Id, QuantityOnHand = 70m, ReorderPoint = 25m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p8.Id, QuantityOnHand = 90m, ReorderPoint = 30m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-8) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p9.Id, QuantityOnHand = 40m, ReorderPoint = 15m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p10.Id, QuantityOnHand = 35m, ReorderPoint = 12m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-6) },

            // Chilonzor filiali
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p1.Id, QuantityOnHand = 16m, ReorderPoint = 6m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-4) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p2.Id, QuantityOnHand = 38m, ReorderPoint = 10m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-3) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p3.Id, QuantityOnHand = 50m, ReorderPoint = 15m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-6) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p4.Id, QuantityOnHand = 18m, ReorderPoint = 8m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p5.Id, QuantityOnHand = 45m, ReorderPoint = 15m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-4) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p6.Id, QuantityOnHand = 15m, ReorderPoint = 6m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-7) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p7.Id, QuantityOnHand = 48m, ReorderPoint = 20m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-6) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p8.Id, QuantityOnHand = 65m, ReorderPoint = 25m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-8) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p9.Id, QuantityOnHand = 25m, ReorderPoint = 10m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-5) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p10.Id, QuantityOnHand = 20m, ReorderPoint = 10m, LastRestockedAtUtc = DateTime.UtcNow.AddDays(-6) }
        };

        // 9. Purchases & Supply Inflows (Ta'minot xaridlari)
        var pur1 = new Purchase
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, SupplierId = sup1.Id, BranchId = mainBranch.Id,
            PurchaseNumber = "PO-2026-0001", PurchaseDateUtc = DateTime.UtcNow.AddDays(-15),
            SubTotal = 15000m, TotalAmount = 15000m, PaidAmount = 10500m, Status = PurchaseStatus.Received, PaymentMethod = "BankTransfer",
            Items = new List<PurchaseItem>
            {
                new() { ProductId = p1.Id, Quantity = 20m, UnitCost = 750m }
            }
        };

        var pur2 = new Purchase
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, SupplierId = sup2.Id, BranchId = branch2.Id,
            PurchaseNumber = "PO-2026-0002", PurchaseDateUtc = DateTime.UtcNow.AddDays(-12),
            SubTotal = 6500m, TotalAmount = 6500m, PaidAmount = 4400m, Status = PurchaseStatus.Received, PaymentMethod = "BankTransfer",
            Items = new List<PurchaseItem>
            {
                new() { ProductId = p3.Id, Quantity = 100m, UnitCost = 65m }
            }
        };

        // 10. Sales (Sotuvlar jurnali - 10 ta to'liq tranzaksiya)
        var s1 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, CustomerId = c1.Id, EmployeeId = emp2.Id,
            SaleNumber = "INV-2026-00201", SaleDateUtc = DateTime.UtcNow.AddDays(-2),
            SubTotal = 13800m, DiscountAmount = 300m, TotalAmount = 13500m, TotalCostAmount = 5250m, PaidAmount = 11000m,
            Channel = SaleChannel.B2BContract, Status = SaleStatus.OnCredit, PaymentMethod = "BankTransfer",
            Items = new List<SaleItem>
            {
                new() { ProductId = p1.Id, Quantity = 10m, UnitPrice = 1150m, CostPrice = 450m },
                new() { ProductId = p4.Id, Quantity = 5m, UnitPrice = 460m, CostPrice = 150m }
            }
        };

        var s2 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, CustomerId = c2.Id, EmployeeId = emp3.Id,
            SaleNumber = "INV-2026-00202", SaleDateUtc = DateTime.UtcNow.AddDays(-4),
            SubTotal = 11200m, DiscountAmount = 200m, TotalAmount = 11000m, TotalCostAmount = 3900m, PaidAmount = 9200m,
            Channel = SaleChannel.B2BContract, Status = SaleStatus.OnCredit, PaymentMethod = "BankTransfer",
            Items = new List<SaleItem>
            {
                new() { ProductId = p2.Id, Quantity = 14m, UnitPrice = 800m, CostPrice = 280m }
            }
        };

        var s3 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, CustomerId = c3.Id, EmployeeId = emp2.Id,
            SaleNumber = "INV-2026-00203", SaleDateUtc = DateTime.UtcNow.AddDays(-6),
            SubTotal = 9800m, DiscountAmount = 0m, TotalAmount = 9800m, TotalCostAmount = 3400m, PaidAmount = 9800m,
            Channel = SaleChannel.B2BContract, Status = SaleStatus.Completed, PaymentMethod = "BankTransfer",
            Items = new List<SaleItem>
            {
                new() { ProductId = p1.Id, Quantity = 8m, UnitPrice = 1225m, CostPrice = 425m }
            }
        };

        var s4 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, CustomerId = c4.Id, EmployeeId = emp9.Id,
            SaleNumber = "INV-2026-00204", SaleDateUtc = DateTime.UtcNow.AddDays(-3),
            SubTotal = 9400m, DiscountAmount = 200m, TotalAmount = 9200m, TotalCostAmount = 3300m, PaidAmount = 8000m,
            Channel = SaleChannel.B2BContract, Status = SaleStatus.OnCredit, PaymentMethod = "BankTransfer",
            Items = new List<SaleItem>
            {
                new() { ProductId = p2.Id, Quantity = 12m, UnitPrice = 780m, CostPrice = 275m }
            }
        };

        var s5 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, CustomerId = c5.Id, EmployeeId = emp10.Id,
            SaleNumber = "INV-2026-00205", SaleDateUtc = DateTime.UtcNow.AddDays(-5),
            SubTotal = 8500m, DiscountAmount = 0m, TotalAmount = 8500m, TotalCostAmount = 3100m, PaidAmount = 8500m,
            Channel = SaleChannel.DirectRetail, Status = SaleStatus.Completed, PaymentMethod = "Card",
            Items = new List<SaleItem>
            {
                new() { ProductId = p4.Id, Quantity = 20m, UnitPrice = 425m, CostPrice = 155m }
            }
        };

        var s6 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, CustomerId = c6.Id, EmployeeId = emp3.Id,
            SaleNumber = "INV-2026-00206", SaleDateUtc = DateTime.UtcNow.AddDays(-7),
            SubTotal = 9500m, DiscountAmount = 300m, TotalAmount = 9200m, TotalCostAmount = 3200m, PaidAmount = 9200m,
            Channel = SaleChannel.B2BContract, Status = SaleStatus.Completed, PaymentMethod = "BankTransfer",
            Items = new List<SaleItem>
            {
                new() { ProductId = p3.Id, Quantity = 75m, UnitPrice = 120m, CostPrice = 40m }
            }
        };

        var s7 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, CustomerId = c7.Id, EmployeeId = emp9.Id,
            SaleNumber = "INV-2026-00207", SaleDateUtc = DateTime.UtcNow.AddDays(-8),
            SubTotal = 8900m, DiscountAmount = 100m, TotalAmount = 8800m, TotalCostAmount = 3150m, PaidAmount = 8800m,
            Channel = SaleChannel.OnlineECommerce, Status = SaleStatus.Completed, PaymentMethod = "Card",
            Items = new List<SaleItem>
            {
                new() { ProductId = p5.Id, Quantity = 40m, UnitPrice = 220m, CostPrice = 78m }
            }
        };

        var s8 = new Sale
        {
            Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, CustomerId = c8.Id, EmployeeId = emp2.Id,
            SaleNumber = "INV-2026-00208", SaleDateUtc = DateTime.UtcNow.AddDays(-1),
            SubTotal = 8500m, DiscountAmount = 0m, TotalAmount = 8500m, TotalCostAmount = 3100m, PaidAmount = 8500m,
            Channel = SaleChannel.DirectRetail, Status = SaleStatus.Completed, PaymentMethod = "Card",
            Items = new List<SaleItem>
            {
                new() { ProductId = p6.Id, Quantity = 25m, UnitPrice = 340m, CostPrice = 124m }
            }
        };

        // 11. Debts (Nasiya & Majburiyatlar)
        var debt1 = new DebtRecord { Id = Guid.NewGuid(), CompanyId = company.Id, Type = DebtType.CustomerDebt, CustomerId = c1.Id, SaleId = s1.Id, Title = "Alpha Tech Nasiya (INV-2026-00201)", TotalAmount = 2500m, PaidAmount = 0m, DueDateUtc = DateTime.UtcNow.AddDays(15), Status = DebtStatus.Active, Notes = "Shartnoma bo'yicha 15 kunlik muddat" };
        var debt2 = new DebtRecord { Id = Guid.NewGuid(), CompanyId = company.Id, Type = DebtType.CustomerDebt, CustomerId = c2.Id, SaleId = s2.Id, Title = "Orient Logistics Nasiya (INV-2026-00202)", TotalAmount = 1800m, PaidAmount = 0m, DueDateUtc = DateTime.UtcNow.AddDays(10), Status = DebtStatus.Active, Notes = "B2B buyurtmadan qolgan summa" };
        var debt3 = new DebtRecord { Id = Guid.NewGuid(), CompanyId = company.Id, Type = DebtType.CustomerDebt, CustomerId = c4.Id, SaleId = s4.Id, Title = "Tashkent City Smart (INV-2026-00204)", TotalAmount = 1200m, PaidAmount = 0m, DueDateUtc = DateTime.UtcNow.AddDays(20), Status = DebtStatus.Active, Notes = "Korporativ yetkazib berish" };
        var debt4 = new DebtRecord { Id = Guid.NewGuid(), CompanyId = company.Id, Type = DebtType.SupplierDebt, SupplierId = sup1.Id, PurchaseId = pur1.Id, Title = "TechGlobal Noutbuklar Xaridi Qarzimiz", TotalAmount = 4500m, PaidAmount = 0m, DueDateUtc = DateTime.UtcNow.AddDays(18), Status = DebtStatus.Active, Notes = "PO-2026-0001 bo'yicha qoldiq to'lov" };
        var debt5 = new DebtRecord { Id = Guid.NewGuid(), CompanyId = company.Id, Type = DebtType.SupplierDebt, SupplierId = sup2.Id, PurchaseId = pur2.Id, Title = "SmartAudio Quloqchinlar Qarzimiz", TotalAmount = 2100m, PaidAmount = 0m, DueDateUtc = DateTime.UtcNow.AddDays(14), Status = DebtStatus.Active, Notes = "PO-2026-0002 bo'yicha qoldiq to'lov" };

        // 12. Payments Ledger
        var payments = new List<Payment>
        {
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, SaleId = s1.Id, Type = PaymentType.InflowSale, Amount = 11000m, PaymentMethod = "BankTransfer", TransactionReference = "PAY-2026-001", PaymentDateUtc = DateTime.UtcNow.AddDays(-2), PayerOrPayee = c1.Name, Notes = "B2B Shartnoma to'lovi" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, SaleId = s2.Id, Type = PaymentType.InflowSale, Amount = 9200m, PaymentMethod = "BankTransfer", TransactionReference = "PAY-2026-002", PaymentDateUtc = DateTime.UtcNow.AddDays(-4), PayerOrPayee = c2.Name, Notes = "B2B Shartnoma to'lovi" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, SaleId = s3.Id, Type = PaymentType.InflowSale, Amount = 9800m, PaymentMethod = "BankTransfer", TransactionReference = "PAY-2026-003", PaymentDateUtc = DateTime.UtcNow.AddDays(-6), PayerOrPayee = c3.Name, Notes = "To'liq to'langan" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, SaleId = s4.Id, Type = PaymentType.InflowSale, Amount = 8000m, PaymentMethod = "BankTransfer", TransactionReference = "PAY-2026-004", PaymentDateUtc = DateTime.UtcNow.AddDays(-3), PayerOrPayee = c4.Name, Notes = "B2B avans to'lovi" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, SaleId = s5.Id, Type = PaymentType.InflowSale, Amount = 8500m, PaymentMethod = "Card", TransactionReference = "PAY-2026-005", PaymentDateUtc = DateTime.UtcNow.AddDays(-5), PayerOrPayee = c5.Name, Notes = "Karta orqali to'lov" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, SaleId = s6.Id, Type = PaymentType.InflowSale, Amount = 9200m, PaymentMethod = "BankTransfer", TransactionReference = "PAY-2026-006", PaymentDateUtc = DateTime.UtcNow.AddDays(-7), PayerOrPayee = c6.Name, Notes = "B2B to'liq to'lov" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, SaleId = s7.Id, Type = PaymentType.InflowSale, Amount = 8800m, PaymentMethod = "Card", TransactionReference = "PAY-2026-007", PaymentDateUtc = DateTime.UtcNow.AddDays(-8), PayerOrPayee = c7.Name, Notes = "Online to'lov" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, SaleId = s8.Id, Type = PaymentType.InflowSale, Amount = 8500m, PaymentMethod = "Card", TransactionReference = "PAY-2026-008", PaymentDateUtc = DateTime.UtcNow.AddDays(-1), PayerOrPayee = c8.Name, Notes = "Chakana savdo to'lovi" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, PurchaseId = pur1.Id, Type = PaymentType.OutflowPurchase, Amount = 10500m, PaymentMethod = "BankTransfer", TransactionReference = "SUPP-2026-001", PaymentDateUtc = DateTime.UtcNow.AddDays(-15), PayerOrPayee = sup1.Name, Notes = "Xarid avansi" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, PurchaseId = pur2.Id, Type = PaymentType.OutflowPurchase, Amount = 4400m, PaymentMethod = "BankTransfer", TransactionReference = "SUPP-2026-002", PaymentDateUtc = DateTime.UtcNow.AddDays(-12), PayerOrPayee = sup2.Name, Notes = "Xarid to'lovi" }
        };

        // 13. Expenses
        var expenses = new List<Expense>
        {
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, Category = ExpenseCategory.Rent, Amount = 3500m, ExpenseDateUtc = DateTime.UtcNow.AddDays(-25), Payee = "City Plaza Ijarasi", Description = "Bosh do'kon oylik ijara to'lovi", PaymentMethod = "BankTransfer", IsRecurring = true, RecurringFrequency = "Monthly" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, Category = ExpenseCategory.Rent, Amount = 2200m, ExpenseDateUtc = DateTime.UtcNow.AddDays(-24), Payee = "Bunyodkor Savdo Markazi", Description = "Chilonzor filiali oylik ijara to'lovi", PaymentMethod = "BankTransfer", IsRecurring = true, RecurringFrequency = "Monthly" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, Category = ExpenseCategory.Marketing, Amount = 2500m, ExpenseDateUtc = DateTime.UtcNow.AddDays(-15), Payee = "Meta & Google Ads", Description = "Raqamli targeted marketing va reklama kampaniyasi", PaymentMethod = "Card" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, Category = ExpenseCategory.SoftwareAndSaaS, Amount = 850m, ExpenseDateUtc = DateTime.UtcNow.AddDays(-18), Payee = "Cloud & ERP Xizmatlari", Description = "Server hosting, litsenziyalar va dasturiy ta'minot", PaymentMethod = "Card", IsRecurring = true },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, Category = ExpenseCategory.Utilities, Amount = 650m, ExpenseDateUtc = DateTime.UtcNow.AddDays(-20), Payee = "Toshkent Elektr & Suv", Description = "Bosh ofis kommunal to'lovlari", PaymentMethod = "BankTransfer" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, Category = ExpenseCategory.Utilities, Amount = 420m, ExpenseDateUtc = DateTime.UtcNow.AddDays(-19), Payee = "Chilonzor Kommunal Xizmat", Description = "Chilonzor filiali kommunal to'lovlari", PaymentMethod = "BankTransfer" },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, Category = ExpenseCategory.LogisticsAndDelivery, Amount = 980m, ExpenseDateUtc = DateTime.UtcNow.AddDays(-10), Payee = "Express Kuryer & Transport", Description = "Do'konlararo va mijozlarga yetkazib berish xizmati", PaymentMethod = "BankTransfer" }
        };

        // 14. Stock Movements (Dastlabki kirimlar tarixi)
        var stockMovements = new List<StockMovement>
        {
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = mainBranch.Id, ProductId = p1.Id, Type = StockMovementType.StockInPurchase, Quantity = 20m, PreviousQuantity = 12m, NewQuantity = 32m, ReferenceNumber = "PO-2026-0001", Reason = "TechGlobal xaridi", MovementDateUtc = DateTime.UtcNow.AddDays(-15) },
            new() { Id = Guid.NewGuid(), CompanyId = company.Id, BranchId = branch2.Id, ProductId = p3.Id, Type = StockMovementType.StockInPurchase, Quantity = 100m, PreviousQuantity = 0m, NewQuantity = 100m, ReferenceNumber = "PO-2026-0002", Reason = "SmartAudio xaridi", MovementDateUtc = DateTime.UtcNow.AddDays(-12) }
        };

        // 15. Audit & Notifications
        var notif = new Notification
        {
            Id = Guid.NewGuid(),
            CompanyId = company.Id,
            UserId = user.Id,
            Type = NotificationType.System,
            Title = "Barcha 10 ta Modul To'liq Faollashtirildi",
            Message = "Mahsulotlar, Ombor, Sotuvlar, Xaridlar, Qarzlar, To'lovlar va Yetkazib beruvchilar to'liq integratsiya qilindi.",
            LinkUrl = "/dashboard",
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        var audit = new AuditLog
        {
            Id = Guid.NewGuid(),
            CompanyId = company.Id,
            UserId = user.Id,
            UserEmail = user.Email,
            Action = "SYSTEM_ENTERPRISE_READY",
            EntityName = "EnterpriseSuite",
            EntityId = company.Id.ToString(),
            NewValuesJson = "{\"Modules\":[\"Products\",\"Inventory\",\"Sales\",\"Purchases\",\"Debts\",\"Payments\",\"Suppliers\",\"Reports\",\"Audit\"]}",
            IpAddress = "127.0.0.1",
            CreatedAtUtc = DateTime.UtcNow
        };

        context.Companies.Add(company);
        context.Users.AddRange(ownerUser, directorUser, managerUser, analystUser);
        context.UserCompanyRoles.AddRange(roleOwner, roleDirector, roleManager, roleAnalyst);
        context.Branches.AddRange(mainBranch, branch2);
        context.Suppliers.AddRange(sup1, sup2, sup3, sup4, sup5);
        context.Products.AddRange(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);
        context.Employees.AddRange(emp1, emp2, emp3, emp4, emp5, emp6, emp7, emp8, emp9, emp10, emp11, emp12);
        context.Customers.AddRange(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10);
        context.InventoryItems.AddRange(invList);
        context.Purchases.AddRange(pur1, pur2);
        context.Sales.AddRange(s1, s2, s3, s4, s5, s6, s7, s8);
        context.DebtRecords.AddRange(debt1, debt2, debt3, debt4, debt5);
        context.Payments.AddRange(payments);
        context.Expenses.AddRange(expenses);
        context.StockMovements.AddRange(stockMovements);
        context.Notifications.Add(notif);
        context.AuditLogs.Add(audit);

        await context.SaveChangesAsync();
    }
}
