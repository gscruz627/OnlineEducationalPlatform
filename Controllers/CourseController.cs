using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/courses")]
    public class CourseController : Controller
    {
        private readonly ApplicationDBContext dbcontext;
        public CourseController(ApplicationDBContext dbcontext)
        {
            this.dbcontext = dbcontext;
        }

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult GetCourse(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (adminCheck is null && instructorCheck is null)
            {
                return Unauthorized();
            }
            var course = dbcontext.Courses.Find(id);
            if (course is null)
            {
                return NotFound();
            }
            return Ok(course);
        }

        [HttpGet]
        [Authorize]
        public IActionResult GetAll()
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (adminCheck is null && instructorCheck is null)
            {
                return Unauthorized();
            }
            var courses = dbcontext.Courses.ToList();
            return Ok(courses);
        }

        [HttpPost]
        [Authorize]
        public IActionResult AddNew(AddNewCourseDTO courseDTO)
        {

            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            // Check if course under that name already exists
            var courseCheck = dbcontext.Courses.FirstOrDefault( (course) => course.Title == courseDTO.Title);
            if (courseCheck is not null)
            {
                Console.WriteLine("hello world");
                return Unauthorized();
            }
            var courseEntity = new Course()
            {
                Title = courseDTO.Title,
                CourseCode = courseDTO.CourseCode,
                ImageURL = courseDTO.ImageURL
            };
            dbcontext.Courses.Add(courseEntity);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetCourse", new { id = courseEntity.Id }, courseEntity);
        }

        [HttpPatch]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Edit(Guid id, [FromBody] AddNewCourseDTO courseDTO)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var course = dbcontext.Courses.Find(id);
            if (course is null)
            {
                return NotFound();
            }
            course.Title = courseDTO.Title;
            course.CourseCode = courseDTO.CourseCode;
            course.ImageURL = courseDTO.ImageURL;
            dbcontext.SaveChanges();
            return Ok(course);

        }

        [HttpDelete]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Remove(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var course = dbcontext.Courses.Find(id);

            if (course is null)
            {
                return NotFound();
            }
            dbcontext.Courses.Remove(course);
            dbcontext.SaveChanges();
            return Ok("Removed");

        }
    }
}
