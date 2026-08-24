import { createFileRoute } from "@tanstack/react-router";
import { EditDeveloperPage } from "@/pages/developers/detail";

export const Route = createFileRoute("/developers/$developerId")({
  component: EditDeveloperPage,
});
