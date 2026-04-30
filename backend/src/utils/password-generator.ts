/**
 * Генерирует случайный пароль из указанных количества английских букв
 * @param length - Длина пароля (по умолчанию 8)
 * @returns Сгенерированный пароль
 */
export function generatePassword(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
}
