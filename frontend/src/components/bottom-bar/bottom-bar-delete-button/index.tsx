import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";

interface Props {
  disabled?: boolean;
  handleDelete: (() => Promise<void>) | (() => void);
}

export const BottomBarDeleteButton = ({ disabled, handleDelete }: Props) => {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={handleDelete}
      className="px-3 py-4 bg-red-400 dark:bg-red-600/40 hover:bg-red-500 dark:hover:bg-red-600/60 rounded-2xl"
    >
      <TrashIcon className="w-4 h-4 dark:text-white" />
    </Button>
  );
};
