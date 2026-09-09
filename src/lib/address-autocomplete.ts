export interface AddressSelection {
  address1: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

export interface AddressSuggestion {
  id: string;
  label: string;
  address: AddressSelection;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GooglePlaceResult {
  address_components?: GoogleAddressComponent[];
  formatted_address?: string;
}

export function parseGooglePlace(place: GooglePlaceResult): AddressSelection {
  const components = place.address_components || [];
  const get = (type: string, useShort = false) => {
    const match = components.find((c) => c.types.includes(type));
    if (!match) return undefined;
    return useShort ? match.short_name : match.long_name;
  };

  const streetNumber = get("street_number");
  const route = get("route");
  const address1 =
    [streetNumber, route].filter(Boolean).join(" ") ||
    place.formatted_address?.split(",")[0]?.trim() ||
    "";

  return {
    address1,
    city: get("locality") || get("sublocality") || get("postal_town"),
    province: get("administrative_area_level_1", true),
    postalCode: get("postal_code"),
    country: get("country") || "Canada",
  };
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  street?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  province?: string;
  postcode?: string;
  country?: string;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  address?: NominatimAddress;
}

export function parseNominatimResult(item: NominatimResult): AddressSuggestion {
  const a = item.address || {};
  const street = [a.house_number, a.road || a.street].filter(Boolean).join(" ");

  return {
    id: String(item.place_id),
    label: item.display_name,
    address: {
      address1: street || item.display_name.split(",")[0]?.trim() || item.display_name,
      city: a.city || a.town || a.village || a.municipality,
      province: a.state || a.province,
      postalCode: a.postcode,
      country: a.country || "Canada",
    },
  };
}

export interface PhotonFeature {
  properties: {
    osm_id: number;
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
  };
}

export function parsePhotonFeature(feature: PhotonFeature): AddressSuggestion {
  const p = feature.properties;
  const address1 = [p.housenumber, p.street || p.name].filter(Boolean).join(" ");
  const label = [address1, p.city, p.state, p.postcode, p.country || "Canada"]
    .filter(Boolean)
    .join(", ");

  return {
    id: `photon-${p.osm_id}`,
    label,
    address: {
      address1: address1 || p.name || label,
      city: p.city,
      province: p.state,
      postalCode: p.postcode,
      country: p.country || "Canada",
    },
  };
}
