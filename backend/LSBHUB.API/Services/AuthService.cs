using LSBHUB.API.Data;
using LSBHUB.API.Helpers;
using LSBHUB.API.Models.DTOs.Auth;
using LSBHUB.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LSBHUB.API.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly JwtHelper _jwtHelper;

    public AuthService(AppDbContext db, JwtHelper jwtHelper)
    {
        _db = db;
        _jwtHelper = jwtHelper;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Проверка уникальности
        var emailExists = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (emailExists)
            throw new InvalidOperationException("EMAIL_TAKEN");

        var usernameExists = await _db.Users.AnyAsync(u => u.Username == request.Username);
        if (usernameExists)
            throw new InvalidOperationException("USERNAME_TAKEN");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return BuildResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new InvalidOperationException("INVALID_CREDENTIALS");

        return BuildResponse(user);
    }

    private AuthResponse BuildResponse(User user) => new()
    {
        Token = _jwtHelper.GenerateToken(user),
        User = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email
        }
    };
}