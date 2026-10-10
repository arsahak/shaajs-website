import { blogPosts, type BlogPost } from "@/app/data/blog";
import { formatPostDate } from "@/component/blog/BlogCard";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";

interface BlogArticleProps {
  post: BlogPost;
  backLabel: string;
}

export function BlogArticle({ post, backLabel }: BlogArticleProps) {
  const morePosts = blogPosts.filter((other) => other.slug !== post.slug);

  return (
    <section className="py-8 sm:py-10">
      <div className="container grid grid-cols-1 gap-6 lg:grid-cols-[8fr_3fr]">
        <article className="rounded-(--radius-2xl) border border-(--color-border) bg-(--color-surface) p-6 text-start sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-(--color-text-muted)">
            <span className="badge badge-primary">{post.category}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} />
              {formatPostDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} />
              {post.readMinutes} min read
            </span>
          </div>

          <p className="lead mt-4">{post.excerpt}</p>

          {post.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-xl sm:text-2xl">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-(--color-text-muted)">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc text-(--color-text-muted)">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <Link
            href="/blog"
            className="mt-8 inline-flex items-center gap-2 border-t border-(--color-border) pt-6 text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </article>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4 text-start">
            <h2 className="px-1 text-base font-bold">More articles</h2>
            <ul className="mt-3 flex list-none flex-col gap-1 ps-0 [&>li]:m-0">
              {morePosts.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/blog/${other.slug}`}
                    className="flex items-start gap-3 rounded-(--radius-md) p-2.5 transition-colors hover:bg-(--color-bg)"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-primary-faint) text-(--color-primary)">
                      <other.icon size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-(--color-dark)">
                        {other.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-(--color-text-muted)">
                        {formatPostDate(other.date)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default BlogArticle;
