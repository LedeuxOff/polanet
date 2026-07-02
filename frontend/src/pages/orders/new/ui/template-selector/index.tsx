import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks";
import { Template } from "@/lib/types/template-types";
import { FileText } from "lucide-react";

interface TemplateSelectorProps {
  isOpen: boolean;
  templates: Template[];
  selectedTemplate: Template | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  onSelect: (template: Template) => void;
}

export const TemplateSelector = ({
  isOpen,
  templates,
  selectedTemplate,
  isLoading,
  onOpenChange,
  onApply,
  onSelect,
}: TemplateSelectorProps) => {
  const isMobile = useIsMobile();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateStr;
    }
  };

  const getClientName = (template: Template) => {
    if (template.clientName) return template.clientName;
    if (template.clientId) return "-";
    return "-";
  };

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-zinc-200 hover:border-zinc-300 bg-white dark:bg-zinc-900"
            }`}
            onClick={() => onSelect(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">
                    {template.type === "delivery" ? "Доставка" : "Вывоз"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="line-clamp-2">{template.address}</div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Клиент: {getClientName(template)}</span>
                  <span>Дата: {formatDate(template.date)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && templates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Нет сохраненных шаблонов</div>
        )}
        {isLoading && <div className="text-center py-8 text-muted-foreground">Загрузка...</div>}
      </div>

      {selectedTemplate && (
        <Button
          onClick={onApply}
          className="rounded-2xl w-full bg-blue-500 hover:bg-blue-600"
          size="lg"
        >
          Применить шаблон
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Выберите шаблон</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Выберите шаблон</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">{content}</div>
      </DialogContent>
    </Dialog>
  );
};
