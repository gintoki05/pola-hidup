"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Batas harian Kemenkes — Permenkes No. 30 Tahun 2013
const DAILY_LIMIT = {
  gula: 50,      // gram
  natrium: 2000, // mg
  lemak: 67,     // gram
};

interface FoodEntry {
  id: string;
  nama: string;
  gula: number;
  natrium: number;
  lemak: number;
  sajian: number;
}

function getStatusColor(persen: number): string {
  if (persen >= 100) return "text-red-400";
  if (persen >= 70) return "text-amber-400";
  return "text-emerald-400";
}

function getProgressColor(persen: number): string {
  if (persen >= 100) return "bg-red-500";
  if (persen >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getStatusLabel(persen: number): { text: string; variant: "destructive" | "secondary" | "outline" } {
  if (persen >= 100) return { text: "Terlampaui", variant: "destructive" };
  if (persen >= 70) return { text: "Mendekati batas", variant: "secondary" };
  return { text: "Aman", variant: "outline" };
}

function NutrisiBar({
  label,
  satuan,
  nilai,
  batas,
  icon,
}: {
  label: string;
  satuan: string;
  nilai: number;
  batas: number;
  icon: string;
}) {
  const persen = Math.min((nilai / batas) * 100, 100);
  const persenRaw = (nilai / batas) * 100;
  const status = getStatusLabel(persenRaw);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-sm text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-xs font-normal">
            {status.text}
          </Badge>
          <span className={`text-sm font-semibold tabular-nums ${getStatusColor(persenRaw)}`}>
            {persenRaw.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(persenRaw)}`}
          style={{ width: `${persen}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {nilai % 1 === 0 ? nilai : nilai.toFixed(1)} {satuan} dikonsumsi
        </span>
        <span>
          Batas: {batas} {satuan}/hari
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [form, setForm] = useState({
    nama: "",
    gula: "",
    natrium: "",
    lemak: "",
    sajianPerKemasan: "1",
    sajianDikonsumsi: "1",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const total = foods.reduce(
    (acc, f) => ({
      gula: acc.gula + f.gula * f.sajian,
      natrium: acc.natrium + f.natrium * f.sajian,
      lemak: acc.lemak + f.lemak * f.sajian,
    }),
    { gula: 0, natrium: 0, lemak: 0 }
  );

  function validate() {
    const errs: Partial<typeof form> = {};
    if (!form.natrium && !form.gula && !form.lemak) {
      errs.natrium = "Isi minimal satu nilai nutrisi";
    }
    const sajianPerKemasan = parseFloat(form.sajianPerKemasan);
    const sajianDikonsumsi = parseFloat(form.sajianDikonsumsi);
    if (isNaN(sajianPerKemasan) || sajianPerKemasan <= 0) {
      errs.sajianPerKemasan = "Harus lebih dari 0";
    }
    if (isNaN(sajianDikonsumsi) || sajianDikonsumsi <= 0) {
      errs.sajianDikonsumsi = "Harus lebih dari 0";
    }
    return errs;
  }

  function handleAdd() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const sajianPerKemasan = parseFloat(form.sajianPerKemasan) || 1;
    const sajianDikonsumsi = parseFloat(form.sajianDikonsumsi) || 1;
    const rasio = sajianDikonsumsi / sajianPerKemasan;

    const gulaPerSajian = parseFloat(form.gula) || 0;
    const natriumPerSajian = parseFloat(form.natrium) || 0;
    const lemakPerSajian = parseFloat(form.lemak) || 0;

    const entry: FoodEntry = {
      id: crypto.randomUUID(),
      nama: form.nama.trim() || "Makanan tak bernama",
      gula: gulaPerSajian,
      natrium: natriumPerSajian,
      lemak: lemakPerSajian,
      sajian: rasio,
    };

    setFoods((prev) => [...prev, entry]);
    setForm({
      nama: "",
      gula: "",
      natrium: "",
      lemak: "",
      sajianPerKemasan: "1",
      sajianDikonsumsi: "1",
    });
  }

  function handleRemove(id: string) {
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }

  function handleReset() {
    setFoods([]);
  }

  const adaMakanan = foods.length > 0;

  return (
    <div className="min-h-full bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Cek GGL Harianmu
          </h1>
          <p className="text-sm text-muted-foreground">
            Pantau gula, garam, dan lemak sesuai anjuran Kemenkes —{" "}
            <span className="text-foreground/70">Permenkes No. 30 Tahun 2013</span>
          </p>
        </div>

        {/* Ringkasan Batas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Gula", nilai: "50g", sub: "4 sdm", color: "text-amber-400" },
            { label: "Natrium", nilai: "2000mg", sub: "1 sdt garam", color: "text-sky-400" },
            { label: "Lemak", nilai: "67g", sub: "5 sdm", color: "text-rose-400" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card px-4 py-3 text-center"
            >
              <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
              <p className={`text-base font-semibold tabular-nums ${item.color}`}>{item.nilai}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Form Input */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Tambah Makanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama">Nama makanan</Label>
              <Input
                id="nama"
                placeholder="Contoh: Mie instan goreng"
                value={form.nama}
                onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gula">Gula (g)</Label>
                <Input
                  id="gula"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.gula}
                  onChange={(e) => setForm((p) => ({ ...p, gula: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="natrium">Natrium (mg)</Label>
                <Input
                  id="natrium"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.natrium}
                  onChange={(e) => setForm((p) => ({ ...p, natrium: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lemak">Lemak (g)</Label>
                <Input
                  id="lemak"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.lemak}
                  onChange={(e) => setForm((p) => ({ ...p, lemak: e.target.value }))}
                />
              </div>
            </div>

            {errors.natrium && (
              <p className="text-xs text-destructive">{errors.natrium}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sajianPerKemasan">
                  Jumlah sajian per kemasan
                </Label>
                <Input
                  id="sajianPerKemasan"
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="1"
                  value={form.sajianPerKemasan}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sajianPerKemasan: e.target.value }))
                  }
                />
                {errors.sajianPerKemasan && (
                  <p className="text-xs text-destructive">{errors.sajianPerKemasan}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sajianDikonsumsi">
                  Sajian yang dikonsumsi
                </Label>
                <Input
                  id="sajianDikonsumsi"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="1"
                  value={form.sajianDikonsumsi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sajianDikonsumsi: e.target.value }))
                  }
                />
                {errors.sajianDikonsumsi && (
                  <p className="text-xs text-destructive">{errors.sajianDikonsumsi}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Nilai nutrisi di atas adalah per sajian (takaran saji). Jika kemasan punya 2 sajian dan kamu makan semuanya, isi sajian dikonsumsi = 2.
            </p>

            <Button onClick={handleAdd} className="w-full">
              Tambah
            </Button>
          </CardContent>
        </Card>

        {/* Dashboard Hasil */}
        {adaMakanan && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Total Konsumsi Hari Ini
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-7 px-2"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <NutrisiBar
                label="Gula"
                satuan="g"
                nilai={total.gula}
                batas={DAILY_LIMIT.gula}
                icon="🍬"
              />
              <NutrisiBar
                label="Natrium (Garam)"
                satuan="mg"
                nilai={total.natrium}
                batas={DAILY_LIMIT.natrium}
                icon="🧂"
              />
              <NutrisiBar
                label="Lemak"
                satuan="g"
                nilai={total.lemak}
                batas={DAILY_LIMIT.lemak}
                icon="🫙"
              />
            </CardContent>
          </Card>
        )}

        {/* Daftar Makanan */}
        {adaMakanan && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Daftar Makanan ({foods.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">
                      {food.nama}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {food.sajian !== 1 && (
                        <span className="mr-2 text-foreground/60">
                          ×{food.sajian % 1 === 0 ? food.sajian : food.sajian.toFixed(2)} sajian
                        </span>
                      )}
                      {food.gula > 0 && (
                        <span className="mr-2">Gula: {(food.gula * food.sajian).toFixed(1)}g</span>
                      )}
                      {food.natrium > 0 && (
                        <span className="mr-2">Natrium: {(food.natrium * food.sajian).toFixed(0)}mg</span>
                      )}
                      {food.lemak > 0 && (
                        <span>Lemak: {(food.lemak * food.sajian).toFixed(1)}g</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(food.id)}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors text-sm"
                    aria-label="Hapus"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Berdasarkan{" "}
          <span className="text-foreground/60">
            Permenkes No. 30 Tahun 2013
          </span>{" "}
          · Program GGL Kemenkes RI
        </p>

      </div>
    </div>
  );
}
