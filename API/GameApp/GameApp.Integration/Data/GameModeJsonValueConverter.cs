using System.Text.Json;
using GameApp.Service.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace GameApp.Integration.Data;

public sealed class GameModeJsonValueConverter : ValueConverter<GameMode, string>
{
    public GameModeJsonValueConverter()
        : base(
            mode => Serialize(mode),
            json => Deserialize(json))
    {
    }

    private static string Serialize(GameMode mode)
        => JsonSerializer.Serialize(mode, (JsonSerializerOptions?)null);

    private static GameMode Deserialize(string json)
        => string.IsNullOrWhiteSpace(json)
            ? new GameMode()
            : JsonSerializer.Deserialize<GameMode>(json) ?? new GameMode();
}