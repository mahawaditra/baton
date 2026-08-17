"use client";

import { useActionState, useEffect } from "react";
import { submitRequest } from "./actions";
import { REQUESTABLE_INSTRUMENT_TYPES } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toast";
import { EmptyState } from "@/components/EmptyState";

const initialState = {
  ticketId: null,
  accessCode: null,
  error: null,
  generalError: null,
};

export function RequestForm() {
  const [state, formAction, isPending] = useActionState(
    submitRequest,
    initialState,
  );

  useEffect(() => {
    if (state.generalError) {
      toastError(state.generalError);
    }
  }, [state.generalError]);

  if (state.ticketId) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
        <EmptyState
          icon={CheckCircle2}
          title="Pengajuan Terkirim!"
          description='Email konfirmasi berisi ticket ID dan kode akses udah dikirim ke inbox kamu — kalau belum kelihatan dalam beberapa menit, cek folder Spam (dan tandai "Bukan spam" kalau ada opsinya).'
          tone="success"
        />

        <Card className="w-full">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-label text-muted-foreground">
                Ticket ID
              </span>
              <span className="tabular text-title font-semibold text-foreground">
                {state.ticketId}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-label text-muted-foreground">
                Kode Akses
              </span>
              <span className="tabular text-title font-semibold text-foreground">
                {state.accessCode}
              </span>
            </div>
          </CardContent>
        </Card>

        <p className="text-caption text-muted-foreground">
          Halaman ini gak akan nampilin lagi datanya, jadi sebaiknya dicatat
          atau di-screenshot ticket ID dan kode aksesnya.
        </p>

        <Link
          href={`/status/${state.ticketId}`}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Ke halaman status saya
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-micro uppercase text-gold">
          Formulir Peminjaman
        </div>
        <h1 className="mt-3 font-heading text-h1 text-foreground">
          Ajukan peminjaman alat
        </h1>
        <p className="mt-2 text-body-lg text-foreground-2">
          Peminjaman akan diverifikasi admin OSUI Mahawaditra dalam 1×24 jam.
          Kode akses status dikirim ke email yang kamu masukkan.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        {state.error && (
          <p className="text-sm text-destructive" aria-live="polite">
            {state.error}
          </p>
        )}

        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" required>
                Nama lengkap
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nama lengkap kamu"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
              />
              <p className="text-caption text-muted-foreground">
                Kode akses status akan dikirim ke email ini.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" required>
                  Nomor HP (WhatsApp)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+62 8xx xxxx xxxx"
                  className="tabular"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lineId" required>
                  LINE ID
                </Label>
                <Input
                  id="lineId"
                  name="lineId"
                  type="text"
                  placeholder="ID LINE kamu"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="instrumentType" required>
                  Instrumen yang diminati
                </Label>
                <Select name="instrumentType" required>
                  <SelectTrigger id="instrumentType" className="w-full">
                    <SelectValue placeholder="Pilih instrumen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUESTABLE_INSTRUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="year" required>
                  Angkatan
                </Label>
                <Input
                  id="year"
                  name="year"
                  type="text"
                  inputMode="numeric"
                  placeholder="mis. 2023"
                  className="tabular"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Kembali ke beranda
          </Link>
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? "Mengirim..." : "Kirim Permintaan"}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </form>
    </div>
  );
}
