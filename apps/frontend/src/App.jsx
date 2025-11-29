import { BrowserRouter, Routes, Route } from "react-router-dom";
import Wallet from "./pages/Wallet";
import Risk from "./pages/Risk";
import Proof from "./pages/Proof";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wallet />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/proof" element={<Proof />} />
      </Routes>
    </BrowserRouter>
  );
}
