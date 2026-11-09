import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { worksApi } from "@/lib/api";
import { useToast } from "@/lib/contexts/toast-context";
import type { Team, Work } from "@/lib/types";
import { formatDateLong } from "../consts";
import type { Slot } from "../hooks";
import { WorkForm } from "./work-form";

interface Props {
  /** Слот, в который создаётся работа; null — модалка закрыта */
  slot: Slot | null;
  teams: Team[];
  onClose: () => void;
  onCreated: (work: Work) => void;
}

export const WorkCreateModal = ({ slot, teams, onClose, onCreated }: Props) => {
  const { showToast } = useToast();

  return (
    <Dialog open={!!slot} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая работа</DialogTitle>
          {slot && (
            <DialogDescription>
              {formatDateLong(slot.date)} · {slot.startTime}–{slot.endTime}
            </DialogDescription>
          )}
        </DialogHeader>

        {slot && (
          <WorkForm
            // key сбрасывает форму при выборе другого слота
            key={`${slot.date}-${slot.startTime}`}
            initial={slot}
            teams={teams}
            submitLabel="Создать"
            onCancel={onClose}
            onSubmit={async (input) => {
              const work = await worksApi.create(input);
              showToast("Работа создана", "success");
              onCreated(work);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
