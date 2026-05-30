// ── Frankfurter supported currencies ────────────────────────────
const SUPPORTED_CURRENCIES = new Set([
  'AUD','BRL','CAD','CHF','CNY','CZK','DKK','EUR','GBP',
  'HKD','HUF','IDR','ILS','INR','ISK','JPY','KRW','MXN',
  'MYR','NOK','NZD','PHP','PLN','RON','SEK','SGD','THB',
  'TRY','USD','ZAR',
]);

// ── Base-unit factors (multiply to reach base, divide to leave) ──
// LENGTH → metre
const LENGTH = {
  ym:1e-24, zm:1e-21, am:1e-18, fm:1e-15, pm:1e-12, nm:1e-9, um:1e-6,
  mm:0.001, cm:0.01, dm:0.1, m:1, dam:10, hm:100, km:1000, Mm:1e6, Gm:1e9,
  in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344, thou:2.54e-5, link:0.201168,
  rod:5.0292, chain:20.1168, furlong:201.168, league:4828.032,
  nmi:1852, fathom:1.8288, cable:185.2,
  ly:9.4607304725808e15, au:1.495978707e11, pc:3.085677581e16, kpc:3.085677581e19,
  angstrom:1e-10, xu:1.00209952e-13,
};

// MASS → gram
const MASS = {
  yg:1e-21, zg:1e-18, ag:1e-15, fg:1e-12, pg:1e-9, ng:1e-6, ug:0.001,
  mg:0.001, cg:0.01, dg:0.1, g:1, dag:10, hg:100, kg:1000,
  t:1e6, kt:1e9, Mt:1e12,
  lb:453.59237, oz:28.349523125, dr:1.7718451953, gr:0.06479891,
  'ton-us':907184.74, 'ton-uk':1016046.9088, st:6350.29318,
  'troy-oz':31.1034768, 'troy-lb':373.2417216, dwt:1.55517384,
  ct:0.2, amu:1.66053906660e-21,
};

// VOLUME → litre
const VOLUME = {
  ml:0.001, cl:0.01, dl:0.1, l:1, kl:1000, Ml:1e6,
  cm3:0.001, dm3:1, m3:1000, mm3:1e-6, km3:1e12,
  'gal-us':3.785411784, 'qt-us':0.946352946, 'pt-us':0.473176473,
  'cup-us':0.2365882365, 'floz-us':0.0295735296, 'tbsp-us':0.0147867648, 'tsp-us':0.00492892159,
  'gal-uk':4.54609, 'qt-uk':1.1365225, 'pt-uk':0.56826125, 'floz-uk':0.0284130625,
  'cup-metric':0.25, 'cup-uk':0.284130625, 'cup-ca':0.2273045,
  'bbl-oil':158.987295, 'bbl-us':119.240471, 'bbl-uk':163.659238,
  'bu-us':35.23907017, 'bu-uk':36.36872, 'pk-us':8.80976754,
  'gi-us':0.118294118, 'gi-uk':0.142065313,
  'cord':3624.556, 'board-ft':2.359737216,
};

// SPEED → m/s
const SPEED = {
  mps:1, kph:1/3.6, mph:0.44704, fps:0.3048, fpm:0.00508,
  kt:0.514444, 'kt-uk':0.514773,
  mach:340.29, mach_sea:340.29,
  c:299792458,
};

// AREA → m²
const AREA = {
  mm2:1e-6, cm2:1e-4, dm2:0.01, m2:1, dam2:100, hm2:1e4, km2:1e6,
  in2:6.4516e-4, ft2:0.09290304, yd2:0.83612736, mi2:2589988.110336,
  ac:4046.8564224, ha:10000, ro:1011.7141056,
  'barn':1e-28,
};

// TIME → second
const TIME = {
  ns:1e-9, us:1e-6, ms:0.001, s:1, min:60, hr:3600,
  day:86400, wk:604800,
  mo:2629746, yr:31556952, decade:315569520, cent:3155695200, millennium:31556952000,
  fortnight:1209600, shake:1e-8,
};

// DIGITAL → bit
const DIGITAL = {
  b:1, B:8,
  Kb:1e3, KB:8e3, Mb:1e6, MB:8e6, Gb:1e9, GB:8e9, Tb:1e12, TB:8e12,
  Pb:1e15, PB:8e15, Eb:1e18, EB:8e18, Zb:1e21, ZB:8e21, Yb:1e24, YB:8e24,
  Kib:1024, KiB:8192, Mib:1048576, MiB:8388608,
  Gib:1073741824, GiB:8589934592,
  Tib:1099511627776, TiB:8796093022208,
  Pib:1125899906842624, PiB:9007199254740992,
};

// PRESSURE → pascal
const PRESSURE = {
  Pa:1, hPa:100, kPa:1000, MPa:1e6, GPa:1e9,
  bar:1e5, mbar:100, ubar:0.1, kbar:1e8,
  atm:101325, at:98066.5,
  psi:6894.757, psf:47.88026, ksi:6894757,
  torr:133.32237, mmHg:133.32237, cmHg:1333.22, inHg:3386.389,
  mmH2O:9.80665, cmH2O:98.0665, inH2O:249.08891, ftH2O:2988.98,
  'kgf/cm2':98066.5, 'kgf/m2':9.80665,
};

// ENERGY → joule
const ENERGY = {
  J:1, kJ:1000, MJ:1e6, GJ:1e9, TJ:1e12, PJ:1e15,
  mJ:0.001, uJ:1e-6, nJ:1e-9,
  cal:4.184, kcal:4184, Cal:4184,
  Wh:3600, kWh:3.6e6, MWh:3.6e9, GWh:3.6e12,
  BTU:1055.05585, MMBTU:1055055.85, therm:105505585.26,
  'ft-lbf':1.3558179483, 'in-lbf':0.112984829, 'ft-pdl':0.04214011,
  eV:1.602176634e-19, keV:1.602176634e-16, MeV:1.602176634e-13, GeV:1.602176634e-10,
  erg:1e-7, 'hartree':4.3597447222071e-18,
  tonne_tnt:4.184e9,
};

// POWER → watt
const POWER = {
  W:1, mW:0.001, uW:1e-6, kW:1000, MW:1e6, GW:1e9, TW:1e12,
  'hp-mech':745.69987, 'hp-metric':735.49875, 'hp-elec':746, 'hp-boiler':9809.5,
  BTU_hr:0.29307107, BTU_min:17.5842644, BTU_s:1055.05585,
  'ft-lbf/s':1.3558179, 'ft-lbf/min':0.022596966,
  'kcal/hr':1.163, 'kcal/min':69.78, 'kcal/s':4184,
  CV:735.49875, PS:735.49875, erg_s:1e-7,
};

// FREQUENCY → hertz
const FREQUENCY = {
  Hz:1, kHz:1000, MHz:1e6, GHz:1e9, THz:1e12, PHz:1e15,
  mHz:0.001, uHz:1e-6,
  rpm:1/60, rps:1, rad_s:1/(2*Math.PI),
};

// ANGLE → degree
const ANGLE = {
  deg:1, rad:180/Math.PI, grad:0.9, gon:0.9,
  arcmin:1/60, arcsec:1/3600, mas:1/3600000,
  turn:360, rev:360, cycle:360,
  mil:360/6400, 'mil-nato':360/6400, 'mil-ru':360/6000,
  quadrant:90, sextant:60, octant:45,
};

// FORCE → newton
const FORCE = {
  N:1, kN:1000, MN:1e6, mN:0.001, uN:1e-6,
  'kgf':9.80665, 'gf':0.00980665, 'tf-metric':9806.65,
  'lbf':4.4482216153, 'ozf':0.27801385, 'pdl':0.13825495,
  'tonf-us':8896.443, 'tonf-uk':9964.016,
  dyn:1e-5,
};

// TORQUE → newton·metre
const TORQUE = {
  Nm:1, kNm:1000, mNm:0.001, Ncm:0.01,
  'ft-lbf':1.3558179, 'in-lbf':0.11298483, 'ft-pdl':0.04214011,
  'kgf-m':9.80665, 'kgf-cm':0.0980665, 'gf-cm':9.80665e-5,
  'ozf-in':0.00706155,
};

// FUEL ECONOMY — special: inverse-based, base is L/100km
// mpg-us → L/100km: 235.214583 / x
// mpg-uk → L/100km: 282.481053 / x
// km/L   → L/100km: 100 / x

// TEMPERATURE — formula based, handled separately

// ── Unit options for dropdowns ───────────────────────────────────
export const UNIT_OPTIONS = {
  length: [
    { value: 'mm',      label: 'mm — Millimeter' },
    { value: 'cm',      label: 'cm — Centimeter' },
    { value: 'm',       label: 'm — Meter' },
    { value: 'km',      label: 'km — Kilometer' },
    { value: 'thou',    label: 'thou — Thou (mil)' },
    { value: 'in',      label: 'in — Inch' },
    { value: 'ft',      label: 'ft — Foot' },
    { value: 'yd',      label: 'yd — Yard' },
    { value: 'rod',     label: 'rod — Rod' },
    { value: 'chain',   label: 'chain — Chain' },
    { value: 'furlong', label: 'furlong — Furlong' },
    { value: 'mi',      label: 'mi — Mile' },
    { value: 'league',  label: 'league — League' },
    { value: 'fathom',  label: 'fathom — Fathom' },
    { value: 'cable',   label: 'cable — Cable' },
    { value: 'nmi',     label: 'nmi — Nautical Mile' },
    { value: 'nm',      label: 'nm — Nanometer' },
    { value: 'um',      label: 'μm — Micrometer' },
    { value: 'pm',      label: 'pm — Picometer' },
    { value: 'fm',      label: 'fm — Femtometer' },
    { value: 'angstrom',label: 'Å — Ångström' },
    { value: 'au',      label: 'au — Astronomical Unit' },
    { value: 'ly',      label: 'ly — Light Year' },
    { value: 'pc',      label: 'pc — Parsec' },
    { value: 'kpc',     label: 'kpc — Kiloparsec' },
    { value: 'Mm',      label: 'Mm — Megameter' },
    { value: 'Gm',      label: 'Gm — Gigameter' },
  ],
  mass: [
    { value: 'mg',      label: 'mg — Milligram' },
    { value: 'g',       label: 'g — Gram' },
    { value: 'kg',      label: 'kg — Kilogram' },
    { value: 't',       label: 't — Metric Ton' },
    { value: 'oz',      label: 'oz — Ounce' },
    { value: 'lb',      label: 'lb — Pound' },
    { value: 'st',      label: 'st — Stone' },
    { value: 'ton-us',  label: 'ton — US Short Ton' },
    { value: 'ton-uk',  label: 'ton UK — Long Ton' },
    { value: 'gr',      label: 'gr — Grain' },
    { value: 'dr',      label: 'dr — Dram' },
    { value: 'troy-oz', label: 'troy oz — Troy Ounce' },
    { value: 'troy-lb', label: 'troy lb — Troy Pound' },
    { value: 'dwt',     label: 'dwt — Pennyweight' },
    { value: 'ct',      label: 'ct — Carat' },
    { value: 'ug',      label: 'μg — Microgram' },
    { value: 'pg',      label: 'pg — Picogram' },
    { value: 'ng',      label: 'ng — Nanogram' },
    { value: 'kt',      label: 'kt — Kiloton' },
    { value: 'Mt',      label: 'Mt — Megaton' },
    { value: 'amu',     label: 'u — Atomic Mass Unit' },
  ],
  temperature: [
    { value: 'C',  label: '°C — Celsius' },
    { value: 'F',  label: '°F — Fahrenheit' },
    { value: 'K',  label: 'K — Kelvin' },
    { value: 'R',  label: '°R — Rankine' },
    { value: 'De', label: '°De — Delisle' },
    { value: 'N',  label: '°N — Newton' },
    { value: 'Re', label: '°Ré — Réaumur' },
    { value: 'Ro', label: '°Rø — Rømer' },
  ],
  volume: [
    { value: 'ml',      label: 'ml — Milliliter' },
    { value: 'cl',      label: 'cl — Centiliter' },
    { value: 'dl',      label: 'dl — Deciliter' },
    { value: 'l',       label: 'L — Liter' },
    { value: 'kl',      label: 'kL — Kiloliter' },
    { value: 'cm3',     label: 'cm³ — Cubic Centimeter' },
    { value: 'm3',      label: 'm³ — Cubic Meter' },
    { value: 'mm3',     label: 'mm³ — Cubic Millimeter' },
    { value: 'km3',     label: 'km³ — Cubic Kilometer' },
    { value: 'tsp-us',  label: 'tsp — Teaspoon (US)' },
    { value: 'tbsp-us', label: 'tbsp — Tablespoon (US)' },
    { value: 'floz-us', label: 'fl oz — Fluid Ounce (US)' },
    { value: 'cup-us',  label: 'cup — Cup (US)' },
    { value: 'pt-us',   label: 'pt — Pint (US)' },
    { value: 'qt-us',   label: 'qt — Quart (US)' },
    { value: 'gal-us',  label: 'gal — Gallon (US)' },
    { value: 'floz-uk', label: 'fl oz UK — Fluid Ounce (UK)' },
    { value: 'cup-uk',  label: 'cup UK — Cup (UK)' },
    { value: 'pt-uk',   label: 'pt UK — Pint (UK)' },
    { value: 'qt-uk',   label: 'qt UK — Quart (UK)' },
    { value: 'gal-uk',  label: 'gal UK — Gallon (UK)' },
    { value: 'cup-metric', label: 'cup metric — Cup (Metric)' },
    { value: 'cup-ca',  label: 'cup CA — Cup (Canadian)' },
    { value: 'bbl-oil', label: 'bbl — Barrel (Oil)' },
    { value: 'bbl-us',  label: 'bbl US — Barrel (US)' },
    { value: 'bu-us',   label: 'bu — Bushel (US)' },
    { value: 'bu-uk',   label: 'bu UK — Bushel (UK)' },
    { value: 'gi-us',   label: 'gi — Gill (US)' },
    { value: 'gi-uk',   label: 'gi UK — Gill (UK)' },
  ],
  speed: [
    { value: 'mps',  label: 'm/s — Meters per Second' },
    { value: 'kph',  label: 'km/h — Kilometers per Hour' },
    { value: 'mph',  label: 'mph — Miles per Hour' },
    { value: 'fps',  label: 'fps — Feet per Second' },
    { value: 'fpm',  label: 'fpm — Feet per Minute' },
    { value: 'kt',   label: 'kn — Knot' },
    { value: 'kt-uk',label: 'kn UK — Knot (UK)' },
    { value: 'mach', label: 'Mach — Mach Number' },
    { value: 'c',    label: 'c — Speed of Light' },
  ],
  area: [
    { value: 'mm2', label: 'mm² — Square Millimeter' },
    { value: 'cm2', label: 'cm² — Square Centimeter' },
    { value: 'm2',  label: 'm² — Square Meter' },
    { value: 'km2', label: 'km² — Square Kilometer' },
    { value: 'in2', label: 'in² — Square Inch' },
    { value: 'ft2', label: 'ft² — Square Foot' },
    { value: 'yd2', label: 'yd² — Square Yard' },
    { value: 'mi2', label: 'mi² — Square Mile' },
    { value: 'ac',  label: 'ac — Acre' },
    { value: 'ha',  label: 'ha — Hectare' },
    { value: 'ro',  label: 'ro — Rood' },
    { value: 'barn',label: 'barn — Barn' },
    { value: 'dm2', label: 'dm² — Square Decimeter' },
    { value: 'dam2',label: 'dam² — Square Decameter' },
    { value: 'hm2', label: 'hm² — Square Hectometer' },
  ],
  time: [
    { value: 'ns',          label: 'ns — Nanosecond' },
    { value: 'us',          label: 'μs — Microsecond' },
    { value: 'ms',          label: 'ms — Millisecond' },
    { value: 's',           label: 's — Second' },
    { value: 'min',         label: 'min — Minute' },
    { value: 'hr',          label: 'hr — Hour' },
    { value: 'day',         label: 'day — Day' },
    { value: 'wk',          label: 'wk — Week' },
    { value: 'fortnight',   label: 'fortnight — Fortnight' },
    { value: 'mo',          label: 'mo — Month' },
    { value: 'yr',          label: 'yr — Year' },
    { value: 'decade',      label: 'decade — Decade' },
    { value: 'cent',        label: 'cent — Century' },
    { value: 'millennium',  label: 'millennium — Millennium' },
    { value: 'shake',       label: 'shake — Shake (10 ns)' },
  ],
  digital: [
    { value: 'b',   label: 'b — Bit' },
    { value: 'B',   label: 'B — Byte' },
    { value: 'Kb',  label: 'Kb — Kilobit' },
    { value: 'KB',  label: 'KB — Kilobyte' },
    { value: 'Kib', label: 'Kib — Kibibit' },
    { value: 'KiB', label: 'KiB — Kibibyte' },
    { value: 'Mb',  label: 'Mb — Megabit' },
    { value: 'MB',  label: 'MB — Megabyte' },
    { value: 'Mib', label: 'Mib — Mebibit' },
    { value: 'MiB', label: 'MiB — Mebibyte' },
    { value: 'Gb',  label: 'Gb — Gigabit' },
    { value: 'GB',  label: 'GB — Gigabyte' },
    { value: 'Gib', label: 'Gib — Gibibit' },
    { value: 'GiB', label: 'GiB — Gibibyte' },
    { value: 'Tb',  label: 'Tb — Terabit' },
    { value: 'TB',  label: 'TB — Terabyte' },
    { value: 'Tib', label: 'Tib — Tebibit' },
    { value: 'TiB', label: 'TiB — Tebibyte' },
    { value: 'Pb',  label: 'Pb — Petabit' },
    { value: 'PB',  label: 'PB — Petabyte' },
    { value: 'Pib', label: 'Pib — Pebibit' },
    { value: 'PiB', label: 'PiB — Pebibyte' },
    { value: 'Eb',  label: 'Eb — Exabit' },
    { value: 'EB',  label: 'EB — Exabyte' },
    { value: 'Zb',  label: 'Zb — Zettabit' },
    { value: 'ZB',  label: 'ZB — Zettabyte' },
  ],
  pressure: [
    { value: 'Pa',      label: 'Pa — Pascal' },
    { value: 'hPa',     label: 'hPa — Hectopascal' },
    { value: 'kPa',     label: 'kPa — Kilopascal' },
    { value: 'MPa',     label: 'MPa — Megapascal' },
    { value: 'GPa',     label: 'GPa — Gigapascal' },
    { value: 'bar',     label: 'bar — Bar' },
    { value: 'mbar',    label: 'mbar — Millibar' },
    { value: 'kbar',    label: 'kbar — Kilobar' },
    { value: 'atm',     label: 'atm — Atmosphere' },
    { value: 'at',      label: 'at — Technical Atm' },
    { value: 'psi',     label: 'psi — PSI' },
    { value: 'psf',     label: 'psf — lb/ft²' },
    { value: 'ksi',     label: 'ksi — Kilopound/in²' },
    { value: 'torr',    label: 'Torr — Torr' },
    { value: 'mmHg',    label: 'mmHg — mm of Mercury' },
    { value: 'cmHg',    label: 'cmHg — cm of Mercury' },
    { value: 'inHg',    label: 'inHg — in of Mercury' },
    { value: 'mmH2O',   label: 'mmH₂O — mm of Water' },
    { value: 'cmH2O',   label: 'cmH₂O — cm of Water' },
    { value: 'inH2O',   label: 'inH₂O — in of Water' },
    { value: 'ftH2O',   label: 'ftH₂O — ft of Water' },
  ],
  energy: [
    { value: 'J',         label: 'J — Joule' },
    { value: 'kJ',        label: 'kJ — Kilojoule' },
    { value: 'MJ',        label: 'MJ — Megajoule' },
    { value: 'GJ',        label: 'GJ — Gigajoule' },
    { value: 'TJ',        label: 'TJ — Terajoule' },
    { value: 'mJ',        label: 'mJ — Millijoule' },
    { value: 'cal',       label: 'cal — Calorie' },
    { value: 'kcal',      label: 'kcal — Kilocalorie' },
    { value: 'Wh',        label: 'Wh — Watt-Hour' },
    { value: 'kWh',       label: 'kWh — Kilowatt-Hour' },
    { value: 'MWh',       label: 'MWh — Megawatt-Hour' },
    { value: 'GWh',       label: 'GWh — Gigawatt-Hour' },
    { value: 'BTU',       label: 'BTU — British Thermal Unit' },
    { value: 'MMBTU',     label: 'MMBTU — Million BTU' },
    { value: 'therm',     label: 'therm — Therm' },
    { value: 'ft-lbf',   label: 'ft·lbf — Foot-Pound' },
    { value: 'in-lbf',   label: 'in·lbf — Inch-Pound' },
    { value: 'eV',        label: 'eV — Electronvolt' },
    { value: 'keV',       label: 'keV — Kiloelectronvolt' },
    { value: 'MeV',       label: 'MeV — Megaelectronvolt' },
    { value: 'GeV',       label: 'GeV — Gigaelectronvolt' },
    { value: 'erg',       label: 'erg — Erg' },
    { value: 'tonne_tnt', label: 'tTNT — Tonne of TNT' },
  ],
  power: [
    { value: 'W',          label: 'W — Watt' },
    { value: 'mW',         label: 'mW — Milliwatt' },
    { value: 'uW',         label: 'μW — Microwatt' },
    { value: 'kW',         label: 'kW — Kilowatt' },
    { value: 'MW',         label: 'MW — Megawatt' },
    { value: 'GW',         label: 'GW — Gigawatt' },
    { value: 'TW',         label: 'TW — Terawatt' },
    { value: 'hp-mech',    label: 'hp — Horsepower (Mech)' },
    { value: 'hp-metric',  label: 'PS — Horsepower (Metric)' },
    { value: 'hp-elec',    label: 'hp-e — Horsepower (Elec)' },
    { value: 'hp-boiler',  label: 'hp-b — Horsepower (Boiler)' },
    { value: 'BTU_hr',     label: 'BTU/hr — BTU per Hour' },
    { value: 'BTU_min',    label: 'BTU/min — BTU per Minute' },
    { value: 'BTU_s',      label: 'BTU/s — BTU per Second' },
    { value: 'kcal/hr',    label: 'kcal/hr — kcal per Hour' },
    { value: 'kcal/min',   label: 'kcal/min — kcal per Minute' },
    { value: 'CV',         label: 'CV — Caballo de Vapor' },
    { value: 'erg_s',      label: 'erg/s — Erg per Second' },
  ],
  frequency: [
    { value: 'uHz',   label: 'μHz — Microhertz' },
    { value: 'mHz',   label: 'mHz — Millihertz' },
    { value: 'Hz',    label: 'Hz — Hertz' },
    { value: 'kHz',   label: 'kHz — Kilohertz' },
    { value: 'MHz',   label: 'MHz — Megahertz' },
    { value: 'GHz',   label: 'GHz — Gigahertz' },
    { value: 'THz',   label: 'THz — Terahertz' },
    { value: 'PHz',   label: 'PHz — Petahertz' },
    { value: 'rpm',   label: 'rpm — Revolutions/min' },
    { value: 'rps',   label: 'rps — Revolutions/sec' },
    { value: 'rad_s', label: 'rad/s — Radians/sec' },
  ],
  angle: [
    { value: 'deg',      label: '° — Degree' },
    { value: 'rad',      label: 'rad — Radian' },
    { value: 'grad',     label: 'grad — Gradian' },
    { value: 'gon',      label: 'gon — Gon' },
    { value: 'arcmin',   label: "' — Arcminute" },
    { value: 'arcsec',   label: '" — Arcsecond' },
    { value: 'mas',      label: 'mas — Milliarcsecond' },
    { value: 'turn',     label: 'turn — Turn/Revolution' },
    { value: 'rev',      label: 'rev — Revolution' },
    { value: 'mil',      label: 'mil — Mil (NATO)' },
    { value: 'mil-ru',   label: 'mil-ru — Mil (Russian)' },
    { value: 'quadrant', label: 'quadrant — Quadrant' },
    { value: 'sextant',  label: 'sextant — Sextant' },
    { value: 'octant',   label: 'octant — Octant' },
  ],
  force: [
    { value: 'N',       label: 'N — Newton' },
    { value: 'mN',      label: 'mN — Millinewton' },
    { value: 'uN',      label: 'μN — Micronewton' },
    { value: 'kN',      label: 'kN — Kilonewton' },
    { value: 'MN',      label: 'MN — Meganewton' },
    { value: 'kgf',     label: 'kgf — Kilogram-Force' },
    { value: 'gf',      label: 'gf — Gram-Force' },
    { value: 'tf-metric',label: 'tf — Tonne-Force' },
    { value: 'lbf',     label: 'lbf — Pound-Force' },
    { value: 'ozf',     label: 'ozf — Ounce-Force' },
    { value: 'pdl',     label: 'pdl — Poundal' },
    { value: 'tonf-us', label: 'tonf — Ton-Force (US)' },
    { value: 'tonf-uk', label: 'tonf UK — Ton-Force (UK)' },
    { value: 'dyn',     label: 'dyn — Dyne' },
  ],
  torque: [
    { value: 'Nm',     label: 'N·m — Newton-Meter' },
    { value: 'kNm',    label: 'kN·m — Kilonewton-Meter' },
    { value: 'mNm',    label: 'mN·m — Millinewton-Meter' },
    { value: 'Ncm',    label: 'N·cm — Newton-Centimeter' },
    { value: 'ft-lbf', label: 'ft·lbf — Foot-Pound' },
    { value: 'in-lbf', label: 'in·lbf — Inch-Pound' },
    { value: 'ft-pdl', label: 'ft·pdl — Foot-Poundal' },
    { value: 'kgf-m',  label: 'kgf·m — kgf-Meter' },
    { value: 'kgf-cm', label: 'kgf·cm — kgf-Centimeter' },
    { value: 'gf-cm',  label: 'gf·cm — gf-Centimeter' },
    { value: 'ozf-in', label: 'ozf·in — Ounce-Force Inch' },
  ],
  fuel: [
    { value: 'mpg-us', label: 'mpg — Miles/Gallon (US)' },
    { value: 'mpg-uk', label: 'mpg UK — Miles/Gallon (UK)' },
    { value: 'kpl',    label: 'km/L — Kilometers/Liter' },
    { value: 'l100km', label: 'L/100km — Liters/100km' },
  ],
  currency: [
    { value: 'USD', label: 'USD — US Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'JPY', label: 'JPY — Japanese Yen' },
    { value: 'CNY', label: 'CNY — Chinese Yuan' },
    { value: 'INR', label: 'INR — Indian Rupee' },
    { value: 'CAD', label: 'CAD — Canadian Dollar' },
    { value: 'AUD', label: 'AUD — Australian Dollar' },
    { value: 'CHF', label: 'CHF — Swiss Franc' },
    { value: 'KRW', label: 'KRW — S. Korean Won' },
    { value: 'MXN', label: 'MXN — Mexican Peso' },
    { value: 'BRL', label: 'BRL — Brazilian Real' },
    { value: 'SEK', label: 'SEK — Swedish Krona' },
    { value: 'NOK', label: 'NOK — Norwegian Krone' },
    { value: 'DKK', label: 'DKK — Danish Krone' },
    { value: 'SGD', label: 'SGD — Singapore Dollar' },
    { value: 'HKD', label: 'HKD — Hong Kong Dollar' },
    { value: 'NZD', label: 'NZD — New Zealand Dollar' },
    { value: 'TRY', label: 'TRY — Turkish Lira' },
    { value: 'ZAR', label: 'ZAR — South African Rand' },
    { value: 'PLN', label: 'PLN — Polish Zloty' },
    { value: 'HUF', label: 'HUF — Hungarian Forint' },
    { value: 'CZK', label: 'CZK — Czech Koruna' },
    { value: 'PHP', label: 'PHP — Philippine Peso' },
    { value: 'THB', label: 'THB — Thai Baht' },
    { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
    { value: 'IDR', label: 'IDR — Indonesian Rupiah' },
    { value: 'ILS', label: 'ILS — Israeli Shekel' },
    { value: 'ISK', label: 'ISK — Icelandic Króna' },
    { value: 'RON', label: 'RON — Romanian Leu' },
  ],
};

// ── Type themes ──────────────────────────────────────────────────
export const TYPE_META = {
  currency:    { label: 'Currency',     icon: '💱', color: [16,185,129]  },
  length:      { label: 'Length',       icon: '📏', color: [59,130,246]  },
  mass:        { label: 'Weight / Mass',icon: '⚖️', color: [139,92,246]  },
  temperature: { label: 'Temperature',  icon: '🌡️', color: [249,115,22]  },
  volume:      { label: 'Volume',       icon: '🧪', color: [6,182,212]   },
  speed:       { label: 'Speed',        icon: '💨', color: [234,179,8]   },
  area:        { label: 'Area',         icon: '⬛', color: [20,184,166]  },
  time:        { label: 'Time',         icon: '⏱️', color: [99,102,241]  },
  digital:     { label: 'Data / Storage',icon:'💾', color: [236,72,153]  },
  pressure:    { label: 'Pressure',     icon: '🔵', color: [244,63,94]   },
  energy:      { label: 'Energy',       icon: '⚡', color: [245,158,11]  },
  power:       { label: 'Power',        icon: '🔋', color: [168,85,247]  },
  frequency:   { label: 'Frequency',    icon: '〰️', color: [34,211,238]  },
  angle:       { label: 'Angle',        icon: '📐', color: [74,222,128]  },
  force:       { label: 'Force',        icon: '💪', color: [251,113,133] },
  torque:      { label: 'Torque',       icon: '🔩', color: [251,146,60]  },
  fuel:        { label: 'Fuel Economy', icon: '⛽', color: [163,230,53]  },
};

// ── Conversion tables map ────────────────────────────────────────
const TABLES = { length:LENGTH, mass:MASS, volume:VOLUME, speed:SPEED, area:AREA, time:TIME, digital:DIGITAL, pressure:PRESSURE, energy:ENERGY, power:POWER, frequency:FREQUENCY, angle:ANGLE, force:FORCE, torque:TORQUE };

// ── Temperature helpers ──────────────────────────────────────────
function toKelvin(v, u) {
  switch(u){
    case 'C': case 'c': return v + 273.15;
    case 'F': case 'f': return (v + 459.67) * 5/9;
    case 'K': case 'k': return v;
    case 'R': case 'r': return v * 5/9;
    case 'De':          return 373.15 - v * 2/3;
    case 'N':           return v * 100/33 + 273.15;
    case 'Re':          return v * 5/4 + 273.15;
    case 'Ro':          return (v - 7.5) * 40/21 + 273.15;
    default: throw new Error(`Unknown temperature unit: ${u}`);
  }
}
function fromKelvin(K, u) {
  switch(u){
    case 'C': case 'c': return K - 273.15;
    case 'F': case 'f': return K * 9/5 - 459.67;
    case 'K': case 'k': return K;
    case 'R': case 'r': return K * 9/5;
    case 'De':          return (373.15 - K) * 3/2;
    case 'N':           return (K - 273.15) * 33/100;
    case 'Re':          return (K - 273.15) * 4/5;
    case 'Ro':          return (K - 273.15) * 21/40 + 7.5;
    default: throw new Error(`Unknown temperature unit: ${u}`);
  }
}

// ── Fuel economy helpers ─────────────────────────────────────────
function toL100km(v, u) {
  switch(u){
    case 'l100km': return v;
    case 'kpl':    return 100 / v;
    case 'mpg-us': return 235.214583 / v;
    case 'mpg-uk': return 282.481053 / v;
    default: throw new Error(`Unknown fuel unit: ${u}`);
  }
}
function fromL100km(base, u) {
  switch(u){
    case 'l100km': return base;
    case 'kpl':    return 100 / base;
    case 'mpg-us': return 235.214583 / base;
    case 'mpg-uk': return 282.481053 / base;
    default: throw new Error(`Unknown fuel unit: ${u}`);
  }
}

// ── Formatter ────────────────────────────────────────────────────
export function formatResult(value, decimals = 6) {
  if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
    return value.toExponential(4);
  }
  const s = parseFloat(value.toPrecision(decimals));
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(s);
}

// ── Main convert function ────────────────────────────────────────
export async function convert({ type, amount, from, to }) {
  if (type === 'currency') {
    if (!SUPPORTED_CURRENCIES.has(from)) throw new Error(`${from} not supported by Frankfurter`);
    if (!SUPPORTED_CURRENCIES.has(to))   throw new Error(`${to} not supported by Frankfurter`);
    const res  = await fetch(`https://api.frankfurter.dev/v1/latest?amount=${amount}&from=${from}&to=${to}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const result = data.rates[to];
    if (result === undefined) throw new Error('Rate unavailable');
    return { result, rate: result / amount, date: data.date };
  }

  if (type === 'temperature') {
    const K      = toKelvin(amount, from);
    const result = fromKelvin(K, to);
    return { result, rate: null, date: null };
  }

  if (type === 'fuel') {
    const base   = toL100km(amount, from);
    const result = fromL100km(base, to);
    return { result, rate: null, date: null };
  }

  const table = TABLES[type];
  if (!table) throw new Error(`Unknown type: ${type}`);
  const fF = table[from];
  const fT = table[to];
  if (fF === undefined) throw new Error(`Unknown unit: ${from}`);
  if (fT === undefined) throw new Error(`Unknown unit: ${to}`);
  const result = amount * fF / fT;
  return { result, rate: result / amount, date: null };
}
