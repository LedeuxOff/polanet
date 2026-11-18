import { createFileRoute } from "@tanstack/react-router";
import { DirectoriesPage } from "@/pages/directories";

export const Route = createFileRoute("/directories")({
  component: DirectoriesPage,
});
