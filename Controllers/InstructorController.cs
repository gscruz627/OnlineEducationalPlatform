using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/instructors")]
    public class InstructorController : Controller
    {
        private readonly ApplicationDBContext dbcontext;
        private readonly IConfiguration configuration;
        public InstructorController(ApplicationDBContext dbcontext, IConfiguration configuration)
        {
            this.dbcontext = dbcontext;
            this.configuration = configuration;
        }

        [HttpPost]
        [Route("register")]
        public IActionResult Register(AddInstructorDTO instructorDTO)
        {
            var hasher = new PasswordHasher<Instructor>();
            var instructor = new Instructor()
            {
                Email = instructorDTO.Email,
                Name = instructorDTO.Name,
                Password = hasher.HashPassword(null, instructorDTO.Password)
            };
            dbcontext.Instructors.Add(instructor);
            dbcontext.SaveChanges();
            return Ok("Successfully created Instructor");
        }
        [HttpPost]
        [Route("login")]
        public IActionResult Login(AuthenticateUserDTO instructorDTO)
        {
            var hasher = new PasswordHasher<Instructor>();
           // Let us assume that emails are unique within an institution
            var instructor = dbcontext.Instructors.FirstOrDefault((instructor) => instructor.Email == instructorDTO.Email);
            if (instructor is null)
            {
                return Unauthorized();
            }
            var verified = hasher.VerifyHashedPassword(null, instructor.Password, instructorDTO.Password);
            if (verified != PasswordVerificationResult.Success)
            {
                return Unauthorized();
            }

            // At this point, the instructor is authorized and a JWT will be generated
            var key = configuration["jwt:secret_key"];
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, instructor.Id.ToString()));

            //Create Security Token object by giving required parameters    
            var token = new JwtSecurityToken(
                            claims: claims,
                            expires: DateTime.Now.AddDays(1),
                            signingCredentials: credentials
                            );
            var jwt_token = new JwtSecurityTokenHandler().WriteToken(token);

            // We will return the jwt token and the client is responsible for decrypting
            // the token and getting the instructorID
            return Ok(jwt_token);
        }
    }
}
