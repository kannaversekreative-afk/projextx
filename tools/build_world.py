"""Build trader/world-data.js: 195 countries (193 UN members + Vatican City +
Palestine), one capital each, from Natural Earth and OurAirports (both public
domain).

Usage: python3 trader/tools/build_world.py <data_dir>
<data_dir> must contain (github.com/nvkelso/natural-earth-vector/geojson):
  ne_50m_admin_0_countries.geojson, ne_50m_admin_0_tiny_countries.geojson,
  ne_10m_populated_places_simple.geojson, ne_50m_land.geojson
and airports.csv (github.com/datasets/airport-codes).
"""
import base64, csv, json, math, os, sys
from collections import defaultdict
from PIL import Image, ImageDraw

D = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'world-data.js')
load = lambda f: json.load(open(os.path.join(D, f)))

UN = ('AFG ALB DZA AND AGO ATG ARG ARM AUS AUT AZE BHS BHR BGD BRB BLR BEL BLZ BEN BTN BOL BIH BWA BRA BRN BGR BFA BDI CPV KHM '
      'CMR CAN CAF TCD CHL CHN COL COM COG COD CRI CIV HRV CUB CYP CZE DNK DJI DMA DOM ECU EGY SLV GNQ ERI EST SWZ ETH FJI FIN '
      'FRA GAB GMB GEO DEU GHA GRC GRD GTM GIN GNB GUY HTI HND HUN ISL IND IDN IRN IRQ IRL ISR ITA JAM JPN JOR KAZ KEN KIR PRK '
      'KOR KWT KGZ LAO LVA LBN LSO LBR LBY LIE LTU LUX MDG MWI MYS MDV MLI MLT MHL MRT MUS MEX FSM MDA MCO MNG MNE MAR MOZ MMR '
      'NAM NRU NPL NLD NZL NIC NER NGA MKD NOR OMN PAK PLW PAN PNG PRY PER PHL POL PRT QAT ROU RUS RWA KNA LCA VCT WSM SMR STP '
      'SAU SEN SRB SYC SLE SGP SVK SVN SLB SOM ZAF SSD ESP LKA SDN SUR SWE CHE SYR TJK TZA THA TLS TGO TON TTO TUN TUR TKM TUV '
      'UGA UKR ARE GBR USA URY UZB VUT VEN VNM YEM ZMB ZWE VAT PSE').split()
NE_CODE = {'SSD': 'SDS', 'PSE': 'PSX'}  # Natural Earth's own codes
# Capitals Natural Earth lacks, and picks where a country has several.
CAPITAL_FIX = {
    'NRU': ('Yaren', -0.547, 166.921, 1100), 'SSD': ('Juba', 4.859, 31.571, 525953), 'PSE': ('Ramallah', 31.903, 35.204, 38998),
}
CAPITAL_PICK = {'ZAF': 'Pretoria', 'BOL': 'La Paz', 'CIV': 'Yamoussoukro'}


def rings_of(geom):
    return [geom['coordinates']] if geom['type'] == 'Polygon' else geom['coordinates']


def simplify(pts, tol):
    if len(pts) < 4:
        return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        best, bi = -1, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            # Closed rings start and end on the same point: fall back to point distance.
            d = abs(dy * px - dx * py + bx * ay - by * ax) / L if L > 1e-6 else math.hypot(px - ax, py - ay)
            if d > best:
                best, bi = d, i
        if best > tol:
            keep[bi] = True
            stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def enc_ring(ring, tol):
    s = simplify(ring, tol)
    if len(s) < 4:
        return None
    out, px, py = [], 0, 0
    for lon, lat in s:  # delta-encoded at 0.05 degree resolution
        x, y = round(lon * 20), round(lat * 20)
        out += [x - px, y - py]
        px, py = x, y
    return out


# ---------- land raster for the sea-routing grid ----------
RW, RH = 3600, 1800
img = Image.new('1', (RW, RH), 0)
dr = ImageDraw.Draw(img)
for f in load('ne_50m_land.geojson')['features']:
    for poly in rings_of(f['geometry']):
        dr.polygon([((lon + 180) * 10, (90 - lat) * 10) for lon, lat in poly[0]], fill=1)
        for hole in poly[1:]:
            dr.polygon([((lon + 180) * 10, (90 - lat) * 10) for lon, lat in hole], fill=0)
pix = img.load()
is_land = lambda lon, lat: 0 <= int((lon + 180) * 10) < RW and 0 <= int((90 - lat) * 10) < RH and pix[int((lon + 180) * 10), int((90 - lat) * 10)] == 1


def coastal(lon, lat, r=0.4):
    return any(not is_land(lon + math.cos(k / 16 * 6.283) * r / max(0.3, math.cos(math.radians(lat))), lat + math.sin(k / 16 * 6.283) * r) for k in range(16))


SW, SH = 360, 180
bits = bytearray((SW * SH + 7) // 8)
for y in range(SH):
    for x in range(SW):
        land = sum(1 for i in range(3) for j in range(3) if is_land(x - 180 + 0.17 + i * 0.33, 90 - y - 0.17 - j * 0.33))
        if land <= 3:
            i = y * SW + x
            bits[i >> 3] |= 1 << (i & 7)

# ---------- countries ----------
tiny = {f['properties']['ADM0_A3']: f for f in load('ne_50m_admin_0_tiny_countries.geojson')['features']}
countries, vert_owner = [], defaultdict(set)
ne_to_un = {NE_CODE.get(u, u): u for u in UN}
for f in load('ne_50m_admin_0_countries.geojson')['features']:
    p = f['properties']
    if p['ADM0_A3'] == 'ATA':
        continue
    code = ne_to_un.get(p['ADM0_A3'], p['ADM0_A3'])
    rings, area = [], 0
    for poly in rings_of(f['geometry']):
        outer = poly[0]
        a = abs(sum(outer[i][0] * outer[i + 1][1] - outer[i + 1][0] * outer[i][1] for i in range(len(outer) - 1))) / 2
        area += a
        e = enc_ring(outer, 0.06 if a > 2 else 0.025)
        if e:
            rings.append(e)
        for lon, lat in outer:
            vert_owner[(round(lon, 2), round(lat, 2))].add(code)
    a2 = p['ISO_A2_EH'] if p['ISO_A2_EH'] not in (None, '-99') else p['ISO_A2']
    countries.append({'a3': code, 'a2': a2 if a2 and a2 != '-99' else '', 'name': p['NAME'], 'sub': p['SUBREGION'], 'cont': p['CONTINENT'],
                      'pop': int(p['POP_EST'] or 0), 'gdp': int(p['GDP_MD'] or 0), 'lx': round(p['LABEL_X'], 2), 'ly': round(p['LABEL_Y'], 2),
                      'area': round(area, 3), 'rings': rings, 'un': code in UN})
have = {c['a3'] for c in countries if c['un']}
for u in UN:
    if u in have:
        continue
    t = tiny.get(NE_CODE.get(u, u))
    p = t['properties']
    lon, lat = t['geometry']['coordinates']
    countries.append({'a3': u, 'a2': p['ISO_A2'], 'name': p['NAME'], 'sub': p['SUBREGION'], 'cont': p['CONTINENT'], 'pop': int(p['POP_EST'] or 0),
                      'gdp': int(p['GDP_MD'] or 0), 'lx': round(lon, 2), 'ly': round(lat, 2), 'area': 0, 'rings': [], 'un': True})
pairs = defaultdict(int)
for owners in vert_owner.values():
    o = sorted(owners)
    for i in range(len(o)):
        for j in range(i + 1, len(o)):
            pairs[(o[i], o[j])] += 1
nb = defaultdict(list)
for (a, b), n in pairs.items():
    if n >= 2:
        nb[a].append(b); nb[b].append(a)
for c in countries:
    c['nb'] = sorted(x for x in nb.get(c['a3'], []) if x in UN) if c['un'] else []

# ---------- airports ----------
airports = defaultdict(list)
with open(os.path.join(D, 'airports.csv')) as fh:
    for r in csv.DictReader(fh):
        if r['type'] in ('large_airport', 'medium_airport') and len(r['iata_code'] or '') == 3:
            try:
                lat, lon = [float(v) for v in r['coordinates'].split(',')]
            except ValueError:
                continue
            airports[r['iso_country']].append((r['type'] == 'large_airport', r['municipality'] or '', r['iata_code'], lat, lon))
HUBS = set('JFK ORD IAD GRU GIG HND ICN PVG PEK CDG LHR FCO FRA MUC IST DXB SIN BKK KUL CGK MEX YYZ YOW SYD MEL JNB CAI DEL BOM SVO EZE BOG LIM SCL MAD AMS ZRH VIE CPH ARN OSL HEL WAW PRG BUD ATH LIS DUB BRU TPE MNL SGN HAN DAC ISB TLV RUH DOH AUH KWI MCT BAH IKA BGW AMM BEY RBA ALG TUN LOS ABV NBO ADD DAR ACC DKR LAD WLG CBR'.split())


def iata(name, a2, lat, lon, used):
    best, bd = None, 1e9
    for large, muni, code, alat, alon in airports.get(a2, []):
        d = math.hypot(alat - lat, (alon - lon) * math.cos(math.radians(lat)))
        if code in used or d > 1.0:
            continue
        s = d - (0.5 if large else 0) - (0.4 if muni.lower() == name.lower() else 0) - (1.5 if code in HUBS else 0)
        if s < bd:
            bd, best = s, code
    return best


# ---------- capitals ----------
caps = defaultdict(list)
for f in load('ne_10m_populated_places_simple.geojson')['features']:
    p = f['properties']
    if p['adm0cap']:
        caps[p['adm0_a3']].append(p)
byc = {c['a3']: c for c in countries}
cities, used = [], set()
for u in sorted(UN, key=lambda u: -byc[u]['pop']):
    if u in CAPITAL_FIX:
        name, lat, lon, pop = CAPITAL_FIX[u]
    else:
        opts = caps[NE_CODE.get(u, u)]
        pick = [p for p in opts if p['name'] == CAPITAL_PICK.get(u)] or sorted(opts, key=lambda p: -(p['pop_max'] or 0))
        p = pick[0]
        name, lat, lon, pop = p['nameascii'] or p['name'], p['latitude'], p['longitude'], p['pop_max'] or 0
    code = iata(name, byc[u]['a2'], lat, lon, used)
    if not code:
        base = ''.join(ch for ch in name.upper() if ch.isalpha()) + 'XXX'
        code, k = base[:3], 0
        while code in used:
            k += 1
            code = base[0] + base[(1 + k) % max(2, len(base) - 3)] + chr(65 + (k * 7) % 26)
    used.add(code)
    cities.append({'n': name, 'c': u, 'code': code, 'lat': round(lat, 3), 'lon': round(lon, 3), 'pop': int(pop), 'port': 1 if coastal(lon, lat) else 0})

js = ('// Generated by tools/build_world.py from Natural Earth and OurAirports (public domain).\n'
      'const WORLD_DATA = ' + json.dumps({'countries': countries, 'cities': cities, 'water': {'w': SW, 'h': SH, 'b64': base64.b64encode(bytes(bits)).decode()}}, separators=(',', ':')) + ';\n')
open(OUT, 'w').write(js)
print('shapes', len(countries), 'playable', sum(c['un'] for c in countries), 'capitals', len(cities), 'coastal', sum(c['port'] for c in cities), 'bytes', len(js))
