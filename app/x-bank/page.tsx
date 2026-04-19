import XBankLanding from "@/components/XBankLanding";
import { getXBankStats } from "@/app/actions/xbank";

export const metadata = {
  title: "X-Bank · Tarjeta Corporativa Premium | X-Value",
  description:
    "X-Bank: la tarjeta de crédito corporativa diseñada para escalar tu negocio sin límites. Acceso exclusivo para clientes activos de X-Value.",
};

export default async function XBankPage() {
  const stats = await getXBankStats();

  return (
    <main className="min-h-screen bg-black">
      <XBankLanding stats={stats} />
    </main>
  );
}
