"use client";

import { useActionState, useEffect, useState } from "react";
import { submitRequest } from "./actions";
import { REQUESTABLE_INSTRUMENT_TYPES } from "@/lib/constants";
import Link from "next/link";
import { ArrowRight, Camera, Check, Clock, Copy, Mail } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TicketCard, TicketLabel } from "@/components/TicketCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toast";
import { withNetworkFallback } from "@/lib/network-fallback";
import { Notice } from "@/components/Notice";
import { Field, useFocusFirstInvalid } from "@/components/Field";

const initialState = {
  ticketId: null,
  accessCode: null,
  error: null,
  generalError: null,
  fields: {},
};

const SUCCESS_NOTES = [
  {
    icon: Camera,
    text: "Halaman ini gak akan nampilin datanya lagi, jadi catat atau screenshot Ticket ID dan kode aksesnya.",
  },
  {
    icon: Clock,
    text: "Staf Logistik cek ketersediaan instrumen dalam 1×24 jam.",
  },
  {
    icon: Mail,
    text: 'Email belum masuk dalam beberapa menit? Cek folder Spam dan tandai "Bukan spam". Nyalakan juga notifikasi email biar gak kelewatan update status.',
  },
] as const;

function CopyButton({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} tersalin` : `Salin ${label}`}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4" strokeWidth={2} />
      ) : (
        <Copy className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  );
}

function FormSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2.5 text-title text-foreground">
          <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-background">
            {number}
          </span>
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  );
}

export function RequestForm() {
  const [state, formAction, isPending] = useActionState(
    withNetworkFallback(submitRequest),
    initialState,
  );

  const errors = state.fieldErrors ?? {};
  const formRef = useFocusFirstInvalid(state.fieldErrors);

  useEffect(() => {
    if (state.generalError) {
      toastError(state.generalError);
    }
  }, [state]);

  if (state.ticketId) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold-soft-foreground">
            <Check className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className="mt-4 font-heading text-h2 text-foreground">
            Pengajuan terkirim!
          </h1>
          <p className="mt-2 text-body text-foreground-2">
            Simpan Ticket ID dan kode akses di bawah ini. Salinannya juga
            dikirim ke email kamu.
          </p>
        </div>

        <TicketCard
          topTone="hero"
          top={
            <div className="px-6 pt-5 pb-6">
              <TicketLabel>Ticket ID</TicketLabel>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="tabular font-heading text-display tracking-[0.02em]">
                  {state.ticketId}
                </span>
                <CopyButton
                  label="Ticket ID"
                  value={state.ticketId}
                  className="text-hero-fg/70 hover:bg-hero-fg/10 hover:text-hero-fg"
                />
              </div>
            </div>
          }
          bottom={
            <div className="px-6 pt-4 pb-5">
              <div className="text-micro uppercase text-muted-foreground">
                Kode akses
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="tabular font-heading text-h2 tracking-[0.12em] text-foreground">
                  {state.accessCode}
                </span>
                <CopyButton
                  label="Kode akses"
                  value={state.accessCode ?? ""}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              </div>
            </div>
          }
        />

        <ul className="flex flex-col gap-4">
          {SUCCESS_NOTES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground-2">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="pt-1 text-body text-foreground-2">{text}</p>
            </li>
          ))}
        </ul>

        <Link
          href={`/status/${state.ticketId}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-full bg-gold px-6 text-hero-bg hover:bg-gold-hover",
          )}
        >
          Buka halaman status
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-micro uppercase text-gold-soft-foreground">
          Formulir peminjaman
        </div>
        <h1 className="mt-3 font-heading text-h1 text-foreground">
          Ajukan peminjaman alat
        </h1>
        <p className="mt-2 text-body-lg text-foreground-2">
          Peminjaman akan diverifikasi staf Logistik OSUI Mahawaditra dalam 1×24 jam.
          Kode akses status dikirim ke email yang kamu masukkan.
        </p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        key={JSON.stringify(state.fields)}
        noValidate
        className="flex flex-col gap-6"
      >
        {state.error && (
          <Notice tone="danger" compact aria-live="polite">
            {state.error}
          </Notice>
        )}

        <FormSection number={1} title="Data diri">
          <Field label="Nama lengkap" error={errors.name}>
            {(control) => (
              <Input
                {...control}
                name="name"
                type="text"
                maxLength={100}
                placeholder="Nama lengkap kamu"
                defaultValue={state.fields.name ?? ""}
                required
              />
            )}
          </Field>
          <Field label="Nama panggilan" optional error={errors.nickname}>
            {(control) => (
              <Input
                {...control}
                name="nickname"
                type="text"
                maxLength={100}
                placeholder="Nama panggilan kamu, kalau ada"
                defaultValue={state.fields.nickname ?? ""}
              />
            )}
          </Field>
          <Field label="Angkatan" error={errors.year}>
            {(control) => (
              <Input
                {...control}
                name="year"
                type="text"
                maxLength={4}
                inputMode="numeric"
                placeholder="mis. 2023"
                className="tabular"
                defaultValue={state.fields.year ?? ""}
                required
              />
            )}
          </Field>
        </FormSection>

        <FormSection number={2} title="Kontak">
          <Field
            label="Email"
            hint="Kode akses status akan dikirim ke email ini."
            error={errors.email}
          >
            {(control) => (
              <Input
                {...control}
                name="email"
                type="email"
                placeholder="nama@email.com"
                defaultValue={state.fields.email ?? ""}
                required
              />
            )}
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nomor HP (WhatsApp)" error={errors.phone}>
              {(control) => (
                <Input
                  {...control}
                  name="phone"
                  type="tel"
                  maxLength={20}
                  placeholder="+62 8xx xxxx xxxx"
                  className="tabular"
                  defaultValue={state.fields.phone ?? ""}
                  required
                />
              )}
            </Field>
            <Field label="LINE ID" error={errors.lineId}>
              {(control) => (
                <Input
                  {...control}
                  name="lineId"
                  type="text"
                  maxLength={20}
                  placeholder="ID LINE kamu"
                  defaultValue={state.fields.lineId ?? ""}
                  required
                />
              )}
            </Field>
          </div>
        </FormSection>

        <FormSection number={3} title="Instrumen">
          <Field label="Instrumen yang diminati" error={errors.instrumentType}>
            {(control) => (
              <Select
                name="instrumentType"
                defaultValue={state.fields.instrumentType || undefined}
                required
              >
                <SelectTrigger {...control} className="w-full">
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
            )}
          </Field>
        </FormSection>

        <div className="sticky bottom-0 z-10 -mx-6 border-t border-border bg-background/95 px-6 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] backdrop-blur-sm sm:static sm:mx-0 sm:flex sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="w-full sm:w-auto sm:px-6"
          >
            {isPending ? "Mengirim..." : "Kirim permintaan"}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </form>
    </div>
  );
}
