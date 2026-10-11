import { navCategories } from "@/app/data/categories";
import { BD_DIVISIONS } from "@/app/data/checkout";
import { FeatureGrid, type Feature } from "@/component/content/FeatureGrid";
import { Section } from "@/component/content/Section";
import { StepList, type Step } from "@/component/content/StepList";
import { SupportCta } from "@/component/content/SupportCta";
import { FadeIn } from "@/component/motion/FadeIn";
import { BadgeCheck, Banknote, Headset, Truck } from "lucide-react";

const stats = [
  { value: String(BD_DIVISIONS.length), label: "Divisions we deliver to" },
  { value: String(navCategories.length), label: "Product categories" },
  { value: "30", label: "Day return window" },
  { value: "24/7", label: "Customer support" },
];

const values: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Trusted sellers",
    description:
      "Every seller is reviewed before their store goes live, so what you see is what arrives.",
  },
  {
    icon: Banknote,
    title: "Pay on delivery",
    description:
      "No advance payment needed — check your parcel and pay in cash when it reaches your door.",
  },
  {
    icon: Truck,
    title: "Delivery nationwide",
    description:
      "From Dhaka to every district, with a flat delivery fee you see before you confirm.",
  },
  {
    icon: Headset,
    title: "Real support",
    description:
      "Questions about an order, a return or a product? Our team is here around the clock.",
  },
];

const steps: Step[] = [
  {
    title: "Discover",
    description:
      "Browse thousands of products across electronics, fashion, home, beauty and more.",
  },
  {
    title: "Order",
    description:
      "Add to cart, enter your delivery details and confirm — the fee is shown up front.",
  },
  {
    title: "We deliver",
    description:
      "We confirm your order by phone, pack it and hand it to our delivery partner.",
  },
  {
    title: "Pay at your door",
    description:
      "The rider brings it to your address. Check the parcel and pay in cash.",
  },
];

export function AboutContent() {
  return (
    <>
      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <FadeIn className="text-start">
            <span className="badge badge-outline">Our story</span>
            <h2 className="section-title mt-3">
              A World of Products, All in One Place.
            </h2>
            <p className="mt-4 text-(--color-text-muted)">
              Shaajs is an online marketplace made for Bangladesh. We started
              with a simple idea: ordering online should feel as easy and as
              safe as buying from the shop next door — wherever in the country
              you live.
            </p>
            <p className="mt-3 text-(--color-text-muted)">
              So we bring trusted sellers, honest prices in Taka, cash on
              delivery and nationwide shipping together in one place — delivered
              to your address in any of the eight divisions.
            </p>
          </FadeIn>

          <FadeIn delay={0.05} className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-6 text-center"
              >
                <p className="font-(family-name:--font-heading) text-3xl font-extrabold text-(--color-primary) sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-(--color-text-muted)">
                  {stat.label}
                </p>
              </div>
            ))}
          </FadeIn>
        </div>
      </Section>

      <Section
        tone="surface"
        title="What we stand for"
        subtitle="Four promises behind every order placed on Shaajs."
      >
        <FeatureGrid items={values} columns={4} muted />
      </Section>

      <Section
        title="How Shaajs works"
        subtitle="From the first search to the knock on your door."
      >
        <StepList steps={steps} />
      </Section>

      <SupportCta
        title="Ready to explore?"
        description="Discover products from trusted sellers, or open your own store and reach shoppers all over Bangladesh."
        primary={{ label: "Shop all products", href: "/product" }}
        secondary={{ label: "Sell on Shaajs", href: "/sell" }}
      />
    </>
  );
}

export default AboutContent;
