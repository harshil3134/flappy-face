import { useEffect } from "react";
import "./App.css";
import Game from "./components/Game.jsx";

function App() {
  useEffect(() => {
    // Custom Vercel Analytics implementation to bypass AdBlock
    window.va = window.va || function () { 
      (window.vaq = window.vaq || []).push(arguments); 
    };

    // Create and inject the analytics script with custom endpoint
    const script = document.createElement('script');
    script.async = true;
    script.src = '/game-stats/script.js';
    script.setAttribute('data-endpoint', '/game-stats');
    
    // Add error handling
    script.onerror = () => {
      console.log('Analytics script blocked - using fallback tracking');
    };
    
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Game/>
    </>
  );
}

export default App;