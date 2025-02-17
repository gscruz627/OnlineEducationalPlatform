using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/instructors")]
    public class InstructorController(ApplicationDBContext dbcontext, IConfiguration configuration) : Controller
    {
        private readonly ApplicationDBContext dbcontext = dbcontext;
        private readonly IConfiguration configuration = configuration;

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}")]
        // GET api/instructors/0 -> Get instructor by Id
        public async Task<IActionResult> Get(Guid id)
        {
            var instructor = await dbcontext.Instructors.Where((instructor) => instructor.Id == id
                ).Select((instructor) => new { instructor.Id, instructor.Name, instructor.Email }).FirstOrDefaultAsync();
            return (instructor is null) ? NotFound() : Ok(instructor);
        }

        [HttpGet]
        [Authorize]
        // GET api/instructors -> Returns all instructors
        public async Task<IActionResult> GetAll()
        {
            var instructors = await dbcontext.Instructors.Select((instructor) => new { instructor.Id, instructor.Name, instructor.Email }).ToListAsync();
            return Ok(instructors);
        }

        [HttpGet]
        [Authorize(Policy = "RequireAdmin")]
        [Route("search")]
        // GET api/instructors/search?q=searchTerm -> Returns instructors similar to 'searchTerm'
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            var results = await dbcontext.Instructors.Where((instructor) => instructor.Name.Contains(q) || instructor.Email.Contains(q)
            ).Select((instructor) => new { instructor.Id, instructor.Name, instructor.Email }).ToListAsync();
            return Ok(results);
        }

        [HttpPost]
        [Authorize(Policy = "RequireAdmin")]
        [Route("register")]
        // POST api/instructors -> Creates a new instructor
        public async Task<IActionResult> Register(AddUserDTO instructorDTO)
        {
            var existingUser = await dbcontext.Instructors.FirstOrDefaultAsync((instructor) => instructor.Name == instructorDTO.Name && instructor.Email == instructorDTO.Email);
            if (existingUser is not null)
            {
                return Unauthorized("Authentication Error");
            }
            var hasher = new PasswordHasher<Instructor>();
            var instructor = new Instructor()
            {
                Email = instructorDTO.Email,
                Name = instructorDTO.Name,
                Password = hasher.HashPassword(null, instructorDTO.Password)
            };
            await dbcontext.Instructors.AddAsync(instructor);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction("Get", new { instructor.Id }, new { instructor.Id, instructor.Name, instructor.Email });
        }

        [HttpPost]
        [Route("login")]
        // POST api/instructors/login -> Returns an object with the instructor and the generated JWT
        public async Task<IActionResult> Login(AuthenticateUserDTO instructorDTO)
        {
            var hasher = new PasswordHasher<Instructor>();

            // Let us assume that emails are unique within an institution
            var instructor = await dbcontext.Instructors.FirstOrDefaultAsync((instructor) => instructor.Email == instructorDTO.Email);
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
            var SECRET_KEY = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SECRET_KEY));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, instructor.Id.ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Iss, Environment.GetEnvironmentVariable("JWT_ISSUER")));
            claims.Add(new Claim(JwtRegisteredClaimNames.Aud, Environment.GetEnvironmentVariable("JWT_AUDIENCE")));

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
        // PATCH api/instructors/0 -> Returns the modified instructor
        public async Task<IActionResult> PatchName(Guid id, [FromBody] string newname)
        {

            var instructor = await dbcontext.Instructors.FindAsync(id);
            if (instructor is null)
            {
                return NotFound();
            }
            instructor.Name = newname;
            await dbcontext.SaveChangesAsync();
            return Ok(new { instructor.Id, instructor.Name, instructor.Email });
        }

        [HttpDelete]
        [Authorize(Policy="RequireAdmin")]
        [Route("{id:Guid}")]
        // DELETE api/instructors/0 -> Deletes an instructor by id.
        public async Task<IActionResult> DeleteInstructor(Guid id)
        {
            var instructor = await dbcontext.Instructors.FindAsync(id);
            if (instructor is null)
            {
                return NotFound();
            }
            var sectionsUnderInstructor = await dbcontext.Sections.Where((section) => section.InstructorID == id).ToListAsync();
            if (sectionsUnderInstructor.Count > 0)
            {
                return BadRequest(new { Message = "Must first expell instructor from sections and change their instructors", sectionsUnderInstructor.Count });
            }
            dbcontext.Instructors.Remove(instructor);
            await dbcontext.SaveChangesAsync();
            return Ok("Instructor was removed");
        }

        [HttpGet]
        [Authorize(Policy="RequireEither")]
        [Route("sections/{id:Guid}")]
        // GET api/instructors/sections/0 -> Returns the sections the instructor is teaching
        public async Task<IActionResult> SectionsByInstructor(Guid id)
        {
            var instructor = await dbcontext.Instructors.FindAsync(id);
            if(instructor is null)
            {
                return NotFound();
            }
            var sections = await dbcontext.Sections.Where((section) => section.InstructorID == id).ToListAsync();
            Console.WriteLine(sections.Count);
            Console.WriteLine(id);
            List<Object> returnSections = [];
            foreach(var section in sections)
            {
                var course = await dbcontext.Courses.FindAsync(section.CourseID);
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
