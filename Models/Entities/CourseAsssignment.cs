namespace OnlineEducationaAPI.Models.Entities
{
    public class CourseAsssignment
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required Guid SectionID { get; set; }
        public required string Description { get; set; }
        public required bool IsActive { get; set; }
        public required DateTime DueDate { get; set; }
    }
}
