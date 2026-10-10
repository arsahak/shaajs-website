import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/app/data/blog";
import { getDictionary } from "@/app/dictionaries";
import { BlogArticle } from "@/component/blog/BlogArticle";
import { PageHero } from "@/component/common/PageHero";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const dict = await getDictionary();

  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
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
