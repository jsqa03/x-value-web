import XBankLanding from "@/components/XBankLanding";

export const metadata = {
  title: "X-Bank · Tarjeta Corporativa Premium | X-Value",
  description:
    "X-Bank: la tarjeta de crédito corporativa diseñada para escalar tu negocio sin límites. Acceso exclusivo para clientes activos de X-Value.",
};

export default function XBankPage() {
  return (
    <main className="min-h-screen bg-black">
      <XBankLanding />
    </main>
  );
}
