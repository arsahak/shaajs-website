import { company } from "@/app/data/company";
import { FeatureGrid, type Feature } from "@/component/content/FeatureGrid";
import { Section } from "@/component/content/Section";
import { StepList, type Step } from "@/component/content/StepList";
import { SupportCta } from "@/component/content/SupportCta";
import {
  Code,
  Headset,
  MapPin,
  Megaphone,
  Palette,
  Rocket,
  Store,
  Truck,
  Users,
} from "lucide-react";

const values: Feature[] = [
  {
    icon: Users,
    title: "Customers first",
    description:
      "We judge our work by one thing: whether shopping and selling got easier for the people who rely on us.",
  },
  {
    icon: Rocket,
    title: "Own it, ship it",
    description:
      "Small teams, clear goals and the freedom to take an idea from a sketch all the way to launch.",
  },
  {
    icon: MapPin,
    title: "Built for Bangladesh",
    description:
      "From Dhaka to the smallest upazila, we design for how people here really shop, pay and receive parcels.",
  },
];

const teams: Feature[] = [
  {
    icon: Code,
    title: "Engineering",
    description:
      "Build the storefront, the seller tools and the systems that move orders across the country.",
  },
  {
    icon: Palette,
    title: "Product & Design",
    description:
      "Shape experiences that feel simple for first-time online shoppers, on every screen size.",
  },
  {
    icon: Store,
    title: "Seller Success",
    description:
      "Onboard new sellers and help them grow with better listings and reliable fulfilment.",
  },
  {
    icon: Headset,
    title: "Customer Support",
    description:
      "Be the friendly voice that solves order, delivery and return questions.",
  },
  {
    icon: Truck,
    title: "Logistics & Operations",
    description:
      "Keep parcels moving from hub to doorstep, on time and in one piece.",
  },
  {
    icon: Megaphone,
    title: "Marketing",
    description:
      "Tell the BongoOcean story and bring new shoppers and sellers to the marketplace.",
  },
];

const hiringSteps: Step[] = [
  {
    title: "Apply",
    description:
      "Email us your CV and a few lines about the kind of work you want to do.",
  },
  {
    title: "Intro call",
    description:
      "A short conversation about your background and what you are looking for.",
  },
  {
    title: "Skills conversation",
    description:
      "Meet the team and walk through a practical problem close to the real job.",
  },
  {
    title: "Offer",
    description:
      "If it is a match on both sides, we make an offer and plan your first weeks.",
  },
];

export function CareersContent() {
  return (
    <>
      <Section
        title="Build the marketplace Bangladesh shops on"
        subtitle="We are a team that cares about craft, moves quickly and treats every order as someone's trust."
      >
        <FeatureGrid items={values} />
      </Section>

      <Section
        tone="surface"
        title="Teams"
        subtitle="The groups behind BongoOcean — and where you might fit in."
      >
        <FeatureGrid items={teams} muted />
      </Section>

      <Section
        title="How hiring works"
        subtitle="A straightforward process, with a real person at every step."
      >
        <StepList steps={hiringSteps} />
      </Section>

      <SupportCta
        title="Want to work with us?"
        description={`We are always glad to hear from talented people. Send your CV to ${company.careersEmail} and tell us which team interests you.`}
        primary={{
          label: "Email your CV",
          href: `mailto:${company.careersEmail}?subject=${encodeURIComponent("Career enquiry")}`,
        }}
      />
    </>
  );
}

export default CareersContent;
