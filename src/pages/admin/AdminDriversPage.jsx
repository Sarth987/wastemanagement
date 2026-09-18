import { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDocument } from '../../firebase/firestore';
import toast from 'react-hot-toast';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New driver form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [shift, setShift] = useState('Morning (06:00 - 14:00)');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const list = await getDrivers();
      setDrivers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Driver name and phone are required');
      return;
    }

    setSaving(true);
    try {
      await createDriver({
        name,
        driverName: name,
        phone,
        licenseNumber,
        shift,
        status: 'available',
        currentLatitude: 28.6139,
        currentLongitude: 77.2090,
        activeRouteId: null,
        rating: 4.9,
      });

      toast.success('Municipal driver registered successfully');
      setShowModal(false);
      setName('');
      setPhone('');
      setLicenseNumber('');
      fetchDrivers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to register driver');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (driverId, status) => {
    try {
      await updateDocument('drivers', driverId, { status });
      setDrivers(drivers.map((d) => (d.id === driverId ? { ...d, status } : d)));
      toast.success(`Driver status set to ${status}`);
    } catch (err) {
      toast.error('Failed to update driver');
    }
  };

  return (
    <div className="flex-1 w-full p-space-md lg:p-margin space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface tracking-tight">
            Municipal Drivers Roster
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Field operators, commercial license verification, and shift allocation status.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container transition shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Field Driver
        </button>
      </div>

      {/* Driver Grid */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low/60 text-code-sm text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Operator Name</th>
                <th className="py-3 px-4 font-semibold">Phone Contact</th>
                <th className="py-3 px-4 font-semibold">Commercial License</th>
                <th className="py-3 px-4 font-semibold">Assigned Shift</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading driver personnel...
                    </div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant">
                    No drivers registered in municipal roster. Click "Add Field Driver" to register.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-surface-container-low/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-on-surface flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary font-bold flex items-center justify-center text-xs">
                        {driver.name?.[0]?.toUpperCase() || 'D'}
                      </div>
                      <span>{driver.name || driver.driverName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                      {driver.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                      {driver.licenseNumber || 'COMM-DL-EXPR'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-on-surface-variant">
                      {driver.shift || 'Morning Shift'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          driver.status === 'on_route' || driver.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : driver.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {driver.status || 'available'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStatusChange(driver.id, 'available')}
                          className="px-2 py-1 text-xs rounded hover:bg-emerald-50 text-emerald-700 font-medium cursor-pointer"
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleStatusChange(driver.id, 'off_duty')}
                          className="px-2 py-1 text-xs rounded hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
                        >
                          Off-Duty
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="text-headline-sm font-bold text-on-surface">
                Add Field Driver
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="py-4 space-y-4">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Mobile Number (SMS Dispatches) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Commercial Driving License ID
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. DL-0420190012345"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Shift Schedule
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                  <option value="Afternoon (14:00 - 22:00)">Afternoon (14:00 - 22:00)</option>
                  <option value="Night Express (22:00 - 06:00)">Night Express (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-label-md font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
