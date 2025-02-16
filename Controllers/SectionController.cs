using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/sections")]
    public class SectionController(ApplicationDBContext _dbcontext) : Controller
    {
        private readonly ApplicationDBContext dbcontext = _dbcontext;

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}")]
        // GET api/sections/0 -> Get section by Id
        public async Task<IActionResult> GetSection(Guid id)
        {
            var section = await dbcontext.Sections
            .Where(section => section.Id == id)
            .Join(dbcontext.Courses,
            section => section.CourseID,
            course => course.Id,
            (section, course) => new
            {
            section.Id,
            CourseId = section.CourseID,
            section.SectionCode,
            course.CourseCode,
            Image = course.ImageURL,
            course.Title,
            section.InstructorID

            }).FirstOrDefaultAsync();
            return Ok(section);
        }
        
        [HttpGet]
        [Authorize]
        [Route("course/{id:Guid}")]
        // GET api/sections/course/0 -> Get all sections by a specific course's Id.
        public async Task<IActionResult>GetSectionsByCourse(Guid id)
        {
            var sections = await dbcontext.Sections
            .Where(section => section.CourseID == id)
            .Join(dbcontext.Courses,
            section => section.CourseID,
            course => course.Id,
            (section, course) => new
            {
                section.Id,
                CourseId = section.CourseID,
                section.SectionCode,
                course.CourseCode,
                Image = course.ImageURL,
                course.Title,
                section.IsActive,
                section.InstructorID
            }).ToListAsync();
            return Ok(sections);
        }

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}/students")]
        public async Task<IActionResult> GetStudentsbySection(Guid id)
        // GET api/sections/0/students -> Get all students per section (by Id)
        {
            var students = await dbcontext.Enrollments
            .Where(enrollment => enrollment.SectionID == id)
            .Join(dbcontext.Students,
            enrollment => enrollment.StudentID,
            student => student.Id,
            (enrollment, student) => new { student.Id, student.Name, student.Email})
            .ToListAsync();

            return Ok(students);
        }

        [HttpPatch]
        [Authorize(Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // PATCH api/sections/0 -> Edit a section by id and return it
        public async Task<IActionResult> Edit(Guid id, [FromBody] AddNewSectionDTO sectionDTO)
        {
            Console.WriteLine(sectionDTO.InstructorID);
            var section = await dbcontext.Sections.FindAsync(id);
            if (section is null)
            {
                return NotFound();
            }
            if (section.InstructorID != sectionDTO.InstructorID)
            {
                section.InstructorID = sectionDTO.InstructorID;
                await dbcontext.SaveChangesAsync();
                var editedSection1 = await dbcontext.Sections
                            .Where(section => section.Id == id)
                            .Join(dbcontext.Courses,
                            section => section.CourseID,
                            course => course.Id,
                            (section, course) => new
                            {
                                section.Id,
                                CourseId = section.CourseID,
                                section.SectionCode,
                                course.CourseCode,
                                Image = course.ImageURL,
                                course.Title,
                                section.InstructorID

                            }).FirstOrDefaultAsync();
                return Ok(editedSection1);
            }
            var sectionCheck = await dbcontext.Sections.FirstOrDefaultAsync((section) => section.CourseID == sectionDTO.CourseID && section.SectionCode == sectionDTO.SectionCode);
            if (sectionCheck is not null)
            {
                return BadRequest("Already one with that name");
            }
            section.SectionCode = sectionDTO.SectionCode;
            section.InstructorID = sectionDTO.InstructorID;
            section.CourseID = sectionDTO.CourseID;
            await dbcontext.SaveChangesAsync();

            var editedSection = await dbcontext.Sections
            .Where(section => section.Id == id)
            .Join(dbcontext.Courses,
            section => section.CourseID,
            course => course.Id,
            (section, course) => new
            {
                section.Id,
                CourseId = section.CourseID,
                section.SectionCode,
                course.CourseCode,
                Image = course.ImageURL,
                course.Title,
                section.InstructorID

            }).FirstOrDefaultAsync();
            return Ok(editedSection);
        }

        [HttpPost]
        [Authorize(Policy = "RequireAdmin")]
        // POST api/sections -> Creates and returns a new section
        public async Task<IActionResult> NewSection(AddNewSectionDTO sectionDTO){
            // Check if a section already exist for the code
            var sectionCheck = await dbcontext.Sections.FirstOrDefaultAsync((section) => section.SectionCode == sectionDTO.SectionCode && section.CourseID == sectionDTO.CourseID);
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
            await dbcontext.Sections.AddAsync(section);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction("GetSection", new { id = section.Id }, section);
        }

        [HttpGet]
        [Authorize]
        [Route("enroll/{id:Guid}")]
        // GET api/sections/enroll/0 -> Get enrollment by Id
        public async Task<IActionResult> GetEnrollment(Guid id)
        {
            var enrollment = await dbcontext.Enrollments.FindAsync(id);
            if (enrollment is null) {
                return NotFound();
            }
            return Ok(enrollment);
        }

        [HttpGet]
        [Authorize]
        [Route("enrollments/{id:Guid}")]
        // GET api/sections/enrollments/0 -> Get enrollments (section information) per student
        public async Task<IActionResult> GetEnrollmentsPerStudent(Guid id)
        {
            var student = await dbcontext.Students.FindAsync(id);
            if (student is null)
            {
                return NotFound();
            }
            var enrollments = await dbcontext.Enrollments.Where((enrollment) => enrollment.StudentID == student.Id).ToListAsync();
            List<Object> sections = [];

            foreach (var enrollment in enrollments)
            {
                var section = await dbcontext.Sections
            .Where(section => section.Id == enrollment.SectionID)
            .Join(dbcontext.Courses,
                  section => section.CourseID,
                  course => course.Id,
                  (section, course) => new
                  {
                      section.Id,
                      CourseId = section.CourseID,
                      section.SectionCode,
                      course.CourseCode,
                      course.ImageURL,
                      course.Title
                  }).FirstOrDefaultAsync();
                sections.Add(section);
            }
            return Ok(sections);
        }

        [HttpPost]
        [Authorize]
        [Route("enroll")]
        // POST api/sections/enroll -> Enrolle a student into a section
        public async Task<IActionResult> EnrollStudent(AddEnrollmentDTO enrollmentDTO)
        {
            var check = await dbcontext.Enrollments.FirstOrDefaultAsync((enrollment) => enrollment.StudentID == enrollmentDTO.StudentID && enrollment.SectionID == enrollmentDTO.SectionID);
            if (check is not null)
            {
                return BadRequest("Already enrolled");
            }
            var enrollment = new Enrollment()
            {
                SectionID = enrollmentDTO.SectionID,
                StudentID = enrollmentDTO.StudentID,
            };        
            await dbcontext.Enrollments.AddAsync(enrollment);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction("GetEnrollment", new { id = enrollment.Id }, enrollment);
        }

        [HttpDelete]
        [Authorize (Policy = "RequireEither")]
        [Route("expell")]
        // DELETE api/sections/expell -> Expell a student from a section.
        public async Task<IActionResult> ExpellStudent(ExpellDTO expellStudentDTO)
        {
            var enrollment = await dbcontext.Enrollments.FirstOrDefaultAsync((enrollment) => enrollment.StudentID == expellStudentDTO.MemberID && enrollment.SectionID == expellStudentDTO.SectionID);
            if(enrollment is null)
            {
                return NotFound();
            }
            dbcontext.Enrollments.Remove(enrollment);
            await dbcontext.SaveChangesAsync();
            return Ok("Student was expelled from such course section");
        }

        [HttpDelete]
        [Authorize (Policy = "RequireAdmin")]
        [Route("expell_instructor")]
        // DELETE api/sections/expell_instructor -> Expell an instructor for a section and add replacement.
        public async Task<IActionResult> ExpellInstructor(ExpellDTO expellInstructorDTO)
        {
            var section = await dbcontext.Sections.FindAsync(expellInstructorDTO.SectionID);
            if (section is null)
            {
                return NotFound();
            }
            section.InstructorID = expellInstructorDTO.MemberID;
            await dbcontext.SaveChangesAsync();
            return Ok(section);
        }

        [HttpPatch]
        [Authorize (Policy = "RequireAdmin")]
        [Route("{id:Guid}/set_active")]
        // PATCH api/sections/0/set_active -> Set a section as active or inactive and return it.
        public async Task<IActionResult> SetActive(Guid id)
        {
            var section = await dbcontext.Sections.FindAsync(id);
            if (section is null)
            {
                return NotFound();
            }
            section.IsActive = !section.IsActive;
            await dbcontext.SaveChangesAsync();
            return Ok(section);
        }

        [HttpDelete]
        [Authorize(Policy = "RequireAdmin")]
        [Route("{id:Guid}")]
        // DELETE api/sections -> Remove a section by Id.
        public async Task<IActionResult> Remove(Guid id)
        {
            var section = await dbcontext.Sections.FindAsync(id);

            if (section is null)
            {
                return NotFound();
            }
            await dbcontext.Enrollments.Where((enrollment) => enrollment.SectionID == id).ExecuteDeleteAsync();
            dbcontext.Sections.Remove(section);
            await dbcontext.SaveChangesAsync();
            return Ok("Section was Removed");

        }
    }
}
