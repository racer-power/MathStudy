const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);

if (!match) {
  console.error('No embedded script found.');
  process.exit(1);
}

const script = match[1];
const logs = [];
const events = {};

const dummy = {
  addEventListener() {},
  focus() {},
  scrollIntoView() {},
  querySelector() {
    return dummy;
  },
  querySelectorAll() {
    return [];
  },
  setAttribute() {},
  removeAttribute() {},
  classList: {
    add() {},
    remove() {},
    contains() {
      return false;
    },
  },
  style: {},
  appendChild() {},
  remove() {},
  innerHTML: '',
  textContent: '',
  value: '',
  checked: false,
  disabled: false,
  click() {},
};

const main = { ...dummy };

const document = {
  getElementById(id) {
    return id === 'main' ? main : null;
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener(name, fn) {
    events[`document:${name}`] = fn;
  },
  body: dummy,
  createElement() {
    return { ...dummy };
  },
};

const ctx = {
  console: {
    log: (...args) => logs.push(['log', ...args]),
    error: (...args) => logs.push(['error', ...args]),
    warn: (...args) => logs.push(['warn', ...args]),
  },
  window: null,
  document,
  location: { hash: '#/', search: '?debug=1' },
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {},
  },
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  URLSearchParams,
  FormData: class {
    constructor() {}
    get() {
      return null;
    }
  },
  history: {},
  navigator: { userAgent: 'node' },
  performance: { now: () => 0 },
  scrollTo() {},
};

ctx.window = ctx;
ctx.addEventListener = (name, fn) => {
  events[name] = fn;
};
ctx.requestAnimationFrame = (fn) => setTimeout(fn, 0);
ctx.alert = () => {};
ctx.print = () => {};
ctx.Math = Math;
ctx.Date = Date;
ctx.JSON = JSON;
ctx.RegExp = RegExp;
ctx.Number = Number;
ctx.String = String;
ctx.Object = Object;
ctx.Array = Array;
ctx.parseInt = parseInt;
ctx.parseFloat = parseFloat;
ctx.isNaN = isNaN;
ctx.window.scrollTo = () => {};

vm.runInNewContext(script, ctx, { filename: 'embedded.js' });

if (events.DOMContentLoaded) events.DOMContentLoaded();
if (events['document:DOMContentLoaded']) events['document:DOMContentLoaded']();

const routes = [
  '#/',
  '#/unit1',
  '#/unit1/compare',
  '#/unit1/input',
  '#/unit1/quiz',
  '#/unit1/quiz/detective',
  '#/unit1/quiz/order',
  '#/unit1/quiz/speed',
  '#/unit1/assessment',
  '#/unit1/assessment/fracByFrac',
  '#/unit1/assessment/fracByFrac/basic',
  '#/unit1/portfolio',
  '#/unit2',
  '#/unit2/compare',
  '#/unit2/input',
  '#/unit2/quiz',
  '#/unit2/quiz/detective',
  '#/unit2/quiz/order',
  '#/unit2/quiz/speed',
  '#/unit2/assessment',
  '#/unit2/assessment/decByDec',
  '#/unit2/assessment/decByDec/basic',
  '#/unit2/portfolio',
  '#/unit3',
  '#/unit3/compare',
  '#/unit3/input',
  '#/unit3/quiz',
  '#/unit3/quiz/detective',
  '#/unit3/quiz/order',
  '#/unit3/quiz/speed',
  '#/unit3/assessment',
  '#/unit3/assessment/viewAndShape',
  '#/unit3/assessment/viewAndShape/basic',
  '#/unit3/portfolio',
  '#/unit4',
  '#/unit4/compare',
  '#/unit4/input',
  '#/unit4/quiz',
  '#/unit4/quiz/detective',
  '#/unit4/quiz/order',
  '#/unit4/quiz/speed',
  '#/unit4/assessment',
  '#/unit4/assessment/ratioBasics',
  '#/unit4/assessment/ratioBasics/basic',
  '#/unit4/portfolio',
];

for (const route of routes) {
  ctx.location.hash = route;
  if (events.hashchange) events.hashchange();
  if (typeof main.innerHTML !== 'string' || main.innerHTML.length === 0) {
    console.error(`Route rendered empty output: ${route}`);
    process.exit(1);
  }
  if (route === '#/unit3' && !main.innerHTML.includes('공간과 입체')) {
    console.error('unit3 home did not render the 3rd-unit title.');
    process.exit(1);
  }
  if (route === '#/unit4' && !main.innerHTML.includes('비례식과 비례배분')) {
    console.error('unit4 home did not render the 4th-unit title.');
    process.exit(1);
  }
}

if (!logs.some(([kind, ...args]) => kind === 'log' && args.join(' ').includes('DATA CHECK OK'))) {
  console.error('Did not observe DATA CHECK OK.');
  process.exit(1);
}

console.log('smoke test passed');
