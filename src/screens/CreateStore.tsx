import { useState } from "react";
import {
  Plus,
  Trash2,
  ImagePlus,
  Download,
  Utensils,
  MessageSquare,
  Settings2,
  Store as StoreIcon,
  X,
} from "lucide-react";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import { useToasts } from "../store/toastStore";
import { makeZip, downloadBlob, type ZipEntry } from "../lib/zip";

type OptionDraft = { id: string; name: string; price: string };
type SectionDraft = {
  id: string;
  name: string;
  multiselect: boolean;
  required: boolean;
  max: string;
  options: OptionDraft[];
};
type FoodDraft = {
  id: string;
  name: string;
  description: string;
  price: string;
  tags: string[];
  sections: SectionDraft[];
  icon?: File;
};
type CategoryDraft = { id: string; name: string; food: FoodDraft[] };
type ReviewDraft = {
  id: string;
  author: string;
  emoji: string;
  rating: number;
  text: string;
  daysAgo: string;
};

const TAG_CHOICES = ["popular", "new", "spicy"];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x"
  );
}

function uniqueSlug(base: string, used: Set<string>): string {
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

const newOption = (): OptionDraft => ({ id: uid(), name: "", price: "0" });
const newSection = (): SectionDraft => ({
  id: uid(),
  name: "",
  multiselect: false,
  required: false,
  max: "",
  options: [newOption(), newOption()],
});
const newFood = (): FoodDraft => ({
  id: uid(),
  name: "",
  description: "",
  price: "",
  tags: [],
  sections: [],
});
const newCategory = (): CategoryDraft => ({
  id: uid(),
  name: "",
  food: [newFood()],
});
const newReview = (): ReviewDraft => ({
  id: uid(),
  author: "",
  emoji: "🙂",
  rating: 5,
  text: "",
  daysAgo: "1",
});

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:text-white";

export default function CreateStore() {
  const showToast = useToasts((s) => s.show);

  const [name, setName] = useState("");
  const [cuisines, setCuisines] = useState("");
  const [fastFood, setFastFood] = useState(false);
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3>(1);
  const [rating, setRating] = useState("4.5");
  const [banner, setBanner] = useState<File | undefined>();
  const [logo, setLogo] = useState<File | undefined>();

  const [categories, setCategories] = useState<CategoryDraft[]>([newCategory()]);
  const [reviews, setReviews] = useState<ReviewDraft[]>([]);

  const [busy, setBusy] = useState(false);

  const patchCategory = (cid: string, fn: (c: CategoryDraft) => CategoryDraft) =>
    setCategories((cs) => cs.map((c) => (c.id === cid ? fn(c) : c)));

  const patchFood = (cid: string, fid: string, fn: (f: FoodDraft) => FoodDraft) =>
    patchCategory(cid, (c) => ({
      ...c,
      food: c.food.map((f) => (f.id === fid ? fn(f) : f)),
    }));

  const patchSection = (
    cid: string,
    fid: string,
    sid: string,
    fn: (s: SectionDraft) => SectionDraft,
  ) =>
    patchFood(cid, fid, (f) => ({
      ...f,
      sections: f.sections.map((s) => (s.id === sid ? fn(s) : s)),
    }));

  const exportZip = async () => {
    const shopName = name.trim();
    if (!shopName) {
      showToast("Give your store a name first", "⚠️");
      return;
    }

    const id = slug(shopName);
    const usedItem = new Set<string>();
    const iconFiles: { path: string; file: File }[] = [];

    const menu = categories
      .map((c) => ({
        category: c.name.trim(),
        food: c.food
          .filter((f) => f.name.trim())
          .map((f) => {
            const itemId = uniqueSlug(slug(f.name.trim()), usedItem);
            if (f.icon) iconFiles.push({ path: `icons/${itemId}.png`, file: f.icon });

            const section = f.sections
              .filter((s) => s.name.trim() && s.options.some((o) => o.name.trim()))
              .map((s) => {
                const out: Record<string, unknown> = {
                  name: s.name.trim(),
                  multiselect: s.multiselect,
                  required: s.required,
                };
                if (s.multiselect && s.max.trim()) out.max = Number(s.max);
                out.options = s.options
                  .filter((o) => o.name.trim())
                  .map((o) => ({ name: o.name.trim(), price: Number(o.price) || 0 }));
                return out;
              });

            const food: Record<string, unknown> = { name: f.name.trim() };
            if (f.description.trim()) food.description = f.description.trim();
            food.price = Number(f.price) || 0;
            if (f.tags.length) food.tags = f.tags;
            if (section.length) food.section = section;
            return food;
          }),
      }))
      .filter((c) => c.category && c.food.length);

    if (!menu.length) {
      showToast("Add at least one category with one item", "⚠️");
      return;
    }

    const cats = cuisines
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const shop: Record<string, unknown> = {
      name: shopName,
      categories: cats.length ? cats : ["Other"],
      fastfood: fastFood,
      pricelevel: priceLevel,
      rating: Number(rating) || 4.5,
      menu,
    };

    const reviewOut = reviews
      .filter((r) => r.author.trim() && r.text.trim())
      .map((r) => ({
        author: r.author.trim(),
        emoji: r.emoji.trim() || "🙂",
        rating: r.rating,
        text: r.text.trim(),
        daysAgo: Number(r.daysAgo) || 0,
      }));
    if (reviewOut.length) shop.reviews = reviewOut;

    try {
      setBusy(true);
      const enc = new TextEncoder();
      const entries: ZipEntry[] = [
        { name: `${id}/shop.json`, data: enc.encode(JSON.stringify(shop, null, 2)) },
        { name: `${id}/HOW-TO-INSTALL.txt`, data: enc.encode(installNote(id)) },
      ];
      if (banner)
        entries.push({ name: `${id}/banner.png`, data: new Uint8Array(await banner.arrayBuffer()) });
      if (logo)
        entries.push({ name: `${id}/logo.png`, data: new Uint8Array(await logo.arrayBuffer()) });
      for (const ic of iconFiles)
        entries.push({
          name: `${id}/${ic.path}`,
          data: new Uint8Array(await ic.file.arrayBuffer()),
        });

      downloadBlob(makeZip(entries), `${id}.zip`);
      showToast("Store exported as ZIP", "📦");
    } catch {
      showToast("Couldn't build the ZIP", "⚠️");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen className="pb-28">
      <TopBar title="Create a store" />

      <div className="space-y-5 p-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Build your own shop by filling in the form below, then export it as a{" "}
          <code>.zip</code> you can drop into <code>public/shops/</code>.
        </p>

        <FormCard icon={<StoreIcon size={18} />} title="Store details">
          <Field label="Store name" hint="Required — also becomes the folder id.">
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunny Burgers"
            />
          </Field>
          <Field label="Cuisine categories" hint="Comma-separated. The first is the main chip.">
            <input
              className={inputCls}
              value={cuisines}
              onChange={(e) => setCuisines(e.target.value)}
              placeholder="e.g. Western, Burgers"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price level">
              <div className="flex gap-1.5">
                {([1, 2, 3] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriceLevel(p)}
                    className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
                      priceLevel === p
                        ? "bg-brand-500 text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    }`}
                  >
                    {"$".repeat(p)}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Rating" hint="0–5">
              <input
                className={inputCls}
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={fastFood}
              onChange={(e) => setFastFood(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Show under the “Fast Food” filter
          </label>
        </FormCard>

        <FormCard icon={<ImagePlus size={18} />} title="Images" subtitle="Optional">
          <div className="grid grid-cols-2 gap-3">
            <ImagePicker label="Logo" file={logo} onPick={setLogo} />
            <ImagePicker label="Banner" file={banner} onPick={setBanner} />
          </div>
        </FormCard>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 px-1 text-base font-bold text-neutral-900 dark:text-white">
            <Utensils size={18} /> Menu
          </h2>

          {categories.map((cat, ci) => (
            <div key={cat.id} className="card space-y-3 p-4">
              <div className="flex items-center gap-2">
                <input
                  className={`${inputCls} font-semibold`}
                  value={cat.name}
                  onChange={(e) =>
                    patchCategory(cat.id, (c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder={`Category ${ci + 1} (e.g. Burgers)`}
                />
                {categories.length > 1 && (
                  <IconBtn
                    label="Remove category"
                    onClick={() =>
                      setCategories((cs) => cs.filter((c) => c.id !== cat.id))
                    }
                  >
                    <Trash2 size={16} />
                  </IconBtn>
                )}
              </div>

              <div className="space-y-3">
                {cat.food.map((food, fi) => (
                  <div
                    key={food.id}
                    className="space-y-2.5 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        className={inputCls}
                        value={food.name}
                        onChange={(e) =>
                          patchFood(cat.id, food.id, (f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder={`Item ${fi + 1} name`}
                      />
                      <IconBtn
                        label="Remove item"
                        onClick={() =>
                          patchCategory(cat.id, (c) => ({
                            ...c,
                            food: c.food.filter((f) => f.id !== food.id),
                          }))
                        }
                      >
                        <Trash2 size={16} />
                      </IconBtn>
                    </div>

                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={2}
                      value={food.description}
                      onChange={(e) =>
                        patchFood(cat.id, food.id, (f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Short description"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className={inputCls}
                        type="number"
                        min={0}
                        step={0.1}
                        value={food.price}
                        onChange={(e) =>
                          patchFood(cat.id, food.id, (f) => ({ ...f, price: e.target.value }))
                        }
                        placeholder="Price"
                      />
                      <ImagePicker
                        label="Photo"
                        compact
                        file={food.icon}
                        onPick={(file) =>
                          patchFood(cat.id, food.id, (f) => ({ ...f, icon: file }))
                        }
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {TAG_CHOICES.map((tag) => {
                        const on = food.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              patchFood(cat.id, food.id, (f) => ({
                                ...f,
                                tags: on
                                  ? f.tags.filter((t) => t !== tag)
                                  : [...f.tags, tag],
                              }))
                            }
                            className={on ? "chip chip-active" : "chip"}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    {food.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="space-y-2 rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <Settings2 size={14} className="shrink-0 text-neutral-400" />
                          <input
                            className={`${inputCls} py-1.5`}
                            value={sec.name}
                            onChange={(e) =>
                              patchSection(cat.id, food.id, sec.id, (s) => ({
                                ...s,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Option group (e.g. Size)"
                          />
                          <IconBtn
                            label="Remove option group"
                            onClick={() =>
                              patchFood(cat.id, food.id, (f) => ({
                                ...f,
                                sections: f.sections.filter((s) => s.id !== sec.id),
                              }))
                            }
                          >
                            <X size={15} />
                          </IconBtn>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-6 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={sec.multiselect}
                              onChange={(e) =>
                                patchSection(cat.id, food.id, sec.id, (s) => ({
                                  ...s,
                                  multiselect: e.target.checked,
                                }))
                              }
                              className="h-3.5 w-3.5 accent-brand-500"
                            />
                            Pick many
                          </label>
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={sec.required}
                              onChange={(e) =>
                                patchSection(cat.id, food.id, sec.id, (s) => ({
                                  ...s,
                                  required: e.target.checked,
                                }))
                              }
                              className="h-3.5 w-3.5 accent-brand-500"
                            />
                            Required
                          </label>
                          {sec.multiselect && (
                            <label className="flex items-center gap-1.5">
                              Max
                              <input
                                type="number"
                                min={1}
                                value={sec.max}
                                onChange={(e) =>
                                  patchSection(cat.id, food.id, sec.id, (s) => ({
                                    ...s,
                                    max: e.target.value,
                                  }))
                                }
                                className="w-14 rounded-md border border-neutral-200 bg-transparent px-1.5 py-0.5 outline-none focus:border-brand-500 dark:border-neutral-700"
                              />
                            </label>
                          )}
                        </div>

                        <div className="space-y-1.5 pl-6">
                          {sec.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <input
                                className={`${inputCls} py-1.5`}
                                value={opt.name}
                                onChange={(e) =>
                                  patchSection(cat.id, food.id, sec.id, (s) => ({
                                    ...s,
                                    options: s.options.map((o) =>
                                      o.id === opt.id ? { ...o, name: e.target.value } : o,
                                    ),
                                  }))
                                }
                                placeholder="Choice"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-neutral-400">+$</span>
                                <input
                                  className="w-16 rounded-lg border border-neutral-200 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:text-white"
                                  type="number"
                                  min={0}
                                  step={0.1}
                                  value={opt.price}
                                  onChange={(e) =>
                                    patchSection(cat.id, food.id, sec.id, (s) => ({
                                      ...s,
                                      options: s.options.map((o) =>
                                        o.id === opt.id ? { ...o, price: e.target.value } : o,
                                      ),
                                    }))
                                  }
                                />
                              </div>
                              {sec.options.length > 1 && (
                                <IconBtn
                                  label="Remove choice"
                                  onClick={() =>
                                    patchSection(cat.id, food.id, sec.id, (s) => ({
                                      ...s,
                                      options: s.options.filter((o) => o.id !== opt.id),
                                    }))
                                  }
                                >
                                  <X size={14} />
                                </IconBtn>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              patchSection(cat.id, food.id, sec.id, (s) => ({
                                ...s,
                                options: [...s.options, newOption()],
                              }))
                            }
                            className="text-xs font-semibold text-brand-600 dark:text-brand-400"
                          >
                            + Add choice
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        patchFood(cat.id, food.id, (f) => ({
                          ...f,
                          sections: [...f.sections, newSection()],
                        }))
                      }
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400"
                    >
                      + Add customisation group
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    patchCategory(cat.id, (c) => ({ ...c, food: [...c.food, newFood()] }))
                  }
                  className="btn-secondary w-full py-2 text-sm"
                >
                  <Plus size={16} /> Add item
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setCategories((cs) => [...cs, newCategory()])}
            className="btn-secondary w-full py-2.5 text-sm"
          >
            <Plus size={16} /> Add category
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 px-1 text-base font-bold text-neutral-900 dark:text-white">
            <MessageSquare size={18} /> Reviews
            <span className="text-xs font-medium text-neutral-400">Optional</span>
          </h2>

          {reviews.map((r) => (
            <div key={r.id} className="card space-y-2.5 p-4">
              <div className="flex items-center gap-2">
                <input
                  className="w-14 rounded-xl border border-neutral-200 bg-transparent px-2 py-2 text-center text-lg outline-none focus:border-brand-500 dark:border-neutral-700"
                  value={r.emoji}
                  onChange={(e) =>
                    setReviews((rs) =>
                      rs.map((x) => (x.id === r.id ? { ...x, emoji: e.target.value } : x)),
                    )
                  }
                  placeholder="🙂"
                />
                <input
                  className={inputCls}
                  value={r.author}
                  onChange={(e) =>
                    setReviews((rs) =>
                      rs.map((x) => (x.id === r.id ? { ...x, author: e.target.value } : x)),
                    )
                  }
                  placeholder="Reviewer name"
                />
                <IconBtn
                  label="Remove review"
                  onClick={() => setReviews((rs) => rs.filter((x) => x.id !== r.id))}
                >
                  <Trash2 size={16} />
                </IconBtn>
              </div>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                value={r.text}
                onChange={(e) =>
                  setReviews((rs) =>
                    rs.map((x) => (x.id === r.id ? { ...x, text: e.target.value } : x)),
                  )
                }
                placeholder="What did they say?"
              />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Rating">
                  <select
                    className={inputCls}
                    value={r.rating}
                    onChange={(e) =>
                      setReviews((rs) =>
                        rs.map((x) =>
                          x.id === r.id ? { ...x, rating: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Days ago">
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    value={r.daysAgo}
                    onChange={(e) =>
                      setReviews((rs) =>
                        rs.map((x) => (x.id === r.id ? { ...x, daysAgo: e.target.value } : x)),
                      )
                    }
                  />
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setReviews((rs) => [...rs, newReview()])}
            className="btn-secondary w-full py-2.5 text-sm"
          >
            <Plus size={16} /> Add review
          </button>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] border-t border-neutral-200 bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <button
          onClick={exportZip}
          disabled={busy}
          className="btn-primary w-full"
        >
          <Download size={18} />
          {busy ? "Building ZIP…" : "Export as ZIP"}
        </button>
      </div>
    </Screen>
  );
}

function FormCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-3 p-4">
      <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
        {icon} {title}
        {subtitle && (
          <span className="text-xs font-medium text-neutral-400">{subtitle}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-400 transition active:scale-90 hover:text-red-500"
    >
      {children}
    </button>
  );
}

function ImagePicker({
  label,
  file,
  onPick,
  compact = false,
}: {
  label: string;
  file?: File;
  onPick: (f: File | undefined) => void;
  compact?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-sm font-medium text-neutral-500 transition hover:border-brand-500 hover:text-brand-600 dark:border-neutral-700 ${
        compact ? "py-2" : "py-3"
      } ${file ? "border-brand-500 text-brand-600 dark:text-brand-400" : ""}`}
    >
      <ImagePlus size={16} />
      <span className="truncate">{file ? file.name : label}</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </label>
  );
}

function installNote(id: string): string {
  return [
    `How to add "${id}" to the app`,
    "=================================",
    "",
    "1. Unzip this archive. You'll get a folder named:",
    `       ${id}/`,
    "",
    "2. Move that whole folder into the app's shop directory:",
    `       public/shops/${id}/`,
    "",
    "3. Rebuild (or restart the dev server). The build step",
    "   regenerates public/index.json and your store appears",
    "   automatically — no code changes needed.",
    "",
    "Folder contents:",
    "   shop.json   - your store's menu + details (required)",
    "   logo.png    - square brand logo (optional)",
    "   banner.png  - wide banner image (optional)",
    "   icons/*.png - one image per menu item (optional)",
    "",
    "Any missing image falls back to a text label, so the",
    "store works even without art.",
    "",
  ].join("\n");
}
