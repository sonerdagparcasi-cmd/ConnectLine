import { isToday, isYesterday, format } from "date-fns";
import { tr } from "date-fns/locale";
import { t } from "../../../shared/i18n/t";

export function formatDateSeparator(date: number) {
  const d = new Date(date);
  if (isToday(d)) return t("chat.date.today");
  if (isYesterday(d)) return t("chat.date.yesterday");
  return format(d, "d MMMM", { locale: tr });
}
