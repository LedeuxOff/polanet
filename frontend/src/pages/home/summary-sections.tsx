import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { usersApi } from "@/lib/api/users-api";
import { clientsApi } from "@/lib/api/clients-api";
import { transportCardsApi } from "@/lib/api/transport-cards";
import { getFormattedAmount } from "@/lib/utils";
import {
  Building2Icon,
  CreditCardIcon,
  FuelIcon,
  HeartHandshake,
  PowerIcon,
  PowerOffIcon,
  ShoppingBagIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import {
  cardTints,
  homeCardClass,
  SectionContent,
  SectionHeader,
  StatTile,
  useSummary,
} from "./ui-parts";

const dash = "…";

export const EmployeesSection = () => {
  const { data, isLoading, allowed } = useSummary("users:list", usersApi.summary);
  if (!allowed) return null;

  return (
    <Link to="/users" className="col-span-12">
      <Card className={cn(homeCardClass, cardTints.blue)}>
        <SectionHeader
          title="Сотрудники"
          description={isLoading ? "Загрузка..." : `Всего сотрудников: ${data?.total ?? 0}`}
          color="blue"
          icon={<UsersIcon />}
        />
        <SectionContent color="blue">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <StatTile key={i} label="Загрузка" value={dash} />
                ))
              : data?.byRole.map((role) => (
                  <StatTile
                    key={role.id}
                    label={role.name}
                    value={role.count}
                    valueClassName={
                      role.count ? "text-blue-600 dark:text-blue-300" : "text-muted-foreground"
                    }
                  />
                ))}
          </div>
        </SectionContent>
      </Card>
    </Link>
  );
};

export const ClientsSection = () => {
  const { data, isLoading, allowed } = useSummary("clients:list", clientsApi.summary);
  if (!allowed) return null;
  const show = (v?: number) => (isLoading ? dash : (v ?? 0));

  return (
    <Link to="/clients" className="col-span-12 lg:col-span-5">
      <Card className={cn(homeCardClass, cardTints.yellow, "h-full")}>
        <SectionHeader
          title="Клиенты"
          description="Просмотр клиентов"
          color="yellow"
          icon={<HeartHandshake />}
        />
        <SectionContent color="yellow">
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              className="col-span-2"
              icon={<UsersIcon className="h-3.5 w-3.5" />}
              label="Всего клиентов"
              value={show(data?.total)}
              valueClassName="text-yellow-600 dark:text-yellow-300"
            />
            <StatTile
              icon={<UserIcon className="h-3.5 w-3.5" />}
              label="Физ. лица"
              value={show(data?.individual)}
            />
            <StatTile
              icon={<Building2Icon className="h-3.5 w-3.5" />}
              label="Юр. лица"
              value={show(data?.legal)}
            />
            <StatTile
              className="col-span-2"
              icon={<ShoppingBagIcon className="h-3.5 w-3.5" />}
              label="С заявками"
              value={show(data?.withOrders)}
              hint="Клиенты, у которых есть хотя бы одна заявка"
            />
          </div>
        </SectionContent>
      </Card>
    </Link>
  );
};

export const TransportCardsSection = () => {
  const { data, isLoading, allowed } = useSummary(
    "transport-cards:list",
    transportCardsApi.summary,
  );
  if (!allowed) return null;
  const show = (v?: number) => (isLoading ? dash : (v ?? 0));

  return (
    <Link to="/transport-cards" className="col-span-12 lg:col-span-7">
      <Card className={cn(homeCardClass, cardTints.green, "h-full")}>
        <SectionHeader
          title="Топливные карты"
          description="Управление топливными картами"
          color="green"
          icon={<CreditCardIcon />}
        />
        <SectionContent color="green">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile
              icon={<CreditCardIcon className="h-3.5 w-3.5" />}
              label="Всего карт"
              value={show(data?.total)}
            />
            <StatTile
              icon={<PowerIcon className="h-3.5 w-3.5" />}
              label="Активные"
              value={show(data?.active)}
              valueClassName="text-green-600 dark:text-green-300"
            />
            <StatTile
              icon={<PowerOffIcon className="h-3.5 w-3.5" />}
              label="Неактивные"
              value={show(data?.inactive)}
              valueClassName="text-muted-foreground"
            />
            <StatTile
              className="col-span-2 sm:col-span-3"
              icon={<FuelIcon className="h-3.5 w-3.5" />}
              label="Общий расход по картам"
              value={isLoading ? dash : `${getFormattedAmount(data?.totalExpenses)} ₽`}
              valueClassName="text-red-600 dark:text-red-300"
            />
          </div>
        </SectionContent>
      </Card>
    </Link>
  );
};
