using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/authority")]
    public class AdministratorController(ApplicationDBContext dbcontext, IConfiguration configuration) : Controller
    {
        private readonly ApplicationDBContext dbcontext = dbcontext;
        private readonly IConfiguration configuration = configuration;

        [HttpPost]
        [Route("register")]
        // GET api/authority/register -> Register a new administration.
        public async Task<IActionResult> Register(AdministratorDTO adminDTO)
        {

            var checkAdmin = await dbcontext.Administrators.FirstOrDefaultAsync((admin) => admin.Username == adminDTO.Username);
            if (checkAdmin is not null)
            {
                return Unauthorized();
            }
            
            var hasher = new PasswordHasher<Administrator>();
            var admin = new Administrator()
            {
                Username = adminDTO.Username,
                Password = hasher.HashPassword(null, adminDTO.Password)
            };
            await dbcontext.Administrators.AddAsync(admin);
            await dbcontext.SaveChangesAsync();
            return Ok("Administrator was created");
        }

        [HttpPost]
        [Route("login")]
        // POST api/authority/login -> Returns user's information and a jwt upon successful login.
        public async Task<IActionResult> Login(AdministratorDTO adminDTO)
        {
            var admin = await dbcontext.Administrators.FirstOrDefaultAsync((admin) => admin.Username == adminDTO.Username);
            if (admin is null)
            {
                return Unauthorized();
            }
            var hasher = new PasswordHasher<Administrator>();
            var verification_result = hasher.VerifyHashedPassword(null, admin.Password, adminDTO.Password);

            if(verification_result != PasswordVerificationResult.Success)
            {
                return Unauthorized();
            }
            var key = configuration["jwt:secret_key"];
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            List<Claim> claims = [];
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()));

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: credentials
            );
            var jwt_token = new JwtSecurityTokenHandler().WriteToken(token);
            
            // Return an object similar to the Administrator model but without the password, include the token.
            return Ok(new { Admin = new { admin.Id, admin.Username}, Token = jwt_token });
        }

        [HttpGet]
        [Authorize]
        [Route("user/{id:Guid}")]
        public async Task<IActionResult> GetAnyUser(Guid id)
        {
            var admin = await dbcontext.Administrators.FindAsync(id);
            if (admin is not null)
            {
                return Ok(new { User = admin, Role = "admin" });
            }
            var instructor = await dbcontext.Instructors.FindAsync(id);
            if (instructor is not null)
            {
                return Ok(new { User = instructor, Role = "instructor"});
            };
            var student = await dbcontext.Students.FindAsync(id);
            if (student is not null)
            {
                return Ok(new { User = student, Role = "student" });
            }
            return NotFound();
        }
    }
}
