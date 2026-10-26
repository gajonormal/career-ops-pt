// City references only; links let the user compare current road/transit routes.
// No invented ETA, home address, mode availability or daily travel limit.
export function commuteOptions(location, bases = []) {
  const cities = [...new Set(String(location || '').split(/\s*\|\s*|\s*;\s*/).map(part => part.trim()).filter(city => city && !/^(?:remote|remoto|remota|portugal|pt|europe|europa|emea|eu|eea)$/i.test(city)))];
  return cities.flatMap(city => bases.filter(base => typeof base === 'string' && base.trim()).map(base => ({
    origin: base, destination: city, scope: 'city-reference', duration_minutes: null, distance_km: null,
    driving_url: `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', origin: `${base}, Portugal`, destination: city, travelmode: 'driving' })}`,
    transit_url: `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', origin: `${base}, Portugal`, destination: city, travelmode: 'transit' })}`,
  })));
}
