"use client";

import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { CTASection } from "@/components/sections/CTASection";
import { AboutReach } from "@/components/about/AboutReach";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowWeWorkSection } from "@/components/sections/HowWeWorkSection";
// import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";
// import B2BLogin from "@/components/auth/B2BLogin";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/productos');
  };

  return (
    <main className="min-h-screen bg-brand-white">
      <Header />
      <Hero />
      <FeaturesSection />
      <HowWeWorkSection />
      <AboutReach />
      {/* <TestimonialsSection /> */}
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
