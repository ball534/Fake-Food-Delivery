import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  ImagePlus,
  Download,
  Utensils,
  MessageSquare,
  Settings2,
  Store as StoreIcon,
  Tag,
  X,
} from "lucide-react";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import { useToasts } from "../store/toastStore";
import { makeZip, downloadBlob, type ZipEntry } from "../lib/zip";
import { CUISINE_CATEGORIES } from "../data/categories";

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
  sections: SectionDraft[];
  icon?: File;
};
type CategoryDraft = { id: string; name: string; food: FoodDraft[] };
type DealDraft = {
  id: string;
  kind: "combo" | "item";
  emoji: string;
  title: string;
  sub: string;
  price: string;
  originalPrice: string;
};
type ReviewDraft = {
  id: string;
  author: string;
  rating: number;
  text: string;
};

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

// Resize + re-encode an uploaded image to WebP so exported stores stay light
// and match the .webp paths the shop loader builds.
async function encodeWebp(
  file: File,
  max: number,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("webp encode failed"))),
      "image/webp",
      quality,
    ),
  );
}

// Optimise on upload: resize + re-encode to a .webp File so the preview shows
// the real exported asset and the ZIP step can use the bytes as-is.
async function toWebpFile(
  file: File,
  max: number,
  quality?: number,
): Promise<File> {
  const blob = await encodeWebp(file, max, quality);
  const base = file.name.replace(/\.[^./\\]+$/, "") || "image";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

// Bytes for the ZIP. Files picked through ImagePicker are already optimised
// WebP; anything else (e.g. a picker that fell back to the raw file) is
// converted here so the exported paths always hold valid WebP.
async function imageBytes(
  file: File,
  max: number,
  quality?: number,
): Promise<Uint8Array> {
  if (file.type === "image/webp")
    return new Uint8Array(await file.arrayBuffer());
  return new Uint8Array(
    await (await encodeWebp(file, max, quality)).arrayBuffer(),
  );
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
  rating: 5,
  text: "",
});
const newDeal = (): DealDraft => ({
  id: uid(),
  kind: "combo",
  emoji: "",
  title: "",
  sub: "",
  price: "",
  originalPrice: "",
});

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function CreateStore() {
  const showToast = useToasts((s) => s.show);

  const [name, setName] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3>(1);
  const [rating, setRating] = useState("");
  const [banner, setBanner] = useState<File | undefined>();
  const [logo, setLogo] = useState<File | undefined>();

  const [categories, setCategories] = useState<CategoryDraft[]>([
    newCategory(),
  ]);
  const [deals, setDeals] = useState<DealDraft[]>([]);
  const [reviews, setReviews] = useState<ReviewDraft[]>([]);

  const [busy, setBusy] = useState(false);

  const patchCategory = (
    cid: string,
    fn: (c: CategoryDraft) => CategoryDraft,
  ) => setCategories((cs) => cs.map((c) => (c.id === cid ? fn(c) : c)));

  const patchFood = (
    cid: string,
    fid: string,
    fn: (f: FoodDraft) => FoodDraft,
  ) =>
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

  const validateForm = (): string | null => {
    if (!name.trim()) return "Give your store a name";
    if (!cuisines.length) return "Pick at least one cuisine category";
    const r = Number(rating);
    if (!rating.trim() || Number.isNaN(r) || r < 0 || r > 5)
      return "Enter a rating between 0 and 5";
    if (!categories.length) return "Add at least one menu category";
    for (const c of categories) {
      if (!c.name.trim()) return "Every menu category needs a name";
      if (!c.food.length)
        return `Add at least one item to “${c.name.trim() || "your category"}”`;
      for (const f of c.food) {
        if (!f.name.trim()) return "Every item needs a name";
        if (!f.description.trim())
          return `Add a description for “${f.name.trim()}”`;
        if (!f.price.trim() || Number.isNaN(Number(f.price)))
          return `Add a valid price for “${f.name.trim()}”`;
        for (const s of f.sections) {
          if (!s.name.trim())
            return `Name the option group on “${f.name.trim()}”`;
          if (!s.options.length) return `Add choices to “${s.name.trim()}”`;
          for (const o of s.options) {
            if (!o.name.trim())
              return `Every choice in “${s.name.trim()}” needs a name`;
            if (!o.price.trim() || Number.isNaN(Number(o.price)))
              return `Every choice in “${s.name.trim()}” needs a valid price`;
          }
        }
      }
    }
    for (const d of deals) {
      if (!d.title.trim()) return "Every deal needs a title";
      if (!d.sub.trim())
        return `Add a short description for “${d.title.trim()}”`;
      if (!d.price.trim() || Number.isNaN(Number(d.price)))
        return `Add a valid price for “${d.title.trim()}”`;
      if (d.originalPrice.trim()) {
        const orig = Number(d.originalPrice);
        if (Number.isNaN(orig))
          return `Original price for “${d.title.trim()}” must be a number`;
        if (orig <= Number(d.price))
          return `Original price for “${d.title.trim()}” must be higher than the deal price`;
      }
    }
    for (const rv of reviews) {
      if (!rv.author.trim()) return "Every review needs a reviewer name";
      if (!rv.text.trim()) return "Every review needs some text";
    }
    return null;
  };

  const exportZip = async () => {
    const error = validateForm();
    if (error) {
      showToast(error, "⚠️");
      return;
    }

    const shopName = name.trim();
    const id = slug(shopName);
    const usedItem = new Set<string>();
    const iconFiles: { path: string; file: File }[] = [];

    const menu = categories.map((c) => ({
      category: c.name.trim(),
      food: c.food.map((f) => {
        const itemId = uniqueSlug(slug(f.name.trim()), usedItem);
        if (f.icon)
          iconFiles.push({ path: `icons/${itemId}.webp`, file: f.icon });

        const section = f.sections.map((s) => {
          const out: Record<string, unknown> = {
            name: s.name.trim(),
            multiselect: s.multiselect,
            required: s.required,
          };
          if (s.multiselect && s.max.trim()) out.max = Number(s.max);
          out.options = s.options.map((o) => ({
            name: o.name.trim(),
            price: Number(o.price) || 0,
          }));
          return out;
        });

        const food: Record<string, unknown> = {
          name: f.name.trim(),
          description: f.description.trim(),
          price: Number(f.price) || 0,
        };
        if (section.length) food.section = section;
        return food;
      }),
    }));

    const shop: Record<string, unknown> = {
      name: shopName,
      categories: cuisines,
      pricelevel: priceLevel,
      rating: Number(rating),
      menu,
    };

    const dealsOut = deals.map((d) => {
      const out: Record<string, unknown> = {
        kind: d.kind,
        emoji: d.emoji.trim(),
        title: d.title.trim(),
        sub: d.sub.trim(),
        price: Number(d.price) || 0,
      };
      if (d.originalPrice.trim()) out.originalPrice = Number(d.originalPrice);
      return out;
    });
    if (dealsOut.length) shop.deals = dealsOut;

    const reviewOut = reviews.map((r) => ({
      author: r.author.trim(),
      rating: r.rating,
      text: r.text.trim(),
    }));
    if (reviewOut.length) shop.reviews = reviewOut;

    try {
      setBusy(true);
      const enc = new TextEncoder();
      const entries: ZipEntry[] = [
        {
          name: `${id}/shop.json`,
          data: enc.encode(JSON.stringify(shop, null, 2)),
        },
        { name: `${id}/HOW-TO-INSTALL.txt`, data: enc.encode(installNote(id)) },
      ];
      if (banner)
        entries.push({
          name: `${id}/banner.webp`,
          data: await imageBytes(banner, 1200, 0.8),
        });
      if (logo)
        entries.push({
          name: `${id}/logo.webp`,
          data: await imageBytes(logo, 400, 0.85),
        });
      for (const ic of iconFiles)
        entries.push({
          name: `${id}/${ic.path}`,
          data: await imageBytes(ic.file, 600),
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
        <p className="text-sm text-neutral-500">
          Build your own shop by filling in the form below, then export it as a{" "}
          <code>.zip</code> you can drop into <code>public/shops/</code>.
        </p>

        <FormCard icon={<StoreIcon size={18} />} title="Store details">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Store name"
          />
          <CuisinePicker selected={cuisines} onChange={setCuisines} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex gap-1.5">
              {([1, 2, 3] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriceLevel(p)}
                  className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
                    priceLevel === p
                      ? "bg-brand-500 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {"$".repeat(p)}
                </button>
              ))}
            </div>
            <input
              className={inputCls}
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Rating (0–5)"
            />
          </div>
        </FormCard>

        <FormCard icon={<ImagePlus size={18} />} title="Images">
          <div className="grid grid-cols-2 gap-3">
            <ImagePicker
              label="Logo"
              file={logo}
              onPick={setLogo}
              max={400}
              quality={0.85}
            />
            <ImagePicker
              label="Banner"
              file={banner}
              onPick={setBanner}
              max={1200}
              quality={0.8}
            />
          </div>
        </FormCard>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 px-1 text-base font-bold text-neutral-900">
            <Utensils size={18} /> Menu
          </h2>

          {categories.map((cat) => (
            <div key={cat.id} className="card space-y-3 p-4">
              <div className="flex items-center gap-2">
                <input
                  className={`${inputCls} font-semibold`}
                  value={cat.name}
                  onChange={(e) =>
                    patchCategory(cat.id, (c) => ({
                      ...c,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Category"
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
                {cat.food.map((food) => (
                  <div
                    key={food.id}
                    className="space-y-2.5 rounded-xl border border-neutral-200 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        className={inputCls}
                        value={food.name}
                        onChange={(e) =>
                          patchFood(cat.id, food.id, (f) => ({
                            ...f,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Name"
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
                          patchFood(cat.id, food.id, (f) => ({
                            ...f,
                            price: e.target.value,
                          }))
                        }
                        placeholder="Price"
                      />
                      <ImagePicker
                        label="Photo"
                        compact
                        max={600}
                        file={food.icon}
                        onPick={(file) =>
                          patchFood(cat.id, food.id, (f) => ({
                            ...f,
                            icon: file,
                          }))
                        }
                      />
                    </div>

                    {food.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="space-y-2 rounded-lg bg-neutral-50 p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <Settings2
                            size={14}
                            className="shrink-0 text-neutral-400"
                          />
                          <input
                            className={`${inputCls} py-1.5`}
                            value={sec.name}
                            onChange={(e) =>
                              patchSection(cat.id, food.id, sec.id, (s) => ({
                                ...s,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Option group"
                          />
                          <IconBtn
                            label="Remove option group"
                            onClick={() =>
                              patchFood(cat.id, food.id, (f) => ({
                                ...f,
                                sections: f.sections.filter(
                                  (s) => s.id !== sec.id,
                                ),
                              }))
                            }
                          >
                            <X size={15} />
                          </IconBtn>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-6 text-xs font-medium text-neutral-600">
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
                                  patchSection(
                                    cat.id,
                                    food.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      max: e.target.value,
                                    }),
                                  )
                                }
                                className="w-14 rounded-md border border-neutral-200 bg-transparent px-1.5 py-0.5 outline-none focus:border-brand-500"
                              />
                            </label>
                          )}
                        </div>

                        <div className="space-y-1.5 pl-6">
                          {sec.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                className={`${inputCls} py-1.5`}
                                value={opt.name}
                                onChange={(e) =>
                                  patchSection(
                                    cat.id,
                                    food.id,
                                    sec.id,
                                    (s) => ({
                                      ...s,
                                      options: s.options.map((o) =>
                                        o.id === opt.id
                                          ? { ...o, name: e.target.value }
                                          : o,
                                      ),
                                    }),
                                  )
                                }
                                placeholder="Choice"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-neutral-400">
                                  +$
                                </span>
                                <input
                                  className="w-16 rounded-lg border border-neutral-200 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                                  type="number"
                                  min={0}
                                  step={0.1}
                                  value={opt.price}
                                  onChange={(e) =>
                                    patchSection(
                                      cat.id,
                                      food.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        options: s.options.map((o) =>
                                          o.id === opt.id
                                            ? { ...o, price: e.target.value }
                                            : o,
                                        ),
                                      }),
                                    )
                                  }
                                />
                              </div>
                              {sec.options.length > 1 && (
                                <IconBtn
                                  label="Remove choice"
                                  onClick={() =>
                                    patchSection(
                                      cat.id,
                                      food.id,
                                      sec.id,
                                      (s) => ({
                                        ...s,
                                        options: s.options.filter(
                                          (o) => o.id !== opt.id,
                                        ),
                                      }),
                                    )
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
                            className="text-xs font-semibold text-brand-600"
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
                      className="text-xs font-semibold text-brand-600"
                    >
                      + Add customisation group
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    patchCategory(cat.id, (c) => ({
                      ...c,
                      food: [...c.food, newFood()],
                    }))
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
          <h2 className="flex items-center gap-2 px-1 text-base font-bold text-neutral-900">
            <Tag size={18} /> Deals
            <span className="text-xs font-medium text-neutral-400">
              Optional · limited-time specials
            </span>
          </h2>

          {deals.map((d) => (
            <div key={d.id} className="card space-y-2.5 p-4">
              <div className="flex items-center gap-2">
                <input
                  className="w-14 rounded-xl border border-neutral-200 bg-transparent px-2 py-2 text-center text-lg outline-none focus:border-brand-500"
                  value={d.emoji}
                  onChange={(e) =>
                    setDeals((ds) =>
                      ds.map((x) =>
                        x.id === d.id ? { ...x, emoji: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Icon"
                />
                <input
                  className={inputCls}
                  value={d.title}
                  onChange={(e) =>
                    setDeals((ds) =>
                      ds.map((x) =>
                        x.id === d.id ? { ...x, title: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Deal title"
                />
                <IconBtn
                  label="Remove deal"
                  onClick={() =>
                    setDeals((ds) => ds.filter((x) => x.id !== d.id))
                  }
                >
                  <Trash2 size={16} />
                </IconBtn>
              </div>

              <div className="flex gap-1.5">
                {(["combo", "item"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      setDeals((ds) =>
                        ds.map((x) => (x.id === d.id ? { ...x, kind: k } : x)),
                      )
                    }
                    className={`flex-1 rounded-xl py-2 text-sm font-bold capitalize transition ${
                      d.kind === k
                        ? "bg-brand-500 text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {k === "combo" ? "Special combo" : "Limited-time item"}
                  </button>
                ))}
              </div>

              <input
                className={inputCls}
                value={d.sub}
                onChange={(e) =>
                  setDeals((ds) =>
                    ds.map((x) =>
                      x.id === d.id ? { ...x, sub: e.target.value } : x,
                    ),
                  )
                }
                placeholder="Short description"
              />

              <div className="grid grid-cols-2 gap-2">
                <Field label="Deal price">
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    step={0.1}
                    value={d.price}
                    onChange={(e) =>
                      setDeals((ds) =>
                        ds.map((x) =>
                          x.id === d.id ? { ...x, price: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </Field>
                <Field
                  label="Original price"
                  hint="Optional — shown struck through"
                >
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    step={0.1}
                    value={d.originalPrice}
                    onChange={(e) =>
                      setDeals((ds) =>
                        ds.map((x) =>
                          x.id === d.id
                            ? { ...x, originalPrice: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setDeals((ds) => [...ds, newDeal()])}
            className="btn-secondary w-full py-2.5 text-sm"
          >
            <Plus size={16} /> Add deal
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 px-1 text-base font-bold text-neutral-900">
            <MessageSquare size={18} /> Reviews
            <span className="text-xs font-medium text-neutral-400">
              Optional
            </span>
          </h2>

          {reviews.map((r) => (
            <div key={r.id} className="card space-y-2.5 p-4">
              <div className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={r.author}
                  onChange={(e) =>
                    setReviews((rs) =>
                      rs.map((x) =>
                        x.id === r.id ? { ...x, author: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Reviewer name"
                />
                <IconBtn
                  label="Remove review"
                  onClick={() =>
                    setReviews((rs) => rs.filter((x) => x.id !== r.id))
                  }
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
                    rs.map((x) =>
                      x.id === r.id ? { ...x, text: e.target.value } : x,
                    ),
                  )
                }
                placeholder="What did they say?"
              />
              <Field label="Rating">
                <select
                  className={inputCls}
                  value={r.rating}
                  onChange={(e) =>
                    setReviews((rs) =>
                      rs.map((x) =>
                        x.id === r.id
                          ? { ...x, rating: Number(e.target.value) }
                          : x,
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

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] border-t border-neutral-200 bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
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
      <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900">
        {icon} {title}
        {subtitle && (
          <span className="text-xs font-medium text-neutral-400">
            {subtitle}
          </span>
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
      <span className="text-sm font-semibold text-neutral-700">
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
  max,
  quality,
  compact = false,
}: {
  label: string;
  file?: File;
  onPick: (f: File | undefined) => void;
  max: number;
  quality?: number;
  compact?: boolean;
}) {
  const [url, setUrl] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Preview straight from the picked File, revoking the object URL on change.
  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      onPick(await toWebpFile(f, max, quality)); // optimise on upload
    } catch {
      onPick(f); // fall back to raw; export re-encodes as a safety net
    } finally {
      setBusy(false);
    }
  };

  const heightCls = compact ? "h-20" : "h-28";

  if (url) {
    return (
      <div
        className={`group relative overflow-hidden rounded-xl border border-brand-500 ${heightCls}`}
      >
        <img src={url} alt={label} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 px-2 py-1 text-xs font-medium text-white">
          <span className="truncate">{label}</span>
          <div className="flex shrink-0 items-center gap-0.5">
            <label className="cursor-pointer rounded px-1.5 py-0.5 transition hover:bg-white/20">
              Change
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={() => onPick(undefined)}
              className="grid place-items-center rounded p-0.5 transition hover:bg-white/20"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 text-sm font-medium text-neutral-500 transition hover:border-brand-500 hover:text-brand-600 ${heightCls}`}
    >
      {busy ? (
        <span className="text-xs">Optimising…</span>
      ) : (
        <>
          <ImagePlus size={18} />
          <span className="truncate">{label}</span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </label>
  );
}

function CuisinePicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = CUISINE_CATEGORIES.filter(
    (c) => !selected.includes(c) && c.toLowerCase().includes(q),
  );

  const add = (c: string) => {
    if (selected.includes(c) || !CUISINE_CATEGORIES.includes(c)) return;
    onChange([...selected, c]);
    setQuery("");
    setOpen(false);
  };
  const remove = (c: string) => onChange(selected.filter((x) => x !== c));

  return (
    <div ref={boxRef} className="relative">
      {selected.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <span
              key={c}
              className="chip chip-active inline-flex items-center gap-1"
            >
              {c}
              <button
                type="button"
                aria-label={`Remove ${c}`}
                onClick={() => remove(c)}
                className="-mr-0.5 transition active:scale-90"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        className={inputCls}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (matches.length) add(matches[0]);
          }
        }}
        placeholder={
          selected.length
            ? "Add another category…"
            : "Type to search categories"
        }
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-card">
          {matches.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => add(c)}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-50"
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && q && matches.length === 0 && (
        <p className="mt-1 px-1 text-xs text-neutral-400">
          No matching categories
        </p>
      )}
    </div>
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
    "   refreshes the shop list in public/content.json and your",
    "   store appears automatically — no code changes needed.",
    "",
    "Folder contents:",
    "   shop.json    - your store's menu + details (required)",
    "   logo.webp    - square brand logo (optional)",
    "   banner.webp  - wide banner image (optional)",
    "   icons/*.webp - one image per menu item (optional)",
    "",
    "Any missing image falls back to a text label, so the",
    "store works even without art.",
    "",
  ].join("\n");
}
