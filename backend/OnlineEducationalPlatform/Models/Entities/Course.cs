namespace OnlineEducationaAPI.Models.Entities
{
    public class Course
    {
        public Guid Id { get; set; }
        public required string CourseCode { get; set; }
        public required string Title { get; set; }
        public string? ImageURL { get; set; }
    }


}
