using System.Text.Json.Serialization;

namespace OnlineEducationaAPI.Models.Entities
{
    public class CourseAnnouncement
    {
        public Guid Id { get; set; }

        [JsonIgnore]
        public Section? Section { get; set; }
        public required Guid SectionID { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
    }
}
