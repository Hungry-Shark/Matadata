'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useAppStore } from '@/store/appStore';

interface Booth {
  id: string;
  name: string;
  address: string;
  distance: string;
  lat: number;
  lng: number;
  waitTime?: string;
}

// Mock booth data relative to user location (real app would fetch from ECI API)
function generateNearbyBooths(lat: number, lng: number): Booth[] {
  const offsets = [
    { dlat: 0.003, dlng: 0.004, name: 'Primary School, Sector 12', address: 'Block A, Room 1, Urban Estate', wait: '~5 mins' },
    { dlat: -0.005, dlng: 0.002, name: 'Community Hall, Ward 7', address: 'Near Main Market, Opp. Post Office', wait: '~12 mins' },
    { dlat: 0.007, dlng: -0.003, name: 'Govt. Inter College', address: 'Civil Lines, Gate No. 2', wait: '~8 mins' },
  ];

  return offsets.map((o, i) => {
    const dlat = Math.abs(o.dlat);
    const dlng = Math.abs(o.dlng);
    const distKm = Math.sqrt(dlat * dlat + dlng * dlng) * 111;
    return {
      id: String(i + 1),
      name: o.name,
      address: o.address,
      distance: `${distKm.toFixed(1)} km`,
      lat: lat + o.dlat,
      lng: lng + o.dlng,
      waitTime: o.wait,
    };
  });
}

export default function BoothLocatorPage() {
  const { constituency } = useAppStore();
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [gpsError, setGpsError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationName, setLocationName] = useState('');

  const locate = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLng(longitude);

        // Reverse-geocode to get human-readable location
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geo = await res.json();
          const name = geo?.address?.suburb || geo?.address?.neighbourhood || geo?.address?.city || geo?.address?.county || 'Your Location';
          setLocationName(name);
        } catch {
          setLocationName('Your Location');
        }

        const nearby = generateNearbyBooths(latitude, longitude);
        setBooths(nearby);
        setSelectedBooth(nearby[0]);
        setLocating(false);
      },
      () => {
        setGpsError('Could not access your location. Please enable location access in your browser.');
        setLocating(false);
        // Fall back to mock data so the UI isn't empty
        const fallbackLat = 25.3478;
        const fallbackLng = 82.9988;
        setUserLat(fallbackLat);
        setUserLng(fallbackLng);
        setLocationName(constituency?.name || 'Your Constituency');
        const nearby = generateNearbyBooths(fallbackLat, fallbackLng);
        setBooths(nearby);
        setSelectedBooth(nearby[0]);
      }
    );
  };

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapUrl = userLat && userLng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${userLng - 0.015},${userLat - 0.012},${userLng + 0.015},${userLat + 0.012}&layer=mapnik&marker=${userLat},${userLng}`
    : null;

  return (
    <div className="bg-warm-cream font-body-md text-on-surface h-screen w-screen overflow-hidden flex flex-col relative">
      {/* TopAppBar */}
      <header className="bg-pure-white border-b border-surface-variant font-bold tracking-tight flex justify-between items-center w-full px-4 py-3 z-10 shrink-0">
        <h1 className="text-[18px] font-black text-primary-ink">Booth Locator</h1>
        <button
          onClick={locate}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-soft text-amber-dark text-[13px] font-semibold disabled:opacity-60 transition-opacity"
        >
          <span className="material-symbols-outlined text-[16px]">my_location</span>
          {locating ? 'Locating…' : 'Refresh'}
        </button>
      </header>

      {/* Map Canvas */}
      <main className="flex-grow relative w-full h-full overflow-hidden">

        {/* Map — real OSM embed when location is known */}
        {mapUrl ? (
          <iframe
            key={mapUrl}
            src={mapUrl}
            className="absolute inset-0 w-full h-full border-0"
            title="Polling booth map"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 bg-deep-cream"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6VvomcAUftsYniwCul303IYs42Y0VDDy5-2KAf9oeURBNrw8hUPV_iX08up9NZQfqZqcQlSR25PqnBqTuzxOweZRPhnlIX-42yI7ewJ2cppqq7_Ntl4n-2Hgx_Ie0Q1sdIdq7ubQh-0RT9FlNonfp273OgmQhLG-VR_NhrilHatet8-suW8FqVY5B3CNkH_6c5fJfjX0DWYzGXFEbgDEz89QeKN1cRxJ2iVX7C8g7tDg4ho7E98OX6OCsV17eSdbU-j4ieB21WqM0')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-warm-cream/40 backdrop-blur-[2px]" />
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {locating && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-warm-cream/80 backdrop-blur-sm gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="w-10 h-10 border-4 border-election-amber/30 border-t-election-amber rounded-full animate-spin" />
              <p className="text-[14px] font-semibold text-primary-ink">Finding your location…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GPS error banner */}
        {gpsError && (
          <div className="absolute top-3 left-3 right-3 z-20 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-[12px] text-alert-red flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            {gpsError}
          </div>
        )}

        {/* Location label chip */}
        {locationName && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-pure-white/90 backdrop-blur-md border border-outline-variant rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-election-amber text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <span className="text-[12px] font-semibold text-primary-ink">{locationName}</span>
          </div>
        )}

        {/* Recenter button */}
        <button
          onClick={locate}
          aria-label="Center Map"
          className="absolute top-16 right-3 z-20 bg-pure-white p-2.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-primary-ink text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
        </button>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {selectedBooth && (
            <motion.div
              className="absolute bottom-[72px] left-0 right-0 z-30 px-4 pb-2"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Booth selector pills */}
              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                {booths.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBooth(b)}
                    className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      selectedBooth.id === b.id
                        ? 'bg-election-amber text-pure-white border-election-amber'
                        : 'bg-pure-white text-text-secondary border-surface-variant'
                    }`}
                  >
                    {b.distance}
                  </button>
                ))}
              </div>

              {/* Card */}
              <div className="bg-pure-white rounded-[20px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 border border-surface-variant flex flex-col gap-3">
                <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto -mt-1" />

                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-election-amber uppercase tracking-wider">Nearest Booth</span>
                    <h2 className="text-[16px] font-bold text-primary-ink leading-tight">{selectedBooth.name}</h2>
                    <p className="text-[13px] text-text-secondary">{selectedBooth.address}</p>
                  </div>
                  <div className="bg-amber-soft border border-election-amber/30 rounded-xl px-3 py-2 flex flex-col items-center justify-center min-w-[58px]">
                    <span className="text-[18px] font-black text-amber-dark leading-none">{selectedBooth.distance.replace(' km', '')}</span>
                    <span className="text-[10px] text-primary-ink">km</span>
                  </div>
                </div>

                {selectedBooth.waitTime && (
                  <div className="flex items-center gap-2 bg-[#E8F5E9] p-3 rounded-xl">
                    <span className="material-symbols-outlined text-success-green text-[18px]">schedule</span>
                    <span className="text-[13px] text-primary-ink font-medium">Estimated wait:</span>
                    <span className="text-[13px] text-success-green font-bold ml-auto">{selectedBooth.waitTime}</span>
                  </div>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBooth.lat},${selectedBooth.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-election-amber text-pure-white font-bold py-3 rounded-full shadow-[0_4px_12px_rgba(245,166,35,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-[15px]"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions</span>
                  Get Directions
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
