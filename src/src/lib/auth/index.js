import { UserRepo } from "@/utils/localstorage";

export function login(email, password) {
  const data = UserRepo.list().filter(
    (val) => val.email === email && val.password === password
  )[0];

  if (data) {
    localStorage.setItem("auth", JSON.stringify(data));
    document.cookie = "auth=true; path=/";
    return true;
  }
  return false;
}

export function logout() {
  document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function isAuthenticated() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth=true");
}
