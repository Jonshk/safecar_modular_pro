"use client";

import { useLang } from "@/context/LangContext";

const vehiclesText = {
  en: {
    eyebrow: "Vehicles",
    title: "Domestic, Asian & European coverage",
    sub: "We service all major makes and models with certified technicians.",
  },
  es: {
    eyebrow: "Vehículos",
    title: "Cobertura doméstica, asiática y europea",
    sub: "Atendemos todas las marcas con técnicos certificados.",
  },
};

const brands = [
  "Ford", "Chevrolet", "Toyota", "Honda",
  "Nissan", "Hyundai", "BMW", "Mercedes-Benz",
  "Audi", "Volkswagen",
];

export default function VehiclesSection() {
  const { lang } = useLang();
  const t = vehiclesText[lang];

  return (
    <section className="vehiclesSection" id="vehicles">
      <img
        src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2400&q=80"
        alt="Multiple car brands"
        className="vehiclesBg"
      />
      <div className="vehiclesOverlay" />

      <div className="container vehiclesContent">
        <div className="vehiclesCopy">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2>{t.title}</h2>
          <p>{t.sub}</p>
        </div>
      </div>
    </section>
  );
}