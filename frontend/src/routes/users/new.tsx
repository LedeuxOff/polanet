import { createFileRoute } from "@tanstack/react-router";
import { NewUserPage } from "@/pages/users/new";

export const Route = createFileRoute("/users/new")({
  component: NewUserPage,
});
