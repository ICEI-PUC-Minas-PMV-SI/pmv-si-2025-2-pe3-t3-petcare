import { Header } from "@/components/header/page";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.container}>
      <aside className={styles.menu}>
        <Header />
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
