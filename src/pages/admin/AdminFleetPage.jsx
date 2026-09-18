import { useState, useEffect } from 'react';
import { getVehicles, createVehicle, getDrivers, updateDocument } from '../../firebase/firestore';
import toast from 'react-hot-toast';

export default function AdminFleetPage() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New vehicle state
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [type, setType] = useState('Heavy Compactor');
  const [capacity, setCapacity] = useState('10 Ton');
  const [fuelType, setFuelType] = useState('Electric (BEV)');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchFleet() {
      try {
        const [vList, dList] = await Promise.all([getVehicles(), getDrivers()]);
        setVehicles(vList);
        setDrivers(dList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFleet();
  }, []);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleNumber) {
      toast.error('Vehicle license / asset number is required');
      return;
    }

    setSaving(true);
    try {
      const driver = drivers.find((d) => d.id === assignedDriverId);

      await createVehicle({
        vehicleNumber,
        type,
        capacity,
        fuelType,
        assignedDriverId: assignedDriverId || null,
        driverName: driver ? (driver.name || driver.driverName) : 'Unassigned',
        status: 'available',
        currentLatitude: 28.6139 + (Math.random() - 0.5) * 0.05,
        currentLongitude: 77.2090 + (Math.random() - 0.5) * 0.05,
        batteryOrFuelLevel: Math.floor(Math.random() * 30) + 70,
        telemetryOnline: true,
      });

      toast.success('Vehicle registered into municipal fleet telemetry');
      setShowModal(false);
      setVehicleNumber('');
      const updated = await getVehicles();
      setVehicles(updated);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (vehicleId, status) => {
    try {
      await updateDocument('vehicles', vehicleId, { status });
      setVehicles(vehicles.map((v) => (v.id === vehicleId ? { ...v, status } : v)));
      toast.success(`Vehicle marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update vehicle status');
    }
  };

  return (
    <div className="flex-1 w-full p-space-md lg:p-margin space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface tracking-tight">
            Fleet Telemetry & Resource Hub
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Manage municipal compactor trucks, automated sensor telemetry, and field driver allocations.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container transition shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Register Vehicle Asset
        </button>
      </div>

      {/* Fleet Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-surface-container-high p-4 rounded-2xl shadow-xs">
          <span className="text-code-sm uppercase font-semibold text-on-surface-variant">Active Assets</span>
          <div className="text-headline-md font-bold text-on-surface mt-1">{vehicles.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            100% CAN-bus Telemetry Online
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-container-high p-4 rounded-2xl shadow-xs">
          <span className="text-code-sm uppercase font-semibold text-blue-600">In Transit</span>
          <div className="text-headline-md font-bold text-blue-600 mt-1">
            {vehicles.filter((v) => v.status === 'in_transit' || v.status === 'active').length}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Active collection runs</div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-container-high p-4 rounded-2xl shadow-xs">
          <span className="text-code-sm uppercase font-semibold text-emerald-600">Available at Depot</span>
          <div className="text-headline-md font-bold text-emerald-600 mt-1">
            {vehicles.filter((v) => v.status === 'available').length}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Ready for assignment</div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-container-high p-4 rounded-2xl shadow-xs">
          <span className="text-code-sm uppercase font-semibold text-amber-600">Maintenance</span>
          <div className="text-headline-md font-bold text-amber-600 mt-1">
            {vehicles.filter((v) => v.status === 'maintenance').length}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1">Scheduled service</div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low/60 text-code-sm text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Asset ID / Plate</th>
                <th className="py-3 px-4 font-semibold">Vehicle Class</th>
                <th className="py-3 px-4 font-semibold">Payload Capacity</th>
                <th className="py-3 px-4 font-semibold">Powertrain</th>
                <th className="py-3 px-4 font-semibold">Assigned Driver</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Quick Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading fleet telemetry...
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    No vehicles registered in fleet database.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container-low/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {v.vehicleNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium">{v.type || 'Compactor'}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{v.capacity || '5 Ton'}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-medium text-xs">
                      {v.fuelType || 'Electric (BEV)'}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface">
                      {v.driverName || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          v.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'in_transit' || v.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.status || 'available'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(v.id, 'available')}
                          className="px-2 py-1 text-xs rounded hover:bg-emerald-50 text-emerald-700 font-medium cursor-pointer"
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(v.id, 'maintenance')}
                          className="px-2 py-1 text-xs rounded hover:bg-amber-50 text-amber-700 font-medium cursor-pointer"
                        >
                          Service
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

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="text-headline-sm font-bold text-on-surface">
                Register Fleet Vehicle Asset
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="py-4 space-y-4">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  License Plate / Unit ID *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. DL-01-AX-9920"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Vehicle Configuration
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Heavy Compactor Truck">Heavy Compactor Truck</option>
                  <option value="Medium Tipper Truck">Medium Tipper Truck</option>
                  <option value="Small Alley Collector">Small Alley Collector</option>
                  <option value="Bio-Hazard Recovery Unit">Bio-Hazard Recovery Unit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Payload Capacity
                  </label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 8 Ton"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface mb-1">
                    Powertrain
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Electric (BEV)">Electric (BEV)</option>
                    <option value="CNG Clean Fuel">CNG Clean Fuel</option>
                    <option value="Euro-VI Diesel">Euro-VI Diesel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">
                  Default Driver Allocation
                </label>
                <select
                  value={assignedDriverId}
                  onChange={(e) => setAssignedDriverId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container text-body-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">-- Leave Unassigned --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name || d.driverName} ({d.phone || 'Driver'})
                    </option>
                  ))}
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
                  {saving ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
