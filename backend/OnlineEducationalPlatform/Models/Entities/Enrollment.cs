namespace OnlineEducationaAPI.Models.Entities
{
    public class Enrollment
    {
        public Guid Id {  get; set; } 
        public required Guid SectionID { get; set; }
        public required Guid StudentID { get; set; }
    }
}
