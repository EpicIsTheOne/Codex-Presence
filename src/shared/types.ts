export const activities = ['Planning','Coding','Editing','Running Tests','Waiting for Approval','Idle'] as const;
export type Activity = typeof activities[number];
export interface PresenceProfile { id:string; name:string; icon:string; customStatus:string; manualActivity:Activity|null; privateProject:boolean; showProject:boolean; showBranch:boolean; }
export interface PresenceRuleCondition { activities?:Activity[]; projectIds?:string[]; daysOfWeek?:number[]; startMinute?:number; endMinute?:number; }
export interface PresenceRuleAction { customStatus?:string; activity?:Activity; hidePresence?:boolean; privateProject?:boolean; showProject?:boolean; showBranch?:boolean; }
export interface PresenceRule { id:string; name:string; enabled:boolean; condition:PresenceRuleCondition; action:PresenceRuleAction; }
export interface ProjectStatusTemplate { projectId:string; status:string; }
export type AppTheme='midnight'|'violet'|'system';
export interface Settings { enabled:boolean; showProject:boolean; privateProject:boolean; hiddenProjectIds:string[]; showBranch:boolean; showModel:boolean; showActivity:boolean; showElapsed:boolean; autoDetect:boolean; launchAtStartup:boolean; idleTimeoutMinutes:number; hideWhenIdle:boolean; manualActivity:Activity|null; customStatus:string; automaticStatusTemplate:string; manualProject:string; discordClientId:string; profiles:PresenceProfile[]; activeProfileId:string|null; presenceRules:PresenceRule[]; projectStatusTemplates:ProjectStatusTemplate[]; theme:AppTheme; accentColor:string; systemIconBackground:string; largeImageKey:string; largeImageText:string; smallImageKey:string; smallImageText:string; }
export interface Detection { project:string|null; projectId:string|null; branch:string|null; activity:Activity; model:string|null; source:string; updatedAt:number; sessionId?:string|null; sessionStartedAt?:number|null; }
export interface ProjectSummary { id:string; name:string; hidden:boolean; }
export type PresenceBackend = 'none'|'discord-social-sdk'|'legacy-rpc';
export type RuntimeEventKind = 'activity'|'project'|'presence'|'connection';
export interface RuntimeEvent { id:number; at:number; kind:RuntimeEventKind; message:string; }
export interface RuntimeHealth { status:'healthy'|'degraded'|'inactive'; detectorAgeMs:number; presenceVisible:boolean; eventCount:number; lastTransitionAt:number|null; }
export interface RuntimeSession { id:string|null; startedAt:number; lastActiveAt:number; active:boolean; }
export interface TimelineQuery { limit?:number; since?:number; kinds?:RuntimeEventKind[]; }
export type DoctorCheckStatus='pass'|'warn'|'fail';
export interface DoctorCheck { id:string; label:string; status:DoctorCheckStatus; message:string; }
export interface RuntimeDoctorReport { generatedAt:number; overall:'healthy'|'warning'|'error'; checks:DoctorCheck[]; }
export interface DiagnosticsExportResult { success:boolean; canceled:boolean; message:string; }
export interface ViewState { settings:Settings; detection:Detection; projects:ProjectSummary[]; connection:'disabled'|'connecting'|'connected'|'disconnected'|'error'; backend:PresenceBackend; error:string|null; startedAt:number; payload:PresencePayload|null; health:RuntimeHealth; recentEvents:RuntimeEvent[]; session:RuntimeSession; matchedRuleIds:string[]; }
export interface PresencePayload { details:string; state?:string; startTimestamp?:number; largeImageKey?:string; largeImageText?:string; smallImageKey?:string; smallImageText?:string; instance?:boolean; }
export type SettingsPatch = Partial<Settings>;
