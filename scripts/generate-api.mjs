import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import { generateApi } from 'swagger-typescript-api';

const root = new URL('../', import.meta.url);
const { swaggerCodegen } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const { input, output, operationIds, ...options } = swaggerCodegen;
const snapshot = new URL(input, root);
const source = process.argv[2];
const spec = source && /^https?:\/\//.test(source)
  ? (await axios.get(source, { timeout: 10000, responseType: 'json' })).data
  : JSON.parse(await readFile(source ?? snapshot, 'utf8'));
if (!spec?.openapi || !spec.paths || !spec.components?.schemas) {
  throw new Error('Укажите JSON-документ OpenAPI, а не страницу Swagger UI.');
}

// Снимок контракта ЛР4 содержит все семь операций каталога.
spec.paths = Object.fromEntries(Object.entries(spec.paths).filter(([path]) => /^\/api\/dates(?:\/|$)/.test(path)));
for (const operations of Object.values(spec.paths)) {
  for (const operation of Object.values(operations)) {
    if (operation.operationId) operation.operationId = operation.operationId.replace(/^ApiDatesController_/, '');
  }
}
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
spec.tags = (spec.tags ?? []).filter(({ name }) => Object.values(spec.paths).some(operations =>
  Object.values(operations).some(operation => operation.tags?.includes(name))));

const found = new Set();
const paths = Object.fromEntries(Object.entries(spec.paths).flatMap(([path, operations]) => {
  const selected = Object.entries(operations).filter(([, operation]) => operationIds.includes(operation.operationId));
  selected.forEach(([, operation]) => found.add(operation.operationId));
  return selected.length ? [[path, Object.fromEntries(selected)]] : [];
}));
const missing = operationIds.filter(id => !found.has(id));
if (missing.length) throw new Error('В Swagger не найдены операции: ' + missing.join(', '));

await generateApi({ ...options, spec: { ...spec, paths }, output: fileURLToPath(new URL(output, root)) });
if (source) await writeFile(snapshot, JSON.stringify(spec, null, 2) + '\n');
