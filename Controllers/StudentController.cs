using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/students")]
    public class StudentController : Controller
    {
        private readonly ApplicationDBContext dbcontext;
        private readonly IConfiguration configuration;

        public StudentController(ApplicationDBContext dbcontext, IConfiguration configuration)
        {
            this.dbcontext = dbcontext;
            this.configuration = configuration;
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public IActionResult GetStudent(Guid id)
        {
            var student = dbcontext.Students.Find(id);
            if (student is null)
            {
                return NotFound();
            }
            return Ok(student);
        }

        [HttpGet]
        [Authorize]
        public IActionResult GetAll()
        {
            var students = dbcontext.Students.ToList();
            return Ok(students);
        }
        [HttpPost]
        [Authorize]
        [Route("register")]
        public IActionResult Register(AddStudentDTO studentDTO)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var studentCheck = dbcontext.Students.FirstOrDefault((student) => student.Email == studentDTO.Email);
            if (studentCheck is not null)
            {
                return BadRequest("User by that name already exists!");
            }
            var hasher = new PasswordHasher<Instructor>();

            var student = new Student()
            {
                Email = studentDTO.Email,
                Name = studentDTO.Name,
                Password = hasher.HashPassword(null, studentDTO.Password)
            };
            dbcontext.Students.Add(student);
            dbcontext.SaveChanges();
            return Ok(student);
        }

        [HttpPost]
        [Route("login")]
        public IActionResult Login(AuthenticateUserDTO studentDTO)
        {
            var student = dbcontext.Students.FirstOrDefault((student) => student.Email == studentDTO.Email);
            if (student is null)
            {
                return Unauthorized();
            }
            var hasher = new PasswordHasher<Instructor>();
            var verified = hasher.VerifyHashedPassword(null, student.Password, studentDTO.Password);
            if (verified != PasswordVerificationResult.Success)
            {
                return Unauthorized();
            }

            var key = configuration["jwt:secret_key"];
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, student.Id.ToString()));

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: credentials
            );
            var jwt_token = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(jwt_token);
        }

        [HttpPatch]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult PatchName(Guid id, [FromBody] string newname)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var student = dbcontext.Students.Find(id);
            if (student is null)
            {
                return NotFound();
            }
            student.Name = newname;
            dbcontext.SaveChanges();
            return Ok(student);
        }

        [HttpDelete]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult DeleteStudent(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var student = dbcontext.Students.Find(id);
            if (student is null)
            {
                return NotFound();
            }
            dbcontext.Students.Remove(student);
            dbcontext.SaveChanges();
            return Ok("Student was removed");
        }
    }
}
