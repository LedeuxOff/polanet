import { SegmentedTabs } from "@/components/segmented-tabs";
import { CreditCardIcon, FileText } from "lucide-react";
import { SetStateAction } from "react";

interface Props {
  activeTab: string;
  setActiveTab: (value: SetStateAction<string>) => void;
}

const TABS = [
  { id: "details", label: "Основная информация", short: "Данные", Icon: FileText },
  { id: "transport-card", label: "Транспортная карта", short: "Карта", Icon: CreditCardIcon },
];

export const UserPageTabs = ({ activeTab, setActiveTab }: Props) => (
  <SegmentedTabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
);
