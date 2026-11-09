import { useIsMobile } from "@/hooks";
import { useState } from "react";
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

export const BottomBar = ({
  isSumitting,
  onBack,
  saveLabel,
  hideSaveButton,
  // Создание
  onCreate,
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
  saveTemplate,
}: Props) => {
  const [hideBottomTabbar, setHideBottomTabbar] = useState(false);

  const isMobile = useIsMobile();

  const isTwoRows = !!handleSendPassword || quickCreate || saveTemplate;

  return (
    <div
      className={`fixed transition-all ${isMobile ? (hideBottomTabbar ? `-bottom-[${isTwoRows ? 112 : 58}px]` : "bottom-2") : hideBottomTabbar ? `-bottom-[${isTwoRows ? 112 : 58}px]` : "bottom-4"} left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-zinc-600/30 backdrop-blur-md shadow-xl border-zinc-200 rounded-2xl dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/20`}
    >
      <BottomBarShowButton
        hideBottomTabbar={hideBottomTabbar}
        setHideBottomTabbar={setHideBottomTabbar}
      />

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          {onBack && <BottomBarBackButton disabled={isSumitting} onClick={onBack} />}

          {isMobile && <BottomBarMobileMenu />}

          {!hideSaveButton && (
            <>
              {onCreate ? (
                <BottomBarCreateButton onCreate={onCreate} />
              ) : (
                <BottomBarSaveButton saveLabel={saveLabel} disabled={isSumitting} />
              )}
            </>
          )}

          {showDeleteButton && handleDelete && (
            <BottomBarDeleteButton disabled={isDeleting} handleDelete={handleDelete} />
          )}

          <BottomBarHideButton setHideBottomTabbar={setHideBottomTabbar} />
        </div>

        {handleSendPassword && (
          <BottomBarSendPasswordButton
            handleSendPassword={handleSendPassword}
            disabled={sendPasswordDisabled}
            isSendingPassword={isSendingPassword}
          />
        )}

        {quickCreate && <QuickCreateOrderButton />}
      </div>
    </div>
  );
};
