import { useEffect, useMemo, useState } from 'react';
import { telegramRequest } from '../api/telegramWarehouse';

const webApp = () => window.Telegram?.WebApp;

export default function TelegramWarehouse() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [movements, setMovements] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const filteredAssets = useMemo(() => assets.filter((asset) => `${asset.name} ${asset.assetCode} ${asset.category || ''}`.toLowerCase().includes(query.toLowerCase())), [assets, query]);

  async function load() {
    try {
      setError('');
      const [nextStats, nextAssets, nextMovements] = await Promise.all([
        telegramRequest('/telegram/warehouse/overview'), telegramRequest('/telegram/warehouse/assets'), telegramRequest('/telegram/warehouse/movements'),
      ]);
      setStats(nextStats); setAssets(nextAssets); setMovements(nextMovements);
    } catch (err) { setError(err.message); }
  }

  useEffect(() => {
    const app = webApp();
    app?.ready(); app?.expand(); app?.setHeaderColor?.('#09090B'); app?.setBackgroundColor?.('#09090B');
    app?.BackButton?.show?.();
    const theme = app?.themeParams || {};
    if (theme.bg_color) document.documentElement.style.setProperty('--tg-bg', theme.bg_color);
    if (theme.text_color) document.documentElement.style.setProperty('--tg-text', theme.text_color);
    app?.MainButton?.setText?.('Scansiona QR'); app?.MainButton?.show?.(); app?.MainButton?.onClick?.(scan);
    load();
    return () => { app?.BackButton?.hide?.(); app?.MainButton?.hide?.(); };
  }, []);

  function scan() {
    const app = webApp();
    if (app?.showScanQrPopup) app.showScanQrPopup({ text: 'Scansiona il QR dell’asset' }, (code) => { setQuery(code); app.closeScanQrPopup?.(); setTab('assets'); });
    else { const code = window.prompt('Inserisci il codice asset'); if (code) { setQuery(code); setTab('assets'); } }
  }

  async function returnAsset(asset) {
    if (!window.confirm(`Registrare la restituzione di ${asset.name}?`)) return;
    try { webApp()?.HapticFeedback?.notificationOccurred?.('success'); await telegramRequest(`/telegram/warehouse/assets/${encodeURIComponent(asset.assetCode)}/return`, { method: 'POST' }); await load(); }
    catch (err) { setError(err.message); webApp()?.HapticFeedback?.notificationOccurred?.('error'); }
  }

  if (error && !stats) return <main className="tg-page"><div className="tg-card"><span className="tg-kicker">INFINITY WAREHOUSE</span><h1>Account non collegato</h1><p>{error}</p><p className="tg-muted">Genera un codice dal dashboard Infinity EventOS e invialo al bot con <code>/link CODICE</code>.</p></div></main>;

  return <main className="tg-page">
    <header className="tg-header"><div><span className="tg-kicker">INFINITY EVENTOS</span><h1>Warehouse</h1></div><button className="tg-icon" onClick={load} aria-label="Aggiorna">↻</button></header>
    {error && <div className="tg-error">{error}</div>}
    <nav className="tg-tabs">{[['overview', 'Vista'], ['assets', 'Asset'], ['movements', 'Movimenti']].map(([key, label]) => <button className={tab === key ? 'active' : ''} onClick={() => setTab(key)} key={key}>{label}</button>)}</nav>
    {tab === 'overview' && <section><div className="tg-grid">{[['total', 'Totale'], ['available', 'Disponibili'], ['rented', 'Noleggiati'], ['activeRentals', 'Noleggi attivi']].map(([key, label]) => <div className="tg-stat" key={key}><strong>{stats?.[key] ?? '—'}</strong><span>{label}</span></div>)}</div><button className="tg-main" onClick={scan}>Scansiona asset</button></section>}
    {tab === 'assets' && <section><div className="tg-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca codice o nome" /><button onClick={scan}>QR</button></div><div className="tg-list">{filteredAssets.map((asset) => <article className="tg-card tg-asset" key={asset.id}><div><strong>{asset.name}</strong><span>{asset.assetCode} · {asset.status}</span></div>{asset.status === 'RENTED' && <button className="tg-small" onClick={() => returnAsset(asset)}>Restituisci</button>}</article>)}{!filteredAssets.length && <p className="tg-muted">Nessun asset trovato.</p>}</div></section>}
    {tab === 'movements' && <section className="tg-list">{movements.map((movement) => <article className="tg-card tg-asset" key={movement.id}><div><strong>{movement.type}</strong><span>{movement.asset?.assetCode || 'Asset'} · {movement.note || '—'}</span></div><time>{new Date(movement.createdAt).toLocaleString('it-IT')}</time></article>)}</section>}
    <p className="tg-footnote">Notifiche sicure tramite il bot · accesso limitato agli amministratori warehouse</p>
  </main>;
}
