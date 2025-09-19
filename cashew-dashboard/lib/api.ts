export async function getBalance() {
  const res = await fetch("http://localhost:3000/api/v1/token/balance", {
    next: { revalidate: 10 },
  });
  if (!res.ok) throw new Error("Failed to get balance");
  return res.json();
}
