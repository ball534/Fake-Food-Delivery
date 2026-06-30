import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import Thumb from "../components/Thumb";
import { useStores } from "../store/storesStore";
import type { ItemOption, SelectedChoice } from "../data/types";
import { money } from "../lib/format";
import { buildDefaultChoices, computeUnitPrice } from "../lib/pricing";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";

export default function ItemDetail() {
  const { storeId = "", itemId = "" } = useParams();
  const navigate = useNavigate();
  const store = useStores((s) => s.byId[storeId]);
  const item = store?.menu.flatMap((c) => c.items).find((i) => i.id === itemId);

  const addLine = useCart((s) => s.addLine);
  const wouldReplace = useCart((s) => s.wouldReplace);
  const showToast = useToasts((s) => s.show);

  const [choices, setChoices] = useState<SelectedChoice[]>(
    item ? buildDefaultChoices(item) : [],
  );
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const unitPrice = useMemo(
    () => (item ? computeUnitPrice(item, choices) : 0),
    [item, choices],
  );

  if (!store || !item) {
    return (
      <Screen>
        <TopBar title="Item" />
        <EmptyState emoji="🤷" title="Item not found" />
      </Screen>
    );
  }

  const isChosen = (optionId: string, choiceId: string) =>
    choices.some((c) => c.optionId === optionId && c.choiceId === choiceId);

  const countFor = (optionId: string) =>
    choices.filter((c) => c.optionId === optionId).length;

  const minFor = (o: ItemOption) =>
    o.required ? Math.max(1, o.min ?? 1) : o.min ?? 0;

  const selectChoice = (opt: ItemOption, choiceId: string) => {
    if (opt.multiSelect) {
      const exists = isChosen(opt.id, choiceId);
      if (!exists && opt.max != null && countFor(opt.id) >= opt.max) {
        showToast(`You can pick up to ${opt.max}`, "✋");
        return;
      }
      setChoices((prev) =>
        exists
          ? prev.filter((c) => !(c.optionId === opt.id && c.choiceId === choiceId))
          : [...prev, { optionId: opt.id, choiceId }],
      );
      return;
    }
    setChoices((prev) => [
      ...prev.filter((c) => c.optionId !== opt.id),
      { optionId: opt.id, choiceId },
    ]);
  };

  const missingRequired = (item.options ?? []).filter(
    (o) => countFor(o.id) < minFor(o),
  );

  const optionHint = (o: ItemOption): string => {
    if (!o.multiSelect) return o.required ? "Required" : "Optional";
    const { min, max } = o;
    if (min && max) return min === max ? `Pick ${min}` : `Pick ${min}–${max}`;
    if (max) return `Pick up to ${max}`;
    if (min) return `Pick at least ${min}`;
    return o.required ? "Pick 1 or more" : "Optional · pick any";
  };

  const doAdd = () => {
    addLine({ item, storeId, qty, selectedChoices: choices, note });
    showToast(`Added ${qty}× ${item.name}`, "🛒");
    navigate(-1);
  };

  const handleAdd = () => {
    if (missingRequired.length > 0) return;
    if (wouldReplace(storeId)) {
      setConfirmOpen(true);
      return;
    }
    doAdd();
  };

  return (
    <Screen className="pb-28">
      <div className="relative grid h-52 place-items-center overflow-hidden bg-neutral-100 text-8xl dark:bg-neutral-800">
        <Thumb src={item.icon} emoji={item.emoji} alt={item.name} fallback="food" rounded="" fit="contain" />
        <div className="absolute inset-x-0 top-0">
          <TopBar transparent />
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {item.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {item.description}
          </p>
          <p className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
            {money(item.basePrice)}
          </p>
        </div>

        {(item.options ?? []).map((opt) => {
          const atMax =
            opt.multiSelect && opt.max != null && countFor(opt.id) >= opt.max;
          return (
            <section key={opt.id}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 dark:text-white">{opt.label}</h3>
                <span className="text-xs font-medium text-neutral-400">
                  {optionHint(opt)}
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl bg-white shadow-card dark:bg-neutral-900">
                {opt.choices.map((choice, idx) => {
                  const checked = isChosen(opt.id, choice.id);
                  const locked = atMax && !checked;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => selectChoice(opt, choice.id)}
                      disabled={locked}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left transition disabled:opacity-40 ${
                        idx > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-4 w-4 shrink-0 border-2 transition ${
                            opt.multiSelect ? "rounded" : "rounded-full"
                          } ${
                            checked
                              ? "border-brand-500 bg-brand-500"
                              : "border-neutral-300 dark:border-neutral-600"
                          }`}
                        />
                        <span className="text-neutral-800 dark:text-neutral-100">
                          {choice.label}
                        </span>
                      </span>
                      {choice.priceDelta > 0 && (
                        <span className="text-sm text-neutral-500">
                          +{money(choice.priceDelta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section>
          <h3 className="mb-2 font-bold text-neutral-900 dark:text-white">
            Special instructions
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. no onions, extra napkins"
            className="w-full resize-none rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 outline-none focus:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </section>

        <section className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 dark:text-white">Quantity</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 active:scale-90 disabled:opacity-40 dark:bg-neutral-800"
              disabled={qty <= 1}
            >
              <Minus size={18} />
            </button>
            <span className="w-6 text-center text-lg font-bold text-neutral-900 dark:text-white">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
              className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 active:scale-90 dark:bg-neutral-800"
            >
              <Plus size={18} />
            </button>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] border-t border-neutral-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <button onClick={handleAdd} disabled={missingRequired.length > 0} className="btn-primary w-full">
          {missingRequired.length > 0
            ? `Select ${missingRequired[0].label}`
            : `Add ${qty} to cart · ${money(unitPrice * qty)}`}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Start a new cart?"
        body="Your cart has items from another store. Adding this will clear it."
        confirmLabel="Clear & add"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          doAdd();
        }}
      />
    </Screen>
  );
}
