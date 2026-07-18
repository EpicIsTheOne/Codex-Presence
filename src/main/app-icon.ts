import {app,nativeImage,NativeImage} from 'electron';
import fs from 'node:fs';
import path from 'node:path';

function parseHex(color:string):[number,number,number]{
  return [Number.parseInt(color.slice(1,3),16),Number.parseInt(color.slice(3,5),16),Number.parseInt(color.slice(5,7),16)];
}

function compositeLogo(logo:NativeImage,size:number,background:string):NativeImage{
  const inset=Math.max(1,Math.round(size/16));
  const logoSize=Math.max(1,size-inset*2);
  const resized=logo.resize({width:logoSize,height:logoSize,quality:'best'});
  const source=resized.toBitmap();
  if(source.length!==logoSize*logoSize*4)return nativeImage.createEmpty();

  // Electron bitmaps are BGRA with premultiplied alpha. Compositing the decoded
  // PNG ourselves avoids Chromium dropping an <image> nested inside a data SVG.
  const [red,green,blue]=parseHex(background),bitmap=Buffer.alloc(size*size*4);
  for(let pixel=0;pixel<size*size;pixel++){
    const offset=pixel*4;
    bitmap[offset]=blue;bitmap[offset+1]=green;bitmap[offset+2]=red;bitmap[offset+3]=255;
  }
  for(let y=0;y<logoSize;y++)for(let x=0;x<logoSize;x++){
    const sourceOffset=(y*logoSize+x)*4,targetOffset=((y+inset)*size+x+inset)*4;
    const alpha=source[sourceOffset+3],inverse=255-alpha;
    bitmap[targetOffset]=Math.min(255,source[sourceOffset]+Math.round(blue*inverse/255));
    bitmap[targetOffset+1]=Math.min(255,source[sourceOffset+1]+Math.round(green*inverse/255));
    bitmap[targetOffset+2]=Math.min(255,source[sourceOffset+2]+Math.round(red*inverse/255));
    bitmap[targetOffset+3]=255;
  }
  return nativeImage.createFromBitmap(bitmap,{width:size,height:size,scaleFactor:1});
}

export function codexIcon(size=16,background='#f97316'):NativeImage {
  const safeBackground=/^#[a-fA-F0-9]{6}$/.test(background)?background:'#f97316';
  const candidates=[
    path.join(process.resourcesPath,'codex.png'),
    path.join(app.getAppPath(),'src','renderer','assets','codex.png'),
  ];
  for(const candidate of candidates){
    if(!fs.existsSync(candidate))continue;
    const logo=nativeImage.createFromPath(candidate);
    if(logo.isEmpty())continue;
    const image=compositeLogo(logo,size,safeBackground);
    if(!image.isEmpty())return image;
  }
  return nativeImage.createFromDataURL('data:image/svg+xml;base64,'+Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect rx="7" width="32" height="32" fill="${safeBackground}"/><circle cx="16" cy="16" r="11" fill="#6559f3"/><path d="M9 11l4 5-4 5m7 0h7" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`).toString('base64')).resize({width:size,height:size});
}
