import { createFileRoute } from "@tanstack/react-router";
import { CarsPage } from "@/pages/cars/list";

export const Route = createFileRoute("/cars/")({
  component: CarsPage,
});
