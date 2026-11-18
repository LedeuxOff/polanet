import { cn } from "@/lib/utils";
import type { Work } from "@/lib/types";
import { formatWorkTime, getStatusClasses, getClientName, getWorkRange } from "../consts";

export const WORK_DRAG_TYPE = "application/x-polanet-work";

/** Данные перетаскивания: id работы и смещение часа ячейки от начала работы (минуты) */
export const encodeDrag = (id: number, offsetMinutes: number) => `${id}|${offsetMinutes}`;
export const decodeDrag = (value: string) => {
  const [id, offset] = value.split("|").map(Number);
  return { id: id || 0, offsetMinutes: offset || 0 };
};

interface Props {
  work: Work;
  /** Час ячейки, в которой показана карточка (работа дублируется в каждом своём часе) */
  hour: number;
  draggable: boolean;
  onClick: () => void;
}

/** Карточка работы в часовой ячейке календаря */
export const WorkBlock = ({ work, hour, draggable, onClick }: Props) => {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        // Запоминаем, за какой час работы взяли карточку, чтобы при переносе сохранить сдвиг
        const offset = hour * 60 - getWorkRange(work).start;
        e.dataTransfer.setData(WORK_DRAG_TYPE, encodeDrag(work.id, offset));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${formatWorkTime(work)} · ${getClientName(work.client)} — ${work.statusInfo.name}`}
      className={cn(
        "relative z-20 w-full text-left rounded-lg border px-2 py-1 text-xs leading-tight transition hover:shadow-md",
        draggable && "cursor-grab active:cursor-grabbing",
        getStatusClasses(work.statusInfo.color),
      )}
    >
      <div className="flex items-baseline gap-1">
        <span className="font-bold whitespace-nowrap">{formatWorkTime(work)}</span>
        <span className="font-semibold truncate">{getClientName(work.client)}</span>
      </div>
      {work.address && <div className="truncate opacity-80">{work.address}</div>}
      {work.team && <div className="truncate opacity-80">Бригада: {work.team.name}</div>}
    </button>
  );
};
