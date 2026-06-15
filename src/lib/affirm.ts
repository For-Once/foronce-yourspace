import { toast } from "sonner";

export function affirm(message: string, sub?: string) {
  toast(message, {
    description: sub,
    duration: 5000,
    className: "font-hand",
  });
}
