import { PlusIcon } from "lucide-react";
import { ReactNode } from "react";
import { barButton } from "../styles";

interface Props {
  onCreate: () => void;
  label?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export const BottomBarCreateButton = ({ onCreate, label = "Создать", disabled, icon }: Props) => {
  return (
    <button type="button" onClick={onCreate} disabled={disabled} className={barButton.primary}>
      {icon ?? <PlusIcon />}
      {label}
    </button>
  );
};
