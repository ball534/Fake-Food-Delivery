import type { MenuItem, SelectedChoice } from "../data/types";

/**
 * Pre-select the first choice of every *required* option — used for quick-add
 * and as the initial state of the customise screen.
 */
export function buildDefaultChoices(item: MenuItem): SelectedChoice[] {
  const out: SelectedChoice[] = [];
  for (const opt of item.options ?? []) {
    if (opt.required && !opt.multiSelect && opt.choices[0]) {
      out.push({ optionId: opt.id, choiceId: opt.choices[0].id });
    }
  }
  return out;
}

/** Does the item require a choice the user must actively make? */
export function needsCustomisation(item: MenuItem): boolean {
  return (item.options?.length ?? 0) > 0;
}

/** Unit price = base + the priceDelta of every selected choice. Pure. */
export function computeUnitPrice(
  item: MenuItem,
  selected: SelectedChoice[],
): number {
  let price = item.basePrice;
  for (const sel of selected) {
    const opt = item.options?.find((o) => o.id === sel.optionId);
    const choice = opt?.choices.find((c) => c.id === sel.choiceId);
    if (choice) price += choice.priceDelta;
  }
  return Math.round(price * 100) / 100;
}

/** Human-readable summary of the chosen options, e.g. "Large · 50% · Pearls". */
export function describeChoices(
  item: MenuItem,
  selected: SelectedChoice[],
): string {
  const labels: string[] = [];
  for (const sel of selected) {
    const opt = item.options?.find((o) => o.id === sel.optionId);
    const choice = opt?.choices.find((c) => c.id === sel.choiceId);
    if (choice) labels.push(choice.label);
  }
  return labels.join(" · ");
}
