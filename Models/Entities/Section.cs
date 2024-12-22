namespace OnlineEducationaAPI.Models.Entities
{
    public class Section
    {
        // Basic Information
        public Guid Id { get; set; }
        public required Guid CourseID { get; set; }
        public required int SectionCode { get; set; }

        // Students and Instructors
        public required Guid InstructorID { get; set; }
        public required bool IsActive { get; set; }
 
    }
}
