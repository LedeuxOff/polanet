import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PermissionGuard } from "@/lib/components/permission-guard";
import { WorksPage } from "@/pages/works";

export const Route = createFileRoute("/works")({
  validateSearch: z.object({
    // Любая дата нужной недели, YYYY-MM-DD
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .catch(undefined),
    // Открыть деталку работы
    workId: z.coerce.number().int().positive().optional().catch(undefined),
  }),
  component: WorksRoute,
});

function WorksRoute() {
  return (
    <PermissionGuard permission="works:list">
      <WorksPage />
    </PermissionGuard>
  );
}
