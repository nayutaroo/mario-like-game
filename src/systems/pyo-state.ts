import type { PlayerForm } from "../types";

export type StateEvent = "TAKE_ACORN" | "TAKE_APPLE" | "DAMAGE";
export type StateOutcome = "promoted" | "demoted" | "died" | "ignored";

export type PyoState = {
  form: () => PlayerForm;
  apply: (event: StateEvent) => StateOutcome;
  reset: () => void;
};

export function createPyoState(initial: PlayerForm = "normal"): PyoState {
  let cur: PlayerForm = initial;

  return {
    form: () => cur,

    apply(event) {
      switch (event) {
        case "TAKE_ACORN":
          if (cur === "normal") {
            cur = "acorn";
            return "promoted";
          }
          return "ignored";

        case "TAKE_APPLE":
          if (cur === "normal" || cur === "acorn") {
            cur = "apple";
            return "promoted";
          }
          return "ignored";

        case "DAMAGE":
          if (cur === "apple") {
            cur = "acorn";
            return "demoted";
          }
          if (cur === "acorn") {
            cur = "normal";
            return "demoted";
          }
          return "died";
      }
    },

    reset() {
      cur = "normal";
    },
  };
}
