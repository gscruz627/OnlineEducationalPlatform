using Microsoft.EntityFrameworkCore;
using OnlineEducationaAPI.Models.Entities;

namespace OnlineEducationaAPI.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions options) : base(options)
        {
            
        }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseAsssignment> CourseAsssignments { get; set; }
        public DbSet<CourseAnnouncement> CourseAnnouncements { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Instructor> Instructors { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Administrator> Administrators { get; set; }
        public DbSet<Submission> Submissions { get; set; }
    }
}
