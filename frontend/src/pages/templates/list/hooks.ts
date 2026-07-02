import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { templatesApi } from "@/lib/api";
import { Template } from "@/lib/types";
import { useToast } from "@/lib/contexts/toast-context";

export const useTemplatesListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await templatesApi.list();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      showToast("Ошибка при загрузке шаблонов", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (!value.trim()) {
        setFilteredTemplates(templates);
      } else {
        const lowerValue = value.toLowerCase();
        setFilteredTemplates(
          templates.filter((t) => {
            const searchStr =
              `${t.address} ${t.payerLastName} ${t.payerFirstName} ${t.receiverLastName} ${t.receiverFirstName}`.toLowerCase();
            return searchStr.includes(lowerValue);
          }),
        );
      }
    },
    [templates],
  );

  const handleDelete = async (id: number) => {
    try {
      await templatesApi.delete(id);
      showToast("Шаблон удален", "success");
      loadTemplates();
    } catch (error) {
      showToast("Ошибка при удалении шаблона", "error");
    }
  };

  return {
    templates: filteredTemplates,
    isLoading,
    search,
    handleSearchChange,
    handleDelete,
    loadTemplates,
  };
};
