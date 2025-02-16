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
        // GET api/assignments/0 -> Returns one assignment
        public async Task<IActionResult> GetAssignment(Guid id)
        {
            var assignment = await dbcontext.CourseAsssignments.FindAsync(id);
            if (assignment is null)
            {
                return NotFound();
            }
            return Ok(assignment);
        }

        [HttpGet]
        [Authorize]
        [Route("sections/{id:Guid}")]
        // GET api/assignments/sections/0 -> Returns assignments for that section
        public async Task<IActionResult> GetBySection(Guid id)
        {
            var assignments = await dbcontext.CourseAsssignments.Where((assignment) => assignment.SectionID == id).ToListAsync();
            return Ok(assignments);
        }

        [HttpPost]
        [Authorize(Policy = "RequireInstructor")]
        // POST api/assignments -> Creates an assignment
        public async Task<IActionResult> NewAssignment(AddAssignmentDTO assignmentDTO)
        {
            var assignment = new CourseAsssignment()
            {
                Description = assignmentDTO.Description,
                DueDate = assignmentDTO.DueDate,
                IsActive = assignmentDTO.IsActive,
                Name = assignmentDTO.Name,
                SectionID = assignmentDTO.SectionID,
                SubmissionLimit = assignmentDTO.SubmissionLimit,
                RequiresFileSubmission = assignmentDTO.RequiresFileSubmission
            };
            await dbcontext.CourseAsssignments.AddAsync(assignment);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction("GetAssignment", new { id = assignment.Id }, assignment);
        }

        [HttpPatch]
        [Authorize(Policy = "RequireInstructor")]
        [Route("{id:Guid}")]
        // PATCH api/assignments/0 -> Modifies that assignment
        public async Task<IActionResult> Edit(Guid id, [FromBody] AddAssignmentDTO assignmentDTO)
        {
            var assignment = await dbcontext.CourseAsssignments.FindAsync(id);
            if (assignment is null)
            {
                return NotFound();
            }
            assignment.SubmissionLimit = assignmentDTO.SubmissionLimit;
            assignment.RequiresFileSubmission = assignmentDTO.RequiresFileSubmission;
            assignment.DueDate = assignmentDTO.DueDate;
            assignment.Description = assignmentDTO.Description;
            assignment.Name = assignmentDTO.Name;
            await dbcontext.SaveChangesAsync();
            return Ok(assignment);
        }

        [HttpDelete]
        [Authorize(Policy = "RequireInstructor")]
        [Route("{id:Guid}")]
        // DELETE api/assignments/0 -> Deletes that assignment
        public async Task<IActionResult> Delete(Guid id)
        {
            var assignment = await dbcontext.CourseAsssignments.FindAsync(id);
            if (assignment is null)
            {
                return NotFound();
            }
            await dbcontext.CourseAsssignments.FindAsync(assignment);
            return Ok("Assignment was removed");
        }

        [HttpGet]
        [Authorize(Policy = "RequireInstructor")]
        [Route("submissions/{id:Guid}")]
        // GET api/assignments/submissions/0 -> Returns all submissions and information for a section.
        public async Task<IActionResult> GetAllSubmissions(Guid id)
        {
            var submissions = await dbcontext.Submissions
            .Where(submission => submission.AssignmentID == id)
            .Join(dbcontext.Students,
                  submission => submission.StudentID,
                  student => student.Id,
                  (submission, student) => new
                  {
                      submissionId = submission.Id,
                      studentId = student.Id,
                      assignmentId = submission.Id,
                      submissionFilename = submission.SubmissionFilename,
                      comments = submission.Comments,
                      studentName = student.Name
                  })
            .ToListAsync();

            return Ok(submissions);
        }

        [HttpGet]
        [Authorize]
        [Route("submissions_student/")]
        // GET api/assignments/submission_student -> Returns submissions per assignment per one student.
        public async Task<IActionResult> GetSubmissionsByStudent([FromQuery] Guid studentId, [FromQuery] Guid assignmentId)
        {
            var submissions = await dbcontext.Submissions.Where((submission) => submission.AssignmentID == assignmentId && submission.StudentID == studentId).ToListAsync();
            return Ok(submissions);
        }


        [HttpPost]
        [Authorize]
        [Route("submit")]
        // POST api/assignments/submission -> Creates a submission
        public async Task<IActionResult> MakeSubmission(AddSubmissionDTO assignmentDTO)
        {
            var verifyLimitGroup = await dbcontext.Submissions.Where((submission) => submission.StudentID == assignmentDTO.StudentID && submission.AssignmentID == assignmentDTO.AssignmentID).ToListAsync();
            var verifyLimit = verifyLimitGroup.Count;
            var assignment = await dbcontext.CourseAsssignments.FindAsync(assignmentDTO.AssignmentID);
            if (assignment is null)
            {
                return NotFound();
            }
            if (verifyLimit >= assignment.SubmissionLimit)
            {
                return Unauthorized("Cannot submit more than limit");
            }
            var verifyDate = DateTime.Today;
            if (verifyDate.CompareTo(assignment.DueDate) > 0){
                return Unauthorized("Due Date reached, cannot make new submissions. Sorry!");
            }
            var submission = new Submission()
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
