import { Button } from "@/components/ui/button";

interface Props {
  disabled?: boolean;
  saveLabel?: string;
}

export const BottomBarSaveButton = ({ saveLabel, disabled }: Props) => {
  return (
    <Button
      type="submit"
      disabled={disabled}
      className="px-8 py-4 bg-blue-500/90 dark:bg-blue-600/40 dark:text-zinc-100 dark:border dark:border-white/10 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600/30 flex-1"
    >
      {saveLabel ? saveLabel : disabled ? "Сохранение..." : "Сохранить"}
    </Button>
  );
};
