import { Header } from "@/components/layout/Header";
import { AboutUs } from "@/components/about/AboutUs";
import { AboutHistoryValues } from "@/components/about/AboutHistoryValues";
import { AboutTeam } from "@/components/about/AboutTeam";
import { Footer } from "@/components/layout/Footer";

export default function SobreNosotros() {
  return (
    <main className="min-h-screen bg-brand-white">
      <Header />
      <AboutUs />
      <AboutHistoryValues />
      <AboutTeam />
      <Footer />
    </main>
  );
}
