import { redirect } from "next/navigation";

// Orders live at /orders; this address just leads there.
export default function AccountOrdersPage() {
  redirect("/orders");
}
