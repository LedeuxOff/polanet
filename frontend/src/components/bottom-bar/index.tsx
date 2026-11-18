import { useIsMobile } from "@/hooks";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BottomBarShowButton } from "./bottom-bar-show-button";
import { BottomBarBackButton } from "./bottom-bar-back-button";
import { BottomBarMobileMenu } from "./bottom-bar-mobile-menu";
import { BottomBarSaveButton } from "./botom-bar-save-button";
import { BottomBarHideButton } from "./bottom-bar-hide-button";
import { BottomBarDeleteButton } from "./bottom-bar-delete-button";
import { BottomBarSendPasswordButton } from "./bottom-bar-send-password-button";
import { BottomBarCreateButton } from "./bottom-bar-create-button";
import { QuickCreateOrderButton } from "@/pages/orders/list/ui/quick-create-order-button";

interface Props {
  isSumitting?: boolean;
  onBack?: () => void;
  saveLabel?: string;
  hideSaveButton?: boolean;
  // Создание
  onCreate?: () => void;
  createLabel?: string;
  createDisabled?: boolean;
  createIcon?: ReactNode;
  /** Дополнительный ряд кнопок под основным */
  extraRow?: ReactNode;
  // Удаление
  showDeleteButton?: boolean;
  handleDelete?: (() => Promise<void>) | (() => void);
  isDeleting?: boolean;
  // Отправка пароля
  handleSendPassword?: () => Promise<void>;
  isSendingPassword?: boolean;
  sendPasswordDisabled?: boolean;
  quickCreate?: boolean;
  saveTemplate?: boolean;
}

const STORAGE_KEY = "polanet:bottom-bar-hidden";

const readHidden = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const isTextField = (el: Element | null) =>
  !!el &&
  (el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLInputElement &&
      !["checkbox", "radio", "button", "submit", "reset", "file", "range", "color"].includes(
        el.type,
      )) ||
    (el as HTMLElement).isContentEditable);

/** На мобильных: открыта ли экранная клавиатура (фокус в поле ввода) */
const useKeyboardOpen = (enabled: boolean) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const update = () => setOpen(isTextField(document.activeElement));
    // focusout срабатывает до смены activeElement — проверяем в следующем тике
    const onFocusOut = () => setTimeout(update, 0);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [enabled]);

  return enabled && open;
};

export const BottomBar = ({
  isSumitting,
  onBack,
  saveLabel,
  hideSaveButton,
  // Создание
  onCreate,
  createLabel,
  createDisabled,
  createIcon,
  extraRow,
  // Удаление
  showDeleteButton,
  handleDelete,
  isDeleting,
  // Отправка пароля
  handleSendPassword,
  isSendingPassword,
  sendPasswordDisabled,
  // Создание черновика заявки
  quickCreate,
}: Props) => {
  const isMobile = useIsMobile();
  const [hidden, setHidden] = useState(readHidden);
  const keyboardOpen = useKeyboardOpen(isMobile);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
    } catch {
      /* приватный режим и т.п. */
    }
  }, [hidden]);

  const collapsed = hidden || keyboardOpen;
  const hasPrimary = !hideSaveButton;
  const hasNav = !!onBack || isMobile;
  const hasActions = hasPrimary || (showDeleteButton && !!handleDelete);
  const hasSecondRow = !!handleSendPassword || quickCreate || !!extraRow;

  // На десктопе центрируем по области контента (справа от сайдбара 300px)
  const position = isMobile ? "left-1/2" : "left-[calc(50%+150px)]";

  return (
    <>
      {/* Резерв места, чтобы панель не перекрывала конец страницы */}
      <div aria-hidden className={hasSecondRow ? "h-40" : "h-24"} />

      <div
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] z-40 transition-[transform,opacity] duration-300 ease-out",
          position,
          isMobile && (hasPrimary || hasSecondRow) ? "w-[calc(100vw-24px)]" : "w-max",
          collapsed && "pointer-events-none opacity-0",
        )}
        style={{ transform: `translate(-50%, ${collapsed ? "calc(100% + 24px)" : "0"})` }}
        aria-hidden={collapsed}
      >
        <div className="flex flex-col gap-2 rounded-3xl border border-slate-200/80 bg-white/85 p-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/15 dark:bg-zinc-900/60 dark:shadow-black/40">
          <div className="flex items-center gap-2">
            {onBack && <BottomBarBackButton disabled={isSumitting} onClick={onBack} />}

            {isMobile && <BottomBarMobileMenu />}

            {hasNav && hasActions && (
              <span className="mx-0.5 h-8 w-px shrink-0 bg-slate-200 dark:bg-white/15" />
            )}

            {hasPrimary && (
              <>
                {onCreate ? (
                  <BottomBarCreateButton
                    onCreate={onCreate}
                    label={createLabel}
                    disabled={createDisabled}
                    icon={createIcon}
                  />
                ) : (
                  <BottomBarSaveButton saveLabel={saveLabel} disabled={isSumitting} />
                )}
              </>
            )}

            {showDeleteButton && handleDelete && (
              <BottomBarDeleteButton disabled={isDeleting} handleDelete={handleDelete} />
            )}

            <BottomBarHideButton onHide={() => setHidden(true)} />
          </div>

          {handleSendPassword && (
            <BottomBarSendPasswordButton
              handleSendPassword={handleSendPassword}
              disabled={sendPasswordDisabled}
              isSendingPassword={isSendingPassword}
            />
          )}

          {quickCreate && <QuickCreateOrderButton />}

          {extraRow}
        </div>
      </div>

      <BottomBarShowButton
        visible={hidden && !keyboardOpen}
        onShow={() => setHidden(false)}
        className={position}
      />
    </>
  );
};
