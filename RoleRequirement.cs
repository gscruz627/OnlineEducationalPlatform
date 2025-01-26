namespace OnlineEducationaAPI;
using Microsoft.AspNetCore.Authorization;

public class RoleRequirement(string role) : IAuthorizationRequirement
{
    public string Role = role;
}
