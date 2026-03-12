"use client";
import { useEffect, useState } from "react";
import { useDesignStore } from "@/store/design-store";
import { useProjects } from "@/lib/swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectPanel() {
  const [name, setName] = useState("");
  const project    = useDesignStore((s) => s.project);
  const setProject = useDesignStore((s) => s.setProject);
  const resetStore = useDesignStore((s) => s.reset);

  const {
    projects,
    isLoading,
    saveProject,
    updateProject,
    deleteProject,
    loadProject,
  } = useProjects();

  // Sync nama input saat project berubah
  useEffect(() => {
    if (!project) return;
    const found = projects.find((p) => p.id === project.id) ?? null;
    setProject(found);
    if (found) setName(found.name ?? "");
  }, [project, projects]);

  // ── Simpan project baru ──────────────────────────────────────
  async function handleSave() {
    const trimmed = name.trim() || "Untitled";
    await saveProject(trimmed, "draft");
    setName("");
  }

  // ── Update project yang sedang diedit ────────────────────────
  async function handleUpdate() {
    if (!project) return;
    await updateProject(project.id, name.trim() || project.name, "draft");
  }

  // ── Buat project baru (reset kanvas) ─────────────────────────
  function handleNew() {
    resetStore();
    setProject(null);
    setName("");
  }

  // ── Load project dari daftar ─────────────────────────────────
  function handleLoad(id: string) {
    const found = projects.find((p) => p.id === id);
    if (!found) return;
    loadProject(id);
    setProject(found);
    setName(found.name);
  }

  // ── Hapus project ────────────────────────────────────────────
  function handleDelete(id: string) {
    deleteProject(id);
    if (project?.id === id) {
      setProject(null);
      setName("");
    }
  }

  return (
    <div className="space-y-3">

      {/* Input nama */}
      <Input
        placeholder="Nama project..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {project ? (
        // ── Mode edit: project aktif ─────────────────────────
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            Mengedit:{" "}
            <span className="font-medium text-foreground">{project.name}</span>
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleUpdate}>
              Simpan Perubahan
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleNew}>
              Buat Baru
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => { setProject(null); setName(""); }}
          >
            Batal edit
          </Button>
        </div>
      ) : (
        // ── Mode baru: belum ada project aktif ───────────────
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSave}>
            Simpan Project
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleNew}>
            Buat Baru
          </Button>
        </div>
      )}

      {/* Daftar project */}
      <div className="pt-3 border-t border-border">
        <div className="text-sm font-medium mb-2">Daftar Project</div>
        <div className="grid gap-2">
          {isLoading && (
            <p className="text-xs text-muted-foreground">Memuat...</p>
          )}
          {!isLoading && projects.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Belum ada project disimpan.
            </p>
          )}
          {projects.map((it) => (
            <div
              key={it.id}
              className={`rounded-md border p-2 transition-colors ${
                project?.id === it.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate font-medium">{it.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(it.updatedAt ?? it.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLoad(it.id)}
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(it.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}