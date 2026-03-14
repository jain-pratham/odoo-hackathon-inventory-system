import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  );
}
