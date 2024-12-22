using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;

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
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult GetSection(Guid id)
        {
            var section = dbcontext.Sections.Find(id);
            return Ok(section);
        }

        [HttpGet]
        [Authorize]
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
        [Authorize]
        public IActionResult NewSection(AddNewSectionDTO sectionDTO){
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            // Check if a section already exist for the code
            var sectionCheck = dbcontext.Sections.FirstOrDefault((section) => section.SectionCode == sectionDTO.SectionCode);
            if (sectionCheck is not null)
            {
                return Unauthorized();
            }
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
        [Authorize]
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
        [Authorize]
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
