// Maps lowercase alias → [{code, type}] — array to handle cross-type conflicts
const ALIASES = new Map();

function reg(type, code, ...aliases) {
  for (const a of aliases) {
    const key = a.toLowerCase();
    if (!ALIASES.has(key)) ALIASES.set(key, []);
    const list = ALIASES.get(key);
    if (!list.find(x => x.code === code && x.type === type)) {
      list.push({ code, type });
    }
  }
}

// ── LENGTH ────────────────────────────────────────────────────────
reg('length', 'fm',  'fm', 'femtometer', 'femtometers', 'fermi');
reg('length', 'pm',  'pm', 'picometer',  'picometers');
reg('length', 'nm',  'nanometer', 'nanometers', 'nanometre', 'nanometres');
reg('length', 'um',  'um', 'micrometer', 'micrometers', 'micron', 'microns');
reg('length', 'mm',  'millimeter', 'millimeters', 'millimetre', 'millimetres');
reg('length', 'cm',  'centimeter', 'centimeters', 'centimetre', 'centimetres');
reg('length', 'm',   'meter', 'meters', 'metre', 'metres');
reg('length', 'km',  'kilometer', 'kilometers', 'kilometre', 'kilometres');
reg('length', 'Mm',  'megameter', 'megameters');
reg('length', 'thou','thou', 'mil', 'thousandth');
reg('length', 'in',  'inch', 'inches');
reg('length', 'ft',  'foot', 'feet');
reg('length', 'yd',  'yard', 'yards');
reg('length', 'rod', 'rod', 'rods', 'pole', 'poles');
reg('length', 'chain', 'chain', 'chains');
reg('length', 'furlong', 'furlong', 'furlongs');
reg('length', 'mi',  'mile', 'miles');
reg('length', 'league', 'league', 'leagues');
reg('length', 'fathom', 'fathom', 'fathoms');
reg('length', 'cable', 'cable', 'cables');
reg('length', 'nmi', 'nautical mile', 'nautical miles');
reg('length', 'angstrom', 'angstrom', 'angstroms');
reg('length', 'ly',  'light year', 'light years', 'lightyear', 'lightyears');
reg('length', 'au',  'astronomical unit', 'astronomical units', 'au');
reg('length', 'pc',  'parsec', 'parsecs');
reg('length', 'kpc', 'kiloparsec', 'kiloparsecs');

// ── MASS ──────────────────────────────────────────────────────────
reg('mass', 'pg',  'picogram', 'picograms');
reg('mass', 'ng',  'nanogram', 'nanograms');
reg('mass', 'ug',  'microgram', 'micrograms');
reg('mass', 'mg',  'milligram', 'milligrams');
reg('mass', 'g',   'gram', 'grams');
reg('mass', 'kg',  'kilogram', 'kilograms', 'kilo', 'kilos');
reg('mass', 't',   'tonne', 'tonnes', 'metric ton', 'metric tons');
reg('mass', 'kt',  'kiloton', 'kilotons');
reg('mass', 'Mt',  'megaton', 'megatons');
reg('mass', 'gr',  'grain', 'grains');
reg('mass', 'dr',  'dram', 'drams');
reg('mass', 'oz',  'ounce', 'ounces');
reg('mass', 'lb',  'pound', 'pounds');
reg('mass', 'st',  'stone', 'stones');
reg('mass', 'ton-us', 'ton', 'tons', 'short ton', 'short tons', 'us ton');
reg('mass', 'ton-uk', 'long ton', 'long tons', 'uk ton', 'imperial ton');
reg('mass', 'troy-oz', 'troy oz', 'troy ounce', 'troy ounces');
reg('mass', 'troy-lb', 'troy lb', 'troy pound', 'troy pounds');
reg('mass', 'dwt', 'pennyweight');
reg('mass', 'ct',  'carat', 'carats');
reg('mass', 'amu', 'dalton', 'daltons', 'atomic mass unit');

// ── TEMPERATURE ───────────────────────────────────────────────────
reg('temperature', 'C',  'celsius', 'centigrade');
reg('temperature', 'F',  'fahrenheit');
reg('temperature', 'K',  'kelvin');
reg('temperature', 'R',  'rankine');
reg('temperature', 'De', 'delisle');
reg('temperature', 'Re', 'reaumur', 'réaumur');
reg('temperature', 'Ro', 'romer', 'rømer');

// ── VOLUME ────────────────────────────────────────────────────────
reg('volume', 'ml',     'ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres');
reg('volume', 'cl',     'centiliter', 'centiliters');
reg('volume', 'dl',     'deciliter', 'deciliters');
reg('volume', 'l',      'liter', 'liters', 'litre', 'litres');
reg('volume', 'kl',     'kiloliter', 'kiloliters');
reg('volume', 'cm3',    'cubic centimeter', 'cubic centimeters', 'cc');
reg('volume', 'm3',     'cubic meter', 'cubic meters', 'cubic metre', 'cubic metres');
reg('volume', 'tsp-us', 'teaspoon', 'teaspoons', 'tsp');
reg('volume', 'tbsp-us','tablespoon', 'tablespoons', 'tbsp');
reg('volume', 'floz-us','fluid ounce', 'fluid ounces', 'fl oz');
reg('volume', 'cup-us', 'cup', 'cups');
reg('volume', 'pt-us',  'pint', 'pints');
reg('volume', 'qt-us',  'quart', 'quarts');
reg('volume', 'gal-us', 'gallon', 'gallons');
reg('volume', 'gal-uk', 'imperial gallon', 'imperial gallons', 'uk gallon', 'gallon uk');
reg('volume', 'pt-uk',  'uk pint', 'pint uk');
reg('volume', 'bbl-oil','barrel', 'barrels', 'oil barrel');
reg('volume', 'bu-us',  'bushel', 'bushels');

// ── SPEED ─────────────────────────────────────────────────────────
reg('speed', 'mps',  'm/s', 'meters per second', 'metres per second');
reg('speed', 'kph',  'km/h', 'kph', 'kmh', 'kilometers per hour', 'kilometres per hour');
reg('speed', 'mph',  'mph', 'miles per hour');
reg('speed', 'fps',  'fps', 'feet per second');
reg('speed', 'fpm',  'fpm', 'feet per minute');
reg('speed', 'kt',   'knot', 'knots');
reg('speed', 'mach', 'mach');
reg('speed', 'c',    'speed of light');

// ── AREA ──────────────────────────────────────────────────────────
reg('area', 'mm2', 'square millimeter', 'square millimeters', 'sq mm');
reg('area', 'cm2', 'square centimeter', 'square centimeters', 'sq cm');
reg('area', 'm2',  'square meter', 'square meters', 'sq m', 'sq meter');
reg('area', 'km2', 'square kilometer', 'square kilometers', 'sq km');
reg('area', 'in2', 'square inch', 'square inches', 'sq in', 'sq inch');
reg('area', 'ft2', 'square foot', 'square feet', 'sq ft', 'sq foot');
reg('area', 'yd2', 'square yard', 'square yards', 'sq yd');
reg('area', 'mi2', 'square mile', 'square miles', 'sq mi');
reg('area', 'ac',  'acre', 'acres');
reg('area', 'ha',  'hectare', 'hectares');
reg('area', 'ro',  'rood', 'roods');

// ── TIME ──────────────────────────────────────────────────────────
reg('time', 'ns',  'nanosecond', 'nanoseconds');
reg('time', 'us',  'microsecond', 'microseconds');
reg('time', 'ms',  'millisecond', 'milliseconds');
reg('time', 's',   'second', 'seconds', 'sec', 'secs');
reg('time', 'min', 'minute', 'minutes', 'min');
reg('time', 'hr',  'hour', 'hours');
reg('time', 'day', 'day', 'days');
reg('time', 'wk',  'week', 'weeks');
reg('time', 'fortnight', 'fortnight', 'fortnights');
reg('time', 'mo',  'month', 'months');
reg('time', 'yr',  'year', 'years');
reg('time', 'decade', 'decade', 'decades');
reg('time', 'cent', 'century', 'centuries');
reg('time', 'millennium', 'millennium', 'millennia');

// ── DIGITAL ───────────────────────────────────────────────────────
reg('digital', 'b',   'bit', 'bits');
reg('digital', 'B',   'byte', 'bytes');
reg('digital', 'Kb',  'kilobit', 'kilobits');
reg('digital', 'KB',  'kilobyte', 'kilobytes');
reg('digital', 'KiB', 'kibibyte', 'kibibytes');
reg('digital', 'Mb',  'megabit', 'megabits');
reg('digital', 'MB',  'megabyte', 'megabytes');
reg('digital', 'MiB', 'mebibyte', 'mebibytes');
reg('digital', 'Gb',  'gigabit', 'gigabits');
reg('digital', 'GB',  'gigabyte', 'gigabytes');
reg('digital', 'GiB', 'gibibyte', 'gibibytes');
reg('digital', 'Tb',  'terabit', 'terabits');
reg('digital', 'TB',  'terabyte', 'terabytes');
reg('digital', 'TiB', 'tebibyte', 'tebibytes');
reg('digital', 'Pb',  'petabit', 'petabits');
reg('digital', 'PB',  'petabyte', 'petabytes');
reg('digital', 'Eb',  'exabit', 'exabits');
reg('digital', 'EB',  'exabyte', 'exabytes');

// ── PRESSURE ──────────────────────────────────────────────────────
reg('pressure', 'Pa',  'pascal', 'pascals');
reg('pressure', 'hPa', 'hectopascal', 'hectopascals');
reg('pressure', 'kPa', 'kilopascal', 'kilopascals');
reg('pressure', 'MPa', 'megapascal', 'megapascals');
reg('pressure', 'bar', 'bar', 'bars');
reg('pressure', 'mbar','millibar', 'millibars');
reg('pressure', 'atm', 'atmosphere', 'atmospheres', 'atm');
reg('pressure', 'psi', 'psi', 'pounds per square inch');
reg('pressure', 'psf', 'pounds per square foot');
reg('pressure', 'ksi', 'ksi', 'kilopsi');
reg('pressure', 'torr','torr');
reg('pressure', 'mmHg','millimeter of mercury', 'mm mercury', 'mm hg');
reg('pressure', 'inHg','inch of mercury', 'inches of mercury', 'in hg');
reg('pressure', 'inH2O','inch of water', 'inches of water');
reg('pressure', 'cmH2O','centimeter of water', 'cm of water');

// ── ENERGY ────────────────────────────────────────────────────────
reg('energy', 'J',    'joule', 'joules');
reg('energy', 'kJ',   'kilojoule', 'kilojoules');
reg('energy', 'MJ',   'megajoule', 'megajoules');
reg('energy', 'GJ',   'gigajoule', 'gigajoules');
reg('energy', 'cal',  'calorie', 'calories', 'small calorie');
reg('energy', 'kcal', 'kilocalorie', 'kilocalories', 'food calorie', 'large calorie', 'dietary calorie');
reg('energy', 'Wh',   'watt hour', 'watt hours', 'watt-hour');
reg('energy', 'kWh',  'kilowatt hour', 'kilowatt hours', 'kwh');
reg('energy', 'MWh',  'megawatt hour', 'megawatt hours');
reg('energy', 'BTU',  'btu', 'british thermal unit', 'british thermal units');
reg('energy', 'MMBTU','mmbtu', 'million btu');
reg('energy', 'therm','therm', 'therms');
reg('energy', 'eV',   'electronvolt', 'electronvolts', 'electron volt');
reg('energy', 'erg',  'erg', 'ergs');
reg('energy', 'tonne_tnt', 'tonne of tnt', 'ton of tnt');

// ── POWER ─────────────────────────────────────────────────────────
reg('power', 'W',       'watt', 'watts');
reg('power', 'mW',      'milliwatt', 'milliwatts');
reg('power', 'kW',      'kilowatt', 'kilowatts');
reg('power', 'MW',      'megawatt', 'megawatts');
reg('power', 'GW',      'gigawatt', 'gigawatts');
reg('power', 'TW',      'terawatt', 'terawatts');
reg('power', 'hp-mech', 'horsepower', 'hp', 'mechanical horsepower');
reg('power', 'hp-metric','metric horsepower', 'ps', 'cv', 'pferdestärke');
reg('power', 'BTU_hr',  'btu per hour', 'btu/hr', 'btu/h');
reg('power', 'BTU_min', 'btu per minute', 'btu/min');
reg('power', 'BTU_s',   'btu per second', 'btu/s');

// ── FREQUENCY ─────────────────────────────────────────────────────
reg('frequency', 'mHz', 'millihertz');
reg('frequency', 'Hz',  'hertz', 'hz');
reg('frequency', 'kHz', 'kilohertz', 'khz');
reg('frequency', 'MHz', 'megahertz', 'mhz');
reg('frequency', 'GHz', 'gigahertz', 'ghz');
reg('frequency', 'THz', 'terahertz', 'thz');
reg('frequency', 'rpm', 'rpm', 'revolutions per minute');
reg('frequency', 'rps', 'rps', 'revolutions per second');
reg('frequency', 'rad_s','radians per second', 'rad/s');

// ── ANGLE ─────────────────────────────────────────────────────────
reg('angle', 'deg',    'degree', 'degrees');
reg('angle', 'rad',    'radian', 'radians');
reg('angle', 'grad',   'gradian', 'gradians', 'gon', 'gons');
reg('angle', 'arcmin', 'arcminute', 'arcminutes', 'arc minute', 'arc minutes');
reg('angle', 'arcsec', 'arcsecond', 'arcseconds', 'arc second', 'arc seconds');
reg('angle', 'turn',   'turn', 'turns', 'revolution', 'revolutions');
reg('angle', 'quadrant','quadrant', 'quadrants');

// ── FORCE ─────────────────────────────────────────────────────────
reg('force', 'N',       'newton', 'newtons');
reg('force', 'kN',      'kilonewton', 'kilonewtons');
reg('force', 'MN',      'meganewton', 'meganewtons');
reg('force', 'kgf',     'kilogram force', 'kilogram-force');
reg('force', 'gf',      'gram force', 'gram-force');
reg('force', 'lbf',     'pound force', 'pound-force', 'lbf');
reg('force', 'pdl',     'poundal', 'poundals');
reg('force', 'dyn',     'dyne', 'dynes');
reg('force', 'tonf-us', 'ton force', 'short ton force');

// ── TORQUE ────────────────────────────────────────────────────────
reg('torque', 'Nm',    'newton meter', 'newton meters', 'newton metre', 'newton-meter');
reg('torque', 'kNm',   'kilonewton meter', 'kilonewton-meter');
reg('torque', 'ft-lbf','foot pound torque', 'foot-pound torque', 'ft lbf');
reg('torque', 'in-lbf','inch pound', 'inch-pound', 'in lbf');
reg('torque', 'kgf-m', 'kilogram-force meter', 'kgf meter');
reg('torque', 'kgf-cm','kilogram-force centimeter', 'kgf centimeter');

// ── FUEL ECONOMY ──────────────────────────────────────────────────
reg('fuel', 'mpg-us', 'mpg', 'miles per gallon', 'us mpg');
reg('fuel', 'mpg-uk', 'mpg uk', 'miles per gallon uk', 'imperial mpg');
reg('fuel', 'kpl',    'km/l', 'kilometers per liter', 'kilometres per litre', 'kmpl');
reg('fuel', 'l100km', 'l/100km', 'liters per 100km', 'litres per 100km', 'l per 100');

// ── CURRENCY ──────────────────────────────────────────────────────
reg('currency', 'USD', 'dollar', 'dollars', 'usd', 'us dollar', 'us dollars', 'american dollar');
reg('currency', 'EUR', 'euro', 'euros', 'eur');
reg('currency', 'GBP', 'pound sterling', 'gbp', 'sterling', 'british pound', 'british pounds');
reg('currency', 'JPY', 'yen', 'jpy', 'japanese yen');
reg('currency', 'CNY', 'yuan', 'cny', 'renminbi', 'rmb', 'chinese yuan');
reg('currency', 'INR', 'rupee', 'rupees', 'inr', 'indian rupee');
reg('currency', 'CHF', 'franc', 'francs', 'chf', 'swiss franc');
reg('currency', 'KRW', 'won', 'krw', 'korean won', 'south korean won');
reg('currency', 'MXN', 'peso', 'pesos', 'mxn', 'mexican peso');
reg('currency', 'BRL', 'real', 'reais', 'brl', 'brazilian real');
reg('currency', 'CAD', 'canadian dollar', 'cad', 'canadian dollars');
reg('currency', 'AUD', 'australian dollar', 'aud', 'australian dollars');
reg('currency', 'NZD', 'new zealand dollar', 'nzd');
reg('currency', 'TRY', 'lira', 'try', 'turkish lira');
reg('currency', 'ZAR', 'rand', 'zar', 'south african rand');
reg('currency', 'SEK', 'krona', 'sek', 'swedish krona');
reg('currency', 'NOK', 'krone', 'nok', 'norwegian krone');
reg('currency', 'DKK', 'danish krone', 'dkk');
reg('currency', 'SGD', 'singapore dollar', 'sgd');
reg('currency', 'HKD', 'hong kong dollar', 'hkd');
reg('currency', 'PLN', 'zloty', 'pln', 'polish zloty');
reg('currency', 'HUF', 'forint', 'huf', 'hungarian forint');
reg('currency', 'CZK', 'koruna', 'czk', 'czech koruna');
reg('currency', 'PHP', 'philippine peso', 'php');
reg('currency', 'THB', 'baht', 'thb', 'thai baht');
reg('currency', 'MYR', 'ringgit', 'myr', 'malaysian ringgit');
reg('currency', 'IDR', 'rupiah', 'idr', 'indonesian rupiah');
reg('currency', 'ILS', 'shekel', 'ils', 'israeli shekel');
reg('currency', 'ISK', 'krona is', 'isk', 'icelandic krona');
reg('currency', 'RON', 'leu', 'ron', 'romanian leu');

// ── ISO currency code fallback ────────────────────────────────────
const ISO_CURRENCIES = new Set([
  'AUD','BRL','CAD','CHF','CNY','CZK','DKK','EUR','GBP',
  'HKD','HUF','IDR','ILS','INR','ISK','JPY','KRW','MXN',
  'MYR','NOK','NZD','PHP','PLN','RON','SEK','SGD','THB',
  'TRY','USD','ZAR',
]);

// ── Resolve unit from text segment ────────────────────────────────
function resolveUnit(text, preferredType) {
  const words = text.trim().split(/\s+/);

  // Try longest phrase match first
  for (let len = words.length; len >= 1; len--) {
    for (let start = 0; start <= words.length - len; start++) {
      const phrase = words.slice(start, start + len).join(' ');
      const matches = ALIASES.get(phrase.toLowerCase()) || [];

      if (preferredType) {
        const hit = matches.find(m => m.type === preferredType);
        if (hit) return hit;
      }
      if (matches.length > 0) return matches[0];

      // ISO currency code (3-letter uppercase)
      if (len === 1 && /^[A-Z]{3}$/.test(phrase) && ISO_CURRENCIES.has(phrase)) {
        return { code: phrase, type: 'currency' };
      }
    }
  }
  return null;
}

// ── Main parse function ───────────────────────────────────────────
// Returns { amount, from, to, type } or null
export function parseQuery(text, preferredType = null) {
  const s = text.replace(/[,'"]/g, ' ').replace(/°/g, ' ').trim();

  // Extract number (including decimals)
  const numMatch = s.match(/\d+(?:\.\d+)?/);
  if (!numMatch) return null;
  const amount = parseFloat(numMatch[0]);

  const withoutNum = s.slice(0, numMatch.index) + s.slice(numMatch.index + numMatch[0].length);

  // Separator: "to", "in", "into", "as"
  const sepRe = /\b(to|in|into|as)\b/i;
  const sepMatch = withoutNum.match(sepRe);
  if (!sepMatch) return null;

  const beforeSep = withoutNum.slice(0, sepMatch.index);
  const afterSep  = withoutNum.slice(sepMatch.index + sepMatch[0].length);

  // Strip common filler words
  const clean = s => s.replace(/\b(convert|change|exchange|what is|how many|how much)\b/gi, '').trim();

  const fromUnit = resolveUnit(clean(beforeSep), preferredType);
  const toUnit   = resolveUnit(clean(afterSep),  preferredType || fromUnit?.type);

  if (!fromUnit || !toUnit) return null;
  if (fromUnit.type !== toUnit.type) return null;

  return { amount, from: fromUnit.code, to: toUnit.code, type: fromUnit.type };
}
