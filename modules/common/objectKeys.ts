export const objectKeys = <T extends Object>(o: T) => {
  return Object.keys(o) as Array<keyof T>;
}