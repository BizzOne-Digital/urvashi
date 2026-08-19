export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export function serializeDocs<T>(docs: T[]): T[] {
  return docs.map((doc) => serialize(doc));
}
