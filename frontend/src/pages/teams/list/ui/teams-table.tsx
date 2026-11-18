import { ChevronRightIcon, UsersIcon } from "lucide-react";
import { useIsMobile } from "@/hooks";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  listCardClass,
  ListEmptyState,
  listTdClass as td,
  listThClass as th,
  Shimmer,
} from "@/components/data-list";
import { membersLabel, TeamCalendarBadge, TeamIcon } from "../../ui/team-identity";

interface Props {
  teams: Team[];
  isLoading: boolean;
  skeletonCount?: number;
  onOpen: (team: Team) => void;
}

const emptyText = "Попробуйте изменить название";

const Members = ({ count }: { count: number }) => (
  <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
    <UsersIcon className="h-4 w-4 text-slate-400" />
    <span className="tabular-nums">{membersLabel(count)}</span>
  </span>
);

const MobileList = ({ teams, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cn(listCardClass, "flex items-center gap-3 p-4")}>
            <Shimmer className="h-11 w-11 rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Shimmer className="h-4 w-1/2" />
              <Shimmer className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!teams.length) return <ListEmptyState text={emptyText} />;

  return (
    <div className="flex flex-col gap-3">
      {teams.map((team) => (
        <button
          key={team.id}
          type="button"
          onClick={() => onOpen(team)}
          className={cn(
            listCardClass,
            "flex items-center gap-3 p-4 text-left transition-all active:scale-[0.99] hover:border-slate-300 dark:hover:bg-white/15",
          )}
        >
          <TeamIcon isActive={team.isActive} className="h-11 w-11 rounded-2xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {team.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {membersLabel(team.memberCount ?? 0)}
            </span>
          </div>
          <TeamCalendarBadge isActive={team.isActive} />
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-500" />
        </button>
      ))}
    </div>
  );
};

const DesktopTable = ({ teams, isLoading, skeletonCount = 5, onOpen }: Props) => {
  if (!isLoading && !teams.length) return <ListEmptyState text={emptyText} />;

  return (
    <div className={cn(listCardClass, "overflow-hidden")}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-white/15 dark:bg-white/5">
            <tr>
              <th className={th}>Бригада</th>
              <th className={th}>Состав</th>
              <th className={th}>Календарь работ</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <tr key={i}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Shimmer className="h-9 w-9 rounded-xl" />
                        <Shimmer className="h-4 w-40" />
                      </div>
                    </td>
                    <td className={td}>
                      <Shimmer className="h-4 w-28" />
                    </td>
                    <td className={td}>
                      <Shimmer className="h-6 w-24 rounded-full" />
                    </td>
                    <td />
                  </tr>
                ))
              : teams.map((team) => (
                  <tr
                    key={team.id}
                    onClick={() => onOpen(team)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <TeamIcon isActive={team.isActive} className="h-9 w-9 rounded-xl" />
                        <span className="whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      <Members count={team.memberCount ?? 0} />
                    </td>
                    <td className={td}>
                      <TeamCalendarBadge isActive={team.isActive} />
                    </td>
                    <td className="pr-4 text-right">
                      <ChevronRightIcon className="ml-auto h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300" />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TeamsTable = (props: Props) => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileList {...props} /> : <DesktopTable {...props} />;
};
