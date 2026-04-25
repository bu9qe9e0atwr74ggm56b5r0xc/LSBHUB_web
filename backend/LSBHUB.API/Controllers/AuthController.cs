using LSBHUB.API.Models.DTOs.Auth;
using LSBHUB.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace LSBHUB.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message == "EMAIL_TAKEN")
        {
            return Conflict(new { error = "EMAIL_TAKEN", message = "This email is already registered." });
        }
        catch (InvalidOperationException ex) when (ex.Message == "USERNAME_TAKEN")
        {
            return Conflict(new { error = "USERNAME_TAKEN", message = "This username is already taken." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message == "INVALID_CREDENTIALS")
        {
            return Unauthorized(new { error = "INVALID_CREDENTIALS", message = "Invalid email or password." });
        }
    }
}