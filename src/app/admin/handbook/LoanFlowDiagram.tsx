"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Lane = "peminjam" | "admin" | "system";

type FlowNode = {
  id: string;
  label: string;
  lane: Lane;
  row: number;
  x?: number;
  detail: string;
  note?: string;
};

type FlowEdge = { from: string; to: string };

const ROW_HEIGHT = 112;
const TOP_PAD = 32;
const BOX_H = 48;
const BOX_W = 210;
const WIDE_W = 550;
const WIDE_X = 60;
const LANE_X: Record<"peminjam" | "admin", number> = {
  peminjam: 165,
  admin: 520,
};

const NODES: FlowNode[] = [
  {
    id: "submit",
    label: "Submit pengajuan",
    lane: "peminjam",
    row: 1,
    detail:
      "Peminjam isi form: nama, kontak, jenis instrumen yang diminati. Status jadi submitted.",
  },
  {
    id: "assign",
    label: "Assign instrumen",
    lane: "admin",
    row: 2,
    detail:
      "Admin pilih instrumen yang cocok dari yang tersedia. Instrumen itu sendiri: available → reserved. Status request jadi reviewing.",
  },
  {
    id: "upload",
    label: "Kontrak & upload dokumen",
    lane: "peminjam",
    row: 3,
    detail:
      "Peminjam lengkapi data kontrak (KTP, alamat, fakultas, dll), generate & tanda tangan PDF kontrak, lalu upload 3 dokumen: kontrak tanda tangan, bukti deposit, KTP.",
    note: "↻ Kalau ada dokumen ditolak, balik ke sini buat upload ulang.",
  },
  {
    id: "review",
    label: "Review dokumen",
    lane: "admin",
    row: 4,
    detail:
      "Admin cek tiap dokumen satu-satu: tanda tangan lengkap? materai? nominal & rekening bukti transfer cocok? KTP kebaca? Approve atau reject.",
  },
  {
    id: "sekre",
    label: "Terima di Sekre",
    lane: "peminjam",
    row: 5,
    detail:
      "Begitu semua dokumen approved, peminjam datang ambil instrumen, isi addendum kondisi awal + foto. Status: ready_to_pickup.",
  },
  {
    id: "handover",
    label: "Confirm handover",
    lane: "admin",
    row: 6,
    detail:
      "Admin konfirmasi serah terima instrumen. Instrumen: reserved → borrowed. Status: active — mulai hitung mundur due date.",
  },
  {
    id: "active",
    label: "Loan aktif",
    lane: "system",
    row: 7,
    detail:
      "Hitung mundur due date jalan. Bisa di-extend (dari 30 hari sebelum due) atau di-return kapan aja. Kalau lewat due date, otomatis jadi overdue lewat cron harian — return tetap bisa dikonfirmasi dari situ.",
  },
  {
    id: "extend",
    label: "Extend: kontrak baru",
    lane: "peminjam",
    row: 8,
    x: LANE_X.peminjam,
    detail:
      "Peminjam generate kontrak perpanjangan baru + isi addendum baru. Admin masih perlu confirm extension-nya sebelum ini keitung ongoing.",
    note: "↻ Balik jadi Loan aktif lagi.",
  },
  {
    id: "return-fill",
    label: "Isi addendum akhir",
    lane: "peminjam",
    row: 8,
    x: LANE_X.admin,
    detail: "Peminjam isi addendum kondisi akhir instrumen sebelum dikembalikan, plus foto.",
  },
  {
    id: "return-check",
    label: "Cek kondisi & refund",
    lane: "admin",
    row: 9,
    detail:
      "Admin cek kondisi instrumen sesuai addendum akhir, hitung refund deposit — penuh, parsial, atau hangus tergantung berapa hari telat vs grace days di Settings.",
  },
  {
    id: "return-confirm",
    label: "Confirm return",
    lane: "admin",
    row: 10,
    detail:
      "Admin konfirmasi pengembalian. Instrumen: borrowed → available (atau unavailable kalau kondisinya retired/lost). Status: returned. Selesai.",
  },
];

const EDGES: FlowEdge[] = [
  { from: "submit", to: "assign" },
  { from: "assign", to: "upload" },
  { from: "upload", to: "review" },
  { from: "review", to: "sekre" },
  { from: "sekre", to: "handover" },
  { from: "handover", to: "active" },
  { from: "active", to: "extend" },
  { from: "active", to: "return-fill" },
  { from: "return-fill", to: "return-check" },
  { from: "return-check", to: "return-confirm" },
];

function geometry(node: FlowNode) {
  const y = TOP_PAD + (node.row - 1) * ROW_HEIGHT;
  if (node.lane === "system") {
    return { x: WIDE_X, y, width: WIDE_W, height: BOX_H };
  }
  const cx = node.x ?? LANE_X[node.lane];
  return { x: cx - BOX_W / 2, y, width: BOX_W, height: BOX_H };
}

const LANE_FILL: Record<Lane, string> = {
  peminjam: "fill-plum-soft",
  admin: "fill-gold-soft",
  system: "fill-muted",
};
const LANE_STROKE: Record<Lane, string> = {
  peminjam: "stroke-plum",
  admin: "stroke-gold",
  system: "stroke-border-strong",
};
const LANE_TEXT: Record<Lane, string> = {
  peminjam: "fill-plum",
  admin: "fill-gold-soft-foreground",
  system: "fill-muted-foreground",
};

const nodesById = new Map(NODES.map((n) => [n.id, n]));
const maxRow = Math.max(...NODES.map((n) => n.row));
const viewHeight = TOP_PAD + (maxRow - 1) * ROW_HEIGHT + BOX_H + 32;

const laneRect = {
  peminjam: { x: 20, width: LANE_X.peminjam - 20 + BOX_W / 2 + 20 },
  admin: {
    x: LANE_X.admin - BOX_W / 2 - 20,
    width: 680 - (LANE_X.admin - BOX_W / 2 - 20) - 16,
  },
};

type TooltipState = { node: FlowNode; left: number; top: number } | null;

export function LoanFlowDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  function show(node: FlowNode, target: Element) {
    const container = containerRef.current;
    if (!container) return;
    const containerBox = container.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    setTooltip({
      node,
      left: targetBox.left + targetBox.width / 2 - containerBox.left,
      top: targetBox.top - containerBox.top - 8,
    });
  }

  function hide(node: FlowNode) {
    setTooltip((current) => (current?.node.id === node.id ? null : current));
  }

  function edgePath(edge: FlowEdge) {
    const from = nodesById.get(edge.from)!;
    const to = nodesById.get(edge.to)!;
    const fromGeo = geometry(from);
    const toGeo = geometry(to);
    const sx = fromGeo.x + fromGeo.width / 2;
    const sy = fromGeo.y + fromGeo.height;
    const tx = toGeo.x + toGeo.width / 2;
    const ty = toGeo.y;
    if (sx === tx) return `M${sx},${sy} L${tx},${ty}`;
    const midY = (sy + ty) / 2;
    return `M${sx},${sy} L${sx},${midY} L${tx},${midY} L${tx},${ty}`;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 680 ${viewHeight}`}
          className="block w-[680px] max-w-none sm:w-full"
          role="img"
          aria-label="Diagram alur peminjaman, dari submit pengajuan sampai instrumen dikembalikan"
        >
        <defs>
          <marker
            id="loan-flow-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              className="stroke-muted-foreground"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        <rect
          x={laneRect.peminjam.x}
          y={4}
          width={laneRect.peminjam.width}
          height={viewHeight - 8}
          rx={14}
          fill="none"
          className="stroke-border"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
        <rect
          x={laneRect.admin.x}
          y={4}
          width={laneRect.admin.width}
          height={viewHeight - 8}
          rx={14}
          fill="none"
          className="stroke-border"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
        <text
          x={LANE_X.peminjam}
          y={20}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-muted-foreground text-[11px] font-semibold tracking-wide uppercase"
        >
          Peminjam
        </text>
        <text
          x={LANE_X.admin}
          y={20}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-muted-foreground text-[11px] font-semibold tracking-wide uppercase"
        >
          Admin
        </text>

        {EDGES.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}`}
            d={edgePath(edge)}
            fill="none"
            className="stroke-border-strong"
            strokeWidth="1.25"
            markerEnd="url(#loan-flow-arrow)"
          />
        ))}

        {NODES.map((node) => {
          const geo = geometry(node);
          const isActive = tooltip?.node.id === node.id;
          return (
            <g
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`${node.label}. ${node.detail}`}
              className="cursor-pointer outline-none"
              onMouseEnter={(e) => show(node, e.currentTarget)}
              onMouseLeave={() => hide(node)}
              onFocus={(e) => show(node, e.currentTarget)}
              onBlur={() => hide(node)}
            >
              <rect
                x={geo.x}
                y={geo.y}
                width={geo.width}
                height={geo.height}
                rx={8}
                className={cn(LANE_FILL[node.lane], LANE_STROKE[node.lane])}
                strokeWidth={isActive ? 1.5 : 0.5}
              />
              <text
                x={geo.x + geo.width / 2}
                y={geo.y + geo.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn(LANE_TEXT[node.lane], "text-[13px] font-medium")}
              >
                {node.label}
              </text>
              {node.note && (
                <text
                  x={geo.x + geo.width / 2}
                  y={geo.y + geo.height + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-muted-foreground text-[11px]"
                >
                  {node.note}
                </text>
              )}
            </g>
          );
        })}
        </svg>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 w-72 max-w-[80vw] -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md sm:w-80"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <div className="font-semibold text-foreground">
            {tooltip.node.label}
          </div>
          <p className="mt-1 text-foreground-2">{tooltip.node.detail}</p>
        </div>
      )}
    </div>
  );
}
