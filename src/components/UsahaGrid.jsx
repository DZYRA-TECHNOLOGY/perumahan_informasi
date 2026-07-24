import { Link } from "react-router-dom";
import { rp, Cover, coverProps } from "./ui.jsx";

export default function UsahaGrid({ usaha = [] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {usaha.map((u) => (
        <Link
          key={u.id}
          to={`/usaha/${u.id}`}
          className="card-white card-hover overflow-hidden"
        >
          <div className="relative aspect-[4/3]">
            <Cover {...coverProps(u)} className="h-full w-full" />
            <span className="absolute left-3 top-3 chip bg-white/90 text-zinc-900">
              {u.kategori}
            </span>
            {u.rating != null && (
              <span className="absolute right-3 top-3 chip bg-white/90 text-zinc-900">
                ★ {u.rating}
              </span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold leading-tight text-zinc-900">
                {u.nama}
              </h3>
              {u.blok && (
                <span className="text-xs text-zinc-500">Blok {u.blok}</span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{u.desc}</p>
            <p className="mt-3 text-sm">
              {u.harga ? (
                <>
                  <span className="font-extrabold text-orange-600">
                    {rp(u.harga)}
                  </span>
                  <span className="text-zinc-500">{u.satuan}</span>
                </>
              ) : (
                <span className="text-zinc-500">Hubungi</span>
              )}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
