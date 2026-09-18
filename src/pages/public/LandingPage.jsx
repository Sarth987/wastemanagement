import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full overflow-hidden px-margin py-space-xl lg:py-24 bg-gradient-to-b from-surface via-surface-container-low to-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-space-md z-10">
            <div className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container text-primary text-code-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>SMART_WASTE // ACTIVE</span>
            </div>
            <h1 className="text-headline-xl text-on-surface tracking-tight leading-none text-left">
              Smarter Waste Collection.<br />
              <span className="text-primary">Cleaner Communities.</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl">
              Report uncollected waste, help municipalities respond faster, and optimize
              collection routes through one connected platform.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm w-full pt-space-xs">
              <Link
                to="/report-waste"
                className="inline-flex items-center justify-center gap-space-xs h-11 px-space-lg rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span>Report Waste</span>
              </Link>
              <Link
                to="/my-reports"
                className="inline-flex items-center justify-center gap-space-xs h-11 px-space-md rounded-lg bg-surface-container-lowest text-on-surface text-label-lg shadow-sm hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">manage_search</span>
                <span>Track My Report</span>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm w-full pt-space-md">
              {[
                { label: 'ACTIVE', value: '—', sub: 'Live Hotspots', color: 'text-tertiary' },
                { label: 'RESOLVED', value: '—', sub: 'Recent', color: 'text-primary' },
                { label: 'FLEET', value: '—', sub: 'GPS Active', color: 'text-secondary' },
                { label: 'PRIORITY', value: '—', sub: 'Urgent Action', color: 'text-error' },
              ].map((stat) => (
                <div key={stat.label} className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col">
                  <span className="text-code-sm text-on-surface-variant">{stat.label}</span>
                  <span className="text-headline-md text-on-surface mt-1">{stat.value}</span>
                  <span className={`text-label-sm ${stat.color} font-semibold`}>{stat.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Map Placeholder */}
          <div className="lg:col-span-6 relative w-full aspect-square sm:aspect-[4/3] rounded-2xl bg-surface-container-lowest shadow-xl overflow-hidden p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between z-20 bg-surface-container/90 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                <span className="text-label-md text-on-surface font-bold">CITY GEO-GRID</span>
              </div>
              <span className="text-code-sm px-2 py-0.5 rounded bg-surface-container-lowest text-primary">LIVE</span>
            </div>
            {/* Placeholder map visualization */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-[64px] text-surface-container-highest">map</span>
                <p className="text-body-sm text-on-surface-variant mt-2">Interactive map loads on report pages</p>
              </div>
            </div>
            <div className="flex items-center justify-between z-20 bg-surface-container/90 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-sm">
              <div className="flex items-center gap-space-sm text-code-sm text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary" />Unverified</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-info" />Verified</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" />Dispatched</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />Collected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem Statement Section ─── */}
      <section className="w-full px-margin py-16 lg:py-24 bg-surface">
        <div className="max-w-7xl mx-auto">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Modernizing Municipal Infrastructure</span>
          <h2 className="text-headline-xl text-on-surface mt-2 mb-space-sm">From Static Schedules to Responsive Civic Tech</h2>
          <p className="text-body-lg text-on-surface-variant max-w-3xl mb-space-xl">
            Conventional municipal collection follows rigid timetables, oblivious to dynamic dumping spikes,
            high-density events, and citizen-reported overflows.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {[
              { icon: 'route', title: 'Static Routes & Fuel Waste', desc: 'Fixed schedules cause trucks to visit half-empty receptacles while overflowing bins miles away sit ignored for days.', color: 'text-tertiary', tag: 'INEFFICIENT' },
              { icon: 'visibility_off', title: 'Missed Dumps & Unreported Blight', desc: 'Illegal dumping and roadside accumulation create blotchards. Citizens face high friction trying to contact disparate municipal call centers.', color: 'text-status-warning', tag: 'UNNOTICED' },
              { icon: 'hourglass_top', title: 'Delayed Dispatch & No SLA', desc: 'Disconnected legacy software isolates 311 citizen desks from sanitation crews, dragging incident response time out to 72+ hours.', color: 'text-on-surface-variant', tag: 'LAGGING' },
            ].map((card) => (
              <div key={card.title} className="p-space-lg rounded-xl bg-surface-container-lowest shadow-surface-1 flex flex-col gap-space-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                  <span className={`material-symbols-outlined text-[28px] ${card.color}`}>{card.icon}</span>
                </div>
                <span className={`text-label-sm ${card.color} uppercase tracking-wider`}>{card.tag}</span>
                <h3 className="text-headline-sm text-on-surface">{card.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pipeline Section ─── */}
      <section className="w-full px-margin py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">The Complete Architecture</span>
          <h2 className="text-headline-xl text-on-surface mt-2 mb-2">Autonomous Civic Pipeline</h2>
          <p className="text-body-md text-on-surface-variant mb-space-xl">From browser tap to route execution in sub-30 seconds</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {[
              { step: '01', tag: 'GEOTAG', title: 'Citizen Reports', desc: 'Residents snap an overflow incident directly via browser. High-precision GPS and image payload stream to the database.', highlight: 'Zero App Install Needed' },
              { step: '02', tag: 'TRIAGE', title: 'Admin Validation', desc: 'Municipal console auto-deduplicates proximity alerts and assigns priority rankings (Low, Medium, High, Critical).', highlight: 'Under 60s Triage SLA' },
              { step: '03', tag: 'ROUTING', title: 'Dynamic Route', desc: 'Google Directions API calculates optimized multi-stop routes, inserting verified hotpoints directly into vehicle navigation.', highlight: '22% Fuel Reduction' },
              { step: '04', tag: 'RESOLVE', title: 'Driver Execution', desc: 'Sanitation crew reaches waypoint, clears site, and logs visual clearance proof. Citizen report flips to Collected instantly.', highlight: '100% Photographic Proof' },
            ].map((item) => (
              <div key={item.step} className="relative p-space-lg rounded-xl bg-surface-container-lowest shadow-surface-1 flex flex-col gap-space-sm">
                <span className="absolute -top-3 -left-1 text-[64px] font-bold text-surface-container-highest/50 leading-none font-display select-none">{item.step}</span>
                <div className="relative z-10">
                  <span className="text-code-sm text-on-surface-variant">STEP {item.step} // {item.tag}</span>
                  <h3 className="text-headline-sm text-on-surface mt-1">{item.title}</h3>
                  <p className="text-body-sm text-on-surface-variant mt-2">{item.desc}</p>
                  <div className="flex items-center gap-space-xs mt-space-sm text-primary">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span className="text-code-sm">{item.highlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Metrics Section ─── */}
      <section className="w-full px-margin py-16 lg:py-24 bg-surface">
        <div className="max-w-7xl mx-auto">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Proven Civic Outcomes</span>
          <h2 className="text-headline-xl text-on-surface mt-2 mb-space-xl">Measured Urban Improvements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {[
              { icon: 'smartphone', value: '0 Apps', title: 'Frictionless Civic Reporting', desc: '100% web-native. Citizens submit reports directly through their smartphone browser without creating an account or downloading an app.', sub: '4.8x Higher Participation' },
              { icon: 'schedule', value: '< 4 Hours', title: 'Average Response Resolution', desc: 'Reduced from legacy 72-hour municipal dispatch lag down to real-time algorithmic dispatch into active route vectors.', sub: '94% Citizen SLA Compliance' },
              { icon: 'eco', value: '-26%', title: 'Fleet Diesel & Emissions', desc: 'Algorithmic route clustering eliminates dead heading and unnecessary loops through clean neighborhoods.', sub: 'Saved $42k Fuel / Quarter' },
            ].map((metric) => (
              <div key={metric.title} className="p-space-lg rounded-xl bg-surface-container-lowest shadow-surface-1 flex flex-col gap-space-sm">
                <span className="material-symbols-outlined text-[28px] text-primary">{metric.icon}</span>
                <span className="text-display-lg-mobile text-on-surface">{metric.value}</span>
                <h3 className="text-headline-sm text-on-surface">{metric.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{metric.desc}</p>
                <span className="text-label-sm text-primary font-semibold mt-auto">{metric.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="w-full px-margin py-16 lg:py-20">
        <div className="max-w-7xl mx-auto rounded-2xl bg-inverse-surface p-space-xl lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
          <div>
            <span className="text-code-sm text-inverse-primary uppercase tracking-wider">Full Open Civic Stack</span>
            <h2 className="text-headline-xl text-inverse-on-surface mt-2">
              Engineered for Municipal Resilience & Scale
            </h2>
            <p className="text-body-lg text-inverse-on-surface/70 mt-2 max-w-2xl">
              Built on React with Firebase for sub-second data persistence, Google Maps for real-time geospatial routing, and Cloud Firestore for live dashboard analytics.
            </p>
            <div className="flex flex-wrap gap-space-sm mt-space-md">
              {['React', 'Firebase', 'Google Maps', 'Cloud Firestore'].map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-lg bg-surface-variant/10 text-inverse-on-surface text-code-sm">{tech}</span>
              ))}
            </div>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-space-xs h-12 px-space-xl rounded-lg bg-primary text-on-primary text-label-lg shadow-lg hover:opacity-90 transition-all shrink-0"
          >
            Get Started
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
