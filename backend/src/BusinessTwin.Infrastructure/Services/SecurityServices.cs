using BusinessTwin.Application.Common.Interfaces;
using BusinessTwin.Domain.Entities;
using BusinessTwin.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BusinessTwin.Infrastructure.Services;

public class CurrentTenantService : ICurrentTenantService
{
    public Guid? CompanyId { get; private set; }
    public Guid? UserId { get; private set; }
    public string? UserEmail { get; private set; }
    public UserRole? Role { get; private set; }

    public void SetTenant(Guid companyId, Guid? userId = null, string? userEmail = null, UserRole? role = null)
    {
        CompanyId = companyId;
        UserId = userId;
        UserEmail = userEmail;
        Role = role;
    }
}

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(User user, Guid companyId, UserRole role)
    {
        var secret = _configuration["Jwt:Secret"] ?? "SuperSecretKeyForBusinessDigitalTwinMustBeAtLeast32CharsLong!";
        var issuer = _configuration["Jwt:Issuer"] ?? "BusinessDigitalTwin";
        var audience = _configuration["Jwt:Audience"] ?? "BusinessDigitalTwinClient";
        var expMinutes = int.TryParse(_configuration["Jwt:AccessTokenExpirationMinutes"], out var m) ? m : 60;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new(ClaimTypes.Role, role.ToString()),
            new("company_id", companyId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public RefreshToken GenerateRefreshToken(Guid userId, string? ipAddress)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        var expDays = int.TryParse(_configuration["Jwt:RefreshTokenExpirationDays"], out var d) ? d : 7;

        return new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(randomBytes),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(expDays),
            CreatedByIp = ipAddress
        };
    }
}
