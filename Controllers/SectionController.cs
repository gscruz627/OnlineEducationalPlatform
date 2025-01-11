using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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
        [Route("course/{id:Guid}")]
        public IActionResult GetSectionsByCourse(Guid id)
        {
            var sections = dbcontext.Sections.Where((section) => section.CourseID == id).ToList();
            return Ok(sections);
        }

        [HttpGet]
        [Authorize]
        [Route("students/{id:Guid}")]
        public IActionResult GetStudentsbySection(Guid id)
        {
            var students = dbcontext.Enrollments
            .Where(enrollment => enrollment.SectionID == id)
            .Join(dbcontext.Students,
            enrollment => enrollment.StudentID,
            student => student.Id,
            (enrollment, student) => student)
            .ToList();

            return Ok(students);
        }

        [HttpPatch]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Edit(Guid id, [FromBody] AddNewSectionDTO sectionDTO)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var section = dbcontext.Sections.Find(id);
            if (section is null)
            {
                return NotFound();
            }
            var sectionCheck = dbcontext.Sections.FirstOrDefault((section) => section.SectionCode == sectionDTO.SectionCode);
            if ((sectionCheck is not null) && (sectionCheck.SectionCode != section.SectionCode))
            {
                return BadRequest("Already one with that name!");
            }
            section.SectionCode = sectionDTO.SectionCode;
            section.InstructorID = sectionDTO.InstructorID;
            section.CourseID = sectionDTO.CourseID;
            dbcontext.SaveChanges();
            return Ok(section);
        }

        [HttpPost]
        [Authorize]
        public IActionResult NewSection(AddNewSectionDTO sectionDTO){
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            // Check if a section already exist for the code
            var sectionCheck = dbcontext.Sections.FirstOrDefault((section) => section.SectionCode == sectionDTO.SectionCode);
            if (sectionCheck is not null)
            {
                return BadRequest("Already one with that name!");
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
        [Route("enroll/{id:Guid}")]
        public IActionResult GetEnrollment(Guid id)
        {
            var enrollment = dbcontext.Enrollments.Find(id);
            if (enrollment is null) {
                return NotFound();
            }
            return Ok(enrollment);
        }

        [HttpGet]
        [Authorize]
        [Route("enrollments/{id:Guid}")]
        public IActionResult GetEnrollmentsPerStudent(Guid id)
        {
            var student = dbcontext.Students.Find(id);
            if (student is null)
            {
                return NotFound();
            }
            var enrollments = dbcontext.Enrollments.Where((enrollment) => enrollment.StudentID == student.Id).ToList();
            List<Section> sections = new List<Section>();

            foreach (var enrollment in enrollments)
            {
                var section = dbcontext.Sections.Find(enrollment.SectionID);
                sections.Add(section);
            }
            List<Object> returnSections = new List<Object>();
            foreach (var section in sections)
            {
                var course = dbcontext.Courses.Find(section.CourseID);
                returnSections.Add(new
                {
                    Id = section.Id,
                    CourseId = section.CourseID,
                    SectionCode = section.SectionCode,
                    CourseCode = course.CourseCode,
                    Image = course.ImageURL,
                    Title = course.Title
                });
            }
            return Ok(returnSections);
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
            var check = dbcontext.Enrollments.FirstOrDefault((enrollment) => enrollment.StudentID == enrollmentDTO.StudentID && enrollment.SectionID == enrollmentDTO.SectionID);
            if (check is not null)
            {
                return BadRequest("Already enrolled");
            }
            dbcontext.Enrollments.Add(enrollment);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetEnrollment", new { id = enrollment.Id }, enrollment);
        }

        [HttpPatch]
        [Authorize]
        [Route("expell")]
        public IActionResult ExpellStudent(ExpellDTO expellStudentDTO)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (adminCheck is null && instructorCheck is null)
            {
                return Unauthorized();
            }
            var valid = dbcontext.Enrollments.FirstOrDefault((enrollment) => enrollment.StudentID == expellStudentDTO.MemberID && enrollment.SectionID == expellStudentDTO.SectionID);
            if(valid is null)
            {
                return NotFound();
            }
            dbcontext.Enrollments.Remove(valid);
            dbcontext.SaveChanges();
            return Ok("Student was expelled from such course section");
        }

        [HttpPatch]
        [Authorize]
        [Route("expell_instructor")]
        public IActionResult ExpellInstructor(ExpellDTO expellInstructorDTO)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var section = dbcontext.Sections.Find(expellInstructorDTO.SectionID);
            if (section is null)
            {
                return NotFound();
            }
            section.InstructorID = expellInstructorDTO.MemberID;
            dbcontext.SaveChanges();
            return Ok(section);
        }

        [HttpPatch]
        [Authorize]
        [Route("set_active/{id:Guid}")]
        public IActionResult SetActive(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var adminCheck = dbcontext.Administrators.Find(userId);
            if (adminCheck is null)
            {
                return Unauthorized();
            }
            var section = dbcontext.Sections.Find(id);
            if (section is null)
            {
                return NotFound();
            }
            section.IsActive = !section.IsActive;
            dbcontext.SaveChanges();
            return Ok(section);
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
            var section = dbcontext.Sections.Find(id);

            if (section is null)
            {
                return NotFound();
            }
            dbcontext.Sections.Remove(section);
            dbcontext.SaveChanges();
            return Ok("Section was Removed");

        }
    }
}
