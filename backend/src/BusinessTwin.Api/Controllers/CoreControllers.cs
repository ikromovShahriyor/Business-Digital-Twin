using BusinessTwin.Application.DTOs;
using BusinessTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessTwin.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.RegisterAsync(request, ip, cancellationToken);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.LoginAsync(request, ip, cancellationToken);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.RefreshTokenAsync(request.RefreshToken, ip, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("switch-company")]
    public async Task<ActionResult<AuthResponse>> SwitchCompany([FromBody] SwitchCompanyRequest request, CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var response = await _authService.SwitchCompanyAsync(request.CompanyId, ip, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var response = await _authService.GetCurrentUserAsync(cancellationToken);
        return Ok(response);
    }
}

[Authorize]
[ApiController]
[Route("api/digital-twin")]
public class DigitalTwinController : ControllerBase
{
    private readonly IDigitalTwinService _twinService;

    public DigitalTwinController(IDigitalTwinService twinService)
    {
        _twinService = twinService;
    }

    [HttpGet("snapshot")]
    public async Task<ActionResult<DigitalTwinSnapshotDto>> GetSnapshot(CancellationToken cancellationToken)
    {
        var snapshot = await _twinService.GetDigitalTwinSnapshotAsync(cancellationToken);
        return Ok(snapshot);
    }

    [HttpGet("node-graph")]
    public async Task<ActionResult<DigitalTwinNodeGraphDto>> GetNodeGraph(CancellationToken cancellationToken)
    {
        var graph = await _twinService.GetDigitalTwinNodeGraphAsync(cancellationToken);
        return Ok(graph);
    }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ScenariosController : ControllerBase
{
    private readonly IScenarioSimulationService _scenarioService;

    public ScenariosController(IScenarioSimulationService scenarioService)
    {
        _scenarioService = scenarioService;
    }

    [HttpPost("simulate")]
    public async Task<ActionResult<SimulationResultDto>> SimulateScenario([FromBody] SimulateScenarioRequest request, CancellationToken cancellationToken)
    {
        var result = await _scenarioService.SimulateScenarioAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<ScenarioSummaryDto>>> GetSavedScenarios(CancellationToken cancellationToken)
    {
        var list = await _scenarioService.GetSavedScenariosAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SimulationResultDto>> GetScenarioById(Guid id, CancellationToken cancellationToken)
    {
        var scenario = await _scenarioService.GetScenarioByIdAsync(id, cancellationToken);
        return Ok(scenario);
    }

    [HttpPost("compare")]
    public async Task<ActionResult<ScenarioComparisonDto>> CompareScenarios([FromBody] List<Guid> scenarioIds, CancellationToken cancellationToken)
    {
        var comparison = await _scenarioService.CompareScenariosAsync(scenarioIds, cancellationToken);
        return Ok(comparison);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteScenario(Guid id, CancellationToken cancellationToken)
    {
        var success = await _scenarioService.DeleteScenarioAsync(id, cancellationToken);
        if (!success) return NotFound();
        return NoContent();
    }
}
