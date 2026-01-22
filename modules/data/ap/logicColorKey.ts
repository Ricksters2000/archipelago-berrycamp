import {LogicStatus} from "./logicHandling";

export const logicColorKey: Record<LogicStatus, string> = {
  [LogicStatus.Accessible]: `#0f0`,
  [LogicStatus.InAccessible]: `#f00`,
  [LogicStatus.Checked]: `#c8c8c8`
}