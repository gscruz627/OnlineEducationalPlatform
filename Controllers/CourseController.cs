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

        [HttpGet]
        [Authorize (Policy = "RequireEither")]
        [Route("{id:Guid}")]
        // GET api/courses/0 -> Return a single course by id.
        public async Task<IActionResult> GetCourse(Guid id)
        { 
            var course = await dbcontext.Courses.FindAsync(id);
            return (course is null) ? NotFound() : Ok(course);
        }

        [HttpGet]
        [Authorize (Policy = "RequireEither")]
        // GET api/courses -> Returns all courses
        public async Task<IActionResult> GetAll()
        {
            var courses = await dbcontext.Courses.ToListAsync();
            return Ok(courses);
        }

        [HttpPost]
        [Authorize (Policy = "RequireAdmin")]
        // POST api/courses -> Creates a new course and returns its information
        public async Task<IActionResult> AddNew(AddNewCourseDTO courseDTO)
        {
            // Check if course under that name already exists
            var courseCheck = await dbcontext.Courses.FirstOrDefaultAsync( (course) => course.Title == courseDTO.Title);
            if (courseCheck is not null)
            {
                return Unauthorized();
            }
            var course = new Course()
            {
                Title = courseDTO.Title,
                CourseCode = courseDTO.CourseCode,
                ImageURL = courseDTO.ImageURL
            };
            await dbcontext.Courses.AddAsync(course);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction("GetCourse", new { id = course.Id }, course);
        }

        [HttpPatch]
        [Authorize (Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // PATCH api/courses/0 -> Edits the information of course by id and returns it
        public async Task<IActionResult> Edit(Guid id, [FromBody] AddNewCourseDTO courseDTO)
        {
            var course = await dbcontext.Courses.FindAsync(id);
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
        [Authorize(Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // DELETE api/courses/0 -> Removes course by id
        public async Task<IActionResult> Remove(Guid id)
        {
            var course = await dbcontext.Courses.FindAsync(id);

            if (course is null)
            {
                return NotFound();
            }
            dbcontext.Courses.Remove(course);
            await dbcontext.SaveChangesAsync();
            return Ok("Course was Removed");

        }
    }
}
