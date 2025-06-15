export enum PerfilTypeEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export type PerfilType = {
  id: string;
  name: string;
  email: string;
  perfil: PerfilTypeEnum;
}