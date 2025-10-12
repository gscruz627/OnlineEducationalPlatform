namespace OnlineEducationaAPI.Data
{
    public class AddSubmissionDTO
    {
        public required Guid StudentID { get; set; }
        public required Guid AssignmentID { get; set; }
        public string? SubmissionFilename { get; set; }
        public string? Comments { get; set; }
    }
}
