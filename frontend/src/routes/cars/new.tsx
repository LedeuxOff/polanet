import { createFileRoute } from "@tanstack/react-router";
import { NewCarPage } from "@/pages/cars/new";

export const Route = createFileRoute("/cars/new")({
  component: NewCarPage,
});
