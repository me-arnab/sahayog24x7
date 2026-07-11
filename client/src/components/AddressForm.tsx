import { useState, useEffect } from "react";
import type { LocationData, StructuredAddress } from "../types";

export interface AddressFormProps {
  onAddressChange: (
    addressType: "RURAL" | "URBAN",
    locationMethod: "GPS" | "MANUAL",
    location: LocationData | undefined,
    address: StructuredAddress
  ) => void;
}

export function AddressForm({ onAddressChange }: AddressFormProps) {
  const [addressType, setAddressType] = useState<"RURAL" | "URBAN">("URBAN");
  const [locationMethod, setLocationMethod] = useState<"GPS" | "MANUAL">("MANUAL");
  const [isCapturing, setIsCapturing] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [location, setLocation] = useState<LocationData | undefined>();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSearchingPin, setIsSearchingPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [postOffices, setPostOffices] = useState<any[]>([]);
  
  const [address, setAddress] = useState<StructuredAddress>({
    state: "West Bengal",
    district: "",
    subDivision: "",
    block: "",
    gramPanchayat: "",
    municipality: "",
    wardNumber: "",
    village: "",
    locality: "",
    road: "",
    houseNumber: "",
    pinCode: "",
  });

  // Notify parent on any change
  useEffect(() => {
    onAddressChange(addressType, locationMethod, location, address);
  }, [addressType, locationMethod, location, address, onAddressChange]);

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setIsCapturing(true);
    setGeoError("");
    setLocationMethod("GPS");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
        };
        setLocation(coords);
        setIsCapturing(false);
        
        // Reverse Geocode
        setIsGeocoding(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setAddress(prev => ({
              ...prev,
              district: addr.state_district || addr.county || prev.district,
              municipality: addr.city || addr.town || addr.municipality || prev.municipality,
              village: addr.village || prev.village,
              locality: addr.suburb || addr.neighbourhood || prev.locality,
              road: addr.road || prev.road,
              pinCode: addr.postcode || prev.pinCode,
            }));
            
            // Auto-trigger PIN Code lookup if we got a PIN code from GPS
            if (addr.postcode && addr.postcode.length === 6) {
              lookupPinCode(addr.postcode);
            }
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        } finally {
          setIsGeocoding(false);
        }
      },
      (error) => {
        setIsCapturing(false);
        setGeoError(error.message);
        setLocationMethod("MANUAL");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleManual = () => {
    setLocationMethod("MANUAL");
    setLocation(undefined);
  };

  const lookupPinCode = async (pin: string) => {
    if (pin.length !== 6) return;
    setIsSearchingPin(true);
    setPinError("");
    setPostOffices([]);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      if (data && data[0].Status === "Success") {
        const offices = data[0].PostOffice || [];
        setPostOffices(offices);
        
        if (offices.length > 0) {
          const first = offices[0];
          setAddress(prev => ({
            ...prev,
            state: first.State,
            district: first.District,
            // If only one, auto-select it. Otherwise leave blank for the dropdown.
            road: offices.length === 1 ? first.Name : prev.road,
            block: offices.length === 1 ? (first.Block === "NA" ? "" : first.Block) : prev.block,
          }));
        }
      } else {
        setPinError("Invalid PIN Code or details not found.");
      }
    } catch (error) {
      console.error("PIN lookup error:", error);
      setPinError("Failed to fetch PIN details.");
    } finally {
      setIsSearchingPin(false);
    }
  };

  const handleFieldChange = (field: keyof StructuredAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 col-span-2 bg-slate-50 p-6 rounded-2xl border border-border">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
          <h3 className="text-lg font-bold text-navy">Location of the Issue</h3>
        </div>
        <p className="text-sm text-text-muted mb-6">
          We need the exact location of the issue to dispatch our field workers quickly. We highly recommend using the <span className="font-semibold text-primary">GPS button</span> if you are currently at the location.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Area Type *</label>
            <div className="flex gap-2 bg-bg p-1 rounded-xl border border-border">
              <button type="button" onClick={() => setAddressType("URBAN")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${addressType === "URBAN" ? "bg-white shadow text-primary" : "text-text-muted hover:bg-slate-100"}`}>Urban</button>
              <button type="button" onClick={() => setAddressType("RURAL")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${addressType === "RURAL" ? "bg-white shadow text-primary" : "text-text-muted hover:bg-slate-100"}`}>Rural</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Location Method *</label>
            <div className="flex gap-2 bg-bg p-1 rounded-xl border border-border">
              <button type="button" onClick={handleCaptureGPS} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${locationMethod === "GPS" ? "bg-white shadow text-primary" : "text-text-muted hover:bg-slate-100"}`}>
                <i className="fas fa-location-arrow mr-1.5"></i> GPS
              </button>
              <button type="button" onClick={handleManual} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${locationMethod === "MANUAL" ? "bg-white shadow text-primary" : "text-text-muted hover:bg-slate-100"}`}>
                <i className="fas fa-keyboard mr-1.5"></i> Manual
              </button>
            </div>
          </div>
        </div>

        {locationMethod === "GPS" && (
          <div className="mb-6 bg-white p-4 rounded-xl border border-border">
            {isCapturing ? (
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <i className="fas fa-spinner fa-spin text-primary"></i> Locating you...
              </div>
            ) : location ? (
              <div>
                <div className="flex items-center gap-2 text-success font-semibold text-sm mb-2">
                  <i className="fas fa-check-circle"></i> Location Captured
                </div>
                <div className="text-xs text-text-muted grid grid-cols-2 gap-2">
                  <span>Lat: {location.latitude.toFixed(6)}</span>
                  <span>Lng: {location.longitude.toFixed(6)}</span>
                  <span>Accuracy: ±{Math.round(location.accuracy)}m</span>
                </div>
                {isGeocoding && <p className="text-xs text-primary mt-2 animate-pulse">Auto-filling address details...</p>}
              </div>
            ) : null}
            {geoError && <p className="text-xs text-error mt-2"><i className="fas fa-exclamation-triangle"></i> {geoError}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">District *</label>
            <input type="text" required value={address.district} onChange={(e) => handleFieldChange("district", e.target.value)} placeholder="e.g. Purba Medinipur" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
          </div>

          {addressType === "URBAN" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Municipality/Corp *</label>
                <input type="text" required value={address.municipality} onChange={(e) => handleFieldChange("municipality", e.target.value)} placeholder="e.g. Haldia Municipality" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Ward Number *</label>
                <input type="text" required value={address.wardNumber} onChange={(e) => handleFieldChange("wardNumber", e.target.value)} placeholder="e.g. 14" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Block / Sub-Division</label>
                <input type="text" value={address.block} onChange={(e) => handleFieldChange("block", e.target.value)} placeholder="e.g. Sutahata" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Gram Panchayat *</label>
                <input type="text" required value={address.gramPanchayat} onChange={(e) => handleFieldChange("gramPanchayat", e.target.value)} placeholder="Enter Gram Panchayat" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Village *</label>
                <input type="text" required value={address.village} onChange={(e) => handleFieldChange("village", e.target.value)} placeholder="Village name" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
              </div>
            </>
          )}

          {postOffices.length > 1 && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Select Locality / Post Office (from PIN)</label>
              <select 
                onChange={(e) => {
                  const po = postOffices.find(p => p.Name === e.target.value);
                  if (po) {
                    handleFieldChange("road", po.Name);
                    if (po.Block !== "NA") handleFieldChange("block", po.Block);
                  }
                }}
                className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select Locality...</option>
                {postOffices.map((po, idx) => (
                  <option key={idx} value={po.Name}>{po.Name} {po.Block !== "NA" ? `(${po.Block})` : ""}</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Locality / Road *</label>
            <input type="text" required value={address.road} onChange={(e) => handleFieldChange("road", e.target.value)} placeholder="Street, road name, or locality" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">House/Plot Number</label>
            <input type="text" value={address.houseNumber} onChange={(e) => handleFieldChange("houseNumber", e.target.value)} placeholder="Optional" className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">PIN Code *</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                pattern="[0-9]{6}" 
                value={address.pinCode} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  handleFieldChange("pinCode", val);
                  if (val.length === 6) {
                    lookupPinCode(val);
                  }
                }} 
                placeholder="6-digit PIN" 
                className="w-full p-3 pr-10 border border-border rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/10" 
              />
              {isSearchingPin && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <i className="fas fa-spinner fa-spin text-primary"></i>
                </div>
              )}
            </div>
            {pinError && <p className="text-xs text-error mt-1.5"><i className="fas fa-exclamation-triangle"></i> {pinError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
