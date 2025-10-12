namespace OnlineEducationaAPI.Data
{
    public class AddNewSectionDTO
    {
        public Guid? CourseID { get; set; }
        public int? SectionCode { get; set; }
        // Optional for setting active:
        public bool? IsActive { get; set; }

        // Students and Instructors
        public Guid? InstructorID { get; set; }
    }
}
