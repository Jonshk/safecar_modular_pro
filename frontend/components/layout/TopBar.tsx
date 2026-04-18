"use client";

type TopBarProps = {
  lang: "en" | "es";
  setLang: (l: "en" | "es") => void;
  scrolled: boolean;
};

export default function TopBar({ lang, setLang, scrolled }: TopBarProps) {
  return (
    <div className={`topBar ${scrolled ? "topHidden" : ""}`}>
      <div className="container topBarInner">

        {/* MAIN PHONE */}
        <a href="tel:+18723611607" className="topItem topItemLink">
          <svg className="topIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>+1 (872) 361-1607</span>
        </a>

        {/* ADDRESS — opens Google Maps */}
        <a
          href="https://maps.google.com/?q=1052+W+51st+St,+Chicago,+IL+60609"
          target="_blank"
          rel="noopener noreferrer"
          className="topItem topItemLink"
        >
          <svg className="topIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>1052 W 51st St, Chicago, IL 60609</span>
        </a>

        {/* WHATSAPP */}
        <a
          href="https://wa.me/18723545706"
          target="_blank"
          rel="noopener noreferrer"
          className="topItem topItemLink"
        >
          <svg className="topIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>WhatsApp · +1 (872) 354-5706</span>
        </a>

        {/* HOURS + LANG */}
        <div className="topItem noBorder topItemRight">
          <svg className="topIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Mon - Fri: 7:30 AM - 5:30 PM</span>

          <div className="topLang">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" opacity=".75"/>
              <ellipse cx="7" cy="7" rx="2.6" ry="6" stroke="currentColor" strokeWidth="1.2" opacity=".75"/>
              <path d="M1.5 5h11M1.5 9h11" stroke="currentColor" strokeWidth="1.2" opacity=".75"/>
            </svg>
            <button className={`topLangOption ${lang==="en"?"active":""}`} onClick={() => setLang("en")}>EN</button>
            <span className="topLangDivider">/</span>
            <button className={`topLangOption ${lang==="es"?"active":""}`} onClick={() => setLang("es")}>ES</button>
          </div>
        </div>

      </div>
    </div>
  );
}