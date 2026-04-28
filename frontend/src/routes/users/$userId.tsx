import { createFileRoute } from "@tanstack/react-router";
import { EditUserPage } from "@/pages/users/detail";

export const Route = createFileRoute("/users/$userId")({
  component: EditUserPage,
});
