using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/courses")]
    public class CourseController(ApplicationDBContext dbcontext) : Controller
    {
        private readonly ApplicationDBContext dbcontext = dbcontext;

        [HttpGet("{id:guid}")]
        [Authorize]
        // GET api/courses/0 -> Return a single course by id.
        public async Task<ActionResult<Course>> GetCourse(Guid id)
        { 
            Course? course = await dbcontext.Courses.FindAsync(id);
            return (course is null) ? NotFound() : Ok(course);
        }

        [HttpGet]
        [Authorize]
        // GET api/courses -> Returns all courses
        public async Task<ActionResult<List<Course>>> GetAll()
        {
            List<Course> coursesReturn = await dbcontext.Courses.ToListAsync();
            return Ok(coursesReturn);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        // POST api/courses -> Creates a new course and returns its information
        public async Task<ActionResult<Course>> New(AddNewCourseDTO courseDTO)
        {
            // Check if course under that name already exists
            Course? courseCheck = await dbcontext.Courses.FirstOrDefaultAsync( (course) => course.Title == courseDTO.Title);
            if (courseCheck is not null)
            {
                return Conflict("A Course with this name already exists.");
            }
            var course = new Course()
            {
                Title = courseDTO.Title,
                CourseCode = courseDTO.CourseCode,
                ImageURL = courseDTO.ImageURL
            };
            await dbcontext.Courses.AddAsync(course);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }

        [HttpPatch]
        [Authorize(Roles = "admin")]
        [Route("{id:Guid}")]
        // PATCH api/courses/0 -> Edits the information of course by id and returns it
        public async Task<ActionResult<CourseAssignment>> Edit(Guid id, [FromBody] AddNewCourseDTO courseDTO)
        {
            Course? course = await dbcontext.Courses.FindAsync(id);
            if (course is null)
            {
                return NotFound();
            }
            course.Title = courseDTO.Title;
            course.CourseCode = courseDTO.CourseCode;
            course.ImageURL = courseDTO.ImageURL;
            await dbcontext.SaveChangesAsync();
            return Ok(course);
        }

        [HttpDelete]
        [Authorize(Roles = "admin")]
        [Route("{id:Guid}")]
        // DELETE api/courses/0 -> Removes course by id
        public async Task<IActionResult> Remove(Guid id)
        {
            var course = await dbcontext.Courses.FindAsync(id);

            if (course is null)
            {
                return NotFound();
            }

            // Delete all sections under this CourseID first:
            await dbcontext.Sections.Where( (section) => section.CourseID == id).ExecuteDeleteAsync();
            dbcontext.Courses.Remove(course);
            await dbcontext.SaveChangesAsync();
            return NoContent();

        }
    }
}
