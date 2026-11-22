import { useEffect, useMemo, useState } from 'react';
import { telegramRequest } from '../api/telegramWarehouse';

const webApp = () => window.Telegram?.WebApp;

function scanSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.24);
  } catch { /* Audio is optional in Telegram webviews. */ }
}

const statusLabel = { AVAILABLE: 'Disponibile', RENTED: 'Noleggiato', MAINTENANCE: 'Manutenzione', LOST: 'Smarrito', DISMISSED: 'Dismesso' };

export default function TelegramWarehouse() {
  const [tab, setTab] = useState('home');
  const [stats, setStats] = useState(null); const [assets, setAssets] = useState([]); const [rentals, setRentals] = useState([]); const [movements, setMovements] = useState([]);
  const [query, setQuery] = useState(''); const [error, setError] = useState(''); const [selectedAsset, setSelectedAsset] = useState(null); const [showRental, setShowRental] = useState(false); const [editing, setEditing] = useState(false);
  const [rentalForm, setRentalForm] = useState({ customerName: '', customerCompany: '', customerEmail: '', customerPhone: '', expectedReturnAt: '', notes: '', assetCodes: [] });
  const filteredAssets = useMemo(() => assets.filter((asset) => `${asset.name} ${asset.assetCode} ${asset.category || ''}`.toLowerCase().includes(query.toLowerCase())), [assets, query]);

  async function load() {
    try {
      setError('');
      const [nextStats, nextAssets, nextRentals, nextMovements] = await Promise.all([
        telegramRequest('/telegram/warehouse/overview'), telegramRequest('/telegram/warehouse/assets'), telegramRequest('/telegram/warehouse/rentals'), telegramRequest('/telegram/warehouse/movements'),
      ]);
      setStats(nextStats); setAssets(nextAssets); setRentals(nextRentals); setMovements(nextMovements);
    } catch (err) { setError(err.message); }
  }

  useEffect(() => {
    const app = webApp(); app?.ready(); app?.expand(); app?.setHeaderColor?.('#09090B'); app?.setBackgroundColor?.('#09090B'); app?.BackButton?.show?.();
    const theme = app?.themeParams || {}; if (theme.bg_color) document.documentElement.style.setProperty('--tg-bg', theme.bg_color); if (theme.text_color) document.documentElement.style.setProperty('--tg-text', theme.text_color);
    app?.MainButton?.setText?.('Scansiona QR'); app?.MainButton?.show?.(); app?.MainButton?.onClick?.(scan);
    load(); return () => { app?.BackButton?.hide?.(); app?.MainButton?.hide?.(); };
  }, []);

  function scan() {
    const app = webApp();
    const onCode = async (code) => { if (!code) return; scanSound(); app?.HapticFeedback?.notificationOccurred?.('success'); app?.closeScanQrPopup?.(); setQuery(code); setTab('assets'); await load(); };
    if (app?.showScanQrPopup) app.showScanQrPopup({ text: 'Scansiona il QR dell’asset' }, onCode);
    else { const code = window.prompt('Inserisci il codice asset'); if (code) onCode(code); }
  }

  async function returnAsset(asset) {
    if (!window.confirm(`Registrare la restituzione di ${asset.name}?`)) return;
    try { await telegramRequest(`/telegram/warehouse/assets/${encodeURIComponent(asset.assetCode)}/return`, { method: 'POST' }); webApp()?.HapticFeedback?.notificationOccurred?.('success'); setSelectedAsset(null); await load(); }
    catch (err) { setError(err.message); webApp()?.HapticFeedback?.notificationOccurred?.('error'); }
  }

  function openRental(asset) { setRentalForm((current) => ({ ...current, assetCodes: asset ? [asset.assetCode] : current.assetCodes })); setSelectedAsset(null); setShowRental(true); }

  async function createRental(event) {
    event.preventDefault();
    try { await telegramRequest('/telegram/warehouse/rentals', { method: 'POST', body: JSON.stringify(rentalForm) }); setShowRental(false); setRentalForm({ customerName: '', customerCompany: '', customerEmail: '', customerPhone: '', expectedReturnAt: '', notes: '', assetCodes: [] }); await load(); }
    catch (err) { setError(err.message); }
  }

  async function saveAsset(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const data = { name: form.get('name'), description: form.get('description'), category: form.get('category'), serialNumber: form.get('serialNumber') };
    try { const updated = await telegramRequest(`/telegram/warehouse/assets/${encodeURIComponent(selectedAsset.assetCode)}`, { method: 'PATCH', body: JSON.stringify(data) }); setAssets((current) => current.map((asset) => asset.id === updated.id ? updated : asset)); setSelectedAsset(updated); setEditing(false); }
    catch (err) { setError(err.message); }
  }

  async function deleteAsset(asset) {
    if (!window.confirm(`Eliminare o dismettere ${asset.name}?`)) return;
    try { await telegramRequest(`/telegram/warehouse/assets/${encodeURIComponent(asset.assetCode)}`, { method: 'DELETE' }); setSelectedAsset(null); await load(); }
    catch (err) { setError(err.message); }
  }

  if (error && !stats) return <main className="tg-page"><div className="tg-card tg-empty"><span className="tg-kicker">INFINITY WAREHOUSE</span><h1>Account non collegato</h1><p>{error}</p><p className="tg-muted">Genera un codice dal dashboard e invialo al bot con <code>/link CODICE</code>.</p></div></main>;

  return <main className="tg-page">
    <header className="tg-header"><div><span className="tg-kicker">INFINITY EVENTOS</span><h1>Warehouse</h1><p className="tg-subtitle">Attrezzature, noleggi e movimenti</p></div><button className="tg-icon" onClick={load} aria-label="Aggiorna">↻</button></header>
    {error && <div className="tg-error">{error}</div>}

    {tab === 'home' && <section className="tg-section"><div className="tg-hero"><div><span className="tg-kicker">PANORAMICA OPERATIVA</span><h2>Il tuo magazzino</h2><p>Controlla disponibilità e attività in un colpo d’occhio.</p></div><span className="tg-hero-orb">∞</span></div><div className="tg-grid">{[['total', 'Totale'], ['available', 'Disponibili'], ['rented', 'Noleggiati'], ['activeRentals', 'Noleggi attivi']].map(([key, label]) => <div className="tg-stat" key={key}><strong>{stats?.[key] ?? '—'}</strong><span>{label}</span></div>)}</div><div className="tg-actions"><button className="tg-main" onClick={scan}>Scansiona asset</button><button className="tg-secondary" onClick={() => openRental(null)}>＋ Nuovo noleggio</button></div><div className="tg-card tg-recent"><div className="tg-card-heading"><strong>Attività recente</strong><button onClick={() => setTab('movements')}>Vedi tutto</button></div>{movements.slice(0, 3).map((movement) => <div className="tg-row" key={movement.id}><span className="tg-dot" /><div><strong>{movement.type}</strong><span>{movement.asset?.name || movement.asset?.assetCode || 'Asset'} · {movement.note || 'Aggiornamento magazzino'}</span></div><time>{new Date(movement.createdAt).toLocaleDateString('it-IT')}</time></div>)}</div></section>}

    {tab === 'assets' && <section className="tg-section"><div className="tg-section-title"><div><span className="tg-kicker">INVENTARIO</span><h2>Asset</h2></div><button className="tg-round-action" onClick={scan}>⌾</button></div><div className="tg-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca codice o nome" /><button onClick={scan}>QR</button></div><div className="tg-list">{filteredAssets.map((asset) => <button className="tg-card tg-asset" key={asset.id} onClick={() => { setSelectedAsset(asset); setEditing(false); }}><span className="tg-asset-icon">□</span><span className="tg-asset-copy"><strong>{asset.name}</strong><span>{asset.assetCode} · {statusLabel[asset.status] || asset.status}</span></span><span className={`tg-status tg-status-${asset.status.toLowerCase()}`}>{statusLabel[asset.status] || asset.status}</span><span className="tg-chevron">›</span></button>)}{!filteredAssets.length && <p className="tg-muted">Nessun asset trovato.</p>}</div></section>}

    {tab === 'rentals' && <section className="tg-section"><div className="tg-section-title"><div><span className="tg-kicker">OPERATIVITÀ</span><h2>Noleggi</h2></div><button className="tg-round-action" onClick={() => openRental(null)}>＋</button></div><div className="tg-list">{rentals.map((rental) => <div className="tg-card tg-rental" key={rental.id}><div><strong>{rental.customerName}</strong><span>{rental.items?.length || 0} asset · {rental.status === 'ACTIVE' ? 'Attivo' : 'Chiuso'}</span></div><time>{new Date(rental.rentedAt).toLocaleDateString('it-IT')}</time></div>)}{!rentals.length && <p className="tg-muted">Nessun noleggio registrato.</p>}</div></section>}

    {tab === 'movements' && <section className="tg-section"><div className="tg-section-title"><div><span className="tg-kicker">STORICO</span><h2>Movimenti</h2></div></div><div className="tg-list">{movements.map((movement) => <div className="tg-card tg-rental" key={movement.id}><div><strong>{movement.type}</strong><span>{movement.asset?.assetCode || 'Asset'} · {movement.note || '—'}</span></div><time>{new Date(movement.createdAt).toLocaleString('it-IT')}</time></div>)}</div></section>}

    <nav className="tg-bottom-nav">{[['home', '⌂', 'Home'], ['assets', '□', 'Asset'], ['rentals', '↗', 'Noleggi'], ['movements', '≡', 'Movimenti']].map(([key, icon, label]) => <button className={tab === key ? 'active' : ''} onClick={() => setTab(key)} key={key}><span>{icon}</span>{label}</button>)}</nav>

    {selectedAsset && <div className="tg-sheet-backdrop" onClick={() => setSelectedAsset(null)}><section className="tg-sheet" onClick={(event) => event.stopPropagation()}><div className="tg-sheet-handle" /><div className="tg-sheet-header"><div><span className="tg-kicker">DETTAGLIO ASSET</span><h2>{selectedAsset.name}</h2><p>{selectedAsset.assetCode}</p></div><button className="tg-close" onClick={() => setSelectedAsset(null)}>×</button></div>{editing ? <form className="tg-form" onSubmit={saveAsset}>{[['name', 'Nome', selectedAsset.name], ['category', 'Categoria', selectedAsset.category || ''], ['serialNumber', 'Numero seriale', selectedAsset.serialNumber || '']].map(([name, label, value]) => <label key={name}>{label}<input name={name} defaultValue={value} required={name === 'name'} /></label>)}<label>Descrizione<textarea name="description" defaultValue={selectedAsset.description || ''} /></label><div className="tg-actions"><button className="tg-secondary" type="button" onClick={() => setEditing(false)}>Annulla</button><button className="tg-main" type="submit">Salva modifiche</button></div></form> : <><div className="tg-detail-grid"><div><span>Stato</span><strong>{statusLabel[selectedAsset.status] || selectedAsset.status}</strong></div><div><span>Categoria</span><strong>{selectedAsset.category || '—'}</strong></div><div><span>Seriale</span><strong>{selectedAsset.serialNumber || '—'}</strong></div><div><span>Descrizione</span><strong>{selectedAsset.description || '—'}</strong></div></div><div className="tg-sheet-actions"><button onClick={() => setEditing(true)}>Modifica</button>{selectedAsset.status === 'AVAILABLE' && <button onClick={() => openRental(selectedAsset)}>Noleggia</button>}{selectedAsset.status === 'RENTED' && <button onClick={() => returnAsset(selectedAsset)}>Restituisci</button>}<button className="danger" onClick={() => deleteAsset(selectedAsset)}>Elimina</button></div></>}</section></div>}
    {showRental && <div className="tg-sheet-backdrop" onClick={() => setShowRental(false)}><form className="tg-sheet" onClick={(event) => event.stopPropagation()} onSubmit={createRental}><div className="tg-sheet-handle" /><div className="tg-sheet-header"><div><span className="tg-kicker">NUOVA OPERAZIONE</span><h2>Nuovo noleggio</h2></div><button type="button" className="tg-close" onClick={() => setShowRental(false)}>×</button></div><div className="tg-form"><label>Cliente<input required value={rentalForm.customerName} onChange={(event) => setRentalForm({ ...rentalForm, customerName: event.target.value })} placeholder="Nome cliente" /></label><label>Azienda<input value={rentalForm.customerCompany} onChange={(event) => setRentalForm({ ...rentalForm, customerCompany: event.target.value })} placeholder="Azienda (opzionale)" /></label><label>Telefono<input value={rentalForm.customerPhone} onChange={(event) => setRentalForm({ ...rentalForm, customerPhone: event.target.value })} placeholder="Telefono" /></label><label>Asset disponibili<select multiple required value={rentalForm.assetCodes} onChange={(event) => setRentalForm({ ...rentalForm, assetCodes: [...event.target.selectedOptions].map((option) => option.value) })}>{assets.filter((asset) => asset.status === 'AVAILABLE').map((asset) => <option key={asset.assetCode} value={asset.assetCode}>{asset.assetCode} · {asset.name}</option>)}</select></label><label>Note<textarea value={rentalForm.notes} onChange={(event) => setRentalForm({ ...rentalForm, notes: event.target.value })} placeholder="Note operative" /></label><button className="tg-main" type="submit">Conferma noleggio</button></div></form></div>}
  </main>;
}
