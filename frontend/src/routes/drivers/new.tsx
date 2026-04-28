import { createFileRoute } from "@tanstack/react-router";
import { NewDriverPage } from "@/pages/driver/new";

export const Route = createFileRoute("/drivers/new")({
  component: NewDriverPage,
});
