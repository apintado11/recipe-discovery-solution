namespace RecipeDiscovery.Api.Auth;

public static class AuthRules
{
    public const string DemoPassword = "cookbook";

    public const int ResetMinutes = 30;

    public static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    public static string? CheckName(string? name)
    {
        var trimmed = name?.Trim() ?? "";
        if (trimmed.Length is < 1 or > 40)
        {
            return "Enter a name, up to 40 characters.";
        }

        if (trimmed.Any(char.IsControl))
        {
            return "The name has characters that can't be used.";
        }

        return null;
    }

    public static string? CheckEmail(string? email)
    {
        var trimmed = email?.Trim() ?? "";
        if (trimmed.Length is < 3 or > 254 || !IsEmail(trimmed))
        {
            return "Enter a valid email address.";
        }

        return null;
    }

    public static string? CheckPassword(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
        {
            return "Use at least 8 characters.";
        }

        if (password.Length > 128)
        {
            return "Use a password of 128 characters or fewer.";
        }

        if (!password.Any(char.IsLetter) || !password.Any(char.IsDigit))
        {
            return "Use at least one letter and one number.";
        }

        return null;
    }

    private static bool IsEmail(string value)
    {
        var at = value.IndexOf('@');
        if (at <= 0 || at != value.LastIndexOf('@') || value.Contains(' '))
        {
            return false;
        }

        var dot = value.IndexOf('.', at + 1);
        return dot > at + 1 && dot < value.Length - 1;
    }
}
