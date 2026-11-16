import type { CapabilityNotice } from "@/services/capabilities.service";

export function CapabilityNoticeMessage({ notice }: { notice: CapabilityNotice }) {
  return (
    <div
      role={notice.kind === "other" ? "alert" : "status"}
      data-capability-notice={notice.kind}
      className="max-w-[320px] text-right text-sm text-destructive"
    >
      <p className="font-medium">{notice.title}</p>
      {notice.message !== notice.title ? <p>{notice.message}</p> : null}
    </div>
  );
}
