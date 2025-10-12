namespace OnlineEducationaAPI.Data
{
    public class TokensDTO
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TokenExpiryDate { get; set; }
    }
}
