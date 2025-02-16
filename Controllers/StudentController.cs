using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/students")]
    public class StudentController(ApplicationDBContext dbcontext, IConfiguration configuration) : Controller
    {
        private readonly ApplicationDBContext dbcontext = dbcontext;
        private readonly IConfiguration configuration = configuration;

        [HttpGet]
        [Authorize(Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // GET api/students/0 -> Return student by Id.
        public async Task<IActionResult> GetStudent(Guid id)
        {
            var student = await dbcontext.Students.Where((student) => student.Id == id
            ).Select((student) => new { student.Id, student.Name, student.Email }
            ).FirstOrDefaultAsync();
            
            return (student is null) ? NotFound() : Ok(student);
        }

        [HttpGet]
        [Authorize(Policy = "RequireAdmin")]
        [Authorize]
        // GET api/students -> Get all students
        public async Task<IActionResult> GetAll()
        {
            var students = await dbcontext.Students.Select((student) => new { student.Id, student.Name, student.Email }).ToListAsync();
            return Ok(students);
        }

        [HttpPost]
        [Authorize (Policy = "RequireAdmin")]
        [Route("register")]
        // POST api/students/register -> Register a new student
        public async Task<IActionResult> Register(AddUserDTO studentDTO)
        {
            var studentCheck = await dbcontext.Students.FirstOrDefaultAsync((student) => student.Email == studentDTO.Email);
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
            await dbcontext.Students.AddAsync(student);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction("GetStudent", new { student.Id }, new { student.Id, student.Name, student.Email });
        }

        [HttpPost]
        [Route("login")]
        // POST api/students/login -> Authenticate a user and return information and token.
        public async Task<IActionResult> Login(AuthenticateUserDTO studentDTO)
        {
            var student = await dbcontext.Students.FirstOrDefaultAsync((student) => student.Email == studentDTO.Email);
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

            List<Claim> claims = [];
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, student.Id.ToString()));

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: credentials
            );
            var jwt_token = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { Student = new { student.Id, student.Email, student.Name }, Token = jwt_token });
        }

        [HttpGet]
        [Authorize(Policy = "RequireAdmin")]
        [Route("search")]
        // GET api/students/search?q=searchTerm -> Returns Students similar to 'searchTerm'
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            var results = await dbcontext.Students.Where((student) => student.Name.Contains(q) || student.Email.Contains(q)
            ).Select((student) => new { student.Id, student.Name, student.Email }).ToListAsync();
            return Ok(results);
        }

        [HttpPatch]
        [Authorize (Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // PATCH api/students/0 -> Edits the name of a student by Id.
        public async Task<IActionResult> PatchName(Guid id, [FromBody] string newname)
        {
            var student = await dbcontext.Students.FindAsync(id);
            if (student is null)
            {
                return NotFound();
            }
            student.Name = newname;
            await dbcontext.SaveChangesAsync();
            return Ok(new { student.Id, student.Name, student.Email});
        }

        [HttpDelete]
        [Authorize (Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // DELETE api/students/0 -> Deletes a student by Id.
        public async Task<IActionResult> DeleteStudent(Guid id)
        {
            var student = await dbcontext.Students.FindAsync(id);
            if (student is null)
            {
                return NotFound();
            }
            dbcontext.Students.Remove(student);
            await dbcontext.SaveChangesAsync();
            return Ok("Student was removed");
        }
    }
}
