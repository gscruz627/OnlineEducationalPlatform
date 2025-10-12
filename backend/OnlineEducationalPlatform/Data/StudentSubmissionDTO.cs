namespace OnlineEducationaAPI.Data
{
    public class StudentSubmissionDTO
    {
        public required Guid StudentID { get; set; }
        public required Guid AssignmentID { get; set; }
    }
}
