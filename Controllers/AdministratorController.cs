using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
    public class AdministratorController : Controller
    {
        private readonly ApplicationDBContext dbcontext;
        private readonly IConfiguration configuration;

        public AdministratorController(ApplicationDBContext dbcontext, IConfiguration configuration)
        {
            this.dbcontext = dbcontext;
            this.configuration = configuration;
        }

        [HttpPost]
        [Route("register")]
        public IActionResult Register(AdministratorDTO adminDTO)
        {
            var checkAdmin = dbcontext.Administrators.FirstOrDefault((admin) => admin.Username == adminDTO.Username);
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
            dbcontext.Administrators.Add(admin);
            dbcontext.SaveChanges();
            return Ok("Administrator was created");
        }

        [HttpPost]
        [Route("login")]
        public IActionResult Login(AdministratorDTO adminDTO)
        {
            var admin = dbcontext.Administrators.FirstOrDefault((admin) => admin.Username == adminDTO.Username);
            if (admin is null)
            {
                return Unauthorized();
            }
            var hasher = new PasswordHasher<Administrator>();
            var verified = hasher.VerifyHashedPassword(null, admin.Password, adminDTO.Password);

            if(verified != PasswordVerificationResult.Success)
            {
                return Unauthorized();
            }
            var key = configuration["jwt:secret_key"];
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()));

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: credentials
            );
            var jwt_token = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(jwt_token);
        }

    }
}
