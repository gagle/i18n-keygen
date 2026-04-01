import * as path from 'node:path';

vi.mock('@parcel/watcher', () => ({
  default: {
    subscribe: vi.fn(),
  },
}));

vi.mock('../utilities/logger', () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

vi.mock('./resolve-scope', () => ({
  resolveScope: vi.fn(),
}));

import watcher from '@parcel/watcher';
import type { Event as WatcherEvent, SubscribeCallback } from '@parcel/watcher';
import { logError } from '../utilities/logger';
import { resolveScope } from './resolve-scope';
import { watchTranslations } from './watch';
import type { ResolvedConfig } from './types';

const CONFIG: ResolvedConfig = {
  outputFile: 'generated/keys.ts',
  scopes: [{ name: 'core', dir: 'i18n/core' }],
  supportedLangs: ['en', 'es'],
  defaultLang: 'en',
  scopeSeparator: '.',
  strictSync: false,
};

describe('watchTranslations', () => {
  const workspaceRoot = '/workspace';
  let subscribeCallbacks: Map<string, SubscribeCallback>;
  let onChange: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.useFakeTimers();
    subscribeCallbacks = new Map();
    onChange = vi.fn();
    vi.mocked(resolveScope).mockReturnValue({
      name: 'core',
      files: new Map([
        ['en', '/workspace/i18n/core/en.json'],
        ['es', '/workspace/i18n/core/es.json'],
      ]),
    });
    vi.mocked(watcher.subscribe).mockImplementation(
      async (dir: string, fn: SubscribeCallback) => {
        subscribeCallbacks.set(dir, fn);
        return { unsubscribe: vi.fn().mockResolvedValue(undefined) };
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function fireChange(filename: string): void {
    const dir = path.dirname('/workspace/i18n/core/en.json');
    const callback = subscribeCallbacks.get(dir);
    const event: WatcherEvent = { path: path.join(dir, filename), type: 'update' };
    callback?.(null, [event]);
  }

  it('should subscribe to each unique directory', async () => {
    await watchTranslations(workspaceRoot, CONFIG, onChange);

    expect(watcher.subscribe).toHaveBeenCalledWith(
      path.dirname('/workspace/i18n/core/en.json'),
      expect.any(Function),
    );
  });

  describe('when a json file changes', () => {
    beforeEach(async () => {
      await watchTranslations(workspaceRoot, CONFIG, onChange);
      fireChange('en.json');
      vi.advanceTimersByTime(100);
    });

    it('should call onChange', () => {
      expect(onChange).toHaveBeenCalledOnce();
    });
  });

  describe('when a non-json file changes', () => {
    beforeEach(async () => {
      await watchTranslations(workspaceRoot, CONFIG, onChange);
      const dir = path.dirname('/workspace/i18n/core/en.json');
      const callback = subscribeCallbacks.get(dir);
      const event: WatcherEvent = { path: path.join(dir, 'readme.md'), type: 'update' };
      callback?.(null, [event]);
      vi.advanceTimersByTime(100);
    });

    it('should not call onChange', () => {
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('when the watcher reports an error', () => {
    beforeEach(async () => {
      await watchTranslations(workspaceRoot, CONFIG, onChange);
      const dir = path.dirname('/workspace/i18n/core/en.json');
      const callback = subscribeCallbacks.get(dir);
      callback?.(new Error('watcher failure'), []);
      vi.advanceTimersByTime(100);
    });

    it('should log the error message', () => {
      expect(logError).toHaveBeenCalledWith(expect.stringContaining('watcher failure'));
    });

    it('should not call onChange', () => {
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('when onChange throws an Error', () => {
    beforeEach(async () => {
      onChange.mockImplementation(() => {
        throw new Error('parse failure');
      });
      await watchTranslations(workspaceRoot, CONFIG, onChange);
      fireChange('en.json');
      vi.advanceTimersByTime(100);
    });

    it('should log the error message', () => {
      expect(logError).toHaveBeenCalledWith(expect.stringContaining('parse failure'));
    });
  });

  describe('when onChange throws a non-Error', () => {
    beforeEach(async () => {
      onChange.mockImplementation(() => {
        throw 'string error';
      });
      await watchTranslations(workspaceRoot, CONFIG, onChange);
      fireChange('en.json');
      vi.advanceTimersByTime(100);
    });

    it('should stringify the thrown value', () => {
      expect(logError).toHaveBeenCalledWith(expect.stringContaining('string error'));
    });
  });

  describe('when scope name is omitted', () => {
    beforeEach(async () => {
      vi.mocked(resolveScope).mockReturnValue({
        name: '',
        files: new Map([['en', '/workspace/i18n/en.json']]),
      });
      await watchTranslations(workspaceRoot, CONFIG, onChange);
      const dir = path.dirname('/workspace/i18n/en.json');
      const callback = subscribeCallbacks.get(dir);
      const event: WatcherEvent = { path: '/workspace/i18n/en.json', type: 'update' };
      callback?.(null, [event]);
      vi.advanceTimersByTime(100);
    });

    it('should call onChange', () => {
      expect(onChange).toHaveBeenCalledOnce();
    });
  });

  describe('debouncing', () => {
    beforeEach(async () => {
      await watchTranslations(workspaceRoot, CONFIG, onChange);
    });

    it('should coalesce rapid events into a single onChange call', () => {
      fireChange('en.json');
      fireChange('en.json');
      fireChange('en.json');
      vi.advanceTimersByTime(100);

      expect(onChange).toHaveBeenCalledOnce();
    });

    it('should not call onChange before the debounce delay', () => {
      fireChange('en.json');
      vi.advanceTimersByTime(99);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should allow separate calls when spaced beyond the debounce delay', () => {
      fireChange('en.json');
      vi.advanceTimersByTime(100);
      fireChange('es.json');
      vi.advanceTimersByTime(100);

      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });
});
