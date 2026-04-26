import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Driver } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";

interface Props {
  showUnbindDialog: boolean;
  setShowUnbindDialog: Dispatch<SetStateAction<boolean>>;
  driver: Driver | null;
  isUnbinding: boolean;
  handleUnbindCard: () => Promise<void>;
}

export const DriveRemoveTransportCardModal = ({
  setShowUnbindDialog,
  showUnbindDialog,
  driver,
  isUnbinding,
  handleUnbindCard,
}: Props) => {
  return (
    <Dialog open={showUnbindDialog} onOpenChange={setShowUnbindDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отвязать транспортную карту</DialogTitle>
          <DialogDescription>
            Вы уверены что хотите отвязать карту {driver?.transportCard?.cardNumber}? Это действие
            можно будет отменить позже.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowUnbindDialog(false)}
            disabled={isUnbinding}
          >
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleUnbindCard} disabled={isUnbinding}>
            {isUnbinding ? "Отвязка..." : "Отвязать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
