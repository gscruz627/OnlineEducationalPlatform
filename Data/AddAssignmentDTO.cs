﻿namespace OnlineEducationaAPI.Data
{
    public class AddAssignmentDTO
    {
        public required string Name { get; set; }
        public required Guid SectionID { get; set; }
        public required string Description { get; set; }
        public required bool IsActive { get; set; }
        public required DateTime DueDate { get; set; }
        public required int SubmissionLimit { get; set; }
        public required bool RequiresFileSubmission { get; set; }
    }
}
