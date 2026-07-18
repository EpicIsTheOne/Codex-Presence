import fs from 'node:fs';
import path from 'node:path';
import {RuntimeEvent,TimelineQuery} from '../shared/types';

export class TimelineStore{
  private readonly events:RuntimeEvent[]=[];
  private nextId=0;
  constructor(private readonly file:string,private readonly capacity=2000){}
  load():RuntimeEvent[]{
    try{
      const parsed=JSON.parse(fs.readFileSync(this.file,'utf8')) as RuntimeEvent[];
      if(Array.isArray(parsed))for(const event of parsed){
        if(typeof event?.id==='number'&&typeof event.at==='number'&&typeof event.message==='string')this.events.push(event);
      }
      this.events.sort((a,b)=>b.at-a.at);this.events.splice(this.capacity);
      this.nextId=this.events.reduce((max,event)=>Math.max(max,event.id),0);
    }catch{}
    return this.list();
  }
  add(kind:RuntimeEvent['kind'],message:string,at=Date.now()):RuntimeEvent{
    const event={id:++this.nextId,at,kind,message};
    this.events.unshift(event);this.events.splice(this.capacity);this.persist();return event;
  }
  list(query:TimelineQuery={}):RuntimeEvent[]{
    const limit=Math.max(1,Math.min(500,Math.trunc(query.limit??50)));
    return this.events.filter(event=>(!query.since||event.at>=query.since)&&(!query.kinds?.length||query.kinds.includes(event.kind))).slice(0,limit);
  }
  clear():void{this.events.length=0;this.persist();}
  private persist():void{
    try{fs.mkdirSync(path.dirname(this.file),{recursive:true});const temp=this.file+'.tmp';fs.writeFileSync(temp,JSON.stringify(this.events),{encoding:'utf8',mode:0o600});fs.renameSync(temp,this.file);}catch{}
  }
}
