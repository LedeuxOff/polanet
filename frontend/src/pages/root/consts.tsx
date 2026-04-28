import { BarChartIcon, Home, MonitorIcon, SettingsIcon } from "lucide-react";

export const menuItems = [
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
      },
      {
        title: "Заявки",
        url: "/orders",
      },
      {
        title: "Автомобили",
        url: "/cars",
      },
      {
        title: "Водители",
        url: "/drivers",
      },
      {
        title: "Клиенты",
        url: "/clients",
      },
      {
        title: "Транспортные карты",
        url: "/transport-cards",
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
      },
      {
        title: "Серверные логи",
        url: "/system-logs",
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
      },
      {
        title: "Резервные копии",
        url: "/backups",
      },
    ],
  },
];
