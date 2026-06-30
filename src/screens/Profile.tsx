import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  LocateFixed,
  Trash2,
  Pencil,
  Check,
  X,
  ShieldCheck,
  FileText,
  ChevronRight,
  UserRound,
} from "lucide-react";
import Screen from "../components/Screen";
import ConfirmDialog from "../components/ConfirmDialog";
import AddressAutocomplete from "../components/AddressAutocomplete";
import Thumb from "../components/Thumb";
import { useProfile, MAX_ADDRESSES } from "../store/profileStore";
import { useToasts } from "../store/toastStore";
import { useStores } from "../store/storesStore";
import { clearAll } from "../lib/storage";
import { levelForXp, multiplierForTier, tierName } from "../lib/loyalty";
import type { Address, GeoPoint } from "../data/types";

export default function Profile() {
  const profile = useProfile((s) => s.profile);
  const setName = useProfile((s) => s.setName);
  const addAddress = useProfile((s) => s.addAddress);
  const editAddress = useProfile((s) => s.editAddress);
  const removeAddress = useProfile((s) => s.removeAddress);
  const selectAddress = useProfile((s) => s.selectAddress);
  const showToast = useToasts((s) => s.show);
  const byId = useStores((s) => s.byId);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [addingAddr, setAddingAddr] = useState(false);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrLoc, setAddrLoc] = useState<GeoPoint | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const atMax = profile.addresses.length >= MAX_ADDRESSES;

  const loyalties = Object.entries(profile.loyalty)
    .map(([storeId, xp]) => ({ store: byId[storeId], level: levelForXp(xp) }))
    .filter((l) => l.store && l.level > 0)
    .sort((a, b) => b.level - a.level);

  const saveName = () => {
    const n = nameDraft.trim();
    if (n) setName(n);
    setEditingName(false);
  };

  // Use the device GPS for a precise drop-off, reverse-geocoded to a street
  // address (falls back to raw coordinates if the lookup is unavailable).
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      showToast("Location isn't supported on this device", "⚠️");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } },
          );
          const data = await res.json();
          setAddrLine(data?.display_name ?? fallback);
        } catch {
          setAddrLine(fallback);
        } finally {
          setAddrLoc({ lat: latitude, lng: longitude });
          if (!addrLabel.trim()) setAddrLabel("Current location");
          setLocating(false);
          showToast("Pinned your current location", "📍");
        }
      },
      () => {
        setLocating(false);
        showToast("Couldn't get your location", "⚠️");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const saveAddress = () => {
    if (addrLabel.trim() && addrLine.trim()) {
      if (!addAddress(addrLabel.trim(), addrLine.trim(), addrLoc)) {
        showToast(`Max ${MAX_ADDRESSES} addresses`, "⚠️");
        return;
      }
      setAddrLabel("");
      setAddrLine("");
      setAddrLoc(undefined);
      setAddingAddr(false);
      showToast("Address added", "📍");
    }
  };

  return (
    <Screen className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-4 pb-6 pt-8 text-white">
        <div className="flex items-center gap-4">
          {/* Default placeholder avatar (Instagram-style silhouette) */}
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-white/20 backdrop-blur">
            <UserRound
              size={44}
              className="translate-y-1.5 fill-white/70 text-white/70"
            />
          </span>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  className="w-full rounded-lg bg-white/90 px-2 py-1 text-base font-bold text-neutral-900 outline-none"
                />
                <button onClick={saveName} aria-label="Save name">
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameDraft(profile.name);
                  setEditingName(true);
                }}
                className="flex items-center gap-2"
              >
                <span className="truncate text-xl font-extrabold">{profile.name}</span>
                <Pencil size={15} className="opacity-80" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4">
        {/* Rewards: points + loyalty */}
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <Sparkles size={18} className="text-brand-500" />
              <span className="text-sm font-medium">Reward points</span>
            </div>
            <span className="text-xs text-neutral-400">earn 1 pt / $1</span>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-neutral-900 dark:text-white">
            {profile.points.toLocaleString()}{" "}
            <span className="text-base font-bold text-neutral-400">pts</span>
          </p>

          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-neutral-900 dark:text-white">
              Shop loyalty
            </p>
            {loyalties.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Order from a shop to build loyalty. Higher tiers multiply the points
                you earn there — but ordering elsewhere lowers it.
              </p>
            ) : (
              <div className="space-y-2">
                {loyalties.map(({ store, level }) => (
                  <Link
                    key={store.id}
                    to={`/store/${store.id}`}
                    className="flex items-center gap-3 rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-800/50"
                  >
                    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white shadow-card dark:bg-neutral-800">
                      <Thumb src={store.logo} alt={store.name} fallback="logo" rounded="rounded-full" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900 dark:text-white">
                        {store.name}
                      </p>
                      <p className="truncate text-xs text-brand-600 dark:text-brand-400">
                        {multiplierForTier(level).toFixed(1)}× points
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold leading-tight text-brand-600 dark:text-brand-400">
                        {tierName(level)}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                        Loyalty tier
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Addresses */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
              <MapPin size={18} /> Saved addresses
              <span className="text-xs font-medium text-neutral-400">
                {profile.addresses.length}/{MAX_ADDRESSES}
              </span>
            </h2>
            {!atMax && (
              <button
                onClick={() => setAddingAddr((v) => !v)}
                className="text-sm font-semibold text-brand-600 dark:text-brand-400"
              >
                {addingAddr ? "Cancel" : "+ Add"}
              </button>
            )}
          </div>

          {addingAddr && !atMax && (
            <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-card dark:bg-neutral-900">
              <input
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                placeholder="Label (e.g. Home, Work)"
                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:text-white"
              />
              <AddressAutocomplete
                value={addrLine}
                onChange={(line, loc) => {
                  setAddrLine(line);
                  setAddrLoc(loc);
                }}
                placeholder="Street address (e.g. 1 Raffles Place, #10-01)"
              />
              <button
                onClick={useMyLocation}
                disabled={locating}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500 py-2 text-sm font-semibold text-brand-600 transition active:scale-[0.99] disabled:opacity-60 dark:text-brand-400"
              >
                <LocateFixed size={16} className={locating ? "animate-spin" : ""} />
                {locating ? "Locating…" : "Use my current location"}
              </button>
              <button onClick={saveAddress} className="btn-primary w-full py-2 text-sm">
                Save address
              </button>
            </div>
          )}

          {profile.addresses.length === 0 && !addingAddr ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-neutral-400 shadow-card dark:bg-neutral-900">
              No addresses yet. Add a delivery address to start ordering.
            </p>
          ) : (
            <div className="space-y-2">
              {profile.addresses.map((addr) => (
                <AddressRow
                  key={addr.id}
                  addr={addr}
                  selected={addr.id === profile.selectedAddressId}
                  onSelect={() => selectAddress(addr.id)}
                  onSave={(label, line, loc) => {
                    editAddress(addr.id, label, line, loc);
                    showToast("Address updated", "✏️");
                  }}
                  onRemove={() => {
                    removeAddress(addr.id);
                    showToast("Address removed", "🗑️");
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Others */}
        <section>
          <h2 className="mb-2 text-base font-bold text-neutral-900 dark:text-white">
            Others
          </h2>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card dark:bg-neutral-900">
            <Link
              to="/legal/privacy"
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <ShieldCheck size={17} />
              </span>
              <span className="flex-1 font-semibold text-neutral-900 dark:text-white">
                Privacy Policy
              </span>
              <ChevronRight size={18} className="text-neutral-300" />
            </Link>
            <div className="border-t border-neutral-100 dark:border-neutral-800" />
            <Link
              to="/legal/terms"
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <FileText size={17} />
              </span>
              <span className="flex-1 font-semibold text-neutral-900 dark:text-white">
                Terms &amp; Conditions
              </span>
              <ChevronRight size={18} className="text-neutral-300" />
            </Link>
            <div className="border-t border-neutral-100 dark:border-neutral-800" />
            <button
              onClick={() => setResetOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/15">
                <Trash2 size={17} />
              </span>
              <span className="flex-1 font-semibold text-red-500">
                Reset simulation data
              </span>
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset everything?"
        body="This clears your points, loyalty, orders, cart, and addresses, then restarts the simulation."
        confirmLabel="Reset"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          clearAll();
          window.location.reload();
        }}
      />
    </Screen>
  );
}

function AddressRow({
  addr,
  selected,
  onSelect,
  onSave,
  onRemove,
}: {
  addr: Address;
  selected: boolean;
  onSelect: () => void;
  onSave: (label: string, line: string, loc?: GeoPoint) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(addr.label);
  const [line, setLine] = useState(addr.line);
  const [loc, setLoc] = useState<GeoPoint | undefined>(addr.loc);

  if (editing) {
    return (
      <div className="space-y-2 rounded-2xl bg-white p-3 shadow-card dark:bg-neutral-900">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:text-white"
        />
        <AddressAutocomplete
          value={line}
          onChange={(l, loc) => {
            setLine(l);
            setLoc(loc);
          }}
          placeholder="Street address"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="btn-secondary flex-1 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (label.trim() && line.trim()) {
                onSave(label.trim(), line.trim(), loc);
                setEditing(false);
              }
            }}
            className="btn-primary flex-1 py-2 text-sm"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card dark:bg-neutral-900">
      <button
        onClick={onSelect}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          selected
            ? "bg-brand-500 text-white"
            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
        }`}
        aria-label="Select address"
      >
        <MapPin size={16} />
      </button>
      <button onClick={onSelect} className="min-w-0 flex-1 text-left">
        <p className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-white">
          {addr.label}
          {selected && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              Selected
            </span>
          )}
        </p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {addr.line}
        </p>
      </button>
      <button
        onClick={() => {
          setLabel(addr.label);
          setLine(addr.line);
          setLoc(addr.loc);
          setEditing(true);
        }}
        aria-label="Edit address"
        className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 active:scale-90"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onRemove}
        aria-label="Remove address"
        className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 active:scale-90"
      >
        <X size={16} />
      </button>
    </div>
  );
}
