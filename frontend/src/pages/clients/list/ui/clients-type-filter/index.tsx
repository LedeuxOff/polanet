import { SegmentedTabs } from "@/components/segmented-tabs";
import { Building2Icon, UserIcon, UsersIcon } from "lucide-react";

interface Props {
  clientType: string;
  handleTypeChange: (value: string) => void;
  /** @deprecated не используется — подписи видны в переключателе */
  getTypeFilterLabel?: () => string;
}

const OPTIONS = [
  { id: "all", label: "Все", Icon: UsersIcon },
  { id: "individual", label: "Физ. лица", short: "Физ.", Icon: UserIcon },
  { id: "legal", label: "Юр. лица", short: "Юр.", Icon: Building2Icon },
];

export const ClientsTypeFilter = ({ clientType, handleTypeChange }: Props) => (
  <SegmentedTabs
    tabs={OPTIONS}
    value={clientType}
    onChange={handleTypeChange}
    className="shrink-0 sm:min-w-[360px]"
  />
);
