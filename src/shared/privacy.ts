const unsafe = /(?:[A-Za-z]:\\|\\\\|\/home\/|\/Users\/|https?:\/\/|(?:sk|ghp|xox)[-_][A-Za-z0-9_-]{8,})/i;
export function sanitizeText(value:string,max=64):string { const clean=value.replace(/[\r\n\t]/g,' ').replace(/\s+/g,' ').trim().slice(0,max); return unsafe.test(clean)?'Private':clean; }
export function safeFolderName(value:string):string|null { const parts=value.replace(/\\/g,'/').split('/').filter(Boolean); return parts.length?sanitizeText(parts.at(-1)!):null; }
