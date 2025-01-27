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
        public async Task<IActionResult> GetAnnouncement(Guid id)
        {
            var announcement = await dbcontext.CourseAnnouncements.FindAsync(id);
            if (announcement is null)
            {
                return NotFound();
            }
            return Ok(announcement);
        }

        [HttpGet]
        [Authorize]
        [Route("section/{id:Guid}")]
        // GET api/announcements/section/0 -> Returns announcements per section
        public async Task<IActionResult> GetAnouncementsBySection(Guid id)
        {
            var announcements = await dbcontext.CourseAnnouncements.Where((announcement) => announcement.SectionID == id).ToListAsync();
            return Ok(announcements);
        }


        [HttpPatch]
        [Authorize(Policy = "Instructor")]
        [Route("{id:Guid}")]
        // PATCH api/annnounncements/0 -> Edits this announcement
        public async Task<IActionResult> Edit(Guid id, [FromBody] AddNewAnnouncementDTO announcementDTO)
        {
            var announcement = await dbcontext.CourseAnnouncements.FindAsync(id);
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
        [Authorize(Policy = "Instructor")]
        // POST api/announcements -> Creates a new annnouncement.
        public async Task<IActionResult> NewAnnouncement(AddNewAnnouncementDTO announcementDTO)
        {
            var announcement = new CourseAnnouncement()
            {
                Title = announcementDTO.Title,
                Description = announcementDTO.Description,
                SectionID = announcementDTO.SectionID
            };
            await dbcontext.CourseAnnouncements.AddAsync(announcement);
            await dbcontext.SaveChangesAsync();
            return CreatedAtAction("GetAnnouncement", new { id = announcement.Id }, announcement);
        }

        [HttpDelete]
        [Authorize(Policy = "Instructor")]
        [Route("{id:Guid}")]
        // DELETE api/announcements/0 -> Deletes an announcement.
        public async Task<IActionResult> Delete(Guid id)
        {
            var announcement = await dbcontext.CourseAnnouncements.FindAsync(id);
            if (announcement is null)
            {
                return NotFound();
            }
            dbcontext.CourseAnnouncements.Remove(announcement);
            return Ok("Deleted announcement");
        }
    }
}
