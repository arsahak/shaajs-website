import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/app/data/blog";
import { getDictionary } from "@/app/dictionaries";
import { SITE_NAME, absoluteUrl, pageMetadata } from "@/app/utils/seo";
import { BlogArticle } from "@/component/blog/BlogArticle";
import { PageHero } from "@/component/common/PageHero";
import { JsonLd } from "@/component/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const dict = await getDictionary();

  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      {/* The post as an article, for search results. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          articleSection: post.category,
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      <PageHero
        title={post.title}
        homeLabel={dict.nav.home}
        icon={post.icon}
        parents={[{ label: dict.footer.blog, href: "/blog" }]}
      />
      <BlogArticle
        post={post}
        backLabel={`${dict.common.back} — ${dict.footer.blog}`}
      />
    </>
  );
}
