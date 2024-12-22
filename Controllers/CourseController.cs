using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

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
        public IActionResult GetAll()
        {
            var courses = dbcontext.Courses.ToList();
            return Ok(courses);
        }

        [HttpPost]
        public IActionResult AddNew(AddNewCourseDTO courseDTO)
        {
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
