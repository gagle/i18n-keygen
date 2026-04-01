vi.mock('../core/generate', () => ({
  generate: vi.fn(),
}));

vi.mock('../core/load-config', () => ({
  loadConfig: vi.fn(),
}));

vi.mock('../core/resolve-config', () => ({
  resolveConfig: vi.fn(),
}));

vi.mock('../core/watch', () => ({
  watchTranslations: vi.fn(),
}));

import { generate } from '../core/generate';
import { loadConfig } from '../core/load-config';
import { resolveConfig } from '../core/resolve-config';
import { watchTranslations } from '../core/watch';
import generateKeysExecutor from './executor';

const RAW_CONFIG = {
  outputFile: 'generated/keys.ts',
  scopes: [{ name: 'core', dir: 'i18n/core' }],
  supportedLangs: ['en', 'es'],
  defaultLang: 'en',
  scopeSeparator: '.',
  strictSync: false,
};

const RESOLVED_CONFIG = { ...RAW_CONFIG };

describe('generateKeysExecutor', () => {
  const workspaceRoot = '/workspace';
  const options = { configFile: 'i18n.config.json' };

  beforeEach(() => {
    vi.mocked(loadConfig).mockReturnValue(RAW_CONFIG);
    vi.mocked(resolveConfig).mockReturnValue(RESOLVED_CONFIG);
  });

  describe('when continuous is false', () => {
    const context = { root: workspaceRoot };

    describe('when generation succeeds', () => {
      beforeEach(() => {
        vi.mocked(generate).mockReturnValue(true);
      });

      it('should return success true', async () => {
        const result = await generateKeysExecutor(options, context);

        expect(result).toEqual({ success: true });
      });

      it('should call loadConfig with workspace root and config file path', async () => {
        await generateKeysExecutor(options, context);

        expect(loadConfig).toHaveBeenCalledWith(workspaceRoot, 'i18n.config.json');
      });

      it('should call resolveConfig with the loaded config', async () => {
        await generateKeysExecutor(options, context);

        expect(resolveConfig).toHaveBeenCalledWith(RAW_CONFIG);
      });

      it('should call generate with resolved config', async () => {
        await generateKeysExecutor(options, context);

        expect(generate).toHaveBeenCalledWith(workspaceRoot, RESOLVED_CONFIG);
      });
    });

    describe('when generation fails', () => {
      beforeEach(() => {
        vi.mocked(generate).mockReturnValue(false);
      });

      it('should return success false', async () => {
        const result = await generateKeysExecutor(options, context);

        expect(result).toEqual({ success: false });
      });
    });

    describe('when context has no target property', () => {
      it('should treat continuous as false', async () => {
        vi.mocked(generate).mockReturnValue(true);

        const result = await generateKeysExecutor(options, { root: workspaceRoot });

        expect(result).toEqual({ success: true });
      });
    });

    describe('when configFile is not provided', () => {
      it('should default to i18n.config.json', async () => {
        vi.mocked(generate).mockReturnValue(true);

        await generateKeysExecutor({}, { root: workspaceRoot });

        expect(loadConfig).toHaveBeenCalledWith(workspaceRoot, 'i18n.config.json');
      });
    });
  });

  describe('when continuous is true', () => {
    const context = {
      root: workspaceRoot,
      target: { continuous: true },
    };

    beforeEach(() => {
      vi.mocked(generate).mockReset();
      vi.mocked(generate).mockReturnValue(true);
    });

    it('should call generate once initially', async () => {
      generateKeysExecutor(options, context);
      await Promise.resolve();

      expect(generate).toHaveBeenCalledTimes(1);
    });

    it('should call watchTranslations', async () => {
      generateKeysExecutor(options, context);
      await Promise.resolve();

      expect(watchTranslations).toHaveBeenCalledWith(
        workspaceRoot,
        RESOLVED_CONFIG,
        expect.any(Function),
      );
    });

    it('should pass a regenerate callback to watchTranslations', async () => {
      generateKeysExecutor(options, context);
      await Promise.resolve();

      const callback = vi.mocked(watchTranslations).mock.calls[0]![2] as () => boolean;
      vi.mocked(generate).mockClear();
      callback();

      expect(generate).toHaveBeenCalledWith(workspaceRoot, RESOLVED_CONFIG);
    });

    it('should return a promise that never resolves', async () => {
      const result = generateKeysExecutor(options, context);
      await Promise.resolve();

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
