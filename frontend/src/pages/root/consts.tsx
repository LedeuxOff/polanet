import { Home, SettingsIcon } from "lucide-react";

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
    title: "Системные настройки",
    id: "2",
    icon: SettingsIcon,
    links: [
      {
        title: "Роли",
        url: "/roles",
      },
    ],
  },
];
