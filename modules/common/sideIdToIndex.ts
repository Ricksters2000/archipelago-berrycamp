export const sideIdToIndex = (id: string) => {
  switch (id) {
    case `a`:
      return 0;
    case `b`:
      return 1;
    case `c`:
      return 2;
    default:
      return 0;
  }
}