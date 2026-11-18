import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { workersApi } from "@/lib/api";
import { Worker, WorkerForm, workerSchema } from "@/lib/types";
import { NO_TEAM, toWorkerInput } from "../shared";

export const useWorkerDetailPage = () => {
  const { workerId } = useParams({ from: "/workers/$workerId" });
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<WorkerForm>({ resolver: zodResolver(workerSchema) });

  useEffect(() => {
    setIsLoading(true);
    workersApi
      .get(Number(workerId))
      .then((data) => {
        setWorker(data);
        form.reset({
          lastName: data.lastName,
          firstName: data.firstName,
          middleName: data.middleName ?? "",
          phone: data.phone ?? "",
          teamId: data.teamId ? String(data.teamId) : NO_TEAM,
        });
      })
      .catch(() => setWorker(null))
      .finally(() => setIsLoading(false));
  }, [workerId, form]);

  const save = async (data: WorkerForm) => {
    setIsSubmitting(true);
    try {
      const saved = await workersApi.update(Number(workerId), toWorkerInput(data));
      setWorker(saved);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async () => {
    setIsDeleting(true);
    try {
      await workersApi.delete(Number(workerId));
    } finally {
      setIsDeleting(false);
    }
  };

  return { worker, isLoading, form, isSubmitting, isDeleting, save, remove };
};
