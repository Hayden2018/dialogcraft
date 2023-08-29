export function onElectronEnv(): boolean {
    return typeof process !== 'undefined' && !!process.versions && !!process.versions.electron;
}