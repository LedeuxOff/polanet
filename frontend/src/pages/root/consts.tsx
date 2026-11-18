import { BarChartIcon, FileText, Home, Layers, MonitorIcon, SettingsIcon } from "lucide-react";

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
        title: "Сотрудники",
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
        title: "Клиенты",
        url: "/clients",
        permission: "clients:list",
      },
      {
        title: "Топливные карты",
        url: "/transport-cards",
        permission: "transport-cards:list",
      },
      {
        title: "Календарь",
        url: "/calendar",
        permission: "deliveries:list",
      },
    ],
  },
  {
    title: "Стяжка",
    id: "1.2",
    icon: Layers,
    links: [
      {
        title: "Календарь",
        url: "/works",
        permission: "works:list",
      },
      {
        title: "Бригады",
        url: "/teams",
        permission: "teams:list",
      },
      {
        title: "Клиенты",
        url: "/screed-clients",
        permission: "screed-clients:list",
      },
    ],
  },
  {
    title: "Шаблоны",
    id: "1.5",
    icon: FileText,
    links: [
      {
        title: "Мои шаблоны",
        url: "/templates",
        permission: "templates:list",
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
        permission: "finances:view",
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
    title: "Система",
    id: "4",
    icon: SettingsIcon,
    links: [
      {
        title: "Роли",
        url: "/roles",
        permission: "roles:list",
      },
      {
        title: "Справочники",
        url: "/directories",
        permission: "directories:manage",
      },
      {
        title: "Резервные копии",
        url: "/backups",
        permission: "backups:list",
      },
      {
        title: "Разработчики",
        url: "/developers",
        permission: "users:list",
      },
    ],
  },
];
