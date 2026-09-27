import { useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowRight,
  ChevronDown,
  CircleCheck,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Navigation,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import menuPosterImage from '@assets/IMG-20260927-WA0035_1790541464818.jpg';
import lasagneImage from '@assets/IMG-20260927-WA0014_1790540742164.jpg';
import crepeImage from '@assets/IMG-20260927-WA0020_1790540742181.jpg';
import cornDogImage from '@assets/IMG-20260927-WA0021_1790540742201.jpg';
import picapolloImage from '@assets/IMG-20260927-WA0031_1790541928943.jpg';
import doughnutImage from '@assets/IMG-20260927-WA0015_1790540742084.jpg';
import savoryCrepeImage from '@assets/IMG-20260927-WA0012_1790540742325.jpg';
import spiralImage from '@assets/IMG-20260927-WA0022_1790540742234.jpg';
import gratinImage from '@assets/IMG-20260927-WA0026_1790540742295.jpg';
import pateImage from '@assets/IMG-20260927-WA0029_1790540742310.jpg';

const queryClient = new QueryClient();

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceMax?: number;
  unit: string;
  image: string;
  imagePosition?: string;
  featured?: boolean;
};

const BUSINESS = {
  name: 'Les délices de Stess',
  whatsapp: '50956787392',
  phones: ['509 5678 7392', '509 3509 6621'],
  address: 'Lamentin 52 rue prolongée (en face ruelle Victor) #19',
};

const PRODUCTS: Product[] = [
  { id: 'mini-crepe-jambon', name: 'Mini crêpe au jambon', description: 'Une mini crêpe salée, garnie de jambon et préparée maison.', category: 'Crêpes', price: 250, unit: "l’unité", image: savoryCrepeImage, featured: true },
  { id: 'crepe-viande', name: 'Crêpe à la viande moulue', description: 'Une crêpe généreuse à la viande moulue, comme sur l’affiche du menu.', category: 'Crêpes', price: 500, unit: "l’unité", image: crepeImage, featured: true },
  { id: 'picapollo', name: 'Picapollo', description: 'Morceaux de poulet frits, croustillants et servis avec un accompagnement gourmand. Le prix dépend de la taille.', category: 'Snacks', price: 500, priceMax: 750, unit: 'selon la taille', image: picapolloImage, featured: true },
  { id: 'corn-dog', name: 'Corn dog', description: 'Une bouchée panée, croustillante et à déguster bien chaude.', category: 'Snacks', price: 150, unit: "l’unité", image: cornDogImage },
  { id: 'spirale-jambon', name: 'Spirale au jambon', description: 'Une spirale au jambon, dorée et savoureuse.', category: 'Snacks', price: 150, unit: "l’unité", image: spiralImage },
  { id: 'lasagne', name: 'Lasagne par tranche', description: 'Des couches généreuses, une sauce mijotée et un gratiné doré.', category: 'Plats salés', price: 250, unit: 'la tranche', image: lasagneImage, featured: true },
  { id: 'pate', name: 'Pâté', description: 'Un pâté doré, tendre et savoureux.', category: 'Bouchées', price: 100, unit: "l’unité", image: pateImage },
  { id: 'gratin', name: 'Gratiné par tranche', description: 'Fondant à l’intérieur, doré sur le dessus, servi à la tranche.', category: 'Plats salés', price: 250, unit: 'la tranche', image: gratinImage },
];

const CATEGORIES = ['Tout', 'Crêpes', 'Snacks', 'Plats salés', 'Bouchées'];

function formatHTG(value: number) {
  return `${new Intl.NumberFormat('fr-FR').format(value)} HTG`;
}

function formatProductPrice(product: Product) {
  return product.priceMax
    ? `${formatHTG(product.price)} – ${formatHTG(product.priceMax)}`
    : formatHTG(product.price);
}

function formatProductTotal(product: Product, quantity: number) {
  if (!product.priceMax) return formatHTG(product.price * quantity);
  return `${formatHTG(product.price * quantity)} – ${formatHTG(product.priceMax * quantity)}`;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tout');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', delivery: 'Livraison', note: '' });
  const [formError, setFormError] = useState('');

  const visibleProducts = useMemo(() => {
    const normalized = query.toLocaleLowerCase('fr');
    return PRODUCTS.filter((product) => {
      const categoryMatch = category === 'Tout' || product.category === category;
      const searchMatch = !normalized || `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase('fr').includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [category, query]);

  const cartLines = useMemo(() => Object.entries(cart)
    .map(([id, quantity]) => ({ product: PRODUCTS.find((item) => item.id === id), quantity }))
    .filter((line): line is { product: Product; quantity: number } => Boolean(line.product && line.quantity > 0)), [cart]);
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const cartTotalMax = cartLines.reduce((sum, line) => sum + (line.product.priceMax ?? line.product.price) * line.quantity, 0);

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta);
      const updated = { ...current };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  };

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  };

  const openCheckout = () => {
    if (cartLines.length === 0) {
      showNotice('Votre panier est vide pour le moment.');
      return;
    }
    setFormError('');
    setCheckoutOpen(true);
  };

  const sendWhatsApp = () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setFormError('Merci de renseigner votre nom, votre téléphone et votre adresse.');
      return;
    }
    const items = cartLines.map(({ product, quantity }) => `• ${product.name} x${quantity} — ${formatProductTotal(product, quantity)}`).join('\n');
    const message = [
      `Bonjour ${BUSINESS.name},`,
      '',
      'Je souhaite passer la commande suivante :',
      items,
      '',
      `Total estimé : ${cartTotalMax === cartTotal ? formatHTG(cartTotal) : `${formatHTG(cartTotal)} – ${formatHTG(cartTotalMax)}`}`,
      `Nom : ${customer.name}`,
      `Téléphone : ${customer.phone}`,
      `${customer.delivery} : ${customer.address}`,
      customer.note.trim() ? `Note : ${customer.note}` : '',
      '',
      'Merci de me confirmer la disponibilité et le délai.',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setCheckoutOpen(false);
    setCartOpen(false);
    showNotice('Votre commande est prête à être envoyée sur WhatsApp.');
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-background">
      <div className="bg-[#173f35] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f8e6b3] sm:text-xs" data-testid="banner-service">
        Préparé à Lamentin · Commande directe · Livraison disponible
      </div>

      <header className="sticky top-0 z-40 border-b border-[#e6d9c7] bg-[#fffaf1]/95 backdrop-blur-xl" data-testid="site-header">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex min-w-0 items-center gap-3 text-left" data-testid="button-brand">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#b33d25]/25 bg-[#b33d25] text-[#fff8e8] shadow-[0_5px_16px_rgba(135,44,24,.2)]">
              <Sparkles size={20} strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-[19px] font-semibold leading-none text-[#5c2117] sm:text-[21px]">Les délices <em className="not-italic text-[#b33d25]">de Stess</em></span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#8d7565]">Fait maison à Lamentin</span>
            </span>
          </button>

          <nav className="ml-auto hidden items-center gap-7 text-sm font-semibold text-[#6f5a4e] md:flex" data-testid="desktop-navigation">
            <button type="button" onClick={scrollToMenu} className="transition-colors hover:text-[#b33d25]" data-testid="link-menu">Le menu</button>
            <button type="button" onClick={() => document.getElementById('histoire')?.scrollIntoView({ behavior: 'smooth' })} className="transition-colors hover:text-[#b33d25]" data-testid="link-story">Notre façon de faire</button>
            <button type="button" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="transition-colors hover:text-[#b33d25]" data-testid="link-contact">Nous trouver</button>
          </nav>

          <button type="button" onClick={() => setCartOpen(true)} className="relative ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#173f35] text-[#fff8e8] transition-transform hover:scale-105" aria-label="Ouvrir le panier" data-testid="button-open-cart">
            <ShoppingBag size={19} strokeWidth={1.8} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-[#fffaf1] bg-[#f1b943] px-1 text-[10px] font-bold text-[#3c2516]" data-testid="badge-cart-count">{cartCount}</span>}
          </button>
          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-full border border-[#e6d9c7] text-[#5c2117] md:hidden" aria-label="Ouvrir le menu" data-testid="button-mobile-menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-[#e6d9c7] bg-[#fffaf1] px-5 py-4 md:hidden" data-testid="mobile-navigation">
            <div className="flex flex-col gap-3 text-sm font-semibold text-[#6f5a4e]">
              <button type="button" onClick={scrollToMenu} className="text-left" data-testid="mobile-link-menu">Le menu</button>
              <button type="button" onClick={() => { document.getElementById('histoire')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left" data-testid="mobile-link-story">Notre façon de faire</button>
              <button type="button" onClick={() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left" data-testid="mobile-link-contact">Nous trouver</button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="texture relative overflow-hidden bg-[#f1dfbd] px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8" data-testid="hero-section">
          <div className="absolute -right-28 top-16 h-72 w-72 rounded-full bg-[#e7aa3d]/25 blur-3xl" />
          <div className="absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-[#b33d25]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-10">
            <div className="fade-up max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b33d25]/20 bg-[#fff8e8]/65 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.17em] text-[#8b3a25]" data-testid="text-hero-eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b33d25]" />
                Le goût du fait maison
              </div>
              <h1 className="font-display text-[clamp(3.7rem,8vw,7rem)] font-semibold leading-[.87] tracking-[-.045em] text-[#5c2117]" data-testid="heading-hero">
                Des petites<br /><span className="text-[#b33d25]">faims</span>,<br />de grands souvenirs.
              </h1>
              <p className="mt-7 max-w-md text-[16px] leading-7 text-[#765d4d] sm:text-lg">Crêpes bien garnies, plats réconfortants et douceurs sorties de notre cuisine. À Lamentin, Stess prépare comme pour les siens.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={scrollToMenu} className="group inline-flex items-center gap-3 rounded-full bg-[#b33d25] px-5 py-3.5 text-sm font-bold text-[#fff8e8] shadow-[0_8px_20px_rgba(135,44,24,.2)] transition-all hover:bg-[#8e2f20]" data-testid="button-hero-menu">
                  Découvrir le menu <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button type="button" onClick={() => setCartOpen(true)} className="inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold text-[#6b3324] transition-colors hover:bg-[#fff8e8]/70" data-testid="button-hero-cart">
                  <ShoppingBag size={17} /> Voir mon panier
                </button>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#b33d25]/15 pt-5 text-xs font-semibold text-[#806857]" data-testid="text-hero-details">
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-[#b33d25]" /> Lamentin 52</span>
                <span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-[#b33d25]" /> Livraison disponible</span>
              </div>
            </div>

            <div className="relative mx-auto h-[380px] w-full max-w-[580px] sm:h-[500px] lg:h-[570px]" data-testid="hero-food-collage">
              <div className="absolute left-[4%] top-[13%] h-[65%] w-[56%] rotate-[-7deg] overflow-hidden rounded-[2rem] border-[10px] border-[#fff8e8] shadow-[0_24px_50px_rgba(80,39,21,.22)] sm:border-[13px]">
                <img src={savoryCrepeImage} alt="Crêpe complète faite maison" className="h-full w-full object-cover" data-testid="img-hero-crepe" />
              </div>
              <div className="absolute bottom-[2%] right-[4%] h-[56%] w-[54%] rotate-[5deg] overflow-hidden rounded-[2rem] border-[10px] border-[#fff8e8] shadow-[0_24px_50px_rgba(80,39,21,.22)] sm:border-[13px]">
                <img src={lasagneImage} alt="Lasagne maison par tranche" className="h-full w-full object-cover" data-testid="img-hero-lasagne" />
              </div>
              <div className="absolute right-[4%] top-[4%] grid h-24 w-24 rotate-12 place-items-center rounded-full bg-[#173f35] text-center text-[#f9e6b1] shadow-[0_12px_25px_rgba(23,63,53,.25)] sm:h-32 sm:w-32" data-testid="badge-hero-quality">
                <span className="font-display text-xl leading-none sm:text-2xl">Fait<br />avec cœur</span>
              </div>
              <div className="absolute bottom-[16%] left-[3%] rounded-xl bg-[#fff8e8] px-3 py-2 text-xs font-bold text-[#5c2117] shadow-[0_10px_22px_rgba(80,39,21,.16)] sm:bottom-[12%]" data-testid="badge-hero-fresh">
                <span className="mb-1 block text-[9px] uppercase tracking-[.16em] text-[#a87950]">Aujourd’hui</span>
                Du chaud, du bon
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#e6d9c7] bg-[#fffaf1] px-4 py-5 sm:px-6 lg:px-8" data-testid="trust-strip">
          <div className="mx-auto grid max-w-[1240px] gap-5 sm:grid-cols-3 sm:gap-8">
            <TrustItem icon={<CircleCheck size={18} />} title="Préparé avec soin" text="Des recettes simples et généreuses, comme à la maison." />
            <TrustItem icon={<Clock3 size={18} />} title="Sur commande" text="On vous confirme la disponibilité et le moment de retrait." />
            <TrustItem icon={<MessageCircle size={18} />} title="Échange direct" text="Une question ? Stess vous répond directement sur WhatsApp." />
          </div>
        </section>

        <section className="bg-[#fffaf1] px-4 py-12 sm:px-6 lg:px-8" data-testid="menu-poster-section">
          <div className="mx-auto grid max-w-[980px] items-center gap-8 rounded-[2rem] border border-[#e6d9c7] bg-[#f6eddf] p-5 shadow-[0_18px_40px_rgba(80,39,21,.08)] sm:grid-cols-[.65fr_1fr] sm:p-8">
            <div className="max-w-sm">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b33d25]">L’affiche de la maison</div>
              <h2 className="font-display text-3xl font-semibold leading-[1.02] tracking-[-.03em] text-[#5c2117] sm:text-4xl">Les prix du menu, en un coup d’œil.</h2>
              <p className="mt-4 text-sm leading-6 text-[#806e61]">Retrouvez ici l’affiche fournie par Les délices de Stess. Le catalogue ci-dessous reprend les mêmes noms et les mêmes tarifs.</p>
              <p className="mt-4 text-xs font-semibold leading-5 text-[#9a765d]">Le Picapollo est proposé de 500 à 750 HTG selon la taille. La confirmation finale se fait directement avec la maison.</p>
            </div>
            <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[1.25rem] border-[6px] border-[#fff8e8] bg-[#251815] shadow-[0_16px_30px_rgba(53,25,15,.18)]">
              <img src={menuPosterImage} alt="Affiche officielle du menu Les délices de Stess avec les noms et les prix" className="block h-auto w-full" data-testid="img-menu-poster" />
            </div>
          </div>
        </section>

        <section id="menu" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" data-testid="menu-section">
          <div className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b33d25]" data-testid="text-menu-eyebrow">À la carte</div>
              <h2 className="font-display text-4xl font-semibold tracking-[-.03em] text-[#5c2117] sm:text-5xl" data-testid="heading-menu">Ce qui vous ferait plaisir ?</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#806e61]">Choisissez vos préférés, ajustez les quantités et envoyez-nous votre sélection en quelques clics.</p>
            </div>
            <div className="relative w-full md:w-[280px]">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8372]" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une gourmandise" className="h-12 w-full rounded-full border border-[#dfcfbd] bg-[#fffdf8] pl-11 pr-4 text-sm outline-none transition-shadow placeholder:text-[#ad9988] focus:border-[#b33d25] focus:ring-4 focus:ring-[#b33d25]/10" aria-label="Rechercher dans le menu" data-testid="input-search-products" />
            </div>
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-1" data-testid="category-filters">
            {CATEGORIES.map((item) => (
              <button type="button" key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold transition-all ${category === item ? 'bg-[#173f35] text-[#fff8e8] shadow-[0_6px_14px_rgba(23,63,53,.16)]' : 'border border-[#dfcfbd] bg-[#fffaf1] text-[#806e61] hover:border-[#b33d25] hover:text-[#b33d25]'}`} data-testid={`button-category-${item.toLowerCase().replaceAll(' ', '-')}`}>
                {item}
              </button>
            ))}
          </div>

          {visibleProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="product-grid">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} quantity={cart[product.id] ?? 0} onChange={changeQuantity} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d9c7b2] bg-[#fffaf1] px-6 py-16 text-center" data-testid="empty-product-results">
              <Search size={28} className="mx-auto mb-3 text-[#b33d25]" />
              <h3 className="font-display text-2xl font-semibold text-[#5c2117]">Aucune gourmandise trouvée</h3>
              <p className="mt-2 text-sm text-[#806e61]">Essayez un autre mot ou revenez à toutes les catégories.</p>
              <button type="button" onClick={() => { setQuery(''); setCategory('Tout'); }} className="mt-5 rounded-full bg-[#b33d25] px-4 py-2.5 text-xs font-bold text-[#fff8e8]" data-testid="button-reset-filters">Réinitialiser la recherche</button>
            </div>
          )}
        </section>

        <section id="histoire" className="texture relative overflow-hidden bg-[#173f35] px-4 py-16 text-[#fff8e8] sm:px-6 sm:py-24 lg:px-8" data-testid="story-section">
          <div className="absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#e7aa3d]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              <img src={doughnutImage} alt="Beignets maison de Les délices de Stess" className="mt-9 aspect-[.82] w-full rounded-[1.5rem] object-cover shadow-[0_18px_36px_rgba(0,0,0,.18)] sm:rounded-[2rem]" data-testid="img-story-doughnuts" />
              <img src={spiralImage} alt="Spirales au jambon dorées" className="aspect-[.82] w-full rounded-[1.5rem] object-cover shadow-[0_18px_36px_rgba(0,0,0,.18)] sm:rounded-[2rem]" data-testid="img-story-spirals" />
            </div>
            <div className="max-w-xl">
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f1b943]" data-testid="text-story-eyebrow">Une cuisine qui rassemble</div>
              <h2 className="font-display text-4xl font-semibold leading-[.98] tracking-[-.03em] sm:text-6xl" data-testid="heading-story">Ici, tout commence par une envie de faire plaisir.</h2>
              <p className="mt-6 text-[15px] leading-7 text-[#d9ddcf]">Un goûter partagé, un plat chaud à la pause, une petite commande pour faire sourire quelqu’un. Les délices de Stess, c’est une cuisine de proximité, généreuse et sans chichi.</p>
              <div className="mt-8 grid gap-4 border-t border-[#fff8e8]/15 pt-6 sm:grid-cols-2">
                <div><div className="font-display text-2xl text-[#f1b943]">À Lamentin</div><div className="mt-1 text-xs text-[#c3cec4]">Une adresse du quartier, pour le quartier.</div></div>
                <div><div className="font-display text-2xl text-[#f1b943]">Sur commande</div><div className="mt-1 text-xs text-[#c3cec4]">On prépare selon vos envies et nos disponibilités.</div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[#f1dfbd] px-4 py-16 sm:px-6 sm:py-20 lg:px-8" data-testid="contact-section">
          <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b33d25]">Passer commande</div>
              <h2 className="font-display text-4xl font-semibold leading-[.98] tracking-[-.03em] text-[#5c2117] sm:text-5xl" data-testid="heading-contact">On se retrouve<br />à Lamentin.</h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#806e61]">Préparez votre panier, envoyez-le sur WhatsApp et nous vous confirmerons les détails de votre commande.</p>
              <button type="button" onClick={() => setCartOpen(true)} className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#b33d25] px-5 py-3.5 text-sm font-bold text-[#fff8e8] transition-colors hover:bg-[#8e2f20]" data-testid="button-contact-order">Préparer ma commande <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ContactCard icon={<MapPin size={19} />} title="Nous trouver" content={BUSINESS.address} testId="card-address" />
              <ContactCard icon={<MessageCircle size={19} />} title="WhatsApp — commandes" content={BUSINESS.phones[0]} testId="card-whatsapp" />
              <ContactCard icon={<Phone size={19} />} title="Deuxième contact" content={BUSINESS.phones[1]} testId="card-secondary-phone" />
              <ContactCard icon={<Navigation size={19} />} title="Retrait ou livraison" content="Selon votre adresse et nos disponibilités." testId="card-delivery" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#251815] px-4 py-10 text-[#f6e9d5] sm:px-6 lg:px-8" data-testid="site-footer">
        <div className="mx-auto grid max-w-[1240px] gap-9 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="font-display text-2xl font-semibold">Les délices <span className="text-[#f1b943]">de Stess</span></div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#bba99c]">Le goût du fait maison, à chaque bouchée. Merci de faire vivre une petite adresse locale.</p>
          </div>
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1b943]">Contact direct</div>
             <p className="text-sm leading-7 text-[#e3d2c1]">{BUSINESS.phones[0]}<br />{BUSINESS.phones[1]}<br />WhatsApp commandes : {BUSINESS.phones[0]}</p>
          </div>
          <div>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1b943]">La maison</div>
            <p className="text-sm leading-7 text-[#e3d2c1]">Lamentin 52 rue prolongée<br />(en face ruelle Victor) #19</p>
          </div>
        </div>
        <div className="mx-auto mt-9 max-w-[1240px] border-t border-[#f6e9d5]/15 pt-5 text-[11px] leading-5 text-[#a99587]" data-testid="rights-notice">
          © 2026 Les délices de Stess. Les photographies, le nom, l’identité visuelle, les textes et les contenus de cette boutique sont fournis par Les délices de Stess et protégés. Toute réutilisation, reproduction ou diffusion sans autorisation est interdite.
        </div>
      </footer>

      {notice && <div className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[#173f35] px-5 py-3 text-center text-xs font-semibold text-[#fff8e8] shadow-xl" role="status" data-testid="status-toast">{notice}</div>}

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-[#27150f]/50 backdrop-blur-[2px]" onClick={() => setCartOpen(false)} data-testid="cart-overlay">
          <aside className="drawer-enter absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-[#fffaf1] shadow-[-20px_0_50px_rgba(53,25,15,.2)]" onClick={(event) => event.stopPropagation()} aria-label="Panier" data-testid="cart-drawer">
            <div className="flex items-center justify-between border-b border-[#e6d9c7] px-5 py-5">
              <div><div className="font-display text-2xl font-semibold text-[#5c2117]">Votre panier</div><div className="mt-1 text-xs text-[#8f7868]">{cartCount} article{cartCount > 1 ? 's' : ''}</div></div>
              <button type="button" onClick={() => setCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-[#dfcfbd] text-[#6f5a4e] hover:bg-[#f1dfbd]" aria-label="Fermer le panier" data-testid="button-close-cart"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cartLines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-7 text-center" data-testid="empty-cart">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#f1dfbd] text-[#b33d25]"><ShoppingBag size={26} strokeWidth={1.7} /></div>
                  <h3 className="font-display text-2xl font-semibold text-[#5c2117]">Votre panier vous attend</h3>
                  <p className="mt-2 text-sm leading-6 text-[#806e61]">Ajoutez une crêpe, un plat ou une douceur pour commencer.</p>
                  <button type="button" onClick={() => { setCartOpen(false); scrollToMenu(); }} className="mt-5 rounded-full bg-[#b33d25] px-4 py-3 text-xs font-bold text-[#fff8e8]" data-testid="button-empty-cart-menu">Voir le menu</button>
                </div>
              ) : cartLines.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 border-b border-[#e6d9c7] py-4" data-testid={`cart-item-${product.id}`}>
                  <img src={product.image} alt={product.name} className="h-[70px] w-[70px] rounded-xl object-cover" data-testid={`img-cart-${product.id}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-[#5c2117]">{product.name}</div>
                    <div className="mt-1 text-xs text-[#8f7868]">{formatProductPrice(product)} / {product.unit}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button type="button" onClick={() => changeQuantity(product.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-[#dfcfbd] text-[#5c2117]" aria-label={`Retirer une portion de ${product.name}`} data-testid={`button-cart-minus-${product.id}`}><Minus size={13} /></button>
                      <span className="w-5 text-center text-xs font-bold text-[#5c2117]" data-testid={`text-cart-quantity-${product.id}`}>{quantity}</span>
                      <button type="button" onClick={() => changeQuantity(product.id, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-[#173f35] text-[#fff8e8]" aria-label={`Ajouter une portion de ${product.name}`} data-testid={`button-cart-plus-${product.id}`}><Plus size={13} /></button>
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold text-[#b33d25]" data-testid={`text-cart-subtotal-${product.id}`}>{formatProductTotal(product, quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e6d9c7] bg-[#f6eddf] px-5 py-5">
              <div className="flex justify-between text-sm text-[#806e61]"><span>Sous-total</span><span data-testid="text-cart-subtotal">{formatHTG(cartTotal)}</span></div>
              <div className="mt-3 flex justify-between border-t border-[#dfcfbd] pt-3 font-display text-2xl font-semibold text-[#5c2117]"><span>Total estimé</span><span data-testid="text-cart-total">{cartTotalMax === cartTotal ? formatHTG(cartTotal) : `${formatHTG(cartTotal)} – ${formatHTG(cartTotalMax)}`}</span></div>
              <p className="mt-3 text-[11px] leading-5 text-[#8f7868]">Le montant final et la disponibilité seront confirmés par WhatsApp.</p>
              <button type="button" onClick={openCheckout} disabled={cartLines.length === 0} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#b33d25] px-4 py-3.5 text-sm font-bold text-[#fff8e8] transition-colors hover:bg-[#8e2f20] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-checkout">Continuer sur WhatsApp <ArrowRight size={16} /></button>
            </div>
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#27150f]/60 p-4 backdrop-blur-sm" onClick={() => setCheckoutOpen(false)} data-testid="checkout-overlay">
          <div className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-[1.5rem] bg-[#fffaf1] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={(event) => event.stopPropagation()} data-testid="checkout-dialog">
            <div className="flex items-center justify-between border-b border-[#e6d9c7] px-5 py-5 sm:px-7">
              <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b33d25]">Dernière étape</div><h2 id="checkout-title" className="mt-1 font-display text-2xl font-semibold text-[#5c2117]">Préparer la commande</h2></div>
              <button type="button" onClick={() => setCheckoutOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-[#dfcfbd] text-[#6f5a4e]" aria-label="Fermer le formulaire" data-testid="button-close-checkout"><X size={18} /></button>
            </div>
            <div className="space-y-4 px-5 py-6 sm:px-7">
              {formError && <div className="rounded-xl border border-[#b33d25]/20 bg-[#b33d25]/8 px-4 py-3 text-xs font-semibold leading-5 text-[#8e2f20]" role="alert" data-testid="status-checkout-error">{formError}</div>}
              <Field label="Votre nom" required value={customer.name} onChange={(value) => setCustomer({ ...customer, name: value })} placeholder="Ex. Marie Jean" testId="input-customer-name" />
              <Field label="Téléphone" required value={customer.phone} onChange={(value) => setCustomer({ ...customer, phone: value })} placeholder="Ex. 36 00 00 00" type="tel" testId="input-customer-phone" />
              <div>
                <label htmlFor="customer-address" className="mb-1.5 block text-xs font-bold text-[#5c2117]">Adresse ou point de repère <span className="text-[#b33d25]">*</span></label>
                <textarea id="customer-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Où souhaitez-vous recevoir votre commande ?" className="min-h-20 w-full resize-y rounded-xl border border-[#dfcfbd] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none placeholder:text-[#b4a08f] focus:border-[#b33d25] focus:ring-4 focus:ring-[#b33d25]/10" data-testid="input-customer-address" />
              </div>
              <div>
                <label htmlFor="delivery-choice" className="mb-1.5 block text-xs font-bold text-[#5c2117]">Mode de réception</label>
                <div className="relative">
                  <select id="delivery-choice" value={customer.delivery} onChange={(event) => setCustomer({ ...customer, delivery: event.target.value })} className="w-full appearance-none rounded-xl border border-[#dfcfbd] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none focus:border-[#b33d25] focus:ring-4 focus:ring-[#b33d25]/10" data-testid="select-delivery-choice"><option>Livraison</option><option>Retrait sur place</option></select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8f7868]" />
                </div>
              </div>
              <div>
                <label htmlFor="customer-note" className="mb-1.5 block text-xs font-bold text-[#5c2117]">Une précision ? <span className="font-normal text-[#9a8372]">(facultatif)</span></label>
                <textarea id="customer-note" value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })} placeholder="Heure souhaitée, détail de la commande..." className="min-h-16 w-full resize-y rounded-xl border border-[#dfcfbd] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none placeholder:text-[#b4a08f] focus:border-[#b33d25] focus:ring-4 focus:ring-[#b33d25]/10" data-testid="input-customer-note" />
              </div>
              <div className="rounded-xl bg-[#f1dfbd]/60 p-4" data-testid="checkout-summary">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7868]">Votre sélection</div>
                {cartLines.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-3 py-1 text-sm text-[#6f5a4e]"><span>{quantity} × {product.name}</span><span className="font-semibold text-[#5c2117]">{formatProductTotal(product, quantity)}</span></div>)}
                <div className="mt-2 flex justify-between border-t border-[#d9c5a7] pt-3 font-bold text-[#b33d25]"><span>Total estimé</span><span>{cartTotalMax === cartTotal ? formatHTG(cartTotal) : `${formatHTG(cartTotal)} – ${formatHTG(cartTotalMax)}`}</span></div>
              </div>
              <button type="button" onClick={sendWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-4 py-3.5 text-sm font-bold text-[#fff8e8] transition-colors hover:bg-[#0f3028]" data-testid="button-send-whatsapp"><MessageCircle size={17} /> Envoyer la demande sur WhatsApp</button>
              <p className="text-center text-[11px] leading-5 text-[#9a8372]">WhatsApp s’ouvrira avec votre panier et vos informations préremplis.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrustItem({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="flex items-start gap-3" data-testid={`trust-${title.toLowerCase().replaceAll(' ', '-')}`}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1dfbd] text-[#b33d25]">{icon}</div><div><div className="text-sm font-bold text-[#5c2117]">{title}</div><div className="mt-0.5 text-xs leading-5 text-[#8f7868]">{text}</div></div></div>;
}

function ContactCard({ icon, title, content, testId }: { icon: ReactNode; title: string; content: string; testId: string }) {
  return <div className="rounded-2xl border border-[#dfcfbd] bg-[#fff8e8]/70 p-4" data-testid={testId}><div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-[#173f35] text-[#f1dfbd]">{icon}</div><div className="text-xs font-bold uppercase tracking-[.12em] text-[#8f7868]">{title}</div><div className="mt-1.5 text-sm font-semibold leading-5 text-[#5c2117]">{content}</div></div>;
}

function ProductCard({ product, quantity, onChange, index }: { product: Product; quantity: number; onChange: (id: string, delta: number) => void; index: number }) {
  return (
    <article className={`lift group overflow-hidden rounded-[1.25rem] border border-[#e3d5c4] bg-[#fffaf1] ${product.featured ? 'ring-1 ring-[#f1b943]/40' : ''}`} style={{ animationDelay: `${index * 45}ms` }} data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-[1.08] overflow-hidden bg-[#f1dfbd]">
        <img src={product.image} alt={product.name} loading="lazy" style={{ objectPosition: product.imagePosition ?? 'center' }} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" data-testid={`img-product-${product.id}`} />
        {product.featured && <span className="absolute left-3 top-3 rounded-full bg-[#f1b943] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#4e2c15]" data-testid={`badge-featured-${product.id}`}>Coup de cœur</span>}
      </div>
      <div className="flex min-h-[185px] flex-col p-4">
        <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#a17b5c]">{product.category}</div>
        <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-[1.05] text-[#5c2117]" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#806e61]" data-testid={`text-product-description-${product.id}`}>{product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div><div className="text-base font-bold text-[#b33d25]" data-testid={`text-product-price-${product.id}`}>{formatProductPrice(product)}</div><div className="text-[10px] text-[#9a8372]">{product.unit}</div></div>
          <div className="flex items-center gap-1 rounded-full border border-[#dfcfbd] bg-[#f6eddf] p-1" data-testid={`quantity-control-${product.id}`}>
            <button type="button" onClick={() => onChange(product.id, -1)} className="grid h-7 w-7 place-items-center rounded-full text-[#5c2117] transition-colors hover:bg-[#fffaf1]" aria-label={`Retirer ${product.name}`} data-testid={`button-minus-${product.id}`}><Minus size={14} /></button>
            <span className="w-5 text-center text-xs font-bold text-[#5c2117]" data-testid={`text-quantity-${product.id}`}>{quantity}</span>
            <button type="button" onClick={() => onChange(product.id, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-[#b33d25] text-[#fff8e8] transition-colors hover:bg-[#8e2f20]" aria-label={`Ajouter ${product.name}`} data-testid={`button-plus-${product.id}`}><Plus size={14} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Field({ label, required, value, onChange, placeholder, type = 'text', testId }: { label: string; required?: boolean; value: string; onChange: (value: string) => void; placeholder: string; type?: string; testId: string }) {
  return <div><label htmlFor={testId} className="mb-1.5 block text-xs font-bold text-[#5c2117]">{label} {required && <span className="text-[#b33d25]">*</span>}</label><input id={testId} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-[#dfcfbd] bg-[#fffdf8] px-3.5 text-sm outline-none placeholder:text-[#b4a08f] focus:border-[#b33d25] focus:ring-4 focus:ring-[#b33d25]/10" data-testid={testId} /></div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;