export default function numberToRp(number) {
  const num = typeof number === "string" ? parseFloat(number) : number;
  if (isNaN(num)) return "Rp -";

  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(num);

  return `Rp ${formatted}`;
}
