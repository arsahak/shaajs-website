// BD-ONLY: the Bangladesh launch delivers within Bangladesh, so this strip no
// longer talks about worldwide shipping from the China hub. The original
// version is kept below, commented out, for when international shipping opens.
// import {
//   defaultShippingDestination,
//   shippingDestinationByCountry,
//   shippingHub,
// } from "@/app/data/shipping";
import { formatTaka, insideDhaka } from "@/app/data/delivery";
import { FadeIn } from "@/component/motion/FadeIn";
import {
  Banknote,
  Headset,
  RotateCcw,
  Truck,
  type LucideIcon,
} from "lucide-react";

interface TrustCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

function getCards(): TrustCard[] {
  const lowestFee = formatTaka(insideDhaka.fee);

  return [
    {
      icon: Truck,
      title: "Nationwide Delivery",
      description: `To every district in Bangladesh, from ${lowestFee}`,
    },
    {
      icon: Banknote,
      title: "Cash on Delivery",
      description: "Pay when your parcel arrives",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day hassle-free returns",
    },
    {
      icon: Headset,
      title: "24/7 Support",
      description: "Real help, round the clock",
    },
  ];
}

export function SecureShipping() {
  const cards = getCards();

  // BD-ONLY: the worldwide version of the cards.
  // const destination =
  //   shippingDestinationByCountry[countryCode] ?? defaultShippingDestination;
  // const isDomestic = destination.name === shippingHub.name;
  //
  // const cards = [
  //   {
  //     icon: Truck,
  //     title: "Worldwide Shipping",
  //     description: isDomestic
  //       ? `Fast delivery within ${shippingHub.name}`
  //       : `From ${shippingHub.name} to ${destination.name}`,
  //   },
  //   {
  //     icon: ShieldCheck,
  //     title: "Secure Payment",
  //     description: "128-bit SSL encrypted checkout",
  //   },
  //   {
  //     icon: RotateCcw,
  //     title: "Easy Returns",
  //     description: "30-day hassle-free returns",
  //   },
  //   {
  //     icon: Headset,
  //     title: "24/7 Support",
  //     description: "Real help, round the clock",
  //   },
  // ];

  return (
    <section className="bg-black py-8 sm:py-10">
      <div className="container">
        <FadeIn
          delay={0.05}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-(--radius-2xl) bg-white/15 sm:grid-cols-2 lg:grid-cols-4"
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center gap-3 bg-black px-6 py-8 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
                <card.icon size={26} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">{card.title}</h3>
                <p className="mt-1 text-xs text-white/75">{card.description}</p>
              </div>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}

export default SecureShipping;
