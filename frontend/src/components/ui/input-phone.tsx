import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputPhoneProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onPhoneChange?: (value: string | undefined) => void;
  value?: string;
}

const InputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
  ({ className, onPhoneChange, disabled, value, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const isFocusedRef = React.useRef(false);
    const valueRef = React.useRef<string | undefined>(value);

    // Обновляем valueRef при изменении value prop
    valueRef.current = value;

    // Форматирует 10 цифр (без ведущей 7) в маску +7 (999) 999-99-99
    const formatPhone = React.useCallback((digits: string): string => {
      if (digits.length === 0) return "";

      let result = "+7";
      if (digits.length > 0) result += " (" + digits.slice(0, 3);
      if (digits.length > 3) result += ") " + digits.slice(3, 6);
      if (digits.length > 6) result += "-" + digits.slice(6, 8);
      if (digits.length > 8) result += "-" + digits.slice(8, 10);

      return result;
    }, []);

    // Получает цифры БЕЗ ведущего кода страны (7, 8, +)
    const getDigits = React.useCallback((str: string): string => {
      let digits = str.replace(/\D/g, "");
      // Удаляем ведущую 7 или 8 (российский код)
      if (digits.length > 0 && (digits[0] === "7" || digits[0] === "8")) {
        digits = digits.slice(1);
      }
      return digits;
    }, []);

    // Преобразует цифры (без ведущей 7) в полный телефон для формы (с ведущей 7)
    const getFullPhone = React.useCallback((digits: string): string => {
      if (digits.length === 0) return "";
      let phone = "7";
      if (digits.length > 0) phone += digits.slice(0, 3);
      if (digits.length > 3) phone += digits.slice(3, 6);
      if (digits.length > 6) phone += digits.slice(6, 8);
      if (digits.length > 8) phone += digits.slice(8, 10);
      return phone;
    }, []);

    // Устанавливаем значение в input при изменении value prop или при монтировании
    React.useEffect(() => {
      const input = innerRef.current;
      if (!input) return;

      const currentValue = valueRef.current;
      if (currentValue && currentValue !== input.value) {
        const digits = getDigits(currentValue);
        if (digits.length > 0) {
          input.value = formatPhone(digits.slice(0, 10));
        } else {
          input.value = "";
        }
      }
    }, [value, formatPhone, getDigits]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const baseDigits = getDigits(inputValue);

        if (baseDigits.length === 0) {
          // Проверяем, было ли значение в input (например "+7")
          const rawDigits = inputValue.replace(/\D/g, "");
          if (rawDigits.length === 0 || rawDigits === "7" || rawDigits === "8") {
            e.target.value = "";
            onPhoneChange?.(undefined);
            return;
          }
        }

        // Ограничиваем 10 цифрами (без ведущей 7)
        const limitedDigits = baseDigits.slice(0, 10);
        const formatted = formatPhone(limitedDigits);
        e.target.value = formatted;

        // Для формы отправляем полный телефон с ведущей 7
        const fullPhone = getFullPhone(limitedDigits);
        onPhoneChange?.(fullPhone);
      },
      [formatPhone, getDigits, getFullPhone, onPhoneChange],
    );

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const baseDigits = getDigits(e.target.value);
        if (baseDigits.length === 0) {
          e.target.value = "";
          onPhoneChange?.(undefined);
        } else if (baseDigits.length >= 10) {
          e.target.value = formatPhone(baseDigits.slice(0, 10));
          onPhoneChange?.(getFullPhone(baseDigits.slice(0, 10)));
        }
        isFocusedRef.current = false;
      },
      [formatPhone, getDigits, getFullPhone, onPhoneChange],
    );

    const handleFocus = React.useCallback(() => {
      // При фокусе обновляем значение из value prop
      const currentValue = valueRef.current;
      if (currentValue !== undefined && currentValue !== "") {
        const digits = getDigits(currentValue);
        if (digits.length > 0) {
          innerRef.current!.value = formatPhone(digits.slice(0, 10));
        }
      }
      isFocusedRef.current = true;
    }, [formatPhone, getDigits]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
      if (allowedKeys.includes(e.key)) return;
      if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;
      if (!/^[0-9]$/.test(e.key)) e.preventDefault();
    }, []);

    React.useImperativeHandle(ref, () => innerRef.current!);

    return (
      <input
        type="tel"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={innerRef}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder="+7 (___) ___-__-__"
        disabled={disabled}
        {...props}
      />
    );
  },
);
InputPhone.displayName = "InputPhone";

export { InputPhone };
