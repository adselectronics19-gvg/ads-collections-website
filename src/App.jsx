import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Menu, X, ShieldCheck, Plus, Pencil, Trash2, LogOut, Upload, ImagePlus, ArrowUpRight, Heart, Sparkles, LockKeyhole, RefreshCw } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const WHATSAPP_NUMBER = '918999795326';
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

function sampleProducts() {
  return [
    { id: 'demo-001', name: 'Gulabi Noor Silk Saree', price: 2499, photo1: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85', photo2: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=85', demo: true },
    { id: 'demo-002', name: 'Rose Gold Festive Saree', price: 3199, photo1: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=900&q=85', photo2: 'https://images.unsplash.com/photo-1610030469668-8e9f641aafc4?auto=format&fit=crop&w=900&q=85', demo: true },
    { id: 'demo-003', name: 'Classic Banarasi Elegance', price: 4299, photo1: 'https://images.unsplash.com/photo-1610189012906-4c7c7f6c3d28?auto=format&fit=crop&w=900&q=85', photo2: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85', demo: true },
    { id: 'demo-004', name: 'Pearl Pink Occasion Saree', price: 1899, photo1: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=85', photo2: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=900&q=85', demo: true }
  ];
}

function productCode(id) {
  return String(id || '').startsWith('demo-') ? String(id).toUpperCase() : String(id || '').slice(0, 8).toUpperCase();
}
function whatsappLink(product) {
  const message = `Hello ADS COLLECTIONS!\n\nI want to purchase this saree.\n\nSaree Name: ${product.name}\nPrice: ${money(product.price)}\nProduct Code: ${productCode(product.id)}\n\nPlease contact me regarding this saree.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function Header({ onAdmin, adminMode, onHome }) {
  return <header className="site-header">
    <div className="topline"><span>✦ A little elegance, woven for you ✦</span><span className="topline-right">SAREES • STYLE • CELEBRATION</span></div>
    <div className="nav-wrap">
      <button className="brand" onClick={onHome} aria-label="Go to catalogue">
        <span className="brand-mark">ADS</span><span className="brand-copy"><strong>ADS COLLECTIONS <span>🥻</span></strong><small>THE SAREE BOUTIQUE</small></span>
      </button>
      <div className="nav-actions"><span className="handpicked"><Sparkles size={15}/> Handpicked elegance</span><button className="owner-link" onClick={onAdmin}>{adminMode ? <><X size={16}/> Close dashboard</> : <><LockKeyhole size={15}/> Owner login</>}</button></div>
    </div>
  </header>;
}

function ProductCard({ product, index }) {
  const [photo, setPhoto] = useState(0);
  const [liked, setLiked] = useState(false);
  const photos = [product.photo1, product.photo2].filter(Boolean);
  return <article className="product-card" style={{'--delay': `${Math.min(index, 12) * 55}ms`}}>
    <div className="product-image-wrap">
      <img className="product-image" src={photos[photo] || photos[0]} alt={`${product.name} - view ${photo + 1}`} loading="lazy" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x1000/fff0f5/9d536f?text=ADS+COLLECTIONS'; }} />
      <span className="photo-count">{photo + 1} / 2 photos</span>
      <button className={`heart-btn ${liked ? 'is-liked' : ''}`} onClick={() => setLiked(!liked)} aria-label="Save favourite"><Heart size={17} fill={liked ? 'currentColor' : 'none'}/></button>
      <div className="photo-switcher" aria-label="Choose product photo">
        {photos.map((_, i) => <button key={i} className={photo === i ? 'active' : ''} onClick={() => setPhoto(i)} aria-label={`Show photo ${i + 1}`}/>)}
      </div>
    </div>
    <div className="product-info">
      <div className="product-meta"><span>ADS EXCLUSIVE</span><span>#{productCode(product.id)}</span></div>
      <h3>{product.name}</h3>
      <div className="product-bottom"><strong>{money(product.price)}</strong><a className="buy-button" href={whatsappLink(product)} target="_blank" rel="noreferrer">BUY NOW <ArrowUpRight size={16}/></a></div>
    </div>
  </article>;
}

function AdminPanel({ products, onClose, onReload }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [photo1, setPhoto1] = useState(null);
  const [photo2, setPhoto2] = useState(null);
  const [currentPhoto1, setCurrentPhoto1] = useState('');
  const [currentPhoto2, setCurrentPhoto2] = useState('');
  const file1 = useRef(null); const file2 = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, current) => setSession(current));
    return () => listener.subscription.unsubscribe();
  }, []);

  const startNew = () => { setEditing('new'); setName(''); setPrice(''); setPhoto1(null); setPhoto2(null); setCurrentPhoto1(''); setCurrentPhoto2(''); setError(''); setNotice(''); };
  const startEdit = (p) => { setEditing(p.id); setName(p.name); setPrice(String(p.price)); setPhoto1(null); setPhoto2(null); setCurrentPhoto1(p.photo1); setCurrentPhoto2(p.photo2); setError(''); setNotice(''); };
  const signIn = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) setError('Login failed. Check your email and password, then try again.');
    else setSession(data.session);
  };
  const signOut = async () => { await supabase.auth.signOut(); setSession(null); setEditing(null); };
  const uploadPhoto = async (file, suffix) => {
    if (!file) return null;
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Each image must be smaller than 10 MB.');
    const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
    const path = `${crypto.randomUUID()}-${suffix}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('saree-photos').upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('saree-photos').getPublicUrl(path);
    return data.publicUrl;
  };
  const saveProduct = async (e) => {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (!supabase || !session) throw new Error('Please sign in first.');
      if (!name.trim()) throw new Error('Enter a saree name.');
      if (!Number.isFinite(Number(price)) || Number(price) <= 0) throw new Error('Enter a valid price greater than ₹0.');
      const old = products.find(p => p.id === editing);
      let url1 = photo1 ? await uploadPhoto(photo1, 'front') : currentPhoto1;
      let url2 = photo2 ? await uploadPhoto(photo2, 'detail') : currentPhoto2;
      if (!url1 || !url2) throw new Error('Please upload exactly two photos for this saree.');
      const record = { name: name.trim(), price: Number(price), photo1: url1, photo2: url2 };
      let result;
      if (editing === 'new') result = await supabase.from('saree_products').insert(record);
      else result = await supabase.from('saree_products').update(record).eq('id', editing);
      if (result.error) throw result.error;
      setNotice(editing === 'new' ? 'Saree added to your catalogue.' : 'Product updated successfully.');
      setEditing(null); setPhoto1(null); setPhoto2(null);
      await onReload();
    } catch (err) { setError(err.message || 'Could not save this product. Check your Supabase setup.'); }
    finally { setBusy(false); }
  };
  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete “${p.name}” from the catalogue? This cannot be undone.`)) return;
    setBusy(true); setError(''); setNotice('');
    const { error: deleteError } = await supabase.from('saree_products').delete().eq('id', p.id);
    setBusy(false);
    if (deleteError) setError(deleteError.message); else { setNotice('Product deleted.'); await onReload(); }
  };

  return <div className="admin-overlay">
    <section className="admin-panel">
      <div className="admin-heading"><div><span className="eyebrow">PRIVATE AREA</span><h2>Owner dashboard</h2><p>Manage your saree collection securely.</p></div><button className="icon-button" onClick={onClose} aria-label="Close dashboard"><X/></button></div>
      {!supabase ? <div className="setup-message"><ShieldCheck size={28}/><h3>Connect your private catalogue</h3><p>This website is ready to connect to Supabase. Add your project URL and publishable/anon key in a <code>.env</code> file, then run the SQL setup included with this project. Your secret service-role key must never be added here.</p></div> :
      !session ? <form className="login-form" onSubmit={signIn}><div className="login-icon"><LockKeyhole/></div><h3>Welcome back</h3><p>Sign in with the owner's Supabase account.</p><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required placeholder="owner@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required placeholder="Your password"/></label>{error && <p className="form-error">{error}</p>}<button className="primary-button full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button><small>Customer pages cannot create or edit products. Only an authenticated owner can manage the catalogue.</small></form> :
      <><div className="dashboard-toolbar"><div className="stat-box"><strong>{products.filter(p=>!p.demo).length}</strong><span>Products online</span></div><button className="primary-button" onClick={startNew}><Plus size={17}/> Add saree</button><button className="quiet-button" onClick={onReload}><RefreshCw size={16}/> Refresh</button><button className="quiet-button" onClick={signOut}><LogOut size={16}/> Sign out</button></div>
        {notice && <p className="form-success">{notice}</p>}{error && <p className="form-error">{error}</p>}
        {editing !== null && <form className="product-form" onSubmit={saveProduct}><div className="form-title"><h3>{editing === 'new' ? 'Add a new saree' : 'Edit saree'}</h3><button type="button" className="quiet-button" onClick={()=>setEditing(null)}>Cancel</button></div>
          <label>Saree name<input value={name} onChange={e=>setName(e.target.value)} maxLength="120" required placeholder="e.g. Gulabi Noor Silk Saree"/></label>
          <label>Price (₹)<input value={price} onChange={e=>setPrice(e.target.value)} type="number" min="1" step="1" required placeholder="2499"/></label>
          <div className="upload-grid">
            <div className="upload-slot"><input ref={file1} type="file" accept="image/*" onChange={e=>setPhoto1(e.target.files?.[0] || null)}/><button type="button" onClick={()=>file1.current?.click()}><ImagePlus/><strong>Photo 1</strong><span>{photo1?.name || (currentPhoto1 ? 'Current photo saved · tap to replace' : 'Choose first photo')}</span></button>{currentPhoto1 && !photo1 && <img src={currentPhoto1} alt="Current first product photo"/>}</div>
            <div className="upload-slot"><input ref={file2} type="file" accept="image/*" onChange={e=>setPhoto2(e.target.files?.[0] || null)}/><button type="button" onClick={()=>file2.current?.click()}><ImagePlus/><strong>Photo 2</strong><span>{photo2?.name || (currentPhoto2 ? 'Current photo saved · tap to replace' : 'Choose second photo')}</span></button>{currentPhoto2 && !photo2 && <img src={currentPhoto2} alt="Current second product photo"/>}</div>
          </div><p className="field-note">Upload exactly two images. JPG, PNG or WebP up to 10 MB each.</p>{error && <p className="form-error">{error}</p>}<button className="primary-button full" disabled={busy}><Upload size={16}/>{busy ? 'Saving product…' : 'Save product'}</button>
        </form>}
        <div className="admin-products"><h3>All products <span>{products.filter(p=>!p.demo).length} total</span></h3>{products.filter(p=>!p.demo).length === 0 ? <div className="empty-state">No products yet. Select “Add saree” to upload your first product.</div> : products.filter(p=>!p.demo).map(p=><div className="admin-product-row" key={p.id}><img src={p.photo1} alt=""/><div className="admin-product-copy"><strong>{p.name}</strong><span>{money(p.price)} · #{productCode(p.id)}</span></div><button className="icon-button" onClick={()=>startEdit(p)} aria-label={`Edit ${p.name}`}><Pencil size={17}/></button><button className="icon-button danger" onClick={()=>deleteProduct(p)} aria-label={`Delete ${p.name}`}><Trash2 size={17}/></button></div>)}</div>
      </>}
    </section>
  </div>;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadProducts = async () => {
    if (!supabase) { setProducts(sampleProducts()); setLoading(false); return; }
    setLoading(true); setLoadError('');
    const { data, error } = await supabase.from('saree_products').select('id,name,price,photo1,photo2,created_at').order('created_at', { ascending: false }).limit(600);
    if (error) {
      setLoadError('Could not load the live catalogue. Check the Supabase setup in the project README.');
      setProducts([]);
    } else setProducts(data || []);
    setLoading(false);
  };
  useEffect(() => { loadProducts(); }, []);
  const filtered = useMemo(() => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || productCode(p.id).toLowerCase().includes(query.toLowerCase())), [products, query]);

  return <div className="app-shell">
    <Header onAdmin={()=>setAdminOpen(v=>!v)} adminMode={adminOpen} onHome={()=>{setAdminOpen(false);window.scrollTo({top:0,behavior:'smooth'});}}/>
    <main>
      <section className="hero">
        <div className="hero-decoration decor-one">✿</div><div className="hero-decoration decor-two">✧</div>
        <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-line"/> THE ART OF INDIAN ELEGANCE <span className="eyebrow-line"/></span>
          <h1>Every drape tells<br/>a <em>beautiful</em> story.</h1><p>Discover sarees made for your most special moments — timeless tradition, graceful details, and a little everyday magic.</p>
          <a className="hero-cta" href="#collection">EXPLORE THE COLLECTION <span>↓</span></a>
          <div className="hero-notes"><span><i>✦</i> Carefully curated</span><span><i>✦</i> Easy WhatsApp ordering</span></div>
        </div>
        <div className="hero-art"><div className="hero-photo-frame"><img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90" alt="Elegant Indian saree styling"/></div><div className="round-stamp"><span>MADE FOR</span><strong>YOUR<br/>MOMENTS</strong><small>✧ ADS ✧</small></div><div className="hero-caption">A timeless classic <span>♡</span></div></div>
      </section>
      <section className="benefit-strip"><div><span className="benefit-icon">✧</span><span><strong>Curated with love</strong><small>Styles for every occasion</small></span></div><div><span className="benefit-icon">♡</span><span><strong>Personal assistance</strong><small>We’re one WhatsApp away</small></span></div><div><span className="benefit-icon">❀</span><span><strong>Tradition, reimagined</strong><small>Find your next favourite</small></span></div></section>
      <section id="collection" className="collection-section">
        <div className="section-heading"><div><span className="eyebrow">THE BOUTIQUE EDIT</span><h2>Find your <em>forever</em> saree</h2><p>Beautiful drapes, selected just for you.</p></div><label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search sarees..." aria-label="Search sarees"/>{query && <button onClick={()=>setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label></div>
        {loadError && <div className="notice-banner">{loadError}</div>}
        {!supabase && <div className="demo-banner"><Sparkles size={15}/> Preview catalogue — connect Supabase to publish and manage your own products.</div>}
        {loading ? <div className="loading-state"><span className="spinner"/> Gathering your beautiful drapes…</div> :
        filtered.length ? <div className="product-grid">{filtered.map((product,index)=><ProductCard key={product.id} product={product} index={index}/>)}</div> :
        <div className="empty-state public-empty"><div>♡</div><h3>{query ? 'No matching sarees found' : 'Your collection is getting ready'}</h3><p>{query ? 'Try another search term.' : 'Please check back soon for our latest styles.'}</p></div>}
        <div className="collection-footnote"><span>✧</span> Your next favourite drape is waiting <span>✧</span></div>
      </section>
      <section className="whatsapp-band"><div className="whatsapp-flower">❀</div><div><span className="eyebrow">A LITTLE HELP, JUST A MESSAGE AWAY</span><h2>Need help choosing?</h2><p>Message us on WhatsApp. We’d love to help you find your perfect saree.</p></div><a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello ADS COLLECTIONS! I would like help choosing a saree.')}`} target="_blank" rel="noreferrer" className="whatsapp-cta">CHAT WITH US <ArrowUpRight size={17}/></a></section>
    </main>
    <footer><a className="footer-brand" href="#top" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});}}>ADS COLLECTIONS 🥻</a><span>Grace in every drape. Love in every detail.</span><small>© {new Date().getFullYear()} ADS COLLECTIONS. All rights reserved.</small></footer>
    {adminOpen && <AdminPanel products={products} onClose={()=>setAdminOpen(false)} onReload={loadProducts}/>}
  </div>;
}