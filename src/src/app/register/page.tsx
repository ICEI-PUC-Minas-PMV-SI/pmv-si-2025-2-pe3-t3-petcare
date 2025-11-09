"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { UserRepo } from "@/utils/localstorage";
import Link from "next/link";
import styles from "./page.module.css";
import { User, UserRole } from "@/utils/models";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("guardian");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const petOptions = [
    { value: "guardian", label: "Tutor" },
    { value: "hotel", label: "Hotel" },
  ];

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/");
    }
  }, []);

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data: Omit<User, "id" | "createdAt"> = {
      name: name,
      email: email,
      phone: phone,
      role: selectedRole,
      password: password,
    };

    UserRepo.create(data);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    router.push("/");
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleRegister} className={styles.form}>
        <h1 className={styles.title}>Cadastro</h1>
        <select
          className={
            selectedRole === "" ? styles.colorDefault : styles.colorValue
          }
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          name="especie"
          required
        >
          <option value="" disabled>
            Selecione um cargo
          </option>
          {petOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Link href="/login">Login</Link>
        <button type="submit" className={styles.button}>
          Confirmar
        </button>
      </form>
    </div>
  );
}
