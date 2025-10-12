using System.Text.Json.Serialization;

namespace OnlineEducationaAPI.Models.Entities
{
    public class CourseAssignment
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required Guid SectionID { get; set; }
        [JsonIgnore]
        public Section? Section { get; set; }
        public required string Description { get; set; }
        public required bool IsActive { get; set; }
        public required DateTime DueDate { get; set; }
        [JsonIgnore]
        public List<Submission> Submissions { get; set; } = [];
        public required int SubmissionLimit { get; set; }
        public required bool RequiresFileSubmission { get; set; }
    }
}
