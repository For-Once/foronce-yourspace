import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { affirm } from "@/lib/affirm";
import {
  createBackup,
  decryptBackup,
  applyRestore,
  backupFilename,
} from "@/lib/backup";

export const Route = createFileRoute("/_app/backup")({
  head: () => ({
    meta: [
      { title: "Backup & Restore — For Once" },
      {
        name: "description",
        content:
          "Make an encrypted backup of your private space, or restore it on another device. Only your passphrase can open it.",
      },
    ],
  }),
  component: Backup,
});

function Backup() {
  return (
    <div>
      <PageHeader
        title="Backup & Restore"
        subtitle="Everything you write lives only on this device. Make an encrypted copy to keep it safe, or move it to another device. Only your passphrase can open it."
      />

      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-2xl border border-turquoise/25 bg-turquoise/5 p-4 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-turquoise" />
          <p>
            Your backup is encrypted on your device before it ever leaves it. We never see it,
            and there's no account in the cloud. If you forget your passphrase, no one — not even
            us — can recover it.
          </p>
        </div>

        <ExportPanel />
        <RestorePanel />
      </div>
    </div>
  );
}

function ExportPanel() {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const exportBackup = async () => {
    setError(undefined);
    if (pass.length < 6) {
      setError("Choose a passphrase of at least 6 characters.");
      return;
    }
    if (pass !== confirm) {
      setError("The two passphrases don't match.");
      return;
    }
    setBusy(true);
    try {
      const backup = await createBackup(pass);
      const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backupFilename();
      a.click();
      URL.revokeObjectURL(url);
      affirm("Your space is safe. Keep this file somewhere only you can reach.");
      setPass("");
      setConfirm("");
    } catch {
      setError("Something went wrong while creating the backup.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-5">
      <h2 className="flex items-center gap-2 font-semibold text-cream">
        <Download className="h-4 w-4 text-turquoise" /> Export an encrypted backup
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a passphrase you'll remember. You'll need the exact same one to restore.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="passphrase"
          className="border-border bg-background/30"
        />
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="confirm passphrase"
          className="border-border bg-background/30"
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose">{error}</p>}

      <Button variant="hero" size="lg" className="mt-4" disabled={busy} onClick={exportBackup}>
        <Lock className="h-4 w-4" /> {busy ? "encrypting…" : "download encrypted backup"}
      </Button>
    </section>
  );
}

function RestorePanel() {
  const [pass, setPass] = useState("");
  const [file, setFile] = useState<unknown>();
  const [fileName, setFileName] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined);
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    try {
      setFile(JSON.parse(await f.text()));
    } catch {
      setFile(undefined);
      setError("That file couldn't be read as a backup.");
    }
  };

  const restore = async () => {
    setError(undefined);
    if (!file) {
      setError("Choose a backup file first.");
      return;
    }
    if (!pass) {
      setError("Enter the passphrase for this backup.");
      return;
    }
    setBusy(true);
    try {
      const data = await decryptBackup(file, pass);
      applyRestore(data);
      affirm("Welcome back. Everything is right where you left it.");
      setPass("");
      setFile(undefined);
      setFileName(undefined);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't restore this backup.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-5">
      <h2 className="flex items-center gap-2 font-semibold text-cream">
        <Upload className="h-4 w-4 text-lavender" /> Restore from a backup
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Bring your space onto this device. This replaces matching entries here with the ones in
        your backup.
      </p>

      <div className="mt-4 space-y-3">
        <Button
          variant="soft"
          size="lg"
          className="w-full justify-center sm:w-auto"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> {fileName ?? "choose backup file"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".foronce,application/json"
          onChange={onPick}
          className="hidden"
        />
        <Input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="passphrase"
          className="border-border bg-background/30"
        />
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
        <p>Restoring overwrites entries on this device that share the same space.</p>
      </div>

      {error && <p className="mt-3 text-sm text-rose">{error}</p>}

      <Button variant="hero" size="lg" className="mt-4" disabled={busy} onClick={restore}>
        <ShieldCheck className="h-4 w-4" /> {busy ? "restoring…" : "restore my space"}
      </Button>
    </section>
  );
}
