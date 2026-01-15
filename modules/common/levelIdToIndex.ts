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

export const chapterIdToIndex = (id: string) => {
  switch (id) {
    case `prologue`:
      return 0;
    case `city`:
      return 1;
    case `site`:
      return 2;
    case `resort`:
      return 3;
    case `ridge`:
      return 4;
    case `temple`:
      return 5;
    case `reflection`:
      return 6;
    case `summit`:
      return 7;
    case `epilogue`:
      return 8;
    case `core`:
      return 9;
    case `farewell`:
      return 10;
    default:
      return 0;
  }
}