using System.ComponentModel.DataAnnotations;

namespace GameApp.Application.Requests;

public sealed class RefreshTokenRequest
{
    [Required]
    [MinLength(32)]
    [MaxLength(512)]
    public string RefreshToken { get; init; } = string.Empty;
}
