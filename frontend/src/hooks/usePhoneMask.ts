import { useCallback, useRef, useState } from "react";

/**
 * Хук для применения маски телефона к input элементу
 * Маска: +7 (999) 999-99-99
 * Максимум 11 цифр (включая 7)
 */
export function usePhoneMask(
  value: string | undefined,
  onChange: (value: string | undefined) => void,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastValueRef = useRef<string>("");

  // Форматирует введенные цифры в маску +7 (999) 999-99-99
  const formatPhone = useCallback((digits: string): string => {
    // Оставляем только цифры
    let cleaned = digits.replace(/\D/g, "");

    // Если начинается с 8, заменяем на 7
    if (cleaned.startsWith("8") && cleaned.length === 11) {
      cleaned = "7" + cleaned.slice(1);
    }

    // Если 10 цифр, добавляем 7 в начало
    if (cleaned.length === 10) {
      cleaned = "7" + cleaned;
    }

    // Ограничиваем 11 цифрами
    cleaned = cleaned.slice(0, 11);

    // Если не начинается с 7, обрезаем до 10 цифр
    if (!cleaned.startsWith("7")) {
      cleaned = cleaned.slice(0, 10);
    }

    if (cleaned.length === 0) return "";

    // Форматируем в маску
    let result = "+7";

    if (cleaned.length > 1) {
      result += " (" + cleaned.slice(1, 4);
    }
    if (cleaned.length > 4) {
      result += ") " + cleaned.slice(4, 7);
    }
    if (cleaned.length > 7) {
      result += "-" + cleaned.slice(7, 9);
    }
    if (cleaned.length > 9) {
      result += "-" + cleaned.slice(9, 11);
    }

    return result;
  }, []);

  // Получает только цифры из строки с маской
  const getDigits = useCallback((str: string): string => {
    return str.replace(/\D/g, "");
  }, []);

  // Обработчик изменения значения
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const digits = getDigits(inputValue);
      const lastValue = lastValueRef.current;

      // Если все стерли
      if (digits.length === 0) {
        e.target.value = "";
        onChange(undefined);
        lastValueRef.current = "";
        return;
      }

      // Если пользователь удалил символы (digits меньше чем было раньше)
      if (digits.length < lastValue.length) {
        // Проверяем, не стер ли пользователь начало номера (7)
        const lastDigits = getDigits(lastValue);

        // Если было больше цифр чем сейчас, значит пользователь удалил что-то
        if (lastDigits.length > digits.length) {
          // Если стерли начало (7), очищаем все
          if (lastDigits.startsWith("7") && !digits.startsWith("7")) {
            e.target.value = "";
            onChange(undefined);
            lastValueRef.current = digits;
            return;
          }

          // Если осталось меньше 3 цифр, очищаем
          if (digits.length < 3) {
            e.target.value = "";
            onChange(undefined);
            lastValueRef.current = digits;
            return;
          }
        }
      }

      // Ограничиваем количество цифр 11
      const limitedDigits = digits.slice(0, 11);

      // Форматируем обратно в маску
      const formatted = formatPhone(limitedDigits);

      // Обновляем значение input
      e.target.value = formatted;

      // Отправляем отформатированное значение
      if (limitedDigits.length === 0) {
        onChange(undefined);
      } else {
        onChange(formatted);
      }
      lastValueRef.current = limitedDigits;
    },
    [formatPhone, getDigits, onChange],
  );

  // Обработчик потери фокуса - форматируем полностью введенный номер
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const digits = getDigits(inputValue);

      if (digits.length === 0) {
        e.target.value = "";
        onChange(undefined);
      } else if (digits.length >= 11) {
        // Форматируем полностью введенный номер
        const formatted = formatPhone(digits.slice(0, 11));
        e.target.value = formatted;
      }
      setIsFocused(false);
    },
    [formatPhone, getDigits, onChange],
  );

  // Обработчик фокуса - очищаем поле для ввода
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const digits = getDigits(value || "");
      if (digits.length > 0) {
        // При фокусе показываем только цифры для удобства редактирования
        e.target.value = digits;
      }
      setIsFocused(true);
    },
    [value, getDigits],
  );

  // Обработчик нажатия клавиш - разрешаем только цифры и специальные клавиши
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем: Backspace, Delete, Tab, Esc, Enter, Home, End, стрелки
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "Home",
      "End",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Ctrl+A, Ctrl+C, Ctrl/V, Ctrl/X
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
      return;
    }

    // Блокируем нецифровые символы
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }, []);

  return {
    inputRef,
    handleChange,
    handleBlur,
    handleKeyDown,
    handleFocus,
  };
}
