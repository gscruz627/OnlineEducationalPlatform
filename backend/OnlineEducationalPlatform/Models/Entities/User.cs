namespace OnlineEducationaAPI.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }

        public string? Email { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
    }
}
