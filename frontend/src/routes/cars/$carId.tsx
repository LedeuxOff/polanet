import { createFileRoute } from "@tanstack/react-router";
import { EditCarPage } from "@/pages/cars/detail";

export const Route = createFileRoute("/cars/$carId")({
  component: EditCarPage,
});
