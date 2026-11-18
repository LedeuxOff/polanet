import { CheckIcon, Loader2Icon } from "lucide-react";
import { barButton } from "../styles";

interface Props {
  disabled?: boolean;
  saveLabel?: string;
}

export const BottomBarSaveButton = ({ saveLabel, disabled }: Props) => {
  return (
    <button type="submit" disabled={disabled} className={barButton.primary}>
      {disabled ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
      {saveLabel ? saveLabel : disabled ? "Сохранение..." : "Сохранить"}
    </button>
  );
};
