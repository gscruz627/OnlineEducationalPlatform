namespace OnlineEducationaAPI.Models.Entities
{
    public class Submission
    {
        public Guid Id { get; set; }
        public required Guid StudentID { get; set; }
        public required Guid AssignmentID { get; set; }
        public string? SubmissionFilename { get; set; }
        public string? Comments { get; set; }
    }
}
