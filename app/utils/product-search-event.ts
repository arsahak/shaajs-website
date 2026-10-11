/**
 * Fired on `window` by the navbar search just before it opens /product?q=…,
 * with the search text as `detail`. A product grid that is already on screen
 * listens for it, because repeating the search that is already in the URL
 * doesn't change the URL — so nothing else would tell the grid to run it again.
 */
export const PRODUCT_SEARCH_EVENT = "Shaajs:product-search";
