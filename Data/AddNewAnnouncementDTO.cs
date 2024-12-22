namespace OnlineEducationaAPI.Data
{
    public class AddNewAnnouncementDTO
    {
        public required Guid SectionID { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
    }
}
