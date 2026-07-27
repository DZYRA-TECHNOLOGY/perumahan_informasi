import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { uploadImage } from "../lib/upload.js";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

// Input upload gambar → menyimpan URL publik ke form[name].
function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadImage(file));
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-medium muted">{label}</span>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={18} className="text-zinc-500" />
          )}
        </div>
        <div className="flex-1">
          <label className="btn-outline cursor-pointer text-sm">
            {busy ? "Mengunggah…" : value ? "Ganti foto" : "Pilih foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pick}
              disabled={busy}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-2 text-xs text-rose-400 hover:underline"
            >
              Hapus
            </button>
          )}
          {err && <p className="mt-1 text-xs text-rose-400">{err}</p>}
        </div>
      </div>
    </div>
  );
}

// CRUD generik untuk satu tabel Supabase.
// props: title, table, fields [{name,label,type,options,fmt}], fallback (array demo)
export default function CrudTable({
  title,
  table,
  fields,
  fallback = [],
  onChanged,
  searchKeys,
  columns,
  pageSize = 25,

  preview = false,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | row object
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [demo, setDemo] = useState(false);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const scrollRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => checkScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [rows, loading]);

  const load = async () => {
    setLoading(true);
    if (preview || !supabase) {
      setRows(fallback);
      setDemo(true);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      setRows(fallback);
      setDemo(true);
    } else {
      setRows(data);
      setDemo(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    if (preview) {
      alert("Mode preview — klik Masuk untuk menambah/mengelola data asli.");
      return;
    }
    setForm({});
    setEditing("new");
  };
  const openEdit = (row) => {
    setForm(row);
    setEditing(row);
  };
  const close = () => {
    setEditing(null);
    setForm({});
    setMsg("");
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    const payload = {};
    fields.forEach((f) => {
      let v = form[f.name];
      if (f.type === "number") v = Number(v || 0);
      payload[f.name] = v ?? "";
    });
    if (!supabase) {
      setMsg("Mode demo: hubungkan Supabase untuk menyimpan.");
      return;
    }
    let error;
    if (editing === "new")
      ({ error } = await supabase.from(table).insert(payload));
    else
      ({ error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", editing.id));
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: error.message,
        confirmButtonColor: "#f97316",
        background: "#17171b",
        color: "#fff",
      });
      return;
    }
    close();
    await load();
    onChanged?.();

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text:
        editing === "new"
          ? "Data berhasil ditambahkan."
          : "Data berhasil diperbarui.",
      timer: 1800,
      showConfirmButton: false,
      background: "#17171b",
      color: "#fff",
    });
  };

  const remove = async (row) => {
    if (preview) {
      Swal.fire({
        icon: "info",
        title: "Mode Preview",
        text: "Klik Masuk untuk mengelola data asli.",
        confirmButtonColor: "#f97316",
        background: "#17171b",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Hapus data?",
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      background: "#17171b",
      color: "#fff",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from(table).delete().eq("id", row.id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: error.message,
        confirmButtonColor: "#f97316",
        background: "#17171b",
        color: "#fff",
      });
      return;
    }

    await load();
    onChanged?.();

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Data berhasil dihapus.",
      timer: 1800,
      showConfirmButton: false,
      background: "#17171b",
      color: "#fff",
    });
  };

  const cell = (row, f) => {
    const v = row[f.name];
    if (f.type === "image")
      return v ? (
        <img
          src={v}
          alt=""
          className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10"
        />
      ) : (
        <span className="muted text-xs">—</span>
      );
    if (f.type === "number")
      return f.money ? rp(v) : Number(v || 0).toLocaleString("id-ID");
    return String(v ?? "");
  };

  // const keys = searchKeys || columns.map((c) => c.key);
  const keys = searchKeys ?? fields.map((f) => f.name);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    if (!s) return rows;

    return rows.filter((r) =>
      keys.some((k) =>
        String(r[k] ?? "")
          .toLowerCase()
          .includes(s),
      ),
    );
  }, [q, rows, keys]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (page > pages) {
      setPage(pages);
    }
  }, [pages]);

  const getPageNumbers = () => {
    const total = pages;
    const current = cur;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages_array = [];
    if (start > 1) {
      pages_array.push(1);
      if (start > 2) pages_array.push("...");
    }
    for (let i = start; i <= end; i++) {
      pages_array.push(i);
    }
    if (end < total) {
      if (end < total - 1) pages_array.push("...");
      pages_array.push(total);
    }
    return pages_array;
  };
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          {demo && (
            <p className="text-xs text-amber-500/90">
              {preview ? (
                "Menampilkan data contoh (mode preview) — klik Masuk untuk mengelola data asli."
              ) : (
                <>
                  Menampilkan data demo — buat tabel <code>{table}</code> di
                  Supabase untuk mengelola data asli.
                </>
              )}
            </p>
          )}
        </div>
        <button onClick={openNew} className="btn-orange text-sm">
          + Tambah
        </button>
      </div>
      <div className="relative card">
        {/* PENTING: overflow-x-auto di wrapper scroll, BUKAN overflow-hidden di card —
            overflow-hidden sebelumnya membuat kolom yang meluber ter-clip, bukan bisa digeser. */}
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden rounded-2xl touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch]"
        >
          <table className="w-full min-w-max text-sm">
            <thead className="bg-white/5 text-left muted">
              <tr>
                {fields.map((f) => (
                  <th
                    key={f.name}
                    className="whitespace-nowrap px-4 py-3 font-medium"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td className="px-4 py-6 muted" colSpan={fields.length + 1}>
                    Memuat…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 muted" colSpan={fields.length + 1}>
                    Belum ada data.
                  </td>
                </tr>
              )}
              {slice.map((row, i) => (
                <tr key={row.id ?? i} className="hover:bg-white/[0.03]">
                  {fields.map((f) => (
                    <td key={f.name} className="whitespace-nowrap px-4 py-3">
                      {cell(row, f)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-orange-400 transition hover:bg-orange-400/10 hover:text-orange-300"
                      >
                        <Pencil size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => remove(row)}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-rose-400 transition hover:bg-rose-400/10 hover:text-rose-300"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indikator halus kalau tabel masih bisa digeser ke kanan (khusus mobile) */}
        {canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-950/70 to-transparent sm:hidden rounded-r-2xl" />
        )}
      </div>
      {canScrollRight && (
        <p className="mt-1.5 text-[11px] muted sm:hidden">
          ← Geser tabel untuk lihat kolom lainnya →
        </p>
      )}
      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#17171b] p-6 shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-bold">
              {editing === "new" ? "Tambah" : "Edit"} {title}
            </h4>
            <form onSubmit={save} className="mt-4 space-y-3">
              {fields.map((f) =>
                f.type === "image" ? (
                  <ImageField
                    key={f.name}
                    label={f.label}
                    value={form[f.name] || ""}
                    onChange={(url) => setForm({ ...form, [f.name]: url })}
                  />
                ) : f.options ? (
                  <label key={f.name} className="block">
                    <span className="mb-1 block text-xs font-medium muted">
                      {f.label}
                    </span>
                    <select
                      className="field"
                      value={form[f.name] || ""}
                      required
                      onChange={(e) =>
                        setForm({ ...form, [f.name]: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Pilih…
                      </option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label key={f.name} className="block">
                    <span className="mb-1 block text-xs font-medium muted">
                      {f.label}
                    </span>
                    <input
                      className="field"
                      type={f.type || "text"}
                      value={form[f.name] ?? ""}
                      required={!f.optional}
                      onChange={(e) =>
                        setForm({ ...form, [f.name]: e.target.value })
                      }
                    />
                  </label>
                ),
              )}
              {msg && <p className="text-sm text-rose-600">{msg}</p>}
              <div className="flex gap-3 pt-2">
                <button className="btn-orange flex-1">Simpan</button>
                <button type="button" onClick={close} className="btn-outline">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{" "}
      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm text-zinc-400 whitespace-nowrap">
          Menampilkan {(cur - 1) * pageSize + 1}–
          {Math.min(cur * pageSize, filtered.length)} dari {filtered.length}{" "}
          data
        </span>

        <div className="flex items-center gap-1">
          <button
            className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={cur === 1}
            onClick={() => setPage(1)}
          >
            «
          </button>
          <button
            className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={cur === 1}
            onClick={() => setPage(cur - 1)}
          >
            ‹
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-zinc-500">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${
                  cur === p
                    ? "bg-orange-500 text-white"
                    : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={cur === pages}
            onClick={() => setPage(cur + 1)}
          >
            ›
          </button>
          <button
            className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={cur === pages}
            onClick={() => setPage(pages)}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
