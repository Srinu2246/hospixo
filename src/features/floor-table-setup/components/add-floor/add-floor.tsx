'use client';

import { useId, useState, type FormEvent } from 'react';

import { floorTableSetupCopy } from '@/features/floor-table-setup/config';

import styles from './add-floor.module.css';

type AddFloorProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}>;

export function AddFloor({ open, onClose, onCreate }: AddFloorProps) {
  if (!open) return null;

  return <AddFloorForm onClose={onClose} onCreate={onCreate} />;
}

function AddFloorForm({
  onClose,
  onCreate,
}: Readonly<{
  onClose: () => void;
  onCreate: (name: string) => void;
}>) {
  const titleId = useId();
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
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
          {floorTableSetupCopy.addFloorTitle}
        </h2>
        <label className={styles.field}>
          <span className={styles.label}>{floorTableSetupCopy.addFloorName}</span>
          <input
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            {floorTableSetupCopy.addFloorCancel}
          </button>
          <button type="submit" className={styles.submit} disabled={!name.trim()}>
            {floorTableSetupCopy.addFloorSubmit}
          </button>
        </div>
      </form>
    </div>
  );
}
