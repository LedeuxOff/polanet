import { createFileRoute } from "@tanstack/react-router";
import { DriversPage } from "@/pages/driver/list";

export const Route = createFileRoute("/drivers/")({
  component: DriversPage,
});
