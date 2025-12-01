"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/header/page";
import { Hotel, Rating } from "@/utils/models";
import { HotelRepo, RatingRepo } from "@/utils/localstorage";
import styles from "./page.module.css";
import HotelRegister from "@/components/modais/hotelRegister/page";
import { BadgeCheck } from "lucide-react";

export default function HomePage() {
  const [hotels, setHotels] = useState<Array<Hotel & { averageRating?: number }>>([]);
  const [att, setAtt] = useState<boolean>(false);

  useEffect(() => {
    const storedHotels = HotelRepo.list();
    const allRatings = RatingRepo.list();

    const hotelsWithRatings = storedHotels.map((hotel) => {
      const hotelRatings = allRatings.filter((rating) => rating.hotelId === hotel.id);
      const totalRating = hotelRatings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = hotelRatings.length > 0 ? totalRating / hotelRatings.length : undefined;
      return { ...hotel, averageRating };
    });

    setHotels(hotelsWithRatings);
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
          <HotelRegister att={att} setAtt={setAtt} edit={""} />
        </div>

        <div className={styles.containerBox}>
          {hotels.length > 0 &&
            hotels.map((hotel) => (
              <div key={hotel.id} className={styles.box}>
                {hotel.url.length > 0 ? (
                  <img
                    className={styles.img}
                    src={hotel.url}
                    alt="Sem imagem"
                    width={200}
                    height={200}
                  />
                ) : (
                  <img
                    className={styles.img}
                    src="img/noImage.jpg"
                    alt="Sem imagem"
                    width={200}
                    height={200}
                  />
                )}
                <div className={styles.content}>
                  <h1 className="flex items-center gap-2">
                    {hotel.name}
                    {hotel.isVerified && (
                      <BadgeCheck className="text-blue-500" size={18} />
                    )}
                  </h1>
                  <p>{hotel.description}</p>
                  {hotel.averageRating !== undefined && (
                    <p>Avaliação: {hotel.averageRating.toFixed(1)} / 5</p>
                  )}
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
