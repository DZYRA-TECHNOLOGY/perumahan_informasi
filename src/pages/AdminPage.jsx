import { Link, useOutletContext } from "react-router-dom";
import { ContainerAdmin } from "../components/ui.jsx";
import Admin from "../components/Admin.jsx";

export default function AdminPage() {
  const { reload } = useOutletContext();
  return (
    <ContainerAdmin>
      {/* <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Panel Pengurus</h1>
        <Link to="/" className="text-sm font-semibold text-orange-400">← Beranda</Link>
      </div> */}
      <Admin onChanged={reload} />
    </ContainerAdmin>
  );
}
