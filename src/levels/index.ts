import type { StageId } from "../types";
import { STAGE_1_1 } from "./stage-1-1";
import { STAGE_1_2 } from "./stage-1-2";
import { STAGE_1_3 } from "./stage-1-3";
import { STAGE_1_4 } from "./stage-1-4";
import type { LevelData } from "./types";

export const LEVELS: Partial<Record<StageId, LevelData>> = {
  "1-1": STAGE_1_1,
  "1-2": STAGE_1_2,
  "1-3": STAGE_1_3,
  "1-4": STAGE_1_4,
};

export function getLevel(id: StageId): LevelData | undefined {
  return LEVELS[id];
}
