export function formatDineInRupee(amount: number) {
  return `Rs ${amount.toLocaleString('en-IN')}`;
}

export function formatDineInInr(amount: number) {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
}
