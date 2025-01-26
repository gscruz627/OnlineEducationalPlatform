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
        [Authorize (Policy = "RequireEither")]
        [Route("{id:Guid}")]
        public IActionResult GetCourse(Guid id)
        { 
            var course = dbcontext.Courses.Find(id);
            return (course is null) ? NotFound() : Ok(course);
        }

        [HttpGet]
        [Authorize (Policy = "RequireEither")]
        public IActionResult GetAll()
        {
            var courses = dbcontext.Courses.ToList();
            return Ok(courses);
        }

        [HttpPost]
        [Authorize (Policy = "RequireAdmin")]
        public IActionResult AddNew(AddNewCourseDTO courseDTO)
        {
            // Check if course under that name already exists
            var courseCheck = dbcontext.Courses.FirstOrDefault( (course) => course.Title == courseDTO.Title);
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
            dbcontext.Courses.Add(course);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetCourse", new { id = course.Id }, course);
        }

        [HttpPatch]
        [Authorize (Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        public IActionResult Edit(Guid id, [FromBody] AddNewCourseDTO courseDTO)
        {
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
        [Authorize(Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        public IActionResult Remove(Guid id)
        {
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
