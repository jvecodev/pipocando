import { PerfilType, PerfilTypeEnum } from "../types/PerfilType";

export function isAdmin(user: PerfilType): boolean {
  return user.perfil === PerfilTypeEnum.ADMIN;
}

export function isUser(user: PerfilType): boolean {
  return user.perfil === PerfilTypeEnum.USER;
}

export function getUserRole(user: PerfilType): PerfilTypeEnum {
  return user.perfil;
}
