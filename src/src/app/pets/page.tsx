"use client";
import { Header } from "@/components/header/page";
import { useState, useEffect } from "react";
import { PetRepo } from "@/utils/localstorage";
import { Pet } from "@/utils/models";
import styles from "./page.module.css";
import PetsRegister from "@/components/modais/petsRegister/page";

export default function HomePage() {
  const [pets, setPets] = useState<Array<Pet>>([]);
  const [att, setAtt] = useState<boolean>(false);

  useEffect(() => {
    // const result = localStorage.getItem("auth") ?? "{id: 1}";
    const stored = PetRepo.list();
    setPets(stored);
  }, [att]);

  function deletButtonClick(id: string) {
    PetRepo.remove(id);
    setAtt(!att);
  }

  return (
    <div className="page">
      <Header />
      <div className={styles.container}>
        <div className={styles.title}>
          <h1>Meus animais</h1>
          <PetsRegister att={att} setAtt={setAtt} />
        </div>

        <div className={styles.containerBox}>
          {pets.length > 0 &&
            pets.map((pet) => (
              <div key={pet.id} className={styles.box}>
                <img
                  className={styles.img}
                  src={pet.url}
                  alt="Sem imagem"
                  width={200}
                  height={200}
                />
                <div className={styles.content}>
                  <p>Nome: {pet.name}</p>
                  <p>Espécie: {pet.species}</p>
                  <p>Idade: {pet.age}</p>
                  <p>Descrição: {pet.obs}</p>
                  <PetsRegister att={att} setAtt={setAtt} edit={pet.id} />
                  <button
                    onClick={() => deletButtonClick(pet.id)}
                    className={styles.button}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
