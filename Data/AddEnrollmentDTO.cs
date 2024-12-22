namespace OnlineEducationaAPI.Data
{
    public class AddEnrollmentDTO
    {
        public required Guid SectionID { get; set; }
        public required Guid StudentID { get; set; }
    }
}
