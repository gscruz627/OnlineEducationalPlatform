using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;

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
            var courses = dbcontext.Courses.ToList();
            return Ok(courses);
        }

        [HttpPost]
        [Authorize]
        public IActionResult AddNew(AddNewCourseDTO courseDTO)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var adminCheck = dbcontext.Administrators.Find(userId);
             if (adminCheck is null)
            {
                return Unauthorized();
            }
            // Check if course under that name already exists
            var courseCheck = dbcontext.Courses.FirstOrDefault( (course) => course.Title == courseDTO.Title);
            if (courseCheck is not null)
            {
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

    }
}
