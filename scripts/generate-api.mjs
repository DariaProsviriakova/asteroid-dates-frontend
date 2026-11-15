import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { generateApi } from 'swagger-typescript-api';

const snapshot = new URL('../openapi/asteroid-dates.json', import.meta.url);
const source = process.argv[2];
const spec = source?.startsWith('http://') || source?.startsWith('https://')
  ? await fetch(source).then(response => {
    if (!response.ok) throw new Error(`Swagger: HTTP ${response.status}`);
    return response.json();
  })
  : JSON.parse(await readFile(source ?? snapshot, 'utf8'));

// Пользователи работают с ручным Axios; кодогенерация нужна только для дат.
spec.paths = Object.fromEntries(Object.entries(spec.paths).filter(([path]) => /^\/api\/dates(?:\/|$)/.test(path)));
if (!spec.paths['/api/dates']?.get) throw new Error('В Swagger нет GET /api/dates');
for (const operations of Object.values(spec.paths)) {
  for (const operation of Object.values(operations)) {
    if (operation.operationId) operation.operationId = operation.operationId.replace(/^ApiDatesController_/, '');
  }
}

// Оставляем только схемы, на которые ссылаются операции с датами.
const allSchemas = spec.components.schemas;
const usedSchemas = new Set();
function collectRefs(node) {
  if (!node || typeof node !== 'object') return;
  const key = node.$ref?.split('/').at(-1);
  if (key && allSchemas[key] && !usedSchemas.has(key)) {
    usedSchemas.add(key);
    collectRefs(allSchemas[key]);
  }
  Object.values(node).forEach(collectRefs);
}
collectRefs(spec.paths);
spec.components.schemas = Object.fromEntries(Object.entries(allSchemas).filter(([key]) => usedSchemas.has(key)));
spec.tags = spec.tags.filter(({ name }) => Object.values(spec.paths).some(operations =>
  Object.values(operations).some(operation => operation.tags?.includes(name))));
if (source) await writeFile(snapshot, JSON.stringify(spec, null, 2) + '\n');

await generateApi({
  input: fileURLToPath(snapshot),
  output: fileURLToPath(new URL('../src/api/generated/', import.meta.url)),
  fileName: 'AsteroidDatesApi.ts',
  httpClientType: 'axios',
  extractRequestParams: true,
  unwrapResponseData: false,
});
