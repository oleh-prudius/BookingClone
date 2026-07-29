namespace Domain.Constants;

public static class PlaceCategories
{
    public const string Restaurant = "Restaurant";
    public const string Landmark = "Landmark";
    public const string Museum = "Museum";
    public const string Park = "Park";
    public const string Shopping = "Shopping";

    public static readonly IReadOnlyList<string> All = [
        Restaurant,
        Landmark,
        Museum,
        Park,
        Shopping
    ];
}
