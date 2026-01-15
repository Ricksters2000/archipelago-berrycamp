export const localStorageAPUserKey = `apUser`;
export const sessionStorageDateConnectedKey = `dateConnected`;

export type StoredAPUser = {
  host: string;
  name: string;
  password?: string;
}