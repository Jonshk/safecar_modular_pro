"use client";

import { useLang } from "@/context/LangContext";

export default function TopBar() {
  const { lang, setLang } = useLang();

  const content = {
    en: {
      phone: "872-354-5706",
      address: "1052 W 51st St, Chicago, IL 60609",
      hours: "Mon - Fri: 7:30 AM - 5:30 PM",
    },
    es: {
      phone: "872-354-5706",
      address: "1052 W 51st St, Chicago, IL 60609",
      hours: "Lun - Vie: 7:30 AM - 5:30 PM",
    },
  };
  const t = content[lang];

  return (
    <div className="topBar">
      <div className="container topBarInner">

        {/* TELÉFONO */}
        <div className="topItem">
          <svg className="topIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t.phone}</span>
        </div>

        {/* DIRECCIÓN */}
        <div className="topItem">
          <svg className="topIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="1.6"/>
          </svg>
          <span>{t.address}</span>
        </div>

        {/* HORARIO + EN/ES */}
        <div className="topItem noBorder">
          <svg className="topIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t.hours}</span>

          <div className="topLang" role="group" aria-label="Language selector">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{opacity: 0.75, flexShrink: 0}}>
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
              <ellipse cx="7" cy="7" rx="2.6" ry="6" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1.5 5h11M1.5 9h11" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            <button type="button" className={`topLangOption ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
            <span className="topLangDivider">/</span>
            <button type="button" className={`topLangOption ${lang === "es" ? "active" : ""}`} onClick={() => setLang("es")} aria-pressed={lang === "es"}>ES</button>
          </div>
        </div>

      </div>
    </div>
  );
}