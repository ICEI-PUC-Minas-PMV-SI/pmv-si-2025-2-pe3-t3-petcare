"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/header/page";
import { Hotel } from "@/utils/models";
import { HotelRepo } from "@/utils/localstorage";
import styles from "./page.module.css";
import HotelRegister from "@/components/modais/hotelRegister/page";

export default function HomePage() {
  const [hotels, setHotels] = useState<Array<Hotel>>([]);
  const [att, setAtt] = useState<boolean>(false);

  useEffect(() => {
    const stored = HotelRepo.list();
    setHotels(stored);
  }, [att]);

  function deletButtonClick(id: string) {
    HotelRepo.remove(id);
    setAtt(!att);
  }

  return (
    <div className="page">
      <Header />
      <div className={styles.container}>
        <div className={styles.title}>
          <h1>Registro de hotéis</h1>
          <HotelRegister att={att} setAtt={setAtt} />
        </div>

        <div className={styles.containerBox}>
          {hotels.length > 0 &&
            hotels.map((hotel) => (
              <div key={hotel.id} className={styles.box}>
                <img
                  className={styles.img}
                  src={hotel.url}
                  alt="Sem imagem"
                  width={200}
                  height={200}
                />
                <div className={styles.content}>
                  <h1>{hotel.name}</h1>
                  <p>{hotel.description}</p>
                  <HotelRegister att={att} setAtt={setAtt} edit={hotel.id} />
                  <button
                    onClick={() => deletButtonClick(hotel.id)}
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
