import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeIcon, RefreshCw, Trash2, AlertTriangle, MenuIcon } from "lucide-react";
import { useSystemLogs } from "./hooks";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks";
import { useTabbar } from "@/lib/contexts/tabbar-context";

export const SystemLogsPage = () => {
  const isMobile = useIsMobile();
  const { setOpen } = useTabbar();

  const {
    errors,
    isLoading,
    error,
    lastUpdated,
    refresh,
    clearAllErrors,
    formatTimestamp,
    canClearErrors,
  } = useSystemLogs();

  if (isLoading && errors.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Серверные логи</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Загрузка...</p>
          </CardContent>
        </Card>
        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Link to="/">
            <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
              <HomeIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error && errors.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Серверные логи</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 h-32">
            <p className="text-destructive">{error}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Повторить
            </Button>
          </CardContent>
        </Card>
        <div className="fixed bottom-8 left-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md">
          <Link to="/">
            <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
              <HomeIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with refresh */}
      <Card>
        <CardHeader>
          <div
            className={`flex ${isMobile ? "flex-col gap-2" : "flex-row items-center"} justify-between`}
          >
            <div className="flex items-center gap-4">
              <CardTitle>Серверные логи</CardTitle>
              {errors.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 hover:bg-red-100 text-red-700 border-red-200"
                >
                  {errors.length} ошибок
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">Обновлено: {lastUpdated}</span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error list */}
      {errors.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Список ошибок</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {errors.map((err) => (
              <div
                key={err.id}
                className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          #{err.id} - {formatTimestamp(err.timestamp)}
                        </span>
                        {err.appVersion && <Badge variant="outline">v{err.appVersion}</Badge>}
                        {err.method && err.endpoint && (
                          <Badge variant="secondary">
                            {err.method} {err.endpoint}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-all">{err.message}</p>
                      {err.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Показать стек вызовов
                          </summary>
                          <pre className="mt-2 p-3 bg-background rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                            {err.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Ошибок не найдено</p>
          </CardContent>
        </Card>
      )}

      {/* Bottom Navigation */}
      <div
        className={`fixed ${isMobile ? "bottom-2" : "bottom-8"} left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-zinc-800/80 rounded-md`}
      >
        <div className="flex gap-2">
          <Link to="/">
            <Button type="button" className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900">
              <HomeIcon className="w-4 h-4" />
            </Button>
          </Link>

          {isMobile && (
            <Button
              type="button"
              className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900"
              onClick={() => setOpen(true)}
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
          )}

          <Button
            onClick={refresh}
            disabled={isLoading}
            className="px-3 py-4 bg-blue-600 rounded-md hover:bg-blue-700 flex gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Обновить</span>
          </Button>
        </div>
        {errors.length > 0 && canClearErrors && (
          <Button
            onClick={clearAllErrors}
            disabled={isLoading}
            className="px-3 py-4 bg-zinc-800 rounded-md hover:bg-zinc-900 flex gap-2"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Очистить</span>
          </Button>
        )}
      </div>
    </div>
  );
};
