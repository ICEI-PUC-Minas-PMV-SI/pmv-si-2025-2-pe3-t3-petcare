"use client";
import { Header } from "@/components/header/page";
import { useState, useEffect } from "react";
import { PetRepo } from "@/utils/localstorage";
import { Pet } from "@/utils/models";
import styles from "./page.module.css";
import PetsRegister from "@/components/modais/petsRegister/page";
import { VaccinationRecordModal } from "@/components/modais/VaccinationRecordModal";

export default function HomePage() {
  const [pets, setPets] = useState<Array<Pet>>([]);
  const [att, setAtt] = useState<boolean>(false);

  useEffect(() => {
    const result = JSON.parse(localStorage.getItem("auth") || "") ?? "{id: 1}";
    const stored = PetRepo.list(result.id);
    setPets(stored);
  }, [att]);

  function deletButtonClick(id: string) {
    PetRepo.remove(id);
    setAtt(!att);
  }

  return (
    <div className="page">
      <Header />
      <div className={styles.pageWrapper}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Meus animais</h1>
            <p className={styles.subtitle}>Gerencie todos os seus pets cadastrados aqui.</p>
          </div>
          <PetsRegister att={att} setAtt={setAtt} edit={""} triggerLabel="Adicionar Pet" />
        </div>

        <section className={styles.section}>
          <div className={styles.grid}>
            {pets.length > 0 ? (
              pets.map((pet) => (
                <div key={pet.id} className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{pet.name}</h3>
                      <p className="card-description">{pet.species}</p>
                    </div>
                    {pet.url && (
                      <img
                        className="h-16 w-16 rounded-full object-cover"
                        src={pet.url}
                        alt={`Foto de ${pet.name}`}
                      />
                    )}
                  </div>
                  <div className="card-content">
                    <div className="card-notes">
                      <div className="card-notes-label">Idade</div>
                      <div className="card-notes-text">{pet.age} anos</div>
                    </div>
                    <div className="card-notes mt-4">
                      <div className="card-notes-label">Observações</div>
                      <div className="card-notes-text">{pet.obs}</div>
                    </div>
                  </div>
                  <div className="card-footer card-footer-between">
                    <VaccinationRecordModal
                      pet={pet}
                      trigger={
                        <button className="card-button">
                          Ver Saúde
                        </button>
                      }
                    />
                    <div className="card-actions">
                      <PetsRegister
                        att={att}
                        setAtt={setAtt}
                        edit={pet.id}
                        triggerLabel="Editar"
                      />
                      <button
                        onClick={() => deletButtonClick(pet.id)}
                        className="card-button card-button-delete"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyStateTitle}>
                  Você ainda não adicionou nem um pet!
                </h3>
                <p className={styles.emptyStateText}>
                  Clique no botão cadastrar para adicionar seu primerio pet.
                </p>
                <div className={styles.emptyStateAction}>
                  <PetsRegister
                    att={att}
                    setAtt={setAtt}
                    edit=""
                    triggerLabel="Adicionar"
                  />

                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
