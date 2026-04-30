import { BarChartIcon, Home, MonitorIcon, SettingsIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  links: LinkItem[];
}

export interface LinkItem {
  title: string;
  url: string;
  permission?: string; // Если указано, пункт будет скрыт без соответствующего права
}

export const menuItems: MenuItem[] = [
  {
    title: "Основное меню",
    id: "1",
    icon: Home,
    links: [
      {
        title: "Главная",
        url: "/",
      },
      {
        title: "Пользователи",
        url: "/users",
        permission: "users:list",
      },
      {
        title: "Заявки",
        url: "/orders",
        permission: "orders:list",
      },
      {
        title: "Автомобили",
        url: "/cars",
        permission: "cars:list",
      },
      {
        title: "Водители",
        url: "/drivers",
        permission: "drivers:list",
      },
      {
        title: "Клиенты",
        url: "/clients",
        permission: "clients:list",
      },
      {
        title: "Транспортные карты",
        url: "/transport-cards",
        permission: "transport-cards:list",
      },
    ],
  },
  {
    title: "Статистика",
    id: "2",
    icon: BarChartIcon,
    links: [
      {
        title: "Статистика по финансам",
        url: "/money-statistic",
      },
    ],
  },
  {
    title: "Мониторинг",
    id: "3",
    icon: MonitorIcon,
    links: [
      {
        title: "Информация о системе",
        url: "/system-info",
        permission: "system-info:view",
      },
      {
        title: "Серверные логи",
        url: "/system-logs",
        permission: "system-logs:view",
      },
    ],
  },
  {
    title: "Системные настройки",
    id: "4",
    icon: SettingsIcon,
    links: [
      {
        title: "Роли",
        url: "/roles",
        permission: "roles:list",
      },
      {
        title: "Резервные копии",
        url: "/backups",
        permission: "backups:list",
      },
    ],
  },
];
