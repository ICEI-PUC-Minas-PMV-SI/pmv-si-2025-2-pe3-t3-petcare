"use client";
import { IoMdAdd } from "react-icons/io";
import { useState, useRef, Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HotelRepo } from "@/utils/localstorage";
import styles from "./page.module.css";

interface HotelRegisterProps {
  att: boolean;
  setAtt: Dispatch<SetStateAction<boolean>>;
  edit: string;
}

export default function HotelRegister({
  att,
  setAtt,
  edit,
}: HotelRegisterProps) {
  const [open, setOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [base64data, setBase64data] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = {
      name,
      address,
      description,
      url: base64data,
    };

    if (edit) {
      HotelRepo.update(edit, data);
    } else {
      HotelRepo.create(data);
    }

    setAtt(!att);
    setOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          setBase64data(reader.result as string);
        } catch (err) {
          console.error("Falha ao selecionar arquivo", err);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleButtonClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function editButtonClick() {
    const hotel = HotelRepo.get(edit);
    if (hotel) {
      setName(hotel.name);
      setAddress(hotel.address || "");
      setDescription(hotel.description);
      setFileUrl(hotel.url);
      setBase64data(hotel.url);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {edit ? (
          <button className={styles.button} onClick={editButtonClick}>
            Editar
          </button>
        ) : (
          <button className={styles.button}>
            <IoMdAdd size="15" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className={styles.container}>
        <form onSubmit={handleLogin}>
          <DialogHeader className={styles.title}>
            <DialogTitle>Cadastro de hotel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3" style={{ justifyContent: "center" }}>
              <button
                className={styles.buttonFileInput}
                type="button"
                onClick={handleButtonClick}
              >
                {fileUrl ? (
                  <img className={styles.img} src={fileUrl} alt="Preview" />
                ) : (
                  "Selecionar arquivo"
                )}
              </button>
              <input
                className={styles.fileInput}
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            <div className="grid gap-3">
              <DialogTitle>Name</DialogTitle>
              <input
                className={styles.input}
                type="text"
                name="name"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <DialogTitle>Endereço</DialogTitle>
              <input
                className={styles.input}
                type="text"
                name="address"
                placeholder="endereço"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <DialogTitle>Descrição</DialogTitle>
              <input
                className={styles.input}
                type="text"
                name="description"
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button>Cancel</button>
            </DialogClose>
            <button type="submit">Salvar</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
