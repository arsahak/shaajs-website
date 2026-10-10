import { blogPosts } from "@/app/data/blog";
import { BlogCard } from "@/component/blog/BlogCard";
import { Section } from "@/component/content/Section";
import { SupportCta } from "@/component/content/SupportCta";
import { FadeIn } from "@/component/motion/FadeIn";

export function BlogList() {
  return (
    <>
      <Section
        title="Latest articles"
        subtitle="Shopping guides, shipping explainers and tips for sellers."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((post, i) => (
            <FadeIn key={post.slug} delay={Math.min(i, 4) * 0.05}>
              <BlogCard post={post} />
            </FadeIn>
          ))}
        </div>
      </Section>

      <SupportCta
        title="Looking for a quick answer?"
        description="Our Help Center covers orders, delivery, returns and your account in one place."
        primary={{ label: "Visit the Help Center", href: "/help" }}
        secondary={{ label: "Read the FAQ", href: "/faq" }}
      />
    </>
  );
}

export default BlogList;
