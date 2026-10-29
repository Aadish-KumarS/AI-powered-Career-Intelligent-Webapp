import { useEffect } from 'react';

export default function AppDialog({ open, title, description, confirmLabel = 'Continue', cancelLabel = 'Cancel', onConfirm, onCancel, busy = false, tone = 'default' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="rt-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <section className={`rt-dialog rt-dialog--${tone}`} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-description">{description}</p>
        <div className="rt-dialog__actions">
          <button type="button" className="rt-button rt-button--secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" className={`rt-button ${tone === 'danger' ? 'rt-button--danger' : ''}`} onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
