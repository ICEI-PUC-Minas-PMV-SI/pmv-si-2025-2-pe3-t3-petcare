"use client";
import { useState, useEffect, useEffectEvent } from "react";
import { useRouter } from "next/navigation";
import { login, isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import styles from "./page.module.css";
import { seedDemoData } from "@/utils/localstorage";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const Mock = useEffectEvent(() => seedDemoData());

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/");
    }
    Mock();
  });

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    if (login(email, password)) {
      router.push("/");
    } else {
      setError("E-mail ou senha incorretos");
    }
  }

  function handleEmailChange() {
    setError("");
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.form}>
        <h1 className={styles.title}>Login</h1>
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          required
          onChange={handleEmailChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          required
          onChange={handleEmailChange}
        />
        {error && <p className={styles.error}>{error}</p>}
        <Link href="/register">Cadastrar</Link>
        <button type="submit" className={styles.button}>
          Entrar
        </button>
      </form>
    </div>
  );
}
