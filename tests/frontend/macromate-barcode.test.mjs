import test from 'node:test';
import assert from 'node:assert/strict';
test('GTIN accepts only ASCII 8/12/13/14 with check digit and preserves the original string',async()=>{
 const {validGTIN}=await import('../../frontend/barcode.js');
 for(const token of ['4006381333931','012345678905','96385074','00012345678905'])assert.equal(validGTIN(token),true,token);
 for(const token of ['4006381333932',' 4006381333931','4006381333931 ','４００６３８１３３３９３１','123','1e12',4006381333931])assert.equal(validGTIN(token),false,String(token));
});

test('camera cancellation stops a late permission stream and never starts decoding',async()=>{
 const {CameraScanner}=await import('../../frontend/scanner.js');
 let resolve;let stopped=0;let played=0;
 const media={getUserMedia:()=>new Promise(r=>resolve=r)};
 const video={srcObject:null,play:async()=>{played++;}};
 const scanner=new CameraScanner(video,{onResult:()=>assert.fail('late result'),onError:()=>assert.fail('unexpected error')},{secure:true,media});
 const starting=scanner.start();scanner.stop();
 resolve({getTracks:()=>[{stop:()=>stopped++}]});await starting;
 assert.equal(stopped,1);assert.equal(played,0);assert.equal(video.srcObject,null);
});

test('camera errors are visible safe messages and acquired tracks stop when playback fails',async()=>{
 const {CameraScanner}=await import('../../frontend/scanner.js');
 const errors=[];let stopped=0;
 const scanner=new CameraScanner({srcObject:null,play:async()=>{throw {name:'NotAllowedError'};}},{onError:message=>errors.push(message)},{secure:true,media:{getUserMedia:async()=>({getTracks:()=>[{stop:()=>stopped++}]})}});
 await scanner.start();assert.equal(stopped,1);assert.match(errors[0],/Berechtigung/);
 const insecure=new CameraScanner({}, {onError:message=>errors.push(message)},{secure:false,media:{getUserMedia:()=>assert.fail('must not request camera')}});
 await insecure.start();assert.match(errors[1],/HTTPS/);
});
