"use client";

import { useFormStatus } from "react-dom";

export default function ConfirmSubmitButton({
  children,
  message,
  className,
  pendingText = "Deleting...",
}: {
  children: React.ReactNode;
  message: string;
  className: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
