import { useEffect, useRef, useState } from "react";
import "./App.css";
import Game from "./components/Game.jsx";
import { Analytics } from "@vercel/analytics/react";



function App() {
return(
  <>
  <Analytics mode="production"/>
  <Game/>
  </>
)
}

export default App;