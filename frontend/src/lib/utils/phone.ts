/**
 * Утилиты для работы с номерами телефона
 *
 * Формат отображения: +7 (999) 999-99-99
 * Формат хранения в БД: 79999999999
 */

/**
 * Очистка номера телефона от всех символов кроме цифр
 * @param value - номер телефона в любом формате
 * @returns строка только с цифрами
 */
export function cleanPhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Форматирование номера телефона в формат +7 (999) 999-99-99
 * @param phone - номер телефона в формате цифр (например 79999999999)
 * @returns отформатированный номер или пустая строка
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return "";

  const cleaned = cleanPhone(phone);

  // Если начинается с 8, заменяем на 7 (для российских номеров)
  let normalized = cleaned;
  if (normalized.startsWith("8") && normalized.length === 11) {
    normalized = "7" + normalized.slice(1);
  }

  // Если начинается не с 7, добавляем 7
  if (!normalized.startsWith("7") && normalized.length === 10) {
    normalized = "7" + normalized;
  }

  if (normalized.length !== 11 || !normalized.startsWith("7")) {
    return cleaned;
  }

  const digits = normalized.slice(1); // убираем 7 для форматирования

  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
}

/**
 * Подготовка номера телефона к отправке на сервер
 * (убирает все не-цифры)
 * @param value - номер телефона
 * @returns номер только с цифрами
 */
export function preparePhoneForApi(value: string | null | undefined): string | undefined {
  if (!value || cleanPhone(value).length === 0) {
    return undefined;
  }
  return cleanPhone(value);
}

/**
 * Проверка валидности российского номера телефона
 * @param phone - номер телефона
 * @returns true если номер валиден
 */
export function isValidRussianPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  // Должен быть 11 цифр и начинаться с 7
  return cleaned.length === 11 && cleaned.startsWith("7");
}
