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
    public class InstructorController(ApplicationDBContext dbcontext, IConfiguration configuration) : Controller
    {
        private readonly ApplicationDBContext dbcontext = dbcontext;
        private readonly IConfiguration configuration = configuration;

        [HttpGet]
        [Authorize(Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // GET api/instructors/00000000-0000-0000-000000000000 -> Get instructor by Id
        public IActionResult Get(Guid id)
        {
            var instructor = dbcontext.Instructors.Where((instructor) => instructor.Id == id
                ).Select((instructor) => new { instructor.Id, instructor.Name, instructor.Email }).FirstOrDefault();
            return (instructor is null) ? NotFound() : Ok(instructor);
        }

        [HttpGet]
        [Authorize]
        // GET api/instructors -> Returns all instructors
        public IActionResult GetAll()
        {
            var instructors = dbcontext.Instructors.Select((instructor) => new { instructor.Id, instructor.Name, instructor.Email }).ToList();
            return Ok(instructors);
        }

        [HttpGet]
        [Authorize(Policy = "RequireAdmin")]
        [Route("search")]
        // GET api/instructors/search?q=searchTerm -> Returns instructors similar to 'searchTerm'
        public IActionResult Search([FromQuery] string q)
        {
            var results = dbcontext.Instructors.Where((instructor) => instructor.Name.Contains(q) || instructor.Email.Contains(q)
            ).Select((instructor) => new { instructor.Id, instructor.Name, instructor.Email }).ToList();
            return Ok(results);
        }

        [HttpPost]
        [Authorize(Policy = "RequireAdmin")]
        [Route("register")]
        // POST api/instructors -> Creates a new instructor
        public IActionResult Register(AddUserDTO instructorDTO)
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
            return CreatedAtAction("Get", new { instructor.Id }, instructor);
        }

        [HttpPost]
        [Route("login")]
        // POST api/instructors/login -> Returns an object with the instructor and the generated JWT
        public IActionResult Login(AuthenticateUserDTO instructorDTO)
        {
            var hasher = new PasswordHasher<Instructor>();

            // Let us assume that emails are unique within an institution
            var instructor = dbcontext.Instructors.FirstOrDefault((instructor) => instructor.Email == instructorDTO.Email);
            if (instructor is null)
            {
                return Unauthorized();
            }
            var verification_result = hasher.VerifyHashedPassword(null, instructor.Password, instructorDTO.Password);
            if (verification_result != PasswordVerificationResult.Success)
            {
                return Unauthorized();
            }

            // At this point, the instructor is authorized and a JWT will be generated
            var SECRET_KEY = configuration["jwt:secret_key"];
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SECRET_KEY));
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
            return Ok(new { Instructor = new { instructor.Id, instructor.Email, instructor.Name }, Token = jwt_token });
        }

        [HttpPatch]
        [Authorize(Policy = "RequireAdmin")]
        [Consumes("text/plain")]
        [Route("{id:Guid}")]
        // PATCH api/instructors/00000000-0000-0000-000000000000 -> Returns the modified instructor
        public IActionResult PatchName(Guid id, [FromBody] string newname)
        {

            var instructor = dbcontext.Instructors.Find(id);
            if (instructor is null)
            {
                return NotFound();
            }
            instructor.Name = newname;
            dbcontext.SaveChanges();
            return Ok(new { instructor.Id, instructor.Name, instructor.Email });
        }

        [HttpDelete]
        [Authorize(Policy="RequireInstructor")]
        [Route("{id:Guid}")]
        // DELETE api/instructors/00000000-0000-0000-000000000000 -> Deletetes the instructor.
        public IActionResult DeleteInstructor(Guid id)
        {
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
        [Authorize(Policy="RequireEither")]
        [Route("sections/{id:Guid}")]
        // GET api/instructors/sections/00000000-0000-0000-000000000000 -> Returns the sections the instructor
        // is teaching
        public IActionResult SectionsByInstructor(Guid id)
        {
            var instructor = dbcontext.Instructors.Find(id);
            if(instructor is null)
            {
                return NotFound();
            }
            var sections = dbcontext.Sections.Where((section) => section.InstructorID == id).ToList();
            List<Object> returnSections = new List<Object>();
            foreach(var section in sections)
            {
                var course = dbcontext.Courses.Find(section.CourseID);
                returnSections.Add(new
                {
                   section.Id,
                   section.CourseID,
                   section.SectionCode,
                   course.CourseCode,
                   course.ImageURL,
                   course.Title
                });
            }
            return Ok(returnSections);
        }
    }
}
