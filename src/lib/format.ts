export function formatCurrency(value: number, fractionDigits = 0): string {
  return `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: fractionDigits })}`;
}
