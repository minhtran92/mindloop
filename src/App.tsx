import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { SearchChanged } from "@/components/sections/SearchChanged";
import { Mission } from "@/components/sections/Mission";
import { Solution } from "@/components/sections/Solution";
import { Climax } from "@/components/sections/Climax";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

export default function App() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Hero />
          <SearchChanged />
          <Mission />
          <Solution />
          <Climax />
          <CTA />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
