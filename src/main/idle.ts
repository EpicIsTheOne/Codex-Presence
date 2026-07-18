export function presenceTimedOut(activity:string,idleStarted:number|null,timeoutMinutes:number,now=Date.now()):boolean {
  return activity==='Idle'&&idleStarted!==null&&now-idleStarted>=timeoutMinutes*60_000;
}

export function shouldHidePresenceForIdle(activity:string,idleStarted:number|null,timeoutMinutes:number,hideWhenIdle:boolean,now=Date.now()):boolean {
  return (hideWhenIdle&&activity==='Idle')||presenceTimedOut(activity,idleStarted,timeoutMinutes,now);
}
