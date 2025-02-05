using Microsoft.AspNetCore.Authorization;
using OnlineEducationaAPI.Data;
using System.Security.Claims;

namespace OnlineEducationaAPI
{
    public class RoleAuthorizationHandler : AuthorizationHandler<RoleRequirement>
    {
        private readonly ApplicationDBContext _dbContext;

        public RoleAuthorizationHandler(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RoleRequirement requirement)
        {
            // Get 'sub' claim (name identifier) from the JWT
            var subClaim = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (subClaim == null || !Guid.TryParse(subClaim.Value, out Guid userId))
            {
                context.Fail();
                return Task.CompletedTask;
            }

            // Check if the user is an administrator or instructor based on the required role
            if (requirement.Role == "Admin")
            {
                var admin = _dbContext.Administrators.Find(userId);
                if (admin != null)
                {
                    context.Succeed(requirement); // User is an admin
                    return Task.CompletedTask;

                }
            }
            else if (requirement.Role == "Instructor")
            {
                var instructor = _dbContext.Instructors.Find(userId);
                if (instructor != null)
                {
                    context.Succeed(requirement); // User is an instructor
                    return Task.CompletedTask;

                }
            }
            else if (requirement.Role == "Either")
            {
                var admin = _dbContext.Administrators.Find(userId);
                var instructor = _dbContext.Instructors.Find(userId);
                if (admin != null || instructor != null)
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;

                }
            }

            context.Fail(); // If no match, fail the authorization
            return Task.CompletedTask;
        }
    }

}
