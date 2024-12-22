namespace OnlineEducationaAPI.Data
{
    public class AddNewCourseDTO
    {
        public required string CourseCode { get; set; }
        public required string Title { get; set; }
        public string? ImageURL { get; set; }
    }
}
