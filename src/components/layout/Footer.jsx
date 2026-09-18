import { Link } from 'react-router-dom';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1WEo6r2k_a6UgctxbdcFURgPKDsGdYQufbxgN7ppTe1d7KlEcQmBQrEs8t25r2yS_lxzwdnCmtakn6e-0p1ln2GvkgoZJFNN4-1ZgeTQfVWjBKPE8lcBBP-Nx7snwaA778T0yh6_6NwZlt1_7CPYaUXAmqqPk8ELjw-STSeDqKULgRcyTfGNX4OqtJcHof27wUu1lw-wu03fszOEWRadArjrcabzxoUap0sekFEMO1U_gOZBPamwDvv_pQ';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high">
      <div className="max-w-7xl mx-auto px-margin py-space-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-xl">
          {/* Brand */}
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <img alt="Smart Waste Logo" className="h-7 w-auto object-contain" src={LOGO_URL} />
              <span className="text-headline-sm text-on-surface tracking-tight">Smart Waste</span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Smarter Waste Collection. Cleaner Communities. Driving circular civic logistics
              with automated dispatching, and public accountability.
            </p>
          </div>

          {/* Public Services */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="text-label-lg text-on-surface">Public Services</h4>
            <Link to="/" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Citizen Portal</Link>
            <Link to="/report-waste" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Report Waste</Link>
            <Link to="/about" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">About</Link>
          </div>

          {/* Operations */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="text-label-lg text-on-surface">Operations</h4>
            <Link to="/admin/routes" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Dynamic Fleet Routing</Link>
            <Link to="/admin/dashboard" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Municipal Dispatch Console</Link>
            <Link to="/admin/fleet" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Fleet Management</Link>
          </div>

          {/* Technical */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="text-label-lg text-on-surface">Technical</h4>
            <span className="text-body-sm text-on-surface-variant">Firebase Backend</span>
            <span className="text-body-sm text-on-surface-variant">Google Maps Platform</span>
            <span className="text-body-sm text-on-surface-variant">Real-time Firestore</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-space-xl pt-space-md border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="text-body-sm text-on-surface-variant">
            © {new Date().getFullYear()} Smart Waste Civic Operations. All rights reserved.
          </p>
          <div className="flex items-center gap-space-md">
            <span className="text-code-sm text-on-surface-variant">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
