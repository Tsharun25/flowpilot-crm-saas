"use client";

import { toast } from "sonner";

export default function ToastForm({
  action,
  children,
  successMessage,
  className = "",
}: {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  successMessage: string;
  className?: string;
}) {
  async function handleSubmit(formData: FormData) {
    try {
      await action(formData);
      toast.success(successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  return (
    <form action={handleSubmit} className={className}>
      {children}
    </form>
  );
}