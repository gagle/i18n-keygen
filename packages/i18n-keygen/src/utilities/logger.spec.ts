import pc from 'picocolors';
import { log, logError, logWarn } from './logger';

describe('log', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockReturnValue();
  });

  it('should log message with yellow tag', () => {
    log('test message');

    expect(console.log).toHaveBeenCalledWith(`${pc.yellow('[I18n]')} test message`);
  });
});

describe('logWarn', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockReturnValue();
  });

  it('should log warning message with yellow tag and yellow text', () => {
    logWarn('something warned');

    expect(console.warn).toHaveBeenCalledWith(
      `${pc.yellow('[I18n]')} ${pc.yellow('something warned')}`,
    );
  });
});

describe('logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockReturnValue();
  });

  it('should log error message with yellow tag and red text', () => {
    logError('something failed');

    expect(console.error).toHaveBeenCalledWith(
      `${pc.yellow('[I18n]')} ${pc.red('something failed')}`,
    );
  });
});
