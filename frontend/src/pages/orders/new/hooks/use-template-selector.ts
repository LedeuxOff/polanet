import { useState, useCallback } from "react";
import { templatesApi } from "@/lib/api";
import type { Template } from "@/lib/types/template-types";
import { NewOrderForm } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

export const useTemplateSelector = (form: UseFormReturn<NewOrderForm>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await templatesApi.list();
      setTemplates(response || []);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        loadTemplates();
      }
    },
    [loadTemplates],
  );

  const handleApplyTemplate = useCallback(() => {
    if (!selectedTemplate) return;

    // Заполняем форму данными из шаблона
    form.setValue("type", selectedTemplate.type, { shouldValidate: true });
    form.setValue("address", selectedTemplate.address, { shouldValidate: true });
    form.setValue("payerLastName", selectedTemplate.payerLastName, { shouldValidate: true });
    form.setValue("payerFirstName", selectedTemplate.payerFirstName, { shouldValidate: true });
    form.setValue("payerMiddleName", selectedTemplate.payerMiddleName || "", {
      shouldValidate: true,
    });
    form.setValue("payerPhone", selectedTemplate.payerPhone || "", { shouldValidate: true });
    form.setValue("receiverLastName", selectedTemplate.receiverLastName, { shouldValidate: true });
    form.setValue("receiverFirstName", selectedTemplate.receiverFirstName, {
      shouldValidate: true,
    });
    form.setValue("receiverMiddleName", selectedTemplate.receiverMiddleName || "", {
      shouldValidate: true,
    });
    form.setValue("receiverPhone", selectedTemplate.receiverPhone || "", { shouldValidate: true });
    form.setValue("date", selectedTemplate.date, { shouldValidate: true });
    form.setValue("volume", selectedTemplate.volume ?? undefined, { shouldValidate: true });
    form.setValue("hasPass", selectedTemplate.hasPass, { shouldValidate: true });
    form.setValue("addressComment", selectedTemplate.addressComment || "", {
      shouldValidate: true,
    });
    form.setValue("clientId", selectedTemplate.clientId ?? null, { shouldValidate: true });

    // Закрываем модалку
    setIsOpen(false);
    setSelectedTemplate(null);
  }, [selectedTemplate, form]);

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedTemplate(null);
  }, []);

  return {
    isOpen,
    templates,
    selectedTemplate,
    isLoading,
    handleOpenChange,
    handleApplyTemplate,
    handleSelectTemplate,
    handleClose,
  };
};
