export const REGEX = {
    CALENDAR_PATTERN: /^\d{4}[AB]$/,
    NUMERIC: /^\d{1,3}$/,
    KEY_PATTERN: /^[A-Z]+$/,
    CODE_PATTERN: /^[a-zA-Z0-9]+$/,
    ONLY_LETTERS: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]+$/,
    ONLY_LETTERS_EXTENDED: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.,]+$/,
    STRONG_PASSWORD: /^(?=.*[a-z])(?=(.*[A-Z]))(?=.*[0-9])(?=.{8,})/
}