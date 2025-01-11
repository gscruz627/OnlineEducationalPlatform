using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/assignments")]
    public class CourseAssignmentController : Controller
    {
        private readonly ApplicationDBContext dbcontext;
        public CourseAssignmentController(ApplicationDBContext dbcontext)
        {
            this.dbcontext = dbcontext;
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public IActionResult GetAssignment(Guid id)
        {
            var assignment = dbcontext.CourseAsssignments.Find(id);
            if (assignment is null)
            {
                return NotFound();
            }
            return Ok(assignment);
        }

        [HttpGet]
        [Authorize]
        [Route("sections/{id:Guid}")]
        public IActionResult GetBySection(Guid id)
        {
            var assignments = dbcontext.CourseAsssignments.Where((assignment) => assignment.SectionID == id).ToList();
            return Ok(assignments);
        }

        [HttpPost]
        [Authorize]
        public IActionResult NewAssignment(AddAssignmentDTO assignmentDTO)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (instructorCheck is null)
            {
                return Unauthorized();
            }
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
            dbcontext.CourseAsssignments.Add(assignment);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetAssignment", new { id = assignment.Id }, assignment);
        }

        [HttpPatch]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Edit(Guid id, [FromBody] AddAssignmentDTO assignmentDTO)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (instructorCheck is null)
            {
                return Unauthorized();
            }
            var assignment = dbcontext.CourseAsssignments.Find(id);
            if (assignment is null)
            {
                return NotFound();
            }
            assignment.SubmissionLimit = assignmentDTO.SubmissionLimit;
            assignment.RequiresFileSubmission = assignmentDTO.RequiresFileSubmission;
            assignment.DueDate = assignmentDTO.DueDate;
            assignment.Description = assignmentDTO.Description;
            assignment.Name = assignmentDTO.Name;
            dbcontext.SaveChanges();
            return Ok(assignment);

        }

        [HttpDelete]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Delete(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (instructorCheck is null)
            {
                return Unauthorized();
            }
            var assignment = dbcontext.CourseAsssignments.Find(id);
            if (assignment is null)
            {
                return NotFound();
            }
            dbcontext.CourseAsssignments.Remove(assignment);
            return Ok("Assignment was removed");
        }

        [HttpGet]
        [Authorize]
        [Route("submissions/{id:Guid}")]
        public IActionResult GetAllSubmissions(Guid id)
        {
            var userId = Guid.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (instructorCheck is null)
            {
                return Unauthorized();
            }
            var submissions = dbcontext.Submissions
            .Where(submission => submission.AssignmentID == id)
            .Join(dbcontext.Students,
                  submission => submission.StudentID,
                  student => student.Id,
                  (submission, student) => new
                  {
                      Id = submission.Id,
                      studentId = student.Id,
                      assignmentId = submission.Id,
                      submissionFilename = submission.SubmissionFilename,
                      comments = submission.Comments,
                      studentName = student.Name
                  })
            .ToList();

            return Ok(submissions);
        }

        [HttpGet]
        [Authorize]
        [Route("submissions_student/")]
        public IActionResult GetSubmissionsByStudent([FromQuery] Guid studentId, [FromQuery] Guid assignmentId)
        {
            var submissions = dbcontext.Submissions.Where((submission) => submission.AssignmentID == assignmentId && submission.StudentID == studentId).ToList();
            return Ok(submissions);
        }


        [HttpPost]
        [Authorize]
        [Route("submit")]
        public IActionResult MakeSubmission(AddSubmissionDTO assignmentDTO)
        {
            var verifyLimit = dbcontext.Submissions.Where((submission) => submission.StudentID == assignmentDTO.StudentID && submission.AssignmentID == assignmentDTO.AssignmentID).ToList().Count;
            var assignment = dbcontext.CourseAsssignments.Find(assignmentDTO.AssignmentID);
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
            dbcontext.Submissions.Add(submission);
            dbcontext.SaveChanges();
            return Ok(submission);
        }
    }
}
