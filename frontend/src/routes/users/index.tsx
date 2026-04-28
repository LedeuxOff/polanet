import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/pages/users/list";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});
