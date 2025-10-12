using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [Route("api/enrollments")]
    [ApiController]
    public class EnrollmentsController(ApplicationDBContext _dbcontext) : ControllerBase
    {
        readonly ApplicationDBContext dbcontext = _dbcontext;

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}")]
        // GET api/enrollments/{id} -> Get enrollment by Id
        public async Task<ActionResult<Enrollment>> GetEnrollment(Guid id)
        {
            Enrollment? enrollment = await dbcontext.Enrollments.FindAsync(id);
            if (enrollment is null)
            {
                return NotFound();
            }
            return Ok(enrollment);
        }


        [HttpGet("enrollments")]
        [Authorize]
        // GET api/enrollments?studentId=...&sectionId=...
        public async Task<ActionResult<List<object>>> GetEnrollments([FromQuery] Guid? studentId = null, [FromQuery] Guid? sectionId = null)
        {
            // Start with all enrollments
            var query = dbcontext.Enrollments
                .Join(
                    dbcontext.Sections,
                    enrollment => enrollment.SectionID,
                    section => section.Id,
                    (enrollment, section) => new { enrollment, section }
                )
                .Join(
                    dbcontext.Courses,
                    es => es.section.CourseID,
                    course => course.Id,
                    (es, course) => new
                    {
                        EnrollmentId = es.enrollment.Id,
                        StudentId = es.enrollment.StudentID,
                        SectionId = es.section.Id,
                        es.section.SectionCode,
                        CourseId = course.Id,
                        course.CourseCode,
                        course.ImageURL,
                        course.Title
                    }
                );

            // Optional filters
            if (studentId.HasValue)
            {
                query = query.Where(e => e.StudentId == studentId.Value);
            }

            if (sectionId.HasValue)
            {
                query = query.Where(e => e.SectionId == sectionId.Value);
            }

            var results = await query.ToListAsync();
            return Ok(results);
        }

        [HttpPost]
        [Authorize]
        // POST api/enrollments -> Enroll a student into a section
        public async Task<ActionResult<Enrollment>> EnrollStudent(AddEnrollmentDTO enrollmentDTO)
        {
            Enrollment? check = await dbcontext.Enrollments.FirstOrDefaultAsync((enrollment) => enrollment.StudentID == enrollmentDTO.StudentID && enrollment.SectionID == enrollmentDTO.SectionID);
            if (check is not null)
            {
                return BadRequest("Already enrolled");
            }
            Enrollment enrollment = new()
            {
                SectionID = enrollmentDTO.SectionID,
                StudentID = enrollmentDTO.StudentID,
            };
            await dbcontext.Enrollments.AddAsync(enrollment);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEnrollment), new { id = enrollment.Id }, enrollment);
        }

        [HttpPost("{sectionId:guid}")]
        [Authorize]
        // DELETE api/enrollment -> Expell a student
        public async Task<IActionResult> ExpellStudent(Guid sectionId, ExpellDTO expellStudentDTO)
        {
            Enrollment? enrollment = await dbcontext.Enrollments.FirstOrDefaultAsync((enrollment) => enrollment.StudentID == expellStudentDTO.MemberID && enrollment.SectionID == sectionId);
            if (enrollment is null)
            {
                return NotFound();
            }
            dbcontext.Enrollments.Remove(enrollment);
            await dbcontext.SaveChangesAsync();
            return NotFound();
        }

    }
}
