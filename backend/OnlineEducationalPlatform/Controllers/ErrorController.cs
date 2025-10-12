using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace OnlineEducationaAPI.Controllers
{
    [Route("error")]
    [ApiController]
    public class ErrorController : Controller
    {
        [HttpGet]
        public IActionResult Error()
        {
            var context = HttpContext.Features.Get<IExceptionHandlerFeature>();
            var exception = context?.Error;

            Console.WriteLine($"Unhandled exception: {exception?.Message}");

            return Problem(
                detail: "An unexpected error occurred.",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }
}
