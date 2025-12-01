"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/auth";
import { User } from "@/utils/models";
import styles from "./page.module.css";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const result = localStorage.getItem("auth") ?? "{}";
    setUser(JSON.parse(result));
  }, []);

  function handleClick(link: string) {
    router.push(link);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className={styles.menu}>
      <h1>PetCare</h1>

      <div className={styles.profile}>
        <img
          className={styles.img}
          src="img/noImage.jpg"
          alt="Sem imagem"
          width={80}
          height={80}
        />
        <h3>{user && user.name}</h3>
        <button
          onClick={() => handleLogout()}
          className={styles.buttonleLogout}
        >
          Sair
        </button>
      </div>
      <div className={styles.container}>
        {user && user.role === "guardian" && (
          <button onClick={() => handleClick("/")} className={styles.button}>
            Home
          </button>
        )}
        {user && user.role === "hotel" && (
          <button
            onClick={() => handleClick("/dashboard")}
            className={styles.button}
          >
            Dashboard
          </button>
        )}
        {user && user.role === "guardian" && (
          <button
            onClick={() => handleClick("/pets")}
            className={styles.button}
          >
            Animais de estimação
          </button>
        )}
        {user && user.role === "hotel" && (
          <button
            onClick={() => handleClick("/hotel")}
            className={styles.button}
          >
            Hotéis
          </button>
        )}
      </div>
    </header>
  );
}
