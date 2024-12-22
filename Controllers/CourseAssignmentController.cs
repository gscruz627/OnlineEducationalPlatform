using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("assignments")]
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
        [Route("sections/{id:Guid}")]
        public IActionResult GetBySection(Guid id)
        {
            var assignments = dbcontext.CourseAsssignments.Where((assignment) => assignment.SectionID == id).ToList();
            return Ok(assignments);
        }

        [HttpPost]
        public IActionResult NewAssignment(AddAssignmentDTO assignmentDTO)
        {
            var assignment = new CourseAsssignment()
            {
                Description = assignmentDTO.Description,
                DueDate = assignmentDTO.DueDate,
                IsActive = assignmentDTO.IsActive,
                Name = assignmentDTO.Name,
                SectionID = assignmentDTO.SectionID,
            };
            dbcontext.CourseAsssignments.Add(assignment);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetAssignment", new { id =  assignment.Id }, assignment);
        }
    }
}
