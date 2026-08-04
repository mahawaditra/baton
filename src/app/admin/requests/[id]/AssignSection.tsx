"use client";

import { useState } from "react";
import { assignInstrument } from "./actions";
import type { Instrument } from "@/generated/prisma/client";

export function AssignSection({
  requestId,
  currentInstrument,
  candidates,
}: {
  requestId: string;
  currentInstrument: Instrument | null;
  candidates: Instrument[];
}) {
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);

  async function handlePick(instrumentId: string) {
    await assignInstrument(requestId, instrumentId);
    setOpen(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {currentInstrument ? (hovering ? "Reassign?" : "Assigned!") : "Assign"}
      </button>

      {open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}
        >
          <div
            style={{
              background: "white",
              margin: "50px auto",
              padding: 20,
              maxWidth: 700,
            }}
          >
            <h2>Select an instrument</h2>
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Serial No.</th>
                  <th>Condition</th>
                  <th>Location</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((inst) => (
                  <tr key={inst.id}>
                    <td>{inst.brand}</td>
                    <td>{inst.serialNumber}</td>
                    <td>{inst.condition}</td>
                    <td>{inst.location}</td>
                    <td>{inst.notes}</td>
                    <td>
                      <button onClick={() => handlePick(inst.id)}>
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
