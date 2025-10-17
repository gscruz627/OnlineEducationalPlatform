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

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Section>> GetSection(Guid id)
        {
            Section? section = await dbcontext.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == id);
            if (section is null)
            {
                return NotFound();
            }
            return Ok(section);
        }


        [HttpGet]
        [Authorize]
        // GET api/sections?sectionId={sectionId}&courseId={courseId}
        public async Task<ActionResult<List<object>>> GetSections([FromQuery] Guid? instructorId = null, [FromQuery] Guid? courseId = null)
        {
            var query = dbcontext.Sections.Include(s => s.Course).AsQueryable();

            if (instructorId.HasValue)
            {
                query = query.Where(s => s.InstructorID == instructorId.Value);
            }

            if (courseId.HasValue)
            {
                query = query.Where(s => s.CourseID == courseId.Value);
            }

            // otherwise return list
            var sections = await query.ToListAsync();
            return Ok(sections);
        }

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}/students")]
        public async Task<ActionResult<List<object>>> GetStudentsbySection(Guid id)
        // GET api/sections/0/students -> Get all students per section (by Id)
        {
            var students = await dbcontext.Enrollments
            .Where(enrollment => enrollment.SectionID == id)
            .Join(dbcontext.Users.Where(u => u.Role == "Student"),
            enrollment => enrollment.StudentID,
            student => student.Id,
            (enrollment, student) => new { student.Id, student.Name, student.Email })
            .ToListAsync();

            return Ok(students);
        }

        [HttpPatch("{id:guid}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Section>> Edit(Guid id, [FromBody] AddNewSectionDTO sectionDTO)
        {
            var section = await dbcontext.Sections.FindAsync(id);
            if (section is null)
                return NotFound();

            // Optional duplicate check only if both CourseID & SectionCode provided
            if (sectionDTO.CourseID != null && sectionDTO.SectionCode != null)
            {
                bool exists = await dbcontext.Sections
                    .AnyAsync(s => s.CourseID == sectionDTO.CourseID && s.SectionCode == sectionDTO.SectionCode);
                if (exists && (sectionDTO.SectionCode != section.SectionCode))
                    return BadRequest("A section with that code already exists for the given course.");
            }

            // Only update fields that are not null in the DTO
            if (sectionDTO.SectionCode != null)
                section.SectionCode = sectionDTO.SectionCode ?? section.SectionCode;

            if (sectionDTO.InstructorID != null)
                section.InstructorID = sectionDTO.InstructorID ?? section.InstructorID;

            if (sectionDTO.CourseID != null)
            {
                bool courseExists = await dbcontext.Courses.AnyAsync(c => c.Id == sectionDTO.CourseID);
                if (!courseExists)
                    return BadRequest("Invalid CourseID — course does not exist.");

                section.CourseID = sectionDTO.CourseID.Value;
            }

            if (sectionDTO.IsActive != null)
                section.IsActive = sectionDTO.IsActive.Value;

            await dbcontext.SaveChangesAsync();

            var editedSection = await dbcontext.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == id);

            return Ok(editedSection);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Section>> NewSection(AddNewSectionDTO sectionDTO)
        {
            // Validate required fields
            if (sectionDTO.SectionCode == null || sectionDTO.CourseID == null || sectionDTO.InstructorID == null)
                return BadRequest("SectionCode, CourseID and InstructorID are required.");

            // Check if a section already exists
            bool exists = await dbcontext.Sections
                .AnyAsync(s => s.SectionCode == sectionDTO.SectionCode && s.CourseID == sectionDTO.CourseID);
            if (exists)
                return BadRequest("Already one with that name!");

            Course? course = await dbcontext.Courses.FindAsync(sectionDTO.CourseID.Value);
            if (course == null)
                return BadRequest("Course does not exist");

            Section section = new()
            {
                CourseID = sectionDTO.CourseID.Value,
                Course = course,
                SectionCode = sectionDTO.SectionCode.Value,
                InstructorID = sectionDTO.InstructorID.Value,
                IsActive = sectionDTO.IsActive ?? true
            };

            await dbcontext.Sections.AddAsync(section);
            await dbcontext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSection), new { id = section.Id }, section);
        }


        [HttpDelete]
        [Authorize(Roles = "admin")]
        [Route("{id:Guid}")]
        // DELETE api/sections -> Remove a section by Id.
        public async Task<IActionResult> Remove(Guid id)
        {
            Section? section = await dbcontext.Sections.FindAsync(id);

            if (section is null)
            {
                return NotFound();
            }
            await dbcontext.Enrollments.Where((enrollment) => enrollment.SectionID == id).ExecuteDeleteAsync();
            dbcontext.Sections.Remove(section);
            await dbcontext.SaveChangesAsync();
            return NotFound();
        }
    }
}
