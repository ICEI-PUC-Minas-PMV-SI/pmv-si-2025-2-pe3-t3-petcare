import { UserRepo } from "@/utils/localstorage";

export function login(email, password) {
  const data = UserRepo.list().find(
    (val) => val.email === email && val.password === password
  );

  if (data) {
    localStorage.setItem("auth", JSON.stringify(data));
    document.cookie = "auth=true; path=/";
    return data; // Return user object
  }
  return null; // Return null on failure
}

export function logout() {
  document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function isAuthenticated() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth=true");
}
