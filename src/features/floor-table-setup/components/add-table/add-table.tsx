'use client';

import { useId, useState, type FormEvent } from 'react';

import { floorTableSetupCopy } from '@/features/floor-table-setup/config';

import styles from '../add-floor/add-floor.module.css';

type AddTableProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, seats: number) => void;
}>;

export function AddTable({ open, onClose, onCreate }: AddTableProps) {
  if (!open) return null;

  return <AddTableForm onClose={onClose} onCreate={onCreate} />;
}

function AddTableForm({
  onClose,
  onCreate,
}: Readonly<{
  onClose: () => void;
  onCreate: (name: string, seats: number) => void;
}>) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [seats, setSeats] = useState('4');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    const seatCount = Number(seats);
    if (!trimmed || !Number.isFinite(seatCount) || seatCount < 1) return;
    onCreate(trimmed, seatCount);
    onClose();
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 id={titleId} className={styles.title}>
          {floorTableSetupCopy.addTableTitle}
        </h2>
        <label className={styles.field}>
          <span className={styles.label}>{floorTableSetupCopy.addTableName}</span>
          <input
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{floorTableSetupCopy.addTableSeats}</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            {floorTableSetupCopy.addTableCancel}
          </button>
          <button
            type="submit"
            className={styles.submit}
            disabled={!name.trim() || Number(seats) < 1}
          >
            {floorTableSetupCopy.addTableSubmit}
          </button>
        </div>
      </form>
    </div>
  );
}
