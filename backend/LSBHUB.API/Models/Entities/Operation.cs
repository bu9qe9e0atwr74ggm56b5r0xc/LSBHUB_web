namespace LSBHUB.API.Models.Entities;

public class Operation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string OperationType { get; set; } = string.Empty; // "encode" | "decode"
    public string? OriginalImagePath { get; set; }
    public string? StegoImagePath { get; set; }
    public string? MessageText { get; set; }
    public string? EncryptionKey { get; set; }
    public short BitsCount { get; set; }
    public string ChannelsUsed { get; set; } = string.Empty; // например "RGB"
    public string LsbMethod { get; set; } = string.Empty;    // "linear" | "key" | "adaptive"
    public bool ChannelOrderRandom { get; set; }
    public decimal? MseValue { get; set; }
    public decimal? PsnrValue { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навигационное свойство
    public User User { get; set; } = null!;
}