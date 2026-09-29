export const MESSAGES = {
    MIN_LENGTH: (min: number) => `Longitud mínima: ${min}`,
    MAX_LENGTH: (max: number) => `Longuiud máxima: ${max}`,
    CUSTOM_LENGTH: (min: number, max: number) => `Longitud de valores debe ser mínimo ${min} y máximo ${max} `,
    STRICT_LENGTH: (len: number) => `Longutud de valores debe ser de: ${len}`,
    ONLY_LETTERS: `Solo se permiten letras`,
    ONLY_LETTERS_EXTENDED: `Solo letras y .,`,
    ALPHANUMERIC: `Solo se permiten letras y numeros`,
    NUMERIC: `El valor debe ser numerico`,
    ALREADY_EXISTS: `El registro ya esta en uso, debes elegir otro.`,
    WRONG_PASSWORD: `La contraseña es incorrecta`,
    USER_NOT_FOUND: `Usuario no encontrado`,
    FORBIDDEN_EXCEPTION: `No tienes privilegios para realizar esta acción.`,
    USER_INACTIVE: `Usuario inactivo.`,
    INVALID_VALUE: `Este valor no es valido.`
}