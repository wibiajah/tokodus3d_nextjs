"use client";
import { useEffect, useState } from "react";
import { useDesignStore } from "@/store/design-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, Loader2, Check, X } from "lucide-react";
const DEFAULT_FONTS  = [
  "Inter",
  "Geist",
  "Roboto",
  "Georgia",
  "Courier New",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
];
const FONTS_STORAGE_KEY = "custom-fonts-list";
export function TextEditor() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fonts, setFonts] = useState<string[]>(DEFAULT_FONTS);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#111111");
  const [font, setFont] = useState(fonts[0]);
  const addText = useDesignStore((s) => s.addText);
  const updateText = useDesignStore((s) => s.updateText);
  const removeText = useDesignStore((s) => s.removeText);
  const texts = useDesignStore((s) => s.texts);
  const selectedId = useDesignStore((s) => s.selectedId);
  const setSelectedId = useDesignStore((s) => s.setSelectedId);
  const side = useDesignStore((s) => s.side);
  const [showAddFont, setShowAddFont] = useState(false);
  const [newFontName, setNewFontName] = useState("");
  const [isCheckingFont, setIsCheckingFont] = useState(false);
  const [fontCheckStatus, setFontCheckStatus] = useState<"idle" | "success" | "error">("idle");
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (!isMounted) return;
    const savedFonts = localStorage.getItem(FONTS_STORAGE_KEY);
    if (savedFonts) {
      try {
        const parsedFonts = JSON.parse(savedFonts);
        if (Array.isArray(parsedFonts) && parsedFonts.length > 0) {
          setFonts(parsedFonts);
          setFont(parsedFonts[0]);
        }
      } catch (error) {
        console.error("Error loading fonts from localStorage:", error);
      }
    }
  }, [isMounted]);
  useEffect(() => {
     if (!isMounted) return;
    import("webfontloader").then((WebFont) => {
      const googleFonts = fonts.filter(
        (f) => !["Georgia", "Courier New"].includes(f)
      );

      if (googleFonts.length > 0) {
        WebFont.load({
          google: {
            families: googleFonts,
          },
          active: () => {
            setFontsLoaded(true);
          },
          inactive: () => {
            setFontsLoaded(true);
          },
        });
      } else {
        setFontsLoaded(true);
      }
    });
  }, [fonts, isMounted]);
  const saveFontsToStorage = (fontsList: string[]) => {
    if (!isMounted) return;
    try {
      localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(fontsList));
    } catch (error) {
      console.error("Error saving fonts to localStorage:", error);
    }
  };
  const checkFontByLoading = async (fontName: string): Promise<boolean> => {
    if (!isMounted) return false;
    const WebFont = await import("webfontloader");
    return new Promise((resolve) => {
      WebFont.load({
        google: {
          families: [fontName],
        },
        active: () => resolve(true),
        inactive: () => resolve(false),
        timeout: 3000,
      });
    });
  };
  const handleAddFont = async () => {
    if (!newFontName.trim()) return;
    const formattedName = newFontName.trim();
    if (fonts.some((f) => f.toLowerCase() === formattedName.toLowerCase())) {// Cek apakah font sudah ada
      setFontCheckStatus("error");
      setTimeout(() => setFontCheckStatus("idle"), 2000);
      return;
    }
    setIsCheckingFont(true);
    setFontCheckStatus("idle");
    const exists = await checkFontByLoading(formattedName);
    setIsCheckingFont(false);
    if (exists) {
      const newFontsList = [...fonts, formattedName];
      setFonts(newFontsList);
      saveFontsToStorage(newFontsList);
      setFontCheckStatus("success");
      setNewFontName("");
      setTimeout(() => {
        setFontCheckStatus("idle");
        setShowAddFont(false);
      }, 1500);
    } else {
      setFontCheckStatus("error");
      setTimeout(() => setFontCheckStatus("idle"), 2000);
    }
  };
  const handleRemoveFont = (fontToRemove: string) => {
    if (fonts.length <= 1) return; // Minimal 1 font
    const newFontsList = fonts.filter((f) => f !== fontToRemove);
    setFonts(newFontsList);
    saveFontsToStorage(newFontsList);
    if (font === fontToRemove) {
      setFont(newFontsList[0]);// Jika font yang dihapus sedang dipilih, ganti ke font pertama
    }
  };
  const handleResetFonts = () => {
    setFonts(DEFAULT_FONTS);
    saveFontsToStorage(DEFAULT_FONTS);
    setFont(DEFAULT_FONTS[0]);
  };
  const selectedText = texts.find((t) => t.id === selectedId);
  function measureTextDimensions(
    text: string,
    fontFamily: string,
    fontSize: number,
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return { width: 0, height: 0 };
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const width = metrics.width * 1.1;
    const height =
      (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) *
      1.4;
    return { width, height };
  }
  useEffect(() => {
    if (selectedText) {
      setText(selectedText.text);
      setFontSize(selectedText.fontSize);
      setColor(selectedText.color);
      setFont(selectedText.font);
    }
  }, [selectedText]);
  function handleAdd() {
    if (!text.trim()) return;
    const { width, height } = measureTextDimensions(text, font, fontSize);
    addText({
      text: text.trim(),
      x: 300,
      y: 200,
      rotation: 0,
      fontSize,
      color,
      font,
      width,
      height,
      draggable: true,
      side,
    });
    setText("");
  }
  function handleUpdate() {
    if (!selectedId) return;
    const { width, height } = measureTextDimensions(text, font, fontSize);
    updateText(selectedId, { text, fontSize, color, font, width, height });
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="txt">{selectedText ? "Edit Teks" : "Teks Baru"}</Label>
        <Input
          id="txt"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Masukkan teks..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              selectedText ? handleUpdate() : handleAdd();
            }
          }}
          style={{ fontFamily: font }}
          autoComplete="off"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>Jenis Font</Label>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setShowAddFont(!showAddFont)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Tambah
          </Button>
        </div>
        {showAddFont && (
          <div className="border border-border rounded-md p-2 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="contoh: Playfair Display"
                value={newFontName}
                onChange={(e) => setNewFontName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFont();
                }}
                className="text-sm"
                disabled={isCheckingFont}
              />
              <Button
                size="sm"
                onClick={handleAddFont}
                disabled={isCheckingFont || !newFontName.trim()}
              >
                {isCheckingFont ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : fontCheckStatus === "success" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : fontCheckStatus === "error" ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
            {fontCheckStatus === "error" && (
              <p className="text-xs text-red-500">
                Font tidak ditemukan di Google Fonts atau sudah ada
              </p>
            )}
            {fontCheckStatus === "success" && (
              <p className="text-xs text-green-500">Font berhasil ditambahkan!</p>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <select
            className="flex-1 rounded border bg-background px-2 py-1 text-sm"
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            {fontsLoaded &&
              fonts.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
          </select>
          {fonts.length > DEFAULT_FONTS.length && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetFonts}
              className="text-xs"
            >
              Reset
            </Button>
          )}
        </div>
        {!DEFAULT_FONTS.includes(font) && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => handleRemoveFont(font)}
          >
            Hapus "{font}" dari daftar
          </Button>
        )}
      </div>
      <div className="grid gap-2">
        <Label>Ukuran Font: {fontSize}px</Label>
        <Slider
          value={[fontSize]}
          min={10}
          max={120}
          step={1}
          onValueChange={([v]) => setFontSize(v)}
        />
      </div>
      <div className="grid gap-2">
        <Label>Warna</Label>
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      {selectedText ? (
        <Button className="w-full" onClick={handleUpdate}>
          Simpan Perubahan
        </Button>
      ) : (
        <Button className="w-full" onClick={handleAdd}>
          Tambah Teks
        </Button>
      )}
      {texts.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs font-medium mb-2">
            Daftar Teks ({texts.length})
          </div>
          <div className="grid gap-2 max-h-[200px] overflow-y-auto">
            {texts.map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between rounded-md border border-border p-2 transition-colors ${
                  selectedId === t.id
                    ? "bg-accent/80"
                    : t.side === "outer"
                      ? "bg-emerald-200 dark:bg-emerald-800/50 border-emerald-400"
                      : "bg-sky-200 dark:bg-sky-800/50 border-sky-400 hover:bg-accent/50"
                }`}
                onClick={() => setSelectedId(t.id)}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-sm truncate font-medium">{t.text}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.fontSize}px • {t.font}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeText(t.id)}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}