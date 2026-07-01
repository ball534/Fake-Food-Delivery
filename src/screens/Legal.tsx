import { useParams } from "react-router-dom";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";

type Section = { heading: string; body: string };

type Doc = {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
};

const DOCS: Record<string, Doc> = {
  privacy: {
    title: "Privacy Policy",
    updated: "1 July 2026",
    intro:
      "FakeEats is a food-delivery simulation built for fun and learning. This policy explains, in plain language, what happens with your information.",
    sections: [
      {
        heading: "What we store",
        body: "Everything you do in FakeEats — your name, chosen avatar, saved addresses, orders, reward points and loyalty — is stored only on this device, in your browser's local storage. We run no servers and keep no user accounts, so this information stays with you unless you clear it.",
      },
      {
        heading: "Address search & maps",
        body: "Two features reach the internet. When you type a delivery address, the text you enter is sent to OpenStreetMap's Nominatim service to suggest matches and look up map coordinates. When you track an order, the map tiles are loaded from CARTO's basemap service. Those providers handle the requests under their own privacy policies and can see your IP address. If you never search an address or open a live map, nothing leaves your device.",
      },
      {
        heading: "What we collect",
        body: "Beyond the address search and map tiles described above, nothing. There are no analytics, no trackers, no advertising cookies, and we never sell or share your data. We could not see your simulation data even if we wanted to.",
      },
      {
        heading: "Payments",
        body: "No real payments are processed. The 'card' shown at checkout is a placeholder and is never charged. No payment details are collected or stored.",
      },
      {
        heading: "Your control",
        body: "You can clear all of your data at any time using 'Reset simulation data' in your Profile. This permanently wipes the local storage used by FakeEats on this device.",
      },
      {
        heading: "Contact",
        body: "This is a demo project, so there is no support desk. Treat all data here as disposable and fictional.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "1 July 2026",
    intro:
      "By using FakeEats you agree to these simple terms. FakeEats is a simulation — a toy app — and not a real food-delivery service.",
    sections: [
      {
        heading: "No real orders",
        body: "Placing an 'order' does not order any food. Stores, menus, prices, drivers, delivery times, reviews and promotions are all fictional and for demonstration only.",
      },
      {
        heading: "No real money",
        body: "All prices are imaginary. No charges are ever made and no refunds apply, because no money changes hands.",
      },
      {
        heading: "Points & loyalty",
        body: "Reward points and shop loyalty have no monetary value and cannot be redeemed for anything. They exist purely to demonstrate the feature. Ordering from a different shop may reduce loyalty you had built with a previous shop.",
      },
      {
        heading: "Stores you create",
        body: "FakeEats lets you build your own fictional stores and download them as a file to your device. Keep what you create lawful and respectful — don't include real people's private details or content you don't have the right to use.",
      },
      {
        heading: "Third-party maps & search",
        body: "Address search is powered by OpenStreetMap and map tiles are provided by CARTO. When you use those features your requests are also subject to the OpenStreetMap Foundation's and CARTO's own terms of use.",
      },
      {
        heading: "Brand names",
        body: "Brand and store names are used to make the simulation feel familiar. FakeEats is not affiliated with, endorsed by, or connected to any of the brands shown.",
      },
      {
        heading: "As-is",
        body: "FakeEats is provided 'as is' with no warranties. Use it for fun. Your data lives on your device and may be lost if you clear your browser storage.",
      },
    ],
  },
};

export default function Legal() {
  const { doc = "" } = useParams();
  const content = DOCS[doc];

  if (!content) {
    return (
      <Screen>
        <TopBar title="Legal" />
        <EmptyState emoji="📄" title="Page not found" />
      </Screen>
    );
  }

  return (
    <Screen className="pb-10">
      <TopBar title={content.title} />
      <div className="space-y-5 p-4">
        <p className="text-xs text-neutral-400">
          Last updated {content.updated}
        </p>
        <p className="text-sm text-neutral-600">{content.intro}</p>
        {content.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-1 text-base font-bold text-neutral-900">
              {s.heading}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">{s.body}</p>
          </section>
        ))}
      </div>
    </Screen>
  );
}
