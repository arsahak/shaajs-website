interface JsonLdProps {
  /** A schema.org description of the page, as a plain object. */
  data: Record<string, unknown>;
}

/**
 * Structured data for search engines: what the page is about, in the
 * schema.org vocabulary, as a JSON-LD script. It is what lets a search
 * result show a product's price, rating and stock, or a page's breadcrumb.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // "<" is written as its escape so nothing in the data — a product
      // title, a description — can close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default JsonLd;
