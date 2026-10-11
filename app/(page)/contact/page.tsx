import { isContactTopic } from "@/app/data/contact";
import { getDictionary } from "@/app/dictionaries";
import { auth } from "@/auth";
import { PageHero } from "@/component/common/PageHero";
import { ContactContent } from "@/component/contact/ContactContent";
import { Mail } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ topic?: string }>;
};

const DESCRIPTION =
  "Get in touch with Shaajs support or our seller team — we are here 24/7.";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.footer.contact,
    description: DESCRIPTION,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage({ searchParams }: Props) {
  const dict = await getDictionary();
  const { topic } = await searchParams;
  const session = await auth();

  return (
    <>
      <PageHero
        title={dict.footer.contact}
        homeLabel={dict.nav.home}
        icon={Mail}
        subtitle={DESCRIPTION}
      />
      <ContactContent
        initialTopic={isContactTopic(topic) ? topic : undefined}
        defaultName={session?.user?.name ?? undefined}
        defaultEmail={session?.user?.email ?? undefined}
      />
    </>
  );
}
