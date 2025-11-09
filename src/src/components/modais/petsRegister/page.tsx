import { IoMdAdd } from "react-icons/io";
import { useState, useRef, Dispatch, SetStateAction, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PetRepo } from "@/utils/localstorage";
import styles from "./page.module.css";

interface HotelRegisterProps {
  att: boolean;
  setAtt: Dispatch<SetStateAction<boolean>>;
  edit: string;
}

export default function PetsRegister({
  att,
  setAtt,
  edit,
}: HotelRegisterProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string>("");
  const [species, setSpecies] = useState<string>("");
  const [age, setAge] = useState<number | null>(null);
  const [obs, setObs] = useState<string | null>("");
  const [userId, setUserId] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [base64data, setBase64data] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const result = localStorage.getItem("auth") ?? "{id: 1}";
      setUserId(JSON.parse(result).id);
    }
  }, [open]);

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = {
      name,
      species,
      age,
      obs,
      userId,
      url: base64data,
    };

    if (edit) {
      PetRepo.update(edit, data);
    } else {
      PetRepo.create(data);
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
    const pet = PetRepo.get(edit);
    if (pet) {
      setName(pet.name);
      setSpecies(pet.species);
      setAge(pet.age ?? null);
      setObs(pet.obs ?? null);
      setFileUrl(pet.url);
      setBase64data(pet.url);
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
            <DialogTitle>Cadastrar o animal de estimação</DialogTitle>
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
              <DialogTitle>Espécie</DialogTitle>
              <input
                className={styles.input}
                type="text"
                name="species"
                placeholder="Espécie"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <DialogTitle>Idade</DialogTitle>
              <input
                className={styles.input}
                type="text"
                name="age"
                placeholder="Idade"
                value={age || ""}
                onChange={(e) => setAge(Number(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-3">
              <DialogTitle>Descrição</DialogTitle>
              <input
                className={styles.input}
                type="text"
                name="description"
                placeholder="descrição"
                value={obs || ""}
                onChange={(e) => setObs(e.target.value)}
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
