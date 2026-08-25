using BusinessTwin.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace BusinessTwin.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDigitalTwinService, DigitalTwinService>();
        services.AddScoped<IScenarioSimulationService, ScenarioSimulationService>();
        services.AddScoped<IAiAdvisorService, AiAdvisorService>();
        services.AddScoped<IBusinessManagementService, BusinessManagementService>();

        return services;
    }
}
