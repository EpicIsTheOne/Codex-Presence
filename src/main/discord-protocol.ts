import {z} from 'zod';
import {PresencePayload} from '../shared/types';
const discordText=z.string().min(1).max(128);
export const bridgeCommandSchema=z.discriminatedUnion('type',[
  z.object({type:z.literal('setPresence'),applicationId:z.string().regex(/^\d{1,24}$/),name:z.literal('Codex'),details:discordText,state:discordText.optional(),startTimestamp:z.number().int().nonnegative().optional(),largeImage:z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/).optional(),largeText:discordText.optional(),smallImage:z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/).optional(),smallText:discordText.optional()}).strict(),
  z.object({type:z.literal('clearPresence')}).strict(),z.object({type:z.literal('shutdown')}).strict()
]);
export type BridgeCommand=z.infer<typeof bridgeCommandSchema>;
export function setPresenceCommand(applicationId:string,p:PresencePayload):BridgeCommand{return bridgeCommandSchema.parse({type:'setPresence',applicationId,name:'Codex',details:p.details,state:p.state,startTimestamp:p.startTimestamp,largeImage:p.largeImageKey,largeText:p.largeImageText,smallImage:p.smallImageKey,smallText:p.smallImageText});}
export function encodeBridgeCommand(command:BridgeCommand):string{return JSON.stringify(bridgeCommandSchema.parse(command))+'\n';}
