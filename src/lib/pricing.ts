import type { MenuItem, SelectedChoice } from "../data/types";

export function buildDefaultChoices(item: MenuItem): SelectedChoice[] {
  const out: SelectedChoice[] = [];
  for (const opt of item.options ?? []) {
    if (opt.required && !opt.multiSelect && opt.choices[0]) {
      out.push({ optionId: opt.id, choiceId: opt.choices[0].id });
    }
  }
  return out;
}

export function needsCustomisation(item: MenuItem): boolean {
  return (item.options?.length ?? 0) > 0;
}

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
