namespace GameApp.Service.Options;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "GameApp";
    public string Audience { get; set; } = "GameApp.FrontEnd";
    public string SigningKey { get; set; } = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32_CHARS_MIN";
    public int ExpirationMinutes { get; set; } = 60;
    public int RefreshTokenExpirationDays { get; set; } = 14;
}
