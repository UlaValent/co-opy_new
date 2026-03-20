using GameApp.Service.Dtos;

namespace GameApp.Service.Services;

public interface IGalleryService
{
    IEnumerable<ImageDto> ListImages();
    ImageDto? GetRandomImage();
    Task<ImageDto> SaveImageAsync(Stream fileStream, string fileName, long length, CancellationToken ct = default);
    string? GetImageFilePath(string imageId);
}