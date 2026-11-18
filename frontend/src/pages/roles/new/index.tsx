import { useNavigate } from "@tanstack/react-router";
import { ShieldPlusIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BottomBar } from "@/components/bottom-bar";
import { DetailPageHead } from "@/components/data-list";
import { useNewRolePage } from "./hooks";
import { RoleMainInfo, roleTone } from "../ui/role-parts";

export const NewRolePage = () => {
  const navigate = useNavigate();
  const { form, isSubmitting, onSubmit } = useNewRolePage();

  return (
    <div className="flex flex-col gap-4">
      <DetailPageHead
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Роли", active: false, href: "/roles" },
              { label: "Создание", active: true },
            ]}
          />
        }
        icon={<ShieldPlusIcon />}
        iconClassName={roleTone}
        title="Новая роль"
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <RoleMainInfo form={form} disabled={isSubmitting} />
        <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
          Права доступа можно будет настроить после создания роли.
        </p>
        <BottomBar
          isSumitting={isSubmitting}
          saveLabel={isSubmitting ? "Сохранение..." : "Создать"}
          onBack={() => navigate({ to: "/roles" })}
        />
      </form>
    </div>
  );
};
