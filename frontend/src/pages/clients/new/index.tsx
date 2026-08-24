import { useNavigate } from "@tanstack/react-router";
import { useNewClientPage } from "./hooks";
import { ClientNewPageHead } from "./ui/client-new-page-head";
import { ClientNewPageForm } from "./ui/client-new-page-form";
import { BottomBar } from "@/components/bottom-bar";

export const NewClientPage = () => {
  const navigate = useNavigate();
  const { form, onSubmit, clientType, setClientType, isSubmitting } = useNewClientPage();

  return (
    <div className="flex flex-col gap-4">
      <ClientNewPageHead />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ClientNewPageForm
          form={form}
          clientType={clientType}
          setClientType={setClientType}
          isSubmitting={isSubmitting}
        />

        <BottomBar onBack={() => navigate({ to: "/clients" })} isSumitting={isSubmitting} />
      </form>
    </div>
  );
};
