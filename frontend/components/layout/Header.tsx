"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";

export default function Header() {
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`siteHeader ${scrolled ? "isScrolled" : ""}`}>
      <TopBar lang={lang} setLang={setLang} scrolled={scrolled} />
      <Navbar lang={lang} setLang={setLang} scrolled={scrolled} />
    </header>
  );
}