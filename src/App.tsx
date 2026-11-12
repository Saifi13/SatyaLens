import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import HowItWorks from "./pages/HowItWorks";
import Methodology from "./pages/Methodology";
import About from "./pages/About";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import { ToastProvider } from "./components/Toasts";

function ScrollReset() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ScrollReset />
      <div className="flex min-h-dvh flex-col">
        <SiteNav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </ToastProvider>
  );
}
