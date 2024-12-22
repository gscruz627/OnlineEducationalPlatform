using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/sections")]
    public class SectionController : Controller
    {
        private readonly ApplicationDBContext dbcontext;

        public SectionController(ApplicationDBContext dbcontext)
        {
            this.dbcontext = dbcontext;           
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public IActionResult GetSection(Guid id)
        {
            var section = dbcontext.Sections.Find(id);
            return Ok(section);
        }

        [HttpGet]
        [Route("/course/{id:Guid}")]
        public IActionResult GetSectionsByCourse(Guid id)
        {
            var sections = dbcontext.Sections.Where( (section) => section.CourseID == id).ToList();
            if (sections is null)
            {
                return NotFound();
            }
            return Ok(sections);
        }

        [HttpPost]
        public IActionResult NewSection(AddNewSectionDTO sectionDTO){
            var section = new Section()
            {
                CourseID = sectionDTO.CourseID,
                SectionCode = sectionDTO.SectionCode,
                InstructorID = sectionDTO.InstructorID,
                IsActive = true
            };
            dbcontext.Sections.Add(section);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetSection", new { id = section.Id }, section);
        }

        [HttpGet]
        [Route("enroll")]
        public IActionResult GetEnrollment(Guid id)
        {
            var enrollment = dbcontext.Enrollments.Find(id);
            if (enrollment is null) {
                return NotFound();
            }
            return Ok(enrollment);
        }

        [HttpPost]
        [Route("enroll")]
        public IActionResult EnrollStudent(AddEnrollmentDTO enrollmentDTO)
        {
            var enrollment = new Enrollment()
            {
                SectionID = enrollmentDTO.SectionID,
                StudentID = enrollmentDTO.StudentID,
            };
            dbcontext.Enrollments.Add(enrollment);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetEnrollment", new { id = enrollment.Id }, enrollment);
        }
    }
}
