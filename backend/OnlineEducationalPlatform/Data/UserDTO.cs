namespace OnlineEducationaAPI.Data
{
    public class UserDTO
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public required string Role { get; set; }
        public required string Password { get; set; }
    }
}
