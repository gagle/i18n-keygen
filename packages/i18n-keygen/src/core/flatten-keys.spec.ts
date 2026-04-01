import { flattenKeys } from './flatten-keys';

describe('flattenKeys', () => {
  it('should flatten a simple object', () => {
    const result = flattenKeys({ title: 'Hello', subtitle: 'World' }, '');
    expect(result).toEqual(['title', 'subtitle']);
  });

  it('should flatten nested objects with dot notation', () => {
    const result = flattenKeys({ form: { name: 'Name', email: 'Email' } }, '');
    expect(result).toEqual(['form.name', 'form.email']);
  });

  it('should prepend prefix when provided', () => {
    const result = flattenKeys({ title: 'Hello' }, 'scope');
    expect(result).toEqual(['scope.title']);
  });

  it('should handle deeply nested objects', () => {
    const result = flattenKeys({ a: { b: { c: 'value' } } }, '');
    expect(result).toEqual(['a.b.c']);
  });

  it('should handle empty prefix with no dot', () => {
    const result = flattenKeys({ key: 'value' }, '');
    expect(result).toEqual(['key']);
  });

  it('should treat arrays as leaf values', () => {
    const result = flattenKeys({ tags: ['a', 'b'] }, '');
    expect(result).toEqual(['tags']);
  });

  it('should return empty array for empty object', () => {
    const result = flattenKeys({}, '');
    expect(result).toEqual([]);
  });

  it('should handle mixed nesting levels', () => {
    const result = flattenKeys(
      {
        pageTitle: 'Products',
        table: { name: 'Name', price: 'Price' },
        emptyState: 'No products',
      },
      'products',
    );
    expect(result).toEqual([
      'products.pageTitle',
      'products.table.name',
      'products.table.price',
      'products.emptyState',
    ]);
  });
});
