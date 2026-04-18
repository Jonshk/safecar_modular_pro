import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Safe Car Admin",
  description: "Safe Car Admin Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}