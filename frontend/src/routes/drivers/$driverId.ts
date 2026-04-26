import { createFileRoute } from "@tanstack/react-router";
import { EditDriverPage } from "@/pages/driver/detail";

export const Route = createFileRoute("/drivers/$driverId")({
  component: EditDriverPage,
});
