export function normalizePhone(input?: string) {
  if (!input) return "";
  // boşluk, parantez, tire vs temizle
  let p = input.replace(/[^\d+]/g, "");

  // 00 ile başlıyorsa + yap
  if (p.startsWith("00")) p = "+" + p.slice(2);

  // + yoksa TR varsayımı (mimari bozmadan basit)
  if (!p.startsWith("+")) {
    // 0 ile başlıyorsa kırp
    if (p.startsWith("0")) p = p.slice(1);
    p = "+90" + p;
  }

  return p;
}