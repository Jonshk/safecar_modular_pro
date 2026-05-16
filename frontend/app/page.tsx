import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import ServicesGrid from "@/components/home/ServicesGrid";
import WhySafeCar from "@/components/home/WhySafeCar";
import VehiclesSection from "@/components/home/VehiclesSection";
import TrainingSection from "@/components/home/TrainingSection";
import GallerySection from "@/components/home/GallerySection";
import ReviewsSection from "@/components/home/ReviewsSection";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <WhySafeCar />
      <VehiclesSection />
      <TrainingSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection />
    </main>
  );
}