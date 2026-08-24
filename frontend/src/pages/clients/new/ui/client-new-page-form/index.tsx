import { ClientNewPageFormMainSection } from "./client-new-page-form-main-section";
import { UseFormReturn } from "react-hook-form";
import { NewClientForm } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { ClientNewPageFormPayerSection } from "./client-new-page-form-payer-section";
import { ClientNewPageFormReceiverSection } from "./client-new-page-form-receiver-section";

interface Props {
  form: UseFormReturn<NewClientForm>;
  clientType: "individual" | "legal";
  setClientType: Dispatch<SetStateAction<"individual" | "legal">>;
  isSubmitting: boolean;
}

export const ClientNewPageForm = ({ form, clientType, setClientType, isSubmitting }: Props) => {
  return (
    <div className={`flex flex-col gap-4`}>
      <ClientNewPageFormMainSection
        form={form}
        clientType={clientType}
        setClientType={setClientType}
        isSubmitting={isSubmitting}
      />

      <ClientNewPageFormPayerSection form={form} isSubmitting={isSubmitting} />

      <ClientNewPageFormReceiverSection form={form} isSubmitting={isSubmitting} />
    </div>
  );
};
