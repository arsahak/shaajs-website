import type { Dictionary } from "@/app/dictionaries";
import { Section } from "@/component/content/Section";
import { StepList, type Step } from "@/component/content/StepList";
import { SupportCta } from "@/component/content/SupportCta";
import { TrackOrder } from "@/component/orders/TrackOrder";

interface TrackOrderContentProps {
  dict: Dictionary;
  isSignedIn: boolean;
  initialOrderNumber?: string;
}

export function TrackOrderContent({
  dict,
  isSignedIn,
  initialOrderNumber,
}: TrackOrderContentProps) {
  const statuses: Step[] = [
    {
      title: dict.orders.status_pending,
      description:
        "We have received your order and are confirming the details with you.",
    },
    {
      title: dict.orders.status_processing,
      description:
        "Your order is confirmed and is being packed and prepared for dispatch.",
    },
    {
      title: dict.orders.status_shipped,
      description:
        "Your parcel has left the hub and is on its way to your address.",
    },
    {
      title: dict.orders.status_delivered,
      description:
        "The parcel has been handed over. Enjoy — and tell us if anything is not right.",
    },
  ];

  return (
    <>
      <Section>
        <TrackOrder
          dict={dict}
          isSignedIn={isSignedIn}
          initialOrderNumber={initialOrderNumber}
        />
      </Section>

      <Section
        title="What each status means"
        subtitle="The four stages every order moves through."
      >
        <StepList steps={statuses} />
      </Section>

      <SupportCta
        title="Something not adding up?"
        description="If your order has not moved for a while or the status looks wrong, our support team can check it for you."
        primary={{
          label: "Contact support",
          href: "/contact?topic=order",
        }}
        secondary={{ label: "Shipping info", href: "/shipping" }}
      />
    </>
  );
}

export default TrackOrderContent;
