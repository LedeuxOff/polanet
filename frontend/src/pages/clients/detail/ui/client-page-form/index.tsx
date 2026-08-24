import { UseFormReturn } from "react-hook-form";
import { ClientMainInfo } from "./client-main-info";
import { ClientForm } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { ClientPayerInfo } from "./client-payer-info";
import { ClientReceiverInfo } from "./client-receiver-info";

interface Props {
  form: UseFormReturn<ClientForm>;
  clientType: "individual" | "legal";
  setClientType: Dispatch<SetStateAction<"individual" | "legal">>;
  isSubmitting: boolean;
}

export const ClientPageForm = ({ form, clientType, setClientType, isSubmitting }: Props) => {
  return (
    <div className={`flex flex-col gap-4`}>
      <ClientMainInfo
        form={form}
        clientType={clientType}
        setClientType={setClientType}
        isSubmitting={isSubmitting}
      />

      <ClientPayerInfo form={form} isSubmitting={isSubmitting} />

      <ClientReceiverInfo form={form} isSubmitting={isSubmitting} />
    </div>
  );
};
