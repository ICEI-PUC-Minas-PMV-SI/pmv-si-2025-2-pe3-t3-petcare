"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header/page";
import { UserRepo } from "@/utils/localstorage";
import { User } from "@/utils/models";
import styles from "./page.module.css";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // State for avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const authRaw = localStorage.getItem("auth");
    if (authRaw) {
      const authUser = JSON.parse(authRaw);
      const fullUser = UserRepo.get(authUser.id);
      if (fullUser) {
        setUser(fullUser);
        setName(fullUser.name);
        setEmail(fullUser.email);
        setPhone(fullUser.phone || "");
        setAvatarPreview(fullUser.avatarUrl || null);
        setAvatarBase64(fullUser.avatarUrl || "");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!user) return;

    setIsSaving(true);
    setMessage("");

    const updatedUser = UserRepo.update(user.id, {
      name,
      email,
      phone,
      avatarUrl: avatarBase64,
    });

    if (updatedUser) {
      // Atualiza também o 'auth' para refletir as novas informações
      localStorage.setItem("auth", JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent("profileUpdated")); // Dispara o evento
      setMessage("Informações salvas com sucesso!");
    } else {
      setMessage("Erro ao salvar as informações.");
    }

    setIsSaving(false);
    setTimeout(() => setMessage(""), 3000); // Limpa a mensagem após 3 segundos
  };

  if (!user) {
    return (
      <div className="page">
        <Header />
        <div className={styles.pageWrapper}>
          <p>Carregando informações do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Minha Conta</h1>
          <p className={styles.subtitle}>
            Gerencie suas informações pessoais e de perfil.
          </p>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.avatarContainer}>
            <img
              src={avatarPreview || "/img/noImage.jpg"}
              alt="Avatar"
              className={styles.avatarPreview}
            />
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              className={styles.button}
              onClick={() => fileInputRef.current?.click()}
            >
              Alterar Foto
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={styles.button}
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
            {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
