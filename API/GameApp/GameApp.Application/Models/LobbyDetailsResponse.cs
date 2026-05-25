using GameApp.Service.Models;

namespace GameApp.Application.Models;

public sealed class LobbyDetailsResponse
{
    public string LobbyCode { get; init; } = string.Empty;
    public GameMode Mode { get; init; } = new GameMode();
}