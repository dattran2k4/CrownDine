import {jwtDecode} from "jwt-decode";

type JwtPayload = {
  authorities: string[];
};

export const isAdmin = (): boolean => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.authorities.includes("ADMIN");
};
