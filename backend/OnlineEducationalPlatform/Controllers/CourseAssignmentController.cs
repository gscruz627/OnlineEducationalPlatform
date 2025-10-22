using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/assignments")]
    public class CourseAssignmentController(ApplicationDBContext dbcontext) : Controller
    {
        private readonly ApplicationDBContext dbcontext = dbcontext;

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}")]
        public async Task<ActionResult<CourseAssignment>> GetAssignment(Guid id)
        {
            CourseAssignment? assignment = await dbcontext.CourseAssignments.FindAsync(id);
            if (assignment is null)
            {
                return NotFound();
            }
            return Ok(assignment);
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<CourseAssignment>> GetAll([FromQuery] string sectionId)
        {
            IQueryable<CourseAssignment> assignments = dbcontext.CourseAssignments.AsQueryable();
            if (!String.IsNullOrEmpty(sectionId))
            {
                assignments = assignments.Where(a => a.SectionID == Guid.Parse(sectionId));
            }
            List<CourseAssignment> assignmentsReturn = await assignments.ToListAsync();
            return Ok(assignmentsReturn);
        }

        [HttpPost]
        [Authorize(Roles = "instructor")]
        public async Task<ActionResult<CourseAssignment>> NewAssignment(AddAssignmentDTO assignmentDTO)
        {
            Section? section = await dbcontext.Sections.FindAsync(assignmentDTO.SectionID);
            if (section is null)
            {
                return NotFound();
            }
            CourseAssignment assignment = new()
            {
                Description = assignmentDTO.Description,
                DueDate = DateTime.SpecifyKind(assignmentDTO.DueDate, DateTimeKind.Utc),
                IsActive = assignmentDTO.IsActive,
                Name = assignmentDTO.Name,
                SectionID = assignmentDTO.SectionID,
                Section = section,
                SubmissionLimit = assignmentDTO.SubmissionLimit,
                RequiresFileSubmission = assignmentDTO.RequiresFileSubmission
            };

            await dbcontext.CourseAssignments.AddAsync(assignment);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, assignment);
        }

        [HttpPatch]
        [Authorize(Roles = "instructor")]
        [Route("{id:Guid}")]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<CourseAssignment>> Edit(Guid id, [FromBody] AddAssignmentDTO assignmentDTO)
        {
            CourseAssignment? assignment = await dbcontext.CourseAssignments.FindAsync(id);
            if (assignment is null)
            {
                return NotFound();
            }

            assignment.SubmissionLimit = assignmentDTO.SubmissionLimit;
            assignment.RequiresFileSubmission = assignmentDTO.RequiresFileSubmission;
            assignment.DueDate = DateTime.SpecifyKind(assignmentDTO.DueDate, DateTimeKind.Utc); // ✅ Fix here
            assignment.Description = assignmentDTO.Description;
            assignment.Name = assignmentDTO.Name;

            await dbcontext.SaveChangesAsync();
            return Ok(assignment);
        }


        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "instructor")]
        // DELETE api/assignments/0 -> Deletes that assignment
        public async Task<IActionResult> Delete(Guid id)
        {
            CourseAssignment? assignment = await dbcontext.CourseAssignments.FindAsync(id);
            if (assignment is null)
            {
                return NotFound();
            }
            await dbcontext.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{assignmentId:Guid}/submissions")]
        [Authorize]
        public async Task<ActionResult<List<object>>> GetSubmissions(Guid assignmentId, [FromQuery] Guid? studentId = null)
        {
            var query = dbcontext.Submissions
                .Where(s => s.AssignmentID == assignmentId)
                .Join(
                    dbcontext.Users.Where(u => u.Role == "Student"),
                    submission => submission.StudentID,
                    user => user.Id,
                    (submission, student) => new
                    {
                        submissionId = submission.Id,
                        studentId = student.Id,
                        assignmentId = submission.AssignmentID,
                        submissionFilename = submission.SubmissionFilename,
                        comments = submission.Comments,
                        studentName = student.Name
                    }
                );

            if (studentId.HasValue)
            {
                query = query.Where(s => s.studentId == studentId.Value);
            }

            var results = await query.ToListAsync();
            return Ok(results);
        }

        [HttpPost("submit")]
        [Authorize]
        public async Task<ActionResult<Submission>> MakeSubmission(AddSubmissionDTO assignmentDTO)
        {
            List<Submission> verifyLimitGroup = await dbcontext.Submissions.Where((submission) => submission.StudentID == assignmentDTO.StudentID && submission.AssignmentID == assignmentDTO.AssignmentID).ToListAsync();
            int verifyLimit = verifyLimitGroup.Count;
            CourseAssignment? assignment = await dbcontext.CourseAssignments.FindAsync(assignmentDTO.AssignmentID);
            if (assignment is null)
            {
                return NotFound();
            }
            if (verifyLimit >= assignment.SubmissionLimit)
            {
                return Unauthorized("Cannot submit more than limit");
            }
            if (DateTime.UtcNow.CompareTo(assignment.DueDate) > 0){
                return Unauthorized("Due Date reached, cannot make new submissions.");
            }
            Submission submission = new()
            {
                AssignmentID = assignmentDTO.AssignmentID,
                StudentID = assignmentDTO.StudentID,
                Comments = assignmentDTO.Comments
            };
            if (assignment.RequiresFileSubmission)
            {
                if( (assignmentDTO.SubmissionFilename is null) || (assignmentDTO.SubmissionFilename.Length == 0))
                {
                    return BadRequest("Needs File Submission");
                }
                else
                {
                    submission.SubmissionFilename = assignmentDTO.SubmissionFilename;
                }
            }
            await dbcontext.Submissions.AddAsync(submission);
            await dbcontext.SaveChangesAsync();
            return Ok(submission);
        }
    }
}
