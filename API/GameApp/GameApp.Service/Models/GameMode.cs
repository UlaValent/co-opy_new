namespace GameApp.Service.Models;

public enum GameModePreset
{
    Standard,
    Short,
    Long,
    Multiplayer
}

public class GameMode
{
    public GameModePreset Preset { get; set; } = GameModePreset.Standard;
    public int MaxPlayers { get; set; } = 2;
    public int RoundSeconds { get; set; } = 300;

    public static GameMode FromPreset(GameModePreset preset)
    {
        return preset switch
        {
            GameModePreset.Short => new GameMode { Preset = preset, MaxPlayers = 2, RoundSeconds = 180 },
            GameModePreset.Long => new GameMode { Preset = preset, MaxPlayers = 2, RoundSeconds = 480 },
            GameModePreset.Multiplayer => new GameMode { Preset = preset, MaxPlayers = 4, RoundSeconds = 300 },
            _ => new GameMode { Preset = GameModePreset.Standard, MaxPlayers = 2, RoundSeconds = 300 }
        };
    }
}
