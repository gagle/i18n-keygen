import * as fs from 'node:fs';
import * as path from 'node:path';
import { validateCrossLanguageSync } from './validate-sync';
import type { ResolvedScope } from './resolve-scope';
import { createTmpDir, cleanTmpDir, writeJson as writeJsonHelper } from './testing/test-helpers';

describe('validateCrossLanguageSync', () => {
  const workspaceRoot = '/workspace';
  const TMP_NAME = 'validate-sync';
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir(TMP_NAME);
    vi.spyOn(console, 'error').mockReturnValue();
  });

  afterEach(() => {
    cleanTmpDir(TMP_NAME);
  });

  function writeFile(relativePath: string, content: Record<string, unknown>): string {
    const filePath = path.join(tmpDir, relativePath);
    writeJsonHelper(tmpDir, relativePath, content);
    return filePath;
  }

  function createScope(files: Record<string, string>): ResolvedScope {
    return {
      name: 'test',
      files: new Map(Object.entries(files)),
    };
  }

  it('should return no errors when all langs have identical keys', () => {
    const enFile = writeFile('en.json', { title: 'Hello', form: { name: 'Name' } });
    const esFile = writeFile('es.json', { title: 'Hola', form: { name: 'Nombre' } });

    const scope = createScope({ en: enFile, es: esFile });
    const result = validateCrossLanguageSync(scope, 'en', workspaceRoot);

    expect(result.errors).toEqual([]);
    expect(result.intersectionKeys).toEqual([]);
  });

  it('should detect missing keys', () => {
    const enFile = writeFile('en.json', { title: 'Hello', newKey: 'New' });
    const esFile = writeFile('es.json', { title: 'Hola' });

    const scope = createScope({ en: enFile, es: esFile });
    const result = validateCrossLanguageSync(scope, 'en', workspaceRoot);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.missing).toEqual(['newKey']);
    expect(result.intersectionKeys).toEqual(['title']);
  });

  it('should detect orphaned keys', () => {
    const enFile = writeFile('en.json', { title: 'Hello' });
    const esFile = writeFile('es.json', { title: 'Hola', extra: 'Extra' });

    const scope = createScope({ en: enFile, es: esFile });
    const result = validateCrossLanguageSync(scope, 'en', workspaceRoot);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.orphaned).toEqual(['extra']);
    expect(result.intersectionKeys).toEqual(['title']);
  });

  it('should return error when file is missing', () => {
    const enFile = writeFile('en.json', { title: 'Hello' });
    const esFile = path.join(tmpDir, 'es.json');

    const scope = createScope({ en: enFile, es: esFile });
    const result = validateCrossLanguageSync(scope, 'en', workspaceRoot);

    expect(result.errors).toHaveLength(1);
    expect(result.intersectionKeys).toEqual([]);
    expect(result.hasParseErrors).toBe(false);
  });

  it('should return error when file contains invalid JSON', () => {
    const enFile = writeFile('en.json', { title: 'Hello' });
    const esFile = path.join(tmpDir, 'es.json');
    fs.writeFileSync(esFile, '{ invalid json }');

    const scope = createScope({ en: enFile, es: esFile });
    const result = validateCrossLanguageSync(scope, 'en', workspaceRoot);

    expect(result.errors).toHaveLength(1);
    expect(result.intersectionKeys).toEqual([]);
    expect(result.hasParseErrors).toBe(true);
  });

  it('should compute intersection across three languages', () => {
    const enFile = writeFile('en.json', { title: 'Hello', onlyEn: 'Only EN' });
    const esFile = writeFile('es.json', { title: 'Hola', onlyEs: 'Only ES' });
    const caFile = writeFile('ca.json', { title: 'Hola', onlyCa: 'Only CA' });

    const scope = createScope({ en: enFile, es: esFile, ca: caFile });
    const result = validateCrossLanguageSync(scope, 'en', workspaceRoot);

    expect(result.intersectionKeys).toEqual(['title']);
  });

  it('should report both missing and orphaned in the same language', () => {
    const enFile = writeFile('en.json', { title: 'Hello', enOnly: 'EN' });
    const esFile = writeFile('es.json', { title: 'Hola', esOnly: 'ES' });

    const scope = createScope({ en: enFile, es: esFile });
    const result = validateCrossLanguageSync(scope, 'en', workspaceRoot);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.missing).toEqual(['enOnly']);
    expect(result.errors[0]!.orphaned).toEqual(['esOnly']);
  });
});
