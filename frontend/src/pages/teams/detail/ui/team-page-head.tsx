import { Breadcrumbs } from "@/components/breadcrumbs";
import { DetailPageHead, HeadChip } from "@/components/data-list";
import { HardHatIcon, UsersIcon } from "lucide-react";
import { ReactNode } from "react";
import { membersLabel, TeamCalendarBadge, teamTone } from "../../ui/team-identity";

interface Props {
  title: string;
  /** Для существующей бригады */
  isActive?: boolean;
  memberCount?: number;
  isNew?: boolean;
}

export const TeamPageHead = ({ title, isActive = true, memberCount, isNew }: Props) => {
  let badges: ReactNode = null;
  if (!isNew) badges = <TeamCalendarBadge isActive={isActive} />;

  return (
    <DetailPageHead
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: "Бригады", href: "/teams", active: false },
            { label: isNew ? "Создание" : title, active: true },
          ]}
        />
      }
      icon={<HardHatIcon />}
      iconClassName={teamTone(isActive)}
      title={isNew ? "Новая бригада" : title}
      badges={badges}
      chips={
        memberCount !== undefined && (
          <HeadChip icon={<UsersIcon />}>{membersLabel(memberCount)}</HeadChip>
        )
      }
    />
  );
};
