import pc from 'picocolors';

const TAG = pc.yellow('[I18n]');

export function log(message: string): void {
  console.log(`${TAG} ${message}`);
}

export function logWarn(message: string): void {
  console.warn(`${TAG} ${pc.yellow(message)}`);
}

export function logError(message: string): void {
  console.error(`${TAG} ${pc.red(message)}`);
}
