using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateBookingDto
{
    [Required]
    public long RoomVariantId { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;

    [Required]
    public DateTime CheckIn { get; set; }

    [Required]
    public DateTime CheckOut { get; set; }

    [Range(0, double.MaxValue)]
    public decimal TotalPrice { get; set; }

    public string? PersonalWishes { get; set; }

    public IReadOnlyList<BreakfastSelectionDto>? Breakfasts { get; set; }
}
