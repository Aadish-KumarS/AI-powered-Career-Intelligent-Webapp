import { FiAlertCircle } from 'react-icons/fi';

export default function AppState({ type = 'loading', title, description, action }) {
  const isLoading = type === 'loading';
  return (
    <section className={`app-state app-state--${type}`} role={isLoading ? 'status' : 'alert'} aria-live="polite">
      <div className="app-state__content">
        <div className="app-state__mark">{isLoading ? <span className="app-spinner" aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}</div>
        <h2>{title || (isLoading ? 'Getting things ready' : 'Something needs your attention')}</h2>
        {description && <p>{description}</p>}
        {action}
      </div>
    </section>
  );
}
