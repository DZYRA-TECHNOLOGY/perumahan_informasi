import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Iuran from "./pages/Iuran.jsx";
import Kas from "./pages/Kas.jsx";
import Keuangan from "./pages/Keuangan.jsx";
import IuranAir from "./pages/IuranAir.jsx";
import Banjir from "./pages/Banjir.jsx";
import DataWarga from "./pages/DataWarga.jsx";
import Struktur from "./pages/Struktur.jsx";
import Siteplan from "./pages/Siteplan.jsx";
import Usaha from "./pages/Usaha.jsx";
import UsahaDetail from "./pages/UsahaDetail.jsx";
import Hunian from "./pages/Hunian.jsx";
import Warga from "./pages/Warga.jsx";
import Galeri from "./pages/Galeri.jsx";
import Masukan from "./pages/Masukan.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="iuran" element={<Iuran />} />
          <Route path="kas" element={<Kas />} />
          <Route path="keuangan" element={<Keuangan />} />
          {/* <Route path="iuran-air" element={<IuranAir />} /> */}
          <Route path="banjir" element={<Banjir />} />
          <Route path="data-warga" element={<DataWarga />} />
          <Route path="struktur" element={<Struktur />} />
          <Route path="siteplan" element={<Siteplan />} />
          <Route path="usaha" element={<Usaha />} />
          <Route path="usaha/:id" element={<UsahaDetail />} />
          <Route path="hunian" element={<Hunian />} />
          <Route path="warga" element={<Warga />} />
          <Route path="galeri" element={<Galeri />} />
          <Route path="masukan" element={<Masukan />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
