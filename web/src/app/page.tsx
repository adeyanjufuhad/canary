import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Noise from "@/components/reactbits/Noise";
import Faq from "@/components/sections/Faq";
import Gap from "@/components/sections/Gap";
import GetStarted from "@/components/sections/GetStarted";
import HowItWorks from "@/components/sections/HowItWorks";
import Quickstart from "@/components/sections/Quickstart";
import Room from "@/components/sections/Room";
import Rules from "@/components/sections/Rules";
import Versus from "@/components/sections/Versus";
import { en } from "@/content/en";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="label sr-only z-50 bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {en.skipLink}
      </a>
      {/* Reveal hides content only after hydration; this keeps everything visible without scripts */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      <Noise fixed fps={0} opacity={0.045} blendMode="multiply" contrast={0.35} zIndex={50} />
      <Nav />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Hero />
        <Gap />
        <HowItWorks />
        <Room />
        <Rules />
        <Versus />
        <Quickstart />
        <Faq />
        <GetStarted />
      </main>
      <Footer />
    </>
  );
}
