using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;

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
        [Authorize]
        [Route("section/{id:Guid}")]
        public IActionResult GetAnouncementsBySection(Guid id)
        {
            var announcements = dbcontext.CourseAnnouncements.Where((announcement) => announcement.SectionID == id).ToList();
            return Ok(announcements);
        }


        [HttpPatch]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Edit(Guid id, [FromBody] AddNewAnnouncementDTO announcementDTO)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (instructorCheck is null)
            {
                return Unauthorized();
            }
            var announcement = dbcontext.CourseAnnouncements.Find(id);
            if (announcement is null)
            {
                return NotFound();
            }
            announcement.Title = announcementDTO.Title;
            announcement.SectionID = announcementDTO.SectionID;
            announcement.Description = announcementDTO.Description;
            dbcontext.SaveChanges();
            return Ok(announcement);
            
        }


        [HttpPost]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult NewAnnouncement(AddNewAnnouncementDTO announcementDTO)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (instructorCheck is null)
            {
                return Unauthorized();
            }
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

        [HttpDelete]
        [Authorize]
        [Route("{id:Guid}")]
        public IActionResult Delete(Guid id)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            var instructorCheck = dbcontext.Instructors.Find(userId);
            if (instructorCheck is null)
            {
                return Unauthorized();
            }
            var announcement = dbcontext.CourseAnnouncements.Find(id);
            if (announcement is null)
            {
                return NotFound();
            }
            dbcontext.CourseAnnouncements.Remove(announcement);
            return Ok("Deleted announcement");
        }
    }
}
