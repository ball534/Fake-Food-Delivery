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
      "FakeEats is a food-delivery simulation built for fun and learning — no real food, no real money, no accounts. This policy explains, in plain language, exactly what happens with your information. The short version: almost everything stays on your own device, and the only time anything leaves it is when you use the optional address-search, current-location, or live-map features.",
    sections: [
      {
        heading: "In one sentence",
        body: "FakeEats keeps your simulation data in your browser on this device, runs no servers and no accounts, uses no analytics or advertising, and never sells or shares anything — a few optional map and address features are the only things that ever contact the internet.",
      },
      {
        heading: "What's stored on your device",
        body: "As you play, FakeEats saves your progress in your browser's local storage so it's still there when you return. That includes your display name and chosen avatar; your reward points and per-shop loyalty; your saved delivery addresses (including their map coordinates when available); your current cart; your order history (items, prices, the randomly assigned driver's name, delivery and store map coordinates, and timestamps); your chat threads with drivers; your recent searches; and small display preferences such as which greeting to show. This data lives only in this browser on this device. It is not uploaded anywhere, and using FakeEats on another device or browser starts fresh.",
      },
      {
        heading: "When FakeEats contacts the internet",
        body: "Three optional features make outside requests. (1) Address search: when you type a delivery address, the text is sent to OpenStreetMap's Nominatim service to suggest matches and find coordinates. (2) Use my current location: if you tap it and grant permission, your browser shares your device location, which is sent to Nominatim to turn into a street address. (3) Live order map: when you track an order, map tiles are loaded from CARTO's basemap service. In each case the provider receives the request and your IP address and handles it under its own privacy policy. If you never search an address, never share your location, and never open a live map, nothing leaves your device.",
      },
      {
        heading: "Your location",
        body: "FakeEats only accesses your device's precise location if you tap 'Use my current location' and allow the browser prompt. The coordinates are used once to fill in an address and are then stored with that saved address on your device. You can decline the prompt or revoke the permission in your browser at any time — the rest of the app works without it.",
      },
      {
        heading: "Messaging your driver",
        body: "The in-app chat with your 'driver' is an automated script, not a real person. Your messages and its canned replies are stored only on your device as part of that order. Because it's just a simulation, please don't type anything private or sensitive into it.",
      },
      {
        heading: "What we don't do",
        body: "No accounts, no servers holding your data, no analytics, no trackers, no advertising cookies, and no selling or sharing of information. There is no real payment processing — the checkout 'card' is a placeholder that is never charged, and no payment details are collected. We could not see your simulation data even if we wanted to.",
      },
      {
        heading: "Your controls",
        body: "You're in full control. 'Reset simulation data' in your Profile permanently wipes everything FakeEats has stored in this browser. Clearing your browser's site data does the same. Any location permission you granted can be turned off in your browser settings.",
      },
      {
        heading: "Changes & contact",
        body: "This is a demo project with no support desk, so treat all data here as disposable and fictional. If the app gains features that change what's stored or sent, this page will be updated along with the date above.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "1 July 2026",
    intro:
      "By using FakeEats you agree to these terms. FakeEats is a simulation — a toy app for fun and learning — and not a real food-delivery service. Nothing you do here orders real food, moves real money, or creates any real obligation.",
    sections: [
      {
        heading: "In one sentence",
        body: "Everything in FakeEats is fictional and for demonstration only — the stores, menus, prices, drivers, deliveries, reviews, chats, points and promotions are all pretend, and the app is provided free, as-is, for you to explore.",
      },
      {
        heading: "Not a real service",
        body: "Placing an 'order' does not order any food and no one is dispatched to you. Stores, menus, prices, drivers, delivery times, order tracking, reviews and promotions are all made up. Any resemblance to a real restaurant's offerings, hours or prices is coincidental and not to be relied on.",
      },
      {
        heading: "No real money",
        body: "All prices are imaginary. No payment is ever taken, no card is charged, and no refunds apply because no money changes hands. Never enter real payment details anywhere in FakeEats.",
      },
      {
        heading: "Points, loyalty & promo codes",
        body: "Reward points, shop loyalty tiers and promo codes exist purely to demonstrate the features. They have no monetary value, are not redeemable for real goods, services or cash, and can be changed or reset at any time. Note that loyalty is per-shop — ordering from a different shop can lower loyalty you had built with a previous one.",
      },
      {
        heading: "Chatting with your driver",
        body: "The driver messaging feature is an automated script that guesses at your message and replies with pre-written lines. It is not a real person, gives no real information or commitments, and its replies (including any estimated times) are fictional. Don't rely on it, and don't send it anything private.",
      },
      {
        heading: "Stores you create",
        body: "FakeEats lets you build your own fictional store and export it as a ZIP file, which is generated in your browser and saved to your device — nothing is uploaded to us. You are responsible for what you create. Keep it lawful and respectful: don't include real people's private details, and don't use names, logos, images or other content you don't have the right to use.",
      },
      {
        heading: "Maps, search & location",
        body: "Address search and reverse-geocoding are powered by OpenStreetMap's Nominatim service, and live map tiles are provided by CARTO. When you use those features your requests are also subject to the OpenStreetMap Foundation's and CARTO's own terms of use and usage limits. Please use them reasonably and don't automate or hammer them through the app.",
      },
      {
        heading: "Brand names & trademarks",
        body: "Real brand and store names may be used to make the simulation feel familiar. FakeEats is not affiliated with, endorsed by, sponsored by, or connected to any of the brands shown, and all trademarks remain the property of their respective owners.",
      },
      {
        heading: "Acceptable use",
        body: "Use FakeEats for personal, non-commercial fun and learning. Don't present it as a genuine ordering service, don't use it to mislead others, and don't try to break, abuse or misuse the app or the third-party services it relies on.",
      },
      {
        heading: "As-is, no warranty",
        body: "FakeEats is provided 'as is' and 'as available', with no warranties of any kind and no guarantee that it will be accurate, uninterrupted or error-free. Your data lives on your device and may be lost if you reset the app or clear your browser storage. To the fullest extent permitted by law, the makers of FakeEats are not liable for any loss arising from its use — it's a toy, so enjoy it as one.",
      },
      {
        heading: "Changes to these terms",
        body: "As FakeEats evolves, these terms may change. Updates will appear on this page with a new date above, and continuing to use the app means you accept the current version.",
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
