using Microsoft.AspNetCore.Mvc;
using OnlineEducationaAPI.Data;

namespace OnlineEducationaAPI.Controllers
{
    [ApiController]
    [Route("/authority")]
    public class AdministratorController : Controller
    {
        private readonly ApplicationDBContext dbcontext;
        private readonly IConfiguration configuration;

        public AdministratorController(ApplicationDBContext dbcontext, IConfiguration configuration)
        {
            this.dbcontext = dbcontext;
            this.configuration = configuration;
        }

        /*
        [HttpGet]
        [Route("/register")]
        public IActionResult Register(AdministratorDTO adminDTO)
        {
            var checkAdmin = dbcontext
        }
        */
    }
}
