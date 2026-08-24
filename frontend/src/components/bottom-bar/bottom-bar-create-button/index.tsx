import { Button } from "@/components/ui/button";

interface Props {
  onCreate: () => void;
}

export const BottomBarCreateButton = ({ onCreate }: Props) => {
  return (
    <Button
      type="button"
      onClick={onCreate}
      className="px-8 py-4 bg-blue-500/90 dark:bg-blue-600/40 dark:text-zinc-100 dark:border dark:border-white/10 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600/30 flex-1"
    >
      Создать
    </Button>
  );
};
