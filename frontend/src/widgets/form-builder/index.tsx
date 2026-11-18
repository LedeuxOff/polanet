import { BottomBar } from "@/components/bottom-bar";
import { FieldValues } from "react-hook-form";
import { FormBuilderType } from "./types";
import { FormBuilderSection } from "./ui/form-builder-section";

export const FormBuilder = <T extends FieldValues = FieldValues>({
  form,
  sections,
  actions,
}: FormBuilderType<T>) => {
  return (
    <form onSubmit={actions.submit?.onSubmit}>
      <div className="flex flex-col gap-4 flex-1">
        {sections
          .filter((section) => !section.hide)
          .map((section) => (
            <FormBuilderSection key={section.id} {...section} form={form} />
          ))}
      </div>

      <BottomBar
        isSumitting={actions.submit?.isSubmitting}
        onBack={actions.back}
        hideSaveButton={!actions.submit?.onSubmit}
        saveLabel={actions.submit?.label}
        // Удаление
        showDeleteButton={!actions.delete?.isHide}
        handleDelete={actions.delete?.onDelete}
        isDeleting={actions.delete?.isDeleting}
        // Отправка пароля
        handleSendPassword={actions.resetPassword?.onReset}
        isSendingPassword={actions.resetPassword?.isReseting}
        sendPasswordDisabled={actions.resetPassword?.disabled}
      />
    </form>
  );
};
