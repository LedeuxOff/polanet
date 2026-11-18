import { useEffect, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { worksApi } from "@/lib/api";
import { usePermissions } from "@/lib/contexts/permission-context";
import { useToast } from "@/lib/contexts/toast-context";
import type { Team, Work } from "@/lib/types";
import { formatDateLong, formatWorkTime } from "../consts";
import { WorkForm } from "./work-form";

interface Props {
  /** Открытая работа; null — модалка закрыта */
  work: Work | null;
  teams: Team[];
  onClose: () => void;
  onSaved: (work: Work) => void;
  onDeleted: (id: number) => void;
}

/** Модалка слота (работы в календаре): та же форма, что при создании, но заполненная */
export const SlotModal = ({ work, teams, onClose, onSaved, onDeleted }: Props) => {
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => setConfirmDelete(false), [work?.id]);

  const handleDelete = async () => {
    if (!work) return;
    setIsDeleting(true);
    try {
      await worksApi.delete(work.id);
      showToast("Работа удалена", "success");
      onDeleted(work.id);
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Не удалось удалить работу", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const canUpdate = hasPermission("works:update");

  return (
    <Dialog open={!!work} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {work && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
                <div className="space-y-1.5">
                  <DialogTitle>Работа №{work.id}</DialogTitle>
                  <DialogDescription>
                    {formatDateLong(work.date)} · {formatWorkTime(work)}
                    {work.legacyId ? ` · из старой системы, №${work.legacyId}` : ""}
                  </DialogDescription>
                </div>
                {hasPermission("works:delete") &&
                  (confirmDelete ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={handleDelete}
                      >
                        {isDeleting ? "Удаление..." : "Да, удалить"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isDeleting}
                        onClick={() => setConfirmDelete(false)}
                      >
                        Нет
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2Icon className="mr-2 h-4 w-4" /> Удалить
                    </Button>
                  ))}
              </div>
            </DialogHeader>

            {canUpdate ? (
              <WorkForm
                key={work.id}
                initial={work}
                teams={teams}
                submitLabel="Сохранить"
                onCancel={onClose}
                onSubmit={async (input) => {
                  const saved = await worksApi.update(work.id, input);
                  showToast("Работа сохранена", "success");
                  onSaved(saved);
                  onClose();
                }}
              />
            ) : (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                У вас нет прав на редактирование работ
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
