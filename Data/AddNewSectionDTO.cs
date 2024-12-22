namespace OnlineEducationaAPI.Data
{
    public class AddNewSectionDTO
    {
        public required Guid CourseID { get; set; }
        public required int SectionCode { get; set; }

        // Students and Instructors
        public Guid InstructorID { get; set; }
    }
}
