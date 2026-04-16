import { statusColor } from "@/lib/utils";

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor(status)}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
