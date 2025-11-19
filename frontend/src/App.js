import RootLayout from "./layouts/root-layout";
import Loader from "./app/common/loader";
import ScrollToTop from "./globals/scroll-to-top";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import forceLightMode from "./utils/forceLightMode";
// CONSOLIDATED MASTER STYLES - All CSS in one file to eliminate cascade conflicts
import "./consolidated-master-styles.css";
import "./home-job-cards.css";
// CARD STYLES PRESERVATION - Ensures card styles remain intact after hosting
import "./card-styles-preserve.css";
// REMOVE BUTTON HOVER EFFECTS - No color changes on hover
import "./remove-button-hover-effects.css";
// REMOVE RESUME CARD HOVER EFFECTS - No hover effects on resume page cards
import "./remove-resume-card-hover.css";
// TAB ICON FIX - Remove orange color from tab icons
import "./tab-icon-fix.css";

function App() {

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Force light mode immediately
    const cleanup = forceLightMode();
    
    AOS.init({
      duration: 300,
      once: true,
      offset: 50,
    });
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50);
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, []);

  return (
    <AuthProvider>
      <WebSocketProvider>
        {isLoading && <Loader />}
        <ScrollToTop />
        <RootLayout />
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App;
