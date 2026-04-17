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

        {/* PHONE — opens dialer */}
        <a href="tel:+18723545706" className="topItem topItemLink">
          <svg className="topIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>+1 (872) 354-5706</span>
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