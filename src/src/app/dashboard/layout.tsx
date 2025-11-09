import { Header } from "@/components/header/page";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-start">
      <aside className="w-64 flex-none">
        <Header />
      </aside>

      <main className="flex-1 h-screen">{children}</main>
    </div>
  );
}
