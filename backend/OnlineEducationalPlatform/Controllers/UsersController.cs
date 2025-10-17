using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineEducationaAPI.Data;
using OnlineEducationaAPI.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace OnlineEducationaAPI.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController(ApplicationDBContext dbcontext) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAll([FromQuery] string? role, [FromQuery] string? prompt)
        {
            IQueryable<User> users = dbcontext.Users.AsQueryable();
            if(role is not null)
            {
                users = users.Where(u => u.Role == role);
            }
            if (prompt is not null)
            {
                users = users.Where(u =>
                    u.Name.Contains(prompt) ||
                    (u.Email != null && u.Email.Contains(prompt)));
            }
            List<User> returnUsers = await users.ToListAsync();
            return returnUsers;
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserInfoDTO>> GetById(Guid id)
        {
            User? user = await dbcontext.Users.FindAsync(id);
            if(user is null) { return NotFound(); }

            UserInfoDTO infoDTO = new()
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
            };
            return Ok(infoDTO);
        }

        [HttpPost]
        public async Task<ActionResult<UserInfoDTO>> Register(UserDTO userDTO)
        {
            User? existingUser;
            if (userDTO.Role == "admin")
            {
                existingUser = await dbcontext.Users
                    .FirstOrDefaultAsync(u => u.Name == userDTO.Name && u.Role == "admin");
            }
            else
            {
                existingUser = await dbcontext.Users
                    .FirstOrDefaultAsync(u => u.Email == userDTO.Email && (u.Role == "student" || u.Role == "instructor"));
            }
            if (existingUser is not null)
            {
                return Conflict("There is already a user with that name or email address.");
            }
            PasswordHasher<User> hasher = new PasswordHasher<User>();
            User user = new()
            {
                Name = userDTO.Name,
                Password = hasher.HashPassword(null, userDTO.Password),
                Email = userDTO.Email,
                Role = userDTO.Role
            };
            await dbcontext.Users.AddAsync(user);
            await dbcontext.SaveChangesAsync();
            UserInfoDTO infoDTO = new()
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };

            return CreatedAtAction(nameof(GetById), new { user.Id }, infoDTO);
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokensDTO>> Login(UserDTO userDTO)
        {
            User? user = await dbcontext.Users.FirstOrDefaultAsync(u => u.Name == userDTO.Name || u.Email == userDTO.Email);
            if (user is null) { return Unauthorized("Incorrect Username or Password"); }
            PasswordHasher<User> passwordHasher = new();
            PasswordVerificationResult authenticated = passwordHasher.VerifyHashedPassword(null, user.Password, userDTO.Password);
            
            if(authenticated != PasswordVerificationResult.Success)
            {
                return Unauthorized("Incorrect Username | Email or Password");
            }

            string accessToken = GetAccessToken(user);
            string refreshToken = GetRefreshToken();

            user.AccessToken = accessToken;
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await dbcontext.SaveChangesAsync();

            TokensDTO tokensDTO = new()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                TokenExpiryDate = DateTime.UtcNow.AddDays(7)
            };


            return Ok(tokensDTO);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokensDTO>> RefreshToken(RefreshTokenDTO tokenDTO)
        {
            User? user = await dbcontext.Users.FirstOrDefaultAsync(u => u.RefreshToken == tokenDTO.RefreshToken);
            if(user == null || String.IsNullOrEmpty(tokenDTO.RefreshToken))
            {
                return BadRequest("Malformed Request: User or Token invalid");
            }
            if(user.RefreshTokenExpiry < DateTime.UtcNow)
            {
                return Unauthorized("Expired Refresh Token");
            }
            string accessToken = GetAccessToken(user);
            string refreshToken = GetRefreshToken();

            user.AccessToken = accessToken;
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await dbcontext.SaveChangesAsync();
            TokensDTO tokensDTO = new()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                TokenExpiryDate = DateTime.UtcNow.AddMinutes(15)
            };
            return Ok(tokensDTO);
        }

        [HttpPatch("{id:guid}")]
        public async Task<ActionResult<UserInfoDTO>> PatchUser(Guid id, [FromBody] PatchUserDTO userDTO)
        {
            User? user = await dbcontext.Users.FindAsync(id);
            if(user is null)
            {
                return NotFound();
            }
            user.Name = userDTO.Name;
            user.Email = userDTO.Email;
            await dbcontext.SaveChangesAsync();

            UserInfoDTO userInfoDTO = new()
            {
                Email = user.Email,
                Name = user.Name,
                Id = user.Id,
                Role = user.Role
            };
            return Ok(userInfoDTO);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            User? user = await dbcontext.Users.FindAsync(id);
            if(user is null)
            {
                return NotFound();
            }
            dbcontext.Users.Remove(user);
            await dbcontext.SaveChangesAsync();
            return NoContent();

        }

        [NonAction]
        public string GetAccessToken(User user)
        {
            List<Claim> claims = new()
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            // Add Name claim if it exists
            if (!string.IsNullOrWhiteSpace(user.Name))
            {
                claims.Add(new Claim(ClaimTypes.Name, user.Name));
            }

            // Add Email claim if it exists
            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                claims.Add(new Claim(ClaimTypes.Email, user.Email));
            }

            claims.Add(new Claim(ClaimTypes.Role, user.Role));

            var signingKey = Environment.GetEnvironmentVariable("SIGNING_KEY")
                 ?? "VeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKeyVeryVeryLongKey";

            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
            SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            JwtSecurityToken tokenDescriptor = new JwtSecurityToken(
                issuer: Environment.GetEnvironmentVariable("ISSUER"),
                audience: Environment.GetEnvironmentVariable("CLIENT_URL"),
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: credentials
             );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        [NonAction]
        public string GetRefreshToken()
        {
            byte[] randomNumber = new byte[32];

            using RandomNumberGenerator rg = RandomNumberGenerator.Create();
            rg.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
