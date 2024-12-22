using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("api/announcements")]
    public class CourseAnnouncementController : Controller
    {
        private readonly ApplicationDBContext dbcontext;

        public CourseAnnouncementController(ApplicationDBContext dbcontext)
        {
            this.dbcontext = dbcontext;
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public IActionResult GetAnnouncement(Guid id)
        {
            var announcement = dbcontext.CourseAnnouncements.Find(id);
            if (announcement is null)
            {
                return NotFound();
            }
            return Ok(announcement);
        }

        [HttpGet]
        [Route("/section/{id:Guid}")]
        public IActionResult GetAnouncementsBySection(Guid id)
        {
            var announcements = dbcontext.CourseAnnouncements.Where((announcement) => announcement.SectionID == id).ToList();
            return Ok(announcements);
        }

        [HttpPost]
        public IActionResult NewAnnouncement(AddNewAnnouncementDTO announcementDTO)
        {
            var announcement = new CourseAnnouncement()
            {
                Title = announcementDTO.Title,
                Description = announcementDTO.Description,
                SectionID = announcementDTO.SectionID
            };
            dbcontext.CourseAnnouncements.Add(announcement);
            dbcontext.SaveChanges();
            return CreatedAtAction("GetAnnouncement", new { id = announcement.Id }, announcement);
        }
    }
}
