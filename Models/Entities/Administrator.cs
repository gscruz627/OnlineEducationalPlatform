﻿namespace OnlineEducationaAPI.Models.Entities
{
    public class Administrator
    {
        public Guid Id { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}