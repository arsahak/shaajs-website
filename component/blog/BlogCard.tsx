import type { BlogPost } from "@/app/data/blog";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) transition-shadow hover:shadow-(--shadow-md)"
    >
      <div className="relative flex h-40 items-center justify-center bg-linear-to-br from-(--color-primary) to-(--color-secondary-dark)">
        <post.icon
          aria-hidden="true"
          strokeWidth={1.25}
          size={64}
          className="text-white/90 transition-transform duration-300 group-hover:scale-110"
        />
        <span className="badge absolute start-4 top-4 bg-white/15 text-white backdrop-blur-sm">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 text-start">
        <h3 className="text-lg transition-colors group-hover:text-(--color-primary)">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-(--color-text-muted)">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-(--color-border) pt-4 text-xs text-(--color-text-muted)">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} />
              {formatPostDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} />
              {post.readMinutes} min read
            </span>
          </span>
          <ArrowRight
            aria-hidden="true"
            size={16}
            className="shrink-0 text-(--color-primary) transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}

export default BlogCard;
