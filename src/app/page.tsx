"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <span className="inline-block size-6 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
    </div>
  );
}
