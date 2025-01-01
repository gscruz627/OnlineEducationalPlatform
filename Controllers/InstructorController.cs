using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/instructors")]
    public class InstructorController : Controller
    {
        private readonly ILogger<InstructorController> _logger;
        private readonly ApplicationDBContext dbcontext;
        private readonly IConfiguration configuration;
        public InstructorController(ApplicationDBContext dbcontext, IConfiguration configuration, ILogger<InstructorController> logger)
        {
            this.dbcontext = dbcontext;
            this.configuration = configuration;
            this._logger = logger;
        }

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Get(Guid id)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var instructor = dbcontext.Instructors.Find(id);
            if (instructor is null)
            {
                return NotFound();
            }
            return Ok(instructor);
        }

        [HttpGet]
        [Authorize]
        public IActionResult GetAll()
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var instructors = dbcontext.Instructors.ToList();
            return Ok(instructors);
        }

        [HttpGet]
        [Authorize]
        [Route("search")]
        public IActionResult Search([FromQuery] string q)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);

            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            Console.WriteLine(q);
            var results = dbcontext.Instructors.Where((instructor) => instructor.Name.Contains(q) || instructor.Email.Contains(q)).ToList();
            return Ok(results);
        }

        [HttpPost]
        [Authorize]
        [Route("register")]
        public IActionResult Register(AddInstructorDTO instructorDTO)
        {
            // Verify that a valid administrator is making a register action
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminFound = dbcontext.Administrators.Find(userId);
            if (adminFound is null)
            {
                return Unauthorized();
            }
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

        [HttpPatch]
        [Authorize]
        [Consumes("text/plain")]
        [Route("{id:Guid}")]
        public IActionResult PatchName(Guid id, [FromBody] string newname)
        {

            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var instructor = dbcontext.Instructors.Find(id);
            if (instructor is null)
            {
                return NotFound();
            }
            instructor.Name = newname;
            dbcontext.SaveChanges();
            return Ok(instructor);
        }

        [HttpDelete]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult DeleteInstructor(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var instructor = dbcontext.Instructors.Find(id);
            if (instructor is null)
            {
                return NotFound();
            }
            dbcontext.Instructors.Remove(instructor);
            dbcontext.SaveChanges();
            return Ok("Instructor was removed");
        }

        [HttpGet]
        [Authorize]
        [Route("sections/{id:Guid}")]
        public IActionResult SectionsByInstructor(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var instructor = dbcontext.Instructors.Find(id);
            if(instructor is null)
            {
                return NotFound();
            }
            var sections = dbcontext.Sections.Where((section) => section.InstructorID == id);
            return Ok(sections);
        }
    }
}
