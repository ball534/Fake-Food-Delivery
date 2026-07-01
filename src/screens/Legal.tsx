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
    updated: "29 June 2026",
    intro:
      "FakeEats is a food-delivery simulation built for fun and learning. This policy explains, in plain language, what happens with your information.",
    sections: [
      {
        heading: "What we store",
        body: "Everything you do in FakeEats — your name, chosen avatar, saved addresses, orders, reward points and loyalty — is stored only on this device, in your browser's local storage. It never leaves your device and is not sent to any server.",
      },
      {
        heading: "What we collect",
        body: "Nothing. There are no analytics, no trackers, no cookies for advertising, and no third-party data sharing. We could not see your data even if we wanted to.",
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
    updated: "29 June 2026",
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
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {content.intro}
        </p>
        {content.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-1 text-base font-bold text-neutral-900 dark:text-white">
              {s.heading}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </Screen>
  );
}
