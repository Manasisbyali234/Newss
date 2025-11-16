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
import "./global-icon-color.css";
import "./ux-improvements.css";
import "./remove-button-arrows.css";
import "./hero-location-fix.css";
import "./remove-shadows.css";
import "./header-responsive.css";
import "./home-responsive.css";
import "./mobile-categories-fix.css";

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
