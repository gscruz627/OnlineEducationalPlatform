using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/announcements")]
    public class CourseAnnouncementController(ApplicationDBContext dbcontext) : Controller
    {
        private readonly ApplicationDBContext dbcontext = dbcontext;

        [HttpGet]
        [Authorize]
        [Route("{id:Guid}")]
        // GET api/announcements/0 -> Returns that one announcemennt
        public async Task<ActionResult<CourseAnnouncement>> GetAnnouncement(Guid id)
        {
            CourseAnnouncement? announcement = await dbcontext.CourseAnnouncements.FindAsync(id);
            if (announcement is null)
            {
                return NotFound();
            }
            return Ok(announcement);
        }

        [HttpGet]
        [Authorize]
        // GET api/announcements/section/0 -> Returns announcements per section
        public async Task<ActionResult<List<CourseAnnouncement>>> GetAll([FromQuery] string sectionId)
        {
            IQueryable<CourseAnnouncement> announcements = dbcontext.CourseAnnouncements.AsQueryable();
            if (!String.IsNullOrEmpty(sectionId))
            {
                announcements = announcements.Where((announcement) => announcement.SectionID == Guid.Parse(sectionId));
            }
            List<CourseAnnouncement> announcementsReturn = await announcements.ToListAsync();
            return Ok(announcements);
        }

        [HttpPatch]
        [Authorize(Roles = "instructor")]
        [Route("{id:Guid}")]
        // PATCH api/annnounncements/0 -> Edits this announcement
        public async Task<ActionResult<CourseAnnouncement>> Edit(Guid id, [FromBody] AddNewAnnouncementDTO announcementDTO)
        {
            CourseAnnouncement? announcement = await dbcontext.CourseAnnouncements.FindAsync(id);
            if (announcement is null)
            {
                return NotFound();
            }
            announcement.Title = announcementDTO.Title;
            announcement.SectionID = announcementDTO.SectionID;
            announcement.Description = announcementDTO.Description;
            await dbcontext.SaveChangesAsync();
            return Ok(announcement);
        }


        [HttpPost]
        [Authorize(Roles = "instructor")]
        // POST api/announcements -> Creates a new annnouncement.
        public async Task<ActionResult<CourseAnnouncement>> NewAnnouncement(AddNewAnnouncementDTO announcementDTO)
        {
            Section? section = await dbcontext.Sections.FindAsync(announcementDTO.SectionID);
            if (section is null)
            {
                return NotFound();
            }
            CourseAnnouncement announcement = new()
            {
                Title = announcementDTO.Title,
                Description = announcementDTO.Description,
                SectionID = announcementDTO.SectionID,
                Section = section
            };
            await dbcontext.CourseAnnouncements.AddAsync(announcement);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, announcement);
        }

        [HttpDelete]
        [Authorize(Roles = "instructor")]
        [Route("{id:Guid}")]
        // DELETE api/announcements/0 -> Deletes an announcement.
        public async Task<IActionResult> Delete(Guid id)
        {
            CourseAnnouncement? announcement = await dbcontext.CourseAnnouncements.FindAsync(id);
            if (announcement is null)
            {
                return NotFound();
            }
            dbcontext.CourseAnnouncements.Remove(announcement);
            return NoContent();
        }
    }
}
