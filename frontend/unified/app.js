import{a as Ge,b as le,c as Dt,d as ge,e as u,f as rr,g as He,h as me,i as ce,j as c,k as nr}from"./chunks/chunk-GHX772XU.js";var xr=le((_r,jt)=>{(function(n){typeof _r=="object"&&typeof jt<"u"?jt.exports=n():typeof define=="function"&&define.amd?define([],n):(typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:this).JSZip=n()})(function(){return(function n(e,i,t){function r(d,g){if(!i[d]){if(!e[d]){var x=typeof Ge=="function"&&Ge;if(!g&&x)return x(d,!0);if(a)return a(d,!0);var $=new Error("Cannot find module '"+d+"'");throw $.code="MODULE_NOT_FOUND",$}var p=i[d]={exports:{}};e[d][0].call(p.exports,function(y){var h=e[d][1][y];return r(h||y)},p,p.exports,n,e,i,t)}return i[d].exports}for(var a=typeof Ge=="function"&&Ge,s=0;s<t.length;s++)r(t[s]);return r})({1:[function(n,e,i){"use strict";var t=n("./utils"),r=n("./support"),a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";i.encode=function(s){for(var d,g,x,$,p,y,h,_=[],v=0,w=s.length,C=w,A=t.getTypeOf(s)!=="string";v<s.length;)C=w-v,x=A?(d=s[v++],g=v<w?s[v++]:0,v<w?s[v++]:0):(d=s.charCodeAt(v++),g=v<w?s.charCodeAt(v++):0,v<w?s.charCodeAt(v++):0),$=d>>2,p=(3&d)<<4|g>>4,y=1<C?(15&g)<<2|x>>6:64,h=2<C?63&x:64,_.push(a.charAt($)+a.charAt(p)+a.charAt(y)+a.charAt(h));return _.join("")},i.decode=function(s){var d,g,x,$,p,y,h=0,_=0,v="data:";if(s.substr(0,v.length)===v)throw new Error("Invalid base64 input, it looks like a data url.");var w,C=3*(s=s.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(s.charAt(s.length-1)===a.charAt(64)&&C--,s.charAt(s.length-2)===a.charAt(64)&&C--,C%1!=0)throw new Error("Invalid base64 input, bad content length.");for(w=r.uint8array?new Uint8Array(0|C):new Array(0|C);h<s.length;)d=a.indexOf(s.charAt(h++))<<2|($=a.indexOf(s.charAt(h++)))>>4,g=(15&$)<<4|(p=a.indexOf(s.charAt(h++)))>>2,x=(3&p)<<6|(y=a.indexOf(s.charAt(h++))),w[_++]=d,p!==64&&(w[_++]=g),y!==64&&(w[_++]=x);return w}},{"./support":30,"./utils":32}],2:[function(n,e,i){"use strict";var t=n("./external"),r=n("./stream/DataWorker"),a=n("./stream/Crc32Probe"),s=n("./stream/DataLengthProbe");function d(g,x,$,p,y){this.compressedSize=g,this.uncompressedSize=x,this.crc32=$,this.compression=p,this.compressedContent=y}d.prototype={getContentWorker:function(){var g=new r(t.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new s("data_length")),x=this;return g.on("end",function(){if(this.streamInfo.data_length!==x.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),g},getCompressedWorker:function(){return new r(t.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},d.createWorkerFrom=function(g,x,$){return g.pipe(new a).pipe(new s("uncompressedSize")).pipe(x.compressWorker($)).pipe(new s("compressedSize")).withStreamInfo("compression",x)},e.exports=d},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(n,e,i){"use strict";var t=n("./stream/GenericWorker");i.STORE={magic:"\0\0",compressWorker:function(){return new t("STORE compression")},uncompressWorker:function(){return new t("STORE decompression")}},i.DEFLATE=n("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(n,e,i){"use strict";var t=n("./utils"),r=(function(){for(var a,s=[],d=0;d<256;d++){a=d;for(var g=0;g<8;g++)a=1&a?3988292384^a>>>1:a>>>1;s[d]=a}return s})();e.exports=function(a,s){return a!==void 0&&a.length?t.getTypeOf(a)!=="string"?(function(d,g,x,$){var p=r,y=$+x;d^=-1;for(var h=$;h<y;h++)d=d>>>8^p[255&(d^g[h])];return-1^d})(0|s,a,a.length,0):(function(d,g,x,$){var p=r,y=$+x;d^=-1;for(var h=$;h<y;h++)d=d>>>8^p[255&(d^g.charCodeAt(h))];return-1^d})(0|s,a,a.length,0):0}},{"./utils":32}],5:[function(n,e,i){"use strict";i.base64=!1,i.binary=!1,i.dir=!1,i.createFolders=!0,i.date=null,i.compression=null,i.compressionOptions=null,i.comment=null,i.unixPermissions=null,i.dosPermissions=null},{}],6:[function(n,e,i){"use strict";var t=null;t=typeof Promise<"u"?Promise:n("lie"),e.exports={Promise:t}},{lie:37}],7:[function(n,e,i){"use strict";var t=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",r=n("pako"),a=n("./utils"),s=n("./stream/GenericWorker"),d=t?"uint8array":"array";function g(x,$){s.call(this,"FlateWorker/"+x),this._pako=null,this._pakoAction=x,this._pakoOptions=$,this.meta={}}i.magic="\b\0",a.inherits(g,s),g.prototype.processChunk=function(x){this.meta=x.meta,this._pako===null&&this._createPako(),this._pako.push(a.transformTo(d,x.data),!1)},g.prototype.flush=function(){s.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},g.prototype.cleanUp=function(){s.prototype.cleanUp.call(this),this._pako=null},g.prototype._createPako=function(){this._pako=new r[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var x=this;this._pako.onData=function($){x.push({data:$,meta:x.meta})}},i.compressWorker=function(x){return new g("Deflate",x)},i.uncompressWorker=function(){return new g("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(n,e,i){"use strict";function t(p,y){var h,_="";for(h=0;h<y;h++)_+=String.fromCharCode(255&p),p>>>=8;return _}function r(p,y,h,_,v,w){var C,A,k=p.file,z=p.compression,O=w!==d.utf8encode,I=a.transformTo("string",w(k.name)),R=a.transformTo("string",d.utf8encode(k.name)),S=k.comment,T=a.transformTo("string",w(S)),f=a.transformTo("string",d.utf8encode(S)),E=R.length!==k.name.length,l=f.length!==S.length,P="",Q="",W="",re=k.dir,Z=k.date,ae={crc32:0,compressedSize:0,uncompressedSize:0};y&&!h||(ae.crc32=p.crc32,ae.compressedSize=p.compressedSize,ae.uncompressedSize=p.uncompressedSize);var N=0;y&&(N|=8),O||!E&&!l||(N|=2048);var B=0,se=0;re&&(B|=16),v==="UNIX"?(se=798,B|=(function(Y,he){var q=Y;return Y||(q=he?16893:33204),(65535&q)<<16})(k.unixPermissions,re)):(se=20,B|=(function(Y){return 63&(Y||0)})(k.dosPermissions)),C=Z.getUTCHours(),C<<=6,C|=Z.getUTCMinutes(),C<<=5,C|=Z.getUTCSeconds()/2,A=Z.getUTCFullYear()-1980,A<<=4,A|=Z.getUTCMonth()+1,A<<=5,A|=Z.getUTCDate(),E&&(Q=t(1,1)+t(g(I),4)+R,P+="up"+t(Q.length,2)+Q),l&&(W=t(1,1)+t(g(T),4)+f,P+="uc"+t(W.length,2)+W);var ie="";return ie+=`
\0`,ie+=t(N,2),ie+=z.magic,ie+=t(C,2),ie+=t(A,2),ie+=t(ae.crc32,4),ie+=t(ae.compressedSize,4),ie+=t(ae.uncompressedSize,4),ie+=t(I.length,2),ie+=t(P.length,2),{fileRecord:x.LOCAL_FILE_HEADER+ie+I+P,dirRecord:x.CENTRAL_FILE_HEADER+t(se,2)+ie+t(T.length,2)+"\0\0\0\0"+t(B,4)+t(_,4)+I+P+T}}var a=n("../utils"),s=n("../stream/GenericWorker"),d=n("../utf8"),g=n("../crc32"),x=n("../signature");function $(p,y,h,_){s.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=y,this.zipPlatform=h,this.encodeFileName=_,this.streamFiles=p,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}a.inherits($,s),$.prototype.push=function(p){var y=p.meta.percent||0,h=this.entriesCount,_=this._sources.length;this.accumulate?this.contentBuffer.push(p):(this.bytesWritten+=p.data.length,s.prototype.push.call(this,{data:p.data,meta:{currentFile:this.currentFile,percent:h?(y+100*(h-_-1))/h:100}}))},$.prototype.openedSource=function(p){this.currentSourceOffset=this.bytesWritten,this.currentFile=p.file.name;var y=this.streamFiles&&!p.file.dir;if(y){var h=r(p,y,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:h.fileRecord,meta:{percent:0}})}else this.accumulate=!0},$.prototype.closedSource=function(p){this.accumulate=!1;var y=this.streamFiles&&!p.file.dir,h=r(p,y,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(h.dirRecord),y)this.push({data:(function(_){return x.DATA_DESCRIPTOR+t(_.crc32,4)+t(_.compressedSize,4)+t(_.uncompressedSize,4)})(p),meta:{percent:100}});else for(this.push({data:h.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},$.prototype.flush=function(){for(var p=this.bytesWritten,y=0;y<this.dirRecords.length;y++)this.push({data:this.dirRecords[y],meta:{percent:100}});var h=this.bytesWritten-p,_=(function(v,w,C,A,k){var z=a.transformTo("string",k(A));return x.CENTRAL_DIRECTORY_END+"\0\0\0\0"+t(v,2)+t(v,2)+t(w,4)+t(C,4)+t(z.length,2)+z})(this.dirRecords.length,h,p,this.zipComment,this.encodeFileName);this.push({data:_,meta:{percent:100}})},$.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},$.prototype.registerPrevious=function(p){this._sources.push(p);var y=this;return p.on("data",function(h){y.processChunk(h)}),p.on("end",function(){y.closedSource(y.previous.streamInfo),y._sources.length?y.prepareNextSource():y.end()}),p.on("error",function(h){y.error(h)}),this},$.prototype.resume=function(){return!!s.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},$.prototype.error=function(p){var y=this._sources;if(!s.prototype.error.call(this,p))return!1;for(var h=0;h<y.length;h++)try{y[h].error(p)}catch{}return!0},$.prototype.lock=function(){s.prototype.lock.call(this);for(var p=this._sources,y=0;y<p.length;y++)p[y].lock()},e.exports=$},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(n,e,i){"use strict";var t=n("../compressions"),r=n("./ZipFileWorker");i.generateWorker=function(a,s,d){var g=new r(s.streamFiles,d,s.platform,s.encodeFileName),x=0;try{a.forEach(function($,p){x++;var y=(function(w,C){var A=w||C,k=t[A];if(!k)throw new Error(A+" is not a valid compression method !");return k})(p.options.compression,s.compression),h=p.options.compressionOptions||s.compressionOptions||{},_=p.dir,v=p.date;p._compressWorker(y,h).withStreamInfo("file",{name:$,dir:_,date:v,comment:p.comment||"",unixPermissions:p.unixPermissions,dosPermissions:p.dosPermissions}).pipe(g)}),g.entriesCount=x}catch($){g.error($)}return g}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(n,e,i){"use strict";function t(){if(!(this instanceof t))return new t;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var r=new t;for(var a in this)typeof this[a]!="function"&&(r[a]=this[a]);return r}}(t.prototype=n("./object")).loadAsync=n("./load"),t.support=n("./support"),t.defaults=n("./defaults"),t.version="3.10.1",t.loadAsync=function(r,a){return new t().loadAsync(r,a)},t.external=n("./external"),e.exports=t},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(n,e,i){"use strict";var t=n("./utils"),r=n("./external"),a=n("./utf8"),s=n("./zipEntries"),d=n("./stream/Crc32Probe"),g=n("./nodejsUtils");function x($){return new r.Promise(function(p,y){var h=$.decompressed.getContentWorker().pipe(new d);h.on("error",function(_){y(_)}).on("end",function(){h.streamInfo.crc32!==$.decompressed.crc32?y(new Error("Corrupted zip : CRC32 mismatch")):p()}).resume()})}e.exports=function($,p){var y=this;return p=t.extend(p||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:a.utf8decode}),g.isNode&&g.isStream($)?r.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):t.prepareContent("the loaded zip file",$,!0,p.optimizedBinaryString,p.base64).then(function(h){var _=new s(p);return _.load(h),_}).then(function(h){var _=[r.Promise.resolve(h)],v=h.files;if(p.checkCRC32)for(var w=0;w<v.length;w++)_.push(x(v[w]));return r.Promise.all(_)}).then(function(h){for(var _=h.shift(),v=_.files,w=0;w<v.length;w++){var C=v[w],A=C.fileNameStr,k=t.resolve(C.fileNameStr);y.file(k,C.decompressed,{binary:!0,optimizedBinaryString:!0,date:C.date,dir:C.dir,comment:C.fileCommentStr.length?C.fileCommentStr:null,unixPermissions:C.unixPermissions,dosPermissions:C.dosPermissions,createFolders:p.createFolders}),C.dir||(y.file(k).unsafeOriginalName=A)}return _.zipComment.length&&(y.comment=_.zipComment),y})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(n,e,i){"use strict";var t=n("../utils"),r=n("../stream/GenericWorker");function a(s,d){r.call(this,"Nodejs stream input adapter for "+s),this._upstreamEnded=!1,this._bindStream(d)}t.inherits(a,r),a.prototype._bindStream=function(s){var d=this;(this._stream=s).pause(),s.on("data",function(g){d.push({data:g,meta:{percent:0}})}).on("error",function(g){d.isPaused?this.generatedError=g:d.error(g)}).on("end",function(){d.isPaused?d._upstreamEnded=!0:d.end()})},a.prototype.pause=function(){return!!r.prototype.pause.call(this)&&(this._stream.pause(),!0)},a.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},e.exports=a},{"../stream/GenericWorker":28,"../utils":32}],13:[function(n,e,i){"use strict";var t=n("readable-stream").Readable;function r(a,s,d){t.call(this,s),this._helper=a;var g=this;a.on("data",function(x,$){g.push(x)||g._helper.pause(),d&&d($)}).on("error",function(x){g.emit("error",x)}).on("end",function(){g.push(null)})}n("../utils").inherits(r,t),r.prototype._read=function(){this._helper.resume()},e.exports=r},{"../utils":32,"readable-stream":16}],14:[function(n,e,i){"use strict";e.exports={isNode:typeof Buffer<"u",newBufferFrom:function(t,r){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(t,r);if(typeof t=="number")throw new Error('The "data" argument must not be a number');return new Buffer(t,r)},allocBuffer:function(t){if(Buffer.alloc)return Buffer.alloc(t);var r=new Buffer(t);return r.fill(0),r},isBuffer:function(t){return Buffer.isBuffer(t)},isStream:function(t){return t&&typeof t.on=="function"&&typeof t.pause=="function"&&typeof t.resume=="function"}}},{}],15:[function(n,e,i){"use strict";function t(k,z,O){var I,R=a.getTypeOf(z),S=a.extend(O||{},g);S.date=S.date||new Date,S.compression!==null&&(S.compression=S.compression.toUpperCase()),typeof S.unixPermissions=="string"&&(S.unixPermissions=parseInt(S.unixPermissions,8)),S.unixPermissions&&16384&S.unixPermissions&&(S.dir=!0),S.dosPermissions&&16&S.dosPermissions&&(S.dir=!0),S.dir&&(k=v(k)),S.createFolders&&(I=_(k))&&w.call(this,I,!0);var T=R==="string"&&S.binary===!1&&S.base64===!1;O&&O.binary!==void 0||(S.binary=!T),(z instanceof x&&z.uncompressedSize===0||S.dir||!z||z.length===0)&&(S.base64=!1,S.binary=!0,z="",S.compression="STORE",R="string");var f=null;f=z instanceof x||z instanceof s?z:y.isNode&&y.isStream(z)?new h(k,z):a.prepareContent(k,z,S.binary,S.optimizedBinaryString,S.base64);var E=new $(k,f,S);this.files[k]=E}var r=n("./utf8"),a=n("./utils"),s=n("./stream/GenericWorker"),d=n("./stream/StreamHelper"),g=n("./defaults"),x=n("./compressedObject"),$=n("./zipObject"),p=n("./generate"),y=n("./nodejsUtils"),h=n("./nodejs/NodejsStreamInputAdapter"),_=function(k){k.slice(-1)==="/"&&(k=k.substring(0,k.length-1));var z=k.lastIndexOf("/");return 0<z?k.substring(0,z):""},v=function(k){return k.slice(-1)!=="/"&&(k+="/"),k},w=function(k,z){return z=z!==void 0?z:g.createFolders,k=v(k),this.files[k]||t.call(this,k,null,{dir:!0,createFolders:z}),this.files[k]};function C(k){return Object.prototype.toString.call(k)==="[object RegExp]"}var A={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(k){var z,O,I;for(z in this.files)I=this.files[z],(O=z.slice(this.root.length,z.length))&&z.slice(0,this.root.length)===this.root&&k(O,I)},filter:function(k){var z=[];return this.forEach(function(O,I){k(O,I)&&z.push(I)}),z},file:function(k,z,O){if(arguments.length!==1)return k=this.root+k,t.call(this,k,z,O),this;if(C(k)){var I=k;return this.filter(function(S,T){return!T.dir&&I.test(S)})}var R=this.files[this.root+k];return R&&!R.dir?R:null},folder:function(k){if(!k)return this;if(C(k))return this.filter(function(R,S){return S.dir&&k.test(R)});var z=this.root+k,O=w.call(this,z),I=this.clone();return I.root=O.name,I},remove:function(k){k=this.root+k;var z=this.files[k];if(z||(k.slice(-1)!=="/"&&(k+="/"),z=this.files[k]),z&&!z.dir)delete this.files[k];else for(var O=this.filter(function(R,S){return S.name.slice(0,k.length)===k}),I=0;I<O.length;I++)delete this.files[O[I].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(k){var z,O={};try{if((O=a.extend(k||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:r.utf8encode})).type=O.type.toLowerCase(),O.compression=O.compression.toUpperCase(),O.type==="binarystring"&&(O.type="string"),!O.type)throw new Error("No output type specified.");a.checkSupport(O.type),O.platform!=="darwin"&&O.platform!=="freebsd"&&O.platform!=="linux"&&O.platform!=="sunos"||(O.platform="UNIX"),O.platform==="win32"&&(O.platform="DOS");var I=O.comment||this.comment||"";z=p.generateWorker(this,O,I)}catch(R){(z=new s("error")).error(R)}return new d(z,O.type||"string",O.mimeType)},generateAsync:function(k,z){return this.generateInternalStream(k).accumulate(z)},generateNodeStream:function(k,z){return(k=k||{}).type||(k.type="nodebuffer"),this.generateInternalStream(k).toNodejsStream(z)}};e.exports=A},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(n,e,i){"use strict";e.exports=n("stream")},{stream:void 0}],17:[function(n,e,i){"use strict";var t=n("./DataReader");function r(a){t.call(this,a);for(var s=0;s<this.data.length;s++)a[s]=255&a[s]}n("../utils").inherits(r,t),r.prototype.byteAt=function(a){return this.data[this.zero+a]},r.prototype.lastIndexOfSignature=function(a){for(var s=a.charCodeAt(0),d=a.charCodeAt(1),g=a.charCodeAt(2),x=a.charCodeAt(3),$=this.length-4;0<=$;--$)if(this.data[$]===s&&this.data[$+1]===d&&this.data[$+2]===g&&this.data[$+3]===x)return $-this.zero;return-1},r.prototype.readAndCheckSignature=function(a){var s=a.charCodeAt(0),d=a.charCodeAt(1),g=a.charCodeAt(2),x=a.charCodeAt(3),$=this.readData(4);return s===$[0]&&d===$[1]&&g===$[2]&&x===$[3]},r.prototype.readData=function(a){if(this.checkOffset(a),a===0)return[];var s=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./DataReader":18}],18:[function(n,e,i){"use strict";var t=n("../utils");function r(a){this.data=a,this.length=a.length,this.index=0,this.zero=0}r.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<this.zero+a||a<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var s,d=0;for(this.checkOffset(a),s=this.index+a-1;s>=this.index;s--)d=(d<<8)+this.byteAt(s);return this.index+=a,d},readString:function(a){return t.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date(Date.UTC(1980+(a>>25&127),(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1))}},e.exports=r},{"../utils":32}],19:[function(n,e,i){"use strict";var t=n("./Uint8ArrayReader");function r(a){t.call(this,a)}n("../utils").inherits(r,t),r.prototype.readData=function(a){this.checkOffset(a);var s=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(n,e,i){"use strict";var t=n("./DataReader");function r(a){t.call(this,a)}n("../utils").inherits(r,t),r.prototype.byteAt=function(a){return this.data.charCodeAt(this.zero+a)},r.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)-this.zero},r.prototype.readAndCheckSignature=function(a){return a===this.readData(4)},r.prototype.readData=function(a){this.checkOffset(a);var s=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./DataReader":18}],21:[function(n,e,i){"use strict";var t=n("./ArrayReader");function r(a){t.call(this,a)}n("../utils").inherits(r,t),r.prototype.readData=function(a){if(this.checkOffset(a),a===0)return new Uint8Array(0);var s=this.data.subarray(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./ArrayReader":17}],22:[function(n,e,i){"use strict";var t=n("../utils"),r=n("../support"),a=n("./ArrayReader"),s=n("./StringReader"),d=n("./NodeBufferReader"),g=n("./Uint8ArrayReader");e.exports=function(x){var $=t.getTypeOf(x);return t.checkSupport($),$!=="string"||r.uint8array?$==="nodebuffer"?new d(x):r.uint8array?new g(t.transformTo("uint8array",x)):new a(t.transformTo("array",x)):new s(x)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(n,e,i){"use strict";i.LOCAL_FILE_HEADER="PK",i.CENTRAL_FILE_HEADER="PK",i.CENTRAL_DIRECTORY_END="PK",i.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",i.ZIP64_CENTRAL_DIRECTORY_END="PK",i.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(n,e,i){"use strict";var t=n("./GenericWorker"),r=n("../utils");function a(s){t.call(this,"ConvertWorker to "+s),this.destType=s}r.inherits(a,t),a.prototype.processChunk=function(s){this.push({data:r.transformTo(this.destType,s.data),meta:s.meta})},e.exports=a},{"../utils":32,"./GenericWorker":28}],25:[function(n,e,i){"use strict";var t=n("./GenericWorker"),r=n("../crc32");function a(){t.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}n("../utils").inherits(a,t),a.prototype.processChunk=function(s){this.streamInfo.crc32=r(s.data,this.streamInfo.crc32||0),this.push(s)},e.exports=a},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(n,e,i){"use strict";var t=n("../utils"),r=n("./GenericWorker");function a(s){r.call(this,"DataLengthProbe for "+s),this.propName=s,this.withStreamInfo(s,0)}t.inherits(a,r),a.prototype.processChunk=function(s){if(s){var d=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=d+s.data.length}r.prototype.processChunk.call(this,s)},e.exports=a},{"../utils":32,"./GenericWorker":28}],27:[function(n,e,i){"use strict";var t=n("../utils"),r=n("./GenericWorker");function a(s){r.call(this,"DataWorker");var d=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,s.then(function(g){d.dataIsReady=!0,d.data=g,d.max=g&&g.length||0,d.type=t.getTypeOf(g),d.isPaused||d._tickAndRepeat()},function(g){d.error(g)})}t.inherits(a,r),a.prototype.cleanUp=function(){r.prototype.cleanUp.call(this),this.data=null},a.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,t.delay(this._tickAndRepeat,[],this)),!0)},a.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(t.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},a.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var s=null,d=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":s=this.data.substring(this.index,d);break;case"uint8array":s=this.data.subarray(this.index,d);break;case"array":case"nodebuffer":s=this.data.slice(this.index,d)}return this.index=d,this.push({data:s,meta:{percent:this.max?this.index/this.max*100:0}})},e.exports=a},{"../utils":32,"./GenericWorker":28}],28:[function(n,e,i){"use strict";function t(r){this.name=r||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}t.prototype={push:function(r){this.emit("data",r)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(r){this.emit("error",r)}return!0},error:function(r){return!this.isFinished&&(this.isPaused?this.generatedError=r:(this.isFinished=!0,this.emit("error",r),this.previous&&this.previous.error(r),this.cleanUp()),!0)},on:function(r,a){return this._listeners[r].push(a),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(r,a){if(this._listeners[r])for(var s=0;s<this._listeners[r].length;s++)this._listeners[r][s].call(this,a)},pipe:function(r){return r.registerPrevious(this)},registerPrevious:function(r){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=r.streamInfo,this.mergeStreamInfo(),this.previous=r;var a=this;return r.on("data",function(s){a.processChunk(s)}),r.on("end",function(){a.end()}),r.on("error",function(s){a.error(s)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var r=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),r=!0),this.previous&&this.previous.resume(),!r},flush:function(){},processChunk:function(r){this.push(r)},withStreamInfo:function(r,a){return this.extraStreamInfo[r]=a,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var r in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,r)&&(this.streamInfo[r]=this.extraStreamInfo[r])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var r="Worker "+this.name;return this.previous?this.previous+" -> "+r:r}},e.exports=t},{}],29:[function(n,e,i){"use strict";var t=n("../utils"),r=n("./ConvertWorker"),a=n("./GenericWorker"),s=n("../base64"),d=n("../support"),g=n("../external"),x=null;if(d.nodestream)try{x=n("../nodejs/NodejsStreamOutputAdapter")}catch{}function $(y,h){return new g.Promise(function(_,v){var w=[],C=y._internalType,A=y._outputType,k=y._mimeType;y.on("data",function(z,O){w.push(z),h&&h(O)}).on("error",function(z){w=[],v(z)}).on("end",function(){try{var z=(function(O,I,R){switch(O){case"blob":return t.newBlob(t.transformTo("arraybuffer",I),R);case"base64":return s.encode(I);default:return t.transformTo(O,I)}})(A,(function(O,I){var R,S=0,T=null,f=0;for(R=0;R<I.length;R++)f+=I[R].length;switch(O){case"string":return I.join("");case"array":return Array.prototype.concat.apply([],I);case"uint8array":for(T=new Uint8Array(f),R=0;R<I.length;R++)T.set(I[R],S),S+=I[R].length;return T;case"nodebuffer":return Buffer.concat(I);default:throw new Error("concat : unsupported type '"+O+"'")}})(C,w),k);_(z)}catch(O){v(O)}w=[]}).resume()})}function p(y,h,_){var v=h;switch(h){case"blob":case"arraybuffer":v="uint8array";break;case"base64":v="string"}try{this._internalType=v,this._outputType=h,this._mimeType=_,t.checkSupport(v),this._worker=y.pipe(new r(v)),y.lock()}catch(w){this._worker=new a("error"),this._worker.error(w)}}p.prototype={accumulate:function(y){return $(this,y)},on:function(y,h){var _=this;return y==="data"?this._worker.on(y,function(v){h.call(_,v.data,v.meta)}):this._worker.on(y,function(){t.delay(h,arguments,_)}),this},resume:function(){return t.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(y){if(t.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new x(this,{objectMode:this._outputType!=="nodebuffer"},y)}},e.exports=p},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(n,e,i){"use strict";if(i.base64=!0,i.array=!0,i.string=!0,i.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",i.nodebuffer=typeof Buffer<"u",i.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")i.blob=!1;else{var t=new ArrayBuffer(0);try{i.blob=new Blob([t],{type:"application/zip"}).size===0}catch{try{var r=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);r.append(t),i.blob=r.getBlob("application/zip").size===0}catch{i.blob=!1}}}try{i.nodestream=!!n("readable-stream").Readable}catch{i.nodestream=!1}},{"readable-stream":16}],31:[function(n,e,i){"use strict";for(var t=n("./utils"),r=n("./support"),a=n("./nodejsUtils"),s=n("./stream/GenericWorker"),d=new Array(256),g=0;g<256;g++)d[g]=252<=g?6:248<=g?5:240<=g?4:224<=g?3:192<=g?2:1;d[254]=d[254]=1;function x(){s.call(this,"utf-8 decode"),this.leftOver=null}function $(){s.call(this,"utf-8 encode")}i.utf8encode=function(p){return r.nodebuffer?a.newBufferFrom(p,"utf-8"):(function(y){var h,_,v,w,C,A=y.length,k=0;for(w=0;w<A;w++)(64512&(_=y.charCodeAt(w)))==55296&&w+1<A&&(64512&(v=y.charCodeAt(w+1)))==56320&&(_=65536+(_-55296<<10)+(v-56320),w++),k+=_<128?1:_<2048?2:_<65536?3:4;for(h=r.uint8array?new Uint8Array(k):new Array(k),w=C=0;C<k;w++)(64512&(_=y.charCodeAt(w)))==55296&&w+1<A&&(64512&(v=y.charCodeAt(w+1)))==56320&&(_=65536+(_-55296<<10)+(v-56320),w++),_<128?h[C++]=_:(_<2048?h[C++]=192|_>>>6:(_<65536?h[C++]=224|_>>>12:(h[C++]=240|_>>>18,h[C++]=128|_>>>12&63),h[C++]=128|_>>>6&63),h[C++]=128|63&_);return h})(p)},i.utf8decode=function(p){return r.nodebuffer?t.transformTo("nodebuffer",p).toString("utf-8"):(function(y){var h,_,v,w,C=y.length,A=new Array(2*C);for(h=_=0;h<C;)if((v=y[h++])<128)A[_++]=v;else if(4<(w=d[v]))A[_++]=65533,h+=w-1;else{for(v&=w===2?31:w===3?15:7;1<w&&h<C;)v=v<<6|63&y[h++],w--;1<w?A[_++]=65533:v<65536?A[_++]=v:(v-=65536,A[_++]=55296|v>>10&1023,A[_++]=56320|1023&v)}return A.length!==_&&(A.subarray?A=A.subarray(0,_):A.length=_),t.applyFromCharCode(A)})(p=t.transformTo(r.uint8array?"uint8array":"array",p))},t.inherits(x,s),x.prototype.processChunk=function(p){var y=t.transformTo(r.uint8array?"uint8array":"array",p.data);if(this.leftOver&&this.leftOver.length){if(r.uint8array){var h=y;(y=new Uint8Array(h.length+this.leftOver.length)).set(this.leftOver,0),y.set(h,this.leftOver.length)}else y=this.leftOver.concat(y);this.leftOver=null}var _=(function(w,C){var A;for((C=C||w.length)>w.length&&(C=w.length),A=C-1;0<=A&&(192&w[A])==128;)A--;return A<0||A===0?C:A+d[w[A]]>C?A:C})(y),v=y;_!==y.length&&(r.uint8array?(v=y.subarray(0,_),this.leftOver=y.subarray(_,y.length)):(v=y.slice(0,_),this.leftOver=y.slice(_,y.length))),this.push({data:i.utf8decode(v),meta:p.meta})},x.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:i.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},i.Utf8DecodeWorker=x,t.inherits($,s),$.prototype.processChunk=function(p){this.push({data:i.utf8encode(p.data),meta:p.meta})},i.Utf8EncodeWorker=$},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(n,e,i){"use strict";var t=n("./support"),r=n("./base64"),a=n("./nodejsUtils"),s=n("./external");function d(h){return h}function g(h,_){for(var v=0;v<h.length;++v)_[v]=255&h.charCodeAt(v);return _}n("setimmediate"),i.newBlob=function(h,_){i.checkSupport("blob");try{return new Blob([h],{type:_})}catch{try{var v=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return v.append(h),v.getBlob(_)}catch{throw new Error("Bug : can't construct the Blob.")}}};var x={stringifyByChunk:function(h,_,v){var w=[],C=0,A=h.length;if(A<=v)return String.fromCharCode.apply(null,h);for(;C<A;)_==="array"||_==="nodebuffer"?w.push(String.fromCharCode.apply(null,h.slice(C,Math.min(C+v,A)))):w.push(String.fromCharCode.apply(null,h.subarray(C,Math.min(C+v,A)))),C+=v;return w.join("")},stringifyByChar:function(h){for(var _="",v=0;v<h.length;v++)_+=String.fromCharCode(h[v]);return _},applyCanBeUsed:{uint8array:(function(){try{return t.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}})(),nodebuffer:(function(){try{return t.nodebuffer&&String.fromCharCode.apply(null,a.allocBuffer(1)).length===1}catch{return!1}})()}};function $(h){var _=65536,v=i.getTypeOf(h),w=!0;if(v==="uint8array"?w=x.applyCanBeUsed.uint8array:v==="nodebuffer"&&(w=x.applyCanBeUsed.nodebuffer),w)for(;1<_;)try{return x.stringifyByChunk(h,v,_)}catch{_=Math.floor(_/2)}return x.stringifyByChar(h)}function p(h,_){for(var v=0;v<h.length;v++)_[v]=h[v];return _}i.applyFromCharCode=$;var y={};y.string={string:d,array:function(h){return g(h,new Array(h.length))},arraybuffer:function(h){return y.string.uint8array(h).buffer},uint8array:function(h){return g(h,new Uint8Array(h.length))},nodebuffer:function(h){return g(h,a.allocBuffer(h.length))}},y.array={string:$,array:d,arraybuffer:function(h){return new Uint8Array(h).buffer},uint8array:function(h){return new Uint8Array(h)},nodebuffer:function(h){return a.newBufferFrom(h)}},y.arraybuffer={string:function(h){return $(new Uint8Array(h))},array:function(h){return p(new Uint8Array(h),new Array(h.byteLength))},arraybuffer:d,uint8array:function(h){return new Uint8Array(h)},nodebuffer:function(h){return a.newBufferFrom(new Uint8Array(h))}},y.uint8array={string:$,array:function(h){return p(h,new Array(h.length))},arraybuffer:function(h){return h.buffer},uint8array:d,nodebuffer:function(h){return a.newBufferFrom(h)}},y.nodebuffer={string:$,array:function(h){return p(h,new Array(h.length))},arraybuffer:function(h){return y.nodebuffer.uint8array(h).buffer},uint8array:function(h){return p(h,new Uint8Array(h.length))},nodebuffer:d},i.transformTo=function(h,_){if(_=_||"",!h)return _;i.checkSupport(h);var v=i.getTypeOf(_);return y[v][h](_)},i.resolve=function(h){for(var _=h.split("/"),v=[],w=0;w<_.length;w++){var C=_[w];C==="."||C===""&&w!==0&&w!==_.length-1||(C===".."?v.pop():v.push(C))}return v.join("/")},i.getTypeOf=function(h){return typeof h=="string"?"string":Object.prototype.toString.call(h)==="[object Array]"?"array":t.nodebuffer&&a.isBuffer(h)?"nodebuffer":t.uint8array&&h instanceof Uint8Array?"uint8array":t.arraybuffer&&h instanceof ArrayBuffer?"arraybuffer":void 0},i.checkSupport=function(h){if(!t[h.toLowerCase()])throw new Error(h+" is not supported by this platform")},i.MAX_VALUE_16BITS=65535,i.MAX_VALUE_32BITS=-1,i.pretty=function(h){var _,v,w="";for(v=0;v<(h||"").length;v++)w+="\\x"+((_=h.charCodeAt(v))<16?"0":"")+_.toString(16).toUpperCase();return w},i.delay=function(h,_,v){setImmediate(function(){h.apply(v||null,_||[])})},i.inherits=function(h,_){function v(){}v.prototype=_.prototype,h.prototype=new v},i.extend=function(){var h,_,v={};for(h=0;h<arguments.length;h++)for(_ in arguments[h])Object.prototype.hasOwnProperty.call(arguments[h],_)&&v[_]===void 0&&(v[_]=arguments[h][_]);return v},i.prepareContent=function(h,_,v,w,C){return s.Promise.resolve(_).then(function(A){return t.blob&&(A instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(A))!==-1)&&typeof FileReader<"u"?new s.Promise(function(k,z){var O=new FileReader;O.onload=function(I){k(I.target.result)},O.onerror=function(I){z(I.target.error)},O.readAsArrayBuffer(A)}):A}).then(function(A){var k=i.getTypeOf(A);return k?(k==="arraybuffer"?A=i.transformTo("uint8array",A):k==="string"&&(C?A=r.decode(A):v&&w!==!0&&(A=(function(z){return g(z,t.uint8array?new Uint8Array(z.length):new Array(z.length))})(A))),A):s.Promise.reject(new Error("Can't read the data of '"+h+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(n,e,i){"use strict";var t=n("./reader/readerFor"),r=n("./utils"),a=n("./signature"),s=n("./zipEntry"),d=n("./support");function g(x){this.files=[],this.loadOptions=x}g.prototype={checkSignature:function(x){if(!this.reader.readAndCheckSignature(x)){this.reader.index-=4;var $=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+r.pretty($)+", expected "+r.pretty(x)+")")}},isSignature:function(x,$){var p=this.reader.index;this.reader.setIndex(x);var y=this.reader.readString(4)===$;return this.reader.setIndex(p),y},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var x=this.reader.readData(this.zipCommentLength),$=d.uint8array?"uint8array":"array",p=r.transformTo($,x);this.zipComment=this.loadOptions.decodeFileName(p)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var x,$,p,y=this.zip64EndOfCentralSize-44;0<y;)x=this.reader.readInt(2),$=this.reader.readInt(4),p=this.reader.readData($),this.zip64ExtensibleData[x]={id:x,length:$,value:p}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var x,$;for(x=0;x<this.files.length;x++)$=this.files[x],this.reader.setIndex($.localHeaderOffset),this.checkSignature(a.LOCAL_FILE_HEADER),$.readLocalPart(this.reader),$.handleUTF8(),$.processAttributes()},readCentralDir:function(){var x;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(a.CENTRAL_FILE_HEADER);)(x=new s({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(x);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var x=this.reader.lastIndexOfSignature(a.CENTRAL_DIRECTORY_END);if(x<0)throw this.isSignature(0,a.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(x);var $=x;if(this.checkSignature(a.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===r.MAX_VALUE_16BITS||this.diskWithCentralDirStart===r.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===r.MAX_VALUE_16BITS||this.centralDirRecords===r.MAX_VALUE_16BITS||this.centralDirSize===r.MAX_VALUE_32BITS||this.centralDirOffset===r.MAX_VALUE_32BITS){if(this.zip64=!0,(x=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(x),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,a.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var p=this.centralDirOffset+this.centralDirSize;this.zip64&&(p+=20,p+=12+this.zip64EndOfCentralSize);var y=$-p;if(0<y)this.isSignature($,a.CENTRAL_FILE_HEADER)||(this.reader.zero=y);else if(y<0)throw new Error("Corrupted zip: missing "+Math.abs(y)+" bytes.")},prepareReader:function(x){this.reader=t(x)},load:function(x){this.prepareReader(x),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},e.exports=g},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(n,e,i){"use strict";var t=n("./reader/readerFor"),r=n("./utils"),a=n("./compressedObject"),s=n("./crc32"),d=n("./utf8"),g=n("./compressions"),x=n("./support");function $(p,y){this.options=p,this.loadOptions=y}$.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(p){var y,h;if(p.skip(22),this.fileNameLength=p.readInt(2),h=p.readInt(2),this.fileName=p.readData(this.fileNameLength),p.skip(h),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((y=(function(_){for(var v in g)if(Object.prototype.hasOwnProperty.call(g,v)&&g[v].magic===_)return g[v];return null})(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+r.pretty(this.compressionMethod)+" unknown (inner file : "+r.transformTo("string",this.fileName)+")");this.decompressed=new a(this.compressedSize,this.uncompressedSize,this.crc32,y,p.readData(this.compressedSize))},readCentralPart:function(p){this.versionMadeBy=p.readInt(2),p.skip(2),this.bitFlag=p.readInt(2),this.compressionMethod=p.readString(2),this.date=p.readDate(),this.crc32=p.readInt(4),this.compressedSize=p.readInt(4),this.uncompressedSize=p.readInt(4);var y=p.readInt(2);if(this.extraFieldsLength=p.readInt(2),this.fileCommentLength=p.readInt(2),this.diskNumberStart=p.readInt(2),this.internalFileAttributes=p.readInt(2),this.externalFileAttributes=p.readInt(4),this.localHeaderOffset=p.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");p.skip(y),this.readExtraFields(p),this.parseZIP64ExtraField(p),this.fileComment=p.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var p=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),p==0&&(this.dosPermissions=63&this.externalFileAttributes),p==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var p=t(this.extraFields[1].value);this.uncompressedSize===r.MAX_VALUE_32BITS&&(this.uncompressedSize=p.readInt(8)),this.compressedSize===r.MAX_VALUE_32BITS&&(this.compressedSize=p.readInt(8)),this.localHeaderOffset===r.MAX_VALUE_32BITS&&(this.localHeaderOffset=p.readInt(8)),this.diskNumberStart===r.MAX_VALUE_32BITS&&(this.diskNumberStart=p.readInt(4))}},readExtraFields:function(p){var y,h,_,v=p.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});p.index+4<v;)y=p.readInt(2),h=p.readInt(2),_=p.readData(h),this.extraFields[y]={id:y,length:h,value:_};p.setIndex(v)},handleUTF8:function(){var p=x.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=d.utf8decode(this.fileName),this.fileCommentStr=d.utf8decode(this.fileComment);else{var y=this.findExtraFieldUnicodePath();if(y!==null)this.fileNameStr=y;else{var h=r.transformTo(p,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(h)}var _=this.findExtraFieldUnicodeComment();if(_!==null)this.fileCommentStr=_;else{var v=r.transformTo(p,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(v)}}},findExtraFieldUnicodePath:function(){var p=this.extraFields[28789];if(p){var y=t(p.value);return y.readInt(1)!==1||s(this.fileName)!==y.readInt(4)?null:d.utf8decode(y.readData(p.length-5))}return null},findExtraFieldUnicodeComment:function(){var p=this.extraFields[25461];if(p){var y=t(p.value);return y.readInt(1)!==1||s(this.fileComment)!==y.readInt(4)?null:d.utf8decode(y.readData(p.length-5))}return null}},e.exports=$},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(n,e,i){"use strict";function t(y,h,_){this.name=y,this.dir=_.dir,this.date=_.date,this.comment=_.comment,this.unixPermissions=_.unixPermissions,this.dosPermissions=_.dosPermissions,this._data=h,this._dataBinary=_.binary,this.options={compression:_.compression,compressionOptions:_.compressionOptions}}var r=n("./stream/StreamHelper"),a=n("./stream/DataWorker"),s=n("./utf8"),d=n("./compressedObject"),g=n("./stream/GenericWorker");t.prototype={internalStream:function(y){var h=null,_="string";try{if(!y)throw new Error("No output type specified.");var v=(_=y.toLowerCase())==="string"||_==="text";_!=="binarystring"&&_!=="text"||(_="string"),h=this._decompressWorker();var w=!this._dataBinary;w&&!v&&(h=h.pipe(new s.Utf8EncodeWorker)),!w&&v&&(h=h.pipe(new s.Utf8DecodeWorker))}catch(C){(h=new g("error")).error(C)}return new r(h,_,"")},async:function(y,h){return this.internalStream(y).accumulate(h)},nodeStream:function(y,h){return this.internalStream(y||"nodebuffer").toNodejsStream(h)},_compressWorker:function(y,h){if(this._data instanceof d&&this._data.compression.magic===y.magic)return this._data.getCompressedWorker();var _=this._decompressWorker();return this._dataBinary||(_=_.pipe(new s.Utf8EncodeWorker)),d.createWorkerFrom(_,y,h)},_decompressWorker:function(){return this._data instanceof d?this._data.getContentWorker():this._data instanceof g?this._data:new a(this._data)}};for(var x=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],$=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},p=0;p<x.length;p++)t.prototype[x[p]]=$;e.exports=t},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(n,e,i){(function(t){"use strict";var r,a,s=t.MutationObserver||t.WebKitMutationObserver;if(s){var d=0,g=new s(y),x=t.document.createTextNode("");g.observe(x,{characterData:!0}),r=function(){x.data=d=++d%2}}else if(t.setImmediate||t.MessageChannel===void 0)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var h=t.document.createElement("script");h.onreadystatechange=function(){y(),h.onreadystatechange=null,h.parentNode.removeChild(h),h=null},t.document.documentElement.appendChild(h)}:function(){setTimeout(y,0)};else{var $=new t.MessageChannel;$.port1.onmessage=y,r=function(){$.port2.postMessage(0)}}var p=[];function y(){var h,_;a=!0;for(var v=p.length;v;){for(_=p,p=[],h=-1;++h<v;)_[h]();v=p.length}a=!1}e.exports=function(h){p.push(h)!==1||a||r()}}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(n,e,i){"use strict";var t=n("immediate");function r(){}var a={},s=["REJECTED"],d=["FULFILLED"],g=["PENDING"];function x(v){if(typeof v!="function")throw new TypeError("resolver must be a function");this.state=g,this.queue=[],this.outcome=void 0,v!==r&&h(this,v)}function $(v,w,C){this.promise=v,typeof w=="function"&&(this.onFulfilled=w,this.callFulfilled=this.otherCallFulfilled),typeof C=="function"&&(this.onRejected=C,this.callRejected=this.otherCallRejected)}function p(v,w,C){t(function(){var A;try{A=w(C)}catch(k){return a.reject(v,k)}A===v?a.reject(v,new TypeError("Cannot resolve promise with itself")):a.resolve(v,A)})}function y(v){var w=v&&v.then;if(v&&(typeof v=="object"||typeof v=="function")&&typeof w=="function")return function(){w.apply(v,arguments)}}function h(v,w){var C=!1;function A(O){C||(C=!0,a.reject(v,O))}function k(O){C||(C=!0,a.resolve(v,O))}var z=_(function(){w(k,A)});z.status==="error"&&A(z.value)}function _(v,w){var C={};try{C.value=v(w),C.status="success"}catch(A){C.status="error",C.value=A}return C}(e.exports=x).prototype.finally=function(v){if(typeof v!="function")return this;var w=this.constructor;return this.then(function(C){return w.resolve(v()).then(function(){return C})},function(C){return w.resolve(v()).then(function(){throw C})})},x.prototype.catch=function(v){return this.then(null,v)},x.prototype.then=function(v,w){if(typeof v!="function"&&this.state===d||typeof w!="function"&&this.state===s)return this;var C=new this.constructor(r);return this.state!==g?p(C,this.state===d?v:w,this.outcome):this.queue.push(new $(C,v,w)),C},$.prototype.callFulfilled=function(v){a.resolve(this.promise,v)},$.prototype.otherCallFulfilled=function(v){p(this.promise,this.onFulfilled,v)},$.prototype.callRejected=function(v){a.reject(this.promise,v)},$.prototype.otherCallRejected=function(v){p(this.promise,this.onRejected,v)},a.resolve=function(v,w){var C=_(y,w);if(C.status==="error")return a.reject(v,C.value);var A=C.value;if(A)h(v,A);else{v.state=d,v.outcome=w;for(var k=-1,z=v.queue.length;++k<z;)v.queue[k].callFulfilled(w)}return v},a.reject=function(v,w){v.state=s,v.outcome=w;for(var C=-1,A=v.queue.length;++C<A;)v.queue[C].callRejected(w);return v},x.resolve=function(v){return v instanceof this?v:a.resolve(new this(r),v)},x.reject=function(v){var w=new this(r);return a.reject(w,v)},x.all=function(v){var w=this;if(Object.prototype.toString.call(v)!=="[object Array]")return this.reject(new TypeError("must be an array"));var C=v.length,A=!1;if(!C)return this.resolve([]);for(var k=new Array(C),z=0,O=-1,I=new this(r);++O<C;)R(v[O],O);return I;function R(S,T){w.resolve(S).then(function(f){k[T]=f,++z!==C||A||(A=!0,a.resolve(I,k))},function(f){A||(A=!0,a.reject(I,f))})}},x.race=function(v){var w=this;if(Object.prototype.toString.call(v)!=="[object Array]")return this.reject(new TypeError("must be an array"));var C=v.length,A=!1;if(!C)return this.resolve([]);for(var k=-1,z=new this(r);++k<C;)O=v[k],w.resolve(O).then(function(I){A||(A=!0,a.resolve(z,I))},function(I){A||(A=!0,a.reject(z,I))});var O;return z}},{immediate:36}],38:[function(n,e,i){"use strict";var t={};(0,n("./lib/utils/common").assign)(t,n("./lib/deflate"),n("./lib/inflate"),n("./lib/zlib/constants")),e.exports=t},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(n,e,i){"use strict";var t=n("./zlib/deflate"),r=n("./utils/common"),a=n("./utils/strings"),s=n("./zlib/messages"),d=n("./zlib/zstream"),g=Object.prototype.toString,x=0,$=-1,p=0,y=8;function h(v){if(!(this instanceof h))return new h(v);this.options=r.assign({level:$,method:y,chunkSize:16384,windowBits:15,memLevel:8,strategy:p,to:""},v||{});var w=this.options;w.raw&&0<w.windowBits?w.windowBits=-w.windowBits:w.gzip&&0<w.windowBits&&w.windowBits<16&&(w.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new d,this.strm.avail_out=0;var C=t.deflateInit2(this.strm,w.level,w.method,w.windowBits,w.memLevel,w.strategy);if(C!==x)throw new Error(s[C]);if(w.header&&t.deflateSetHeader(this.strm,w.header),w.dictionary){var A;if(A=typeof w.dictionary=="string"?a.string2buf(w.dictionary):g.call(w.dictionary)==="[object ArrayBuffer]"?new Uint8Array(w.dictionary):w.dictionary,(C=t.deflateSetDictionary(this.strm,A))!==x)throw new Error(s[C]);this._dict_set=!0}}function _(v,w){var C=new h(w);if(C.push(v,!0),C.err)throw C.msg||s[C.err];return C.result}h.prototype.push=function(v,w){var C,A,k=this.strm,z=this.options.chunkSize;if(this.ended)return!1;A=w===~~w?w:w===!0?4:0,typeof v=="string"?k.input=a.string2buf(v):g.call(v)==="[object ArrayBuffer]"?k.input=new Uint8Array(v):k.input=v,k.next_in=0,k.avail_in=k.input.length;do{if(k.avail_out===0&&(k.output=new r.Buf8(z),k.next_out=0,k.avail_out=z),(C=t.deflate(k,A))!==1&&C!==x)return this.onEnd(C),!(this.ended=!0);k.avail_out!==0&&(k.avail_in!==0||A!==4&&A!==2)||(this.options.to==="string"?this.onData(a.buf2binstring(r.shrinkBuf(k.output,k.next_out))):this.onData(r.shrinkBuf(k.output,k.next_out)))}while((0<k.avail_in||k.avail_out===0)&&C!==1);return A===4?(C=t.deflateEnd(this.strm),this.onEnd(C),this.ended=!0,C===x):A!==2||(this.onEnd(x),!(k.avail_out=0))},h.prototype.onData=function(v){this.chunks.push(v)},h.prototype.onEnd=function(v){v===x&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=r.flattenChunks(this.chunks)),this.chunks=[],this.err=v,this.msg=this.strm.msg},i.Deflate=h,i.deflate=_,i.deflateRaw=function(v,w){return(w=w||{}).raw=!0,_(v,w)},i.gzip=function(v,w){return(w=w||{}).gzip=!0,_(v,w)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(n,e,i){"use strict";var t=n("./zlib/inflate"),r=n("./utils/common"),a=n("./utils/strings"),s=n("./zlib/constants"),d=n("./zlib/messages"),g=n("./zlib/zstream"),x=n("./zlib/gzheader"),$=Object.prototype.toString;function p(h){if(!(this instanceof p))return new p(h);this.options=r.assign({chunkSize:16384,windowBits:0,to:""},h||{});var _=this.options;_.raw&&0<=_.windowBits&&_.windowBits<16&&(_.windowBits=-_.windowBits,_.windowBits===0&&(_.windowBits=-15)),!(0<=_.windowBits&&_.windowBits<16)||h&&h.windowBits||(_.windowBits+=32),15<_.windowBits&&_.windowBits<48&&(15&_.windowBits)==0&&(_.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new g,this.strm.avail_out=0;var v=t.inflateInit2(this.strm,_.windowBits);if(v!==s.Z_OK)throw new Error(d[v]);this.header=new x,t.inflateGetHeader(this.strm,this.header)}function y(h,_){var v=new p(_);if(v.push(h,!0),v.err)throw v.msg||d[v.err];return v.result}p.prototype.push=function(h,_){var v,w,C,A,k,z,O=this.strm,I=this.options.chunkSize,R=this.options.dictionary,S=!1;if(this.ended)return!1;w=_===~~_?_:_===!0?s.Z_FINISH:s.Z_NO_FLUSH,typeof h=="string"?O.input=a.binstring2buf(h):$.call(h)==="[object ArrayBuffer]"?O.input=new Uint8Array(h):O.input=h,O.next_in=0,O.avail_in=O.input.length;do{if(O.avail_out===0&&(O.output=new r.Buf8(I),O.next_out=0,O.avail_out=I),(v=t.inflate(O,s.Z_NO_FLUSH))===s.Z_NEED_DICT&&R&&(z=typeof R=="string"?a.string2buf(R):$.call(R)==="[object ArrayBuffer]"?new Uint8Array(R):R,v=t.inflateSetDictionary(this.strm,z)),v===s.Z_BUF_ERROR&&S===!0&&(v=s.Z_OK,S=!1),v!==s.Z_STREAM_END&&v!==s.Z_OK)return this.onEnd(v),!(this.ended=!0);O.next_out&&(O.avail_out!==0&&v!==s.Z_STREAM_END&&(O.avail_in!==0||w!==s.Z_FINISH&&w!==s.Z_SYNC_FLUSH)||(this.options.to==="string"?(C=a.utf8border(O.output,O.next_out),A=O.next_out-C,k=a.buf2string(O.output,C),O.next_out=A,O.avail_out=I-A,A&&r.arraySet(O.output,O.output,C,A,0),this.onData(k)):this.onData(r.shrinkBuf(O.output,O.next_out)))),O.avail_in===0&&O.avail_out===0&&(S=!0)}while((0<O.avail_in||O.avail_out===0)&&v!==s.Z_STREAM_END);return v===s.Z_STREAM_END&&(w=s.Z_FINISH),w===s.Z_FINISH?(v=t.inflateEnd(this.strm),this.onEnd(v),this.ended=!0,v===s.Z_OK):w!==s.Z_SYNC_FLUSH||(this.onEnd(s.Z_OK),!(O.avail_out=0))},p.prototype.onData=function(h){this.chunks.push(h)},p.prototype.onEnd=function(h){h===s.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=r.flattenChunks(this.chunks)),this.chunks=[],this.err=h,this.msg=this.strm.msg},i.Inflate=p,i.inflate=y,i.inflateRaw=function(h,_){return(_=_||{}).raw=!0,y(h,_)},i.ungzip=y},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(n,e,i){"use strict";var t=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";i.assign=function(s){for(var d=Array.prototype.slice.call(arguments,1);d.length;){var g=d.shift();if(g){if(typeof g!="object")throw new TypeError(g+"must be non-object");for(var x in g)g.hasOwnProperty(x)&&(s[x]=g[x])}}return s},i.shrinkBuf=function(s,d){return s.length===d?s:s.subarray?s.subarray(0,d):(s.length=d,s)};var r={arraySet:function(s,d,g,x,$){if(d.subarray&&s.subarray)s.set(d.subarray(g,g+x),$);else for(var p=0;p<x;p++)s[$+p]=d[g+p]},flattenChunks:function(s){var d,g,x,$,p,y;for(d=x=0,g=s.length;d<g;d++)x+=s[d].length;for(y=new Uint8Array(x),d=$=0,g=s.length;d<g;d++)p=s[d],y.set(p,$),$+=p.length;return y}},a={arraySet:function(s,d,g,x,$){for(var p=0;p<x;p++)s[$+p]=d[g+p]},flattenChunks:function(s){return[].concat.apply([],s)}};i.setTyped=function(s){s?(i.Buf8=Uint8Array,i.Buf16=Uint16Array,i.Buf32=Int32Array,i.assign(i,r)):(i.Buf8=Array,i.Buf16=Array,i.Buf32=Array,i.assign(i,a))},i.setTyped(t)},{}],42:[function(n,e,i){"use strict";var t=n("./common"),r=!0,a=!0;try{String.fromCharCode.apply(null,[0])}catch{r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{a=!1}for(var s=new t.Buf8(256),d=0;d<256;d++)s[d]=252<=d?6:248<=d?5:240<=d?4:224<=d?3:192<=d?2:1;function g(x,$){if($<65537&&(x.subarray&&a||!x.subarray&&r))return String.fromCharCode.apply(null,t.shrinkBuf(x,$));for(var p="",y=0;y<$;y++)p+=String.fromCharCode(x[y]);return p}s[254]=s[254]=1,i.string2buf=function(x){var $,p,y,h,_,v=x.length,w=0;for(h=0;h<v;h++)(64512&(p=x.charCodeAt(h)))==55296&&h+1<v&&(64512&(y=x.charCodeAt(h+1)))==56320&&(p=65536+(p-55296<<10)+(y-56320),h++),w+=p<128?1:p<2048?2:p<65536?3:4;for($=new t.Buf8(w),h=_=0;_<w;h++)(64512&(p=x.charCodeAt(h)))==55296&&h+1<v&&(64512&(y=x.charCodeAt(h+1)))==56320&&(p=65536+(p-55296<<10)+(y-56320),h++),p<128?$[_++]=p:(p<2048?$[_++]=192|p>>>6:(p<65536?$[_++]=224|p>>>12:($[_++]=240|p>>>18,$[_++]=128|p>>>12&63),$[_++]=128|p>>>6&63),$[_++]=128|63&p);return $},i.buf2binstring=function(x){return g(x,x.length)},i.binstring2buf=function(x){for(var $=new t.Buf8(x.length),p=0,y=$.length;p<y;p++)$[p]=x.charCodeAt(p);return $},i.buf2string=function(x,$){var p,y,h,_,v=$||x.length,w=new Array(2*v);for(p=y=0;p<v;)if((h=x[p++])<128)w[y++]=h;else if(4<(_=s[h]))w[y++]=65533,p+=_-1;else{for(h&=_===2?31:_===3?15:7;1<_&&p<v;)h=h<<6|63&x[p++],_--;1<_?w[y++]=65533:h<65536?w[y++]=h:(h-=65536,w[y++]=55296|h>>10&1023,w[y++]=56320|1023&h)}return g(w,y)},i.utf8border=function(x,$){var p;for(($=$||x.length)>x.length&&($=x.length),p=$-1;0<=p&&(192&x[p])==128;)p--;return p<0||p===0?$:p+s[x[p]]>$?p:$}},{"./common":41}],43:[function(n,e,i){"use strict";e.exports=function(t,r,a,s){for(var d=65535&t|0,g=t>>>16&65535|0,x=0;a!==0;){for(a-=x=2e3<a?2e3:a;g=g+(d=d+r[s++]|0)|0,--x;);d%=65521,g%=65521}return d|g<<16|0}},{}],44:[function(n,e,i){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(n,e,i){"use strict";var t=(function(){for(var r,a=[],s=0;s<256;s++){r=s;for(var d=0;d<8;d++)r=1&r?3988292384^r>>>1:r>>>1;a[s]=r}return a})();e.exports=function(r,a,s,d){var g=t,x=d+s;r^=-1;for(var $=d;$<x;$++)r=r>>>8^g[255&(r^a[$])];return-1^r}},{}],46:[function(n,e,i){"use strict";var t,r=n("../utils/common"),a=n("./trees"),s=n("./adler32"),d=n("./crc32"),g=n("./messages"),x=0,$=4,p=0,y=-2,h=-1,_=4,v=2,w=8,C=9,A=286,k=30,z=19,O=2*A+1,I=15,R=3,S=258,T=S+R+1,f=42,E=113,l=1,P=2,Q=3,W=4;function re(o,U){return o.msg=g[U],U}function Z(o){return(o<<1)-(4<o?9:0)}function ae(o){for(var U=o.length;0<=--U;)o[U]=0}function N(o){var U=o.state,F=U.pending;F>o.avail_out&&(F=o.avail_out),F!==0&&(r.arraySet(o.output,U.pending_buf,U.pending_out,F,o.next_out),o.next_out+=F,U.pending_out+=F,o.total_out+=F,o.avail_out-=F,U.pending-=F,U.pending===0&&(U.pending_out=0))}function B(o,U){a._tr_flush_block(o,0<=o.block_start?o.block_start:-1,o.strstart-o.block_start,U),o.block_start=o.strstart,N(o.strm)}function se(o,U){o.pending_buf[o.pending++]=U}function ie(o,U){o.pending_buf[o.pending++]=U>>>8&255,o.pending_buf[o.pending++]=255&U}function Y(o,U){var F,m,b=o.max_chain_length,D=o.strstart,V=o.prev_length,X=o.nice_match,M=o.strstart>o.w_size-T?o.strstart-(o.w_size-T):0,K=o.window,te=o.w_mask,J=o.prev,oe=o.strstart+S,ue=K[D+V-1],de=K[D+V];o.prev_length>=o.good_match&&(b>>=2),X>o.lookahead&&(X=o.lookahead);do if(K[(F=U)+V]===de&&K[F+V-1]===ue&&K[F]===K[D]&&K[++F]===K[D+1]){D+=2,F++;do;while(K[++D]===K[++F]&&K[++D]===K[++F]&&K[++D]===K[++F]&&K[++D]===K[++F]&&K[++D]===K[++F]&&K[++D]===K[++F]&&K[++D]===K[++F]&&K[++D]===K[++F]&&D<oe);if(m=S-(oe-D),D=oe-S,V<m){if(o.match_start=U,X<=(V=m))break;ue=K[D+V-1],de=K[D+V]}}while((U=J[U&te])>M&&--b!=0);return V<=o.lookahead?V:o.lookahead}function he(o){var U,F,m,b,D,V,X,M,K,te,J=o.w_size;do{if(b=o.window_size-o.lookahead-o.strstart,o.strstart>=J+(J-T)){for(r.arraySet(o.window,o.window,J,J,0),o.match_start-=J,o.strstart-=J,o.block_start-=J,U=F=o.hash_size;m=o.head[--U],o.head[U]=J<=m?m-J:0,--F;);for(U=F=J;m=o.prev[--U],o.prev[U]=J<=m?m-J:0,--F;);b+=J}if(o.strm.avail_in===0)break;if(V=o.strm,X=o.window,M=o.strstart+o.lookahead,K=b,te=void 0,te=V.avail_in,K<te&&(te=K),F=te===0?0:(V.avail_in-=te,r.arraySet(X,V.input,V.next_in,te,M),V.state.wrap===1?V.adler=s(V.adler,X,te,M):V.state.wrap===2&&(V.adler=d(V.adler,X,te,M)),V.next_in+=te,V.total_in+=te,te),o.lookahead+=F,o.lookahead+o.insert>=R)for(D=o.strstart-o.insert,o.ins_h=o.window[D],o.ins_h=(o.ins_h<<o.hash_shift^o.window[D+1])&o.hash_mask;o.insert&&(o.ins_h=(o.ins_h<<o.hash_shift^o.window[D+R-1])&o.hash_mask,o.prev[D&o.w_mask]=o.head[o.ins_h],o.head[o.ins_h]=D,D++,o.insert--,!(o.lookahead+o.insert<R)););}while(o.lookahead<T&&o.strm.avail_in!==0)}function q(o,U){for(var F,m;;){if(o.lookahead<T){if(he(o),o.lookahead<T&&U===x)return l;if(o.lookahead===0)break}if(F=0,o.lookahead>=R&&(o.ins_h=(o.ins_h<<o.hash_shift^o.window[o.strstart+R-1])&o.hash_mask,F=o.prev[o.strstart&o.w_mask]=o.head[o.ins_h],o.head[o.ins_h]=o.strstart),F!==0&&o.strstart-F<=o.w_size-T&&(o.match_length=Y(o,F)),o.match_length>=R)if(m=a._tr_tally(o,o.strstart-o.match_start,o.match_length-R),o.lookahead-=o.match_length,o.match_length<=o.max_lazy_match&&o.lookahead>=R){for(o.match_length--;o.strstart++,o.ins_h=(o.ins_h<<o.hash_shift^o.window[o.strstart+R-1])&o.hash_mask,F=o.prev[o.strstart&o.w_mask]=o.head[o.ins_h],o.head[o.ins_h]=o.strstart,--o.match_length!=0;);o.strstart++}else o.strstart+=o.match_length,o.match_length=0,o.ins_h=o.window[o.strstart],o.ins_h=(o.ins_h<<o.hash_shift^o.window[o.strstart+1])&o.hash_mask;else m=a._tr_tally(o,0,o.window[o.strstart]),o.lookahead--,o.strstart++;if(m&&(B(o,!1),o.strm.avail_out===0))return l}return o.insert=o.strstart<R-1?o.strstart:R-1,U===$?(B(o,!0),o.strm.avail_out===0?Q:W):o.last_lit&&(B(o,!1),o.strm.avail_out===0)?l:P}function j(o,U){for(var F,m,b;;){if(o.lookahead<T){if(he(o),o.lookahead<T&&U===x)return l;if(o.lookahead===0)break}if(F=0,o.lookahead>=R&&(o.ins_h=(o.ins_h<<o.hash_shift^o.window[o.strstart+R-1])&o.hash_mask,F=o.prev[o.strstart&o.w_mask]=o.head[o.ins_h],o.head[o.ins_h]=o.strstart),o.prev_length=o.match_length,o.prev_match=o.match_start,o.match_length=R-1,F!==0&&o.prev_length<o.max_lazy_match&&o.strstart-F<=o.w_size-T&&(o.match_length=Y(o,F),o.match_length<=5&&(o.strategy===1||o.match_length===R&&4096<o.strstart-o.match_start)&&(o.match_length=R-1)),o.prev_length>=R&&o.match_length<=o.prev_length){for(b=o.strstart+o.lookahead-R,m=a._tr_tally(o,o.strstart-1-o.prev_match,o.prev_length-R),o.lookahead-=o.prev_length-1,o.prev_length-=2;++o.strstart<=b&&(o.ins_h=(o.ins_h<<o.hash_shift^o.window[o.strstart+R-1])&o.hash_mask,F=o.prev[o.strstart&o.w_mask]=o.head[o.ins_h],o.head[o.ins_h]=o.strstart),--o.prev_length!=0;);if(o.match_available=0,o.match_length=R-1,o.strstart++,m&&(B(o,!1),o.strm.avail_out===0))return l}else if(o.match_available){if((m=a._tr_tally(o,0,o.window[o.strstart-1]))&&B(o,!1),o.strstart++,o.lookahead--,o.strm.avail_out===0)return l}else o.match_available=1,o.strstart++,o.lookahead--}return o.match_available&&(m=a._tr_tally(o,0,o.window[o.strstart-1]),o.match_available=0),o.insert=o.strstart<R-1?o.strstart:R-1,U===$?(B(o,!0),o.strm.avail_out===0?Q:W):o.last_lit&&(B(o,!1),o.strm.avail_out===0)?l:P}function L(o,U,F,m,b){this.good_length=o,this.max_lazy=U,this.nice_length=F,this.max_chain=m,this.func=b}function G(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=w,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new r.Buf16(2*O),this.dyn_dtree=new r.Buf16(2*(2*k+1)),this.bl_tree=new r.Buf16(2*(2*z+1)),ae(this.dyn_ltree),ae(this.dyn_dtree),ae(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new r.Buf16(I+1),this.heap=new r.Buf16(2*A+1),ae(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new r.Buf16(2*A+1),ae(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function H(o){var U;return o&&o.state?(o.total_in=o.total_out=0,o.data_type=v,(U=o.state).pending=0,U.pending_out=0,U.wrap<0&&(U.wrap=-U.wrap),U.status=U.wrap?f:E,o.adler=U.wrap===2?0:1,U.last_flush=x,a._tr_init(U),p):re(o,y)}function ee(o){var U=H(o);return U===p&&(function(F){F.window_size=2*F.w_size,ae(F.head),F.max_lazy_match=t[F.level].max_lazy,F.good_match=t[F.level].good_length,F.nice_match=t[F.level].nice_length,F.max_chain_length=t[F.level].max_chain,F.strstart=0,F.block_start=0,F.lookahead=0,F.insert=0,F.match_length=F.prev_length=R-1,F.match_available=0,F.ins_h=0})(o.state),U}function ne(o,U,F,m,b,D){if(!o)return y;var V=1;if(U===h&&(U=6),m<0?(V=0,m=-m):15<m&&(V=2,m-=16),b<1||C<b||F!==w||m<8||15<m||U<0||9<U||D<0||_<D)return re(o,y);m===8&&(m=9);var X=new G;return(o.state=X).strm=o,X.wrap=V,X.gzhead=null,X.w_bits=m,X.w_size=1<<X.w_bits,X.w_mask=X.w_size-1,X.hash_bits=b+7,X.hash_size=1<<X.hash_bits,X.hash_mask=X.hash_size-1,X.hash_shift=~~((X.hash_bits+R-1)/R),X.window=new r.Buf8(2*X.w_size),X.head=new r.Buf16(X.hash_size),X.prev=new r.Buf16(X.w_size),X.lit_bufsize=1<<b+6,X.pending_buf_size=4*X.lit_bufsize,X.pending_buf=new r.Buf8(X.pending_buf_size),X.d_buf=1*X.lit_bufsize,X.l_buf=3*X.lit_bufsize,X.level=U,X.strategy=D,X.method=F,ee(o)}t=[new L(0,0,0,0,function(o,U){var F=65535;for(F>o.pending_buf_size-5&&(F=o.pending_buf_size-5);;){if(o.lookahead<=1){if(he(o),o.lookahead===0&&U===x)return l;if(o.lookahead===0)break}o.strstart+=o.lookahead,o.lookahead=0;var m=o.block_start+F;if((o.strstart===0||o.strstart>=m)&&(o.lookahead=o.strstart-m,o.strstart=m,B(o,!1),o.strm.avail_out===0)||o.strstart-o.block_start>=o.w_size-T&&(B(o,!1),o.strm.avail_out===0))return l}return o.insert=0,U===$?(B(o,!0),o.strm.avail_out===0?Q:W):(o.strstart>o.block_start&&(B(o,!1),o.strm.avail_out),l)}),new L(4,4,8,4,q),new L(4,5,16,8,q),new L(4,6,32,32,q),new L(4,4,16,16,j),new L(8,16,32,32,j),new L(8,16,128,128,j),new L(8,32,128,256,j),new L(32,128,258,1024,j),new L(32,258,258,4096,j)],i.deflateInit=function(o,U){return ne(o,U,w,15,8,0)},i.deflateInit2=ne,i.deflateReset=ee,i.deflateResetKeep=H,i.deflateSetHeader=function(o,U){return o&&o.state?o.state.wrap!==2?y:(o.state.gzhead=U,p):y},i.deflate=function(o,U){var F,m,b,D;if(!o||!o.state||5<U||U<0)return o?re(o,y):y;if(m=o.state,!o.output||!o.input&&o.avail_in!==0||m.status===666&&U!==$)return re(o,o.avail_out===0?-5:y);if(m.strm=o,F=m.last_flush,m.last_flush=U,m.status===f)if(m.wrap===2)o.adler=0,se(m,31),se(m,139),se(m,8),m.gzhead?(se(m,(m.gzhead.text?1:0)+(m.gzhead.hcrc?2:0)+(m.gzhead.extra?4:0)+(m.gzhead.name?8:0)+(m.gzhead.comment?16:0)),se(m,255&m.gzhead.time),se(m,m.gzhead.time>>8&255),se(m,m.gzhead.time>>16&255),se(m,m.gzhead.time>>24&255),se(m,m.level===9?2:2<=m.strategy||m.level<2?4:0),se(m,255&m.gzhead.os),m.gzhead.extra&&m.gzhead.extra.length&&(se(m,255&m.gzhead.extra.length),se(m,m.gzhead.extra.length>>8&255)),m.gzhead.hcrc&&(o.adler=d(o.adler,m.pending_buf,m.pending,0)),m.gzindex=0,m.status=69):(se(m,0),se(m,0),se(m,0),se(m,0),se(m,0),se(m,m.level===9?2:2<=m.strategy||m.level<2?4:0),se(m,3),m.status=E);else{var V=w+(m.w_bits-8<<4)<<8;V|=(2<=m.strategy||m.level<2?0:m.level<6?1:m.level===6?2:3)<<6,m.strstart!==0&&(V|=32),V+=31-V%31,m.status=E,ie(m,V),m.strstart!==0&&(ie(m,o.adler>>>16),ie(m,65535&o.adler)),o.adler=1}if(m.status===69)if(m.gzhead.extra){for(b=m.pending;m.gzindex<(65535&m.gzhead.extra.length)&&(m.pending!==m.pending_buf_size||(m.gzhead.hcrc&&m.pending>b&&(o.adler=d(o.adler,m.pending_buf,m.pending-b,b)),N(o),b=m.pending,m.pending!==m.pending_buf_size));)se(m,255&m.gzhead.extra[m.gzindex]),m.gzindex++;m.gzhead.hcrc&&m.pending>b&&(o.adler=d(o.adler,m.pending_buf,m.pending-b,b)),m.gzindex===m.gzhead.extra.length&&(m.gzindex=0,m.status=73)}else m.status=73;if(m.status===73)if(m.gzhead.name){b=m.pending;do{if(m.pending===m.pending_buf_size&&(m.gzhead.hcrc&&m.pending>b&&(o.adler=d(o.adler,m.pending_buf,m.pending-b,b)),N(o),b=m.pending,m.pending===m.pending_buf_size)){D=1;break}D=m.gzindex<m.gzhead.name.length?255&m.gzhead.name.charCodeAt(m.gzindex++):0,se(m,D)}while(D!==0);m.gzhead.hcrc&&m.pending>b&&(o.adler=d(o.adler,m.pending_buf,m.pending-b,b)),D===0&&(m.gzindex=0,m.status=91)}else m.status=91;if(m.status===91)if(m.gzhead.comment){b=m.pending;do{if(m.pending===m.pending_buf_size&&(m.gzhead.hcrc&&m.pending>b&&(o.adler=d(o.adler,m.pending_buf,m.pending-b,b)),N(o),b=m.pending,m.pending===m.pending_buf_size)){D=1;break}D=m.gzindex<m.gzhead.comment.length?255&m.gzhead.comment.charCodeAt(m.gzindex++):0,se(m,D)}while(D!==0);m.gzhead.hcrc&&m.pending>b&&(o.adler=d(o.adler,m.pending_buf,m.pending-b,b)),D===0&&(m.status=103)}else m.status=103;if(m.status===103&&(m.gzhead.hcrc?(m.pending+2>m.pending_buf_size&&N(o),m.pending+2<=m.pending_buf_size&&(se(m,255&o.adler),se(m,o.adler>>8&255),o.adler=0,m.status=E)):m.status=E),m.pending!==0){if(N(o),o.avail_out===0)return m.last_flush=-1,p}else if(o.avail_in===0&&Z(U)<=Z(F)&&U!==$)return re(o,-5);if(m.status===666&&o.avail_in!==0)return re(o,-5);if(o.avail_in!==0||m.lookahead!==0||U!==x&&m.status!==666){var X=m.strategy===2?(function(M,K){for(var te;;){if(M.lookahead===0&&(he(M),M.lookahead===0)){if(K===x)return l;break}if(M.match_length=0,te=a._tr_tally(M,0,M.window[M.strstart]),M.lookahead--,M.strstart++,te&&(B(M,!1),M.strm.avail_out===0))return l}return M.insert=0,K===$?(B(M,!0),M.strm.avail_out===0?Q:W):M.last_lit&&(B(M,!1),M.strm.avail_out===0)?l:P})(m,U):m.strategy===3?(function(M,K){for(var te,J,oe,ue,de=M.window;;){if(M.lookahead<=S){if(he(M),M.lookahead<=S&&K===x)return l;if(M.lookahead===0)break}if(M.match_length=0,M.lookahead>=R&&0<M.strstart&&(J=de[oe=M.strstart-1])===de[++oe]&&J===de[++oe]&&J===de[++oe]){ue=M.strstart+S;do;while(J===de[++oe]&&J===de[++oe]&&J===de[++oe]&&J===de[++oe]&&J===de[++oe]&&J===de[++oe]&&J===de[++oe]&&J===de[++oe]&&oe<ue);M.match_length=S-(ue-oe),M.match_length>M.lookahead&&(M.match_length=M.lookahead)}if(M.match_length>=R?(te=a._tr_tally(M,1,M.match_length-R),M.lookahead-=M.match_length,M.strstart+=M.match_length,M.match_length=0):(te=a._tr_tally(M,0,M.window[M.strstart]),M.lookahead--,M.strstart++),te&&(B(M,!1),M.strm.avail_out===0))return l}return M.insert=0,K===$?(B(M,!0),M.strm.avail_out===0?Q:W):M.last_lit&&(B(M,!1),M.strm.avail_out===0)?l:P})(m,U):t[m.level].func(m,U);if(X!==Q&&X!==W||(m.status=666),X===l||X===Q)return o.avail_out===0&&(m.last_flush=-1),p;if(X===P&&(U===1?a._tr_align(m):U!==5&&(a._tr_stored_block(m,0,0,!1),U===3&&(ae(m.head),m.lookahead===0&&(m.strstart=0,m.block_start=0,m.insert=0))),N(o),o.avail_out===0))return m.last_flush=-1,p}return U!==$?p:m.wrap<=0?1:(m.wrap===2?(se(m,255&o.adler),se(m,o.adler>>8&255),se(m,o.adler>>16&255),se(m,o.adler>>24&255),se(m,255&o.total_in),se(m,o.total_in>>8&255),se(m,o.total_in>>16&255),se(m,o.total_in>>24&255)):(ie(m,o.adler>>>16),ie(m,65535&o.adler)),N(o),0<m.wrap&&(m.wrap=-m.wrap),m.pending!==0?p:1)},i.deflateEnd=function(o){var U;return o&&o.state?(U=o.state.status)!==f&&U!==69&&U!==73&&U!==91&&U!==103&&U!==E&&U!==666?re(o,y):(o.state=null,U===E?re(o,-3):p):y},i.deflateSetDictionary=function(o,U){var F,m,b,D,V,X,M,K,te=U.length;if(!o||!o.state||(D=(F=o.state).wrap)===2||D===1&&F.status!==f||F.lookahead)return y;for(D===1&&(o.adler=s(o.adler,U,te,0)),F.wrap=0,te>=F.w_size&&(D===0&&(ae(F.head),F.strstart=0,F.block_start=0,F.insert=0),K=new r.Buf8(F.w_size),r.arraySet(K,U,te-F.w_size,F.w_size,0),U=K,te=F.w_size),V=o.avail_in,X=o.next_in,M=o.input,o.avail_in=te,o.next_in=0,o.input=U,he(F);F.lookahead>=R;){for(m=F.strstart,b=F.lookahead-(R-1);F.ins_h=(F.ins_h<<F.hash_shift^F.window[m+R-1])&F.hash_mask,F.prev[m&F.w_mask]=F.head[F.ins_h],F.head[F.ins_h]=m,m++,--b;);F.strstart=m,F.lookahead=R-1,he(F)}return F.strstart+=F.lookahead,F.block_start=F.strstart,F.insert=F.lookahead,F.lookahead=0,F.match_length=F.prev_length=R-1,F.match_available=0,o.next_in=X,o.input=M,o.avail_in=V,F.wrap=D,p},i.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(n,e,i){"use strict";e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(n,e,i){"use strict";e.exports=function(t,r){var a,s,d,g,x,$,p,y,h,_,v,w,C,A,k,z,O,I,R,S,T,f,E,l,P;a=t.state,s=t.next_in,l=t.input,d=s+(t.avail_in-5),g=t.next_out,P=t.output,x=g-(r-t.avail_out),$=g+(t.avail_out-257),p=a.dmax,y=a.wsize,h=a.whave,_=a.wnext,v=a.window,w=a.hold,C=a.bits,A=a.lencode,k=a.distcode,z=(1<<a.lenbits)-1,O=(1<<a.distbits)-1;e:do{C<15&&(w+=l[s++]<<C,C+=8,w+=l[s++]<<C,C+=8),I=A[w&z];t:for(;;){if(w>>>=R=I>>>24,C-=R,(R=I>>>16&255)===0)P[g++]=65535&I;else{if(!(16&R)){if((64&R)==0){I=A[(65535&I)+(w&(1<<R)-1)];continue t}if(32&R){a.mode=12;break e}t.msg="invalid literal/length code",a.mode=30;break e}S=65535&I,(R&=15)&&(C<R&&(w+=l[s++]<<C,C+=8),S+=w&(1<<R)-1,w>>>=R,C-=R),C<15&&(w+=l[s++]<<C,C+=8,w+=l[s++]<<C,C+=8),I=k[w&O];i:for(;;){if(w>>>=R=I>>>24,C-=R,!(16&(R=I>>>16&255))){if((64&R)==0){I=k[(65535&I)+(w&(1<<R)-1)];continue i}t.msg="invalid distance code",a.mode=30;break e}if(T=65535&I,C<(R&=15)&&(w+=l[s++]<<C,(C+=8)<R&&(w+=l[s++]<<C,C+=8)),p<(T+=w&(1<<R)-1)){t.msg="invalid distance too far back",a.mode=30;break e}if(w>>>=R,C-=R,(R=g-x)<T){if(h<(R=T-R)&&a.sane){t.msg="invalid distance too far back",a.mode=30;break e}if(E=v,(f=0)===_){if(f+=y-R,R<S){for(S-=R;P[g++]=v[f++],--R;);f=g-T,E=P}}else if(_<R){if(f+=y+_-R,(R-=_)<S){for(S-=R;P[g++]=v[f++],--R;);if(f=0,_<S){for(S-=R=_;P[g++]=v[f++],--R;);f=g-T,E=P}}}else if(f+=_-R,R<S){for(S-=R;P[g++]=v[f++],--R;);f=g-T,E=P}for(;2<S;)P[g++]=E[f++],P[g++]=E[f++],P[g++]=E[f++],S-=3;S&&(P[g++]=E[f++],1<S&&(P[g++]=E[f++]))}else{for(f=g-T;P[g++]=P[f++],P[g++]=P[f++],P[g++]=P[f++],2<(S-=3););S&&(P[g++]=P[f++],1<S&&(P[g++]=P[f++]))}break}}break}}while(s<d&&g<$);s-=S=C>>3,w&=(1<<(C-=S<<3))-1,t.next_in=s,t.next_out=g,t.avail_in=s<d?d-s+5:5-(s-d),t.avail_out=g<$?$-g+257:257-(g-$),a.hold=w,a.bits=C}},{}],49:[function(n,e,i){"use strict";var t=n("../utils/common"),r=n("./adler32"),a=n("./crc32"),s=n("./inffast"),d=n("./inftrees"),g=1,x=2,$=0,p=-2,y=1,h=852,_=592;function v(f){return(f>>>24&255)+(f>>>8&65280)+((65280&f)<<8)+((255&f)<<24)}function w(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new t.Buf16(320),this.work=new t.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function C(f){var E;return f&&f.state?(E=f.state,f.total_in=f.total_out=E.total=0,f.msg="",E.wrap&&(f.adler=1&E.wrap),E.mode=y,E.last=0,E.havedict=0,E.dmax=32768,E.head=null,E.hold=0,E.bits=0,E.lencode=E.lendyn=new t.Buf32(h),E.distcode=E.distdyn=new t.Buf32(_),E.sane=1,E.back=-1,$):p}function A(f){var E;return f&&f.state?((E=f.state).wsize=0,E.whave=0,E.wnext=0,C(f)):p}function k(f,E){var l,P;return f&&f.state?(P=f.state,E<0?(l=0,E=-E):(l=1+(E>>4),E<48&&(E&=15)),E&&(E<8||15<E)?p:(P.window!==null&&P.wbits!==E&&(P.window=null),P.wrap=l,P.wbits=E,A(f))):p}function z(f,E){var l,P;return f?(P=new w,(f.state=P).window=null,(l=k(f,E))!==$&&(f.state=null),l):p}var O,I,R=!0;function S(f){if(R){var E;for(O=new t.Buf32(512),I=new t.Buf32(32),E=0;E<144;)f.lens[E++]=8;for(;E<256;)f.lens[E++]=9;for(;E<280;)f.lens[E++]=7;for(;E<288;)f.lens[E++]=8;for(d(g,f.lens,0,288,O,0,f.work,{bits:9}),E=0;E<32;)f.lens[E++]=5;d(x,f.lens,0,32,I,0,f.work,{bits:5}),R=!1}f.lencode=O,f.lenbits=9,f.distcode=I,f.distbits=5}function T(f,E,l,P){var Q,W=f.state;return W.window===null&&(W.wsize=1<<W.wbits,W.wnext=0,W.whave=0,W.window=new t.Buf8(W.wsize)),P>=W.wsize?(t.arraySet(W.window,E,l-W.wsize,W.wsize,0),W.wnext=0,W.whave=W.wsize):(P<(Q=W.wsize-W.wnext)&&(Q=P),t.arraySet(W.window,E,l-P,Q,W.wnext),(P-=Q)?(t.arraySet(W.window,E,l-P,P,0),W.wnext=P,W.whave=W.wsize):(W.wnext+=Q,W.wnext===W.wsize&&(W.wnext=0),W.whave<W.wsize&&(W.whave+=Q))),0}i.inflateReset=A,i.inflateReset2=k,i.inflateResetKeep=C,i.inflateInit=function(f){return z(f,15)},i.inflateInit2=z,i.inflate=function(f,E){var l,P,Q,W,re,Z,ae,N,B,se,ie,Y,he,q,j,L,G,H,ee,ne,o,U,F,m,b=0,D=new t.Buf8(4),V=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!f||!f.state||!f.output||!f.input&&f.avail_in!==0)return p;(l=f.state).mode===12&&(l.mode=13),re=f.next_out,Q=f.output,ae=f.avail_out,W=f.next_in,P=f.input,Z=f.avail_in,N=l.hold,B=l.bits,se=Z,ie=ae,U=$;e:for(;;)switch(l.mode){case y:if(l.wrap===0){l.mode=13;break}for(;B<16;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(2&l.wrap&&N===35615){D[l.check=0]=255&N,D[1]=N>>>8&255,l.check=a(l.check,D,2,0),B=N=0,l.mode=2;break}if(l.flags=0,l.head&&(l.head.done=!1),!(1&l.wrap)||(((255&N)<<8)+(N>>8))%31){f.msg="incorrect header check",l.mode=30;break}if((15&N)!=8){f.msg="unknown compression method",l.mode=30;break}if(B-=4,o=8+(15&(N>>>=4)),l.wbits===0)l.wbits=o;else if(o>l.wbits){f.msg="invalid window size",l.mode=30;break}l.dmax=1<<o,f.adler=l.check=1,l.mode=512&N?10:12,B=N=0;break;case 2:for(;B<16;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(l.flags=N,(255&l.flags)!=8){f.msg="unknown compression method",l.mode=30;break}if(57344&l.flags){f.msg="unknown header flags set",l.mode=30;break}l.head&&(l.head.text=N>>8&1),512&l.flags&&(D[0]=255&N,D[1]=N>>>8&255,l.check=a(l.check,D,2,0)),B=N=0,l.mode=3;case 3:for(;B<32;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}l.head&&(l.head.time=N),512&l.flags&&(D[0]=255&N,D[1]=N>>>8&255,D[2]=N>>>16&255,D[3]=N>>>24&255,l.check=a(l.check,D,4,0)),B=N=0,l.mode=4;case 4:for(;B<16;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}l.head&&(l.head.xflags=255&N,l.head.os=N>>8),512&l.flags&&(D[0]=255&N,D[1]=N>>>8&255,l.check=a(l.check,D,2,0)),B=N=0,l.mode=5;case 5:if(1024&l.flags){for(;B<16;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}l.length=N,l.head&&(l.head.extra_len=N),512&l.flags&&(D[0]=255&N,D[1]=N>>>8&255,l.check=a(l.check,D,2,0)),B=N=0}else l.head&&(l.head.extra=null);l.mode=6;case 6:if(1024&l.flags&&(Z<(Y=l.length)&&(Y=Z),Y&&(l.head&&(o=l.head.extra_len-l.length,l.head.extra||(l.head.extra=new Array(l.head.extra_len)),t.arraySet(l.head.extra,P,W,Y,o)),512&l.flags&&(l.check=a(l.check,P,Y,W)),Z-=Y,W+=Y,l.length-=Y),l.length))break e;l.length=0,l.mode=7;case 7:if(2048&l.flags){if(Z===0)break e;for(Y=0;o=P[W+Y++],l.head&&o&&l.length<65536&&(l.head.name+=String.fromCharCode(o)),o&&Y<Z;);if(512&l.flags&&(l.check=a(l.check,P,Y,W)),Z-=Y,W+=Y,o)break e}else l.head&&(l.head.name=null);l.length=0,l.mode=8;case 8:if(4096&l.flags){if(Z===0)break e;for(Y=0;o=P[W+Y++],l.head&&o&&l.length<65536&&(l.head.comment+=String.fromCharCode(o)),o&&Y<Z;);if(512&l.flags&&(l.check=a(l.check,P,Y,W)),Z-=Y,W+=Y,o)break e}else l.head&&(l.head.comment=null);l.mode=9;case 9:if(512&l.flags){for(;B<16;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(N!==(65535&l.check)){f.msg="header crc mismatch",l.mode=30;break}B=N=0}l.head&&(l.head.hcrc=l.flags>>9&1,l.head.done=!0),f.adler=l.check=0,l.mode=12;break;case 10:for(;B<32;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}f.adler=l.check=v(N),B=N=0,l.mode=11;case 11:if(l.havedict===0)return f.next_out=re,f.avail_out=ae,f.next_in=W,f.avail_in=Z,l.hold=N,l.bits=B,2;f.adler=l.check=1,l.mode=12;case 12:if(E===5||E===6)break e;case 13:if(l.last){N>>>=7&B,B-=7&B,l.mode=27;break}for(;B<3;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}switch(l.last=1&N,B-=1,3&(N>>>=1)){case 0:l.mode=14;break;case 1:if(S(l),l.mode=20,E!==6)break;N>>>=2,B-=2;break e;case 2:l.mode=17;break;case 3:f.msg="invalid block type",l.mode=30}N>>>=2,B-=2;break;case 14:for(N>>>=7&B,B-=7&B;B<32;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if((65535&N)!=(N>>>16^65535)){f.msg="invalid stored block lengths",l.mode=30;break}if(l.length=65535&N,B=N=0,l.mode=15,E===6)break e;case 15:l.mode=16;case 16:if(Y=l.length){if(Z<Y&&(Y=Z),ae<Y&&(Y=ae),Y===0)break e;t.arraySet(Q,P,W,Y,re),Z-=Y,W+=Y,ae-=Y,re+=Y,l.length-=Y;break}l.mode=12;break;case 17:for(;B<14;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(l.nlen=257+(31&N),N>>>=5,B-=5,l.ndist=1+(31&N),N>>>=5,B-=5,l.ncode=4+(15&N),N>>>=4,B-=4,286<l.nlen||30<l.ndist){f.msg="too many length or distance symbols",l.mode=30;break}l.have=0,l.mode=18;case 18:for(;l.have<l.ncode;){for(;B<3;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}l.lens[V[l.have++]]=7&N,N>>>=3,B-=3}for(;l.have<19;)l.lens[V[l.have++]]=0;if(l.lencode=l.lendyn,l.lenbits=7,F={bits:l.lenbits},U=d(0,l.lens,0,19,l.lencode,0,l.work,F),l.lenbits=F.bits,U){f.msg="invalid code lengths set",l.mode=30;break}l.have=0,l.mode=19;case 19:for(;l.have<l.nlen+l.ndist;){for(;L=(b=l.lencode[N&(1<<l.lenbits)-1])>>>16&255,G=65535&b,!((j=b>>>24)<=B);){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(G<16)N>>>=j,B-=j,l.lens[l.have++]=G;else{if(G===16){for(m=j+2;B<m;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(N>>>=j,B-=j,l.have===0){f.msg="invalid bit length repeat",l.mode=30;break}o=l.lens[l.have-1],Y=3+(3&N),N>>>=2,B-=2}else if(G===17){for(m=j+3;B<m;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}B-=j,o=0,Y=3+(7&(N>>>=j)),N>>>=3,B-=3}else{for(m=j+7;B<m;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}B-=j,o=0,Y=11+(127&(N>>>=j)),N>>>=7,B-=7}if(l.have+Y>l.nlen+l.ndist){f.msg="invalid bit length repeat",l.mode=30;break}for(;Y--;)l.lens[l.have++]=o}}if(l.mode===30)break;if(l.lens[256]===0){f.msg="invalid code -- missing end-of-block",l.mode=30;break}if(l.lenbits=9,F={bits:l.lenbits},U=d(g,l.lens,0,l.nlen,l.lencode,0,l.work,F),l.lenbits=F.bits,U){f.msg="invalid literal/lengths set",l.mode=30;break}if(l.distbits=6,l.distcode=l.distdyn,F={bits:l.distbits},U=d(x,l.lens,l.nlen,l.ndist,l.distcode,0,l.work,F),l.distbits=F.bits,U){f.msg="invalid distances set",l.mode=30;break}if(l.mode=20,E===6)break e;case 20:l.mode=21;case 21:if(6<=Z&&258<=ae){f.next_out=re,f.avail_out=ae,f.next_in=W,f.avail_in=Z,l.hold=N,l.bits=B,s(f,ie),re=f.next_out,Q=f.output,ae=f.avail_out,W=f.next_in,P=f.input,Z=f.avail_in,N=l.hold,B=l.bits,l.mode===12&&(l.back=-1);break}for(l.back=0;L=(b=l.lencode[N&(1<<l.lenbits)-1])>>>16&255,G=65535&b,!((j=b>>>24)<=B);){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(L&&(240&L)==0){for(H=j,ee=L,ne=G;L=(b=l.lencode[ne+((N&(1<<H+ee)-1)>>H)])>>>16&255,G=65535&b,!(H+(j=b>>>24)<=B);){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}N>>>=H,B-=H,l.back+=H}if(N>>>=j,B-=j,l.back+=j,l.length=G,L===0){l.mode=26;break}if(32&L){l.back=-1,l.mode=12;break}if(64&L){f.msg="invalid literal/length code",l.mode=30;break}l.extra=15&L,l.mode=22;case 22:if(l.extra){for(m=l.extra;B<m;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}l.length+=N&(1<<l.extra)-1,N>>>=l.extra,B-=l.extra,l.back+=l.extra}l.was=l.length,l.mode=23;case 23:for(;L=(b=l.distcode[N&(1<<l.distbits)-1])>>>16&255,G=65535&b,!((j=b>>>24)<=B);){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if((240&L)==0){for(H=j,ee=L,ne=G;L=(b=l.distcode[ne+((N&(1<<H+ee)-1)>>H)])>>>16&255,G=65535&b,!(H+(j=b>>>24)<=B);){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}N>>>=H,B-=H,l.back+=H}if(N>>>=j,B-=j,l.back+=j,64&L){f.msg="invalid distance code",l.mode=30;break}l.offset=G,l.extra=15&L,l.mode=24;case 24:if(l.extra){for(m=l.extra;B<m;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}l.offset+=N&(1<<l.extra)-1,N>>>=l.extra,B-=l.extra,l.back+=l.extra}if(l.offset>l.dmax){f.msg="invalid distance too far back",l.mode=30;break}l.mode=25;case 25:if(ae===0)break e;if(Y=ie-ae,l.offset>Y){if((Y=l.offset-Y)>l.whave&&l.sane){f.msg="invalid distance too far back",l.mode=30;break}he=Y>l.wnext?(Y-=l.wnext,l.wsize-Y):l.wnext-Y,Y>l.length&&(Y=l.length),q=l.window}else q=Q,he=re-l.offset,Y=l.length;for(ae<Y&&(Y=ae),ae-=Y,l.length-=Y;Q[re++]=q[he++],--Y;);l.length===0&&(l.mode=21);break;case 26:if(ae===0)break e;Q[re++]=l.length,ae--,l.mode=21;break;case 27:if(l.wrap){for(;B<32;){if(Z===0)break e;Z--,N|=P[W++]<<B,B+=8}if(ie-=ae,f.total_out+=ie,l.total+=ie,ie&&(f.adler=l.check=l.flags?a(l.check,Q,ie,re-ie):r(l.check,Q,ie,re-ie)),ie=ae,(l.flags?N:v(N))!==l.check){f.msg="incorrect data check",l.mode=30;break}B=N=0}l.mode=28;case 28:if(l.wrap&&l.flags){for(;B<32;){if(Z===0)break e;Z--,N+=P[W++]<<B,B+=8}if(N!==(4294967295&l.total)){f.msg="incorrect length check",l.mode=30;break}B=N=0}l.mode=29;case 29:U=1;break e;case 30:U=-3;break e;case 31:return-4;case 32:default:return p}return f.next_out=re,f.avail_out=ae,f.next_in=W,f.avail_in=Z,l.hold=N,l.bits=B,(l.wsize||ie!==f.avail_out&&l.mode<30&&(l.mode<27||E!==4))&&T(f,f.output,f.next_out,ie-f.avail_out)?(l.mode=31,-4):(se-=f.avail_in,ie-=f.avail_out,f.total_in+=se,f.total_out+=ie,l.total+=ie,l.wrap&&ie&&(f.adler=l.check=l.flags?a(l.check,Q,ie,f.next_out-ie):r(l.check,Q,ie,f.next_out-ie)),f.data_type=l.bits+(l.last?64:0)+(l.mode===12?128:0)+(l.mode===20||l.mode===15?256:0),(se==0&&ie===0||E===4)&&U===$&&(U=-5),U)},i.inflateEnd=function(f){if(!f||!f.state)return p;var E=f.state;return E.window&&(E.window=null),f.state=null,$},i.inflateGetHeader=function(f,E){var l;return f&&f.state?(2&(l=f.state).wrap)==0?p:((l.head=E).done=!1,$):p},i.inflateSetDictionary=function(f,E){var l,P=E.length;return f&&f.state?(l=f.state).wrap!==0&&l.mode!==11?p:l.mode===11&&r(1,E,P,0)!==l.check?-3:T(f,E,P,P)?(l.mode=31,-4):(l.havedict=1,$):p},i.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(n,e,i){"use strict";var t=n("../utils/common"),r=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],a=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],d=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(g,x,$,p,y,h,_,v){var w,C,A,k,z,O,I,R,S,T=v.bits,f=0,E=0,l=0,P=0,Q=0,W=0,re=0,Z=0,ae=0,N=0,B=null,se=0,ie=new t.Buf16(16),Y=new t.Buf16(16),he=null,q=0;for(f=0;f<=15;f++)ie[f]=0;for(E=0;E<p;E++)ie[x[$+E]]++;for(Q=T,P=15;1<=P&&ie[P]===0;P--);if(P<Q&&(Q=P),P===0)return y[h++]=20971520,y[h++]=20971520,v.bits=1,0;for(l=1;l<P&&ie[l]===0;l++);for(Q<l&&(Q=l),f=Z=1;f<=15;f++)if(Z<<=1,(Z-=ie[f])<0)return-1;if(0<Z&&(g===0||P!==1))return-1;for(Y[1]=0,f=1;f<15;f++)Y[f+1]=Y[f]+ie[f];for(E=0;E<p;E++)x[$+E]!==0&&(_[Y[x[$+E]]++]=E);if(O=g===0?(B=he=_,19):g===1?(B=r,se-=257,he=a,q-=257,256):(B=s,he=d,-1),f=l,z=h,re=E=N=0,A=-1,k=(ae=1<<(W=Q))-1,g===1&&852<ae||g===2&&592<ae)return 1;for(;;){for(I=f-re,S=_[E]<O?(R=0,_[E]):_[E]>O?(R=he[q+_[E]],B[se+_[E]]):(R=96,0),w=1<<f-re,l=C=1<<W;y[z+(N>>re)+(C-=w)]=I<<24|R<<16|S|0,C!==0;);for(w=1<<f-1;N&w;)w>>=1;if(w!==0?(N&=w-1,N+=w):N=0,E++,--ie[f]==0){if(f===P)break;f=x[$+_[E]]}if(Q<f&&(N&k)!==A){for(re===0&&(re=Q),z+=l,Z=1<<(W=f-re);W+re<P&&!((Z-=ie[W+re])<=0);)W++,Z<<=1;if(ae+=1<<W,g===1&&852<ae||g===2&&592<ae)return 1;y[A=N&k]=Q<<24|W<<16|z-h|0}}return N!==0&&(y[z+N]=f-re<<24|64<<16|0),v.bits=Q,0}},{"../utils/common":41}],51:[function(n,e,i){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(n,e,i){"use strict";var t=n("../utils/common"),r=0,a=1;function s(b){for(var D=b.length;0<=--D;)b[D]=0}var d=0,g=29,x=256,$=x+1+g,p=30,y=19,h=2*$+1,_=15,v=16,w=7,C=256,A=16,k=17,z=18,O=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],I=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],R=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],T=new Array(2*($+2));s(T);var f=new Array(2*p);s(f);var E=new Array(512);s(E);var l=new Array(256);s(l);var P=new Array(g);s(P);var Q,W,re,Z=new Array(p);function ae(b,D,V,X,M){this.static_tree=b,this.extra_bits=D,this.extra_base=V,this.elems=X,this.max_length=M,this.has_stree=b&&b.length}function N(b,D){this.dyn_tree=b,this.max_code=0,this.stat_desc=D}function B(b){return b<256?E[b]:E[256+(b>>>7)]}function se(b,D){b.pending_buf[b.pending++]=255&D,b.pending_buf[b.pending++]=D>>>8&255}function ie(b,D,V){b.bi_valid>v-V?(b.bi_buf|=D<<b.bi_valid&65535,se(b,b.bi_buf),b.bi_buf=D>>v-b.bi_valid,b.bi_valid+=V-v):(b.bi_buf|=D<<b.bi_valid&65535,b.bi_valid+=V)}function Y(b,D,V){ie(b,V[2*D],V[2*D+1])}function he(b,D){for(var V=0;V|=1&b,b>>>=1,V<<=1,0<--D;);return V>>>1}function q(b,D,V){var X,M,K=new Array(_+1),te=0;for(X=1;X<=_;X++)K[X]=te=te+V[X-1]<<1;for(M=0;M<=D;M++){var J=b[2*M+1];J!==0&&(b[2*M]=he(K[J]++,J))}}function j(b){var D;for(D=0;D<$;D++)b.dyn_ltree[2*D]=0;for(D=0;D<p;D++)b.dyn_dtree[2*D]=0;for(D=0;D<y;D++)b.bl_tree[2*D]=0;b.dyn_ltree[2*C]=1,b.opt_len=b.static_len=0,b.last_lit=b.matches=0}function L(b){8<b.bi_valid?se(b,b.bi_buf):0<b.bi_valid&&(b.pending_buf[b.pending++]=b.bi_buf),b.bi_buf=0,b.bi_valid=0}function G(b,D,V,X){var M=2*D,K=2*V;return b[M]<b[K]||b[M]===b[K]&&X[D]<=X[V]}function H(b,D,V){for(var X=b.heap[V],M=V<<1;M<=b.heap_len&&(M<b.heap_len&&G(D,b.heap[M+1],b.heap[M],b.depth)&&M++,!G(D,X,b.heap[M],b.depth));)b.heap[V]=b.heap[M],V=M,M<<=1;b.heap[V]=X}function ee(b,D,V){var X,M,K,te,J=0;if(b.last_lit!==0)for(;X=b.pending_buf[b.d_buf+2*J]<<8|b.pending_buf[b.d_buf+2*J+1],M=b.pending_buf[b.l_buf+J],J++,X===0?Y(b,M,D):(Y(b,(K=l[M])+x+1,D),(te=O[K])!==0&&ie(b,M-=P[K],te),Y(b,K=B(--X),V),(te=I[K])!==0&&ie(b,X-=Z[K],te)),J<b.last_lit;);Y(b,C,D)}function ne(b,D){var V,X,M,K=D.dyn_tree,te=D.stat_desc.static_tree,J=D.stat_desc.has_stree,oe=D.stat_desc.elems,ue=-1;for(b.heap_len=0,b.heap_max=h,V=0;V<oe;V++)K[2*V]!==0?(b.heap[++b.heap_len]=ue=V,b.depth[V]=0):K[2*V+1]=0;for(;b.heap_len<2;)K[2*(M=b.heap[++b.heap_len]=ue<2?++ue:0)]=1,b.depth[M]=0,b.opt_len--,J&&(b.static_len-=te[2*M+1]);for(D.max_code=ue,V=b.heap_len>>1;1<=V;V--)H(b,K,V);for(M=oe;V=b.heap[1],b.heap[1]=b.heap[b.heap_len--],H(b,K,1),X=b.heap[1],b.heap[--b.heap_max]=V,b.heap[--b.heap_max]=X,K[2*M]=K[2*V]+K[2*X],b.depth[M]=(b.depth[V]>=b.depth[X]?b.depth[V]:b.depth[X])+1,K[2*V+1]=K[2*X+1]=M,b.heap[1]=M++,H(b,K,1),2<=b.heap_len;);b.heap[--b.heap_max]=b.heap[1],(function(de,xe){var Ue,ke,qe,pe,pt,zt,Se=xe.dyn_tree,tr=xe.max_code,ia=xe.stat_desc.static_tree,ra=xe.stat_desc.has_stree,na=xe.stat_desc.extra_bits,ir=xe.stat_desc.extra_base,We=xe.stat_desc.max_length,ft=0;for(pe=0;pe<=_;pe++)de.bl_count[pe]=0;for(Se[2*de.heap[de.heap_max]+1]=0,Ue=de.heap_max+1;Ue<h;Ue++)We<(pe=Se[2*Se[2*(ke=de.heap[Ue])+1]+1]+1)&&(pe=We,ft++),Se[2*ke+1]=pe,tr<ke||(de.bl_count[pe]++,pt=0,ir<=ke&&(pt=na[ke-ir]),zt=Se[2*ke],de.opt_len+=zt*(pe+pt),ra&&(de.static_len+=zt*(ia[2*ke+1]+pt)));if(ft!==0){do{for(pe=We-1;de.bl_count[pe]===0;)pe--;de.bl_count[pe]--,de.bl_count[pe+1]+=2,de.bl_count[We]--,ft-=2}while(0<ft);for(pe=We;pe!==0;pe--)for(ke=de.bl_count[pe];ke!==0;)tr<(qe=de.heap[--Ue])||(Se[2*qe+1]!==pe&&(de.opt_len+=(pe-Se[2*qe+1])*Se[2*qe],Se[2*qe+1]=pe),ke--)}})(b,D),q(K,ue,b.bl_count)}function o(b,D,V){var X,M,K=-1,te=D[1],J=0,oe=7,ue=4;for(te===0&&(oe=138,ue=3),D[2*(V+1)+1]=65535,X=0;X<=V;X++)M=te,te=D[2*(X+1)+1],++J<oe&&M===te||(J<ue?b.bl_tree[2*M]+=J:M!==0?(M!==K&&b.bl_tree[2*M]++,b.bl_tree[2*A]++):J<=10?b.bl_tree[2*k]++:b.bl_tree[2*z]++,K=M,ue=(J=0)===te?(oe=138,3):M===te?(oe=6,3):(oe=7,4))}function U(b,D,V){var X,M,K=-1,te=D[1],J=0,oe=7,ue=4;for(te===0&&(oe=138,ue=3),X=0;X<=V;X++)if(M=te,te=D[2*(X+1)+1],!(++J<oe&&M===te)){if(J<ue)for(;Y(b,M,b.bl_tree),--J!=0;);else M!==0?(M!==K&&(Y(b,M,b.bl_tree),J--),Y(b,A,b.bl_tree),ie(b,J-3,2)):J<=10?(Y(b,k,b.bl_tree),ie(b,J-3,3)):(Y(b,z,b.bl_tree),ie(b,J-11,7));K=M,ue=(J=0)===te?(oe=138,3):M===te?(oe=6,3):(oe=7,4)}}s(Z);var F=!1;function m(b,D,V,X){ie(b,(d<<1)+(X?1:0),3),(function(M,K,te,J){L(M),J&&(se(M,te),se(M,~te)),t.arraySet(M.pending_buf,M.window,K,te,M.pending),M.pending+=te})(b,D,V,!0)}i._tr_init=function(b){F||((function(){var D,V,X,M,K,te=new Array(_+1);for(M=X=0;M<g-1;M++)for(P[M]=X,D=0;D<1<<O[M];D++)l[X++]=M;for(l[X-1]=M,M=K=0;M<16;M++)for(Z[M]=K,D=0;D<1<<I[M];D++)E[K++]=M;for(K>>=7;M<p;M++)for(Z[M]=K<<7,D=0;D<1<<I[M]-7;D++)E[256+K++]=M;for(V=0;V<=_;V++)te[V]=0;for(D=0;D<=143;)T[2*D+1]=8,D++,te[8]++;for(;D<=255;)T[2*D+1]=9,D++,te[9]++;for(;D<=279;)T[2*D+1]=7,D++,te[7]++;for(;D<=287;)T[2*D+1]=8,D++,te[8]++;for(q(T,$+1,te),D=0;D<p;D++)f[2*D+1]=5,f[2*D]=he(D,5);Q=new ae(T,O,x+1,$,_),W=new ae(f,I,0,p,_),re=new ae(new Array(0),R,0,y,w)})(),F=!0),b.l_desc=new N(b.dyn_ltree,Q),b.d_desc=new N(b.dyn_dtree,W),b.bl_desc=new N(b.bl_tree,re),b.bi_buf=0,b.bi_valid=0,j(b)},i._tr_stored_block=m,i._tr_flush_block=function(b,D,V,X){var M,K,te=0;0<b.level?(b.strm.data_type===2&&(b.strm.data_type=(function(J){var oe,ue=4093624447;for(oe=0;oe<=31;oe++,ue>>>=1)if(1&ue&&J.dyn_ltree[2*oe]!==0)return r;if(J.dyn_ltree[18]!==0||J.dyn_ltree[20]!==0||J.dyn_ltree[26]!==0)return a;for(oe=32;oe<x;oe++)if(J.dyn_ltree[2*oe]!==0)return a;return r})(b)),ne(b,b.l_desc),ne(b,b.d_desc),te=(function(J){var oe;for(o(J,J.dyn_ltree,J.l_desc.max_code),o(J,J.dyn_dtree,J.d_desc.max_code),ne(J,J.bl_desc),oe=y-1;3<=oe&&J.bl_tree[2*S[oe]+1]===0;oe--);return J.opt_len+=3*(oe+1)+5+5+4,oe})(b),M=b.opt_len+3+7>>>3,(K=b.static_len+3+7>>>3)<=M&&(M=K)):M=K=V+5,V+4<=M&&D!==-1?m(b,D,V,X):b.strategy===4||K===M?(ie(b,2+(X?1:0),3),ee(b,T,f)):(ie(b,4+(X?1:0),3),(function(J,oe,ue,de){var xe;for(ie(J,oe-257,5),ie(J,ue-1,5),ie(J,de-4,4),xe=0;xe<de;xe++)ie(J,J.bl_tree[2*S[xe]+1],3);U(J,J.dyn_ltree,oe-1),U(J,J.dyn_dtree,ue-1)})(b,b.l_desc.max_code+1,b.d_desc.max_code+1,te+1),ee(b,b.dyn_ltree,b.dyn_dtree)),j(b),X&&L(b)},i._tr_tally=function(b,D,V){return b.pending_buf[b.d_buf+2*b.last_lit]=D>>>8&255,b.pending_buf[b.d_buf+2*b.last_lit+1]=255&D,b.pending_buf[b.l_buf+b.last_lit]=255&V,b.last_lit++,D===0?b.dyn_ltree[2*V]++:(b.matches++,D--,b.dyn_ltree[2*(l[V]+x+1)]++,b.dyn_dtree[2*B(D)]++),b.last_lit===b.lit_bufsize-1},i._tr_align=function(b){ie(b,2,3),Y(b,C,T),(function(D){D.bi_valid===16?(se(D,D.bi_buf),D.bi_buf=0,D.bi_valid=0):8<=D.bi_valid&&(D.pending_buf[D.pending++]=255&D.bi_buf,D.bi_buf>>=8,D.bi_valid-=8)})(b)}},{"../utils/common":41}],53:[function(n,e,i){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(n,e,i){(function(t){(function(r,a){"use strict";if(!r.setImmediate){var s,d,g,x,$=1,p={},y=!1,h=r.document,_=Object.getPrototypeOf&&Object.getPrototypeOf(r);_=_&&_.setTimeout?_:r,s={}.toString.call(r.process)==="[object process]"?function(A){process.nextTick(function(){w(A)})}:(function(){if(r.postMessage&&!r.importScripts){var A=!0,k=r.onmessage;return r.onmessage=function(){A=!1},r.postMessage("","*"),r.onmessage=k,A}})()?(x="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",C,!1):r.attachEvent("onmessage",C),function(A){r.postMessage(x+A,"*")}):r.MessageChannel?((g=new MessageChannel).port1.onmessage=function(A){w(A.data)},function(A){g.port2.postMessage(A)}):h&&"onreadystatechange"in h.createElement("script")?(d=h.documentElement,function(A){var k=h.createElement("script");k.onreadystatechange=function(){w(A),k.onreadystatechange=null,d.removeChild(k),k=null},d.appendChild(k)}):function(A){setTimeout(w,0,A)},_.setImmediate=function(A){typeof A!="function"&&(A=new Function(""+A));for(var k=new Array(arguments.length-1),z=0;z<k.length;z++)k[z]=arguments[z+1];var O={callback:A,args:k};return p[$]=O,s($),$++},_.clearImmediate=v}function v(A){delete p[A]}function w(A){if(y)setTimeout(w,0,A);else{var k=p[A];if(k){y=!0;try{(function(z){var O=z.callback,I=z.args;switch(I.length){case 0:O();break;case 1:O(I[0]);break;case 2:O(I[0],I[1]);break;case 3:O(I[0],I[1],I[2]);break;default:O.apply(a,I)}})(k)}finally{v(A),y=!1}}}}function C(A){A.source===r&&typeof A.data=="string"&&A.data.indexOf(x)===0&&w(+A.data.slice(x.length))}})(typeof self>"u"?t===void 0?this:t:self)}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})});var be=le(Gt=>{"use strict";Object.defineProperty(Gt,"__esModule",{value:!0});function va(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var ba=function n(e,i){va(this,n),this.data=e,this.text=i.text||e,this.options=i};Gt.default=ba});var Sr=le(yt=>{"use strict";Object.defineProperty(yt,"__esModule",{value:!0});yt.CODE39=void 0;var _a=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),xa=be(),ya=wa(xa);function wa(n){return n&&n.__esModule?n:{default:n}}function ka(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function $a(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Sa(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Ea=(function(n){Sa(e,n);function e(i,t){return ka(this,e),i=i.toUpperCase(),t.mod43&&(i+=Ra(Ia(i))),$a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return _a(e,[{key:"encode",value:function(){for(var t=Ht("*"),r=0;r<this.data.length;r++)t+=Ht(this.data[r])+"0";return t+=Ht("*"),{data:t,text:this.text}}},{key:"valid",value:function(){return this.data.search(/^[0-9A-Z\-\.\ \$\/\+\%]+$/)!==-1}}]),e})(ya.default),kr=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","-","."," ","$","/","+","%","*"],Aa=[20957,29783,23639,30485,20951,29813,23669,20855,29789,23645,29975,23831,30533,22295,30149,24005,21623,29981,23837,22301,30023,23879,30545,22343,30161,24017,21959,30065,23921,22385,29015,18263,29141,17879,29045,18293,17783,29021,18269,17477,17489,17681,20753,35770];function Ht(n){return Ta($r(n))}function Ta(n){return Aa[n].toString(2)}function Ra(n){return kr[n]}function $r(n){return kr.indexOf(n)}function Ia(n){for(var e=0,i=0;i<n.length;i++)e+=$r(n[i]);return e=e%43,e}yt.CODE39=Ea});var ze=le(fe=>{"use strict";Object.defineProperty(fe,"__esModule",{value:!0});var tt;function Vt(n,e,i){return e in n?Object.defineProperty(n,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):n[e]=i,n}var Er=fe.SET_A=0,Ar=fe.SET_B=1,Tr=fe.SET_C=2,Gu=fe.SHIFT=98,Oa=fe.START_A=103,Ca=fe.START_B=104,za=fe.START_C=105,Hu=fe.MODULO=103,Vu=fe.STOP=106,Zu=fe.FNC1=207,Xu=fe.SET_BY_CODE=(tt={},Vt(tt,Oa,Er),Vt(tt,Ca,Ar),Vt(tt,za,Tr),tt),Ku=fe.SWAP={101:Er,100:Ar,99:Tr},Qu=fe.A_START_CHAR="\xD0",Yu=fe.B_START_CHAR="\xD1",Ju=fe.C_START_CHAR="\xD2",eh=fe.A_CHARS="[\0-_\xC8-\xCF]",th=fe.B_CHARS="[ -\x7F\xC8-\xCF]",ih=fe.C_CHARS="(\xCF*[0-9]{2}\xCF*)",rh=fe.BARS=[11011001100,11001101100,11001100110,10010011e3,10010001100,10001001100,10011001e3,10011000100,10001100100,11001001e3,11001000100,11000100100,10110011100,10011011100,10011001110,10111001100,10011101100,10011100110,11001110010,11001011100,11001001110,11011100100,11001110100,11101101110,11101001100,11100101100,11100100110,11101100100,11100110100,11100110010,11011011e3,11011000110,11000110110,10100011e3,10001011e3,10001000110,10110001e3,10001101e3,10001100010,11010001e3,11000101e3,11000100010,10110111e3,10110001110,10001101110,10111011e3,10111000110,10001110110,11101110110,11010001110,11000101110,11011101e3,11011100010,11011101110,11101011e3,11101000110,11100010110,11101101e3,11101100010,11100011010,11101111010,11001000010,11110001010,1010011e4,10100001100,1001011e4,10010000110,10000101100,10000100110,1011001e4,10110000100,1001101e4,10011000010,10000110100,10000110010,11000010010,1100101e4,11110111010,11000010100,10001111010,10100111100,10010111100,10010011110,10111100100,10011110100,10011110010,11110100100,11110010100,11110010010,11011011110,11011110110,11110110110,10101111e3,10100011110,10001011110,10111101e3,10111100010,11110101e3,11110100010,10111011110,10111101110,11101011110,11110101110,11010000100,1101001e4,11010011100,1100011101011]});var it=le(Zt=>{"use strict";Object.defineProperty(Zt,"__esModule",{value:!0});var Da=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),Pa=be(),La=Ma(Pa),_e=ze();function Ma(n){return n&&n.__esModule?n:{default:n}}function Ba(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Fa(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Na(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var ja=(function(n){Na(e,n);function e(i,t){Ba(this,e);var r=Fa(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i.substring(1),t));return r.bytes=i.split("").map(function(a){return a.charCodeAt(0)}),r}return Da(e,[{key:"valid",value:function(){return/^[\x00-\x7F\xC8-\xD3]+$/.test(this.data)}},{key:"encode",value:function(){var t=this.bytes,r=t.shift()-105,a=_e.SET_BY_CODE[r];if(a===void 0)throw new RangeError("The encoding does not start with a start character.");this.shouldEncodeAsEan128()===!0&&t.unshift(_e.FNC1);var s=e.next(t,1,a);return{text:this.text===this.data?this.text.replace(/[^\x20-\x7E]/g,""):this.text,data:e.getBar(r)+s.result+e.getBar((s.checksum+r)%_e.MODULO)+e.getBar(_e.STOP)}}},{key:"shouldEncodeAsEan128",value:function(){var t=this.options.ean128||!1;return typeof t=="string"&&(t=t.toLowerCase()==="true"),t}}],[{key:"getBar",value:function(t){return _e.BARS[t]?_e.BARS[t].toString():""}},{key:"correctIndex",value:function(t,r){if(r===_e.SET_A){var a=t.shift();return a<32?a+64:a-32}else return r===_e.SET_B?t.shift()-32:(t.shift()-48)*10+t.shift()-48}},{key:"next",value:function(t,r,a){if(!t.length)return{result:"",checksum:0};var s=void 0,d=void 0;if(t[0]>=200){d=t.shift()-105;var g=_e.SWAP[d];g!==void 0?s=e.next(t,r+1,g):((a===_e.SET_A||a===_e.SET_B)&&d===_e.SHIFT&&(t[0]=a===_e.SET_A?t[0]>95?t[0]-96:t[0]:t[0]<32?t[0]+96:t[0]),s=e.next(t,r+1,a))}else d=e.correctIndex(t,a),s=e.next(t,r+1,a);var x=e.getBar(d),$=d*r;return{result:x+s.result,checksum:$+s.checksum}}}]),e})(La.default);Zt.default=ja});var zr=le(Kt=>{"use strict";Object.defineProperty(Kt,"__esModule",{value:!0});var Re=ze(),Rr=function(e){return e.match(new RegExp("^"+Re.A_CHARS+"*"))[0].length},Ir=function(e){return e.match(new RegExp("^"+Re.B_CHARS+"*"))[0].length},Or=function(e){return e.match(new RegExp("^"+Re.C_CHARS+"*"))[0]};function Xt(n,e){var i=e?Re.A_CHARS:Re.B_CHARS,t=n.match(new RegExp("^("+i+"+?)(([0-9]{2}){2,})([^0-9]|$)"));if(t)return t[1]+"\xCC"+Cr(n.substring(t[1].length));var r=n.match(new RegExp("^"+i+"+"))[0];return r.length===n.length?n:r+String.fromCharCode(e?205:206)+Xt(n.substring(r.length),!e)}function Cr(n){var e=Or(n),i=e.length;if(i===n.length)return n;n=n.substring(i);var t=Rr(n)>=Ir(n);return e+String.fromCharCode(t?206:205)+Xt(n,t)}Kt.default=function(n){var e=void 0,i=Or(n).length;if(i>=2)e=Re.C_START_CHAR+Cr(n);else{var t=Rr(n)>Ir(n);e=(t?Re.A_START_CHAR:Re.B_START_CHAR)+Xt(n,t)}return e.replace(/[\xCD\xCE]([^])[\xCD\xCE]/,function(r,a){return"\xCB"+a})}});var Pr=le(Yt=>{"use strict";Object.defineProperty(Yt,"__esModule",{value:!0});var Ua=it(),qa=Dr(Ua),Wa=zr(),Ga=Dr(Wa);function Dr(n){return n&&n.__esModule?n:{default:n}}function Ha(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Qt(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Va(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Za=(function(n){Va(e,n);function e(i,t){if(Ha(this,e),/^[\x00-\x7F\xC8-\xD3]+$/.test(i))var r=Qt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,(0,Ga.default)(i),t));else var r=Qt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t));return Qt(r)}return e})(qa.default);Yt.default=Za});var Mr=le(Jt=>{"use strict";Object.defineProperty(Jt,"__esModule",{value:!0});var Xa=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),Ka=it(),Qa=Ya(Ka),Lr=ze();function Ya(n){return n&&n.__esModule?n:{default:n}}function Ja(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function es(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function ts(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var is=(function(n){ts(e,n);function e(i,t){return Ja(this,e),es(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,Lr.A_START_CHAR+i,t))}return Xa(e,[{key:"valid",value:function(){return new RegExp("^"+Lr.A_CHARS+"+$").test(this.data)}}]),e})(Qa.default);Jt.default=is});var Fr=le(ei=>{"use strict";Object.defineProperty(ei,"__esModule",{value:!0});var rs=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),ns=it(),as=ss(ns),Br=ze();function ss(n){return n&&n.__esModule?n:{default:n}}function os(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function ls(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function cs(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var ds=(function(n){cs(e,n);function e(i,t){return os(this,e),ls(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,Br.B_START_CHAR+i,t))}return rs(e,[{key:"valid",value:function(){return new RegExp("^"+Br.B_CHARS+"+$").test(this.data)}}]),e})(as.default);ei.default=ds});var jr=le(ti=>{"use strict";Object.defineProperty(ti,"__esModule",{value:!0});var us=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),hs=it(),ps=fs(hs),Nr=ze();function fs(n){return n&&n.__esModule?n:{default:n}}function ms(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function gs(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function vs(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var bs=(function(n){vs(e,n);function e(i,t){return ms(this,e),gs(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,Nr.C_START_CHAR+i,t))}return us(e,[{key:"valid",value:function(){return new RegExp("^"+Nr.C_CHARS+"+$").test(this.data)}}]),e})(ps.default);ti.default=bs});var Ur=le($e=>{"use strict";Object.defineProperty($e,"__esModule",{value:!0});$e.CODE128C=$e.CODE128B=$e.CODE128A=$e.CODE128=void 0;var _s=Pr(),xs=wt(_s),ys=Mr(),ws=wt(ys),ks=Fr(),$s=wt(ks),Ss=jr(),Es=wt(Ss);function wt(n){return n&&n.__esModule?n:{default:n}}$e.CODE128=xs.default;$e.CODE128A=ws.default;$e.CODE128B=$s.default;$e.CODE128C=Es.default});var De=le(Ie=>{"use strict";Object.defineProperty(Ie,"__esModule",{value:!0});var hh=Ie.SIDE_BIN="101",ph=Ie.MIDDLE_BIN="01010",fh=Ie.BINARIES={L:["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"],G:["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"],R:["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"],O:["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"],E:["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"]},mh=Ie.EAN2_STRUCTURE=["LL","LG","GL","GG"],gh=Ie.EAN5_STRUCTURE=["GGLLL","GLGLL","GLLGL","GLLLG","LGGLL","LLGGL","LLLGG","LGLGL","LGLLG","LLGLG"],vh=Ie.EAN13_STRUCTURE=["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"]});var Pe=le(ii=>{"use strict";Object.defineProperty(ii,"__esModule",{value:!0});var As=De(),Ts=function(e,i,t){var r=e.split("").map(function(s,d){return As.BINARIES[i[d]]}).map(function(s,d){return s?s[e[d]]:""});if(t){var a=e.length-1;r=r.map(function(s,d){return d<a?s+t:s})}return r.join("")};ii.default=Ts});var ni=le(ri=>{"use strict";Object.defineProperty(ri,"__esModule",{value:!0});var Rs=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),Le=De(),Is=Pe(),qr=Wr(Is),Os=be(),Cs=Wr(Os);function Wr(n){return n&&n.__esModule?n:{default:n}}function zs(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Ds(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Ps(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Ls=(function(n){Ps(e,n);function e(i,t){zs(this,e);var r=Ds(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t));return r.fontSize=!t.flat&&t.fontSize>t.width*10?t.width*10:t.fontSize,r.guardHeight=t.height+r.fontSize/2+t.textMargin,r}return Rs(e,[{key:"encode",value:function(){return this.options.flat?this.encodeFlat():this.encodeGuarded()}},{key:"leftText",value:function(t,r){return this.text.substr(t,r)}},{key:"leftEncode",value:function(t,r){return(0,qr.default)(t,r)}},{key:"rightText",value:function(t,r){return this.text.substr(t,r)}},{key:"rightEncode",value:function(t,r){return(0,qr.default)(t,r)}},{key:"encodeGuarded",value:function(){var t={fontSize:this.fontSize},r={height:this.guardHeight};return[{data:Le.SIDE_BIN,options:r},{data:this.leftEncode(),text:this.leftText(),options:t},{data:Le.MIDDLE_BIN,options:r},{data:this.rightEncode(),text:this.rightText(),options:t},{data:Le.SIDE_BIN,options:r}]}},{key:"encodeFlat",value:function(){var t=[Le.SIDE_BIN,this.leftEncode(),Le.MIDDLE_BIN,this.rightEncode(),Le.SIDE_BIN];return{data:t.join(""),text:this.text}}}]),e})(Cs.default);ri.default=Ls});var Hr=le(ai=>{"use strict";Object.defineProperty(ai,"__esModule",{value:!0});var Ms=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),rt=function n(e,i,t){e===null&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,i);if(r===void 0){var a=Object.getPrototypeOf(e);return a===null?void 0:n(a,i,t)}else{if("value"in r)return r.value;var s=r.get;return s===void 0?void 0:s.call(t)}},Bs=De(),Fs=ni(),Ns=js(Fs);function js(n){return n&&n.__esModule?n:{default:n}}function Us(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function qs(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Ws(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Gr=function(e){var i=e.substr(0,12).split("").map(function(t){return+t}).reduce(function(t,r,a){return a%2?t+r*3:t+r},0);return(10-i%10)%10},Gs=(function(n){Ws(e,n);function e(i,t){Us(this,e),i.search(/^[0-9]{12}$/)!==-1&&(i+=Gr(i));var r=qs(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t));return r.lastChar=t.lastChar,r}return Ms(e,[{key:"valid",value:function(){return this.data.search(/^[0-9]{13}$/)!==-1&&+this.data[12]===Gr(this.data)}},{key:"leftText",value:function(){return rt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"leftText",this).call(this,1,6)}},{key:"leftEncode",value:function(){var t=this.data.substr(1,6),r=Bs.EAN13_STRUCTURE[this.data[0]];return rt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"leftEncode",this).call(this,t,r)}},{key:"rightText",value:function(){return rt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"rightText",this).call(this,7,6)}},{key:"rightEncode",value:function(){var t=this.data.substr(7,6);return rt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"rightEncode",this).call(this,t,"RRRRRR")}},{key:"encodeGuarded",value:function(){var t=rt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"encodeGuarded",this).call(this);return this.options.displayValue&&(t.unshift({data:"000000000000",text:this.text.substr(0,1),options:{textAlign:"left",fontSize:this.fontSize}}),this.options.lastChar&&(t.push({data:"00"}),t.push({data:"00000",text:this.options.lastChar,options:{fontSize:this.fontSize}}))),t}}]),e})(Ns.default);ai.default=Gs});var Zr=le(si=>{"use strict";Object.defineProperty(si,"__esModule",{value:!0});var Hs=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),kt=function n(e,i,t){e===null&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,i);if(r===void 0){var a=Object.getPrototypeOf(e);return a===null?void 0:n(a,i,t)}else{if("value"in r)return r.value;var s=r.get;return s===void 0?void 0:s.call(t)}},Vs=ni(),Zs=Xs(Vs);function Xs(n){return n&&n.__esModule?n:{default:n}}function Ks(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Qs(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Ys(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Vr=function(e){var i=e.substr(0,7).split("").map(function(t){return+t}).reduce(function(t,r,a){return a%2?t+r:t+r*3},0);return(10-i%10)%10},Js=(function(n){Ys(e,n);function e(i,t){return Ks(this,e),i.search(/^[0-9]{7}$/)!==-1&&(i+=Vr(i)),Qs(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return Hs(e,[{key:"valid",value:function(){return this.data.search(/^[0-9]{8}$/)!==-1&&+this.data[7]===Vr(this.data)}},{key:"leftText",value:function(){return kt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"leftText",this).call(this,0,4)}},{key:"leftEncode",value:function(){var t=this.data.substr(0,4);return kt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"leftEncode",this).call(this,t,"LLLL")}},{key:"rightText",value:function(){return kt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"rightText",this).call(this,4,4)}},{key:"rightEncode",value:function(){var t=this.data.substr(4,4);return kt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"rightEncode",this).call(this,t,"RRRR")}}]),e})(Zs.default);si.default=Js});var Kr=le(oi=>{"use strict";Object.defineProperty(oi,"__esModule",{value:!0});var eo=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),to=De(),io=Pe(),ro=Xr(io),no=be(),ao=Xr(no);function Xr(n){return n&&n.__esModule?n:{default:n}}function so(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function oo(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function lo(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var co=function(e){var i=e.split("").map(function(t){return+t}).reduce(function(t,r,a){return a%2?t+r*9:t+r*3},0);return i%10},uo=(function(n){lo(e,n);function e(i,t){return so(this,e),oo(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return eo(e,[{key:"valid",value:function(){return this.data.search(/^[0-9]{5}$/)!==-1}},{key:"encode",value:function(){var t=to.EAN5_STRUCTURE[co(this.data)];return{data:"1011"+(0,ro.default)(this.data,t,"01"),text:this.text}}}]),e})(ao.default);oi.default=uo});var Yr=le(li=>{"use strict";Object.defineProperty(li,"__esModule",{value:!0});var ho=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),po=De(),fo=Pe(),mo=Qr(fo),go=be(),vo=Qr(go);function Qr(n){return n&&n.__esModule?n:{default:n}}function bo(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function _o(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function xo(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var yo=(function(n){xo(e,n);function e(i,t){return bo(this,e),_o(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return ho(e,[{key:"valid",value:function(){return this.data.search(/^[0-9]{2}$/)!==-1}},{key:"encode",value:function(){var t=po.EAN2_STRUCTURE[parseInt(this.data)%4];return{data:"1011"+(0,mo.default)(this.data,t,"01"),text:this.text}}}]),e})(vo.default);li.default=yo});var di=le($t=>{"use strict";Object.defineProperty($t,"__esModule",{value:!0});var wo=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})();$t.checksum=ci;var ko=Pe(),Me=Jr(ko),$o=be(),So=Jr($o);function Jr(n){return n&&n.__esModule?n:{default:n}}function Eo(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Ao(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function To(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Ro=(function(n){To(e,n);function e(i,t){Eo(this,e),i.search(/^[0-9]{11}$/)!==-1&&(i+=ci(i));var r=Ao(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t));return r.displayValue=t.displayValue,t.fontSize>t.width*10?r.fontSize=t.width*10:r.fontSize=t.fontSize,r.guardHeight=t.height+r.fontSize/2+t.textMargin,r}return wo(e,[{key:"valid",value:function(){return this.data.search(/^[0-9]{12}$/)!==-1&&this.data[11]==ci(this.data)}},{key:"encode",value:function(){return this.options.flat?this.flatEncoding():this.guardedEncoding()}},{key:"flatEncoding",value:function(){var t="";return t+="101",t+=(0,Me.default)(this.data.substr(0,6),"LLLLLL"),t+="01010",t+=(0,Me.default)(this.data.substr(6,6),"RRRRRR"),t+="101",{data:t,text:this.text}}},{key:"guardedEncoding",value:function(){var t=[];return this.displayValue&&t.push({data:"00000000",text:this.text.substr(0,1),options:{textAlign:"left",fontSize:this.fontSize}}),t.push({data:"101"+(0,Me.default)(this.data[0],"L"),options:{height:this.guardHeight}}),t.push({data:(0,Me.default)(this.data.substr(1,5),"LLLLL"),text:this.text.substr(1,5),options:{fontSize:this.fontSize}}),t.push({data:"01010",options:{height:this.guardHeight}}),t.push({data:(0,Me.default)(this.data.substr(6,5),"RRRRR"),text:this.text.substr(6,5),options:{fontSize:this.fontSize}}),t.push({data:(0,Me.default)(this.data[11],"R")+"101",options:{height:this.guardHeight}}),this.displayValue&&t.push({data:"00000000",text:this.text.substr(11,1),options:{textAlign:"right",fontSize:this.fontSize}}),t}}]),e})(So.default);function ci(n){var e=0,i;for(i=1;i<11;i+=2)e+=parseInt(n[i]);for(i=0;i<11;i+=2)e+=parseInt(n[i])*3;return(10-e%10)%10}$t.default=Ro});var rn=le(hi=>{"use strict";Object.defineProperty(hi,"__esModule",{value:!0});var Io=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),Oo=Pe(),Co=tn(Oo),zo=be(),Do=tn(zo),Po=di();function tn(n){return n&&n.__esModule?n:{default:n}}function Lo(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function ui(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Mo(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Bo=["XX00000XXX","XX10000XXX","XX20000XXX","XXX00000XX","XXXX00000X","XXXXX00005","XXXXX00006","XXXXX00007","XXXXX00008","XXXXX00009"],Fo=[["EEEOOO","OOOEEE"],["EEOEOO","OOEOEE"],["EEOOEO","OOEEOE"],["EEOOOE","OOEEEO"],["EOEEOO","OEOOEE"],["EOOEEO","OEEOOE"],["EOOOEE","OEEEOO"],["EOEOEO","OEOEOE"],["EOEOOE","OEOEEO"],["EOOEOE","OEEOEO"]],No=(function(n){Mo(e,n);function e(i,t){Lo(this,e);var r=ui(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t));if(r.isValid=!1,i.search(/^[0-9]{6}$/)!==-1)r.middleDigits=i,r.upcA=en(i,"0"),r.text=t.text||""+r.upcA[0]+i+r.upcA[r.upcA.length-1],r.isValid=!0;else if(i.search(/^[01][0-9]{7}$/)!==-1)if(r.middleDigits=i.substring(1,i.length-1),r.upcA=en(r.middleDigits,i[0]),r.upcA[r.upcA.length-1]===i[i.length-1])r.isValid=!0;else return ui(r);else return ui(r);return r.displayValue=t.displayValue,t.fontSize>t.width*10?r.fontSize=t.width*10:r.fontSize=t.fontSize,r.guardHeight=t.height+r.fontSize/2+t.textMargin,r}return Io(e,[{key:"valid",value:function(){return this.isValid}},{key:"encode",value:function(){return this.options.flat?this.flatEncoding():this.guardedEncoding()}},{key:"flatEncoding",value:function(){var t="";return t+="101",t+=this.encodeMiddleDigits(),t+="010101",{data:t,text:this.text}}},{key:"guardedEncoding",value:function(){var t=[];return this.displayValue&&t.push({data:"00000000",text:this.text[0],options:{textAlign:"left",fontSize:this.fontSize}}),t.push({data:"101",options:{height:this.guardHeight}}),t.push({data:this.encodeMiddleDigits(),text:this.text.substring(1,7),options:{fontSize:this.fontSize}}),t.push({data:"010101",options:{height:this.guardHeight}}),this.displayValue&&t.push({data:"00000000",text:this.text[7],options:{textAlign:"right",fontSize:this.fontSize}}),t}},{key:"encodeMiddleDigits",value:function(){var t=this.upcA[0],r=this.upcA[this.upcA.length-1],a=Fo[parseInt(r)][parseInt(t)];return(0,Co.default)(this.middleDigits,a)}}]),e})(Do.default);function en(n,e){for(var i=parseInt(n[n.length-1]),t=Bo[i],r="",a=0,s=0;s<t.length;s++){var d=t[s];d==="X"?r+=n[a++]:r+=d}return r=""+e+r,""+r+(0,Po.checksum)(r)}hi.default=No});var nn=le(ve=>{"use strict";Object.defineProperty(ve,"__esModule",{value:!0});ve.UPCE=ve.UPC=ve.EAN2=ve.EAN5=ve.EAN8=ve.EAN13=void 0;var jo=Hr(),Uo=Be(jo),qo=Zr(),Wo=Be(qo),Go=Kr(),Ho=Be(Go),Vo=Yr(),Zo=Be(Vo),Xo=di(),Ko=Be(Xo),Qo=rn(),Yo=Be(Qo);function Be(n){return n&&n.__esModule?n:{default:n}}ve.EAN13=Uo.default;ve.EAN8=Wo.default;ve.EAN5=Ho.default;ve.EAN2=Zo.default;ve.UPC=Ko.default;ve.UPCE=Yo.default});var an=le(nt=>{"use strict";Object.defineProperty(nt,"__esModule",{value:!0});var Th=nt.START_BIN="1010",Rh=nt.END_BIN="11101",Ih=nt.BINARIES=["00110","10001","01001","11000","00101","10100","01100","00011","10010","01010"]});var fi=le(pi=>{"use strict";Object.defineProperty(pi,"__esModule",{value:!0});var Jo=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),St=an(),el=be(),tl=il(el);function il(n){return n&&n.__esModule?n:{default:n}}function rl(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function nl(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function al(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var sl=(function(n){al(e,n);function e(){return rl(this,e),nl(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return Jo(e,[{key:"valid",value:function(){return this.data.search(/^([0-9]{2})+$/)!==-1}},{key:"encode",value:function(){var t=this,r=this.data.match(/.{2}/g).map(function(a){return t.encodePair(a)}).join("");return{data:St.START_BIN+r+St.END_BIN,text:this.text}}},{key:"encodePair",value:function(t){var r=St.BINARIES[t[1]];return St.BINARIES[t[0]].split("").map(function(a,s){return(a==="1"?"111":"1")+(r[s]==="1"?"000":"0")}).join("")}}]),e})(tl.default);pi.default=sl});var on=le(mi=>{"use strict";Object.defineProperty(mi,"__esModule",{value:!0});var ol=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),ll=fi(),cl=dl(ll);function dl(n){return n&&n.__esModule?n:{default:n}}function ul(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function hl(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function pl(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var sn=function(e){var i=e.substr(0,13).split("").map(function(t){return parseInt(t,10)}).reduce(function(t,r,a){return t+r*(3-a%2*2)},0);return Math.ceil(i/10)*10-i},fl=(function(n){pl(e,n);function e(i,t){return ul(this,e),i.search(/^[0-9]{13}$/)!==-1&&(i+=sn(i)),hl(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return ol(e,[{key:"valid",value:function(){return this.data.search(/^[0-9]{14}$/)!==-1&&+this.data[13]===sn(this.data)}}]),e})(cl.default);mi.default=fl});var cn=le(Fe=>{"use strict";Object.defineProperty(Fe,"__esModule",{value:!0});Fe.ITF14=Fe.ITF=void 0;var ml=fi(),gl=ln(ml),vl=on(),bl=ln(vl);function ln(n){return n&&n.__esModule?n:{default:n}}Fe.ITF=gl.default;Fe.ITF14=bl.default});var Ne=le(gi=>{"use strict";Object.defineProperty(gi,"__esModule",{value:!0});var _l=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),xl=be(),yl=wl(xl);function wl(n){return n&&n.__esModule?n:{default:n}}function kl(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function $l(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Sl(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var El=(function(n){Sl(e,n);function e(i,t){return kl(this,e),$l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return _l(e,[{key:"encode",value:function(){for(var t="110",r=0;r<this.data.length;r++){var a=parseInt(this.data[r]),s=a.toString(2);s=Al(s,4-s.length);for(var d=0;d<s.length;d++)t+=s[d]=="0"?"100":"110"}return t+="1001",{data:t,text:this.text}}},{key:"valid",value:function(){return this.data.search(/^[0-9]+$/)!==-1}}]),e})(yl.default);function Al(n,e){for(var i=0;i<e;i++)n="0"+n;return n}gi.default=El});var at=le(Et=>{"use strict";Object.defineProperty(Et,"__esModule",{value:!0});Et.mod10=Tl;Et.mod11=Rl;function Tl(n){for(var e=0,i=0;i<n.length;i++){var t=parseInt(n[i]);(i+n.length)%2===0?e+=t:e+=t*2%10+Math.floor(t*2/10)}return(10-e%10)%10}function Rl(n){for(var e=0,i=[2,3,4,5,6,7],t=0;t<n.length;t++){var r=parseInt(n[n.length-1-t]);e+=i[t%i.length]*r}return(11-e%11)%11}});var dn=le(vi=>{"use strict";Object.defineProperty(vi,"__esModule",{value:!0});var Il=Ne(),Ol=zl(Il),Cl=at();function zl(n){return n&&n.__esModule?n:{default:n}}function Dl(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Pl(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Ll(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Ml=(function(n){Ll(e,n);function e(i,t){return Dl(this,e),Pl(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i+(0,Cl.mod10)(i),t))}return e})(Ol.default);vi.default=Ml});var un=le(bi=>{"use strict";Object.defineProperty(bi,"__esModule",{value:!0});var Bl=Ne(),Fl=jl(Bl),Nl=at();function jl(n){return n&&n.__esModule?n:{default:n}}function Ul(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function ql(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Wl(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Gl=(function(n){Wl(e,n);function e(i,t){return Ul(this,e),ql(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i+(0,Nl.mod11)(i),t))}return e})(Fl.default);bi.default=Gl});var pn=le(_i=>{"use strict";Object.defineProperty(_i,"__esModule",{value:!0});var Hl=Ne(),Vl=Zl(Hl),hn=at();function Zl(n){return n&&n.__esModule?n:{default:n}}function Xl(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Kl(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Ql(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Yl=(function(n){Ql(e,n);function e(i,t){return Xl(this,e),i+=(0,hn.mod10)(i),i+=(0,hn.mod10)(i),Kl(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return e})(Vl.default);_i.default=Yl});var mn=le(xi=>{"use strict";Object.defineProperty(xi,"__esModule",{value:!0});var Jl=Ne(),ec=tc(Jl),fn=at();function tc(n){return n&&n.__esModule?n:{default:n}}function ic(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function rc(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function nc(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var ac=(function(n){nc(e,n);function e(i,t){return ic(this,e),i+=(0,fn.mod11)(i),i+=(0,fn.mod10)(i),rc(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return e})(ec.default);xi.default=ac});var gn=le(ye=>{"use strict";Object.defineProperty(ye,"__esModule",{value:!0});ye.MSI1110=ye.MSI1010=ye.MSI11=ye.MSI10=ye.MSI=void 0;var sc=Ne(),oc=st(sc),lc=dn(),cc=st(lc),dc=un(),uc=st(dc),hc=pn(),pc=st(hc),fc=mn(),mc=st(fc);function st(n){return n&&n.__esModule?n:{default:n}}ye.MSI=oc.default;ye.MSI10=cc.default;ye.MSI11=uc.default;ye.MSI1010=pc.default;ye.MSI1110=mc.default});var vn=le(At=>{"use strict";Object.defineProperty(At,"__esModule",{value:!0});At.pharmacode=void 0;var gc=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),vc=be(),bc=_c(vc);function _c(n){return n&&n.__esModule?n:{default:n}}function xc(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function yc(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function wc(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var kc=(function(n){wc(e,n);function e(i,t){xc(this,e);var r=yc(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t));return r.number=parseInt(i,10),r}return gc(e,[{key:"encode",value:function(){for(var t=this.number,r="";!isNaN(t)&&t!=0;)t%2===0?(r="11100"+r,t=(t-2)/2):(r="100"+r,t=(t-1)/2);return r=r.slice(0,-2),{data:r,text:this.text}}},{key:"valid",value:function(){return this.number>=3&&this.number<=131070}}]),e})(bc.default);At.pharmacode=kc});var bn=le(Tt=>{"use strict";Object.defineProperty(Tt,"__esModule",{value:!0});Tt.codabar=void 0;var $c=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),Sc=be(),Ec=Ac(Sc);function Ac(n){return n&&n.__esModule?n:{default:n}}function Tc(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Rc(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Ic(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Oc=(function(n){Ic(e,n);function e(i,t){Tc(this,e),i.search(/^[0-9\-\$\:\.\+\/]+$/)===0&&(i="A"+i+"A");var r=Rc(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i.toUpperCase(),t));return r.text=r.options.text||r.text.replace(/[A-D]/g,""),r}return $c(e,[{key:"valid",value:function(){return this.data.search(/^[A-D][0-9\-\$\:\.\+\/]+[A-D]$/)!==-1}},{key:"encode",value:function(){for(var t=[],r=this.getEncodings(),a=0;a<this.data.length;a++)t.push(r[this.data.charAt(a)]),a!==this.data.length-1&&t.push("0");return{text:this.text,data:t.join("")}}},{key:"getEncodings",value:function(){return{0:"101010011",1:"101011001",2:"101001011",3:"110010101",4:"101101001",5:"110101001",6:"100101011",7:"100101101",8:"100110101",9:"110100101","-":"101001101",$:"101100101",":":"1101011011","/":"1101101011",".":"1101101101","+":"1011011011",A:"1011001001",B:"1001001011",C:"1010010011",D:"1010011001"}}}]),e})(Ec.default);Tt.codabar=Oc});var _n=le(Rt=>{"use strict";Object.defineProperty(Rt,"__esModule",{value:!0});Rt.GenericBarcode=void 0;var Cc=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),zc=be(),Dc=Pc(zc);function Pc(n){return n&&n.__esModule?n:{default:n}}function Lc(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Mc(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Bc(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Fc=(function(n){Bc(e,n);function e(i,t){return Lc(this,e),Mc(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,i,t))}return Cc(e,[{key:"encode",value:function(){return{data:"10101010101010101010101010101010101010101",text:this.text}}},{key:"valid",value:function(){return!0}}]),e})(Dc.default);Rt.GenericBarcode=Fc});var yn=le(yi=>{"use strict";Object.defineProperty(yi,"__esModule",{value:!0});var Nc=Sr(),It=Ur(),je=nn(),xn=cn(),ot=gn(),jc=vn(),Uc=bn(),qc=_n();yi.default={CODE39:Nc.CODE39,CODE128:It.CODE128,CODE128A:It.CODE128A,CODE128B:It.CODE128B,CODE128C:It.CODE128C,EAN13:je.EAN13,EAN8:je.EAN8,EAN5:je.EAN5,EAN2:je.EAN2,UPC:je.UPC,UPCE:je.UPCE,ITF14:xn.ITF14,ITF:xn.ITF,MSI:ot.MSI,MSI10:ot.MSI10,MSI11:ot.MSI11,MSI1010:ot.MSI1010,MSI1110:ot.MSI1110,pharmacode:jc.pharmacode,codabar:Uc.codabar,GenericBarcode:qc.GenericBarcode}});var lt=le(wi=>{"use strict";Object.defineProperty(wi,"__esModule",{value:!0});var Wc=Object.assign||function(n){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var t in i)Object.prototype.hasOwnProperty.call(i,t)&&(n[t]=i[t])}return n};wi.default=function(n,e){return Wc({},n,e)}});var wn=le(ki=>{"use strict";Object.defineProperty(ki,"__esModule",{value:!0});ki.default=Gc;function Gc(n){var e=[];function i(t){if(Array.isArray(t))for(var r=0;r<t.length;r++)i(t[r]);else t.text=t.text||"",t.data=t.data||"",e.push(t)}return i(n),e}});var kn=le($i=>{"use strict";Object.defineProperty($i,"__esModule",{value:!0});$i.default=Hc;function Hc(n){return n.marginTop=n.marginTop||n.margin,n.marginBottom=n.marginBottom||n.margin,n.marginRight=n.marginRight||n.margin,n.marginLeft=n.marginLeft||n.margin,n}});var Ei=le(Si=>{"use strict";Object.defineProperty(Si,"__esModule",{value:!0});Si.default=Vc;function Vc(n){var e=["width","height","textMargin","fontSize","margin","marginTop","marginBottom","marginLeft","marginRight"];for(var i in e)e.hasOwnProperty(i)&&(i=e[i],typeof n[i]=="string"&&(n[i]=parseInt(n[i],10)));return typeof n.displayValue=="string"&&(n.displayValue=n.displayValue!="false"),n}});var Ti=le(Ai=>{"use strict";Object.defineProperty(Ai,"__esModule",{value:!0});var Zc={width:2,height:100,format:"auto",displayValue:!0,fontOptions:"",font:"monospace",text:void 0,textAlign:"center",textPosition:"bottom",textMargin:2,fontSize:20,background:"#ffffff",lineColor:"#000000",margin:10,marginTop:void 0,marginBottom:void 0,marginLeft:void 0,marginRight:void 0,valid:function(){}};Ai.default=Zc});var En=le(Ri=>{"use strict";Object.defineProperty(Ri,"__esModule",{value:!0});var Xc=Ei(),Kc=Sn(Xc),Qc=Ti(),$n=Sn(Qc);function Sn(n){return n&&n.__esModule?n:{default:n}}function Yc(n){var e={};for(var i in $n.default)$n.default.hasOwnProperty(i)&&(n.hasAttribute("jsbarcode-"+i.toLowerCase())&&(e[i]=n.getAttribute("jsbarcode-"+i.toLowerCase())),n.hasAttribute("data-"+i.toLowerCase())&&(e[i]=n.getAttribute("data-"+i.toLowerCase())));return e.value=n.getAttribute("jsbarcode-value")||n.getAttribute("data-value"),e=(0,Kc.default)(e),e}Ri.default=Yc});var Ii=le(we=>{"use strict";Object.defineProperty(we,"__esModule",{value:!0});we.getTotalWidthOfEncodings=we.calculateEncodingAttributes=we.getBarcodePadding=we.getEncodingHeight=we.getMaximumHeightOfEncodings=void 0;var Jc=lt(),ed=td(Jc);function td(n){return n&&n.__esModule?n:{default:n}}function An(n,e){return e.height+(e.displayValue&&n.text.length>0?e.fontSize+e.textMargin:0)+e.marginTop+e.marginBottom}function Tn(n,e,i){if(i.displayValue&&e<n){if(i.textAlign=="center")return Math.floor((n-e)/2);if(i.textAlign=="left")return 0;if(i.textAlign=="right")return Math.floor(n-e)}return 0}function id(n,e,i){for(var t=0;t<n.length;t++){var r=n[t],a=(0,ed.default)(e,r.options),s;a.displayValue?s=ad(r.text,a,i):s=0;var d=r.data.length*a.width;r.width=Math.ceil(Math.max(s,d)),r.height=An(r,a),r.barcodePadding=Tn(s,d,a)}}function rd(n){for(var e=0,i=0;i<n.length;i++)e+=n[i].width;return e}function nd(n){for(var e=0,i=0;i<n.length;i++)n[i].height>e&&(e=n[i].height);return e}function ad(n,e,i){var t;if(i)t=i;else if(typeof document<"u")t=document.createElement("canvas").getContext("2d");else return 0;t.font=e.fontOptions+" "+e.fontSize+"px "+e.font;var r=t.measureText(n);if(!r)return 0;var a=r.width;return a}we.getMaximumHeightOfEncodings=nd;we.getEncodingHeight=An;we.getBarcodePadding=Tn;we.calculateEncodingAttributes=id;we.getTotalWidthOfEncodings=rd});var Rn=le(Ci=>{"use strict";Object.defineProperty(Ci,"__esModule",{value:!0});var sd=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),od=lt(),ld=cd(od),Oi=Ii();function cd(n){return n&&n.__esModule?n:{default:n}}function dd(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var ud=(function(){function n(e,i,t){dd(this,n),this.canvas=e,this.encodings=i,this.options=t}return sd(n,[{key:"render",value:function(){if(!this.canvas.getContext)throw new Error("The browser does not support canvas.");this.prepareCanvas();for(var i=0;i<this.encodings.length;i++){var t=(0,ld.default)(this.options,this.encodings[i].options);this.drawCanvasBarcode(t,this.encodings[i]),this.drawCanvasText(t,this.encodings[i]),this.moveCanvasDrawing(this.encodings[i])}this.restoreCanvas()}},{key:"prepareCanvas",value:function(){var i=this.canvas.getContext("2d");i.save(),(0,Oi.calculateEncodingAttributes)(this.encodings,this.options,i);var t=(0,Oi.getTotalWidthOfEncodings)(this.encodings),r=(0,Oi.getMaximumHeightOfEncodings)(this.encodings);this.canvas.width=t+this.options.marginLeft+this.options.marginRight,this.canvas.height=r,i.clearRect(0,0,this.canvas.width,this.canvas.height),this.options.background&&(i.fillStyle=this.options.background,i.fillRect(0,0,this.canvas.width,this.canvas.height)),i.translate(this.options.marginLeft,0)}},{key:"drawCanvasBarcode",value:function(i,t){var r=this.canvas.getContext("2d"),a=t.data,s;i.textPosition=="top"?s=i.marginTop+i.fontSize+i.textMargin:s=i.marginTop,r.fillStyle=i.lineColor;for(var d=0;d<a.length;d++){var g=d*i.width+t.barcodePadding;a[d]==="1"?r.fillRect(g,s,i.width,i.height):a[d]&&r.fillRect(g,s,i.width,i.height*a[d])}}},{key:"drawCanvasText",value:function(i,t){var r=this.canvas.getContext("2d"),a=i.fontOptions+" "+i.fontSize+"px "+i.font;if(i.displayValue){var s,d;i.textPosition=="top"?d=i.marginTop+i.fontSize-i.textMargin:d=i.height+i.textMargin+i.marginTop+i.fontSize,r.font=a,i.textAlign=="left"||t.barcodePadding>0?(s=0,r.textAlign="left"):i.textAlign=="right"?(s=t.width-1,r.textAlign="right"):(s=t.width/2,r.textAlign="center"),r.fillText(t.text,s,d)}}},{key:"moveCanvasDrawing",value:function(i){var t=this.canvas.getContext("2d");t.translate(i.width,0)}},{key:"restoreCanvas",value:function(){var i=this.canvas.getContext("2d");i.restore()}}]),n})();Ci.default=ud});var In=le(Di=>{"use strict";Object.defineProperty(Di,"__esModule",{value:!0});var hd=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})(),pd=lt(),fd=md(pd),zi=Ii();function md(n){return n&&n.__esModule?n:{default:n}}function gd(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var Ot="http://www.w3.org/2000/svg",vd=(function(){function n(e,i,t){gd(this,n),this.svg=e,this.encodings=i,this.options=t,this.document=t.xmlDocument||document}return hd(n,[{key:"render",value:function(){var i=this.options.marginLeft;this.prepareSVG();for(var t=0;t<this.encodings.length;t++){var r=this.encodings[t],a=(0,fd.default)(this.options,r.options),s=this.createGroup(i,a.marginTop,this.svg);this.setGroupOptions(s,a),this.drawSvgBarcode(s,a,r),this.drawSVGText(s,a,r),i+=r.width}}},{key:"prepareSVG",value:function(){for(;this.svg.firstChild;)this.svg.removeChild(this.svg.firstChild);(0,zi.calculateEncodingAttributes)(this.encodings,this.options);var i=(0,zi.getTotalWidthOfEncodings)(this.encodings),t=(0,zi.getMaximumHeightOfEncodings)(this.encodings),r=i+this.options.marginLeft+this.options.marginRight;this.setSvgAttributes(r,t),this.options.background&&this.drawRect(0,0,r,t,this.svg).setAttribute("style","fill:"+this.options.background+";")}},{key:"drawSvgBarcode",value:function(i,t,r){var a=r.data,s;t.textPosition=="top"?s=t.fontSize+t.textMargin:s=0;for(var d=0,g=0,x=0;x<a.length;x++)g=x*t.width+r.barcodePadding,a[x]==="1"?d++:d>0&&(this.drawRect(g-t.width*d,s,t.width*d,t.height,i),d=0);d>0&&this.drawRect(g-t.width*(d-1),s,t.width*d,t.height,i)}},{key:"drawSVGText",value:function(i,t,r){var a=this.document.createElementNS(Ot,"text");if(t.displayValue){var s,d;a.setAttribute("style","font:"+t.fontOptions+" "+t.fontSize+"px "+t.font),t.textPosition=="top"?d=t.fontSize-t.textMargin:d=t.height+t.textMargin+t.fontSize,t.textAlign=="left"||r.barcodePadding>0?(s=0,a.setAttribute("text-anchor","start")):t.textAlign=="right"?(s=r.width-1,a.setAttribute("text-anchor","end")):(s=r.width/2,a.setAttribute("text-anchor","middle")),a.setAttribute("x",s),a.setAttribute("y",d),a.appendChild(this.document.createTextNode(r.text)),i.appendChild(a)}}},{key:"setSvgAttributes",value:function(i,t){var r=this.svg;r.setAttribute("width",i+"px"),r.setAttribute("height",t+"px"),r.setAttribute("x","0px"),r.setAttribute("y","0px"),r.setAttribute("viewBox","0 0 "+i+" "+t),r.setAttribute("xmlns",Ot),r.setAttribute("version","1.1"),r.setAttribute("style","transform: translate(0,0)")}},{key:"createGroup",value:function(i,t,r){var a=this.document.createElementNS(Ot,"g");return a.setAttribute("transform","translate("+i+", "+t+")"),r.appendChild(a),a}},{key:"setGroupOptions",value:function(i,t){i.setAttribute("style","fill:"+t.lineColor+";")}},{key:"drawRect",value:function(i,t,r,a,s){var d=this.document.createElementNS(Ot,"rect");return d.setAttribute("x",i),d.setAttribute("y",t),d.setAttribute("width",r),d.setAttribute("height",a),s.appendChild(d),d}}]),n})();Di.default=vd});var On=le(Pi=>{"use strict";Object.defineProperty(Pi,"__esModule",{value:!0});var bd=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})();function _d(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var xd=(function(){function n(e,i,t){_d(this,n),this.object=e,this.encodings=i,this.options=t}return bd(n,[{key:"render",value:function(){this.object.encodings=this.encodings}}]),n})();Pi.default=xd});var Cn=le(Mi=>{"use strict";Object.defineProperty(Mi,"__esModule",{value:!0});var yd=Rn(),wd=Li(yd),kd=In(),$d=Li(kd),Sd=On(),Ed=Li(Sd);function Li(n){return n&&n.__esModule?n:{default:n}}Mi.default={CanvasRenderer:wd.default,SVGRenderer:$d.default,ObjectRenderer:Ed.default}});var ji=le(ct=>{"use strict";Object.defineProperty(ct,"__esModule",{value:!0});function Bi(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function Fi(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n}function Ni(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)}var Ad=(function(n){Ni(e,n);function e(i,t){Bi(this,e);var r=Fi(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return r.name="InvalidInputException",r.symbology=i,r.input=t,r.message='"'+r.input+'" is not a valid input for '+r.symbology,r}return e})(Error),Td=(function(n){Ni(e,n);function e(){Bi(this,e);var i=Fi(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return i.name="InvalidElementException",i.message="Not supported type to render on",i}return e})(Error),Rd=(function(n){Ni(e,n);function e(){Bi(this,e);var i=Fi(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return i.name="NoElementException",i.message="No element to render on.",i}return e})(Error);ct.InvalidInputException=Ad;ct.InvalidElementException=Td;ct.NoElementException=Rd});var Dn=le(Wi=>{"use strict";Object.defineProperty(Wi,"__esModule",{value:!0});var Id=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},Od=En(),Ui=zn(Od),Cd=Cn(),dt=zn(Cd),zd=ji();function zn(n){return n&&n.__esModule?n:{default:n}}function qi(n){if(typeof n=="string")return Dd(n);if(Array.isArray(n)){for(var e=[],i=0;i<n.length;i++)e.push(qi(n[i]));return e}else{if(typeof HTMLCanvasElement<"u"&&n instanceof HTMLImageElement)return Pd(n);if(n&&n.nodeName&&n.nodeName.toLowerCase()==="svg"||typeof SVGElement<"u"&&n instanceof SVGElement)return{element:n,options:(0,Ui.default)(n),renderer:dt.default.SVGRenderer};if(typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement)return{element:n,options:(0,Ui.default)(n),renderer:dt.default.CanvasRenderer};if(n&&n.getContext)return{element:n,renderer:dt.default.CanvasRenderer};if(n&&(typeof n>"u"?"undefined":Id(n))==="object"&&!n.nodeName)return{element:n,renderer:dt.default.ObjectRenderer};throw new zd.InvalidElementException}}function Dd(n){var e=document.querySelectorAll(n);if(e.length!==0){for(var i=[],t=0;t<e.length;t++)i.push(qi(e[t]));return i}}function Pd(n){var e=document.createElement("canvas");return{element:e,options:(0,Ui.default)(n),renderer:dt.default.CanvasRenderer,afterRender:function(){n.setAttribute("src",e.toDataURL())}}}Wi.default=qi});var Pn=le(Gi=>{"use strict";Object.defineProperty(Gi,"__esModule",{value:!0});var Ld=(function(){function n(e,i){for(var t=0;t<i.length;t++){var r=i[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,i,t){return i&&n(e.prototype,i),t&&n(e,t),e}})();function Md(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var Bd=(function(){function n(e){Md(this,n),this.api=e}return Ld(n,[{key:"handleCatch",value:function(i){if(i.name==="InvalidInputException")if(this.api._options.valid!==this.api._defaults.valid)this.api._options.valid(!1);else throw i.message;else throw i;this.api.render=function(){}}},{key:"wrapBarcodeCall",value:function(i){try{var t=i.apply(void 0,arguments);return this.api._options.valid(!0),t}catch(r){return this.handleCatch(r),this.api}}}]),n})();Gi.default=Bd});var qn=le((sp,Un)=>{"use strict";var Fd=yn(),Ce=Oe(Fd),Nd=lt(),ut=Oe(Nd),jd=wn(),Mn=Oe(jd),Ud=kn(),Ln=Oe(Ud),qd=Dn(),Wd=Oe(qd),Gd=Ei(),Hd=Oe(Gd),Vd=Pn(),Zd=Oe(Vd),Bn=ji(),Xd=Ti(),Fn=Oe(Xd);function Oe(n){return n&&n.__esModule?n:{default:n}}var Ae=function(){},Ct=function(e,i,t){var r=new Ae;if(typeof e>"u")throw Error("No element to render on was provided.");return r._renderProperties=(0,Wd.default)(e),r._encodings=[],r._options=Fn.default,r._errorHandler=new Zd.default(r),typeof i<"u"&&(t=t||{},t.format||(t.format=jn()),r.options(t)[t.format](i,t).render()),r};Ct.getModule=function(n){return Ce.default[n]};for(Hi in Ce.default)Ce.default.hasOwnProperty(Hi)&&Kd(Ce.default,Hi);var Hi;function Kd(n,e){Ae.prototype[e]=Ae.prototype[e.toUpperCase()]=Ae.prototype[e.toLowerCase()]=function(i,t){var r=this;return r._errorHandler.wrapBarcodeCall(function(){t.text=typeof t.text>"u"?void 0:""+t.text;var a=(0,ut.default)(r._options,t);a=(0,Hd.default)(a);var s=n[e],d=Nn(i,s,a);return r._encodings.push(d),r})}}function Nn(n,e,i){n=""+n;var t=new e(n,i);if(!t.valid())throw new Bn.InvalidInputException(t.constructor.name,n);var r=t.encode();r=(0,Mn.default)(r);for(var a=0;a<r.length;a++)r[a].options=(0,ut.default)(i,r[a].options);return r}function jn(){return Ce.default.CODE128?"CODE128":Object.keys(Ce.default)[0]}Ae.prototype.options=function(n){return this._options=(0,ut.default)(this._options,n),this};Ae.prototype.blank=function(n){var e=new Array(n+1).join("0");return this._encodings.push({data:e}),this};Ae.prototype.init=function(){if(this._renderProperties){Array.isArray(this._renderProperties)||(this._renderProperties=[this._renderProperties]);var n;for(var e in this._renderProperties){n=this._renderProperties[e];var i=(0,ut.default)(this._options,n.options);i.format=="auto"&&(i.format=jn()),this._errorHandler.wrapBarcodeCall(function(){var t=i.value,r=Ce.default[i.format.toUpperCase()],a=Nn(t,r,i);Vi(n,a,i)})}}};Ae.prototype.render=function(){if(!this._renderProperties)throw new Bn.NoElementException;if(Array.isArray(this._renderProperties))for(var n=0;n<this._renderProperties.length;n++)Vi(this._renderProperties[n],this._encodings,this._options);else Vi(this._renderProperties,this._encodings,this._options);return this};Ae.prototype._defaults=Fn.default;function Vi(n,e,i){e=(0,Mn.default)(e);for(var t=0;t<e.length;t++)e[t].options=(0,ut.default)(i,e[t].options),(0,Ln.default)(e[t].options);(0,Ln.default)(i);var r=n.renderer,a=new r(n.element,e,i);a.render(),n.afterRender&&n.afterRender()}typeof window<"u"&&(window.JsBarcode=Ct);typeof jQuery<"u"&&(jQuery.fn.JsBarcode=function(n,e){var i=[];return jQuery(this).each(function(){i.push(this)}),Ct(i,n,e)});Un.exports=Ct});var Vn=le((Gn,Hn)=>{var Wn=(function(){var n=function(A,k){var z=236,O=17,I=A,R=i[k],S=null,T=0,f=null,E=[],l={},P=function(q,j){T=I*4+17,S=(function(L){for(var G=new Array(L),H=0;H<L;H+=1){G[H]=new Array(L);for(var ee=0;ee<L;ee+=1)G[H][ee]=null}return G})(T),Q(0,0),Q(T-7,0),Q(0,T-7),Z(),re(),N(q,j),I>=7&&ae(q),f==null&&(f=ie(I,R,E)),B(f,j)},Q=function(q,j){for(var L=-1;L<=7;L+=1)if(!(q+L<=-1||T<=q+L))for(var G=-1;G<=7;G+=1)j+G<=-1||T<=j+G||(0<=L&&L<=6&&(G==0||G==6)||0<=G&&G<=6&&(L==0||L==6)||2<=L&&L<=4&&2<=G&&G<=4?S[q+L][j+G]=!0:S[q+L][j+G]=!1)},W=function(){for(var q=0,j=0,L=0;L<8;L+=1){P(!0,L);var G=r.getLostPoint(l);(L==0||q>G)&&(q=G,j=L)}return j},re=function(){for(var q=8;q<T-8;q+=1)S[q][6]==null&&(S[q][6]=q%2==0);for(var j=8;j<T-8;j+=1)S[6][j]==null&&(S[6][j]=j%2==0)},Z=function(){for(var q=r.getPatternPosition(I),j=0;j<q.length;j+=1)for(var L=0;L<q.length;L+=1){var G=q[j],H=q[L];if(S[G][H]==null)for(var ee=-2;ee<=2;ee+=1)for(var ne=-2;ne<=2;ne+=1)ee==-2||ee==2||ne==-2||ne==2||ee==0&&ne==0?S[G+ee][H+ne]=!0:S[G+ee][H+ne]=!1}},ae=function(q){for(var j=r.getBCHTypeNumber(I),L=0;L<18;L+=1){var G=!q&&(j>>L&1)==1;S[Math.floor(L/3)][L%3+T-8-3]=G}for(var L=0;L<18;L+=1){var G=!q&&(j>>L&1)==1;S[L%3+T-8-3][Math.floor(L/3)]=G}},N=function(q,j){for(var L=R<<3|j,G=r.getBCHTypeInfo(L),H=0;H<15;H+=1){var ee=!q&&(G>>H&1)==1;H<6?S[H][8]=ee:H<8?S[H+1][8]=ee:S[T-15+H][8]=ee}for(var H=0;H<15;H+=1){var ee=!q&&(G>>H&1)==1;H<8?S[8][T-H-1]=ee:H<9?S[8][15-H-1+1]=ee:S[8][15-H-1]=ee}S[T-8][8]=!q},B=function(q,j){for(var L=-1,G=T-1,H=7,ee=0,ne=r.getMaskFunction(j),o=T-1;o>0;o-=2)for(o==6&&(o-=1);;){for(var U=0;U<2;U+=1)if(S[G][o-U]==null){var F=!1;ee<q.length&&(F=(q[ee]>>>H&1)==1);var m=ne(G,o-U);m&&(F=!F),S[G][o-U]=F,H-=1,H==-1&&(ee+=1,H=7)}if(G+=L,G<0||T<=G){G-=L,L=-L;break}}},se=function(q,j){for(var L=0,G=0,H=0,ee=new Array(j.length),ne=new Array(j.length),o=0;o<j.length;o+=1){var U=j[o].dataCount,F=j[o].totalCount-U;G=Math.max(G,U),H=Math.max(H,F),ee[o]=new Array(U);for(var m=0;m<ee[o].length;m+=1)ee[o][m]=255&q.getBuffer()[m+L];L+=U;var b=r.getErrorCorrectPolynomial(F),D=s(ee[o],b.getLength()-1),V=D.mod(b);ne[o]=new Array(b.getLength()-1);for(var m=0;m<ne[o].length;m+=1){var X=m+V.getLength()-ne[o].length;ne[o][m]=X>=0?V.getAt(X):0}}for(var M=0,m=0;m<j.length;m+=1)M+=j[m].totalCount;for(var K=new Array(M),te=0,m=0;m<G;m+=1)for(var o=0;o<j.length;o+=1)m<ee[o].length&&(K[te]=ee[o][m],te+=1);for(var m=0;m<H;m+=1)for(var o=0;o<j.length;o+=1)m<ne[o].length&&(K[te]=ne[o][m],te+=1);return K},ie=function(q,j,L){for(var G=d.getRSBlocks(q,j),H=g(),ee=0;ee<L.length;ee+=1){var ne=L[ee];H.put(ne.getMode(),4),H.put(ne.getLength(),r.getLengthInBits(ne.getMode(),q)),ne.write(H)}for(var o=0,ee=0;ee<G.length;ee+=1)o+=G[ee].dataCount;if(H.getLengthInBits()>o*8)throw"code length overflow. ("+H.getLengthInBits()+">"+o*8+")";for(H.getLengthInBits()+4<=o*8&&H.put(0,4);H.getLengthInBits()%8!=0;)H.putBit(!1);for(;!(H.getLengthInBits()>=o*8||(H.put(z,8),H.getLengthInBits()>=o*8));)H.put(O,8);return se(H,G)};l.addData=function(q,j){j=j||"Byte";var L=null;switch(j){case"Numeric":L=x(q);break;case"Alphanumeric":L=$(q);break;case"Byte":L=p(q);break;case"Kanji":L=y(q);break;default:throw"mode:"+j}E.push(L),f=null},l.isDark=function(q,j){if(q<0||T<=q||j<0||T<=j)throw q+","+j;return S[q][j]},l.getModuleCount=function(){return T},l.make=function(){if(I<1){for(var q=1;q<40;q++){for(var j=d.getRSBlocks(q,R),L=g(),G=0;G<E.length;G++){var H=E[G];L.put(H.getMode(),4),L.put(H.getLength(),r.getLengthInBits(H.getMode(),q)),H.write(L)}for(var ee=0,G=0;G<j.length;G++)ee+=j[G].dataCount;if(L.getLengthInBits()<=ee*8)break}I=q}P(!1,W())},l.createTableTag=function(q,j){q=q||2,j=typeof j>"u"?q*4:j;var L="";L+='<table style="',L+=" border-width: 0px; border-style: none;",L+=" border-collapse: collapse;",L+=" padding: 0px; margin: "+j+"px;",L+='">',L+="<tbody>";for(var G=0;G<l.getModuleCount();G+=1){L+="<tr>";for(var H=0;H<l.getModuleCount();H+=1)L+='<td style="',L+=" border-width: 0px; border-style: none;",L+=" border-collapse: collapse;",L+=" padding: 0px; margin: 0px;",L+=" width: "+q+"px;",L+=" height: "+q+"px;",L+=" background-color: ",L+=l.isDark(G,H)?"#000000":"#ffffff",L+=";",L+='"/>';L+="</tr>"}return L+="</tbody>",L+="</table>",L},l.createSvgTag=function(q,j,L,G){var H={};typeof arguments[0]=="object"&&(H=arguments[0],q=H.cellSize,j=H.margin,L=H.alt,G=H.title),q=q||2,j=typeof j>"u"?q*4:j,L=typeof L=="string"?{text:L}:L||{},L.text=L.text||null,L.id=L.text?L.id||"qrcode-description":null,G=typeof G=="string"?{text:G}:G||{},G.text=G.text||null,G.id=G.text?G.id||"qrcode-title":null;var ee=l.getModuleCount()*q+j*2,ne,o,U,F,m="",b;for(b="l"+q+",0 0,"+q+" -"+q+",0 0,-"+q+"z ",m+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',m+=H.scalable?"":' width="'+ee+'px" height="'+ee+'px"',m+=' viewBox="0 0 '+ee+" "+ee+'" ',m+=' preserveAspectRatio="xMinYMin meet"',m+=G.text||L.text?' role="img" aria-labelledby="'+Y([G.id,L.id].join(" ").trim())+'"':"",m+=">",m+=G.text?'<title id="'+Y(G.id)+'">'+Y(G.text)+"</title>":"",m+=L.text?'<description id="'+Y(L.id)+'">'+Y(L.text)+"</description>":"",m+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',m+='<path d="',U=0;U<l.getModuleCount();U+=1)for(F=U*q+j,ne=0;ne<l.getModuleCount();ne+=1)l.isDark(U,ne)&&(o=ne*q+j,m+="M"+o+","+F+b);return m+='" stroke="transparent" fill="black"/>',m+="</svg>",m},l.createDataURL=function(q,j){q=q||2,j=typeof j>"u"?q*4:j;var L=l.getModuleCount()*q+j*2,G=j,H=L-j;return C(L,L,function(ee,ne){if(G<=ee&&ee<H&&G<=ne&&ne<H){var o=Math.floor((ee-G)/q),U=Math.floor((ne-G)/q);return l.isDark(U,o)?0:1}else return 1})},l.createImgTag=function(q,j,L){q=q||2,j=typeof j>"u"?q*4:j;var G=l.getModuleCount()*q+j*2,H="";return H+="<img",H+=' src="',H+=l.createDataURL(q,j),H+='"',H+=' width="',H+=G,H+='"',H+=' height="',H+=G,H+='"',L&&(H+=' alt="',H+=Y(L),H+='"'),H+="/>",H};var Y=function(q){for(var j="",L=0;L<q.length;L+=1){var G=q.charAt(L);switch(G){case"<":j+="&lt;";break;case">":j+="&gt;";break;case"&":j+="&amp;";break;case'"':j+="&quot;";break;default:j+=G;break}}return j},he=function(q){var j=1;q=typeof q>"u"?j*2:q;var L=l.getModuleCount()*j+q*2,G=q,H=L-q,ee,ne,o,U,F,m={"\u2588\u2588":"\u2588","\u2588 ":"\u2580"," \u2588":"\u2584","  ":" "},b={"\u2588\u2588":"\u2580","\u2588 ":"\u2580"," \u2588":" ","  ":" "},D="";for(ee=0;ee<L;ee+=2){for(o=Math.floor((ee-G)/j),U=Math.floor((ee+1-G)/j),ne=0;ne<L;ne+=1)F="\u2588",G<=ne&&ne<H&&G<=ee&&ee<H&&l.isDark(o,Math.floor((ne-G)/j))&&(F=" "),G<=ne&&ne<H&&G<=ee+1&&ee+1<H&&l.isDark(U,Math.floor((ne-G)/j))?F+=" ":F+="\u2588",D+=q<1&&ee+1>=H?b[F]:m[F];D+=`
`}return L%2&&q>0?D.substring(0,D.length-L-1)+Array(L+1).join("\u2580"):D.substring(0,D.length-1)};return l.createASCII=function(q,j){if(q=q||1,q<2)return he(j);q-=1,j=typeof j>"u"?q*2:j;var L=l.getModuleCount()*q+j*2,G=j,H=L-j,ee,ne,o,U,F=Array(q+1).join("\u2588\u2588"),m=Array(q+1).join("  "),b="",D="";for(ee=0;ee<L;ee+=1){for(o=Math.floor((ee-G)/q),D="",ne=0;ne<L;ne+=1)U=1,G<=ne&&ne<H&&G<=ee&&ee<H&&l.isDark(o,Math.floor((ne-G)/q))&&(U=0),D+=U?F:m;for(o=0;o<q;o+=1)b+=D+`
`}return b.substring(0,b.length-1)},l.renderTo2dContext=function(q,j){j=j||2;for(var L=l.getModuleCount(),G=0;G<L;G++)for(var H=0;H<L;H++)q.fillStyle=l.isDark(G,H)?"black":"white",q.fillRect(G*j,H*j,j,j)},l};n.stringToBytesFuncs={default:function(A){for(var k=[],z=0;z<A.length;z+=1){var O=A.charCodeAt(z);k.push(O&255)}return k}},n.stringToBytes=n.stringToBytesFuncs.default,n.createStringToBytes=function(A,k){var z=(function(){for(var I=v(A),R=function(){var re=I.read();if(re==-1)throw"eof";return re},S=0,T={};;){var f=I.read();if(f==-1)break;var E=R(),l=R(),P=R(),Q=String.fromCharCode(f<<8|E),W=l<<8|P;T[Q]=W,S+=1}if(S!=k)throw S+" != "+k;return T})(),O=63;return function(I){for(var R=[],S=0;S<I.length;S+=1){var T=I.charCodeAt(S);if(T<128)R.push(T);else{var f=z[I.charAt(S)];typeof f=="number"?(f&255)==f?R.push(f):(R.push(f>>>8),R.push(f&255)):R.push(O)}}return R}};var e={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},i={L:1,M:0,Q:3,H:2},t={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},r=(function(){var A=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],k=1335,z=7973,O=21522,I={},R=function(S){for(var T=0;S!=0;)T+=1,S>>>=1;return T};return I.getBCHTypeInfo=function(S){for(var T=S<<10;R(T)-R(k)>=0;)T^=k<<R(T)-R(k);return(S<<10|T)^O},I.getBCHTypeNumber=function(S){for(var T=S<<12;R(T)-R(z)>=0;)T^=z<<R(T)-R(z);return S<<12|T},I.getPatternPosition=function(S){return A[S-1]},I.getMaskFunction=function(S){switch(S){case t.PATTERN000:return function(T,f){return(T+f)%2==0};case t.PATTERN001:return function(T,f){return T%2==0};case t.PATTERN010:return function(T,f){return f%3==0};case t.PATTERN011:return function(T,f){return(T+f)%3==0};case t.PATTERN100:return function(T,f){return(Math.floor(T/2)+Math.floor(f/3))%2==0};case t.PATTERN101:return function(T,f){return T*f%2+T*f%3==0};case t.PATTERN110:return function(T,f){return(T*f%2+T*f%3)%2==0};case t.PATTERN111:return function(T,f){return(T*f%3+(T+f)%2)%2==0};default:throw"bad maskPattern:"+S}},I.getErrorCorrectPolynomial=function(S){for(var T=s([1],0),f=0;f<S;f+=1)T=T.multiply(s([1,a.gexp(f)],0));return T},I.getLengthInBits=function(S,T){if(1<=T&&T<10)switch(S){case e.MODE_NUMBER:return 10;case e.MODE_ALPHA_NUM:return 9;case e.MODE_8BIT_BYTE:return 8;case e.MODE_KANJI:return 8;default:throw"mode:"+S}else if(T<27)switch(S){case e.MODE_NUMBER:return 12;case e.MODE_ALPHA_NUM:return 11;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 10;default:throw"mode:"+S}else if(T<41)switch(S){case e.MODE_NUMBER:return 14;case e.MODE_ALPHA_NUM:return 13;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 12;default:throw"mode:"+S}else throw"type:"+T},I.getLostPoint=function(S){for(var T=S.getModuleCount(),f=0,E=0;E<T;E+=1)for(var l=0;l<T;l+=1){for(var P=0,Q=S.isDark(E,l),W=-1;W<=1;W+=1)if(!(E+W<0||T<=E+W))for(var re=-1;re<=1;re+=1)l+re<0||T<=l+re||W==0&&re==0||Q==S.isDark(E+W,l+re)&&(P+=1);P>5&&(f+=3+P-5)}for(var E=0;E<T-1;E+=1)for(var l=0;l<T-1;l+=1){var Z=0;S.isDark(E,l)&&(Z+=1),S.isDark(E+1,l)&&(Z+=1),S.isDark(E,l+1)&&(Z+=1),S.isDark(E+1,l+1)&&(Z+=1),(Z==0||Z==4)&&(f+=3)}for(var E=0;E<T;E+=1)for(var l=0;l<T-6;l+=1)S.isDark(E,l)&&!S.isDark(E,l+1)&&S.isDark(E,l+2)&&S.isDark(E,l+3)&&S.isDark(E,l+4)&&!S.isDark(E,l+5)&&S.isDark(E,l+6)&&(f+=40);for(var l=0;l<T;l+=1)for(var E=0;E<T-6;E+=1)S.isDark(E,l)&&!S.isDark(E+1,l)&&S.isDark(E+2,l)&&S.isDark(E+3,l)&&S.isDark(E+4,l)&&!S.isDark(E+5,l)&&S.isDark(E+6,l)&&(f+=40);for(var ae=0,l=0;l<T;l+=1)for(var E=0;E<T;E+=1)S.isDark(E,l)&&(ae+=1);var N=Math.abs(100*ae/T/T-50)/5;return f+=N*10,f},I})(),a=(function(){for(var A=new Array(256),k=new Array(256),z=0;z<8;z+=1)A[z]=1<<z;for(var z=8;z<256;z+=1)A[z]=A[z-4]^A[z-5]^A[z-6]^A[z-8];for(var z=0;z<255;z+=1)k[A[z]]=z;var O={};return O.glog=function(I){if(I<1)throw"glog("+I+")";return k[I]},O.gexp=function(I){for(;I<0;)I+=255;for(;I>=256;)I-=255;return A[I]},O})();function s(A,k){if(typeof A.length>"u")throw A.length+"/"+k;var z=(function(){for(var I=0;I<A.length&&A[I]==0;)I+=1;for(var R=new Array(A.length-I+k),S=0;S<A.length-I;S+=1)R[S]=A[S+I];return R})(),O={};return O.getAt=function(I){return z[I]},O.getLength=function(){return z.length},O.multiply=function(I){for(var R=new Array(O.getLength()+I.getLength()-1),S=0;S<O.getLength();S+=1)for(var T=0;T<I.getLength();T+=1)R[S+T]^=a.gexp(a.glog(O.getAt(S))+a.glog(I.getAt(T)));return s(R,0)},O.mod=function(I){if(O.getLength()-I.getLength()<0)return O;for(var R=a.glog(O.getAt(0))-a.glog(I.getAt(0)),S=new Array(O.getLength()),T=0;T<O.getLength();T+=1)S[T]=O.getAt(T);for(var T=0;T<I.getLength();T+=1)S[T]^=a.gexp(a.glog(I.getAt(T))+R);return s(S,0).mod(I)},O}var d=(function(){var A=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],k=function(I,R){var S={};return S.totalCount=I,S.dataCount=R,S},z={},O=function(I,R){switch(R){case i.L:return A[(I-1)*4+0];case i.M:return A[(I-1)*4+1];case i.Q:return A[(I-1)*4+2];case i.H:return A[(I-1)*4+3];default:return}};return z.getRSBlocks=function(I,R){var S=O(I,R);if(typeof S>"u")throw"bad rs block @ typeNumber:"+I+"/errorCorrectionLevel:"+R;for(var T=S.length/3,f=[],E=0;E<T;E+=1)for(var l=S[E*3+0],P=S[E*3+1],Q=S[E*3+2],W=0;W<l;W+=1)f.push(k(P,Q));return f},z})(),g=function(){var A=[],k=0,z={};return z.getBuffer=function(){return A},z.getAt=function(O){var I=Math.floor(O/8);return(A[I]>>>7-O%8&1)==1},z.put=function(O,I){for(var R=0;R<I;R+=1)z.putBit((O>>>I-R-1&1)==1)},z.getLengthInBits=function(){return k},z.putBit=function(O){var I=Math.floor(k/8);A.length<=I&&A.push(0),O&&(A[I]|=128>>>k%8),k+=1},z},x=function(A){var k=e.MODE_NUMBER,z=A,O={};O.getMode=function(){return k},O.getLength=function(S){return z.length},O.write=function(S){for(var T=z,f=0;f+2<T.length;)S.put(I(T.substring(f,f+3)),10),f+=3;f<T.length&&(T.length-f==1?S.put(I(T.substring(f,f+1)),4):T.length-f==2&&S.put(I(T.substring(f,f+2)),7))};var I=function(S){for(var T=0,f=0;f<S.length;f+=1)T=T*10+R(S.charAt(f));return T},R=function(S){if("0"<=S&&S<="9")return S.charCodeAt(0)-48;throw"illegal char :"+S};return O},$=function(A){var k=e.MODE_ALPHA_NUM,z=A,O={};O.getMode=function(){return k},O.getLength=function(R){return z.length},O.write=function(R){for(var S=z,T=0;T+1<S.length;)R.put(I(S.charAt(T))*45+I(S.charAt(T+1)),11),T+=2;T<S.length&&R.put(I(S.charAt(T)),6)};var I=function(R){if("0"<=R&&R<="9")return R.charCodeAt(0)-48;if("A"<=R&&R<="Z")return R.charCodeAt(0)-65+10;switch(R){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+R}};return O},p=function(A){var k=e.MODE_8BIT_BYTE,z=A,O=n.stringToBytes(A),I={};return I.getMode=function(){return k},I.getLength=function(R){return O.length},I.write=function(R){for(var S=0;S<O.length;S+=1)R.put(O[S],8)},I},y=function(A){var k=e.MODE_KANJI,z=A,O=n.stringToBytesFuncs.SJIS;if(!O)throw"sjis not supported.";(function(S,T){var f=O(S);if(f.length!=2||(f[0]<<8|f[1])!=T)throw"sjis not supported."})("\u53CB",38726);var I=O(A),R={};return R.getMode=function(){return k},R.getLength=function(S){return~~(I.length/2)},R.write=function(S){for(var T=I,f=0;f+1<T.length;){var E=(255&T[f])<<8|255&T[f+1];if(33088<=E&&E<=40956)E-=33088;else if(57408<=E&&E<=60351)E-=49472;else throw"illegal char at "+(f+1)+"/"+E;E=(E>>>8&255)*192+(E&255),S.put(E,13),f+=2}if(f<T.length)throw"illegal char at "+(f+1)},R},h=function(){var A=[],k={};return k.writeByte=function(z){A.push(z&255)},k.writeShort=function(z){k.writeByte(z),k.writeByte(z>>>8)},k.writeBytes=function(z,O,I){O=O||0,I=I||z.length;for(var R=0;R<I;R+=1)k.writeByte(z[R+O])},k.writeString=function(z){for(var O=0;O<z.length;O+=1)k.writeByte(z.charCodeAt(O))},k.toByteArray=function(){return A},k.toString=function(){var z="";z+="[";for(var O=0;O<A.length;O+=1)O>0&&(z+=","),z+=A[O];return z+="]",z},k},_=function(){var A=0,k=0,z=0,O="",I={},R=function(T){O+=String.fromCharCode(S(T&63))},S=function(T){if(!(T<0)){if(T<26)return 65+T;if(T<52)return 97+(T-26);if(T<62)return 48+(T-52);if(T==62)return 43;if(T==63)return 47}throw"n:"+T};return I.writeByte=function(T){for(A=A<<8|T&255,k+=8,z+=1;k>=6;)R(A>>>k-6),k-=6},I.flush=function(){if(k>0&&(R(A<<6-k),A=0,k=0),z%3!=0)for(var T=3-z%3,f=0;f<T;f+=1)O+="="},I.toString=function(){return O},I},v=function(A){var k=A,z=0,O=0,I=0,R={};R.read=function(){for(;I<8;){if(z>=k.length){if(I==0)return-1;throw"unexpected end of file./"+I}var T=k.charAt(z);if(z+=1,T=="=")return I=0,-1;if(T.match(/^\s$/))continue;O=O<<6|S(T.charCodeAt(0)),I+=6}var f=O>>>I-8&255;return I-=8,f};var S=function(T){if(65<=T&&T<=90)return T-65;if(97<=T&&T<=122)return T-97+26;if(48<=T&&T<=57)return T-48+52;if(T==43)return 62;if(T==47)return 63;throw"c:"+T};return R},w=function(A,k){var z=A,O=k,I=new Array(A*k),R={};R.setPixel=function(E,l,P){I[l*z+E]=P},R.write=function(E){E.writeString("GIF87a"),E.writeShort(z),E.writeShort(O),E.writeByte(128),E.writeByte(0),E.writeByte(0),E.writeByte(0),E.writeByte(0),E.writeByte(0),E.writeByte(255),E.writeByte(255),E.writeByte(255),E.writeString(","),E.writeShort(0),E.writeShort(0),E.writeShort(z),E.writeShort(O),E.writeByte(0);var l=2,P=T(l);E.writeByte(l);for(var Q=0;P.length-Q>255;)E.writeByte(255),E.writeBytes(P,Q,255),Q+=255;E.writeByte(P.length-Q),E.writeBytes(P,Q,P.length-Q),E.writeByte(0),E.writeString(";")};var S=function(E){var l=E,P=0,Q=0,W={};return W.write=function(re,Z){if(re>>>Z)throw"length over";for(;P+Z>=8;)l.writeByte(255&(re<<P|Q)),Z-=8-P,re>>>=8-P,Q=0,P=0;Q=re<<P|Q,P=P+Z},W.flush=function(){P>0&&l.writeByte(Q)},W},T=function(E){for(var l=1<<E,P=(1<<E)+1,Q=E+1,W=f(),re=0;re<l;re+=1)W.add(String.fromCharCode(re));W.add(String.fromCharCode(l)),W.add(String.fromCharCode(P));var Z=h(),ae=S(Z);ae.write(l,Q);var N=0,B=String.fromCharCode(I[N]);for(N+=1;N<I.length;){var se=String.fromCharCode(I[N]);N+=1,W.contains(B+se)?B=B+se:(ae.write(W.indexOf(B),Q),W.size()<4095&&(W.size()==1<<Q&&(Q+=1),W.add(B+se)),B=se)}return ae.write(W.indexOf(B),Q),ae.write(P,Q),ae.flush(),Z.toByteArray()},f=function(){var E={},l=0,P={};return P.add=function(Q){if(P.contains(Q))throw"dup key:"+Q;E[Q]=l,l+=1},P.size=function(){return l},P.indexOf=function(Q){return E[Q]},P.contains=function(Q){return typeof E[Q]<"u"},P};return R},C=function(A,k,z){for(var O=w(A,k),I=0;I<k;I+=1)for(var R=0;R<A;R+=1)O.setPixel(R,I,z(R,I));var S=h();O.write(S);for(var T=_(),f=S.toByteArray(),E=0;E<f.length;E+=1)T.writeByte(f[E]);return T.flush(),"data:image/gif;base64,"+T};return n})();(function(){Wn.stringToBytesFuncs["UTF-8"]=function(n){function e(i){for(var t=[],r=0;r<i.length;r++){var a=i.charCodeAt(r);a<128?t.push(a):a<2048?t.push(192|a>>6,128|a&63):a<55296||a>=57344?t.push(224|a>>12,128|a>>6&63,128|a&63):(r++,a=65536+((a&1023)<<10|i.charCodeAt(r)&1023),t.push(240|a>>18,128|a>>12&63,128|a>>6&63,128|a&63))}return t}return e(n)}})();(function(n){typeof define=="function"&&define.amd?define([],n):typeof Gn=="object"&&(Hn.exports=n())})(function(){return Wn})});var aa={"\xBD":.5,"\xBC":.25,"\xBE":.75,"\u2153":.3333333333333333,"\u2154":.6666666666666666,"\u215B":.125,"\u215C":.375,"\u215D":.625,"\u215E":.875};function Ve(n){if(n==null)return null;let e=String(n).trim().replace(",","."),i,t=e.match(/^(\d+)?\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/),r=e.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);if(t)i=Number(t[1]||0)+aa[t[2]];else if(r){if(Number(r[3])===0)return null;i=Number(r[1]||0)+Number(r[2])/Number(r[3])}else if(/^\d+(?:\.\d+)?$/.test(e))i=Number(e);else return null;return Number.isFinite(i)&&i>=0&&i<=1e6?i:null}function ar(n,e){let i=Ve(n);if(i===null||!Number.isFinite(e)||e<=0||e>1e4)return n;let t=i*e;return!Number.isFinite(t)||t>1e10?n:String(Number(t.toFixed(4)))}var sa=/^[½¼¾⅓⅔⅛⅜⅝⅞\d][\d.,/½¼¾⅓⅔⅛⅜⅝⅞\s]*\s*(?:tsp|tbsp|tablespoons?|teaspoons?|cups?|oz|lbs?|g|kg|ml|cl|dl|L|(?:milli|centi|deci)?lit(?:re|er)s?|kilo(?:gramme|gram)s?|(?:gramme|gram)s?|pints?|quarts?|gallons?|fl\.?\s*oz|cans?|bunches?|heads?|cloves?|slices?|pieces?|sheets?|pinch(?:es)?|dash(?:es)?|handfuls?|sprigs?|stalks?)\s*/i;function sr(n){return n.amount||n.unit?n.name:n.name.replace(sa,"").trim()||n.name}function oa(n,e){return!n.amount&&!n.unit?n.name:[n.amount,n.unit,e].filter(Boolean).join(" ")}function la(n,e,i){return`[RM] ${n} \u2014 ${oa(e,i)}`}var mt=class{constructor(e){this.hass=e}subscribe(e){return this.hass.connection.subscribeMessage(e,{type:"recipe_manager/subscribe"})}async getAllRecipes(){return this.hass.callWS({type:"recipe_manager/recipes/get_all"})}async getRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/get",recipe_id:e})}async scrapeRecipe(e,i=!1){return this.hass.callWS({type:"recipe_manager/recipes/scrape",url:e,enabled:i})}async addRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/add",...e})}async updateRecipe(e,i){return this.hass.callWS({type:"recipe_manager/recipes/update",recipe_id:e,...i})}async deleteRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/delete",recipe_id:e})}async toggleFavourite(e){return this.hass.callWS({type:"recipe_manager/recipes/toggle_favourite",recipe_id:e})}async downloadRecipeImage(e,i){if(!window.confirm("Allow MacroMate to download and privately normalize this remote image?"))throw{code:"invalid_request"};return this.hass.callWS({type:"recipe_manager/recipes/download_image",recipe_id:e,image_url:i,enabled:!0})}async getTags(){return this.hass.callWS({type:"recipe_manager/tags/get_all"})}async getMealPlan(e){let i={type:"recipe_manager/meal_plan/get"};return e&&(i.week_start=e),this.hass.callWS(i)}async addToMealPlan(e,i,t,r=1,a=null){let s={type:"recipe_manager/meal_plan/add",recipe_id:e,date:i,meal_type:t,servings:r};return a&&(s.notes=a),this.hass.callWS(s)}async removeFromMealPlan(e){return this.hass.callWS({type:"recipe_manager/meal_plan/remove",entry_id:e})}async clearMealPlanWeek(e){return this.hass.callWS({type:"recipe_manager/meal_plan/clear",week_start:e,confirm:!0})}async addIngredientsToShoppingList(e,i,t=null){let r=i.map(s=>{let g=(s.amount===null||s.amount===void 0||s.amount==="")&&(!s.unit||s.unit==="units")?1:Ve(s.amount);if(g===null||g<=0)throw new Error("Ingredient quantity is ambiguous or invalid. Use the atomic recipe transfer or an explicit quantity.");let x=s.product_name??sr(s),$={type:"shopping_list_manager/items/add",list_id:e,name:x,quantity:g,unit:s.unit||"units"};return s.product_id&&($.product_id=s.product_id),s.category_id&&($.category_id=s.category_id),t&&($.note=la(t,s,sr(s))),$}),a=[];for(let s of r){let d=await this.hass.callWS(s);a.push({success:!0,name:s.name,result:d})}return a}async recipeToShopping(e,i,t,r,a=[]){if(a.length&&!this.transport.actions.recipe_to_shopping?.schema?.properties?.ingredient_matches)throw new Error("The server does not support exact catalog matching. Update MacroMate before transferring matched ingredients.");let s={recipe_id:e,list_id:i,servings:t,ingredient_indexes:r};return a.length&&(s.ingredient_matches=a),this.transport.call("recipe_to_shopping",s)}async updateSlmItem(e,i){return this.hass.callWS({type:"shopping_list_manager/items/update",item_id:e,...i})}async getShoppingLists(){return this.hass.callWS({type:"shopping_list_manager/lists/get_all"})}async getSlmItems(e){return this.hass.callWS({type:"shopping_list_manager/items/get",list_id:e})}async checkSlmItem(e,i){return this.hass.callWS({type:"shopping_list_manager/items/check",item_id:e,checked:i})}async clearSlmChecked(e){return this.hass.callWS({type:"shopping_list_manager/items/clear_checked",list_id:e})}async deleteSlmItem(e){return this.hass.callWS({type:"shopping_list_manager/items/delete",item_id:e})}async addSlmItem(e,i){return this.hass.callWS({type:"shopping_list_manager/items/add",list_id:e,...i})}async getSlmCategories(){return this.hass.callWS({type:"shopping_list_manager/categories/get_all"})}async getSlmProductsByIds(e){return this.hass.callWS({type:"shopping_list_manager/products/get_by_ids",product_ids:e})}async getSlmProductSuggestions(e=20){return this.hass.callWS({type:"shopping_list_manager/products/suggestions",limit:e})}async searchSlmProducts(e,i=5){return this.hass.callWS({type:"shopping_list_manager/products/search",query:e,limit:i})}async getGlobalTimers(){return this.hass.callWS({type:"recipe_manager/global_timers/get"})}async addGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/add",...e})}async updateGlobalTimer(e,i){return this.hass.callWS({type:"recipe_manager/global_timers/update",timer_id:e,...i})}async deleteGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/delete",timer_id:e})}async importRecipeKeeper(e){return this.hass.callWS({type:"recipe_manager/import/recipe_keeper",html_content:e})}async uploadRecipeImage(e,i){return this.hass.callWS({type:"recipe_manager/recipes/upload_image",recipe_id:e,image_data:i})}};var gt=(n,e)=>`macromate:ui:${n.context.user}:${e}`;function or(n,e){try{let i=n.getItem(e);return i&&i.length<=131072?JSON.parse(i):null}catch{return null}}function lr(n){if(!n.current()||!n.context.admin)return{};let e=or(sessionStorage,gt(n,"view"))||{},i=or(localStorage,gt(n,"timers")),t=Date.now();return{view:typeof e.view=="string"?e.view:null,recipeId:typeof e.recipeId=="string"?e.recipeId:null,recentIds:Array.isArray(e.recentIds)?e.recentIds.filter(r=>typeof r=="string"&&r.length<=128).slice(0,200):[],timers:Array.isArray(i)?i.slice(0,100).filter(r=>r&&typeof r.id=="string"&&typeof r.label=="string"&&r.label.length<=300&&Number.isFinite(r.total)&&r.total>0&&r.total<=604800&&Number.isFinite(r.remaining)&&Number.isFinite(r.savedAt)).map(r=>({id:r.id,label:r.label,total:r.total,remaining:Math.max(0,r.remaining-(r.running?Math.max(0,Math.floor((t-r.savedAt)/1e3)):0)),running:r.running===!0,presetId:r.presetId||null})).filter(r=>r.remaining>0):[]}}function cr(n,e,i){if(!(!n?.current()||!n.context.admin))try{sessionStorage.setItem(gt(n,"view"),JSON.stringify(e)),localStorage.setItem(gt(n,"timers"),JSON.stringify(i.filter(t=>!t.global).slice(0,100).map(t=>({id:t.id,label:t.label,total:t.total,remaining:t.remaining,running:t.running===!0,presetId:t.presetId||null,savedAt:Date.now()}))))}catch{}}var dr=["de","es","fr","it","nl","pt"],vt=["de","en","es","fr","it","nl","pt"];var{getLocale:ca,setLocale:da}=nr({sourceLocale:"en",targetLocales:dr,loadLocale:n=>({de:()=>import("./chunks/de-VPUKMWIJ.js"),es:()=>import("./chunks/es-2ODMFEEJ.js"),fr:()=>import("./chunks/fr-DBXRW4XM.js"),it:()=>import("./chunks/it-B27VJNVB.js"),nl:()=>import("./chunks/nl-J3XFH5GZ.js"),pt:()=>import("./chunks/pt-4PZZOQC2.js")})[n]()});async function Ze(n){let e=vt.includes(n)?n:"en";e!==ca()&&await da(e)}var Ke=new Set,Pt=new Set,Te=null,Xe=null;function Ee(){return typeof navigator<"u"&&"wakeLock"in navigator}function Lt(){let n=!!Te;Pt.forEach(e=>e(n))}async function hr(){if(Xe)return Xe;if(!(!Ee()||Te)&&!(typeof document<"u"&&document.visibilityState!=="visible"))return Xe=(async()=>{try{let n=await navigator.wakeLock.request("screen");if(!Ke.size||document.visibilityState!=="visible"){await n.release();return}Te=n,Te.addEventListener("release",()=>{Te=null,Lt()}),Lt()}catch(n){console.warn("[RM] Wake Lock request failed:",n)}finally{Xe=null}})(),Xe}async function ua(){if(Te){try{await Te.release()}catch{}Te=null,Lt()}}async function pr(){Ke.size>0?await hr():await ua()}typeof document<"u"&&document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&Ke.size>0&&hr()});async function bt(n){Ke.add(n),await pr()}async function Qe(n){Ke.delete(n),await pr()}function fr(n){return Pt.add(n),()=>Pt.delete(n)}var Mt=class extends me{static properties={recipes:{type:Array},allRecipes:{type:Array},tags:{type:Array},searchQuery:{type:String},activeTag:{type:String},columns:{type:Number},showFavourites:{type:Boolean},hideSidebar:{type:Boolean},scrollPos:{type:Number},recentRecipes:{type:Array},recentCount:{type:Number},_filterMode:{type:String},_starFilter:{type:Number},_sortByRating:{type:Boolean},_showRatingMenu:{type:Boolean},_selectedCourses:{type:Object},_selectedCategories:{type:Object},_selectedCollections:{type:Object},filterPreset:{type:Object}};constructor(){super(),this.recipes=[],this.allRecipes=[],this.tags=[],this.searchQuery="",this.activeTag=null,this.columns=3,this.showFavourites=!0,this.hideSidebar=!1,this.scrollPos=0,this.recentRecipes=[],this.recentCount=12,this._filterMode="all",this._starFilter=0,this._sortByRating=!1,this._showRatingMenu=!1,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,this._lastScrollPos=0,this._hasRestoredScroll=!1,this.filterPreset=null}_toggleChip(e,i){let t=e==="courses"?"_selectedCourses":e==="categories"?"_selectedCategories":"_selectedCollections",r=new Set(this[t]);r.has(i)?r.delete(i):r.add(i),this[t]=r}updated(e){if(e.has("filterPreset")&&this.filterPreset){let{filterMode:i,selectedValues:t}=this.filterPreset;this._filterMode=i,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,i==="courses"&&(this._selectedCourses=new Set(t)),i==="categories"&&(this._selectedCategories=new Set(t)),i==="collections"&&(this._selectedCollections=new Set(t))}e.has("scrollPos")&&(this._hasRestoredScroll=!1),this.scrollPos!=null&&!this._hasRestoredScroll&&(this._hasRestoredScroll=!0,this.updateComplete.then(()=>{requestAnimationFrame(()=>{let i=this.shadowRoot?.querySelector(".grid-scroll");i&&(i.scrollTop=this.scrollPos)})}))}_handleSearchInput(e){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:e.target.value},bubbles:!0,composed:!0}))}_handleClearSearch(){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:""},bubbles:!0,composed:!0}))}_handleTagClick(e){this.dispatchEvent(new CustomEvent("rm-tag-filter",{detail:{tag:e},bubbles:!0,composed:!0}))}_handleOpenRecipe(e){this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:e},bubbles:!0,composed:!0}))}_handleToggleFavourite(e,i){e.stopPropagation(),this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:i.id},bubbles:!0,composed:!0}))}_recipeMatchesTag(e,i){return i?e.tags?.includes(i)||e.courses?.includes(i)||e.categories?.includes(i)||e.collections?.includes(i):!0}_recipeMatchesSearch(e,i){let t=(i||"").trim().toLowerCase();return t?e.name?.toLowerCase().includes(t)||e.description?.toLowerCase().includes(t)||e.tags?.some(r=>r.toLowerCase().includes(t)):!0}_formatTime(e){if(!e)return null;if(e<60)return`${e}m`;let i=Math.floor(e/60),t=e%60;return t?`${i}h ${t}m`:`${i}h`}_getFilteredList(){let e=this._selectedCourses.size>0,i=this._selectedCategories.size>0,t=this._selectedCollections.size>0,r=e||i||t,a;switch(r?a=this.allRecipes.filter(s=>{let d=!e||(s.courses||[]).some($=>this._selectedCourses.has($)),g=!i||(s.categories||[]).some($=>this._selectedCategories.has($)),x=!t||(s.collections||[]).some($=>this._selectedCollections.has($));return d&&g&&x&&this._recipeMatchesSearch(s,this.searchQuery)}):a=this.recipes,this._filterMode){case"favourites":a=this.allRecipes.filter(s=>s.is_favourite).filter(s=>!r||a.some(d=>d.id===s.id));break;case"recent":a=this.recentRecipes.slice(0,this.recentCount).filter(s=>!r||a.some(d=>d.id===s.id));break}return a=a.filter(s=>this._recipeMatchesSearch(s,this.searchQuery)&&this._recipeMatchesTag(s,this.activeTag)),this._starFilter>0&&(a=a.filter(s=>(s.rating||0)>=this._starFilter)),this._sortByRating&&(a=[...a].sort((s,d)=>(d.rating||0)-(s.rating||0))),a}get _allCourses(){let e=new Set;return this.allRecipes.forEach(i=>(i.courses||[]).forEach(t=>e.add(t))),[...e].sort()}get _coursecounts(){let e={};return this.allRecipes.forEach(i=>(i.courses||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}get _allCategories(){let e=new Set;return this.allRecipes.forEach(i=>(i.categories||[]).forEach(t=>e.add(t))),[...e].sort()}get _categorycounts(){let e={};return this.allRecipes.forEach(i=>(i.categories||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}get _allCollections(){let e=new Set;return this.allRecipes.forEach(i=>(i.collections||[]).forEach(t=>e.add(t))),[...e].sort()}get _collectioncounts(){let e={};return this.allRecipes.forEach(i=>(i.collections||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}_renderStars(e){let i=e||0;return u`
      <div class="card-stars">
        ${[1,2,3,4,5].map(t=>u`<span class="card-star ${t<=i?"filled":""}">${t<=i?"\u2605":"\u2606"}</span>`)}
      </div>
    `}_renderRecipeCard(e){let i=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return u`
      <div class="recipe-card" @click=${()=>this._handleOpenRecipe(e)}>
        <div class="recipe-thumb">
          ${e.image_url?u`
            <img src="${e.image_url}" alt="${e.name}" loading="lazy" />
          `:u`
            <div class="recipe-thumb-placeholder">
              <ha-icon icon="mdi:food"></ha-icon>
            </div>
          `}
          <button
            class="fav-btn ${e.is_favourite?"active":""}"
            @click=${t=>this._handleToggleFavourite(t,e)}
            title="${e.is_favourite?c("Remove from favourites"):c("Add to favourites")}"
          >
            <ha-icon icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"></ha-icon>
          </button>
        </div>
        <div class="recipe-info">
          <h3 class="recipe-name">${e.name}</h3>
          ${this._renderStars(e.rating)}
          <div class="recipe-meta">
            ${i?u`
              <span class="meta-chip">
                <ha-icon icon="mdi:clock-outline"></ha-icon>
                ${this._formatTime(i)}
              </span>
            `:""}
            ${e.servings?u`
              <span class="meta-chip">
                <ha-icon icon="mdi:account-group-outline"></ha-icon>
                ${e.servings}
              </span>
            `:""}
            ${e.tags?.length?u`
              <span class="meta-chip tag-chip">${e.tags[0]}</span>
            `:""}
          </div>
        </div>
      </div>
    `}_renderRatingMenu(){return u`
      <div class="rating-menu" @click=${e=>e.stopPropagation()}>
        <div class="rating-menu-section">${c("Filter by rating")}</div>
        ${[0,1,2,3,4,5].map(e=>u`
          <button class="rating-menu-item ${this._starFilter===e?"active":""}"
            @click=${()=>{this._starFilter=e,this._showRatingMenu=!1}}>
            ${e===0?c("All ratings"):c(ce`${"\u2605".repeat(e)}${"\u2606".repeat(5-e)} ${e}+`)}
          </button>
        `)}
        <div class="rating-menu-section" style="margin-top:6px">${c("Sort")}</div>
        <button class="rating-menu-item ${this._sortByRating?"active":""}"
          @click=${()=>{this._sortByRating=!this._sortByRating,this._showRatingMenu=!1}}>
          ${c(ce`${this._sortByRating?"\u2713 ":""}Sort by rating`)}
        </button>
      </div>
    `}render(){let e=this._getFilteredList(),i=this._filterMode==="all"&&this.showFavourites&&!this.activeTag&&!this.searchQuery&&!this._starFilter&&!this._sortByRating,t=i?e.filter(d=>d.is_favourite):[],r=i&&t.length?e.filter(d=>!d.is_favourite):e,a=`grid-template-columns: var(--rm-grid-columns, repeat(${this.columns}, minmax(0, 1fr)));`,s=this._starFilter>0||this._sortByRating;return u`
      <div class="grid-container" @click=${()=>{this._showRatingMenu&&(this._showRatingMenu=!1)}}>
        <!-- Search bar — only shown on narrow (sidebar-less) view -->
        ${this.hideSidebar?"":u`
          <div class="search-row">
            <div class="search-wrap">
              <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
              <input
                type="text"
                class="search-input"
                placeholder="${c("Search recipes\u2026")}"
                .value=${this.searchQuery}
                @input=${this._handleSearchInput}
              />
              ${this.searchQuery?u`
                <button class="clear-btn" @click=${this._handleClearSearch}>
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `:""}
            </div>
          </div>
        `}

        <!-- Filter tabs + rating filter button (wide view) -->
        ${this.hideSidebar?u`
          <div class="filter-tabs-row">
            <div class="filter-tabs">
              ${[["all","mdi:view-grid",c("All"),null],["courses","mdi:silverware-fork-knife",c("Courses"),"_selectedCourses"],["categories","mdi:tag-multiple-outline",c("Categories"),"_selectedCategories"],["collections","mdi:folder-multiple-outline",c("Collections"),"_selectedCollections"],["favourites","mdi:heart-outline",c("Favourites"),null],["recent","mdi:history",c("Recent"),null]].map(([d,g,x,$])=>u`
                <button
                  class="filter-tab ${this._filterMode===d?"active":""}"
                  @click=${()=>{this._filterMode=d,d==="all"&&(this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set)}}
                >
                  <ha-icon icon="${g}"></ha-icon>
                  <span>${x}</span>
                  ${$&&this[$]?.size>0?u`<span class="tab-badge"></span>`:""}
                </button>
              `)}
            </div>
            <!-- Rating filter button -->
            <div class="rating-filter-wrap">
              <button
                class="rating-filter-btn ${s?"active":""}"
                @click=${d=>{d.stopPropagation(),this._showRatingMenu=!this._showRatingMenu}}
                title="${c("Filter/sort by rating")}"
              >
                <ha-icon icon="mdi:filter-menu-outline"></ha-icon>
                ${s?u`<span class="rating-filter-badge"></span>`:""}
              </button>
              ${this._showRatingMenu?this._renderRatingMenu():""}
            </div>
          </div>
        `:""}

        <!-- Sub-filter chips for Courses / Categories / Collections (multi-select) -->
        ${this.hideSidebar&&this._filterMode==="courses"&&this._allCourses.length?u`
          <div class="sub-filter-row">
            <button class="sub-chip ${this._selectedCourses.size?"":"active"}"
              @click=${()=>{this._selectedCourses=new Set}}>${c("All")}</button>
            ${this._allCourses.map(d=>u`
              <button
                class="sub-chip ${this._selectedCourses.has(d)?"active":""}"
                @click=${()=>this._toggleChip("courses",d)}
              >${d}<span class="sub-chip-count">${this._coursecounts[d]||0}</span></button>
            `)}
          </div>
        `:""}
        ${this.hideSidebar&&this._filterMode==="categories"&&this._allCategories.length?u`
          <div class="sub-filter-row">
            <button class="sub-chip ${this._selectedCategories.size?"":"active"}"
              @click=${()=>{this._selectedCategories=new Set}}>${c("All")}</button>
            ${this._allCategories.map(d=>u`
              <button
                class="sub-chip ${this._selectedCategories.has(d)?"active":""}"
                @click=${()=>this._toggleChip("categories",d)}
              >${d}<span class="sub-chip-count">${this._categorycounts[d]||0}</span></button>
            `)}
          </div>
        `:""}
        ${this.hideSidebar&&this._filterMode==="collections"&&this._allCollections.length?u`
          <div class="sub-filter-row">
            <button class="sub-chip ${this._selectedCollections.size?"":"active"}"
              @click=${()=>{this._selectedCollections=new Set}}>${c("All")}</button>
            ${this._allCollections.map(d=>u`
              <button
                class="sub-chip ${this._selectedCollections.has(d)?"active":""}"
                @click=${()=>this._toggleChip("collections",d)}
              >${d}<span class="sub-chip-count">${this._collectioncounts[d]||0}</span></button>
            `)}
          </div>
        `:""}

        <!-- Tag chips (narrow view only) -->
        ${!this.hideSidebar&&this.tags.length?u`
          <div class="tags-row">
            ${this.tags.map(d=>u`
              <button
                class="tag-btn ${this.activeTag===d?"active":""}"
                @click=${()=>this._handleTagClick(d)}
              >${d}</button>
            `)}
          </div>
        `:""}

        <!-- Active filter hint -->
        ${s?u`
          <div class="active-filter-bar">
            ${this._starFilter>0?u`<span>${c(ce`⭐ ${this._starFilter}+ stars`)}</span>`:""}
            ${this._sortByRating?u`<span>${c("Sorted by rating")}</span>`:""}
            <button class="clear-filter-btn" @click=${()=>{this._starFilter=0,this._sortByRating=!1}}>
              <ha-icon icon="mdi:close"></ha-icon> ${c("Clear")}
            </button>
          </div>
        `:""}

        <!-- Recipe content -->
        <div class="grid-scroll" @scroll=${d=>{this._lastScrollPos=d.target.scrollTop}}>
          ${e.length===0?u`
            <div class="empty-state">
              <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
              <p>${this.searchQuery||this.activeTag?c("No matching recipes"):this._starFilter>0?c(ce`No recipes with ${this._starFilter}+ stars`):this._filterMode==="favourites"?c("No favourites yet \u2014 heart a recipe!"):this._filterMode==="recent"?c("No recently viewed recipes yet."):c("No recipes yet \u2014 add one!")}</p>
            </div>
          `:u`
            ${i&&t.length?u`
              <div class="section-label">${c("Favourites")}</div>
              <div class="recipe-grid" style=${a}>
                ${t.map(d=>this._renderRecipeCard(d))}
              </div>
              ${r.length?u`<div class="section-label">${c("All Recipes")}</div>`:""}
            `:""}

            <div class="recipe-grid" style=${a}>
              ${r.map(d=>this._renderRecipeCard(d))}
            </div>
          `}
        </div>
      </div>
    `}static styles=ge`
    :host { display: block; height: 100%; position: relative; }

    .grid-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    /* Search (narrow only) */
    .search-row {
      padding: 10px 14px 6px;
      flex-shrink: 0;
    }
    .search-wrap {
      display: flex;
      align-items: center;
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 10px;
      padding: 0 10px;
      gap: 8px;
    }
    .search-icon { color: var(--rm-text-secondary, #8e8e93); --mdc-icon-size: 18px; }
    .search-input {
      flex: 1; background: none; border: none; outline: none;
      color: var(--rm-text, #e5e5ea); font-size: 14px; padding: 9px 0;
    }
    .search-input::placeholder { color: var(--rm-text-secondary, #8e8e93); }
    .clear-btn {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93); padding: 2px; display: flex; align-items: center;
    }
    .clear-btn ha-icon { --mdc-icon-size: 16px; }

    /* Filter tabs row (wide view) */
    .filter-tabs-row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 14px 4px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.08));
    }

    .filter-tabs {
      display: flex;
      gap: 2px;
      flex: 1;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .filter-tabs::-webkit-scrollbar { display: none; }

    .filter-tab {
      display: flex; align-items: center; gap: 5px;
      background: none; border: none; border-radius: 8px;
      padding: 6px 12px; font-size: 13px; font-weight: 500;
      color: var(--rm-text-secondary, #8e8e93);
      cursor: pointer; white-space: nowrap;
      transition: background 0.12s, color 0.12s;
    }
    .filter-tab ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
    .filter-tab:hover { background: var(--rm-accent-soft); color: var(--rm-text); }
    .filter-tab { position: relative; }
    .tab-badge {
      position: absolute; top: 4px; right: 4px;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--rm-accent);
    }
    .filter-tab.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent); font-weight: 600;
    }

    /* Rating filter button */
    .rating-filter-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .rating-filter-btn {
      background: none; border: 1px solid var(--rm-border);
      border-radius: 8px; padding: 6px 10px; cursor: pointer;
      color: var(--rm-text-secondary); display: flex; align-items: center;
      gap: 4px; position: relative; transition: background 0.12s, color 0.12s;
    }
    .rating-filter-btn ha-icon { --mdc-icon-size: 18px; }
    .rating-filter-btn:hover { background: var(--rm-accent-soft); color: var(--rm-text); }
    .rating-filter-btn.active { color: var(--rm-accent); border-color: var(--rm-accent); background: var(--rm-accent-soft); }
    .rating-filter-badge {
      position: absolute; top: 4px; right: 4px;
      width: 7px; height: 7px;
      background: var(--rm-accent); border-radius: 50%;
    }

    .rating-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      box-shadow: var(--rm-shadow, 0 4px 12px rgba(0,0,0,0.2));
      min-width: 170px;
      z-index: 50;
      overflow: hidden;
      padding: 4px 0;
    }
    .rating-menu-section {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--rm-text-muted); padding: 8px 14px 4px;
    }
    .rating-menu-item {
      display: block; width: 100%;
      background: none; border: none; text-align: left;
      padding: 8px 14px; font-size: 13px; cursor: pointer;
      color: var(--rm-text-secondary); transition: background 0.12s;
    }
    .rating-menu-item:hover { background: var(--rm-accent-soft); color: var(--rm-text); }
    .rating-menu-item.active { color: var(--rm-accent); font-weight: 600; }

    /* Active filter hint bar */
    .active-filter-bar {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 14px;
      font-size: 12px; color: var(--rm-accent);
      background: var(--rm-accent-soft);
      flex-shrink: 0;
    }
    .clear-filter-btn {
      margin-left: auto; background: none; border: none;
      display: flex; align-items: center; gap: 3px;
      color: var(--rm-text-secondary); font-size: 12px; cursor: pointer;
    }
    .clear-filter-btn ha-icon { --mdc-icon-size: 14px; }

    /* Sub-filter chips */
    .sub-filter-row {
      display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 14px;
      flex-shrink: 0; max-height: 88px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border) transparent;
    }
    .sub-filter-row::-webkit-scrollbar { width: 4px; }
    .sub-filter-row::-webkit-scrollbar-track { background: transparent; }
    .sub-filter-row::-webkit-scrollbar-thumb { background: var(--rm-border); border-radius: 4px; }
    .sub-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 20px; color: var(--rm-text-secondary);
      font-size: 12px; padding: 4px 8px 4px 12px; cursor: pointer;
      white-space: nowrap; transition: all 0.15s;
    }
    .sub-chip.active {
      background: var(--rm-accent-soft); border-color: var(--rm-accent); color: var(--rm-accent);
    }
    .sub-chip-count {
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--rm-accent); color: #fff;
      border-radius: 10px; font-size: 10px; font-weight: 700;
      padding: 1px 5px; min-width: 16px; line-height: 1.4;
    }

    /* Tags (narrow view) */
    .tags-row {
      display: flex; gap: 6px; padding: 4px 14px 8px;
      overflow-x: auto; flex-shrink: 0; scrollbar-width: none;
    }
    .tags-row::-webkit-scrollbar { display: none; }
    .tag-btn {
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 20px; color: var(--rm-text-secondary);
      font-size: 12px; padding: 4px 10px; cursor: pointer;
      white-space: nowrap; transition: all 0.15s;
    }
    .tag-btn.active {
      background: var(--rm-accent-soft); border-color: var(--rm-accent); color: var(--rm-accent);
    }

    /* Grid scroll area */
    .grid-scroll {
      flex: 1; overflow-y: auto;
      padding: 4px 14px 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border) transparent;
    }

    .section-label {
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--rm-text-secondary);
      margin: 8px 0 6px;
    }

    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }

    /* Recipe card */
    .recipe-card {
      background: var(--rm-bg-surface); border-radius: var(--rm-radius, 12px);
      overflow: hidden; cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      border: 1px solid var(--rm-border);
    }
    .recipe-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--rm-shadow);
    }

    .recipe-thumb {
      position: relative; aspect-ratio: 4/3;
      background: var(--rm-border); overflow: hidden;
    }
    .recipe-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .recipe-thumb-placeholder {
      width: 100%; height: 100%; display: flex;
      align-items: center; justify-content: center;
      color: var(--rm-text-secondary);
    }
    .recipe-thumb-placeholder ha-icon { --mdc-icon-size: 36px; }

    .fav-btn {
      position: absolute; top: 6px; right: 6px;
      background: rgba(0,0,0,0.5); border: none; border-radius: 50%;
      width: 28px; height: 28px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.7); transition: color 0.15s; padding: 0;
    }
    .fav-btn ha-icon { --mdc-icon-size: 16px; }
    .fav-btn.active { color: var(--error-color, #cf6679); }

    .recipe-info { padding: 8px 10px 10px; }
    .recipe-name {
      margin: 0 0 4px; font-size: 14px; font-weight: 600;
      color: var(--rm-text); overflow: hidden; text-overflow: ellipsis;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }

    /* Star rating on cards */
    .card-stars {
      display: flex; gap: 1px; margin-bottom: 5px;
    }
    .card-star {
      font-size: 14px; line-height: 1;
      color: var(--rm-border, rgba(200,150,0,0.25));
      -webkit-text-stroke: 1px rgba(200,150,0,0.5);
    }
    .card-star.filled {
      color: #f5a623;
      -webkit-text-stroke: 1px #c47f0a;
    }

    .recipe-meta { display: flex; flex-wrap: wrap; gap: 4px; }
    .meta-chip {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 11px; color: var(--rm-text-secondary);
      background: rgba(128,128,128,0.08); border-radius: 6px; padding: 2px 6px;
    }
    .meta-chip ha-icon { --mdc-icon-size: 12px; }
    .tag-chip { background: var(--rm-accent-soft); color: var(--rm-accent); }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 60px 20px; gap: 12px;
      color: var(--rm-text-secondary); text-align: center;
    }
    .empty-state ha-icon { --mdc-icon-size: 56px; opacity: 0.4; }
    .empty-state p { margin: 0; font-size: 15px; }
  `};try{customElements.define("rm-recipe-grid",Mt)}catch{}function Ye(n){return String(n).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map(e=>e.startsWith("**")?u`<strong>${e.slice(2,-2)}</strong>`:e.startsWith("`")?u`<code>${e.slice(1,-1)}</code>`:e.startsWith("*")?u`<em>${e.slice(1,-1)}</em>`:e)}function Je(n){return String(n||"").split(`
`).map(e=>e.startsWith("### ")?u`<h3>${Ye(e.slice(4))}</h3>`:e.startsWith("## ")?u`<h2>${Ye(e.slice(3))}</h2>`:e.startsWith("# ")?u`<h1>${Ye(e.slice(2))}</h1>`:/^[-*] /.test(e)?u`<ul><li>${Ye(e.slice(2))}</li></ul>`:u`<p>${Ye(e)}</p>`)}var et=ge`
 :host{display:block;color:var(--rm-text,#424242);font:inherit;height:100%;overflow:auto}section{padding:24px;max-width:1000px;margin:auto}h2{margin:0 0 20px}h3{font-size:16px}nav,.toolbar,.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}button,select,input,textarea{font:inherit;color:inherit;background:var(--rm-bg-surface,white);border:1px solid var(--rm-border,#ddd);border-radius:8px;padding:10px}button{cursor:pointer}button:hover,button.active{background:var(--rm-accent-soft,#eee)}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--rm-accent,#646cab);outline-offset:2px}button:disabled{opacity:.5;cursor:default}label{display:flex;flex-direction:column;gap:6px;margin:12px 0}input,textarea,select{max-width:100%;box-sizing:border-box}textarea{min-height:80px}pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:340px;overflow:auto}.record{padding:14px;background:var(--rm-bg-surface,white);border:1px solid var(--rm-border,#ddd);border-radius:12px;margin:8px 0}.muted{color:var(--rm-text-secondary,#666)}.row strong{flex:1}.checked strong{text-decoration:line-through}form{max-width:720px}.danger{color:#b74444}@media(max-width:600px){section{padding:12px}nav{gap:4px}nav button{padding:8px;font-size:13px}}
`,Bt=class extends me{static properties={api:{attribute:!1},prefix:{},selected:{state:!0},values:{state:!0},result:{state:!0},error:{state:!0},busy:{state:!0}};static styles=et;constructor(){super(),this.prefix="",this.selected="",this.values={},this.result=null,this.error="",this.busy=!1}get actions(){return Object.entries(this.api?.actions||{}).filter(([e,i])=>(!this.prefix||e.startsWith(this.prefix))&&(this.api.context.admin||!i.admin_only&&(e.startsWith("shopping_")||e.startsWith("preferences_")||["describe","platform_info"].includes(e))))}updated(e){e.has("prefix")&&!this.actions.some(([i])=>i===this.selected)&&(this.selected="",this.values={})}choose(e,i={}){this.selected=e,this.values={...i},this.result=null,this.error=""}async submit(e){if(e?.preventDefault(),!this.selected||this.busy)return;let i=this.api.actions[this.selected],t={};try{for(let[r,a]of Object.entries(i.schema.properties||{})){if(r==="request_id")continue;let s=this.values[r]===void 0&&a.type==="boolean"&&(i.schema.required||[]).includes(r)?!1:this.values[r];if(s===void 0||s==="")continue;if(s===null){t[r]=null;continue}let d=typeof a.const=="boolean"?"boolean":Array.isArray(a.type)?a.type.find(g=>g!=="null"):a.type;t[r]=d==="number"||d==="integer"?Number(s):d==="boolean"?s===!0:(d==="object"||d==="array")&&typeof s=="string"?JSON.parse(s):s}this.busy=!0,this.result=await this.api.call(this.selected,t),this.dispatchEvent(new CustomEvent("mm-command-done",{bubbles:!0,composed:!0,detail:{action:this.selected,payload:t,result:this.result}}))}catch(r){this.error=r?.code==="uncertain"?"Write status uncertain. Use the retry banner.":"Check the fields or account permissions."}finally{this.busy=!1}}renderField(e,i,t){let r=Array.isArray(i.type)&&i.type.includes("null");return u`${this.renderValueField(e,i,t)}${r?u`<button type="button" @click=${()=>{this.values={...this.values,[e]:null}}}>Clear ${e.replaceAll("_"," ")}</button>${this.values[e]===null?u`<small> Explicitly cleared (null)</small>`:""}`:""}`}renderValueField(e,i,t){let r=this.values[e],a=g=>{this.values={...this.values,[e]:g}},s=typeof i.const=="boolean"?"boolean":Array.isArray(i.type)?i.type.find(g=>g!=="null"):i.type,d=e.replaceAll("_"," ");return s==="boolean"?u`<label><span>${d}${t?" *":""}</span><input aria-label=${d} type="checkbox" .checked=${r===!0} @change=${g=>a(g.target.checked)} ?required=${e==="confirm"||i.const===!0||i.enum?.length===1&&i.enum[0]===!0}></label>`:i.enum?u`<label>${d}${t?" *":""}<select aria-label=${d} ?required=${t} @change=${g=>a(g.target.value)}><option value="">Choose…</option>${i.enum.map(g=>u`<option .selected=${r===g} value=${g}>${g}</option>`)}</select></label>`:["object","array"].includes(s)?u`<label>${d}${t?" *":""}<textarea aria-label=${d} ?required=${t} .value=${typeof r=="string"?r:r!==void 0?JSON.stringify(r,null,2):""} placeholder=${s==="array"?"[]":"{}"} @input=${g=>a(g.target.value)}></textarea><small class="muted">${i.description||"JSON data; only schema-declared fields are accepted."}</small></label>`:u`<label>${d}${t?" *":""}<input aria-label=${d} ?required=${t} type=${["number","integer"].includes(s)?"number":i.format==="date"?"date":"text"} min=${i.minimum??""} max=${i.maximum??""} step=${s==="integer"?"1":"any"} maxlength=${i.maxLength??524288} .value=${r??""} @input=${g=>a(g.target.value)}><small class="muted">${i.description||""}</small></label>`}render(){let e=this.api?.actions[this.selected];return u`<section><h2>${(this.api?.locale||this.api?.hass?.language)==="de"?"Alle Aktionen":"All actions"}</h2><p class="muted">${(this.api?.locale||this.api?.hass?.language)==="de"?"Validierte Formulare aus dem gemeinsamen API-Vertrag. \xC4nderungen werden nur nach dem Absenden gespeichert.":"Validated forms from the shared API contract. Changes are saved only when you submit."}</p><label>Action<select aria-label="Action" @change=${i=>this.choose(i.target.value)}><option value="">Choose…</option>${this.actions.map(([i])=>u`<option value=${i} .selected=${this.selected===i}>${i.replaceAll("_"," ")}</option>`)}</select></label>${e?u`<form @submit=${this.submit}><p>${e.description}</p>${Object.entries(e.schema.properties||{}).filter(([i])=>i!=="request_id").map(([i,t])=>this.renderField(i,t,(e.schema.required||[]).includes(i)))}<button type="submit" ?disabled=${this.busy||!!this.api.pending}>${e.read_only?"Read":"Save"}</button></form>`:""}${this.error?u`<p role="alert">${this.error}</p>`:""}${this.result!==null?u`<details open><summary>Server response</summary><pre>${JSON.stringify(this.result,null,2)}</pre></details>`:""}</section>`}};customElements.define("mm-commands",Bt);var Ft=class extends me{static properties={api:{attribute:!1},recipe:{attribute:!1},servings:{type:Number},open:{state:!0},error:{state:!0},result:{state:!0}};static styles=et;constructor(){super(),this.servings=1,this.open=!1,this.error="",this.result=null}get de(){return this.api?.hass?.language?.startsWith("de")}async submit(e){e.preventDefault();let i=e.target,t={recipe_id:this.recipe.id,servings:Number(i.elements.servings.value),meal_type:i.elements.meal_type.value};i.elements.date.value&&(t.date=i.elements.date.value);try{this.result=await this.api.call("recipe_log",t),this.error="",this.open=!1}catch(r){this.error=r.message}}render(){let e=["per_serving","per_recipe"].includes(this.recipe?.nutrition_basis)&&Number.isFinite(this.recipe?.declared_nutrition?.calories);return u`<section style="padding:8px"><button @click=${()=>{this.open=!this.open}} ?disabled=${!e||!!this.api?.pending}>${this.de?"Portionen eintragen":"Log servings"}</button>${e?"":u`<small> ${this.de?"Deklarierte Kalorien und bekannte N\xE4hrwertbasis erforderlich.":"Declared calories and a known nutrition basis are required."}</small>`}${this.open?u`<form @submit=${this.submit}><label>${this.de?"Rezeptportionen":"Recipe servings"}<input aria-label="Recipe servings" name="servings" type="number" required min="0.001" max="10000" step="any" .value=${this.servings}></label><label>${this.de?"Mahlzeit":"Meal"}<select name="meal_type"><option value="breakfast">${this.de?"Fr\xFChst\xFCck":"Breakfast"}</option><option value="lunch">${this.de?"Mittagessen":"Lunch"}</option><option value="dinner" selected>${this.de?"Abendessen":"Dinner"}</option><option value="snack">${this.de,"Snack"}</option></select></label><label>${this.de?"Datum (leer = heute in Home Assistant)":"Date (empty = Home Assistant today)"}<input name="date" type="date"></label><p class="muted">${this.de?"Speichert einen unver\xE4nderlichen Rezept-N\xE4hrwert-Snapshot im Tagebuch.":"Saves an immutable snapshot of declared recipe nutrition in the diary."}</p><button type="submit" ?disabled=${!!this.api?.pending}>${this.de?"Best\xE4tigen und eintragen":"Confirm and log"}</button></form>`:""}${this.error?u`<p role="alert">${this.error}</p>`:""}${this.result?u`<p role="status">${this.de?"Tagebucheintrag gespeichert.":"Diary entry saved."}</p>`:""}</section>`}};customElements.define("mm-recipe-log",Ft);function _t(n,e){return u`<fieldset><legend>Declared nutrition for diary logging</legend><p>Original nutrition text is retained separately. Enter numeric values only when declared by the recipe. Missing values stay unknown.</p><label>Nutrition basis<select aria-label="Nutrition basis" .value=${n.nutrition_basis||"unknown"} @change=${i=>e("nutrition_basis",i.target.value)}><option value="unknown">Unknown</option><option value="per_serving">Per serving</option><option value="per_recipe">Whole recipe</option></select></label>${["calories","protein","carbs","fat","fiber","sugar","sodium","saturated_fat"].map(i=>u`<label>Declared ${i.replaceAll("_"," ")} (${i==="calories"?"kcal":i==="sodium"?"mg":"g"})<input aria-label=${`Declared ${i.replaceAll("_"," ")} (${i==="calories"?"kcal":i==="sodium"?"mg":"g"})`} type="number" min="0" step="any" .value=${n.declared_nutrition?.[i]??""} @input=${t=>e("declared_nutrition",{...n.declared_nutrition,[i]:t.target.value})}></label>`)}</fieldset>`}function xt(n){return Object.fromEntries(Object.entries(n||{}).filter(([,e])=>e!==""&&e!==void 0).map(([e,i])=>[e,i===null?null:Number(i)]))}var mr="recipe-detail",gr=[{key:"calories",label:c("Calories"),unit:"kcal",bold:!0},{key:"fat",label:c("Total Fat"),unit:"g"},{key:"saturated_fat",label:c("Saturated Fat"),unit:"g",indent:!0},{key:"cholesterol",label:c("Cholesterol"),unit:"mg"},{key:"sodium",label:c("Sodium"),unit:"mg"},{key:"carbohydrates",label:c("Total Carbohydrate"),unit:"g"},{key:"fiber",label:c("Dietary Fiber"),unit:"g",indent:!0},{key:"sugar",label:c("Total Sugars"),unit:"g",indent:!0},{key:"protein",label:c("Protein"),unit:"g"}],vr=/(\d+\s*(?:hours?|hrs?)\s*(?:and\s*)?\d*\s*(?:minutes?|mins?)?|\d+\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?))/gi;function ha(n){let e=n.toLowerCase(),i=0,t=e.match(/(\d+)\s*h(?:ours?|rs?)?/);t&&(i+=parseInt(t[1])*3600);let r=e.match(/(\d+)\s*m(?:in(?:utes?)?)?(?!\s*l)/);r&&(i+=parseInt(r[1])*60);let a=e.match(/(\d+)\s*s(?:ec(?:onds?)?)?/);if(a&&(i+=parseInt(a[1])),!i){let s=e.match(/^(\d+)$/);s&&(i=parseInt(s[1])*60)}return i||0}var pa={calories:{label:c("Calories"),val:2e3,unit:"kcal"},fat:{label:c("Total Fat"),val:65,unit:"g"},saturated_fat:{label:c("Saturated Fat"),val:20,unit:"g"},cholesterol:{label:c("Cholesterol"),val:300,unit:"mg"},sodium:{label:c("Sodium"),val:2300,unit:"mg"},carbohydrates:{label:c("Total Carbohydrate"),val:300,unit:"g"},fiber:{label:c("Dietary Fiber"),val:28,unit:"g"},sugar:{label:c("Added Sugars"),val:50,unit:"g"},protein:{label:c("Protein"),val:50,unit:"g"}},br={oz:{factor:28.3495,to:"g",toFull:"g"},lb:{factor:453.592,to:"g",toFull:"g",thresholdKg:500},cup:{factor:250,to:"ml",toFull:"ml"},cups:{factor:250,to:"ml",toFull:"ml"},"fl oz":{factor:29.5735,to:"ml",toFull:"ml"},pt:{factor:473.176,to:"ml",toFull:"ml"},qt:{factor:946.353,to:"ml",toFull:"ml"}};function fa(n,e){if(!n||!e)return null;let i=Ve(n);if(i===null)return null;let t=e.toLowerCase().trim(),r=br[t];if(!r)return null;let a=i*r.factor,s=r.to;t==="lb"&&a>=500&&(a=a/1e3,s="kg"),s==="ml"&&a>=1e3&&(a=a/1e3,s="L");let d=a>=10?Math.round(a):Math.round(a*10)/10;return{amount:String(d),unit:s}}var Nt=class extends me{static properties={recipe:{type:Object},api:{type:Object},shoppingLists:{type:Array},slmAvailable:{type:Boolean},settings:{type:Object},wide:{type:Boolean},_editing:{type:Boolean},_editData:{type:Object},_servingMult:{type:Number},_activeTab:{type:String},_showShoppingPicker:{type:Boolean},_selectedListId:{type:String},_checkedIngredients:{type:Object},_shoppingAdding:{type:Boolean},_shoppingResult:{type:String},_shoppingReview:{type:Array},_confirmDelete:{type:Boolean},_downloading:{type:Boolean},_photoUrlInput:{type:String},_addingPhotoUrl:{type:Boolean},_metricMode:{type:Boolean},_wakeActive:{type:Boolean},_completedSteps:{type:Object},_editIngInput:{type:String},_editStepInput:{type:String},_nutritionExpanded:{type:Boolean},_dragIngOver:{type:Number},_dragStepOver:{type:Number},_editImageUploading:{type:Boolean},_slideIdx:{type:Number},allTags:{type:Array},allCourses:{type:Array},allCategories:{type:Array},allCollections:{type:Array},_tagPickerField:{type:String},_tagPickerInput:{type:String},_editIngEdit:{type:Object}};constructor(){super(),this.recipe=null,this.api=null,this.shoppingLists=[],this.slmAvailable=!1,this.settings={},this.wide=!1,this._editing=!1,this._editData={},this._servingMult=1,this._activeTab="ingredients",this._showShoppingPicker=!1,this._selectedListId="",this._checkedIngredients=null,this._shoppingAdding=!1,this._shoppingResult=null,this._shoppingReview=null,this._confirmDelete=!1,this._downloading=!1,this._photoUrlInput="",this._addingPhotoUrl=!1,this._metricMode=this.settings?.unitSystem==="metric",this._wakeActive=!1,this._completedSteps=new Set,this._editIngInput="",this._editStepInput="",this._nutritionExpanded=!1,this._dragIngOver=-1,this._dragStepOver=-1,this._dragIngFrom=-1,this._dragStepFrom=-1,this._editImageUploading=!1,this._slideIdx=0,this.allTags=[],this.allCourses=[],this.allCategories=[],this.allCollections=[],this._tagPickerField=null,this._tagPickerInput="",this._editIngEdit=null,this._slideTimer=null,this._slideTouchStartX=null,this._wakeLockTimeout=null,this._wakeLockUnsubscribeFn=null}connectedCallback(){super.connectedCallback(),this._wakeLockUnsubscribeFn=fr(e=>{this._wakeActive=e})}disconnectedCallback(){super.disconnectedCallback(),this._releaseWakeLock(),this._wakeLockUnsubscribeFn?.(),this._wakeLockUnsubscribeFn=null,this._stopSlideTimer()}async _requestWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await bt(mr);let e=this.settings?.wakeLockDuration??60;this._wakeLockTimeout=setTimeout(()=>this._releaseWakeLock(),e*6e4)}async _releaseWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await Qe(mr)}updated(e){if(e.has("recipe")&&this.recipe){let i=e.get("recipe"),t=!i||i.id!==this.recipe.id;this._servingMult=1,t&&(this._editing=!1,this._confirmDelete=!1,this._shoppingResult=null,this._shoppingReview=null,this._showShoppingPicker=!1,this._checkedIngredients=null,this._photoUrlInput="",this._metricMode=this.settings?.unitSystem==="metric",this._completedSteps=new Set),this._slideIdx=0,this._startSlideTimer()}e.has("settings")&&this._startSlideTimer(),(e.has("recipe")||e.has("settings"))&&this.recipe&&(this.settings?.keepScreenOn?this._requestWakeLock():this._releaseWakeLock()),e.has("recipe")&&!this.recipe&&this._releaseWakeLock(),e.has("shoppingLists")&&this.shoppingLists.length&&!this._selectedListId&&(this._selectedListId=this.shoppingLists[0]?.id??"")}_formatTime(e){if(!e)return null;if(e<60)return c(ce`${e} min`);let i=Math.floor(e/60),t=e%60;return t?c(ce`${i}h ${t}m`):c(ce`${i}h`)}_scaleAmount(e){return ar(e,this._servingMult)}_startEdit(){let e=this.recipe.nutrition||{};this._editData={nutrition_basis:this.recipe.nutrition_basis||"unknown",declared_nutrition:{...this.recipe.declared_nutrition||{}},name:this.recipe.name||"",description:this.recipe.description||"",source_url:this.recipe.source_url||"",servings:this.recipe.servings||"",prep_time:this.recipe.prep_time||"",cook_time:this.recipe.cook_time||"",tags:[...this.recipe.tags||[]],courses:[...this.recipe.courses||[]],categories:[...this.recipe.categories||[]],collections:[...this.recipe.collections||[]],notes:this.recipe.notes||"",rating:this.recipe.rating||0,image_url:this.recipe.media_refs?.image_url??this.recipe.image_url??"",photos:[...this.recipe.media_refs?.photos??this.recipe.photos??[]],ingredients:[...this.recipe.ingredients||[]],instructions:[...this.recipe.instructions||[]],cal:e.calories??"",fat:e.fat??"",satf:e.saturated_fat??"",chol:e.cholesterol??"",sod:e.sodium??"",carb:e.carbohydrates??"",fib:e.fiber??"",sug:e.sugar??"",prot:e.protein??""},this._editing=!0}_cancelEdit(){this._editing=!1,this._editData={}}_handleEditField(e,i){this._editData={...this._editData,[e]:i}}_renderListPicker(e,i,t){let r=this._editData[e]||[],a=this._tagPickerField===e,s=(t||[]).filter(g=>!r.includes(g)),d=a?this._tagPickerInput:"";return u`
      <div class="edit-field list-picker-field">
        <label>${i}</label>
        <div class="list-picker-wrap">
          <!-- Selected chips -->
          <div class="list-picker-chips">
            ${r.map(g=>u`
              <span class="list-chip selected">
                ${g}
                <button class="list-chip-remove" @click=${()=>this._toggleListValue(e,g)} title="${c("Remove")}">×</button>
              </span>
            `)}
            <button class="list-chip-add-btn" @click=${()=>{this._tagPickerField=a?null:e,this._tagPickerInput=""}} title="${c(ce`Add ${i.toLowerCase()}`)}">
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
          <!-- Picker dropdown -->
          ${a?u`
            <div class="list-picker-dropdown">
              ${s.length?u`
                <div class="list-picker-existing">
                  ${s.map(g=>u`
                    <span class="list-chip available" @click=${()=>{this._toggleListValue(e,g)}}>
                      ${g}
                    </span>
                  `)}
                </div>
              `:""}
              <div class="list-picker-new-row">
                <input class="list-picker-input" type="text" placeholder="${c(ce`New ${i.toLowerCase()}…`)}"
                  .value=${d}
                  @input=${g=>{this._tagPickerInput=g.target.value}}
                  @keydown=${g=>{g.key==="Enter"&&(g.preventDefault(),this._addListValue(e,this._tagPickerInput)),g.key==="Escape"&&(this._tagPickerField=null)}}
                />
                <button class="list-picker-new-btn" @click=${()=>this._addListValue(e,this._tagPickerInput)}
                  ?disabled=${!this._tagPickerInput.trim()}>
                  ${c("Add")}
                </button>
              </div>
            </div>
          `:""}
        </div>
      </div>
    `}_toggleListValue(e,i){let t=this._editData[e]||[],r=t.includes(i)?t.filter(a=>a!==i):[...t,i];this._editData={...this._editData,[e]:r}}_addListValue(e,i){let t=(i||"").trim();if(!t)return;let r=this._editData[e]||[];r.includes(t)||(this._editData={...this._editData,[e]:[...r,t]}),this._tagPickerInput="",this._tagPickerField=null}_startEditIngredient(e){let i=(this._editData.ingredients||[])[e];if(i)if(i.is_heading||i.name?.startsWith("#")){let t=i.name?.startsWith("#")?i.name.slice(1).trim():i.name;this._editIngEdit={idx:e,heading:!0,name:t}}else this._editIngEdit={idx:e,heading:!1,amount:i.amount||"",unit:i.unit||"",name:i.name||""}}_saveEditIngredient(){let e=this._editIngEdit;if(!e)return;let i=[...this._editData.ingredients||[]];e.heading?i[e.idx]={name:`# ${e.name}`,is_heading:!0}:i[e.idx]={amount:e.amount,unit:e.unit,name:e.name},this._editData={...this._editData,ingredients:i},this._editIngEdit=null}_cancelEditIngredient(){this._editIngEdit=null}_editAddIngredient(){let e=this._editIngInput.trim();if(!e)return;let i;if(e.startsWith("#"))i={name:e,is_heading:!0};else{let t=e.split(/\s+/),r="",a="",s="";t.length>=3&&!isNaN(parseFloat(t[0]))?(r=t[0],a=t[1],s=t.slice(2).join(" ")):t.length===2&&!isNaN(parseFloat(t[0]))?(r=t[0],s=t[1]):s=e,i={amount:r,unit:a,name:s}}this._editData={...this._editData,ingredients:[...this._editData.ingredients||[],i]},this._editIngInput=""}_editRemoveIngredient(e){this._editData={...this._editData,ingredients:(this._editData.ingredients||[]).filter((i,t)=>t!==e)}}_editMoveIngredient(e,i){let t=[...this._editData.ingredients||[]],r=e+i;r<0||r>=t.length||([t[e],t[r]]=[t[r],t[e]],this._editData={...this._editData,ingredients:t})}_editMoveStep(e,i){let t=[...this._editData.instructions||[]],r=e+i;r<0||r>=t.length||([t[e],t[r]]=[t[r],t[e]],this._editData={...this._editData,instructions:t})}_editDropIngredient(e,i){if(e===i||e<0||i<0)return;let t=[...this._editData.ingredients||[]],[r]=t.splice(e,1);t.splice(i,0,r),this._editData={...this._editData,ingredients:t},this._dragIngOver=-1,this._dragIngFrom=-1}_editDropStep(e,i){if(e===i||e<0||i<0)return;let t=[...this._editData.instructions||[]],[r]=t.splice(e,1);t.splice(i,0,r),this._editData={...this._editData,instructions:t},this._dragStepOver=-1,this._dragStepFrom=-1}_editAddStep(e){e.trim()&&(this._editData={...this._editData,instructions:[...this._editData.instructions||[],e.trim()]})}_editRemoveStep(e){this._editData={...this._editData,instructions:(this._editData.instructions||[]).filter((i,t)=>t!==e)}}async _editUploadImage(e){if(!e||!this.recipe?.id)return;this._editImageUploading=!0;let i=new FileReader;i.onload=async t=>{let r=t.target.result.split(",")[1];try{let a=await this.api.uploadRecipeImage(this.recipe.id,r),s=a?.image_url||a?.local_url;s&&(this._editData={...this._editData,image_url:this._editData.image_url||s,photos:[...new Set([...this._editData.photos||[],s])]})}catch(a){console.warn("Image upload failed:",a)}finally{this._editImageUploading=!1}},i.readAsDataURL(e)}async _saveEdit(){let e=this._editData,i={},t={cal:"calories",fat:"fat",satf:"saturated_fat",chol:"cholesterol",sod:"sodium",carb:"carbohydrates",fib:"fiber",sug:"sugar",prot:"protein"},r=!1;for(let[s,d]of Object.entries(t))e[s]!==""&&e[s]!=null&&(i[d]=e[s],r=!0);let a={name:e.name,description:e.description,source_url:e.source_url,image_url:e.image_url||null,servings:e.servings===""?null:Number(e.servings),prep_time:e.prep_time===""?null:Number(e.prep_time),cook_time:e.cook_time===""?null:Number(e.cook_time),tags:Array.isArray(e.tags)?e.tags:[],courses:Array.isArray(e.courses)?e.courses:[],categories:Array.isArray(e.categories)?e.categories:[],collections:Array.isArray(e.collections)?e.collections:[],notes:e.notes,rating:e.rating||null,photos:e.photos||[],ingredients:e.ingredients||[],instructions:e.instructions||[],nutrition:r?i:null,nutrition_basis:e.nutrition_basis||"unknown",declared_nutrition:xt(e.declared_nutrition)};try{await this.api.updateRecipe(this.recipe.id,a),this._editing=!1,this.dispatchEvent(new CustomEvent("rm-recipe-saved",{bubbles:!0,composed:!0}))}catch(s){this._saveError=s.message,this.requestUpdate()}}_handleToggleFav(){this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}async _handleDownloadImage(){if(this.recipe.image_url){this._downloading=!0;try{let e=await this.api.downloadRecipeImage(this.recipe.id,this.recipe.image_url);e?.local_url&&this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e.local_url}},bubbles:!0,composed:!0}))}catch(e){console.warn("Image download failed:",e)}finally{this._downloading=!1}}}_handleDeleteRecipe(){if(!this._confirmDelete){this._confirmDelete=!0,setTimeout(()=>{this._confirmDelete=!1},3e3);return}this.dispatchEvent(new CustomEvent("rm-delete-recipe",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}_openShoppingPicker(){this._checkedIngredients=new Set,this._showShoppingPicker=!0}_toggleIngredient(e){let i=new Set(this._checkedIngredients);i.has(e)?i.delete(e):i.add(e),this._checkedIngredients=i}_selectAllIngredients(){let e=this.recipe?.ingredients?.length??0;this._checkedIngredients=new Set([...Array(e).keys()])}_clearAllIngredients(){this._checkedIngredients=new Set}async _handleAddToShopping(){let e=this._checkedIngredients;if(!e?.size)return;let i=(this.recipe.ingredients||[]).map((r,a)=>({...r,ingredientIndex:a})).filter(r=>e.has(r.ingredientIndex)&&!r.is_heading&&!r.name?.startsWith("#")).map(r=>({...r,amount:this._scaleAmount(r.amount)}));if(!this.slmAvailable||!this._selectedListId){await this._dispatchShoppingAdd(i.map(r=>({ing:r,selectedId:null,products:[]})));return}this._shoppingAdding=!0;let t=await Promise.all(i.map(async r=>{try{let s=(await this.api.searchSlmProducts(r.name,4))?.products??[],d=s.find(g=>g.name.toLowerCase()===r.name.toLowerCase());return{ing:r,products:s,selectedId:d?.id??null}}catch{return{ing:r,products:[],selectedId:null}}}));this._shoppingAdding=!1,this._shoppingReview=t}_selectReviewMatch(e,i){this._shoppingReview=this._shoppingReview.map((t,r)=>r===e?{...t,selectedId:i}:t)}async _confirmShoppingReview(){await this._dispatchShoppingAdd(this._shoppingReview)}async _dispatchShoppingAdd(e=[]){if(this._selectedListId){this._shoppingAdding=!0,this._shoppingResult=null;try{let i=e.map(r=>r.ing.ingredientIndex),t=e.filter(r=>r.selectedId!==null).map(r=>({ingredient_index:r.ing.ingredientIndex,product_id:r.selectedId}));await this.api.recipeToShopping(this.recipe.id,this._selectedListId,(this.recipe.servings||1)*this._servingMult,i,t),this._shoppingResult="success",this._shoppingReview=null,this._showShoppingPicker=!1}catch{this._shoppingResult="error"}finally{this._shoppingAdding=!1}}}_renderShoppingReview(){let e=this._shoppingReview;return e?u`
      <div class="shopping-review-panel">
        <div class="review-title">${c("Match Items to Products")}</div>
        ${this._shoppingResult==="error"?u`<p role="alert">${this.api.transport.locale?.startsWith("de")?"Keine Best\xE4tigung erhalten. Pr\xFCfe die Verbindung und die Unterst\xFCtzung f\xFCr die genaue Produktauswahl. Wiederhole unklare Schreibvorg\xE4nge nur mit derselben Anfrage.":"No transfer confirmation received. Check the connection and exact catalog-selection support. Retry uncertain writes only with the same request."}</p>`:""}
        <div class="review-list">
          ${e.map((i,t)=>u`
            <div class="review-row">
              <div class="review-ing">
                ${i.ing.amount?u`<span class="review-qty">${i.ing.amount}${i.ing.unit?` ${i.ing.unit}`:""}</span>`:""}
                <span class="review-ing-name">${i.ing.name}</span>
              </div>
              <div class="review-chips">
                ${i.products.slice(0,3).map(r=>u`
                  <button class="review-chip ${i.selectedId===r.id?"selected":""}"
                    @click=${()=>this._selectReviewMatch(t,r.id)}>
                    ${i.selectedId===r.id?u`<ha-icon icon="mdi:check"></ha-icon>`:""}${r.name}
                  </button>
                `)}
                <button class="review-chip manual ${i.selectedId===null?"selected":""}"
                  @click=${()=>this._selectReviewMatch(t,null)}>
                  ${i.selectedId===null?u`<ha-icon icon="mdi:check"></ha-icon>`:""}${c("Add manually")}
                </button>
              </div>
            </div>
          `)}
        </div>
        <div class="picker-btns review-btns">
          <button class="action-btn" @click=${()=>{this._shoppingReview=null}}>${c("Back")}</button>
          <button class="action-btn primary"
            ?disabled=${this._shoppingAdding}
            @click=${this._confirmShoppingReview}>
            ${this._shoppingAdding?u`<ha-circular-progress active size="tiny"></ha-circular-progress>`:c(ce`Confirm & Add ${e.length}`)}
          </button>
        </div>
      </div>
    `:u``}_handleQuickRate(e){let i=this.recipe.rating===e?null:e;this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{rating:i}},bubbles:!0,composed:!0}))}_handleShowPlanner(){this.dispatchEvent(new CustomEvent("rm-show-planner",{bubbles:!0,composed:!0}))}_handleChipNav(e,i){this.dispatchEvent(new CustomEvent("rm-chip-nav",{detail:{filterMode:e,value:i},bubbles:!0,composed:!0}))}_fireTimer(e,i){let t=this.recipe?.name,r=t?c(ce`${t} — ${i}`):i;this.dispatchEvent(new CustomEvent("rm-start-timer",{detail:{seconds:e,label:r},bubbles:!0,composed:!0}))}async _handleAddPhotoUrl(){let e=this._photoUrlInput.trim();if(e){this._addingPhotoUrl=!0;try{let r={photos:[...this.recipe.photos||[],e]};this.recipe.image_url||(r.image_url=e),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:r},bubbles:!0,composed:!0})),this._photoUrlInput=""}finally{this._addingPhotoUrl=!1}}}_handleCameraCapture(e){let i=e.target.files?.[0];if(!i)return;let t=new FileReader;t.onload=async r=>{let a=r.target.result.split(",")[1];try{await this.api.uploadRecipeImage(this.recipe.id,a)}catch(s){console.warn("Camera upload failed:",s)}},t.readAsDataURL(i)}_setMainPhoto(e){this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e}},bubbles:!0,composed:!0}))}_removePhoto(e){let i=(this.recipe.photos||[]).filter(r=>r!==e),t={photos:i};this.recipe.image_url===e&&(t.image_url=i[0]||null),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:t},bubbles:!0,composed:!0}))}_getSlideImages(){let e=this.recipe;if(!e)return[];let i=[e.image_url,...e.photos||[]].filter(Boolean);return[...new Set(i)]}_prevSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx-1+e.length)%e.length,this._startSlideTimer())}_nextSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx+1)%e.length,this._startSlideTimer())}_startSlideTimer(){this._stopSlideTimer();let e=this.settings?.slideshowInterval??5;e<=0||this._getSlideImages().length<2||(this._slideTimer=setInterval(()=>{this._slideIdx=(this._slideIdx+1)%this._getSlideImages().length},e*1e3))}_stopSlideTimer(){this._slideTimer&&(clearInterval(this._slideTimer),this._slideTimer=null)}_slideTouchStart(e){this._slideTouchStartX=e.touches[0]?.clientX??null}_slideTouchEnd(e){if(this._slideTouchStartX==null)return;let i=(e.changedTouches[0]?.clientX??0)-this._slideTouchStartX;this._slideTouchStartX=null,!(Math.abs(i)<50)&&(i<0?this._nextSlide():this._prevSlide())}_renderSlideshow(e){let i=this._getSlideImages(),t=Math.min(this._slideIdx,i.length-1),r=i.length>1,a=i[t]||null;return u`
      <div class="wide-image-square"
        @touchstart=${r?this._slideTouchStart:null}
        @touchend=${r?this._slideTouchEnd:null}>
        ${a?u`<img src="${this.api.transport.previewURL(a)||He}" alt="${e.name}" />`:u`
          <div class="hero-placeholder">
            <ha-icon icon="mdi:food"></ha-icon>
          </div>
        `}
        ${r?u`
          <button class="slide-btn slide-prev" @click=${this._prevSlide} title="${c("Previous")}">
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <button class="slide-btn slide-next" @click=${this._nextSlide} title="${c("Next")}">
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </button>
          <div class="slide-dots">
            ${i.map((s,d)=>u`<span class="slide-dot ${d===t?"active":""}"></span>`)}
          </div>
        `:""}
      </div>
    `}_renderChipGroup(e,i,t){return i?.length?u`
      <div class="chip-group">
        <span class="chip-group-label">${e}:</span>
        ${i.map(r=>u`<span class="chip ${t}">${r}</span>`)}
      </div>
    `:""}_renderChipGroups(e){let i=e.courses||[],t=e.categories||[],r=e.collections||[];return!i.length&&!t.length&&!r.length?"":u`
      <div class="chips-area">
        ${i.length?u`
          <div class="chip-group-row">
            <span class="chip chip-label">${c("Course:")}</span>
            ${i.map(a=>u`<button class="chip chip-course chip-nav" @click=${()=>this._handleChipNav("courses",a)} title="${c(ce`Filter by course: ${a}`)}">${a}</button>`)}
          </div>`:""}
        ${t.length?u`
          <div class="chip-group-row">
            <span class="chip chip-label">${c("Category:")}</span>
            ${t.map(a=>u`<button class="chip chip-category chip-nav" @click=${()=>this._handleChipNav("categories",a)} title="${c(ce`Filter by category: ${a}`)}">${a}</button>`)}
          </div>`:""}
        ${r.length?u`
          <div class="chip-group-row">
            <span class="chip chip-label">${c("Collection:")}</span>
            ${r.map(a=>u`<button class="chip chip-collection chip-nav" @click=${()=>this._handleChipNav("collections",a)} title="${c(ce`Filter by collection: ${a}`)}">${a}</button>`)}
          </div>`:""}
      </div>
    `}_renderMetaRow(e){if(!(e.servings||e.prep_time||e.cook_time||e.total_time))return"";let t=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null,r=(e.prep_time||0)+(e.cook_time||0),a=t&&t!==r;return u`
      <div class="meta-chips">
        ${e.servings?u`
          <span class="meta-chip-icon">
            <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
            ${e.servings_text||e.servings}
          </span>
        `:""}
        ${e.prep_time?u`
          <span class="meta-chip-icon">
            <ha-icon icon="mdi:pencil-outline"></ha-icon>
            ${this._formatTime(e.prep_time)}
          </span>
        `:""}
        ${e.cook_time?u`
          <span class="meta-chip-icon">
            <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
            ${this._formatTime(e.cook_time)}
          </span>
        `:""}
        ${a?u`
          <span class="meta-chip-icon">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            ${this._formatTime(t)}
          </span>
        `:""}
      </div>
    `}_renderQuickRating(e){let i=e.rating||0;return u`
      <div class="quick-rating">
        ${[1,2,3,4,5].map(t=>u`
          <span class="qr-star ${t<=i?"filled":""}"
            @click=${()=>this._handleQuickRate(t)}>★</span>
        `)}
      </div>
    `}_renderActionButtons(e){return u`
      <div class="action-btns-row">
        <button class="action-icon-btn ${e.is_favourite?"fav-active":""}"
          @click=${this._handleToggleFav}
          title="${e.is_favourite?c("Remove from favourites"):c("Add to favourites")}">
          <span class="btn-icon"><ha-icon icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"></ha-icon></span>
          <span>${c("Favourite")}</span>
        </button>
        <button class="action-icon-btn" @click=${this._handleShowPlanner} title="${c("Add to meal plan")}">
          <span class="btn-icon"><ha-icon icon="mdi:calendar-plus"></ha-icon></span>
          <span>${c("Plan")}</span>
        </button>
        ${e.source_url?u`
          <a class="action-icon-btn" href="${e.source_url}" target="_blank" rel="noopener" title="${c("Open source")}">
            <span class="btn-icon"><ha-icon icon="mdi:open-in-new"></ha-icon></span>
            <span>${c("Source")}</span>
          </a>
        `:""}
        <button class="action-icon-btn" @click=${this._startEdit} title="${c("Edit recipe")}">
          <span class="btn-icon"><ha-icon icon="mdi:pencil-outline"></ha-icon></span>
          <span>${c("Edit")}</span>
        </button>
      </div>
    `}_renderScaler(){return this.recipe?.servings?u`
      <div class="scaler-row">
        <ha-icon class="scaler-icon" icon="mdi:silverware-fork-knife"></ha-icon>
        <div class="scaler-ctrl">
          <button class="scaler-btn" @click=${()=>{this._servingMult>.25&&(this._servingMult=Math.round((this._servingMult-.25)*4)/4)}}>
            <ha-icon icon="mdi:minus"></ha-icon>
          </button>
          <span class="scaler-val">×${this._servingMult}</span>
          <button class="scaler-btn" @click=${()=>{this._servingMult=Math.round((this._servingMult+.25)*4)/4}}>
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>
    `:""}_renderWakeLock(){return this.settings?.keepScreenOn?Ee()?u`
      <div class="wakelock-row">
        <button class="wakelock-btn ${this._wakeActive?"active":""}"
          @click=${()=>this._wakeActive?this._releaseWakeLock():this._requestWakeLock()}
          title="${this._wakeActive?c("Release screen lock"):c("Keep screen on")}">
          <ha-icon icon="${this._wakeActive?"mdi:eye":"mdi:eye-off-outline"}"></ha-icon>
          ${this._wakeActive?c("Screen on"):c("Keep screen on")}
        </button>
      </div>
    `:u`
        <div class="wakelock-row">
          <span class="wakelock-unsupported"
            title="${c("Requires a secure (HTTPS) connection and a browser that supports the Wake Lock API")}">
            <ha-icon icon="mdi:eye-off-outline"></ha-icon>
            ${c("Screen lock unavailable")}
          </span>
        </div>
      `:""}render(){if(!this.recipe)return u``;let e=this.recipe;return this.wide?this._renderWide(e):this._renderNarrow(e)}_renderWide(e){let i=this._groupIngredients(e.ingredients),t=this._showShoppingPicker,r=this._checkedIngredients,a=r?.size??0;return u`
      <div class="detail-container wide">
        <!--
          CSS grid: 2 cols (1fr 2fr) × auto rows
          [image]   [info card]
          [ings]    [directions]
          Whole card scrolls — no independent column scrolling
        -->
        <div class="wide-layout">

          <!-- row 1: image (1/3) + info card (2/3) -->
          <div class="wide-row">

          <!-- col 1: square image card (padding-top:100% inner wrapper forces square) -->
          <div class="wide-image-card">
            ${this._renderSlideshow(e)}
          </div>

          <!-- col 2: info card -->
          <div class="wide-info-card">
            <h1 class="wide-title">${e.name}</h1>
            ${this._renderActionButtons(e)}
            <mm-recipe-log .api=${this.api.transport} .recipe=${e} .servings=${(e.servings||1)*this._servingMult}></mm-recipe-log>
            ${e.description?u`<div class="wide-desc md-content">${Je(e.description)}</div>`:""}
            ${this._renderMetaRow(e)}
            ${this._renderChipGroups(e)}
          </div>

          </div><!-- end wide-row 1 -->

          <!-- row 2: ingredients (1/3) + directions (2/3) -->
          <div class="wide-row">

          <!-- col 1: ingredients column -->
          <div class="wide-ing-col">
            <!-- ingredients controls: scaler left, cart right — above ingredients only -->
            <div class="wide-ing-controls">
              ${this._renderScaler()}
              ${this._shoppingResult==="success"?u`
                <span class="ing-shop-success"><ha-icon icon="mdi:check-circle-outline"></ha-icon></span>
              `:u`
                <button class="ing-shop-btn ${t?"active":""}"
                  @click=${t?()=>{this._showShoppingPicker=!1}:this._openShoppingPicker}
                  title="${t?c("Cancel"):c("Add to shopping list")}">
                  <ha-icon icon="${t?"mdi:close":"mdi:cart-plus"}"></ha-icon>
                </button>
              `}
            </div>

            <!-- shopping picker / review (shown inline when picking) -->
            ${t?this._shoppingReview?u`
              <div class="wide-section-card">${this._renderShoppingReview()}</div>
            `:u`
              <div class="wide-section-card shopping-picker-panel">
                <div class="picker-select-row">
                  <button class="picker-sel-btn" @click=${this._selectAllIngredients}>${c("Select All")}</button>
                  <button class="picker-sel-btn" @click=${this._clearAllIngredients}>${c("Clear All")}</button>
                  ${this.slmAvailable&&this.shoppingLists.length?u`
                    <select class="list-select" .value=${this._selectedListId}
                      @change=${s=>{this._selectedListId=s.target.value}}>
                      ${this.shoppingLists.map(s=>u`
                        <option value="${s.id}" ?selected=${s.id===this._selectedListId}>${s.name}</option>
                      `)}
                    </select>
                  `:""}
                </div>
                <div class="picker-btns">
                  <button class="action-btn" @click=${()=>{this._showShoppingPicker=!1}}>${c("Cancel")}</button>
                  <button class="action-btn primary"
                    ?disabled=${this._shoppingAdding||!a}
                    @click=${this._handleAddToShopping}>
                    ${this._shoppingAdding?u`<ha-circular-progress active size="tiny"></ha-circular-progress>`:a?c(ce`Add (${a})`):c("Add")}
                  </button>
                </div>
              </div>
            `:""}

            ${i.map(s=>u`
              <div class="wide-section-card">
                ${s.header?u`<div class="wide-section-title">${s.header}</div>`:""}
                ${s.items.length?u`
                  <ul class="ingredient-list">
                    ${s.items.map(d=>{let g=(e.ingredients||[]).indexOf(d),{amount:x,unit:$}=this._getDisplayAmount(d);return u`
                        <li class="ingredient-item ${t?"selectable":""}"
                          @click=${t?()=>this._toggleIngredient(g):void 0}>
                          ${t?u`
                            <span class="ing-check ${r?.has(g)?"checked":""}">
                              ${r?.has(g)?u`<ha-icon icon="mdi:check"></ha-icon>`:""}
                            </span>
                          `:""}
                          <span class="ing-amount">${x} ${$}</span>
                          <span class="ing-name">${d.name}${d.notes?u` <em class="ing-notes">(${d.notes})</em>`:""}</span>
                        </li>
                      `})}
                  </ul>
                `:""}
              </div>
            `)}

            <div class="wide-section-card">
              ${this._renderNutritionRing(e)}
            </div>
          </div>

          <!-- col 2: directions column, each step its own card -->
          <div class="wide-dir-col">
            <div class="wide-dir-spacer"></div>
            ${this._renderWakeLock()}
            ${(e.instructions||[]).length?(e.instructions||[]).map((s,d)=>{let g=this._completedSteps.has(d);return u`
                <div class="wide-section-card wide-step-card ${g?"step-done":""}">
                  <span class="step-num ${g?"done":""}"
                    @click=${x=>{x.stopPropagation(),this._toggleStepComplete(d)}}
                    title="${g?c("Mark incomplete"):c("Mark complete")}"
                  >${g?u`<ha-icon icon="mdi:check"></ha-icon>`:d+1}</span>
                  <span class="step-text">${this._renderStepWithTimers(s)}</span>
                </div>
              `}):u`<p class="empty-tab">${c("No directions listed.")}</p>`}
            ${e.notes?u`
              <div class="wide-section-card">
                <div class="wide-section-title">${c("Notes")}</div>
                <div class="notes-text md-content">${Je(e.notes)}</div>
              </div>
            `:""}
          </div>

          </div><!-- end wide-row 2 -->

        </div>

        <!-- Edit overlay -->
        ${this._editing?this._renderEditPanel():""}
      </div>
    `}_renderNarrow(e){let i=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return u`
      <div class="detail-container">
        <!-- Hero image -->
        <div class="hero ${e.image_url?"":"no-image"}">
          ${e.image_url?u`
            <img src="${this.api.transport.previewURL(e.image_url)||He}" alt="${e.name}" />
            <div class="hero-overlay"></div>
          `:u`
            <div class="hero-placeholder">
              <ha-icon icon="mdi:food"></ha-icon>
            </div>
          `}
          <div class="hero-actions">
            <button class="hero-btn ${e.is_favourite?"fav-active":""}" @click=${this._handleToggleFav}
              title="${e.is_favourite?c("Remove from favourites"):c("Add to favourites")}">
              <ha-icon icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"></ha-icon>
            </button>
            ${e.source_url?u`
              <a class="hero-btn" href="${e.source_url}" target="_blank" rel="noopener" title="${c("Open source")}">
                <ha-icon icon="mdi:open-in-new"></ha-icon>
              </a>
            `:""}
          </div>
        </div>

        <div class="detail-scroll">
          <!-- Recipe meta -->
          <div class="detail-head">
            <h2 class="recipe-title">${e.name}</h2>
            ${this._renderActionButtons(e)}
            <mm-recipe-log .api=${this.api.transport} .recipe=${e} .servings=${(e.servings||1)*this._servingMult}></mm-recipe-log>
            ${e.description?u`<div class="detail-desc md-content">${Je(e.description)}</div>`:""}

            <div class="meta-row">
              ${e.prep_time?u`
                <div class="meta-item">
                  <span class="meta-label">${c("Prep")}</span>
                  <span class="meta-val">${this._formatTime(e.prep_time)}</span>
                </div>
              `:""}
              ${e.cook_time?u`
                <div class="meta-item">
                  <span class="meta-label">${c("Cook")}</span>
                  <span class="meta-val">${this._formatTime(e.cook_time)}</span>
                </div>
              `:""}
              ${i?u`
                <div class="meta-item">
                  <span class="meta-label">${c("Total")}</span>
                  <span class="meta-val">${this._formatTime(i)}</span>
                </div>
              `:""}
              ${e.servings?u`
                <div class="meta-item">
                  <span class="meta-label">${c("Serves")}</span>
                  <span class="meta-val">${e.servings_text||e.servings}</span>
                </div>
              `:""}
            </div>

            ${this._renderChipGroups(e)}
          </div>

          <!-- Serving scaler -->
          ${this._renderScaler()}

          <!-- Tabs -->
          <div class="tabs-row">
            ${[["ingredients",c("Ingredients")],["directions",c("Directions")],["notes",c("Notes")],["nutrition",c("Nutrition")],["photos",c("Photos")]].map(([t,r])=>u`
              <button
                class="tab-btn ${this._activeTab===t?"active":""}"
                @click=${()=>{this._activeTab=t}}
              >${r}</button>
            `)}
          </div>

          <!-- Wake lock button (shown when setting enabled) -->
          ${this._renderWakeLock()}

          <!-- Tab content -->
          <div class="tab-content">
            ${this._activeTab==="ingredients"?this._renderIngredients(e):""}
            ${this._activeTab==="directions"?this._renderDirections(e):""}
            ${this._activeTab==="notes"?this._renderNotes(e):""}
            ${this._activeTab==="nutrition"?this._renderNutritionRing(e):""}
            ${this._activeTab==="photos"?this._renderPhotos(e):""}
          </div>
        </div>

        <!-- Edit panel (inline overlay) -->
        ${this._editing?this._renderEditPanel():""}
      </div>
    `}_getDisplayAmount(e){if(this._metricMode){let i=fa(this._scaleAmount(e.amount),e.unit);if(i)return i}return{amount:this._scaleAmount(e.amount)||"",unit:e.unit||""}}_groupIngredients(e){let i=[],t={header:null,items:[]};for(let r of e||[])r.is_heading||r.name?.startsWith("#")?((t.items.length>0||t.header!==null)&&i.push(t),t={header:(r.name?.startsWith("#")?r.name.slice(1).trim():r.name)||"",items:[]}):t.items.push(r);return(t.items.length>0||t.header!==null)&&i.push(t),i.length?i:[{header:null,items:e||[]}]}_renderIngredients(e){let i=this._showShoppingPicker,t=this._checkedIngredients,r=t?.size??0,a=(e.ingredients||[]).some(s=>s.unit&&br[s.unit.toLowerCase().trim()]);return u`
      ${this.settings?.showUnitConversion&&a?u`
        <div class="metric-toggle-row">
          <button class="metric-btn ${this._metricMode?"active":""}"
            @click=${()=>{this._metricMode=!this._metricMode}}>
            <ha-icon icon="mdi:swap-horizontal"></ha-icon>
            ${this._metricMode?c("Showing metric"):c("Convert to metric")}
          </button>
        </div>
      `:""}

      ${e.ingredients?.length?u`
        <ul class="ingredient-list">
          ${e.ingredients.map((s,d)=>{if(s.is_heading||s.name?.startsWith("#")){let $=s.name?.startsWith("#")?s.name.slice(1).trim():s.name;return u`<li class="ing-heading">${$}</li>`}let{amount:g,unit:x}=this._getDisplayAmount(s);return u`
              <li class="ingredient-item ${i?"selectable":""}"
                @click=${i?()=>this._toggleIngredient(d):void 0}>
                ${i?u`
                  <span class="ing-check ${t?.has(d)?"checked":""}">
                    ${t?.has(d)?u`<ha-icon icon="mdi:check"></ha-icon>`:""}
                  </span>
                `:""}
                <span class="ing-amount">${g} ${x}</span>
                <span class="ing-name">${s.name}${s.notes?u` <em class="ing-notes">(${s.notes})</em>`:""}</span>
              </li>
            `})}
        </ul>
      `:u`<p class="empty-tab">${c("No ingredients listed.")}</p>`}

      <!-- Shopping section (always shown) -->
      <div class="shopping-section">
        ${this._shoppingResult==="success"?u`
          <div class="shopping-success">
            <ha-icon icon="mdi:check-circle-outline"></ha-icon>
            ${c("Added to shopping list!")}
          </div>
        `:i&&this._shoppingReview?this._renderShoppingReview():i?u`
          <div class="shopping-picker-panel">
            <div class="picker-select-row">
              <button class="picker-sel-btn" @click=${this._selectAllIngredients}>${c("Select All")}</button>
              <button class="picker-sel-btn" @click=${this._clearAllIngredients}>${c("Clear All")}</button>
              ${this.slmAvailable&&this.shoppingLists.length?u`
                <select class="list-select" .value=${this._selectedListId}
                  @change=${s=>{this._selectedListId=s.target.value}}>
                  ${this.shoppingLists.map(s=>u`
                    <option value="${s.id}" ?selected=${s.id===this._selectedListId}>${s.name}</option>
                  `)}
                </select>
              `:this.slmAvailable?u`
                <span class="shopping-note">${c("No lists found in Shopping List Manager")}</span>
              `:""}
            </div>
            <div class="picker-btns">
              <button class="action-btn" @click=${()=>{this._showShoppingPicker=!1}}>${c("Cancel")}</button>
              <button class="action-btn primary"
                ?disabled=${this._shoppingAdding||!r}
                @click=${this._handleAddToShopping}>
                ${this._shoppingAdding?u`<ha-circular-progress active size="tiny"></ha-circular-progress>`:r?c(ce`Add (${r})`):c("Add")}
              </button>
            </div>
          </div>
        `:u`
          <button class="action-btn primary shopping-btn" @click=${this._openShoppingPicker}>
            <ha-icon icon="mdi:cart-plus"></ha-icon>
            ${c("Add to Shopping List")}
          </button>
        `}
      </div>
    `}_toggleStepComplete(e){let i=new Set(this._completedSteps);i.has(e)?i.delete(e):i.add(e),this._completedSteps=i}_renderDirections(e){return e.instructions?.length?u`
      <ol class="steps-list">
        ${e.instructions.map((i,t)=>{let r=this._completedSteps.has(t);return u`
            <li class="step-item ${r?"step-done":""}">
              <span class="step-num ${r?"done":""}"
                @click=${a=>{a.stopPropagation(),this._toggleStepComplete(t)}}
                title="${r?c("Mark incomplete"):c("Mark complete")}"
              >${r?u`<ha-icon icon="mdi:check"></ha-icon>`:t+1}</span>
              <span class="step-text">${this._renderStepWithTimers(i)}</span>
            </li>
          `})}
      </ol>
    `:u`<p class="empty-tab">${c("No directions listed.")}</p>`}_renderStepWithTimers(e){let i=[],t=0,r;for(vr.lastIndex=0;(r=vr.exec(e))!==null;){r.index>t&&i.push(e.slice(t,r.index));let a=r[0],s=ha(a);s>0?i.push(u`<button class="time-chip" @click=${d=>{d.stopPropagation(),this._fireTimer(s,a)}} title="${c(ce`Start timer for ${a}`)}">
          <ha-icon icon="mdi:timer-outline"></ha-icon>${a}
        </button>`):i.push(a),t=r.index+r[0].length}return t<e.length&&i.push(e.slice(t)),i}_renderNotes(e){return u`
      ${e.notes?u`<div class="notes-text md-content">${Je(e.notes)}</div>`:u`<p class="empty-tab">${c("No notes.")}</p>`}
    `}_renderNutrition(e){let i=e.nutrition||{};if(!gr.some(a=>i[a.key]!=null&&i[a.key]!==""))return u`
        <div class="empty-tab">
          <p>${c("No nutrition info. Add it via the edit panel.")}</p>
        </div>
      `;let r=e.servings?c(ce`Per serving (${e.servings_text||e.servings})`):c("Per serving");return u`
      <div class="nutrition-panel">
        <div class="nutr-header">${c("Nutrition Facts")}</div>
        <div class="nutr-sub">${r}</div>
        <div class="nutr-divider thick"></div>
        ${gr.map(a=>{let s=i[a.key];return s==null||s===""?"":u`
            <div class="nutr-row ${a.bold?"nutr-bold":""} ${a.indent?"nutr-indent":""}">
              <span class="nutr-label">${a.label}</span>
              <span class="nutr-val">${s}${a.unit!=="kcal"?u`<em> ${a.unit}</em>`:""}</span>
            </div>
            <div class="nutr-divider"></div>
          `})}
      </div>
    `}_renderNutritionRing(e){let i=e?.declared_nutrition||{},t=P=>typeof P=="number"&&Number.isFinite(P)&&P>=0?P:null,r=t(i.calories),a=t(i.fat),s=t(i.carbs),d=t(i.protein),g=[a,s,d].every(P=>P!==null),x=a*9,$=s*4,p=d*4,y=g?x+$+p:0;if(![r,a,s,d].some(P=>P!==null))return u`
        <div class="nutr-card">
          <p class="empty-tab" style="margin:0;padding:8px 0;text-align:center">${c("No nutritional information available.")}</p>
        </div>${this._renderOriginalNutrition(e)}`;let _=[{label:c("Carbs"),val:s,cal:$,color:"#f59e0b"},{label:c("Total fat"),val:a,cal:x,color:"#3b82f6"},{label:c("Protein"),val:d,cal:p,color:"#22c55e"}],v=42,w=50,C=50,A=7,k=2*Math.PI*v,z=A+k*4/360,O=y>0?Math.max(0,$/y*k-z):0,I=y>0?Math.max(0,x/y*k-z):0,R=y>0?Math.max(0,p/y*k-z):0,S=-90,T=S+(y>0?$/y*360:0),f=T+(y>0?x/y*360:0),E=r!==null?Math.round(r):null,l=Object.entries(pa).filter(([P])=>t(i[P==="carbohydrates"?"carbs":P])!==null&&e.nutrition_basis==="per_serving").map(([P,Q])=>{let W=t(i[P==="carbohydrates"?"carbs":P]),re=Math.min(Math.round(W/Q.val*100),999);return{key:P,label:Q.label,val:W,unit:Q.unit,pct:re}});return u`
      <div class="nutr-card">
        <!-- Top row: donut ring + macro columns -->
        <div class="nutr-top">
          <div class="nutr-ring-wrap">
            <svg width="90" height="90" viewBox="0 0 100 100" style="display:block">
              <!-- Background track — always visible -->
              <circle cx="${w}" cy="${C}" r="${v}" fill="none"
                stroke="var(--rm-border)" stroke-width="7"/>
              <!-- Colored arcs: all 3 inline in the same html template so they
                   inherit SVG namespace from the parser. Hidden via opacity when
                   there's no data. Dynamic values are attributes, not new elements. -->
              <circle cx="${w}" cy="${C}" r="${v}" fill="none"
                stroke="#f59e0b" stroke-width="7" stroke-linecap="round"
                stroke-dasharray="${O} ${k}"
                transform="rotate(${S} ${w} ${C})"
                opacity="${y>0&&O>0?.95:0}"/>
              <circle cx="${w}" cy="${C}" r="${v}" fill="none"
                stroke="#3b82f6" stroke-width="7" stroke-linecap="round"
                stroke-dasharray="${I} ${k}"
                transform="rotate(${T} ${w} ${C})"
                opacity="${y>0&&I>0?.95:0}"/>
              <circle cx="${w}" cy="${C}" r="${v}" fill="none"
                stroke="#22c55e" stroke-width="7" stroke-linecap="round"
                stroke-dasharray="${R} ${k}"
                transform="rotate(${f} ${w} ${C})"
                opacity="${y>0&&R>0?.95:0}"/>
              <text x="${w}" y="${C-2}" text-anchor="middle"
                fill="var(--rm-text)" font-size="16" font-weight="700" font-family="inherit">
                ${E??"\u2013"}
              </text>
              <text x="${w}" y="${C+12}" text-anchor="middle"
                fill="var(--rm-text-secondary)" font-size="9" font-family="inherit">${c("cals")}</text>
            </svg>
          </div>

          <div class="nutr-macro-cols">
            ${_.map(P=>{let Q=y>0?Math.round(P.cal/y*100):0;return u`
                <div class="nutr-macro-col">
                  <span class="nutr-mcol-num" style="color:${P.color}">${P.val!==null?`${P.val} g`:"\u2014"}</span>
                  <span class="nutr-mcol-label">${P.label}</span>
                  ${Q>0?u`<span class="nutr-mcol-pct" style="color:${P.color}">${Q}% cals</span>`:""}
                </div>
              `})}
          </div>
        </div>

        ${e?.servings?u`
          <div class="nutr-serving-note">
            ${e.nutrition_basis==="per_serving"?c("Per serving"):e.nutrition_basis==="per_recipe"?"Per recipe":"Unknown nutrition basis"}
          </div>
        `:""}

        <!-- Daily RDA collapsible -->
        ${l.length?u`
          <button class="nutr-rda-toggle" @click=${()=>{this._nutritionExpanded=!this._nutritionExpanded}}>
            <span class="nutr-rda-title">${c("Daily RDA Nutrition")}</span>
            <span class="nutr-rda-count">${l.length}</span>
            <ha-icon icon="${this._nutritionExpanded?"mdi:chevron-up":"mdi:chevron-down"}"></ha-icon>
          </button>
          ${this._nutritionExpanded?u`
            <div class="nutr-rda-rows">
              ${l.map(P=>u`
                <div class="nutr-rda-row">
                  <span class="nutr-rda-label">${P.label}</span>
                  <span class="nutr-rda-val">${P.val} ${P.unit}</span>
                  <span class="nutr-rda-pct">${P.pct}%</span>
                  <div class="nutr-rda-bar-wrap">
                    <div class="nutr-rda-bar ${P.pct>100?"over":""}" style="width:${Math.min(P.pct,100)}%"></div>
                  </div>
                </div>
              `)}
            </div>
          `:""}
        `:""}
      </div>${this._renderOriginalNutrition(e)}
    `}_renderOriginalNutrition(e){let i=Object.entries(e.nutrition||{}).filter(([,t])=>t!==null&&t!=="");return i.length?u`<details class="nutr-original" open><summary>Original nutrition text</summary>${i.map(([t,r])=>u`<p><strong>${t}</strong> <span>${typeof r=="object"?JSON.stringify(r):r}</span></p>`)}</details>`:""}_renderPhotos(e){let i=e.photos||[],t=e.image_url,r=t?[t,...i.filter(a=>a!==t)]:i;return u`
      <div class="photos-tab">
        ${r.length?u`
          <div class="photos-grid">
            ${r.map(a=>u`
              <div class="photo-item ${a===t?"main-photo":""}">
                <img src="${this.api.transport.previewURL(a)||He}" alt="${c("Recipe photo")}" loading="lazy" />
                ${a===t?u`<span class="photo-badge">${c("Main")}</span>`:u`
                  <button class="photo-action set-main" @click=${()=>this._setMainPhoto(a)} title="${c("Set as main photo")}">
                    <ha-icon icon="mdi:star-outline"></ha-icon>
                  </button>
                `}
                <button class="photo-action remove-photo" @click=${()=>this._removePhoto(a)} title="${c("Remove photo")}">
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              </div>
            `)}
          </div>
        `:u`
          <div class="empty-tab">
            <ha-icon icon="mdi:image-off-outline"></ha-icon>
            <p>${c("No photos yet.")}</p>
          </div>
        `}

        <div class="photo-add-section">
          <div class="photo-add-label">${c("Add a photo")}</div>
          <div class="photo-url-row">
            <input
              type="url"
              class="photo-url-input"
              placeholder="${c("Paste image URL\u2026")}"
              .value=${this._photoUrlInput}
              @input=${a=>{this._photoUrlInput=a.target.value}}
              @keydown=${a=>{a.key==="Enter"&&this._handleAddPhotoUrl()}}
            />
            <button class="action-btn primary" ?disabled=${!this._photoUrlInput.trim()||this._addingPhotoUrl}
              @click=${this._handleAddPhotoUrl}>
              ${c("Add")}
            </button>
          </div>
          <div class="camera-btns">
            <label class="camera-btn-split">
              <ha-icon icon="mdi:camera"></ha-icon>
              <span>${c("Take Photo")}</span>
              <input type="file" accept="image/*" capture="environment" class="camera-input"
                @change=${this._handleCameraCapture} />
            </label>
            <label class="camera-btn-split">
              <ha-icon icon="mdi:image-multiple-outline"></ha-icon>
              <span>${c("Choose from Library")}</span>
              <input type="file" accept="image/*" class="camera-input"
                @change=${this._handleCameraCapture} />
            </label>
          </div>
        </div>
      </div>
    `}_renderEditPanel(){let e=this._editData;return u`
      <div class="edit-overlay" @click=${i=>{i.target===i.currentTarget&&this._cancelEdit()}}>
        <div class="edit-panel">
          <div class="edit-header">
            <span>${c("Edit Recipe")}</span>
            <button class="icon-btn" @click=${this._cancelEdit}><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
          <div class="edit-body">

            ${this._renderField(c("Name"),"name","text")}

            <!-- Image section -->
            <div class="edit-section-label">${c("Image")}</div>
            <div class="edit-photo-row">
              ${(()=>{let i=[...new Set([e.image_url,...e.photos||[]].filter(Boolean))];return u`
                  ${i.map(t=>u`
                    <div class="edit-photo-thumb ${t===e.image_url?"selected":""}"
                      @click=${()=>this._handleEditField("image_url",t)}
                      title="${c("Set as main image")}">
                      <img src="${this.api.transport.previewURL(t)||He}" alt="" />
                      ${t===e.image_url?u`<span class="edit-thumb-badge"><ha-icon icon="mdi:check"></ha-icon></span>`:""}
                    </div>
                  `)}
                  <label class="edit-photo-add ${this._editImageUploading?"loading":""}" title="${c("Upload photo")}">
                    <input type="file" accept="image/*" style="display:none"
                      @change=${t=>{let r=t.target.files?.[0];r&&this._editUploadImage(r),t.target.value=""}} />
                    <ha-icon icon="${this._editImageUploading?"mdi:loading":"mdi:plus"}"></ha-icon>
                  </label>
                `})()}
            </div>
            <div class="edit-field">
              <label>${c("Or paste image URL")}</label>
              <input type="url" .value=${e.image_url??""}
                @input=${i=>this._handleEditField("image_url",i.target.value)}
                placeholder="https://…" />
            </div>

            ${this._renderField(c("Description"),"description","textarea")}
            ${this._renderField(c("Source URL"),"source_url","url")}
            ${this._saveError?u`<p role="alert">${this._saveError}</p>`:""}
            ${_t(e,(i,t)=>this._handleEditField(i,t))}

            <div class="edit-row-3">
              ${this._renderField(c("Prep (min)"),"prep_time","number")}
              ${this._renderField(c("Cook (min)"),"cook_time","number")}
              ${this._renderField(c("Servings"),"servings","number")}
            </div>

            <!-- Star rating picker -->
            <div class="edit-field">
              <label>${c("Rating")}</label>
              <div class="edit-stars">
                ${[1,2,3,4,5].map(i=>u`
                  <span class="edit-star ${i<=(e.rating||0)?"filled":""}"
                    @click=${()=>this._handleEditField("rating",e.rating===i?0:i)}
                  >★</span>
                `)}
              </div>
            </div>

            ${this._renderListPicker("tags",c("Tags"),this.allTags)}
            ${this._renderListPicker("courses",c("Courses"),this.allCourses)}
            ${this._renderListPicker("categories",c("Categories"),this.allCategories)}
            ${this._renderListPicker("collections",c("Collections"),this.allCollections)}
            ${this._renderField(c("Notes"),"notes","textarea")}

            <!-- Ingredients editor -->
            <div class="edit-section-label">${c(ce`Ingredients (${(e.ingredients||[]).length})`)}</div>
            ${(e.ingredients||[]).length?u`
              <ul class="edit-ing-list">
                ${(e.ingredients||[]).map((i,t)=>{let r=this._editIngEdit?.idx===t,a=i.is_heading||i.name?.startsWith("#");if(r){let s=this._editIngEdit;return u`
                      <li class="edit-ing-inline-edit ${a?"edit-ing-heading":""}">
                        ${s.heading?u`
                          <input class="ing-inline-input ing-inline-name" type="text" placeholder="${c("Section header")}"
                            .value=${s.name}
                            @input=${d=>{this._editIngEdit={...s,name:d.target.value}}}
                            @keydown=${d=>{d.key==="Enter"&&this._saveEditIngredient(),d.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                        `:u`
                          <input class="ing-inline-input ing-inline-amt" type="text" placeholder="${c("Amt")}"
                            .value=${s.amount}
                            @input=${d=>{this._editIngEdit={...s,amount:d.target.value}}}
                            @keydown=${d=>{d.key==="Enter"&&this._saveEditIngredient(),d.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                          <input class="ing-inline-input ing-inline-unit" type="text" placeholder="${c("Unit")}"
                            .value=${s.unit}
                            @input=${d=>{this._editIngEdit={...s,unit:d.target.value}}}
                            @keydown=${d=>{d.key==="Enter"&&this._saveEditIngredient(),d.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                          <input class="ing-inline-input ing-inline-name" type="text" placeholder="${c("Ingredient")}"
                            .value=${s.name}
                            @input=${d=>{this._editIngEdit={...s,name:d.target.value}}}
                            @keydown=${d=>{d.key==="Enter"&&this._saveEditIngredient(),d.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                        `}
                        <button class="ing-inline-save" @click=${this._saveEditIngredient} title="${c("Save")}">
                          <ha-icon icon="mdi:check"></ha-icon>
                        </button>
                        <button class="ing-inline-cancel" @click=${this._cancelEditIngredient} title="${c("Cancel")}">
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      </li>
                    `}return u`
                    <li
                      draggable="true"
                      class="${a?"edit-ing-heading":""} ${this._dragIngOver===t?"drag-over":""}"
                      @dragstart=${s=>{this._dragIngFrom=t,s.dataTransfer.effectAllowed="move",s.dataTransfer.setData("text/plain",String(t))}}
                      @dragover=${s=>{s.preventDefault(),s.dataTransfer.dropEffect="move",this._dragIngOver!==t&&(this._dragIngOver=t)}}
                      @dragleave=${()=>{this._dragIngOver===t&&(this._dragIngOver=-1)}}
                      @drop=${s=>{s.preventDefault(),this._editDropIngredient(this._dragIngFrom,t)}}
                      @dragend=${()=>{this._dragIngOver=-1,this._dragIngFrom=-1}}
                    >
                      <ha-icon icon="mdi:drag-vertical" class="drag-handle"></ha-icon>
                      <span class="edit-ing-text" @click=${()=>this._startEditIngredient(t)} title="${c("Click to edit")}">
                        ${a?u`<strong>${i.name?.startsWith("#")?i.name.slice(1).trim():i.name}</strong>`:u`${i.amount?`${i.amount}${i.unit?" "+i.unit:""} `:""}${i.name}`}
                      </span>
                      <div class="edit-reorder-btns">
                        <button class="edit-move-btn" ?disabled=${t===0} @click=${()=>this._editMoveIngredient(t,-1)} title="${c("Move up")}">
                          <ha-icon icon="mdi:chevron-up"></ha-icon>
                        </button>
                        <button class="edit-move-btn" ?disabled=${t===e.ingredients.length-1} @click=${()=>this._editMoveIngredient(t,1)} title="${c("Move down")}">
                          <ha-icon icon="mdi:chevron-down"></ha-icon>
                        </button>
                      </div>
                      <button class="edit-remove-btn" @click=${()=>this._editRemoveIngredient(t)}>
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </li>
                  `})}
              </ul>
            `:""}
            <div class="edit-add-row">
              <input
                type="text"
                .value=${this._editIngInput}
                @input=${i=>{this._editIngInput=i.target.value}}
                @keydown=${i=>{i.key==="Enter"&&this._editAddIngredient()}}
                placeholder="${c('e.g. "2 cups flour" or "# Section Header"')}"
              />
              <button class="edit-add-btn" @click=${this._editAddIngredient}>${c("Add")}</button>
            </div>

            <!-- Instructions editor -->
            <div class="edit-section-label">${c(ce`Directions (${(e.instructions||[]).length} steps)`)}</div>
            ${(e.instructions||[]).length?u`
              <ol class="edit-steps-list">
                ${(e.instructions||[]).map((i,t)=>u`
                  <li
                    draggable="true"
                    class="${this._dragStepOver===t?"drag-over":""}"
                    @dragstart=${r=>{this._dragStepFrom=t,r.dataTransfer.effectAllowed="move",r.dataTransfer.setData("text/plain",String(t))}}
                    @dragover=${r=>{r.preventDefault(),r.dataTransfer.dropEffect="move",this._dragStepOver!==t&&(this._dragStepOver=t)}}
                    @dragleave=${()=>{this._dragStepOver===t&&(this._dragStepOver=-1)}}
                    @drop=${r=>{r.preventDefault(),this._editDropStep(this._dragStepFrom,t)}}
                    @dragend=${()=>{this._dragStepOver=-1,this._dragStepFrom=-1}}
                  >
                    <ha-icon icon="mdi:drag-vertical" class="drag-handle"></ha-icon>
                    <span class="edit-ing-text">${i}</span>
                    <div class="edit-reorder-btns">
                      <button class="edit-move-btn" ?disabled=${t===0} @click=${()=>this._editMoveStep(t,-1)} title="${c("Move up")}">
                        <ha-icon icon="mdi:chevron-up"></ha-icon>
                      </button>
                      <button class="edit-move-btn" ?disabled=${t===e.instructions.length-1} @click=${()=>this._editMoveStep(t,1)} title="${c("Move down")}">
                        <ha-icon icon="mdi:chevron-down"></ha-icon>
                      </button>
                    </div>
                    <button class="edit-remove-btn" @click=${()=>this._editRemoveStep(t)}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </li>
                `)}
              </ol>
            `:""}
            <div class="edit-add-row">
              <textarea
                rows="2"
                .value=${this._editStepInput}
                @input=${i=>{this._editStepInput=i.target.value}}
                @keydown=${i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),this._editAddStep(this._editStepInput),this._editStepInput="")}}
                placeholder="${c("Type a step, press Enter to add\u2026")}"
              ></textarea>
              <button class="edit-add-btn" @click=${()=>{this._editAddStep(this._editStepInput),this._editStepInput=""}}>${c("Add")}</button>
            </div>

            <!-- Nutrition section -->
            <div class="edit-section-label">${c("Nutrition Facts (per serving)")}</div>
            <div class="edit-row-3">
              ${this._renderField(c("Calories (kcal)"),"cal","number")}
              ${this._renderField(c("Protein (g)"),"prot","number")}
              ${this._renderField(c("Fat (g)"),"fat","number")}
            </div>
            <div class="edit-row-3">
              ${this._renderField(c("Saturated Fat (g)"),"satf","number")}
              ${this._renderField(c("Carbs (g)"),"carb","number")}
              ${this._renderField(c("Fiber (g)"),"fib","number")}
            </div>
            <div class="edit-row-3">
              ${this._renderField(c("Sugar (g)"),"sug","number")}
              ${this._renderField(c("Sodium (mg)"),"sod","number")}
              ${this._renderField(c("Cholesterol (mg)"),"chol","number")}
            </div>

          </div>
          <div class="edit-footer">
            <button class="action-btn danger-outline" @click=${this._handleDeleteRecipe}
              title="${this._confirmDelete?c("Click again to confirm delete"):c("Delete recipe")}">
              <ha-icon icon="${this._confirmDelete?"mdi:alert":"mdi:trash-can-outline"}"></ha-icon>
              ${this._confirmDelete?c("Confirm?"):c("Delete")}
            </button>
            <div class="edit-footer-right">
              <button class="action-btn" @click=${this._cancelEdit}>${c("Cancel")}</button>
              <button class="action-btn primary" @click=${this._saveEdit}>${c("Save")}</button>
            </div>
          </div>
        </div>
      </div>
    `}_renderField(e,i,t){let r=this._editData[i]??"";return t==="textarea"?u`
        <div class="edit-field">
          <label>${e}</label>
          <textarea
            .value=${r}
            @input=${a=>this._handleEditField(i,a.target.value)}
            rows="3"
          ></textarea>
        </div>
      `:u`
      <div class="edit-field">
        <label>${e}</label>
        <input
          type="${t}"
          .value=${String(r)}
          @input=${a=>this._handleEditField(i,a.target.value)}
        />
      </div>
    `}static styles=ge`
    :host { display: block; height: 100%; }

    .detail-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    /* Wide two-column layout */
    .detail-container.wide { flex-direction: row; }
    .detail-left {
      width: 320px; flex-shrink: 0; display: flex; flex-direction: column;
      border-right: 1px solid var(--rm-border); overflow: hidden;
    }
    .detail-left .hero-img {
      height: 240px; flex-shrink: 0; position: relative; overflow: hidden;
      background: var(--rm-bg-elevated);
    }
    .detail-left .hero-img img { width: 100%; height: 100%; object-fit: cover; }
    .detail-left .hero-img .hero-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center;
      justify-content: center; color: var(--rm-text-secondary);
    }
    .detail-left .hero-img .hero-placeholder ha-icon { --mdc-icon-size: 64px; opacity: 0.3; }
    .detail-left-scroll {
      flex: 1; overflow-y: auto; padding: 12px 14px 16px;
      scrollbar-width: thin; scrollbar-color: var(--rm-border) transparent;
    }
    .detail-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .detail-right-header { padding: 16px 16px 0; flex-shrink: 0; }
    .detail-right-scroll {
      flex: 1; overflow-y: auto; padding: 6px 16px 24px;
      scrollbar-width: thin; scrollbar-color: var(--rm-border) transparent;
    }
    .notes-section { margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--rm-border); }
    .notes-section h3 { margin: 0 0 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--rm-text-secondary); }

    /* Recipe title */
    .recipe-title {
      margin: 0 0 6px; font-size: 20px; font-weight: 700;
      color: var(--rm-text); line-height: 1.2;
    }
    .recipe-title.wide-centered { text-align: center; font-size: 22px; }
    .detail-desc.wide-centered { text-align: center; }
    .detail-right-header .quick-rating { justify-content: center; }
    .detail-right-header .action-btns-row { justify-content: center; }

    /* Quick rating */
    .quick-rating { display: flex; gap: 2px; margin: 0 0 8px; }
    .qr-star { font-size: 20px; cursor: pointer; color: var(--rm-border); -webkit-text-stroke: 1px rgba(200,150,0,0.4); transition: color 0.15s; }
    .qr-star.filled { color: #f5a623; -webkit-text-stroke: 1px #c47f0a; }
    .qr-star:hover { color: #f5a623; }

    /* Action buttons row */
    .action-btns-row {
      display: flex; gap: 16px; flex-wrap: wrap; margin: 6px 0 10px; justify-content: center;
    }
    .action-icon-btn {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary); font-size: 10px; font-weight: 600;
      transition: color 0.15s; text-decoration: none; width: 56px;
    }
    .action-icon-btn .btn-icon {
      width: 46px; height: 46px; border-radius: 50%;
      background: var(--rm-accent-soft, rgba(255,107,53,0.12));
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; flex-shrink: 0;
    }
    .action-icon-btn ha-icon { --mdc-icon-size: 22px; }
    .action-icon-btn:hover .btn-icon { background: rgba(255,107,53,0.25); }
    .action-icon-btn:hover { color: var(--rm-accent, #ff6b35); }
    .action-icon-btn.fav-active .btn-icon { background: rgba(207,102,121,0.15); }
    .action-icon-btn.fav-active { color: var(--error-color, #cf6679); }
    .action-icon-btn.danger .btn-icon { background: var(--error-color, #cf6679); }
    .action-icon-btn.danger { color: #fff; }

    /* Meta chips (wide layout) */
    .meta-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; justify-content: center; }
    .meta-chip-icon {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 20px; padding: 5px 12px; font-size: 12px;
      color: var(--rm-text-secondary); font-weight: 600;
    }
    .meta-chip-icon ha-icon { --mdc-icon-size: 14px; }

    /* Chip groups: column of rows, each row = label chip + value chips */
    .chips-area { display: flex; flex-direction: column; gap: 5px; }
    .chip-group-row { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
    .chip-label {
      background: var(--rm-bg); border: 1px solid var(--rm-border);
      color: var(--rm-text-secondary); font-weight: 600; cursor: default;
    }

    /* Hero */
    .hero {
      flex-shrink: 0;
      height: 180px;
      position: relative;
      background: var(--rm-surface, #2c2c2e);
      overflow: hidden;
    }
    .hero.no-image { height: 80px; }
    .hero img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%);
    }
    .hero-placeholder {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary, #8e8e93);
    }
    .hero-placeholder ha-icon { --mdc-icon-size: 48px; opacity: 0.4; }

    .hero-actions {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 6px;
    }
    .hero-btn {
      background: rgba(0,0,0,0.55);
      border: none;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      padding: 0;
    }
    .hero-btn ha-icon { --mdc-icon-size: 18px; }
    .hero-btn:hover { background: rgba(0,0,0,0.75); }
    .hero-btn.fav-active { color: var(--error-color, #cf6679); }
    .hero-btn.delete-btn.confirm { background: var(--error-color, #cf6679); color: #fff; }

    /* Scroll area */
    .detail-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px 24px;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border, rgba(255,255,255,0.08)) transparent;
    }

    .detail-head { margin-bottom: 12px; }
    .detail-desc {
      margin: 0 0 8px;
      font-size: 14px;
      color: var(--rm-text-secondary, #8e8e93);
      line-height: 1.5;
    }

    .meta-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 8px;
      padding: 6px 12px;
      min-width: 60px;
    }
    .meta-label { font-size: 10px; color: var(--rm-text-secondary, #8e8e93); text-transform: uppercase; letter-spacing: 0.05em; }
    .meta-val { font-size: 14px; font-weight: 600; color: var(--rm-text, #e5e5ea); }

    .tags-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
    .tag-chip {
      background: var(--rm-accent-soft, rgba(255,107,53,0.15));
      color: var(--rm-accent, #ff6b35);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 12px;
    }

    /* Chip groups (courses, categories, collections) */
    .chip-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }
    .chip-group-label {
      font-size: 11px;
      color: var(--rm-text-secondary, #8e8e93);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .chip {
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 12px;
      border: none;
      cursor: default;
    }
    .chip-nav {
      cursor: pointer;
      transition: filter 0.15s, opacity 0.15s;
    }
    .chip-nav:hover { filter: brightness(1.25); opacity: 0.9; }
    .chip-course    { background: rgba(88,166,255,0.15); color: #58a6ff; }
    .chip-category  { background: rgba(63,185,80,0.15);  color: #3fb950; }
    .chip-collection{ background: rgba(210,153,34,0.15); color: #d2a01e; }
    .chip-tag { background: var(--rm-accent-soft); color: var(--rm-accent); }

    /* Scaler */
    .scaler-row { display: flex; align-items: center; gap: 8px; }
    .scaler-icon { --mdc-icon-size: 18px; color: var(--rm-text-secondary); flex-shrink: 0; }
    .scaler-ctrl { display: flex; align-items: center; gap: 6px; }
    .scaler-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 50%;
      width: 34px; height: 34px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--rm-text-secondary); padding: 0; transition: all 0.15s;
    }
    .scaler-btn:hover { background: var(--rm-accent-soft); color: var(--rm-accent); border-color: var(--rm-accent); }
    .scaler-btn ha-icon { --mdc-icon-size: 18px; }
    .scaler-val {
      font-size: 13px; font-weight: 600; color: var(--rm-text);
      min-width: 34px; height: 34px; text-align: center;
      display: flex; align-items: center; justify-content: center;
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 8px;
    }

    /* Tabs */
    .tabs-row {
      display: flex;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.08));
      margin-bottom: 14px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tabs-row::-webkit-scrollbar { display: none; }
    .tab-btn {
      flex-shrink: 0;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 11px 14px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: var(--rm-text-secondary, #8e8e93);
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .tab-btn.active {
      color: var(--rm-accent, #ff6b35);
      border-bottom-color: var(--rm-accent, #ff6b35);
    }

    /* Wake lock button */
    .wakelock-row {
      display: flex;
      justify-content: flex-end;
      padding: 4px 0 10px;
    }
    .wakelock-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: none; border: 1px solid var(--rm-border);
      border-radius: 20px; padding: 4px 12px;
      font-size: 12px; cursor: pointer;
      color: var(--rm-text-secondary);
      transition: all 0.15s;
    }
    .wakelock-btn ha-icon { --mdc-icon-size: 14px; }
    .wakelock-btn.active {
      background: var(--rm-accent-soft); color: var(--rm-accent);
      border-color: var(--rm-accent);
    }
    .wakelock-unsupported {
      display: inline-flex; align-items: center; gap: 5px;
      border: 1px dashed var(--rm-border);
      border-radius: 20px; padding: 4px 12px;
      font-size: 12px; color: var(--rm-text-muted); opacity: 0.8;
    }
    .wakelock-unsupported ha-icon { --mdc-icon-size: 14px; }

    /* Metric toggle */
    .metric-toggle-row {
      display: flex;
      justify-content: flex-end;
      padding: 0 0 8px;
    }
    .metric-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: none; border: 1px solid var(--rm-border);
      border-radius: 20px; padding: 4px 12px;
      font-size: 12px; cursor: pointer;
      color: var(--rm-text-secondary);
      transition: all 0.15s;
    }
    .metric-btn ha-icon { --mdc-icon-size: 14px; }
    .metric-btn.active {
      background: var(--rm-accent-soft); color: var(--rm-accent);
      border-color: var(--rm-accent);
    }

    /* Ingredient section heading */
    .ing-heading {
      list-style: none;
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--rm-accent); padding: 10px 0 4px;
      margin-top: 6px;
    }

    /* Ingredients */
    .ingredient-list { list-style: none; padding: 0; margin: 0 0 16px; }
    .ingredient-item {
      display: flex;
      gap: 10px;
      align-items: baseline;
      padding: 10px 0;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.06));
    }
    .ingredient-item:last-child { border-bottom: none; }
    .ing-amount {
      font-size: 14px;
      font-weight: 700;
      color: var(--rm-accent, #ff6b35);
      min-width: 70px;
      flex-shrink: 0;
    }
    .ing-name { font-size: 15px; color: var(--rm-text, #e5e5ea); }
    .ing-notes { font-size: 13px; color: var(--rm-text-secondary, #8e8e93); font-style: italic; }

    /* Ingredient checkbox selection */
    .ingredient-item.selectable { cursor: pointer; border-radius: 6px; padding-left: 4px; }
    .ingredient-item.selectable:hover { background: var(--rm-accent-soft, rgba(255,107,53,0.1)); }
    .ing-check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--rm-border, rgba(255,255,255,0.15));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s, border-color 0.15s;
    }
    .ing-check.checked {
      background: var(--rm-accent, #ff6b35);
      border-color: var(--rm-accent, #ff6b35);
      color: #fff;
    }
    .ing-check ha-icon { --mdc-icon-size: 12px; }

    /* Shopping */
    .shopping-section { margin-top: 12px; }
    .shopping-btn { width: 100%; justify-content: center; gap: 6px; }
    .shopping-btn ha-icon { --mdc-icon-size: 18px; }
    .shopping-picker-panel {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 10px;
      padding: 10px;
    }
    .picker-select-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }
    .picker-sel-btn {
      background: none;
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 6px;
      color: var(--rm-text-secondary, #8e8e93);
      padding: 4px 10px;
      cursor: pointer;
      font-size: 12px;
    }
    .picker-sel-btn:hover { background: var(--rm-accent-soft); color: var(--rm-text); }
    .picker-btns { display: flex; gap: 8px; justify-content: flex-end; }
    .shopping-note { font-size: 12px; color: var(--rm-text-secondary, #8e8e93); }
    .list-select {
      flex: 1;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 10px;
      font-size: 14px;
      min-width: 120px;
    }
    .shopping-success {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--success-color, #4caf50);
      font-size: 14px;
      padding: 8px 0;
    }
    .shopping-success ha-icon { --mdc-icon-size: 20px; }

    /* Directions */
    .steps-list { list-style: none; padding: 0; margin: 0; }
    .step-item {
      display: flex;
      gap: 14px;
      margin-bottom: 20px;
      align-items: flex-start;
    }
    .step-num {
      flex-shrink: 0;
      width: 30px;
      height: 30px;
      background: var(--rm-accent, #ff6b35);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      user-select: none;
    }
    .step-num:hover { opacity: 0.8; }
    .step-num.done {
      background: transparent;
      border: 2px solid var(--rm-border, rgba(255,255,255,0.2));
      color: var(--rm-text-muted);
    }
    .step-num.done ha-icon { --mdc-icon-size: 16px; }
    .step-item.step-done .step-text {
      opacity: 0.45;
      text-decoration: line-through;
      text-decoration-color: var(--rm-border);
    }
    .step-text { font-size: 15px; color: var(--rm-text, #e5e5ea); line-height: 1.7; transition: opacity 0.2s; }

    /* Timer chip in directions */
    .time-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: var(--rm-accent-soft, rgba(255,107,53,0.15));
      color: var(--rm-accent, #ff6b35);
      border: 1px solid var(--rm-accent, #ff6b35);
      border-radius: 12px;
      padding: 1px 7px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      vertical-align: middle;
    }
    .time-chip ha-icon { --mdc-icon-size: 12px; }
    .time-chip:hover { background: var(--rm-accent, #ff6b35); color: #fff; }

    /* Notes */
    .notes-text { font-size: 14px; color: var(--rm-text, #e5e5ea); line-height: 1.6; }
    .empty-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--rm-text-secondary, #8e8e93);
      text-align: center;
      padding: 20px 0;
      margin: 0;
    }
    .empty-tab ha-icon { --mdc-icon-size: 40px; opacity: 0.35; }
    .empty-tab p { margin: 0; }

    /* Nutrition (legacy table) */
    .nutrition-panel {
      max-width: 340px;
      border: 2px solid var(--rm-text, #e5e5ea);
      border-radius: 4px;
      padding: 8px 12px;
      margin: 0 auto;
    }
    .nutr-header {
      font-size: 28px;
      font-weight: 900;
      color: var(--rm-text, #e5e5ea);
      line-height: 1;
      margin-bottom: 2px;
    }
    .nutr-sub {
      font-size: 11px;
      color: var(--rm-text-secondary, #8e8e93);
      margin-bottom: 6px;
    }
    .nutr-divider { border-top: 1px solid var(--rm-border, rgba(255,255,255,0.15)); margin: 2px 0; }
    .nutr-divider.thick { border-top: 6px solid var(--rm-text, #e5e5ea); margin: 4px 0; }
    .nutr-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 2px 0;
      font-size: 13px;
      color: var(--rm-text, #e5e5ea);
    }
    .nutr-bold { font-weight: 700; font-size: 15px; }
    .nutr-indent { padding-left: 14px; font-size: 12px; }
    .nutr-val { font-weight: 600; white-space: nowrap; }
    .nutr-val em { font-style: normal; font-size: 11px; color: var(--rm-text-secondary, #8e8e93); }

    /* Nutrition card */
    .nutr-card { display: flex; flex-direction: column; gap: 10px; }
    .nutr-top { display: flex; align-items: center; gap: 14px; }
    .nutr-ring-wrap { flex-shrink: 0; width: 90px; height: 90px; }
    .nutr-macro-cols { display: flex; gap: 10px; flex: 1; justify-content: space-around; }
    .nutr-macro-col { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .nutr-mcol-num { font-size: 17px; font-weight: 700; line-height: 1; }
    .nutr-mcol-label { font-size: 11px; color: var(--rm-text-secondary); font-weight: 500; }
    .nutr-mcol-pct { font-size: 10px; font-weight: 600; }
    .nutr-serving-note {
      font-size: 11px; color: var(--rm-text-muted); text-align: center; margin-top: -4px;
    }
    /* Daily RDA expandable */
    .nutr-rda-toggle {
      display: flex; align-items: center; gap: 6px;
      background: none; border: none; border-top: 1px solid var(--rm-border);
      padding: 10px 0 0; cursor: pointer; color: var(--rm-text); font-size: 13px; font-weight: 600;
      width: 100%; text-align: left;
    }
    .nutr-rda-title { flex: 1; }
    .nutr-rda-count {
      font-size: 12px; font-weight: 700; color: var(--rm-text-secondary);
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 10px; padding: 1px 7px;
    }
    .nutr-rda-toggle ha-icon { --mdc-icon-size: 18px; color: var(--rm-text-secondary); }
    .nutr-rda-rows { display: flex; flex-direction: column; gap: 6px; padding-top: 6px; }
    .nutr-rda-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      grid-template-rows: auto 4px;
      column-gap: 8px;
      row-gap: 4px;
      font-size: 12px;
    }
    .nutr-rda-label { color: var(--rm-text-secondary); grid-column: 1; grid-row: 1; }
    .nutr-rda-val { color: var(--rm-text); font-weight: 600; grid-column: 2; grid-row: 1; white-space: nowrap; }
    .nutr-rda-pct { color: var(--rm-text-muted); grid-column: 3; grid-row: 1; white-space: nowrap; min-width: 36px; text-align: right; }
    .nutr-rda-bar-wrap { grid-column: 1 / -1; grid-row: 2; background: var(--rm-border); border-radius: 2px; height: 4px; overflow: hidden; }
    .nutr-rda-bar { height: 100%; background: var(--rm-accent); border-radius: 2px; transition: width 0.3s; }
    .nutr-rda-bar.over { background: var(--error-color, #cf6679); }

    /* Photos tab */
    .photos-tab { display: flex; flex-direction: column; gap: 16px; }
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }
    .photo-item {
      position: relative;
      aspect-ratio: 4/3;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid transparent;
    }
    .photo-item.main-photo { border-color: var(--rm-accent, #ff6b35); }
    .photo-item img { width: 100%; height: 100%; object-fit: cover; }
    .photo-badge {
      position: absolute;
      bottom: 4px;
      left: 4px;
      background: var(--rm-accent, #ff6b35);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .photo-action {
      position: absolute;
      background: rgba(0,0,0,0.6);
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 0;
      transition: background 0.15s;
    }
    .photo-action ha-icon { --mdc-icon-size: 14px; }
    .photo-action:hover { background: rgba(0,0,0,0.85); }
    .remove-photo { top: 4px; right: 4px; }
    .set-main { bottom: 4px; left: 4px; }

    .photo-add-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--rm-border, rgba(255,255,255,0.08));
    }
    .photo-add-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--rm-text-secondary, #8e8e93);
    }
    .photo-url-row { display: flex; gap: 8px; }
    .photo-url-input {
      flex: 1;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 10px;
      font-size: 13px;
    }
    .photo-url-input:focus { outline: none; border-color: var(--rm-accent, #ff6b35); }
    .camera-btns {
      display: flex;
      gap: 10px;
    }
    .camera-btn-split {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 2px solid var(--rm-accent, #ff6b35);
      border-radius: 10px;
      color: var(--rm-text, #e5e5ea);
      padding: 16px 8px;
      cursor: pointer;
      font-size: 12px;
      text-align: center;
      transition: background 0.15s, border-color 0.15s;
    }
    .camera-btn-split:hover { background: var(--rm-accent-soft, rgba(255,107,53,0.12)); }
    .camera-btn-split ha-icon { --mdc-icon-size: 28px; color: var(--rm-accent, #ff6b35); }
    .camera-input { display: none; }

    /* Buttons */
    .action-btn {
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 14px;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .action-btn.primary {
      background: var(--rm-accent, #ff6b35);
      border-color: var(--rm-accent, #ff6b35);
      color: #fff;
    }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .icon-btn {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; padding: 0;
    }

    /* Edit overlay */
    .edit-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: flex-end;
      z-index: 10;
    }
    .edit-panel {
      background: var(--rm-bg-surface, #1c1c1e);
      border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
      width: 100%;
      max-height: 82vh;
      display: flex;
      flex-direction: column;
    }
    .edit-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.08));
      font-weight: 600;
      font-size: 16px;
      color: var(--rm-text, #e5e5ea);
      flex-shrink: 0;
    }
    .edit-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .edit-section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rm-text-muted, #8e8e93);
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px solid var(--rm-border, rgba(255,255,255,0.08));
    }
    .edit-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .edit-field { display: flex; flex-direction: column; gap: 4px; }
    .edit-field label { font-size: 11px; color: var(--rm-text-secondary, #8e8e93); text-transform: uppercase; letter-spacing: 0.05em; }
    .edit-field input, .edit-field textarea {
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 10px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
    }
    .edit-field input:focus, .edit-field textarea:focus {
      outline: none;
      border-color: var(--rm-accent, #ff6b35);
    }
    .edit-photo-row {
      display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start;
    }
    .edit-photo-thumb {
      position: relative; width: 144px; height: 144px;
      border-radius: 8px; overflow: hidden; cursor: pointer; flex-shrink: 0;
      border: 2px solid transparent; transition: border-color 0.15s;
    }
    .edit-photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .edit-photo-thumb.selected { border-color: var(--rm-accent, #ff6b35); }
    .edit-thumb-badge {
      position: absolute; bottom: 6px; right: 6px;
      background: var(--rm-accent, #ff6b35); border-radius: 50%;
      width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    }
    .edit-thumb-badge ha-icon { --mdc-icon-size: 16px; color: #fff; }
    .edit-photo-add {
      width: 144px; height: 144px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: var(--rm-accent-soft, rgba(255,107,53,0.12));
      border: 2px dashed var(--rm-accent, #ff6b35);
      cursor: pointer; color: var(--rm-accent, #ff6b35);
      transition: background 0.15s;
    }
    .edit-photo-add:hover { background: rgba(255,107,53,0.22); }
    .edit-photo-add.loading { opacity: 0.6; cursor: not-allowed; }
    .edit-photo-add ha-icon { --mdc-icon-size: 40px; }
    .edit-stars {
      display: flex;
      gap: 4px;
      padding: 4px 0;
    }
    .edit-star {
      font-size: 32px;
      color: var(--rm-border, rgba(255,255,255,0.3));
      cursor: pointer;
      transition: color 0.12s;
      line-height: 1;
      -webkit-text-stroke: 1px rgba(200,150,50,0.5);
    }
    .edit-star.filled { color: #f5a623; -webkit-text-stroke: 1px #d4881b; }
    .edit-star:hover { color: #f5a623; }
    .edit-footer {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid var(--rm-border, rgba(255,255,255,0.08));
      flex-shrink: 0;
    }
    .edit-footer-right { display: flex; gap: 8px; }

    /* Edit ingredient/step lists */
    .edit-ing-list, .edit-steps-list {
      list-style: none; padding: 0; margin: 0 0 6px;
    }
    .edit-ing-list li, .edit-steps-list li {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 5px 0; border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.06));
      font-size: 13px; color: var(--rm-text, #e5e5ea);
    }
    .edit-ing-heading { font-weight: 700; color: var(--rm-accent) !important; }
    .edit-ing-text { flex: 1; line-height: 1.4; }
    .drag-handle {
      flex-shrink: 0; cursor: grab; color: var(--rm-text-muted, #636366);
      --mdc-icon-size: 18px; touch-action: none;
    }
    .drag-handle:active { cursor: grabbing; }
    .edit-ing-list li.drag-over,
    .edit-steps-list li.drag-over {
      border-top: 2px solid var(--rm-accent); margin-top: -1px;
    }
    .edit-reorder-btns { display: flex; flex-direction: column; flex-shrink: 0; gap: 0; }
    .edit-move-btn {
      background: none; border: none; cursor: pointer; padding: 0; line-height: 1;
      color: var(--rm-text-secondary, #8e8e93); --mdc-icon-size: 14px;
    }
    .edit-move-btn:disabled { opacity: 0.2; cursor: default; }
    .edit-remove-btn {
      background: none; border: none; cursor: pointer; flex-shrink: 0;
      color: var(--rm-text-secondary, #8e8e93); padding: 2px; margin-top: 1px;
    }
    .edit-remove-btn ha-icon { --mdc-icon-size: 14px; }
    .edit-add-row {
      display: flex; gap: 8px; align-items: flex-end; margin-bottom: 4px;
    }
    .edit-add-row input, .edit-add-row textarea {
      flex: 1; background: var(--rm-bg-elevated, #232833);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px; color: var(--rm-text, #e5e5ea);
      padding: 7px 10px; font-size: 13px; font-family: inherit; resize: none;
    }
    .edit-add-row input:focus, .edit-add-row textarea:focus {
      outline: none; border-color: var(--rm-accent, #9fa8da);
    }
    .edit-add-btn {
      background: var(--rm-accent, #9fa8da); border: none; border-radius: 8px;
      color: #fff; padding: 7px 12px; cursor: pointer; font-size: 13px;
      white-space: nowrap; flex-shrink: 0;
    }

    /* Danger outline button */
    .action-btn.danger-outline {
      color: var(--error-color, #cf6679);
      border-color: var(--error-color, #cf6679);
    }
    .action-btn.danger-outline:hover {
      background: var(--error-color, #cf6679); color: #fff;
    }

    /* ── Wide grid layout (2 cols × auto rows) ─────────────── */
    /* Whole card scrolls — no independent column scrolling */
    .detail-container.wide {
      overflow-x: hidden;
      overflow-y: auto;
    }

    .wide-layout {
      --ion-grid-columns: 12;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 14px;
      width: 100%;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    /* Each row is a flex container — no gap (columns are exact % fractions summing to 100%).
       align-items:stretch makes both columns the same height.
       Column spacing uses margin-left + reduced width on col-2 items. */
    .wide-row {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      width: 100%;
      box-sizing: border-box;
    }

    /* Col 1 — image card: exact Ionic 4/12 column; aspect-ratio:1/1 makes height = width */
    .wide-image-card {
      flex: 0 0 calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
      width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
      max-width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
      min-width: 0;
      aspect-ratio: 1 / 1;
      border-radius: 16px;
      overflow: hidden;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
    }
    .wide-image-square {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    .wide-image-square img {
      width: 100%; height: 100%; object-fit: cover; display: block;
    }
    .wide-image-square .hero-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: var(--rm-text-secondary);
    }
    .wide-image-square .hero-placeholder ha-icon { --mdc-icon-size: 64px; opacity: 0.3; }
    .slide-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,0.45); border: none; color: #fff; cursor: pointer;
      border-radius: 50%; width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center; padding: 0;
      z-index: 2; transition: background 0.15s;
    }
    .slide-btn:hover { background: rgba(0,0,0,0.7); }
    .slide-btn ha-icon { --mdc-icon-size: 20px; }
    .slide-prev { left: 6px; }
    .slide-next { right: 6px; }
    .slide-dots {
      position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 5px; z-index: 2;
    }
    .slide-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(255,255,255,0.45); transition: background 0.15s;
    }
    .slide-dot.active { background: #fff; }

    /* Col 2 — info card: 8/12 minus the 14px gap, with margin-left for the gap */
    .wide-info-card {
      flex: 0 0 calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
      width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
      max-width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
      min-width: 0;
      box-sizing: border-box;
      margin-left: 14px;
      border-radius: 16px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .wide-title {
      margin: 0 0 4px; font-size: 22px; font-weight: 700;
      color: var(--rm-text); line-height: 1.2; text-align: center;
    }
    .wide-desc {
      text-align: center; margin: 6px 0;
      font-size: 13px; color: var(--rm-text-secondary); line-height: 1.5;
    }
    .wide-info-card .quick-rating { justify-content: center; margin-bottom: 6px; }
    .wide-info-card .action-btns-row { justify-content: center; flex-wrap: wrap; width: 100%; }
    .wide-info-card .meta-chips { justify-content: center; margin-top: 6px; }
    /* Chips pushed to bottom-left of info card */
    .wide-info-card .chips-area { align-self: flex-start; margin-top: auto; padding-top: 10px; }

    /* Row 2, Col 1 — ingredients column: exact Ionic 4/12, aligns with image above */
    .wide-ing-col {
      flex: 0 0 calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
      width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
      max-width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Row 2, Col 2 — directions column: 8/12 minus gap, margin-left for spacing */
    .wide-dir-col {
      flex: 0 0 calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
      width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
      max-width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
      min-width: 0;
      margin-left: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Ingredients column controls: scaler left, cart right — above ingredients only */
    .wide-ing-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 2px;
      min-height: 42px;
    }
    .wide-dir-spacer { min-height: 42px; }
    .ing-shop-btn {
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 50%; width: 34px; height: 34px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--rm-text-secondary); padding: 0; transition: all 0.15s;
    }
    .ing-shop-btn ha-icon { --mdc-icon-size: 18px; }
    .ing-shop-btn:hover { background: var(--rm-accent-soft); color: var(--rm-accent); border-color: var(--rm-accent); }
    .ing-shop-btn.active { background: var(--rm-accent-soft); color: var(--rm-accent); border-color: var(--rm-accent); }
    .ing-shop-success { color: var(--success-color, #4caf50); display: flex; align-items: center; }
    .ing-shop-success ha-icon { --mdc-icon-size: 22px; }
    .shopping-review-panel {
      display: flex; flex-direction: column; gap: 10px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 10px; padding: 12px;
    }
    .review-title {
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--rm-text-secondary, #8e8e93);
    }
    .review-list {
      display: flex; flex-direction: column; gap: 10px;
      max-height: 300px; overflow-y: auto;
    }
    .review-row { display: flex; flex-direction: column; gap: 4px; }
    .review-ing { display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap; }
    .review-qty { font-size: 0.8rem; color: var(--rm-text-secondary, #8e8e93); flex-shrink: 0; }
    .review-ing-name { font-size: 0.9rem; font-weight: 500; }
    .review-chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .review-chip {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 4px 10px; border-radius: 999px;
      border: 1.5px solid var(--rm-border, rgba(255,255,255,0.12));
      background: none; cursor: pointer;
      font-size: 12px; color: var(--rm-text, #e5e5ea);
      font-family: inherit; transition: all 0.15s; white-space: nowrap;
    }
    .review-chip ha-icon { --mdc-icon-size: 13px; }
    .review-chip.selected {
      border-color: var(--rm-accent, #ff6b35);
      background: var(--rm-accent-soft, rgba(255,107,53,0.12));
      color: var(--rm-accent, #ff6b35); font-weight: 600;
    }
    .review-chip.manual { border-style: dashed; }
    .review-btns { margin-top: 2px; }

    /* Section cards (ingredients, nutrition, notes) */
    .wide-section-card {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 14px;
      padding: 12px 14px;
    }
    .wide-section-title {
      font-size: 14px; font-weight: 700; color: var(--rm-text);
      margin-bottom: 10px; padding-bottom: 6px;
      border-bottom: 1px solid var(--rm-border);
    }

    /* Per-step direction cards in wide layout */
    .wide-step-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .wide-step-card .step-num { flex-shrink: 0; }
    .wide-step-card .step-text { flex: 1; }
    .wide-step-card.step-done .step-text {
      opacity: 0.45;
      text-decoration: line-through;
      text-decoration-color: var(--rm-border);
    }

    /* ── Markdown content ─────────────────────────────── */
    .md-content { font-size: 14px; line-height: 1.65; }
    .md-content p { margin: 0 0 6px; }
    .md-content p.md-gap { margin: 0 0 10px; }
    .md-content h1 { font-size: 18px; font-weight: 700; margin: 10px 0 4px; }
    .md-content h2 { font-size: 16px; font-weight: 700; margin: 8px 0 4px; }
    .md-content h3 { font-size: 14px; font-weight: 700; margin: 6px 0 3px; }
    .md-content ul, .md-content ol { padding-left: 20px; margin: 4px 0 8px; }
    .md-content li { margin: 2px 0; }
    .md-content strong { font-weight: 700; }
    .md-content em { font-style: italic; }
    .md-content code { font-family: monospace; font-size: 12px; background: var(--rm-bg-elevated); padding: 1px 4px; border-radius: 3px; }
    .md-content a { color: var(--rm-accent); text-decoration: none; }
    .md-content a:hover { text-decoration: underline; }
    .md-content hr { border: none; border-top: 1px solid var(--rm-border); margin: 8px 0; }

    /* ── List picker (tags / courses / categories / collections) ─── */
    .list-picker-field { position: relative; }
    .list-picker-wrap { display: flex; flex-direction: column; gap: 6px; }
    .list-picker-chips { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; min-height: 28px; }
    .list-chip {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 3px 8px; border-radius: 14px; font-size: 12px;
      border: 1px solid var(--rm-border); background: var(--rm-bg-elevated);
      color: var(--rm-text); cursor: default; transition: all 0.12s;
    }
    .list-chip.selected { background: var(--rm-accent-soft); border-color: var(--rm-accent); color: var(--rm-accent); }
    .list-chip.available { cursor: pointer; color: var(--rm-text-muted); }
    .list-chip.available:hover { border-color: var(--rm-accent); color: var(--rm-accent); background: var(--rm-accent-soft); }
    .list-chip-remove {
      background: none; border: none; padding: 0 0 0 2px; cursor: pointer;
      color: inherit; font-size: 14px; line-height: 1; opacity: 0.7;
    }
    .list-chip-remove:hover { opacity: 1; }
    .list-chip-add-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border-radius: 50%; border: 1px dashed var(--rm-border);
      background: none; cursor: pointer; color: var(--rm-text-muted); transition: all 0.12s;
    }
    .list-chip-add-btn:hover { border-color: var(--rm-accent); color: var(--rm-accent); }
    .list-chip-add-btn ha-icon { --mdc-icon-size: 14px; }
    .list-picker-dropdown {
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    }
    .list-picker-existing { display: flex; flex-wrap: wrap; gap: 5px; }
    .list-picker-new-row { display: flex; gap: 6px; }
    .list-picker-input {
      flex: 1; background: var(--rm-bg-surface, var(--rm-bg)); border: 1px solid var(--rm-border);
      border-radius: 7px; color: var(--rm-text); padding: 5px 9px; font-size: 13px;
      font-family: inherit; min-width: 0;
    }
    .list-picker-input:focus { outline: none; border-color: var(--rm-accent); }
    .list-picker-new-btn {
      padding: 5px 12px; border-radius: 7px; border: 1px solid var(--rm-accent);
      background: var(--rm-accent); color: #fff; cursor: pointer; font-size: 13px; font-family: inherit;
    }
    .list-picker-new-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── Inline ingredient edit ──────────────────────── */
    .edit-ing-text { cursor: pointer; flex: 1; }
    .edit-ing-text:hover { color: var(--rm-accent); }
    .edit-ing-inline-edit {
      display: flex; align-items: center; gap: 4px; padding: 4px 0; list-style: none;
    }
    .ing-inline-input {
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-accent);
      border-radius: 6px; color: var(--rm-text); padding: 4px 6px; font-size: 13px;
      font-family: inherit; min-width: 0;
    }
    .ing-inline-input:focus { outline: none; }
    .ing-inline-amt { width: 52px; flex: 0 0 52px; }
    .ing-inline-unit { width: 60px; flex: 0 0 60px; }
    .ing-inline-name { flex: 1; }
    .ing-inline-save, .ing-inline-cancel {
      width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--rm-border);
      background: none; cursor: pointer; color: var(--rm-text-muted);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ing-inline-save { border-color: var(--rm-accent); color: var(--rm-accent); }
    .ing-inline-save:hover { background: var(--rm-accent); color: #fff; }
    .ing-inline-save ha-icon, .ing-inline-cancel ha-icon { --mdc-icon-size: 13px; }

  `};try{customElements.define("rm-recipe-detail",Nt)}catch{}var yr=Dt(xr(),1);var Ut=class extends me{static properties={api:{type:Object},asPanel:{type:Boolean},inlineMode:{type:Boolean},_mode:{type:String},_url:{type:String},_scraping:{type:Boolean},_remoteConsent:{type:Boolean},_scrapeError:{type:String},_form:{type:Object},_saving:{type:Boolean},_ingredientInput:{type:String},_ratingHover:{type:Number},_importFile:{type:Object},_importing:{type:Boolean},_importResult:{type:Object},_importError:{type:String},_importDownloadImages:{type:Boolean}};constructor(){super(),this.api=null,this.asPanel=!1,this.inlineMode=!1,this._mode="url",this._url="",this._scraping=!1,this._scrapeError=null,this._saving=!1,this._ingredientInput="",this._ratingHover=0,this._remoteConsent=!1,this._form=this._emptyForm(),this._importFile=null,this._importing=!1,this._importResult=null,this._importError=null,this._importDownloadImages=!0}_emptyForm(){return{nutrition_basis:"unknown",declared_nutrition:{},name:"",description:"",source_url:"",servings:"",prep_time:"",cook_time:"",image_url:"",tags:"",courses:"",categories:"",collections:"",rating:0,notes:"",ingredients:[],instructions:[],cal:"",fat:"",satf:"",chol:"",sod:"",carb:"",fib:"",sug:"",prot:""}}_close(){this.dispatchEvent(new CustomEvent("rm-close",{bubbles:!0,composed:!0}))}async _handleScrape(){if(!(!this._url.trim()||this._scraping||!this._remoteConsent)){this._scraping=!0,this._scrapeError=null;try{let e=await this.api.scrapeRecipe(this._url.trim(),this._remoteConsent);if(e?.recipe){let i=e.recipe;this._importedRecipe=structuredClone(i);let t=i.nutrition||{};this._form={nutrition_basis:i.nutrition_basis||"unknown",declared_nutrition:{...i.declared_nutrition||{}},name:i.name||"",description:i.description||"",source_url:i.source_url||this._url.trim(),servings:i.servings||"",prep_time:i.prep_time||"",cook_time:i.cook_time||"",image_url:i.media_refs?.image_url??i.image_url??"",tags:(i.tags||[]).join(", "),courses:(i.courses||[]).join(", "),categories:(i.categories||[]).join(", "),collections:(i.collections||[]).join(", "),rating:i.rating||0,notes:i.notes||"",ingredients:i.ingredients||[],instructions:i.instructions||[],cal:t.calories??"",fat:t.fat??"",satf:t.saturated_fat??"",chol:t.cholesterol??"",sod:t.sodium??"",carb:t.carbohydrates??"",fib:t.fiber??"",sug:t.sugar??"",prot:t.protein??""},this._mode="manual"}else this._scrapeError=e?.error||c("Could not extract recipe from this URL.")}catch(e){this._scrapeError=e.message||c("Scraping failed.")}finally{this._scraping=!1}}}_handleImportFileChange(e){this._importFile=e.target.files[0]||null,this._importResult=null,this._importError=null}async _handleImport(){if(!(!this._importFile||this._importing)){this._importing=!0,this._importError=null,this._importResult=null;try{if(this._importFile.size>8e6)throw new Error("Archive exceeds the 8 MB upload limit.");let e;if(this._importDownloadImages){let i=await new Promise((t,r)=>{let a=new FileReader;a.onload=()=>t(String(a.result).split(",")[1]),a.onerror=()=>r(new Error("File could not be read.")),a.readAsDataURL(this._importFile)});e=await this.api.transport.call("recipe_keeper_import",{base64_data:i})}else{let i=await yr.default.loadAsync(this._importFile),t=Object.values(i.files);if(t.length>2e3||t.some(s=>[s.name,s.unsafeOriginalName].filter(Boolean).some(d=>d.startsWith("/")||d.includes("\\")||d.split("/").includes(".."))))throw new Error("Unsafe archive members.");let r=t.find(s=>!s.dir&&s.name.endsWith(".html"));if(!r||!Number.isFinite(r._data?.uncompressedSize)||r._data.uncompressedSize>8e6||r._data.uncompressedSize/Math.max(1,r._data.compressedSize)>100)throw new Error("Missing or oversized Recipe Keeper HTML.");let a=await r.async("text");if(a.length>8e6)throw new Error("Recipe Keeper HTML exceeds the limit.");e=await this.api.importRecipeKeeper(a)}this._importResult=e,e.imported>0&&this.dispatchEvent(new CustomEvent("rm-import-done",{bubbles:!0,composed:!0}))}catch(e){this._importError=e.code?e.message:"Archive could not be read safely."}finally{this._importing=!1}}}async _handleSave(){if(!(!this._form.name.trim()||this._saving)){this._saving=!0;try{let e=this._form,i=g=>g?g.split(",").map(x=>x.trim()).filter(Boolean):[],t={cal:"calories",fat:"fat",satf:"saturated_fat",chol:"cholesterol",sod:"sodium",carb:"carbohydrates",fib:"fiber",sug:"sugar",prot:"protein"},r={},a=!1;for(let[g,x]of Object.entries(t))e[g]!==""&&e[g]!=null&&(r[x]=e[g],a=!0);let d={...Object.fromEntries(Object.entries(this._importedRecipe||{}).filter(([g])=>Object.hasOwn(this.api.transport.actions.recipes_add?.schema.properties||{},g))),name:e.name,description:e.description,source_url:e.source_url,image_url:e.image_url,servings:e.servings===""?null:Number(e.servings),prep_time:e.prep_time===""?null:Number(e.prep_time),cook_time:e.cook_time===""?null:Number(e.cook_time),tags:i(e.tags),courses:i(e.courses),categories:i(e.categories),collections:i(e.collections),rating:e.rating||null,notes:e.notes,ingredients:e.ingredients,instructions:e.instructions,nutrition:a?r:null,nutrition_basis:e.nutrition_basis||"unknown",declared_nutrition:xt(e.declared_nutrition)};await this.api.addRecipe(d),this.dispatchEvent(new CustomEvent("rm-import-done",{bubbles:!0,composed:!0})),this._importedRecipe=null,this._form=this._emptyForm()}catch(e){this._saveError=e.message,this.requestUpdate()}finally{this._saving=!1}}}_setField(e,i){this._form={...this._form,[e]:i}}_addIngredient(){let e=this._ingredientInput.trim();if(!e)return;let i;if(e.startsWith("#"))i={name:e,is_heading:!0};else{let t=e.split(/\s+/),r="",a="",s="";t.length>=3&&!isNaN(parseFloat(t[0]))?(r=t[0],a=t[1],s=t.slice(2).join(" ")):t.length===2&&!isNaN(parseFloat(t[0]))?(r=t[0],s=t[1]):s=e,i={amount:r,unit:a,name:s}}this._form={...this._form,ingredients:[...this._form.ingredients,i]},this._ingredientInput=""}_addIngredientsBulk(e){let t=e.split(`
`).map(r=>r.trim()).filter(Boolean).map(r=>{if(r.startsWith("#"))return{name:r,is_heading:!0};let a=r.split(/\s+/),s="",d="",g="";return a.length>=3&&!isNaN(parseFloat(a[0]))?(s=a[0],d=a[1],g=a.slice(2).join(" ")):a.length===2&&!isNaN(parseFloat(a[0]))?(s=a[0],g=a[1]):g=r,{amount:s,unit:d,name:g}});t.length&&(this._form={...this._form,ingredients:[...this._form.ingredients,...t]})}_removeIngredient(e){this._form={...this._form,ingredients:this._form.ingredients.filter((i,t)=>t!==e)}}_addStep(e){e.trim()&&(this._form={...this._form,instructions:[...this._form.instructions,e.trim()]})}_removeStep(e){this._form={...this._form,instructions:this._form.instructions.filter((i,t)=>t!==e)}}_renderPanelContent(){return u`
      <div class="dialog-header">
        <div class="mode-toggle">
          <button class="mode-btn ${this._mode==="url"?"active":""}" @click=${()=>{this._mode="url"}}>
            <ha-icon icon="mdi:link-variant"></ha-icon> ${c("From URL")}
          </button>
          <button class="mode-btn ${this._mode==="manual"?"active":""}" @click=${()=>{this._mode="manual"}}>
            <ha-icon icon="mdi:pencil-outline"></ha-icon> ${c("Manual")}
          </button>
          <button class="mode-btn ${this._mode==="import"?"active":""}" @click=${()=>{this._mode="import"}}>
            <ha-icon icon="mdi:import"></ha-icon> ${c("Import")}
          </button>
        </div>
        ${this.inlineMode?"":u`<button class="icon-btn" @click=${this._close}><ha-icon icon="mdi:close"></ha-icon></button>`}
      </div>

      <div class="dialog-body">
        ${this._mode==="url"?this._renderUrlMode():""}
        ${this._mode==="import"?this._renderImportMode():""}
        ${this._mode==="manual"?this._renderManualMode():""}
      </div>

      ${this._mode==="manual"?u`
        <div class="dialog-footer">
          <button class="action-btn" @click=${this._close}>${c("Cancel")}</button>
          <button
            class="action-btn primary"
            ?disabled=${!this._form.name.trim()||this._saving}
            @click=${this._handleSave}
          >
            ${this._saving?u`<ha-circular-progress active size="tiny"></ha-circular-progress>`:u`<ha-icon icon="mdi:content-save-outline"></ha-icon>`}
            ${c("Save Recipe")}
          </button>
        </div>
      `:""}
    `}render(){return this.inlineMode?u`<div class="dialog-panel inline-panel">${this._renderPanelContent()}</div>`:u`
      <div class="dialog-overlay ${this.asPanel?"panel-mode":""}" @click=${e=>{e.target===e.currentTarget&&this._close()}}>
        <div class="dialog-panel">${this._renderPanelContent()}</div>
      </div>
    `}_renderImportMode(){return u`
      <div class="import-mode">
        <div class="import-info">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div>
            <strong>${c("Recipe Keeper import")}</strong><br/>
            ${c(u`Export your recipes from the Recipe Keeper app
            (<em>Menu → Export → Recipe Keeper File</em>), then select the
            exported <code>.zip</code> file below. Recipe photos will be saved
            locally if available.`)}
          </div>
        </div>

        <label class="file-label">
          <ha-icon icon="mdi:file-import-outline"></ha-icon>
          ${this._importFile?this._importFile.name:c("Choose .zip file\u2026")}
          <input
            type="file"
            accept=".zip,application/zip"
            class="file-input"
            @change=${this._handleImportFileChange}
          />
        </label>

        <label class="toggle-row">
          <input
            type="checkbox"
            ?checked=${this._importDownloadImages}
            @change=${e=>{this._importDownloadImages=e.target.checked}}
          />
          ${c("Save recipe photos locally")}
        </label>

        ${this._importResult?u`
          <div class="import-result ${this._importResult.failed>0?"partial":"success"}">
            <ha-icon icon="${this._importResult.failed>0?"mdi:alert-circle-outline":"mdi:check-circle-outline"}"></ha-icon>
            <div>
              <strong>${c(ce`${this._importResult.imported} recipe${this._importResult.imported!==1?"s":""} imported`)}</strong>
              ${this._importResult.imagesSaved>0?u` ${c(ce`with ${this._importResult.imagesSaved} photo${this._importResult.imagesSaved!==1?"s":""}`)}`:""}
              ${this._importResult.failed>0?u`<br/><small>${c(ce`${this._importResult.failed} failed — check HA logs for details`)}</small>`:""}
            </div>
          </div>
        `:this._importError?u`
          <div class="import-result error">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <div><strong>${c("Import failed")}</strong><br/><small>${this._importError}</small></div>
          </div>
        `:""}

        <button
          class="action-btn primary import-btn"
          ?disabled=${!this._importFile||this._importing}
          @click=${this._handleImport}
        >
          ${this._importing?u`<ha-circular-progress active size="tiny"></ha-circular-progress> ${c("Importing\u2026")}`:u`<ha-icon icon="mdi:import"></ha-icon> ${c("Import Recipes")}`}
        </button>
      </div>
    `}_renderUrlMode(){return u`
      <div class="url-mode">
        <div class="url-hint">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          ${c("Paste a recipe URL to automatically extract the recipe details.")}
        </div>
        <label><input type="checkbox" aria-label="Allow remote import" .checked=${this._remoteConsent} @change=${e=>{this._remoteConsent=e.target.checked}}> ${this.api?.transport?.hass?.language==="de"?"Remote-Import erlauben":"Allow remote import"}</label>
        <div class="url-row">
          <input
            type="url"
            class="url-input"
            placeholder="https://www.example.com/recipe/..."
            .value=${this._url}
            @input=${e=>{this._url=e.target.value}}
            @keydown=${e=>{e.key==="Enter"&&this._handleScrape()}}
          />
          <button
            class="action-btn primary"
            ?disabled=${!this._url.trim()||this._scraping||!this._remoteConsent}
            @click=${this._handleScrape}
          >
            ${this._scraping?u`<ha-circular-progress active size="tiny"></ha-circular-progress>`:u`<ha-icon icon="mdi:download-outline"></ha-icon>`}
            ${c("Fetch")}
          </button>
        </div>
        ${this._scrapeError?u`
          <div class="error-msg">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            ${this._scrapeError}
          </div>
          <button class="action-btn" @click=${()=>{this._mode="manual",this._form={...this._emptyForm(),source_url:this._url}}}>
            ${c("Enter manually instead")}
          </button>
        `:""}
      </div>
    `}_renderManualMode(){let e=this._form,i=this._ratingHover||e.rating||0;return u`
      <div class="manual-mode">
        ${this._saveError?u`<p role="alert">${this._saveError}</p>`:""}
        ${_t(e,(t,r)=>this._setField(t,r))}

        <!-- Name -->
        <div class="field">
          <label>${c("Recipe Name *")}</label>
          <input type="text" .value=${e.name}
            @input=${t=>this._setField("name",t.target.value)}
            placeholder="${c("e.g. Spaghetti Bolognese")}" />
        </div>

        <!-- Description -->
        <div class="field">
          <label>${c("Description")}</label>
          <textarea rows="2" .value=${e.description}
            @input=${t=>this._setField("description",t.target.value)}
            placeholder="${c("Short description\u2026")}"></textarea>
        </div>

        <!-- Source URL + Image URL -->
        <div class="field-row">
          <div class="field">
            <label>${c("Source URL")}</label>
            <input type="url" .value=${e.source_url}
              @input=${t=>this._setField("source_url",t.target.value)}
              placeholder="https://…" />
          </div>
          <div class="field">
            <label>${c("Image URL")}</label>
            <input type="url" .value=${e.image_url}
              @input=${t=>this._setField("image_url",t.target.value)}
              placeholder="https://…/image.jpg" />
          </div>
        </div>

        <!-- Times + servings -->
        <div class="field-row-3">
          <div class="field">
            <label>${c("Prep (min)")}</label>
            <input type="number" .value=${String(e.prep_time)}
              @input=${t=>this._setField("prep_time",t.target.value)} placeholder="15" min="0" />
          </div>
          <div class="field">
            <label>${c("Cook (min)")}</label>
            <input type="number" .value=${String(e.cook_time)}
              @input=${t=>this._setField("cook_time",t.target.value)} placeholder="30" min="0" />
          </div>
          <div class="field">
            <label>${c("Servings")}</label>
            <input type="number" .value=${String(e.servings)}
              @input=${t=>this._setField("servings",t.target.value)} placeholder="4" min="1" />
          </div>
        </div>

        <!-- Rating -->
        <div class="field">
          <label>${c("Rating")}</label>
          <div class="star-row"
            @mouseleave=${()=>{this._ratingHover=0}}>
            ${[1,2,3,4,5].map(t=>u`
              <span
                class="star ${t<=i?"filled":""}"
                @mouseenter=${()=>{this._ratingHover=t}}
                @click=${()=>this._setField("rating",e.rating===t?0:t)}
              >★</span>
            `)}
            ${e.rating?u`<button class="clear-rating" @click=${()=>this._setField("rating",0)}>${c("Clear")}</button>`:""}
          </div>
        </div>

        <!-- Categorisation row -->
        <div class="field">
          <label>${c("Tags (comma-separated)")}</label>
          <input type="text" .value=${e.tags}
            @input=${t=>this._setField("tags",t.target.value)}
            placeholder="${c("quick, weeknight, family")}" />
        </div>

        <div class="field">
          <label>${c("Courses (comma-separated)")}</label>
          <input type="text" .value=${e.courses}
            @input=${t=>this._setField("courses",t.target.value)}
            placeholder="${c("Dinner, Main Course")}" />
        </div>

        <div class="field-row">
          <div class="field">
            <label>${c("Categories (comma-separated)")}</label>
            <input type="text" .value=${e.categories}
              @input=${t=>this._setField("categories",t.target.value)}
              placeholder="${c("Italian, Gluten Free")}" />
          </div>
          <div class="field">
            <label>${c("Collections (comma-separated)")}</label>
            <input type="text" .value=${e.collections}
              @input=${t=>this._setField("collections",t.target.value)}
              placeholder="${c("30 Minutes, Summer")}" />
          </div>
        </div>

        <!-- Ingredients -->
        <div class="field">
          <label>${c(ce`Ingredients (${e.ingredients.length})`)}</label>
          ${e.ingredients.length?u`
            <ul class="ing-list">
              ${e.ingredients.map((t,r)=>u`
                <li class="${t.is_heading||t.name?.startsWith("#")?"ing-heading":""}">
                  <span class="ing-text">
                    ${t.is_heading||t.name?.startsWith("#")?u`<strong>${t.name?.startsWith("#")?t.name.slice(1).trim():t.name}</strong>`:u`${t.amount?`${t.amount}${t.unit?" "+t.unit:""} `:""}${t.name}`}
                  </span>
                  <button class="remove-btn" @click=${()=>this._removeIngredient(r)}>
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                </li>
              `)}
            </ul>
          `:""}
          <div class="add-row">
            <input
              type="text"
              .value=${this._ingredientInput}
              @input=${t=>{this._ingredientInput=t.target.value}}
              @keydown=${t=>{t.key==="Enter"&&this._addIngredient()}}
              placeholder='${c('e.g. "2 cups flour", "salt", or "# Section"')}'
            />
            <button class="action-btn sm" @click=${this._addIngredient}>${c("Add")}</button>
          </div>
          <div class="bulk-hint">
            ${c(u`Tip: Use <code>#Section Name</code> to add a section header. Or paste multiple lines at once:`)}
            <button class="action-btn sm bulk-btn" @click=${()=>{let t=prompt(c("Paste ingredients (one per line, use # for headers):"));t&&this._addIngredientsBulk(t)}}>
              <ha-icon icon="mdi:text-box-multiple-outline"></ha-icon> ${c("Bulk paste")}
            </button>
          </div>
        </div>

        <!-- Directions -->
        <div class="field">
          <label>${c(ce`Directions (${e.instructions.length} steps)`)}</label>
          ${e.instructions.length?u`
            <ol class="steps-edit">
              ${e.instructions.map((t,r)=>u`
                <li>
                  <span class="step-text">${t}</span>
                  <button class="remove-btn" @click=${()=>this._removeStep(r)}>
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                </li>
              `)}
            </ol>
          `:""}
          <div class="add-row">
            <textarea
              rows="2"
              @keydown=${t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),this._addStep(t.target.value),t.target.value="")}}
              placeholder="${c("Type a step, press Enter to add\u2026")}"
            ></textarea>
            <button class="action-btn sm" @click=${t=>{let r=t.target.closest(".add-row").querySelector("textarea");this._addStep(r.value),r.value=""}}>${c("Add")}</button>
          </div>
        </div>

        <!-- Notes -->
        <div class="field">
          <label>${c("Notes")}</label>
          <textarea rows="2" .value=${e.notes}
            @input=${t=>this._setField("notes",t.target.value)}
            placeholder="${c("Variations, tips\u2026")}"></textarea>
        </div>

        <!-- Nutrition -->
        <div class="section-divider">${c("Nutrition Facts (per serving \u2014 optional)")}</div>
        <div class="field-row-3">
          <div class="field">
            <label>${c("Calories (kcal)")}</label>
            <input type="number" .value=${String(e.cal)}
              @input=${t=>this._setField("cal",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${c("Protein (g)")}</label>
            <input type="number" .value=${String(e.prot)}
              @input=${t=>this._setField("prot",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${c("Fat (g)")}</label>
            <input type="number" .value=${String(e.fat)}
              @input=${t=>this._setField("fat",t.target.value)} placeholder="0" min="0" />
          </div>
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>${c("Saturated Fat (g)")}</label>
            <input type="number" .value=${String(e.satf)}
              @input=${t=>this._setField("satf",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${c("Carbohydrates (g)")}</label>
            <input type="number" .value=${String(e.carb)}
              @input=${t=>this._setField("carb",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${c("Dietary Fiber (g)")}</label>
            <input type="number" .value=${String(e.fib)}
              @input=${t=>this._setField("fib",t.target.value)} placeholder="0" min="0" />
          </div>
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>${c("Sugars (g)")}</label>
            <input type="number" .value=${String(e.sug)}
              @input=${t=>this._setField("sug",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${c("Sodium (mg)")}</label>
            <input type="number" .value=${String(e.sod)}
              @input=${t=>this._setField("sod",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${c("Cholesterol (mg)")}</label>
            <input type="number" .value=${String(e.chol)}
              @input=${t=>this._setField("chol",t.target.value)} placeholder="0" min="0" />
          </div>
        </div>

      </div>
    `}static styles=ge`
    :host { display: block; height: 100%; }

    .inline-panel {
      border-radius: 0 !important;
      max-width: 100% !important;
      max-height: 100% !important;
      height: 100%;
      border-left: none !important;
      box-shadow: none !important;
      border-top: 1px solid var(--rm-border, rgba(0,0,0,0.08));
    }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 1000;
    }

    /* Right-side panel mode (wide/tablet layout) */
    .dialog-overlay.panel-mode {
      align-items: stretch;
      justify-content: flex-end;
      background: rgba(0,0,0,0.45);
    }

    .dialog-panel {
      background: var(--rm-bg-surface, #1c1c1e);
      border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .panel-mode .dialog-panel {
      border-radius: 0;
      max-width: 420px;
      max-height: 100%;
      height: 100%;
      border-left: 1px solid var(--rm-border, rgba(0,0,0,0.1));
      box-shadow: -4px 0 24px rgba(0,0,0,0.2);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.08));
      flex-shrink: 0;
    }

    .mode-toggle {
      display: flex;
      gap: 4px;
      background: var(--rm-surface, #2c2c2e);
      border-radius: 8px;
      padding: 3px;
    }
    .mode-btn {
      background: none;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 13px;
      color: var(--rm-text-secondary, #8e8e93);
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background 0.15s, color 0.15s;
    }
    .mode-btn ha-icon { --mdc-icon-size: 16px; }
    .mode-btn.active { background: var(--rm-accent, #ff6b35); color: #fff; }

    .icon-btn {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; padding: 0;
    }

    .dialog-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border, rgba(255,255,255,0.08)) transparent;
    }

    /* URL mode */
    .url-mode { display: flex; flex-direction: column; gap: 14px; }
    .url-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--rm-text-secondary, #8e8e93);
      background: var(--rm-surface, #2c2c2e);
      border-radius: 8px;
      padding: 10px 12px;
    }
    .url-hint ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
    .url-row { display: flex; gap: 8px; }
    .url-input {
      flex: 1;
      background: var(--rm-surface, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 10px 12px;
      font-size: 14px;
    }
    .url-input:focus { outline: none; border-color: var(--rm-accent, #ff6b35); }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--error-color, #cf6679);
      font-size: 13px;
    }
    .error-msg ha-icon { --mdc-icon-size: 16px; }

    /* Manual form */
    .manual-mode { display: flex; flex-direction: column; gap: 12px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--rm-text-secondary, #8e8e93);
    }
    .field input, .field textarea {
      background: var(--rm-surface, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 10px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
    }
    .field input:focus, .field textarea:focus { outline: none; border-color: var(--rm-accent, #ff6b35); }

    .field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

    /* Star rating */
    .star-row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 0;
    }
    .star {
      font-size: 28px;
      color: var(--rm-border, rgba(255,255,255,0.2));
      cursor: pointer;
      line-height: 1;
      transition: color 0.1s;
    }
    .star.filled { color: #f5a623; }
    .star:hover  { color: #f5a623; }
    .clear-rating {
      margin-left: 8px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 11px;
      color: var(--rm-text-secondary, #8e8e93);
      text-decoration: underline;
      padding: 0;
    }

    /* Section divider */
    .section-divider {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rm-text-secondary, #8e8e93);
      padding-top: 8px;
      border-top: 1px solid var(--rm-border, rgba(255,255,255,0.08));
    }

    /* Ingredient / step lists */
    .ing-list, .steps-edit { list-style: none; padding: 0; margin: 0 0 6px; }
    .ing-list li, .steps-edit li {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 5px 0;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.06));
      font-size: 13px;
      color: var(--rm-text, #e5e5ea);
    }
    .ing-list li.ing-heading { font-weight: 700; color: var(--rm-accent, #9fa8da); }
    .ing-text, .step-text { flex: 1; }
    .bulk-hint {
      font-size: 11px; color: var(--rm-text-secondary, #8e8e93);
      margin-top: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    }
    .bulk-hint code {
      background: rgba(255,255,255,0.08); border-radius: 4px; padding: 1px 5px; font-size: 11px;
    }
    .bulk-btn { padding: 4px 8px !important; font-size: 11px !important; }
    .remove-btn {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93); padding: 2px; flex-shrink: 0;
    }
    .remove-btn ha-icon { --mdc-icon-size: 14px; }

    .add-row { display: flex; gap: 8px; align-items: flex-end; }
    .add-row input, .add-row textarea {
      flex: 1;
      background: var(--rm-surface, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 10px;
      font-size: 13px;
      font-family: inherit;
      resize: none;
    }
    .add-row input:focus, .add-row textarea:focus { outline: none; border-color: var(--rm-accent, #ff6b35); }

    /* Buttons */
    .action-btn {
      background: var(--rm-surface, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 9px 14px;
      cursor: pointer;
      font-size: 14px;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .action-btn ha-icon { --mdc-icon-size: 16px; }
    .action-btn.primary { background: var(--rm-accent, #ff6b35); border-color: var(--rm-accent, #ff6b35); color: #fff; }
    .action-btn.sm { padding: 6px 10px; font-size: 13px; }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Import mode */
    .import-mode { display: flex; flex-direction: column; gap: 16px; }
    .import-info {
      display: flex;
      gap: 12px;
      background: var(--rm-surface, #2c2c2e);
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 13px;
      color: var(--rm-text-secondary, #8e8e93);
      line-height: 1.5;
    }
    .import-info ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .import-info strong { color: var(--rm-text, #e5e5ea); }
    .import-info code {
      background: rgba(255,255,255,0.08);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 12px;
    }

    .file-label {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--rm-surface, #2c2c2e);
      border: 2px dashed var(--rm-border, rgba(255,255,255,0.15));
      border-radius: 10px;
      padding: 16px 14px;
      cursor: pointer;
      font-size: 14px;
      color: var(--rm-text, #e5e5ea);
      transition: border-color 0.15s;
    }
    .file-label:hover { border-color: var(--rm-accent, #ff6b35); }
    .file-label ha-icon { --mdc-icon-size: 22px; color: var(--rm-accent, #ff6b35); }
    .file-input { display: none; }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--rm-text-secondary, #8e8e93);
      cursor: pointer;
    }
    .toggle-row input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

    .import-result {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13px;
    }
    .import-result ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; margin-top: 1px; }
    .import-result.success { background: rgba(76, 175, 80, 0.12); color: var(--success-color, #4caf50); }
    .import-result.partial { background: rgba(255, 152, 0, 0.12); color: #ff9800; }
    .import-result.error   { background: rgba(207, 102, 121, 0.12); color: var(--error-color, #cf6679); }
    .import-result strong { display: block; }
    .import-result small { opacity: 0.85; }

    .import-btn { width: 100%; justify-content: center; gap: 8px; }
    .import-btn ha-icon { --mdc-icon-size: 18px; }

    .dialog-footer {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 12px 16px;
      border-top: 1px solid var(--rm-border, rgba(255,255,255,0.08));
      flex-shrink: 0;
    }
  `};try{customElements.define("rm-add-recipe-dialog",Ut)}catch{}var ma=["breakfast","lunch","dinner","snack"],qt=class extends me{static properties={api:{type:Object},shoppingLists:{type:Array},_shoppingListId:{state:!0},_shoppingStatus:{state:!0},recipes:{type:Array},settings:{type:Object},fromRecipe:{type:Object},_weekStart:{type:String},_plan:{type:Array},_loading:{type:Boolean},_showPicker:{type:Boolean},_pickerTarget:{type:Object},_pickerSearch:{type:String},_pickerServings:{type:Number}};constructor(){super(),this.api=null,this.shoppingLists=[],this._shoppingListId="",this._shoppingStatus="",this.recipes=[],this.settings={},this.fromRecipe=null,this._plan=[],this._loading=!1,this._showPicker=!1,this._pickerTarget=null,this._pickerSearch="",this._pickerServings=2,this._weekStart=this._getMondayISO(new Date)}updated(e){(e.has("api")||e.has("_weekStart"))&&this.api&&this._loadPlan()}_getMondayISO(e){let i=e.getDay(),t=i===0?-6:1-i,r=new Date(e);r.setDate(r.getDate()+t);let a=r.getFullYear(),s=String(r.getMonth()+1).padStart(2,"0"),d=String(r.getDate()).padStart(2,"0");return`${a}-${s}-${d}`}_addDays(e,i){let t=new Date(e+"T00:00:00Z");return t.setUTCDate(t.getUTCDate()+i),t.toISOString().split("T")[0]}_formatDisplayDate(e){return new Date(e+"T00:00:00Z").getUTCDate().toString()}_formatMonthYear(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{month:"long",year:"numeric",timeZone:"UTC"})}_formatDayName(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{weekday:"short",timeZone:"UTC"})}_prevWeek(){this._weekStart=this._addDays(this._weekStart,-7)}_nextWeek(){this._weekStart=this._addDays(this._weekStart,7)}_isCurrentWeek(){return this._weekStart===this._getMondayISO(new Date)}async _loadPlan(){this._loading=!0;try{let e=await this.api.getMealPlan(this._weekStart);this._plan=e?.entries??[]}catch{this._plan=[]}finally{this._loading=!1}}async _sendWeekToShopping(){if(!(!this._shoppingListId||this.api.transport.pending))try{await this.api.transport.call("plan_to_shopping",{week_start:this._weekStart,list_id:this._shoppingListId}),this._shoppingStatus=(this.api.transport.locale||this.api.transport.hass.language)==="de"?"Wochenzutaten zur ausgew\xE4hlten Liste hinzugef\xFCgt.":"Week ingredients added to the selected list."}catch(e){this._shoppingStatus=e.message}}_getEntriesForSlot(e,i){return this._plan.filter(t=>t.date===e&&t.meal_type===i)}_openPicker(e,i){this._pickerTarget={date:e,mealType:i},this._pickerSearch="",this._pickerServings=2,this._showPicker=!0}async _handlePickRecipe(e){this._pickerTarget&&(await this.api.addToMealPlan(e.id,this._pickerTarget.date,this._pickerTarget.mealType,this._pickerServings),this._showPicker=!1,await this._loadPlan())}async _handleRemoveEntry(e){await this.api.removeFromMealPlan(e),await this._loadPlan()}async _handleClearWeek(){await this.api.clearMealPlanWeek(this._weekStart),await this._loadPlan()}_openRecipeDetail(e){let i=this.recipes.find(t=>t.id===e.recipe_id);i&&this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:i},bubbles:!0,composed:!0}))}_mealTypeLabel(e){switch(e){case"breakfast":return c("Breakfast");case"lunch":return c("Lunch");case"dinner":return c("Dinner");case"snack":return c("Snack");default:return e}}get _pickerFiltered(){let e=this._pickerSearch.trim().toLowerCase();return e?this.recipes.filter(i=>i.name?.toLowerCase().includes(e)||i.tags?.some(t=>t.toLowerCase().includes(e))):this.recipes}render(){let e=Array.from({length:7},(t,r)=>this._addDays(this._weekStart,r)),i=new Date().toISOString().split("T")[0];return u`
      <div class="planner-container">
        <div class="week-nav"><label>${(this.api?.transport?.locale||this.api?.transport?.hass.language)==="de"?"Einkaufsliste f\xFCr diese Woche":"Shopping list for this week"}<select aria-label="Planner shopping list" .value=${this._shoppingListId} @change=${t=>{this._shoppingListId=t.target.value}}><option value="">Choose…</option>${(this.shoppingLists||[]).map(t=>u`<option value=${t.id}>${t.name}</option>`)}</select></label><button class="week-today-btn" ?disabled=${!this._shoppingListId||!!this.api?.transport?.pending} @click=${this._sendWeekToShopping}>${(this.api?.transport?.locale||this.api?.transport?.hass.language)==="de"?"Plan zur Einkaufsliste":"Plan to shopping"}</button></div>${this._shoppingStatus?u`<p role="status">${this._shoppingStatus}</p>`:""}
        ${this.fromRecipe?u`
          <div class="back-to-recipe">
            <button class="back-recipe-btn" @click=${()=>this.dispatchEvent(new CustomEvent("rm-back-to-recipe",{bubbles:!0,composed:!0}))}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
              <span>${c(ce`Back to ${this.fromRecipe.name}`)}</span>
            </button>
          </div>
        `:""}
        <!-- Week navigation -->
        <div class="week-nav">
          <button class="nav-btn" @click=${this._prevWeek}>
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <div class="week-label">
            <span class="week-month">${this._formatMonthYear(this._weekStart)}</span>
            ${this._isCurrentWeek()?u`<span class="today-badge">${c("This week")}</span>`:u`
              <button class="text-link" @click=${()=>{this._weekStart=this._getMondayISO(new Date)}}>${c("Today")}</button>
            `}
          </div>
          <button class="nav-btn" @click=${this._nextWeek}>
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </button>
        </div>

        <!-- Day headers -->
        <div class="day-headers">
          ${e.map(t=>u`
            <div class="day-header ${t===i?"today":""}">
              <span class="day-name">${this._formatDayName(t)}</span>
              <span class="day-num">${this._formatDisplayDate(t)}</span>
            </div>
          `)}
        </div>

        <!-- Plan grid scroll -->
        <div class="plan-scroll">
          ${this._loading?u`
            <div class="plan-loading"><ha-circular-progress active></ha-circular-progress></div>
          `:u`
            ${ma.map(t=>u`
              <div class="meal-row">
                <div class="meal-label">${this._mealTypeLabel(t)}</div>
                <div class="meal-cells">
                  ${e.map(r=>{let a=this._getEntriesForSlot(r,t);return u`
                      <div class="meal-cell ${r===i?"today":""}">
                        ${a.map(s=>{let d=this.recipes.find(g=>g.id===s.recipe_id);return u`
                            <div class="meal-entry" @click=${()=>this._openRecipeDetail(s)}>
                              ${d?.image_url?u`
                                <img src="${d.image_url}" alt="${d?.name||""}" class="entry-thumb" />
                              `:u`
                                <div class="entry-thumb entry-placeholder"><ha-icon icon="mdi:food"></ha-icon></div>
                              `}
                              <span class="entry-name">${d?.name??c("Unknown")}</span>
                              ${s.servings&&s.servings!==1?u`
                                <span class="entry-servings">×${s.servings}</span>
                              `:""}
                              <button
                                class="entry-remove"
                                @click=${g=>{g.stopPropagation(),this._handleRemoveEntry(s.id)}}
                              >
                                <ha-icon icon="mdi:close"></ha-icon>
                              </button>
                            </div>
                          `})}
                        <button class="add-slot-btn" @click=${()=>this._openPicker(r,t)}>
                          <ha-icon icon="mdi:plus"></ha-icon>
                        </button>
                      </div>
                    `})}
                </div>
              </div>
            `)}
          `}

          <!-- Clear week button -->
          ${this._plan.length?u`
            <div class="clear-row">
              <button class="text-danger-btn" @click=${this._handleClearWeek}>
                <ha-icon icon="mdi:calendar-remove-outline"></ha-icon>
                ${c("Clear this week")}
              </button>
            </div>
          `:""}
        </div>

        <!-- Recipe picker dialog -->
        ${this._showPicker?this._renderPicker():""}
      </div>
    `}_renderPicker(){let e=this._pickerTarget;return u`
      <div class="picker-overlay" @click=${i=>{i.target===i.currentTarget&&(this._showPicker=!1)}}>
        <div class="picker-panel">
          <div class="picker-header">
            <span>${c(ce`Add to ${this._mealTypeLabel(e.mealType)}`)}</span>
            <button class="icon-btn" @click=${()=>{this._showPicker=!1}}><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
          <div class="picker-servings-row">
            <span class="picker-label">${c("Servings:")}</span>
            <div class="servings-ctrl">
              <button class="scaler-btn" @click=${()=>{this._pickerServings>1&&this._pickerServings--}}>
                <ha-icon icon="mdi:minus"></ha-icon>
              </button>
              <span class="servings-val">${this._pickerServings}</span>
              <button class="scaler-btn" @click=${()=>{this._pickerServings++}}>
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
          </div>
          <div class="picker-search-wrap">
            <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
            <input
              type="text"
              class="picker-search"
              placeholder="${c("Search recipes\u2026")}"
              .value=${this._pickerSearch}
              @input=${i=>{this._pickerSearch=i.target.value}}
            />
          </div>
          <div class="picker-list">
            ${this._pickerFiltered.length===0?u`
              <div class="picker-empty">${c("No recipes found")}</div>
            `:this._pickerFiltered.map(i=>u`
              <div class="picker-item" @click=${()=>this._handlePickRecipe(i)}>
                ${i.image_url?u`
                  <img src="${i.image_url}" alt="${i.name}" class="picker-thumb" />
                `:u`
                  <div class="picker-thumb picker-placeholder"><ha-icon icon="mdi:food"></ha-icon></div>
                `}
                <div class="picker-info">
                  <span class="picker-name">${i.name}</span>
                  ${i.tags?.length?u`<span class="picker-tags">${i.tags.slice(0,2).join(", ")}</span>`:""}
                </div>
                ${i.is_favourite?u`<ha-icon icon="mdi:heart" class="picker-fav"></ha-icon>`:""}
              </div>
            `)}
          </div>
        </div>
      </div>
    `}static styles=ge`
    :host { display: block; height: 100%; }

    .planner-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
    }

    /* Back to recipe */
    .back-to-recipe {
      padding: 6px 14px 0;
      flex-shrink: 0;
    }
    .back-recipe-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: none; border: none; cursor: pointer;
      color: var(--rm-accent, #ff6b35); font-size: 13px; font-weight: 500;
      padding: 4px 6px; border-radius: 8px; transition: background 0.15s;
    }
    .back-recipe-btn:hover { background: var(--rm-accent-soft, rgba(255,107,53,0.12)); }
    .back-recipe-btn ha-icon { --mdc-icon-size: 18px; }

    /* Week nav */
    .week-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.08));
    }
    .nav-btn {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; padding: 0;
    }
    .nav-btn:hover { background: var(--rm-border, rgba(255,255,255,0.08)); }
    .week-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--rm-text, #e5e5ea);
    }
    .today-badge {
      font-size: 11px;
      background: var(--rm-accent-soft, rgba(255,107,53,0.15));
      color: var(--rm-accent, #ff6b35);
      border-radius: 10px;
      padding: 2px 8px;
    }
    .text-link {
      background: none; border: none; cursor: pointer;
      color: var(--rm-accent, #ff6b35);
      font-size: 12px; padding: 0;
    }

    /* Day headers */
    .day-headers {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      padding: 6px 8px 4px;
      flex-shrink: 0;
    }
    .day-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .day-name { font-size: 10px; text-transform: uppercase; color: var(--rm-text-secondary, #8e8e93); letter-spacing: 0.05em; }
    .day-num { font-size: 14px; font-weight: 600; color: var(--rm-text, #e5e5ea); }
    .day-header.today .day-num {
      background: var(--rm-accent, #ff6b35);
      color: #fff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    /* Plan scroll */
    .plan-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 4px 8px 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border, rgba(255,255,255,0.08)) transparent;
    }

    .plan-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 120px;
    }

    .meal-row { margin-bottom: 8px; }
    .meal-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--rm-text-secondary, #8e8e93);
      font-weight: 600;
      padding: 4px 2px 3px;
    }
    .meal-cells {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
    }
    .meal-cell {
      min-height: 48px;
      background: var(--rm-surface, #2c2c2e);
      border-radius: 6px;
      padding: 3px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border: 1px solid transparent;
    }
    .meal-cell.today { border-color: var(--rm-accent, #ff6b35); }

    .meal-entry {
      display: flex;
      align-items: center;
      gap: 3px;
      background: var(--rm-bg-elevated, #1c1c1e);
      border-radius: 4px;
      padding: 2px 2px 2px 4px;
      cursor: pointer;
      font-size: 10px;
      color: var(--rm-text, #e5e5ea);
      position: relative;
      min-height: 22px;
      max-height: 22px;
      overflow: hidden;
    }
    .entry-thumb {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .entry-placeholder {
      background: var(--rm-border, rgba(255,255,255,0.08));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .entry-placeholder ha-icon { --mdc-icon-size: 10px; }
    .entry-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 10px;
    }
    .entry-servings { font-size: 9px; color: var(--rm-text-secondary, #8e8e93); flex-shrink: 0; }
    .entry-remove {
      background: rgba(0,0,0,0.35);
      border: none;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      min-width: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 0;
      opacity: 1;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .entry-remove:hover { background: rgba(207,102,121,0.8); }
    .entry-remove ha-icon { --mdc-icon-size: 10px; }

    .add-slot-btn {
      background: none;
      border: 1px dashed var(--rm-border, rgba(255,255,255,0.12));
      border-radius: 4px;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.15s, color 0.15s;
      padding: 0;
      margin-top: auto;
    }
    .add-slot-btn ha-icon { --mdc-icon-size: 12px; }
    .add-slot-btn:hover { border-color: var(--rm-accent, #ff6b35); color: var(--rm-accent, #ff6b35); }

    .clear-row {
      display: flex;
      justify-content: center;
      padding: 8px;
    }
    .text-danger-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--error-color, #cf6679);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: 6px;
      opacity: 0.8;
    }
    .text-danger-btn:hover { opacity: 1; background: rgba(207, 102, 121, 0.1); }
    .text-danger-btn ha-icon { --mdc-icon-size: 16px; }

    /* Picker */
    .picker-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      z-index: 20;
    }
    .picker-panel {
      background: var(--rm-bg-surface, #1c1c1e);
      border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
      width: 100%;
      max-height: 80%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
    }
    .picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.08));
      font-weight: 600;
      font-size: 15px;
      color: var(--rm-text, #e5e5ea);
      text-transform: capitalize;
      flex-shrink: 0;
    }
    .icon-btn {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; padding: 0;
    }

    .picker-servings-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.06));
      flex-shrink: 0;
    }
    .picker-label { font-size: 13px; color: var(--rm-text-secondary, #8e8e93); }
    .servings-ctrl { display: flex; align-items: center; gap: 8px; }
    .scaler-btn {
      background: var(--rm-surface, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255,255,255,0.08));
      border-radius: 50%;
      width: 26px; height: 26px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--rm-text, #e5e5ea); padding: 0;
    }
    .scaler-btn ha-icon { --mdc-icon-size: 14px; }
    .servings-val { font-size: 14px; font-weight: 600; color: var(--rm-text, #e5e5ea); min-width: 24px; text-align: center; }

    .picker-search-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.06));
      flex-shrink: 0;
    }
    .search-icon { color: var(--rm-text-secondary, #8e8e93); --mdc-icon-size: 18px; }
    .picker-search {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text, #e5e5ea);
      font-size: 14px;
      padding: 4px 0;
    }
    .picker-search::placeholder { color: var(--rm-text-secondary, #8e8e93); }

    .picker-list {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border, rgba(255,255,255,0.08)) transparent;
    }
    .picker-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      cursor: pointer;
      border-bottom: 1px solid var(--rm-border, rgba(255,255,255,0.05));
      transition: background 0.12s;
    }
    .picker-item:hover { background: var(--rm-surface, #2c2c2e); }
    .picker-thumb {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .picker-placeholder {
      background: var(--rm-surface, #2c2c2e);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary, #8e8e93);
    }
    .picker-placeholder ha-icon { --mdc-icon-size: 22px; }
    .picker-info { flex: 1; min-width: 0; }
    .picker-name { font-size: 14px; font-weight: 500; color: var(--rm-text, #e5e5ea); display: block; }
    .picker-tags { font-size: 12px; color: var(--rm-text-secondary, #8e8e93); }
    .picker-fav { color: var(--error-color, #cf6679); --mdc-icon-size: 16px; }
    .picker-empty { padding: 30px; text-align: center; color: var(--rm-text-secondary, #8e8e93); font-size: 14px; }
  `};try{customElements.define("rm-meal-planner",qt)}catch{}var wr="unified",ga=[["en","English"],["es","Espa\xF1ol"],["fr","Fran\xE7ais"],["de","Deutsch"],["pt","Portugu\xEAs"],["nl","Nederlands"],["it","Italiano"]],Wt=class extends me{static properties={hass:{type:Object},settings:{type:Object},_activeTab:{type:String},_rmVersion:{type:String},_rmcVersion:{type:String},_backupState:{type:String}};constructor(){super(),this.settings={},this._activeTab="appearance",this._rmVersion="\u2026",this._rmcVersion="\u2026",this._backupState=null}updated(e){e.has("hass")&&this.hass&&this._rmVersion==="\u2026"&&this._fetchVersionsFromHacs()}async _backup(){if(this._backupState!=="loading"){this._backupState="loading";try{let e=await this.hass.callWS({type:"recipe_manager/backup"}),i=JSON.stringify(e,null,2),t=new Blob([i],{type:"application/json"}),r=URL.createObjectURL(t),a=document.createElement("a");a.href=r,a.download=`macromate-backup-${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(r),this._backupState="done"}catch(e){console.error("[RM] Backup failed:",e),this._backupState="error"}setTimeout(()=>{this._backupState=null},3e3)}}_fetchVersionsFromHacs(){this.hass&&(this._rmVersion="\u2026",this._rmcVersion="\u2026",this.hass.callWS({type:"recipe_manager/get_info"}).then(e=>{this._rmVersion=e.version||"\u2014",this._rmcVersion=wr}).catch(()=>{this._rmVersion="\u2014",this._rmcVersion=wr}))}_update(e){let i={...this.settings,...e};this.dispatchEvent(new CustomEvent("rm-settings-change",{detail:{settings:i},bubbles:!0,composed:!0}))}render(){let e=this.settings;return u`
      <div class="settings-root">
        <div class="tab-bar">
          ${[["appearance","mdi:palette-outline",c("Appearance")],["advanced","mdi:tune-variant",c("Advanced")],["sync","mdi:cloud-sync-outline",c("Sync")],["help","mdi:help-circle-outline",c("Help")]].map(([i,t,r])=>u`
            <button class="tab-item ${this._activeTab===i?"active":""}"
              @click=${()=>{this._activeTab=i}}>
              <ha-icon icon="${t}"></ha-icon>
              <span>${r}</span>
            </button>
          `)}
        </div>
        <div class="settings-body">
          ${this._activeTab==="appearance"?this._renderAppearance(e):""}
          ${this._activeTab==="advanced"?this._renderAdvanced(e):""}
          ${this._activeTab==="sync"?this._renderSync():""}
          ${this._activeTab==="help"?this._renderHelp():""}
        </div>
      </div>
    `}_renderAppearance(e){let i=e.theme==="midnight"||e.theme==="ember"||e.theme==="neon",t=e.theme==="arctic"||e.theme==="meadow"||e.theme==="ocean",r=i||t;return u`
      <!-- ── Language & Units ── -->
      <div class="section">
        <div class="section-label">${c("Language & Units")}</div>

        <div class="setting-row">
          <span class="setting-name">${c("Language")}</span>
          <select class="theme-select" @change=${a=>this._update({language:a.target.value})}>
            ${ga.map(([a,s])=>u`
              <option value="${a}" ?selected=${(e.language??"en")===a}>${s}</option>
            `)}
          </select>
        </div>

        <div class="setting-row">
          <span class="setting-name">${c("Preferred units")}</span>
          <div class="btn-group">
            ${[["imperial",c("Imperial")],["metric",c("Metric")]].map(([a,s])=>u`
              <button class="seg-btn ${(e.unitSystem??"imperial")===a?"active":""}"
                @click=${()=>this._update({unitSystem:a})}>${s}</button>
            `)}
          </div>
        </div>
      </div>

      <!-- ── Theme ── -->
      <div class="section">
        <div class="section-label">${c("Theme")}</div>

        <div class="setting-row">
          <span class="setting-name">${c("Colour theme")}</span>
          <select class="theme-select" @change=${a=>this._update({theme:a.target.value})}>
            <optgroup label="${c("Adaptive")}">
              <option value="soft"     ?selected=${e.theme==="soft"||!e.theme}>${c("\u{1F3A8} Soft Pastel")}</option>
              <option value="blossom"  ?selected=${e.theme==="blossom"}>${c("\u{1F338} Blossom")}</option>
            </optgroup>
            <optgroup label="${c("Light Themes")}">
              <option value="arctic"   ?selected=${e.theme==="arctic"}>${c("\u{1F9CA} Arctic")}</option>
              <option value="meadow"   ?selected=${e.theme==="meadow"}>${c("\u{1F33F} Meadow")}</option>
              <option value="ocean"    ?selected=${e.theme==="ocean"}>${c("\u{1F30A} Ocean Blue")}</option>
            </optgroup>
            <optgroup label="${c("Dark Themes")}">
              <option value="midnight" ?selected=${e.theme==="midnight"}>${c("\u{1F319} Midnight Ocean")}</option>
              <option value="ember"    ?selected=${e.theme==="ember"}>${c("\u{1F525} Ember")}</option>
              <option value="neon"     ?selected=${e.theme==="neon"}>${c("\u{1F347} Purple & Cyan")}</option>
            </optgroup>
          </select>
        </div>

        ${r?u`
          <div class="setting-row muted-row">
            <span class="setting-name">${c("Dark mode")}</span>
            <span class="muted-note">${i?c("Always dark for this theme"):c("Always light for this theme")}</span>
          </div>
        `:u`
          <div class="setting-row">
            <span class="setting-name">${c("Dark mode")}</span>
            <div class="btn-group">
              ${[["off",c("Light")],["system",c("Auto")],["on",c("Dark")]].map(([a,s])=>u`
                <button class="seg-btn ${e.darkMode===a?"active":""}"
                  @click=${()=>this._update({darkMode:a})}>${s}</button>
              `)}
            </div>
          </div>
        `}

        <div class="setting-row">
          <span class="setting-name">${c("Text size")}</span>
          <div class="btn-group">
            ${[["small",c("S")],["medium",c("M")],["large",c("L")]].map(([a,s])=>u`
              <button class="seg-btn ${e.fontSize===a?"active":""}"
                @click=${()=>this._update({fontSize:a})}>${s}</button>
            `)}
          </div>
        </div>
      </div>

      <!-- ── Recipe Grid ── -->
      <div class="section">
        <div class="section-label">${c("Recipe Grid")}</div>

        <div class="setting-row">
          <span class="setting-name">${c("Recipe columns")}</span>
          <div class="btn-group">
            ${[2,3,4,5,8,10].map(a=>u`
              <button class="seg-btn ${e.columns===a?"active":""}"
                @click=${()=>this._update({columns:a})}>${a}</button>
            `)}
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-name">${c("Favourites section")}</span>
          <label class="toggle">
            <input type="checkbox" ?checked=${e.showFavourites}
              @change=${a=>this._update({showFavourites:a.target.checked})} />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${c("Recent recipes count")}</span>
            <span class="setting-hint">${c("Recipes shown in the Recent filter tab")}</span>
          </div>
          <div class="btn-group">
            ${[6,12,24].map(a=>u`
              <button class="seg-btn ${(e.recentCount??12)===a?"active":""}"
                @click=${()=>this._update({recentCount:a})}>${a}</button>
            `)}
          </div>
        </div>
      </div>

      <!-- ── Navigation ── -->
      <div class="section">
        <div class="section-label">${c("Navigation")}</div>

        <div class="setting-row">
          <span class="setting-name">${c("Meal planner")}</span>
          <label class="toggle">
            <input type="checkbox" ?checked=${e.showPlanner}
              @change=${a=>this._update({showPlanner:a.target.checked})} />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
    `}_renderAdvanced(e){return u`
      <!-- ── Timer Sound ── -->
      <div class="section">
        <div class="section-label">${c("Timer Sound")}</div>

        <div class="setting-row">
          <span class="setting-name">${c("Alarm sound")}</span>
          <select class="theme-select" @change=${i=>this._update({timerSound:i.target.value})}>
            <option value="beep"  ?selected=${(e.timerSound??"beep")==="beep"}>${c("Beep")}</option>
            <option value="ding"  ?selected=${e.timerSound==="ding"}>${c("Ding")}</option>
            <option value="alarm" ?selected=${e.timerSound==="alarm"}>${c("Alarm (3 beeps)")}</option>
            <option value="none"  ?selected=${e.timerSound==="none"}>${c("Silent")}</option>
            <option value="file"  ?selected=${e.timerSound==="file"}>${c("Custom file\u2026")}</option>
          </select>
        </div>

        ${e.timerSound==="file"?u`
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">${c("Sound file")}</span>
              <span class="setting-hint">${e.timerSoundFileName||c("No file selected")}</span>
            </div>
            <label class="file-label">
              <input type="file" accept="audio/*" class="file-input"
                @change=${this._handleSoundFileChange} />
              <ha-icon icon="mdi:folder-music-outline"></ha-icon>
              ${e.timerSoundFile?c("Change"):c("Choose file")}
            </label>
          </div>
        `:""}

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${c("Test sound")}</span>
            <span class="setting-hint">${c("Play a preview of the selected alarm")}</span>
          </div>
          <button class="seg-btn active" @click=${()=>this._testSound(e.timerSound??"beep",e.timerSoundFile)}>
            <ha-icon icon="mdi:volume-high"></ha-icon> ${c("Play")}
          </button>
        </div>
      </div>

      <!-- ── Keep Screen On ── -->
      <div class="section">
        <div class="section-label">${c("Keep Screen On")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${c("Keep screen on while viewing a recipe")}</span>
            <span class="setting-hint">${c("Uses the Wake Lock API \u2014 engages automatically while a recipe is open")}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" ?checked=${e.keepScreenOn}
              @change=${i=>this._update({keepScreenOn:i.target.checked})} />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        ${e.keepScreenOn&&!Ee()?u`
          <div class="setting-row muted-row">
            <span class="setting-hint">${c(`Not available in this browser/connection \u2014 the Wake Lock API requires a secure (HTTPS) connection to Home Assistant. This is the most common reason "keep screen on" doesn't work.`)}</span>
          </div>
        `:""}

        ${e.keepScreenOn?u`
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">${c("Auto-release after")}</span>
              <span class="setting-hint">${c("Screen lock released after this many minutes")}</span>
            </div>
            <div class="btn-group">
              ${[15,30,45,60].map(i=>u`
                <button class="seg-btn ${(e.wakeLockDuration??60)===i?"active":""}"
                  @click=${()=>this._update({wakeLockDuration:i})}>${i}m</button>
              `)}
            </div>
          </div>
        `:""}
      </div>

      <!-- ── Unit Conversion ── -->
      <div class="section">
        <div class="section-label">${c("Unit Conversion")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${c("Show metric conversion button")}</span>
            <span class="setting-hint">${c("Button in Ingredients tab converts oz/lb/cups/fl oz \u2192 g/ml/kg")}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" ?checked=${e.showUnitConversion}
              @change=${i=>this._update({showUnitConversion:i.target.checked})} />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>

      <!-- ── Image Slideshow ── -->
      <div class="section">
        <div class="section-label">${c("Image Slideshow")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${c("Auto-advance interval")}</span>
            <span class="setting-hint">${c("Seconds between slides when a recipe has multiple images (0 = off)")}</span>
          </div>
          <div class="btn-group">
            ${[0,3,5,10,15].map(i=>u`
              <button class="seg-btn ${(e.slideshowInterval??5)===i?"active":""}"
                @click=${()=>this._update({slideshowInterval:i})}>${i===0?c("Off"):`${i}s`}</button>
            `)}
          </div>
        </div>
      </div>

    `}_handleSoundFileChange(e){let i=e.target.files?.[0];if(!i)return;let t=new FileReader;t.onload=r=>{this._update({timerSoundFile:r.target.result,timerSoundFileName:i.name})},t.readAsDataURL(i)}_testSound(e,i){if(e==="file"){typeof i=="string"&&i.length<=2e6&&/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(i)&&new Audio(i).play().catch(r=>console.warn("Could not play file:",r));return}try{let t=new(window.AudioContext||window.webkitAudioContext);if(e==="ding"){let r=t.createOscillator(),a=t.createGain();r.connect(a),a.connect(t.destination),r.type="sine",r.frequency.setValueAtTime(1046,t.currentTime),a.gain.setValueAtTime(.6,t.currentTime),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+1),r.start(t.currentTime),r.stop(t.currentTime+1)}else if(e==="alarm")for(let r=0;r<3;r++){let a=t.currentTime+r*.35,s=t.createOscillator(),d=t.createGain();s.connect(d),d.connect(t.destination),s.type="square",s.frequency.setValueAtTime(660,a),d.gain.setValueAtTime(.3,a),d.gain.exponentialRampToValueAtTime(.001,a+.2),s.start(a),s.stop(a+.2)}else if(e!=="none"){let r=t.createOscillator(),a=t.createGain();r.connect(a),a.connect(t.destination),r.type="sine",r.frequency.setValueAtTime(880,t.currentTime),a.gain.setValueAtTime(.5,t.currentTime),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+.5),r.start(t.currentTime),r.stop(t.currentTime+.5)}}catch(t){console.warn("Audio test failed:",t)}}_renderSync(){let e=this._backupState==="loading"?c("Backing up\u2026"):this._backupState==="done"?c("Downloaded \u2713"):this._backupState==="error"?c("Failed \u2717"):c("Download backup");return u`
      <div class="section">
        <div class="section-label">${c("Backup")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${c("Export recipes")}</span>
            <span class="setting-hint">${c("Download all recipes and meal plans as a JSON file")}</span>
          </div>
          <button
            class="seg-btn backup-btn ${this._backupState||""}"
            ?disabled=${this._backupState==="loading"}
            @click=${()=>this._backup()}
          >${e}</button>
        </div>
      </div>
    `}_renderHelp(){return u`
      <div class="section">
        <div class="section-label">${c("FAQ & Support")}</div>

        <a class="help-link" href="https://github.com/thekiwismarthome/recipe-manager/wiki" target="_blank">
          <ha-icon icon="mdi:help-circle-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${c("FAQ")}</span>
            <span class="setting-hint">${c("Frequently asked questions")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a class="help-link" href="https://github.com/thekiwismarthome/recipe-manager/issues" target="_blank">
          <ha-icon icon="mdi:bug-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${c("Report a Problem")}</span>
            <span class="setting-hint">${c("Submit an issue on GitHub")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a class="help-link" href="https://github.com/thekiwismarthome/recipe-manager" target="_blank">
          <ha-icon icon="mdi:github"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${c("GitHub Repository")}</span>
            <span class="setting-hint">${c("View source code")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>
      </div>

      <div class="section">
        <div class="section-label">${c("About")}</div>

        <div class="setting-row">
          <span class="setting-name">${c("Recipe Manager")}</span>
          <span class="muted-note">${c(ce`Integration version ${this._rmVersion}`)}</span>
        </div>

        <div class="setting-row">
          <span class="setting-name">${c("RM Card")}</span>
          <span class="muted-note">${c(ce`Card version ${this._rmcVersion}`)}</span>
        </div>

        <div class="setting-row">
          <span class="setting-name">${c("Refresh versions")}</span>
          <button class="seg-btn" @click=${()=>this._fetchVersionsFromHacs()}>
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderPlaceholder(e,i,t){return u`
      <div class="placeholder-tab">
        <ha-icon icon="${i}"></ha-icon>
        <div class="placeholder-title">${e}</div>
        <div class="placeholder-msg">${t}</div>
      </div>
    `}static styles=ge`
    :host { display: block; height: 100%; overflow: hidden; }

    .settings-root { display: flex; flex-direction: column; height: 100%; }

    .tab-bar {
      display: flex;
      border-bottom: 1px solid var(--rm-border, rgba(0,0,0,0.08));
      background: var(--rm-bg-surface, #fff);
      flex-shrink: 0; overflow-x: auto; scrollbar-width: none;
    }
    .tab-bar::-webkit-scrollbar { display: none; }

    .tab-item {
      display: flex; align-items: center; gap: 5px;
      background: none; border: none;
      border-bottom: 2px solid transparent;
      padding: 10px 14px; font-size: 13px; font-weight: 500;
      color: var(--rm-text-secondary, #6b5c4a);
      cursor: pointer; white-space: nowrap;
      transition: color 0.15s, border-color 0.15s; flex-shrink: 0;
    }
    .tab-item ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
    .tab-item:hover { color: var(--rm-text, #2d2016); }
    .tab-item.active { color: var(--rm-accent); border-bottom-color: var(--rm-accent); }

    .settings-body { flex: 1; overflow-y: auto; padding-bottom: 24px; }

    .section { margin-bottom: 8px; }

    .section-label {
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--rm-text-muted, #a08060); padding: 16px 20px 6px;
    }

    .setting-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--rm-border, rgba(0,0,0,0.08)); gap: 12px;
    }
    .setting-row.muted-row { opacity: 0.5; }

    .setting-name { font-size: 15px; font-weight: 500; flex-shrink: 0; color: var(--rm-text); }

    .setting-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .setting-hint { font-size: 12px; color: var(--rm-text-muted, #a08060); }

    .muted-note { font-size: 13px; color: var(--rm-text-muted, #a08060); }

    .backup-btn { min-width: 140px; white-space: nowrap; }
    .backup-btn.done    { background: var(--rm-success, #4caf50); color: #fff; }
    .backup-btn.error   { background: var(--rm-danger,  #e53935); color: #fff; }
    .backup-btn.loading { opacity: 0.7; cursor: wait; }

    .help-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--rm-border, rgba(0,0,0,0.06));
      text-decoration: none;
      color: inherit;
    }
    .help-link:last-of-type { border-bottom: none; }
    .help-link ha-icon { color: var(--rm-accent, #a0522d); flex-shrink: 0; }
    .help-link-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .help-link-ext { --mdc-icon-size: 16px; opacity: 0.4; }

    .theme-select {
      background: var(--rm-bg-surface, #fff); color: var(--rm-text, #2d2016);
      border: 1px solid var(--rm-border, rgba(0,0,0,0.12));
      border-radius: 8px; padding: 6px 10px; font-size: 14px; cursor: pointer;
      min-width: 160px; flex-shrink: 0;
    }

    .btn-group {
      display: flex; border-radius: 8px; overflow: hidden;
      border: 1px solid var(--rm-border, rgba(0,0,0,0.1)); flex-shrink: 0;
    }
    .seg-btn {
      background: transparent; border: none; padding: 6px 14px;
      font-size: 13px; font-weight: 500; cursor: pointer;
      color: var(--rm-text-secondary, #6b5c4a);
      border-right: 1px solid var(--rm-border, rgba(0,0,0,0.1));
      transition: background 0.12s, color 0.12s;
      display: flex; align-items: center; gap: 4px;
    }
    .seg-btn ha-icon { --mdc-icon-size: 16px; }
    .seg-btn:last-child { border-right: none; }
    .seg-btn.active { background: var(--rm-accent); color: #111; }
    .seg-btn:hover:not(.active) { background: var(--rm-border); color: var(--rm-text); }

    .toggle { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; }
    .toggle input { display: none; }
    .toggle-track {
      width: 44px; height: 24px;
      background: var(--rm-border, rgba(0,0,0,0.15));
      border-radius: 12px; position: relative; transition: background 0.2s;
    }
    .toggle input:checked + .toggle-track { background: var(--rm-accent); }
    .toggle-thumb {
      position: absolute; top: 2px; left: 2px;
      width: 20px; height: 20px; background: #fff; border-radius: 50%;
      transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .toggle input:checked ~ .toggle-track .toggle-thumb { transform: translateX(20px); }

    .file-label {
      display: flex; align-items: center; gap: 6px;
      background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 8px; padding: 6px 12px; font-size: 13px;
      color: var(--rm-text); cursor: pointer; transition: background 0.15s;
      flex-shrink: 0;
    }
    .file-label:hover { background: var(--rm-accent-soft); }
    .file-label ha-icon { --mdc-icon-size: 18px; color: var(--rm-accent); }
    .file-input { display: none; }

    .placeholder-tab {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 60px 24px; gap: 12px;
      color: var(--rm-text-secondary); text-align: center;
    }
    .placeholder-tab ha-icon { --mdc-icon-size: 48px; opacity: 0.3; }
    .placeholder-title { font-size: 18px; font-weight: 600; color: var(--rm-text); }
    .placeholder-msg { font-size: 14px; max-width: 280px; line-height: 1.5; }
  `};try{customElements.define("rm-settings-view",Wt)}catch{}var Zn=Dt(qn(),1),Xn=Dt(Vn(),1),Zi=class extends me{static properties={value:{},kind:{}};static styles=ge`:host{display:block;max-width:100%;overflow:auto;background:white;color:black;padding:12px;border-radius:8px}svg{display:block;max-width:100%;height:auto;margin:auto}.qr{width:180px}`;updated(){if(this.kind!=="qrcode")try{let e=this.shadowRoot.querySelector("svg");e&&/^[\x20-\x7E]{1,256}$/.test(this.value||"")&&(0,Zn.default)(e,this.value,{format:"CODE128",height:65,margin:12,displayValue:!0})}catch{}}render(){if(this.kind!=="qrcode")return u`<svg role="img" aria-label=${"Loyalty barcode "+(this.value||"")}></svg>`;try{let e=(0,Xn.default)(0,"M");e.addData(String(this.value||"").slice(0,2048)),e.make();let i=e.getModuleCount(),t=[];for(let r=0;r<i;r++)for(let a=0;a<i;a++)e.isDark(r,a)&&t.push(rr`<rect x=${a+4} y=${r+4} width="1" height="1" fill="black"></rect>`);return u`<svg class="qr" viewBox=${`0 0 ${i+8} ${i+8}`} role="img" aria-label="Loyalty QR code"><rect width="100%" height="100%" fill="white"></rect>${t}</svg>`}catch{return u`<p>Code cannot be displayed. Use the printed number.</p>`}}};customElements.define("mm-loyalty-code",Zi);var Xi=class extends me{static properties={transport:{attribute:!1},hass:{attribute:!1},shoppingLists:{attribute:!1},listId:{state:!0},items:{state:!0},tab:{state:!0},error:{state:!0},query:{state:!0},products:{state:!0},total:{state:!0},records:{state:!0}};static styles=et;constructor(){super(),this.shoppingLists=[],this.listId="",this.items=[],this.tab="lists",this.error="",this.query="",this.products=[],this.sequence=0,this.records=[]}get de(){return this.hass?.language?.startsWith("de")}t(e,i){return this.de?i:e}connectedCallback(){super.connectedCallback(),this.addEventListener("mm-command-done",this.refresh),this.startLive()}disconnectedCallback(){super.disconnectedCallback(),this.sequence++,this.removeEventListener("mm-command-done",this.refresh),clearInterval(this.liveTimer);try{this.unsubscribe?.()}catch{}}updated(e){(e.has("shoppingLists")||e.has("transport"))&&this.transport&&(this.listId||(this.listId=this.shoppingLists[0]?.id||""),this.listId&&this.loadItems()),e.has("listId")&&this.listId&&this.loadItems(),e.has("tab")&&this.transport&&this.loadRecords()}async loadItems(){let e=++this.sequence;try{let i=await this.transport.call("shopping_items_get",{list_id:this.listId});if(e!==this.sequence||!this.isConnected)return;this.items=i.items||[]}catch{e===this.sequence&&(this.error=this.t("Unable to load this list.","Liste konnte nicht geladen werden."))}}refresh=async()=>{try{let e=await this.transport.call("shopping_lists_get_all");this.shoppingLists=e.lists||[],await this.loadItems(),await this.loadRecords()}catch{}};async mutate(e,i){try{await this.transport.call(e,i),await this.refresh(),this.error=""}catch{this.error=this.t("Change not confirmed. Check the retry banner.","\xC4nderung nicht best\xE4tigt. Wiederholungsbanner pr\xFCfen.")}}command(e,i={}){let t=this.shadowRoot.querySelector("mm-commands");t?.choose(e,i),t?.scrollIntoView({block:"nearest"})}async startLive(){if(this.transport){try{let e=await this.transport.subscribe(()=>{this.isConnected&&!this.transport.pending&&!this.shadowRoot.querySelector("mm-commands")?.selected&&this.refresh()});if(this.isConnected)this.unsubscribe=e;else{e();return}}catch{}this.isConnected&&(this.liveTimer=setInterval(()=>{this.isConnected&&!this.transport.pending&&!this.shadowRoot.querySelector("mm-commands")?.selected&&this.refresh()},6e4))}}async loadTotals(){try{this.total=await this.transport.call("shopping_items_get_total",{list_id:this.listId})}catch{this.error=this.t("Unable to load prices.","Preise konnten nicht geladen werden.")}}async loadRecords(){let i={loyalty:["shopping_loyalty_get_all","cards"],categories:["shopping_categories_get_all","categories"],regions:["shopping_regions_get_all","regions"]}[this.tab];if(!i){this.records=[];return}let t=this.tab;try{let r=await this.transport.call(i[0]);if(t===this.tab&&this.isConnected){let a=r[i[1]];this.records=Array.isArray(a)?a:Object.values(a||{})}}catch{this.records=[]}}renderRecords(){if(!["loyalty","categories","regions"].includes(this.tab))return"";let e={loyalty:["shopping_loyalty_add","shopping_loyalty_update","shopping_loyalty_delete","card_id"],categories:["shopping_categories_add","shopping_categories_update","shopping_categories_delete","category_id"],regions:["shopping_regions_create","shopping_regions_update","shopping_regions_delete","code"]}[this.tab];return u`<div class="toolbar"><button @click=${()=>this.command(e[0])}>${this.t("Create","Anlegen")}</button><button @click=${()=>this.loadRecords()}>${this.t("Refresh","Aktualisieren")}</button></div>${this.records.map(i=>u`<article class="record ${this.tab==="loyalty"?"loyalty-card":""}"><div class="row"><strong>${i.name}</strong><button @click=${()=>this.command(e[1],{[e[3]]:i.id||i.code})}>${this.t("Edit","Bearbeiten")}</button><button class="danger" @click=${()=>this.command(e[2],{[e[3]]:i.id||i.code})}>${this.t("Delete","L\xF6schen")}</button>${this.tab==="loyalty"?u`<button @click=${()=>this.command("shopping_loyalty_update_members",{card_id:i.id})}>${this.t("Members & access","Mitglieder & Zugriff")}</button>`:""}</div>${this.tab==="loyalty"?u`<p>${i.number}</p><mm-loyalty-code .value=${i.barcode||i.number} .kind=${i.barcode_type||"barcode"}></mm-loyalty-code><p>${i.notes||""}</p>`:u`<small>${i.code||i.id} ${i.currency||""} ${i.language||""}</small>`}</article>`)}`}async search(){try{this.products=(await this.transport.call("shopping_products_search",{query:this.query,limit:30})).products||[]}catch{this.error=this.t("Catalog search failed.","Katalogsuche fehlgeschlagen.")}}render(){let e=[["lists","Lists & items","Listen & Artikel","shopping_lists_"],["products","Catalog","Katalog","shopping_products_"],["categories","Categories","Kategorien","shopping_categories_"],["loyalty","Loyalty cards","Kundenkarten","shopping_loyalty_"],["regions","Regions","Regionen","shopping_regions_"],["settings","Import / export","Import / Export","shopping_"]],i=e.find(t=>t[0]===this.tab)?.[3]||"shopping_";return u`<section><nav aria-label="Shopping workspaces">${e.map(([t,r,a])=>u`<button class=${this.tab===t?"active":""} @click=${()=>{this.tab=t,this.error=""}}>${this.t(r,a)}</button>`)}</nav>${this.error?u`<p role="alert">${this.error}</p>`:""}${this.tab==="lists"?u`<div class="toolbar"><label>${this.t("List","Liste")}<select aria-label="Shopping list" @change=${t=>{this.listId=t.target.value}}>${this.shoppingLists.map(t=>u`<option value=${t.id} .selected=${t.id===this.listId}>${t.name}</option>`)}</select></label><button @click=${()=>this.command("shopping_lists_create")}>${this.t("New list","Neue Liste")}</button><button @click=${()=>this.command("shopping_lists_update",{list_id:this.listId})}>${this.t("Edit list","Liste bearbeiten")}</button><button @click=${()=>this.command("shopping_lists_update_members",{list_id:this.listId})}>${this.t("Members & access","Mitglieder & Zugriff")}</button><button @click=${()=>this.mutate("shopping_lists_set_active",{list_id:this.listId})}>${this.t("Set active","Aktiv setzen")}</button></div><div class="toolbar"><button @click=${()=>this.command("shopping_items_add",{list_id:this.listId})}>${this.t("Add item","Artikel hinzuf\xFCgen")}</button><button @click=${()=>this.command("shopping_items_clear_checked",{list_id:this.listId})}>${this.t("Clear checked","Erledigte entfernen")}</button><button @click=${()=>this.command("shopping_items_reorder",{list_id:this.listId})}>${this.t("Reorder","Sortieren")}</button><button @click=${()=>this.loadTotals()}>${this.t("Price totals","Preissummen")}</button></div>${this.total?u`<article class="record"><h3>${this.t("Price totals","Preissummen")}</h3>${Object.entries(this.total.totals||{}).map(([t,r])=>u`<p>${t}: ${r}</p>`)}<small>${this.t("Items without a known price","Artikel ohne bekannten Preis")}: ${this.total.unknown_price_count}</small></article>`:""}${this.items.map(t=>u`<article class="record row ${t.checked?"checked":""}"><input type="checkbox" aria-label=${this.t("Check ","Erledigt ")+t.name} .checked=${!!t.checked} ?disabled=${!!this.transport.pending} @change=${r=>this.mutate("shopping_items_check",{item_id:t.id,checked:r.target.checked})}><strong>${t.name}</strong><span>${t.quantity??""} ${t.unit||""}</span>${t.price!==null&&t.price!==void 0?u`<span>${t.price} ${t.currency||""}</span>`:""}<button @click=${()=>this.command("shopping_items_update",{item_id:t.id})}>${this.t("Edit","Bearbeiten")}</button><button @click=${()=>this.command("shopping_items_increment",{item_id:t.id})}>+</button><button class="danger" @click=${()=>this.command("shopping_items_delete",{item_id:t.id})}>${this.t("Delete","L\xF6schen")}</button></article>`)}${this.items.length?"":u`<p class="muted">${this.t("No items on this list.","Keine Artikel in dieser Liste.")}</p>`}`:""}${this.tab==="products"?u`<form class="toolbar" @submit=${t=>{t.preventDefault(),this.search()}}><input aria-label="Catalog search" .value=${this.query} @input=${t=>{this.query=t.target.value}}><button>${this.t("Search","Suchen")}</button></form>${this.products.map(t=>u`<article class="record row"><strong>${t.name}</strong><span>${t.region||""} ${t.category_id||""}</span><button @click=${()=>{this.tab="lists",this.updateComplete.then(()=>this.command("shopping_items_add",{list_id:this.listId,product_id:t.id,name:t.name}))}}>${this.t("Add to list","Zur Liste hinzuf\xFCgen")}</button><button @click=${()=>this.command("shopping_products_get",{product_id:t.id})}>${this.t("Details","Details")}</button></article>`)}`:""}${this.renderRecords()}<mm-commands .api=${this.transport} .prefix=${this.tab==="lists"?"shopping_":i}></mm-commands></section>`}};customElements.define("mm-shopping",Xi);import{MacroMatePanel as Yd}from"../panel.js";var Kn={"Dein Tagebuch":"Your diary",Tagebuch:"Diary",Tagebuchdatum:"Diary date",Tag:"Day",Heute:"Today","Vorheriger Tag":"Previous day","N\xE4chster Tag":"Next day",Schnelleintrag:"Quick entry","Eintrag bearbeiten":"Edit entry","Eintrag kopieren":"Copy entry","Eintrag l\xF6schen":"Delete entry","Lebensmitteleintrag bearbeiten":"Edit food entry",Mahlzeiten:"Meals",Fr\u00FChst\u00FCck:"Breakfast",Mittagessen:"Lunch",Abendessen:"Dinner",Snacks:"Snacks",Mahlzeit:"Meal","Ern\xE4hrung heute":"Nutrition today",\u00DCbrig:"Remaining","\xDCber dem Ziel":"Over target",Kalorien:"Calories",Gegessen:"Consumed",Tagesziel:"Daily target",Makron\u00E4hrstoffe:"Macronutrients",Kohlenhydrate:"Carbohydrates",Fett:"Fat",Unbekannt:"Unknown",Unvollst\u00E4ndig:"Incomplete","Ziel unbekannt":"Unknown target","Werte fehlen":"Values missing","Profil einrichten":"Set up profile","Keine sichere Bilanz":"No reliable balance",Lebensmittel:"Foods","Lebensmittel suchen":"Search foods","Eigenes Lebensmittel":"Custom food","Eigenes Lebensmittel anlegen":"Create custom food","Eigenes Lebensmittel bearbeiten":"Edit custom food",Filter:"Filter",Alle:"All",Favoriten:"Favorites","Zuletzt erfasst":"Recently logged","Eigene Lebensmittel":"Custom foods","Online-Suche (Open Food Facts)":"Online search (Open Food Facts)",Suchen:"Search","Barcode suchen":"Search barcode","EAN scannen":"Scan barcode","Lebensmittel eintragen":"Log food","Favorit entfernen":"Remove favorite","Portion als Favorit speichern":"Save portion as favorite",N\u00E4hrwerte:"Nutrients","Alle Tagesn\xE4hrwerte":"All daily nutrients","N\xE4hrwerte der gew\xE4hlten Portion":"Selected portion nutrients",Bearbeiten:"Edit",Kopieren:"Copy",L\u00F6schen:"Delete",Speichern:"Save",Abbrechen:"Cancel","Endg\xFCltig l\xF6schen":"Confirm deletion","Noch keine Eintr\xE4ge":"No entries yet","Kein gespeichertes Tagesziel":"No saved daily target",Ballaststoffe:"Fiber",Zucker:"Sugar","Ges\xE4ttigte Fetts\xE4uren":"Saturated fat",Salz:"Salt",Energie:"Energy",Portion:"Serving",Anzahl:"Quantity",Mengenmodus:"Quantity mode","Bisherige Portion":"Previous serving",Zieldatum:"Target date",Hersteller:"Producer",Basiseinheit:"Base unit",Portionen:"Servings","Gespeichert.":"Saved.","Gleiche Anfrage erneut senden":"Retry same request","Bitte Eingaben pr\xFCfen.":"Check the submitted fields.","Verbindung unterbrochen. Schreibstatus eventuell ungekl\xE4rt.":"Connection interrupted. Write status may be uncertain.","Gesamtn\xE4hrwerte dieses Eintrags. Leere optionale Felder bleiben unbekannt. Beim Bearbeiten l\xF6scht ein leeres Feld den bisherigen N\xE4hrwert.":"Total nutrients of this entry. Empty optional fields remain unknown. When editing, an empty field clears its previous value.","N\xE4hrwerte werden aus dem gespeicherten Eintrag skaliert, nicht aus dem heutigen Produkt.":"Nutrients are scaled from the recorded entry snapshot, not the current product.","Standard: nur lokal. Online nur nach Absenden und Freigabe in der Integrationskonfiguration.":"Local only by default. Online lookup requires submission and consent in integration settings."};function Qd(n){return Kn[n]?Kn[n]:n.replace(/^Menge \(/,"Amount (").replace(/^Gewählt: /,"Selected: ").replace(/^von /,"of ").replace(/ g bekannt · weitere Werte unbekannt$/," g known \xB7 additional values unknown").replace(/ bearbeiten$/," edit").replace(/ kopieren$/," copy").replace(/ löschen$/," delete")}var Qn=new WeakMap;function Yn(n,e,i,t="text"){let r=Qn.get(n);r||(r=new Map,Qn.set(n,r));let a=r.get(t);(!a||e!==a.output)&&(a={original:e,output:e});let s=i?.startsWith("de")?a.original:Qd(a.original);return r.set(t,{original:a.original,output:s}),s}function ht(n,e){let i=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);for(;i.nextNode();){let t=i.currentNode;if(t.parentElement?.closest(".entry strong,.food-detail h3,.food-detail .muted,.results button,option[data-food-serving]"))continue;let r=Yn(t,t.textContent,e);r!==t.textContent&&(t.textContent=r)}for(let t of n.querySelectorAll("[aria-label],[title],[placeholder]"))for(let r of["aria-label","title","placeholder"]){let a=t.getAttribute(r);if(a!==null){let s=Yn(t,a,e,r);s!==a&&t.setAttribute(r,s)}}}var Ki=class extends Yd{set hass(e){super.hass=e,this.initialized&&ht(this.shadowRoot,e.language)}get hass(){return super.hass}initialize(){super.initialize();let e=document.createElement("style");e.textContent=":host{background:var(--rm-bg-main);color:var(--rm-text);min-height:0;color-scheme:inherit;--primary-text-color:var(--rm-text);--secondary-text-color:var(--rm-text-secondary);--ha-card-background:var(--rm-bg-surface);--divider-color:var(--rm-border)}.card,.metric,.date-nav,dialog{background:var(--rm-bg-surface);border-color:var(--rm-border);color:var(--rm-text)}.metric.calories{background:var(--rm-accent-soft)}.eyebrow,.muted,small{color:var(--rm-text-secondary)}input,select,textarea,button{background:var(--rm-bg-elevated);color:var(--rm-text);border-color:var(--rm-border)}button:hover{background:var(--rm-accent-soft)}button.primary{background:#20633f;color:white}.dialog-status{color:#443700}",this.shadowRoot.append(e),this.translationObserver=new MutationObserver(()=>{ht(this.shadowRoot,this.hass.language)}),this.translationObserver.observe(this.shadowRoot,{subtree:!0,childList:!0,characterData:!0}),ht(this.shadowRoot,this.hass.language)}disconnectedCallback(){this.translationObserver?.disconnect(),super.disconnectedCallback()}renderDiary(){super.renderDiary();let e=document.createElement("mm-summary");e.data=this.data;let i=e.renderEnergy(),t=e.renderMacros(),r=document.createElement("link");r.rel="stylesheet",r.href=new URL("../macromate-card.css",import.meta.url).href,this.diaryNode.prepend(r,i,t);let a=this.data.recommendation;if(a?.fallback_reasons?.includes("weight_unavailable")){let s=document.createElement("p");s.className="weight-fallback",s.setAttribute("role","status"),s.textContent=this.hass.language==="de"?`Gewichtssensor nicht verf\xFCgbar. Gespeichertes Profilgewicht: ${a.weight_kg} kg (kein Live-Messwert).`:`Weight sensor unavailable. Saved profile weight: ${a.weight_kg} kg (not live).`,this.diaryNode.prepend(s)}ht(this.shadowRoot,this.hass.language)}};customElements.define("mm-nutrition",Ki);var Qi="manual-toggle";var Jn="rm_shopping";var ea=["grid","detail","settings","planner","shopping"];function Jd(){return null}function eu(){return[]}var tu={theme:"soft",darkMode:"system",fontSize:"medium",columns:3,showFavourites:!0,showPlanner:!0,recentCount:12,timerSound:"beep",keepScreenOn:!1,keepScreenOnMins:30,showUnitConversion:!1,language:"en",unitSystem:"imperial"},ta={soft:{light:{"--rm-bg-main":"#fafbfc","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#ffffff","--rm-text":"#424242","--rm-text-secondary":"#757575","--rm-text-muted":"#9e9e9e","--rm-accent":"#9fa8da","--rm-accent-soft":"rgba(159,168,218,0.15)","--rm-border":"#e8eaf6","--rm-shadow":"0 2px 6px rgba(0,0,0,0.08)"},dark:{"--rm-bg-main":"#14161a","--rm-bg-surface":"#1b1f25","--rm-bg-elevated":"#232833","--rm-text":"#e4e7ec","--rm-text-secondary":"#a8b0bd","--rm-text-muted":"#7a8594","--rm-accent":"#9fa8da","--rm-accent-soft":"rgba(159,168,218,0.18)","--rm-border":"#2b313c","--rm-shadow":"0 2px 6px rgba(0,0,0,0.3)"}},arctic:{light:{"--rm-bg-main":"#f0f4f8","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#ffffff","--rm-text":"#1a2332","--rm-text-secondary":"#526070","--rm-text-muted":"#8097aa","--rm-accent":"#2979ff","--rm-accent-soft":"rgba(41,121,255,0.12)","--rm-border":"#dce6f0","--rm-shadow":"0 2px 6px rgba(26,35,50,0.1)"}},meadow:{light:{"--rm-bg-main":"#f4f7f0","--rm-bg-surface":"#fefffe","--rm-bg-elevated":"#fefffe","--rm-text":"#2d3a2a","--rm-text-secondary":"#6b7c64","--rm-text-muted":"#96a98e","--rm-accent":"#4caf50","--rm-accent-soft":"rgba(76,175,80,0.12)","--rm-border":"#dde8d8","--rm-shadow":"0 2px 6px rgba(45,58,42,0.1)"}},blossom:{light:{"--rm-bg-main":"#fdf8fb","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#fff8fc","--rm-text":"#3d1f35","--rm-text-secondary":"#8c5e79","--rm-text-muted":"#b48fa5","--rm-accent":"#c2668a","--rm-accent-soft":"rgba(194,102,138,0.12)","--rm-border":"#f0d6e8","--rm-shadow":"0 2px 6px rgba(61,31,53,0.1)"},dark:{"--rm-bg-main":"#1a0d12","--rm-bg-surface":"#241420","--rm-bg-elevated":"#2e1a28","--rm-text":"#f8d0de","--rm-text-secondary":"#c070a0","--rm-text-muted":"#603050","--rm-accent":"#f48fb1","--rm-accent-soft":"rgba(244,143,177,0.15)","--rm-border":"rgba(248,208,222,0.08)","--rm-shadow":"0 2px 8px rgba(0,0,0,0.4)"}},ocean:{light:{"--rm-bg-main":"#f0f7ff","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#f9fbff","--rm-text":"#1a3a5f","--rm-text-secondary":"#4a6b8c","--rm-text-muted":"#7a9bbd","--rm-accent":"#0077ff","--rm-accent-soft":"rgba(0,119,255,0.12)","--rm-border":"#d0e1f2","--rm-shadow":"0 2px 6px rgba(26,58,95,0.1)"}},midnight:{dark:{"--rm-bg-main":"#0d1117","--rm-bg-surface":"#161b22","--rm-bg-elevated":"#1c2333","--rm-text":"#c9d1d9","--rm-text-secondary":"#8b949e","--rm-text-muted":"#6e7681","--rm-accent":"#58a6ff","--rm-accent-soft":"rgba(88,166,255,0.15)","--rm-border":"#21262d","--rm-shadow":"0 2px 8px rgba(0,0,0,0.5)"}},ember:{dark:{"--rm-bg-main":"#111111","--rm-bg-surface":"#1c1a17","--rm-bg-elevated":"#242018","--rm-text":"#f5f0e8","--rm-text-secondary":"#a89880","--rm-text-muted":"#7a6a55","--rm-accent":"#f0a500","--rm-accent-soft":"rgba(240,165,0,0.15)","--rm-border":"rgba(245,240,232,0.08)","--rm-shadow":"0 2px 8px rgba(0,0,0,0.5)"}},neon:{dark:{"--rm-bg-main":"#0a0b10","--rm-bg-surface":"#121420","--rm-bg-elevated":"#1a1d2e","--rm-text":"#e0e0f0","--rm-text-secondary":"#a0a5c0","--rm-text-muted":"#6a6f8e","--rm-accent":"#bb86fc","--rm-accent-soft":"rgba(187,134,252,0.15)","--rm-border":"#2a2d45","--rm-shadow":"0 2px 8px rgba(0,0,0,0.6)"}}},iu={small:"13px",medium:"15px",large:"17px"};function ru(){return{...tu}}function nu(){return!1}function au(){return[]}function su(){return[]}function Yi(n){let e=Math.floor(n/3600),i=Math.floor(n%3600/60),t=n%60;return e>0?`${e}:${String(i).padStart(2,"0")}:${String(t).padStart(2,"0")}`:`${i}:${String(t).padStart(2,"0")}`}function Ji(n){try{let e=new(window.AudioContext||window.webkitAudioContext);e.createGain().connect(e.destination);let t=(r,a,s,d=.6)=>{let g=e.createOscillator(),x=e.createGain();g.connect(x),x.connect(e.destination),g.frequency.value=r,x.gain.setValueAtTime(d,e.currentTime+a),x.gain.exponentialRampToValueAtTime(.001,e.currentTime+a+s),g.start(e.currentTime+a),g.stop(e.currentTime+a+s+.05)};if(n==="beep")t(880,0,.15),t(880,.2,.15),t(880,.4,.15);else if(n==="ding")t(1318,0,.8,.5),t(1047,.1,.6,.3);else if(n==="alarm")for(let r=0;r<5;r++)t(880,r*.25,.12),t(660,r*.25+.13,.1)}catch{}}var er=class extends me{static properties={hass:{type:Object},_config:{type:Object},_view:{type:String},_recipes:{type:Array},_tags:{type:Array},_selectedRecipe:{type:Object},_loading:{type:Boolean},_error:{type:String},_searchQuery:{type:String},_activeTag:{type:String},_shoppingLists:{type:Array},_slmAvailable:{type:Boolean},_localShoppingItems:{type:Array},_settings:{type:Object},_wide:{type:Boolean},_sidebarCollapsed:{type:Boolean},_gridScrollPos:{type:Number},_recentRecipeIds:{type:Array},_timers:{type:Array},_timerAlarm:{type:Object},_timerAlarmQueue:{type:Array},_timersPrevView:{type:String},_customTimerInput:{type:String},_hdrStarHover:{type:Number},_mobileMenuOpen:{type:Boolean},_navDirection:{type:String},_closingDetail:{type:Boolean},_gridFilterPreset:{type:Object},_timerPresets:{type:Array},_presetNameInput:{type:String},_presetMinsInput:{type:String},_alarmAddInput:{type:String},_plannerFromRecipe:{type:Object},_globalMode:{type:Boolean},_quickTimerLabel:{type:String},_globalWakeActive:{type:Boolean}};constructor(){super(),this._pendingViewRestore=Jd(),this._view="grid",this._recipes=[],this._tags=[],this._selectedRecipe=null,this._loading=!1,this._error=null,this._searchQuery="",this._activeTag=null,this._shoppingLists=[],this._slmAvailable=!1,this._localShoppingItems=[],this._settings=ru(),this._languageAutoDetectPending=!nu(),Ze(this._settings.language),this._wide=!1,this._sidebarCollapsed=!1,this._gridScrollPos=0,this._recentRecipeIds=au(),this._timers=su(),this._timerAlarm=null,this._timerAlarmQueue=[],this._timersPrevView=null,this._customTimerInput="",this._hdrStarHover=0,this._mobileMenuOpen=!1,this._navDirection="forward",this._closingDetail=!1,this._gridFilterPreset=null,this._timerPresets=eu(),this._presetNameInput="",this._presetMinsInput="",this._alarmAddInput="",this._plannerFromRecipe=null,this._globalMode=!1,this._quickTimerLabel="",this._alarmLoopActive=!1,this._alarmInterval=null,this._alarmTimeout=null,this._alarmAudio=null,this._unsubscribe=null,this._refreshGeneration=0,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._recipeRefreshDeferred=!1,this._darkModeQuery=null,this._resizeObserver=null,this._timerTick=null,this._globalWakeActive=!1,this._globalWakeUnsubscribeFn=null}setConfig(e){this._config=e}static getStubConfig(){return{}}getCardSize(){return 6}_updateHeight(){requestAnimationFrame(()=>requestAnimationFrame(()=>{let e=this.getBoundingClientRect().top,i=window.innerHeight-Math.max(e,0);i>100&&(this.style.height=`${i}px`)}))}connectedCallback(){super.connectedCallback(),this._darkModeQuery=window.matchMedia("(prefers-color-scheme: dark)"),this._darkModeQuery.addEventListener("change",this._onSystemDark),this._applyTheme(),this._resizeObserver=new ResizeObserver(e=>{let i=e[0]?.contentRect?.width??0;this._wide=i>=620}),this._resizeObserver.observe(this),this._onViewportResize=()=>this._updateHeight(),window.visualViewport?.addEventListener("resize",this._onViewportResize),window.addEventListener("resize",this._onViewportResize),this._updateHeight(),this._timerTick=setInterval(()=>this._tickTimers(),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._refreshGeneration++,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null),this._darkModeQuery?.removeEventListener("change",this._onSystemDark),this._resizeObserver?.disconnect(),window.visualViewport?.removeEventListener("resize",this._onViewportResize),window.removeEventListener("resize",this._onViewportResize),this._timerTick&&(clearInterval(this._timerTick),this._timerTick=null),this._timerAlarm&&(this._stopAlarmLoop(),this._timerAlarm=null),this._timerAlarmQueue=[],this._timers,this._globalWakeActive&&Qe(Qi)}_onSystemDark=()=>{this._settings.darkMode==="system"&&this._applyTheme()};updated(e){if(e.has("hass")&&this.hass&&!this._api&&(this._api=new mt(this.hass),this._api.transport=this.transport,this._init()),e.has("hass")&&this.hass&&this._languageAutoDetectPending){this._languageAutoDetectPending=!1;let i=(this.hass.language||"").split("-")[0].toLowerCase(),t=vt.includes(i)?i:this._settings.language;this._settings={...this._settings,language:t},this._settings,Ze(t)}e.has("hass")&&this._api&&(this._api.hass=this.hass),e.has("_settings")&&this._applyTheme(),(e.has("_view")||e.has("_selectedRecipe")||e.has("_timers")||e.has("_recentRecipeIds"))&&this._saveViewState(),(e.has("_view")||e.has("_closingDetail"))&&this._recipeRefreshDeferred&&!this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail")&&this._queueRefresh()}_saveViewState(){if(!this._cacheBootstrapped||!this.transport?.current())return;let e=ea.includes(this._view)?this._view:"grid";cr(this.transport,{view:e,recipeId:e==="detail"&&this._selectedRecipe?.id||null,recentIds:this._recentRecipeIds},this._timers)}_restoreViewState(){let e=this._pendingViewRestore;if(this._pendingViewRestore=null,!(!e||!ea.includes(e.view)))if(e.view==="detail"&&e.recipeId){let i=this._recipes.find(t=>t.id===e.recipeId);i&&(this._selectedRecipe=i,this._view="detail")}else e.view!=="detail"&&(this._view=e.view)}_applyTheme(){let e=this._settings,i=ta[e.theme]??ta.soft,t=!i.light,r=!i.dark,a=t;!t&&!r?e.darkMode==="on"?a=!0:e.darkMode==="off"?a=!1:a=this._darkModeQuery?.matches??!1:r&&(a=!1);let s=a?i.dark??i.light:i.light??i.dark;for(let[d,g]of Object.entries(s))this.style.setProperty(d,g);this.style.setProperty("--rm-font-size-base",iu[e.fontSize]??"15px"),this.style.setProperty("--rm-grid-columns",`repeat(${e.columns??3}, minmax(0, 1fr))`)}async _init(){if(this._loading=!0,this._error=null,!this._cacheBootstrapped&&this.hass.user.is_admin){let e=lr(this.transport);this._pendingViewRestore=e,this._recentRecipeIds=e.recentIds||[],this._timers=e.timers||[],this._cacheBootstrapped=!0}if(!this.hass.user.is_admin){this._view="shopping",await this._loadShoppingLists(),this._loading=!1;return}try{await Promise.all([this._loadRecipes(),this._loadTags(),this._loadShoppingLists(),this._loadGlobalTimers()]),this._restoreViewState();let e=await this.transport.call("preferences_get");e.preferences?.recipe_settings&&(this._settings={...this._settings,...e.preferences.recipe_settings},await Ze(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade()),await this._loadPresets(),await this._subscribe()}catch(e){this._error=e.message||c("Failed to load recipes")}finally{this._loading=!1}}async _loadGlobalTimers(){try{let{timers:e}=await this._api.getGlobalTimers(),i=Date.now()/1e3;this._timers=[...this._timers.filter(t=>!t.global),...(e||[]).map(t=>this._globalTimerToLocal(t,i))]}catch{}}_globalTimerToLocal(e,i=Date.now()/1e3){let t=e.running?Math.max(0,e.duration-(i-e.start_time)):e.paused_remaining??e.duration;return{id:e.id,label:e.label,total:e.duration,remaining:Math.round(t),running:e.running&&t>0,alarming:e.running&&t<=0,presetId:e.preset_id||null,global:!0,duration:e.duration,start_time:e.start_time,paused_remaining:e.paused_remaining}}_loadLocalShopping(){try{let e=localStorage.getItem(Jn);this._localShoppingItems=e?JSON.parse(e):[]}catch{this._localShoppingItems=[]}}_saveLocalShopping(){try{localStorage.setItem(Jn,JSON.stringify(this._localShoppingItems))}catch{}}async _loadRecipes(){let e=await this._api.getAllRecipes();this._recipes=e?.recipes??[]}async _loadTags(){let e=await this._api.getTags();this._tags=e?.tags??[]}async _loadShoppingLists(){try{this._shoppingLists=(await this._api.getShoppingLists())?.lists??[],this._slmAvailable=!0}catch{this._shoppingLists=[],this._slmAvailable=!1}}async _subscribe(){if(this._unsubscribe)return;let e=this._refreshGeneration,i=await this._api.subscribe(()=>this._queueRefresh());!this.isConnected||e!==this._refreshGeneration||!this.transport.current()?i():this._unsubscribe=i}_queueRefresh(){if(this._refreshRequested=!0,this._refreshScheduled||this._refreshRunning)return;this._refreshScheduled=!0;let e=this._refreshGeneration;queueMicrotask(()=>{e===this._refreshGeneration&&(this._refreshScheduled=!1,this._refreshLive())})}async _refreshLive(){let e=this.transport;if(!this._refreshRequested||!this.isConnected||!e?.current()||e.pending)return;this._refreshRequested=!1,this._refreshRunning=!0;let i=this._refreshGeneration,t=()=>!!this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail"),r=t();try{let[a,s,d,g]=await Promise.all([this._api.getShoppingLists(),r?null:this._api.getAllRecipes(),r?null:this._api.getTags(),r?null:this._api.getGlobalTimers()]);if(!this.isConnected||i!==this._refreshGeneration||this.transport!==e||!e.current())return;if(e.pending){this._refreshRequested=!0;return}this._shoppingLists=a?.lists??[],this._slmAvailable=!0,this._recipeRefreshDeferred=r||t(),r&&!t()&&(this._refreshRequested=!0),this._recipeRefreshDeferred||(this._recipes=s?.recipes??[],this._tags=d?.tags??[],this._timers=[...this._timers.filter(x=>!x.global),...(g?.timers||[]).map(x=>this._globalTimerToLocal(x))])}catch{}finally{i===this._refreshGeneration&&(this._refreshRunning=!1,this._refreshRequested&&!e.pending&&e.current()&&this._queueRefresh())}}get _filteredRecipes(){let e=this._recipes;if(this._activeTag&&(e=e.filter(i=>i.tags?.includes(this._activeTag)||i.courses?.includes(this._activeTag)||i.categories?.includes(this._activeTag)||i.collections?.includes(this._activeTag))),this._searchQuery.trim()){let i=this._searchQuery.trim().toLowerCase();e=e.filter(t=>t.name?.toLowerCase().includes(i)||t.description?.toLowerCase().includes(i)||t.tags?.some(r=>r.toLowerCase().includes(i)))}return e}get _recentRecipes(){let e=this._settings.recentCount??12;return this._recentRecipeIds.slice(0,e).map(i=>this._recipes.find(t=>t.id===i)).filter(Boolean)}async _handleSettingsChange(e){let i=this._settings.language;if(this._settings=e.detail.settings,this._settings,this._settings.language!==i){await Ze(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade(),this.requestUpdate();for(let t of this.shadowRoot.querySelectorAll("*"))t.requestUpdate?.()}try{await this.transport.call("preferences_update",{preferences:{recipe_settings:this._settings}}),this._error=null}catch(t){this._error=t.message}}async _toggleGlobalWakeLock(){Ee()&&(this._globalWakeActive?(await Qe(Qi),this._globalWakeActive=!1):(await bt(Qi),this._globalWakeActive=!0))}_tickTimers(){if(!this._timers.length)return;let e=!1,i=[],t=Date.now()/1e3,r=this._timers.map(a=>{if(a.alarming||!a.running)return a;let s=a.global?Math.max(0,a.duration-(t-a.start_time)):a.remaining-1;if(e=!0,s<=0){if(a.presetId)return{...a,remaining:0,running:!1,alarming:!0};i.push({id:a.id,label:a.label})}return{...a,remaining:Math.round(s),running:s>0}});e&&(this._timers=r,this._timers,void 0),i.length&&(this._timerAlarm||(this._timerAlarm=i.shift(),this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile)),i.length&&(this._timerAlarmQueue=[...this._timerAlarmQueue,...i]))}async _startTimer(e,i,t=null,r=!1){if(!Number.isFinite(e)||e<=0||e>604800||i&&String(i).length>300)return;let a=i||c(ce`${Math.floor(e/60)} min timer`);if(r&&this._api)try{let d=Date.now()/1e3;await this._api.addGlobalTimer({label:a,duration:e,start_time:d,running:!0,paused_remaining:null,...t?{preset_id:t}:{}}),await this._loadGlobalTimers();return}catch(d){this._error=d.message;return}let s=crypto.randomUUID();this._timers=[...this._timers,{id:s,label:a,total:e,remaining:e,running:!0,presetId:t||null}],this._timers}async _stopTimer(e){if(this._timers.find(t=>t.id===e)?.global){try{await this._api.deleteGlobalTimer(e),await this._loadGlobalTimers()}catch(t){this._error=t.message}return}this._timers=this._timers.filter(t=>t.id!==e)}async _pauseTimer(e){let i=this._timers.find(t=>t.id===e);if(i){if(i.global){try{await this._api.updateGlobalTimer(e,i.running?{running:!1,paused_remaining:i.remaining}:{running:!0,start_time:Date.now()/1e3-(i.duration-i.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(t){this._error=t.message}return}this._timers=this._timers.map(t=>t.id===e?{...t,running:!t.running}:t)}}async _addTimeToTimer(e,i){let t=this._timers.find(r=>r.id===e);if(t){if(t.global){try{await this._api.updateGlobalTimer(e,{duration:t.duration+i,running:!0,start_time:Date.now()/1e3-(t.duration-t.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(r){this._error=r.message}return}this._timers=this._timers.map(r=>r.id===e?{...r,total:r.total+i,remaining:r.remaining+i,running:!0,alarming:!1}:r)}}_dismissAlarm(){this._timerAlarm&&(this._stopAlarmLoop(),this._stopTimer(this._timerAlarm.id),this._timerAlarm=this._timerAlarmQueue.length?this._timerAlarmQueue.shift():null,this._timerAlarm&&this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile))}async _loadPresets(){let e=await this.transport.call("timer_presets_get");this._timerPresets=e.presets||[]}async _addPresetTimer(){let e=this._presetNameInput.trim(),i=Number(this._presetMinsInput);if(!(!e||!Number.isFinite(i)||i<=0))try{await this.transport.call("timer_presets_add",{name:e,seconds:Math.round(i*60)}),await this._loadPresets(),this._presetNameInput="",this._presetMinsInput=""}catch(t){this._error=t.message}}async _removePreset(e){try{await this.transport.call("timer_presets_delete",{preset_id:e}),await this._loadPresets()}catch(i){this._error=i.message}}_startAlarmLoop(e,i){if(this._stopAlarmLoop(),e!=="none"&&!(e==="file"&&(typeof i!="string"||i.length>2e6||!/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(i))))if(e==="file"&&i){this._alarmLoopActive=!0;let t=()=>{this._alarmLoopActive&&(this._alarmAudio=new Audio(i),this._alarmAudio.onended=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(t,2e3))},this._alarmAudio.onerror=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(()=>Ji("beep"),2e3))},this._alarmAudio.play().catch(()=>{}))};t()}else Ji(e),this._alarmInterval=setInterval(()=>Ji(e),4e3)}_stopAlarmLoop(){this._alarmLoopActive=!1,this._alarmInterval&&(clearInterval(this._alarmInterval),this._alarmInterval=null),this._alarmTimeout&&(clearTimeout(this._alarmTimeout),this._alarmTimeout=null),this._alarmAudio&&(this._alarmAudio.pause(),this._alarmAudio.onended=null,this._alarmAudio.onerror=null,this._alarmAudio=null)}_handleStartTimer(e){let{seconds:i,label:t}=e.detail;this._startTimer(i,t,null,this._globalMode)}_handleSearch(e){this._searchQuery=e.detail?.query??""}_handleTagFilter(e){let i=e.detail?.tag;this._activeTag=this._activeTag===i?null:i}_handleChipNav(e){let{filterMode:i,value:t}=e.detail;this._navDirection="back",i==="tags"?(this._activeTag=t,this._gridFilterPreset=null):(this._activeTag=null,this._gridFilterPreset={filterMode:i,selectedValues:[t]}),this._view="grid"}_handleBack(){this._closingDetail||(this._view==="detail"&&this._selectedRecipe&&!this._closingDetail?(this._closingDetail=!0,this._view="grid",window.matchMedia("(prefers-reduced-motion: reduce)").matches&&(this._closingDetail=!1,this._selectedRecipe=null)):(this._navDirection="back",this._view="grid",this._selectedRecipe=null,this._closingDetail=!1))}_onDetailTransitionEnd(e){e.target===e.currentTarget&&e.propertyName==="transform"&&this._closingDetail&&(this._closingDetail=!1,this._selectedRecipe=null)}_handleShowGrid(){this._navDirection="back",this._view="grid",this._selectedRecipe=null}_handleShowPlanner(){this._plannerFromRecipe=this._selectedRecipe||null,this._navDirection="forward",this._view="planner"}_handleBackToRecipe(){this._plannerFromRecipe&&(this._selectedRecipe=this._plannerFromRecipe,this._plannerFromRecipe=null,this._navDirection="back",this._view="detail")}_handleOpenRecipe(e){let i=this.shadowRoot?.querySelector("rm-recipe-grid");if(i){let r=i.shadowRoot?.querySelector(".grid-scroll");this._gridScrollPos=r?.scrollTop??0}let t=e.detail?.recipe;if(this._closingDetail=!1,this._navDirection="forward",this._selectedRecipe=t,this._view="detail",t?.id){let r=[t.id,...this._recentRecipeIds.filter(a=>a!==t.id)].slice(0,50);this._recentRecipeIds=r}}async _handleToggleFavourite(e){try{let{recipeId:i}=e.detail;await this._api.toggleFavourite(i),await this._loadRecipes(),this._selectedRecipe?.id===i&&(this._selectedRecipe=this._recipes.find(t=>t.id===i)??this._selectedRecipe)}catch{}}async _handleDeleteRecipe(e){try{await this._api.deleteRecipe(e.detail.recipeId),await this._loadRecipes(),await this._loadTags(),this._navDirection="back",this._view="grid",this._selectedRecipe=null}catch{}}async _handleUpdateRecipe(e){try{let{recipeId:i,data:t}=e.detail;await this._api.updateRecipe(i,t),await this._loadRecipes(),await this._loadTags(),this._selectedRecipe?.id===i&&(this._selectedRecipe=this._recipes.find(r=>r.id===i)??null)}catch{}}async _handleAddRecipe(e){try{await this._api.addRecipe(e.detail.data),this._navDirection="back",this._view="grid",await this._loadRecipes(),await this._loadTags()}catch(i){console.error("[Recipe Manager] Failed to save recipe:",i)}}async _handleImportDone(){this._navDirection="back",this._view="grid",await this._loadRecipes(),await this._loadTags()}async _handleAddToShopping(e){let{ingredients:i,listId:t,recipeName:r}=e.detail;if(this._slmAvailable&&t)try{(await this._api.addIngredientsToShoppingList(t,i,r)).filter(s=>!s.success).length&&console.warn("Some ingredients failed to add to SLM")}catch(a){console.error("Shopping list error:",a)}else{let a=i.map(s=>({id:Math.random().toString(36).slice(2,10),name:s.name,amount:s.amount||null,unit:s.unit||null,checked:!1}));this._localShoppingItems=[...this._localShoppingItems,...a],this._saveLocalShopping()}}_handleShoppingLocalUpdate(e){this._localShoppingItems=e.detail.items,this._saveLocalShopping()}_renderStars(e){let i=e||0,t=this._hdrStarHover,r=t>0?t:i;return u`
      <div class="header-stars"
        @mouseleave=${()=>{this._hdrStarHover=0}}
        title="${t>0?c(ce`Set rating: ${t}★`):i>0?c(ce`Rating: ${i}★ — click to change`):c("Click to rate")}">
        ${[1,2,3,4,5].map(a=>u`
          <span class="hdr-star ${a<=r?"filled":""}"
            @mouseover=${()=>{this._hdrStarHover=a}}
            @click=${()=>this._handleRateRecipe(a)}>★</span>
        `)}
      </div>
    `}async _handleRateRecipe(e){try{if(!this._selectedRecipe)return;let i=this._selectedRecipe.rating===e?null:e;this._hdrStarHover=0,await this._handleUpdateRecipe({detail:{recipeId:this._selectedRecipe.id,data:{rating:i}}})}catch{}}_renderSidebar(){if(!this.hass?.user?.is_admin)return u`<nav class="rm-sidebar"><div class="sb-nav">${[["shopping",c("Shopping List")],["commands",this._settings.language==="de"?"Alle Aktionen":"All actions"],["settings",c("Settings")]].map(([r,a])=>u`<button class="sb-item ${this._view===r?"active":""}" @click=${()=>{this._view=r}}>${a}</button>`)}</div></nav>`;let e=this._view,i=this._sidebarCollapsed,t=(r,a,s,d=!1,g=null)=>u`
      <button
        class="sb-item ${e===s?"active":""} ${d?"placeholder":""}"
        title="${d?c(ce`${a} — coming soon`):a}"
        @click=${d?void 0:g||(()=>{this._navDirection="forward",this._view=s,this._selectedRecipe=null})}
        ?disabled=${d}
      >
        <ha-icon icon="${r}"></ha-icon>
        ${i?"":u`<span>${a}</span>`}
      </button>
    `;return u`
      <nav class="rm-sidebar ${i?"collapsed":""}">
        <div class="sb-top">
          <div class="sb-logo-row">
            <button class="sb-collapse-btn" @click=${()=>{this._sidebarCollapsed=!this._sidebarCollapsed}}
              title="${i?c("Expand sidebar"):c("Collapse sidebar")}">
              <ha-icon icon="${i?"mdi:menu-close":"mdi:menu-open"}"></ha-icon>
            </button>
          </div>

          ${i?u`
            <button class="sb-icon-only-btn" @click=${()=>{this._view="add"}} title="${c("New Recipe")}">
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          `:u`
            <div class="sb-search">
              <ha-icon icon="mdi:magnify" class="sb-search-icon"></ha-icon>
              <input
                class="sb-search-input"
                type="text"
                placeholder="${c("Search\u2026")}"
                .value=${this._searchQuery}
                @input=${r=>{this._searchQuery=r.target.value,this._navDirection="back",this._view="grid"}}
              />
              ${this._searchQuery?u`
                <button class="sb-search-clear" @click=${()=>{this._searchQuery=""}}>
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `:""}
            </div>

            <button class="sb-new-btn" @click=${()=>{this._view="add"}}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>${c("New Recipe")}</span>
            </button>
          `}
        </div>

        <div class="sb-nav">
          ${t("mdi:home",c("Home"),"grid")}
          ${t("mdi:cart-outline",c("Shopping List"),"shopping")}
          ${t("mdi:heart-pulse",this._settings.language==="de"?"Ern\xE4hrung":"Nutrition","nutrition")}
          ${t("mdi:form-select",this._settings.language==="de"?"Alle Aktionen":"All actions","commands")}
          ${this._settings.showPlanner?t("mdi:calendar-week",c("Meal Planner"),"planner",!1,()=>{this._plannerFromRecipe=null,this._navDirection="forward",this._view="planner",this._selectedRecipe=null}):""}
          ${t("mdi:book-open-variant",c("Cookbook"),"cookbook",!0)}
          <button
            class="sb-item ${e==="timers"?"active":""}"
            title="${c("Timers")}"
            @click=${()=>{this._timersPrevView=this._view,this._view="timers"}}
          >
            <ha-icon icon="mdi:timer-outline"></ha-icon>
            ${i?"":u`<span>${c("Timers")}</span>`}
            ${this._timers.length?u`<span class="sb-timer-badge">${this._timers.length}</span>`:""}
          </button>
        </div>

        <div class="sb-bottom">
          <button class="sb-item placeholder" disabled title="${c("Sync \u2014 coming soon")}">
            <ha-icon icon="mdi:cloud-sync-outline"></ha-icon>${i?"":u`<span>${c("Sync")}</span>`}
          </button>
          <button class="sb-item placeholder" disabled title="${c("Help \u2014 coming soon")}">
            <ha-icon icon="mdi:help-circle-outline"></ha-icon>${i?"":u`<span>${c("Help")}</span>`}
          </button>
          <button class="sb-item ${e==="settings"?"active":""}"
            @click=${()=>{this._view="settings"}}>
            <ha-icon icon="mdi:cog-outline"></ha-icon>${i?"":u`<span>${c("Settings")}</span>`}
          </button>
        </div>
      </nav>
    `}_renderHeader(){let e=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe,i=this._view==="settings",t=this._view==="add",r=this._view==="timers",a=this._wide,s=i?c("Settings"):t?c("New Recipe"):r?c("Timers"):e?"":this._view==="planner"?c("Meal Planner"):this._view==="shopping"?c("Shopping List"):this._view==="nutrition"?this._settings.language==="de"?"Ern\xE4hrung":"Nutrition":c("Recipes");return u`
      <div class="rm-header">
        <div class="rm-header-left">
          ${e||t?u`
            <button class="icon-btn" @click=${this._handleBack} title="${c("Back")}">
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>
          `:r&&this._timersPrevView==="detail"?u`
            <button class="icon-btn"
              @click=${()=>{this._navDirection="back",this._view="detail",this._timersPrevView=null}}
              title="${c("Back to recipe")}">
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>
          `:!a&&this._view!=="grid"&&!i&&!r?u`
            <button class="icon-btn" @click=${this._handleShowGrid}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>
          `:""}
          <div class="rm-title">
            <ha-icon icon="mdi:chef-hat"></ha-icon>
            <span>${s}</span>
          </div>
        </div>

        <div class="rm-header-right">
          <!-- Timer pills (compact, shown when timers are running, not in timer view) -->
          ${this._timers.length&&this._view!=="timers"?u`
            <div class="timer-pills" @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}>
              ${this._timers.slice(0,3).map(d=>u`
                <div class="timer-pill ${d.running?"":"paused"}">
                  <ha-icon icon="mdi:timer-outline"></ha-icon>
                  <span>${Yi(d.remaining)}</span>
                </div>
              `)}
              ${this._timers.length>3?u`<span class="timer-more">+${this._timers.length-3}</span>`:""}
            </div>
          `:""}

          ${e?this._renderStars(this._selectedRecipe.rating):""}

          <button class="icon-btn wake-toggle-btn ${this._globalWakeActive?"active":""}"
            @click=${this._toggleGlobalWakeLock}
            ?disabled=${!Ee()}
            title="${Ee()?this._globalWakeActive?c("Screen awake \u2014 click to allow sleep"):c("Keep screen awake"):c("Keep screen awake \u2014 requires a secure (HTTPS) connection and a supported browser")}">
            <ha-icon icon="${this._globalWakeActive?"mdi:eye":"mdi:eye-off-outline"}"></ha-icon>
          </button>

          ${i||t||r?u`
            <button class="icon-btn" @click=${this._handleShowGrid}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          `:a?"":u`
            <button class="icon-btn"
              @click=${()=>{this._mobileMenuOpen=!this._mobileMenuOpen}}
              title="${this._mobileMenuOpen?c("Close menu"):c("Menu")}">
              <ha-icon icon="${this._mobileMenuOpen?"mdi:close":"mdi:menu"}"></ha-icon>
            </button>
          `}
        </div>
      </div>
    `}_renderBody(){let e=this._settings;if(this._view==="nutrition")return u`<mm-nutrition .hass=${this.hass}></mm-nutrition>`;if(this._view==="commands")return u`<mm-commands .api=${this.transport}></mm-commands>`;if(this._view==="settings")return u`
      <rm-settings-view
        .hass=${this.hass}
        .settings=${e}
        @rm-settings-change=${this._handleSettingsChange}
      ></rm-settings-view>
    `;if(this._view==="add")return u`
      <rm-add-recipe-dialog
        .api=${this._api}
        .asPanel=${!0}
        .inlineMode=${!0}
        @rm-add-recipe=${this._handleAddRecipe}
        @rm-import-done=${this._handleImportDone}
        @rm-close=${()=>{this._navDirection="back",this._view="grid"}}
      ></rm-add-recipe-dialog>
    `;if(this._view==="timers")return this._renderTimersView();if(this._view==="planner")return u`
      <rm-meal-planner
        .api=${this._api}
        .recipes=${this._recipes}
        .fromRecipe=${this._plannerFromRecipe}
        .shoppingLists=${this._shoppingLists}
        .settings=${e}
        @rm-open-recipe=${this._handleOpenRecipe}
        @rm-back-to-recipe=${this._handleBackToRecipe}
      ></rm-meal-planner>
    `;if(this._view==="shopping")return u`
      <mm-shopping
        .hass=${this.hass}
        .slmAvailable=${this._slmAvailable}
        .shoppingLists=${this._shoppingLists}
        .api=${this._api}
        .transport=${this.transport}
        .settings=${this._settings}
        @rm-shopping-local-update=${this._handleShoppingLocalUpdate}
      ></mm-shopping>
    `;if(this._loading)return u`
      <div class="rm-loading"><ha-circular-progress active size="large"></ha-circular-progress></div>
    `;if(this._error)return u`
      <div class="rm-error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <p>${this._error}</p>
        <button class="text-btn" @click=${this._init.bind(this)}>${c("Retry")}</button>
      </div>
    `;let i=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe;return u`
      <div class="rm-slide-track ${this._view==="detail"?"show-detail":""}"
        @transitionend=${this._onDetailTransitionEnd}>
        <div class="rm-slide-pane">
          <rm-recipe-grid
            .recipes=${this._filteredRecipes}
            .allRecipes=${this._recipes}
            .tags=${this._tags}
            .searchQuery=${this._searchQuery}
            .activeTag=${this._activeTag}
            .columns=${e.columns}
            .showFavourites=${e.showFavourites}
            .hideSidebar=${this._wide}
            .scrollPos=${this._gridScrollPos}
            .recentRecipes=${this._recentRecipes}
            .recentCount=${e.recentCount??12}
            .filterPreset=${this._gridFilterPreset}
            @rm-search=${this._handleSearch}
            @rm-tag-filter=${this._handleTagFilter}
            @rm-open-recipe=${this._handleOpenRecipe}
            @rm-toggle-favourite=${this._handleToggleFavourite}
          ></rm-recipe-grid>
        </div>
        <div class="rm-slide-pane">
          ${i?u`
            <rm-recipe-detail
              .recipe=${this._selectedRecipe}
              .api=${this._api}
              .settings=${e}
              .wide=${this._wide}
              .shoppingLists=${this._shoppingLists}
              .slmAvailable=${this._slmAvailable}
              .allTags=${this._tags||[]}
              .allCourses=${[...new Set(this._recipes.flatMap(t=>t.courses||[]))].sort()}
              .allCategories=${[...new Set(this._recipes.flatMap(t=>t.categories||[]))].sort()}
              .allCollections=${[...new Set(this._recipes.flatMap(t=>t.collections||[]))].sort()}
              @rm-back=${this._handleBack}
              @rm-toggle-favourite=${this._handleToggleFavourite}
              @rm-delete-recipe=${this._handleDeleteRecipe}
              @rm-update-recipe=${this._handleUpdateRecipe}
              @rm-recipe-saved=${async()=>{await this._loadRecipes(),this._selectedRecipe=this._recipes.find(t=>t.id===this._selectedRecipe?.id)||null}}
              @rm-add-to-shopping=${this._handleAddToShopping}
              @rm-start-timer=${this._handleStartTimer}
              @rm-show-planner=${this._handleShowPlanner}
              @rm-chip-nav=${this._handleChipNav}
            ></rm-recipe-detail>
          `:""}
        </div>
      </div>
    `}_renderTimersView(){let e=this._customTimerInput.trim(),i=this._presetNameInput.trim()&&this._presetMinsInput.trim(),t=[{label:"+30s",secs:30},{label:"+1m",secs:60},{label:"+5m",secs:300},{label:"+10m",secs:600}],r=this._timers.filter(s=>!s.presetId),a=263.9;return u`
      <div class="timers-view">

        <!-- Active timers (non-preset): horizontal wrap of square arc tiles -->
        ${r.length?u`
          <div class="timer-list">
            ${r.map(s=>{let d=s.remaining<60?"#f59e0b":"var(--rm-accent)",g=a*(1-s.remaining/s.total);return u`
                <div class="timer-card">
                  <button class="preset-remove" @click=${()=>this._stopTimer(s.id)} title="${c("Remove")}">
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                  ${s.global?u`<ha-icon class="timer-global-badge" icon="mdi:earth" title="${c("Global timer")}"></ha-icon>`:""}
                  <span class="timer-card-name">${s.label}</span>
                  <div class="preset-arc-wrap">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rm-border)" stroke-width="6"/>
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke="${d}" stroke-width="6" stroke-linecap="round"
                        stroke-dasharray="${a}" stroke-dashoffset="${g}"
                        transform="rotate(-90 50 50)"
                        style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"/>
                    </svg>
                    <div class="preset-arc-center">
                      <span class="preset-arc-time">${Yi(s.remaining)}</span>
                    </div>
                  </div>
                  <div class="preset-arc-btns">
                    <button class="timer-ctrl-btn" @click=${()=>this._pauseTimer(s.id)} title="${s.running?c("Pause"):c("Resume")}">
                      <ha-icon icon="${s.running?"mdi:pause":"mdi:play"}"></ha-icon>
                    </button>
                    <button class="timer-ctrl-btn danger" @click=${()=>this._stopTimer(s.id)} title="${c("Stop")}">
                      <ha-icon icon="mdi:stop"></ha-icon>
                    </button>
                  </div>
                </div>
              `})}
          </div>
        `:u`
          <div class="timer-empty">
            <ha-icon icon="mdi:timer-off-outline"></ha-icon>
            <p>${c("No active timers.")}</p>
            <p class="timer-empty-hint">${c("Tap a highlighted time in a recipe's directions to start one.")}</p>
          </div>
        `}

        <!-- Spacer pushes add+presets to bottom -->
        <div style="flex:1"></div>

        <!-- Add timer section -->
        <div class="timer-add-section">
          <div class="timer-add-header">
            <span class="timer-add-title">${c("Add Timer")}</span>
            <label class="timer-global-toggle ${this._globalMode?"active":""}" title="${c("Sync timer across all devices via Home Assistant")}">
              <input type="checkbox" .checked=${this._globalMode}
                @change=${s=>{this._globalMode=s.target.checked}}
              />
              <ha-icon icon="mdi:earth"></ha-icon>
              ${c("Global")}
            </label>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${c("Quick start")}</div>
            <div class="timer-add-row">
              <input type="text" class="timer-input" placeholder="${c("Label (optional)")}"
                .value=${this._quickTimerLabel}
                @input=${s=>{this._quickTimerLabel=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <input type="number" class="timer-input timer-mins-input" placeholder="${c("min")}" min="0.5" step="0.5"
                .value=${this._customTimerInput}
                @input=${s=>{this._customTimerInput=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <button class="action-btn primary" ?disabled=${!e}
                @click=${()=>{this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel=""}}>
                <ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon> ${c("Start")}
              </button>
            </div>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${c("Save preset")}</div>
            <div class="timer-add-row">
              <input type="text" class="timer-input" placeholder="${c("Preset name")}"
                .value=${this._presetNameInput}
                @input=${s=>{this._presetNameInput=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&this._addPresetTimer()}}
              />
              <input type="number" class="timer-input timer-mins-input" placeholder="${c("min")}" min="0.5" step="0.5"
                .value=${this._presetMinsInput}
                @input=${s=>{this._presetMinsInput=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&this._addPresetTimer()}}
              />
              <button class="action-btn" ?disabled=${!i} @click=${this._addPresetTimer}>${c("+ Preset")}</button>
            </div>
          </div>
        </div>

        <!-- Preset timers grid (bottom) -->
        ${this._timerPresets.length?u`
          <div class="timer-presets-grid">
            ${this._timerPresets.map(s=>{let d=this._timers.find(_=>_.presetId===s.id),g=d&&d.running,x=d&&d.alarming,$=d?d.remaining:s.seconds,p=d?d.total:s.seconds,y=x?"var(--error-color, #cf6679)":$<60&&d?"#f59e0b":"var(--rm-accent)",h=x?0:d?a*(1-$/p):a;return u`
                <div class="timer-preset-card ${x?"alarming":""}">
                  <button class="preset-remove" @click=${()=>{d&&this._stopTimer(d.id),this._removePreset(s.id)}} title="${c("Remove")}">
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                  <span class="preset-arc-name">${s.name}</span>
                  <div class="preset-arc-wrap">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="var(--rm-border)" stroke-width="7"/>
                      <circle cx="50" cy="50" r="44" fill="none"
                        stroke="${y}" stroke-width="7" stroke-linecap="round"
                        stroke-dasharray="${a}" stroke-dashoffset="${h}"
                        transform="rotate(-90 50 50)"
                        style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"/>
                    </svg>
                    <div class="preset-arc-center">
                      ${x?u`
                        <span class="preset-arc-time" style="color:var(--error-color,#cf6679)">${c("Done!")}</span>
                      `:u`
                        <span class="preset-arc-time">${Yi($)}</span>
                      `}
                    </div>
                  </div>
                  <div class="preset-arc-btns">
                    ${x?u`
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(d.id,30)}>${c("+30s")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(d.id,60)}>${c("+1m")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(d.id,300)}>${c("+5m")}</button>
                      <button class="preset-arc-btn stop" @click=${()=>this._stopTimer(d.id)}>${c("Stop")}</button>
                    `:g?u`
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(d.id,30)}>${c("+30s")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(d.id,60)}>${c("+1m")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._pauseTimer(d.id)}>
                        <ha-icon icon="mdi:pause" style="--mdc-icon-size:12px;vertical-align:middle"></ha-icon>
                      </button>
                      <button class="preset-arc-btn stop" @click=${()=>this._stopTimer(d.id)}>${c("Stop")}</button>
                    `:d?u`
                      <button class="preset-arc-btn" @click=${()=>this._pauseTimer(d.id)}>${c("Resume")}</button>
                      <button class="preset-arc-btn stop" @click=${()=>this._stopTimer(d.id)}>${c("Stop")}</button>
                    `:u`
                      <button class="preset-arc-btn play" @click=${()=>this._startTimer(s.seconds,s.name,s.id)}>
                        <ha-icon icon="mdi:play" style="--mdc-icon-size:14px;vertical-align:middle"></ha-icon> ${c("Start")}
                      </button>
                    `}
                  </div>
                </div>
              `})}
          </div>
        `:""}
      </div>
    `}_renderTimerAlarm(){let e=this._timerAlarm;return e?u`
      <div class="alarm-overlay">
        <div class="alarm-bubble">
          <ha-icon icon="mdi:alarm" class="alarm-icon"></ha-icon>
          <div class="alarm-label">${e.label}</div>
          <div class="alarm-sub">${c("Timer complete!")}</div>
          <div class="alarm-btns">
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,30)}>${c("+30s")}</button>
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,60)}>${c("+1 min")}</button>
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,300)}>${c("+5 min")}</button>
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,600)}>${c("+10 min")}</button>
            <div class="alarm-custom-row">
              <input type="number" class="alarm-custom-input" placeholder="${c("min")}" min="1"
                .value=${this._alarmAddInput}
                @input=${i=>{this._alarmAddInput=i.target.value}}
                @keydown=${i=>{if(i.key==="Enter"&&this._alarmAddInput){let t=parseInt(this._alarmAddInput);t>0&&this._addTimeToTimer(e.id,t*60),this._alarmAddInput=""}}}
              />
              <button class="alarm-btn accent" ?disabled=${!this._alarmAddInput}
                @click=${()=>{let i=parseInt(this._alarmAddInput);i>0&&this._addTimeToTimer(e.id,i*60),this._alarmAddInput=""}}>${c("+min")}</button>
            </div>
            <button class="alarm-btn stop" @click=${this._dismissAlarm}>${c("Stop")}</button>
          </div>
        </div>
      </div>
    `:""}_renderBottomNav(){if(!this.hass?.user?.is_admin)return u`<nav class="rm-bottom-nav">${[["shopping",c("Shopping List")],["commands",this._settings.language==="de"?"Alle Aktionen":"All actions"],["settings",c("Settings")]].map(([t,r])=>u`<button class="rm-bn-btn ${this._view===t?"active":""}" @click=${()=>{this._view=t}}>${r}</button>`)}</nav>`;let e=this._view,i=(t,r,a,s)=>u`
      <button class="rm-bn-btn ${e===a?"active":""}"
        @click=${s||(()=>{this._navDirection="forward",this._view=a,this._selectedRecipe=null})}
        title="${r}">
        <ha-icon icon="${t}"></ha-icon>
        <span>${r}</span>
      </button>
    `;return u`
      <nav class="rm-bottom-nav">
        ${i("mdi:home",c("Home"),"grid",()=>{this._navDirection="back",this._view="grid",this._selectedRecipe=null})}
        ${i("mdi:cart-outline",c("Shopping"),"shopping")}
        ${i("mdi:heart-pulse",this._settings.language==="de"?"Ern\xE4hrung":"Nutrition","nutrition")}
        <button class="rm-bn-btn rm-bn-add"
          @click=${()=>{this._navDirection="forward",this._view="add"}}
          title="${c("New Recipe")}">
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        ${i("mdi:calendar-week",c("Planner"),"planner",()=>{this._plannerFromRecipe=null,this._navDirection="forward",this._view="planner",this._selectedRecipe=null})}
        <button class="rm-bn-btn ${e==="timers"?"active":""}"
          @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}
          title="${c("Timers")}">
          <ha-icon icon="mdi:timer-outline"></ha-icon>
          <span>${c("Timers")}</span>
          ${this._timers.length?u`<span class="rm-bn-badge">${this._timers.length}</span>`:""}
        </button>
      </nav>
    `}_renderMobileMenu(){return u`
      <div class="rm-mobile-overlay" @click=${()=>{this._mobileMenuOpen=!1}}>
        <nav class="rm-mobile-menu" @click=${e=>e.stopPropagation()}>
          <div class="rm-mm-header">
            <ha-icon icon="mdi:chef-hat" class="rm-mm-logo"></ha-icon>
            <span class="rm-mm-title">${c("Recipes")}</span>
            <button class="icon-btn" @click=${()=>{this._mobileMenuOpen=!1}}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="rm-mm-items">
            <button class="rm-mm-item" @click=${()=>{this._view="settings",this._mobileMenuOpen=!1}}>
              <ha-icon icon="mdi:cog-outline"></ha-icon>
              <span>${c("Settings")}</span>
            </button>
            <button class="rm-mm-item" disabled>
              <ha-icon icon="mdi:help-circle-outline"></ha-icon>
              <span>${c("Help")}</span>
              <span class="rm-mm-soon">${c("Soon")}</span>
            </button>
          </div>
        </nav>
      </div>
    `}render(){let e=this._wide;return u`
      <ha-card class="rm-card ${e?"rm-wide":""}">
        ${e?this._renderSidebar():""}
        <div class="rm-main">
          ${this._renderHeader()}
          <div class="rm-body" data-nav="${this._navDirection}">${this._renderBody()}</div>
          ${e?"":this._renderBottomNav()}
        </div>

        ${!e&&this._mobileMenuOpen?this._renderMobileMenu():""}

        <!-- Timer alarm modal -->
        ${this._timerAlarm?this._renderTimerAlarm():""}
      </ha-card>
    `}static styles=ge`
    :host {
      display: block;
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
      max-height: -webkit-fill-available;
      --rm-bg-main:        #fafbfc;
      --rm-bg-surface:     #ffffff;
      --rm-bg-elevated:    #ffffff;
      --rm-text:           #424242;
      --rm-text-secondary: #757575;
      --rm-text-muted:     #9e9e9e;
      --rm-accent:         #9fa8da;
      --rm-accent-soft:    rgba(159,168,218,0.15);
      --rm-border:         #e8eaf6;
      --rm-shadow:         0 2px 6px rgba(0,0,0,0.08);
      --rm-radius:         12px;
      --rm-radius-sm:      8px;
      --rm-font-size-base: 15px;
      --rm-grid-columns:   repeat(3, minmax(0, 1fr));
      font-size: var(--rm-font-size-base);
    }

    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0;
      margin: 0;
      overflow: hidden;
      position: relative;
      background: var(--rm-bg-surface);
    }
    ha-card.rm-card {
      background: var(--rm-bg-main);
      border-radius: 0;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      height: 100%;
      margin: 0;
      color: var(--rm-text);
      position: relative;
    }

    /* ── Sidebar ─────────────────────────────── */

    .rm-sidebar {
      width: 200px;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      background: var(--rm-bg-surface);
      border-right: 1px solid var(--rm-border);
      overflow: hidden;
      transition: width 0.2s ease, min-width 0.2s ease;
    }

    .rm-sidebar.collapsed {
      width: 56px;
      min-width: 56px;
    }

    ha-card:not(.rm-wide) .rm-sidebar { display: none; }

    .sb-top {
      padding: 12px 8px 8px;
      flex-shrink: 0;
    }

    .sb-logo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2px 8px;
    }

    .sb-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 15px;
      color: var(--rm-accent);
      overflow: hidden;
    }
    .sb-logo ha-icon { --mdc-icon-size: 22px; flex-shrink: 0; }

    .sb-collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }
    .sb-collapse-btn:hover { background: var(--rm-accent-soft); color: var(--rm-text); }
    .sb-collapse-btn ha-icon { --mdc-icon-size: 20px; }

    .sb-search {
      display: flex;
      align-items: center;
      background: var(--rm-bg-main);
      border-radius: 8px;
      padding: 0 8px;
      gap: 6px;
      margin-bottom: 8px;
      border: 1px solid var(--rm-border);
    }
    .sb-search-icon { --mdc-icon-size: 16px; color: var(--rm-text-muted); flex-shrink: 0; }
    .sb-search-input {
      flex: 1; background: none; border: none; outline: none;
      color: var(--rm-text); font-size: 13px; padding: 7px 0;
    }
    .sb-search-input::placeholder { color: var(--rm-text-muted); }
    .sb-search-clear {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-muted); padding: 2px; display: flex; align-items: center;
    }
    .sb-search-clear ha-icon { --mdc-icon-size: 14px; }

    .sb-new-btn {
      display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 8px 10px;
      background: var(--rm-accent); color: #fff;
      border: none; border-radius: 8px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s;
    }
    .sb-new-btn:hover { opacity: 0.88; }
    .sb-new-btn ha-icon { --mdc-icon-size: 18px; }

    .sb-icon-only-btn {
      display: flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; margin: 0 auto;
      background: var(--rm-accent); color: #fff;
      border: none; border-radius: 8px;
      cursor: pointer; transition: opacity 0.15s;
    }
    .sb-icon-only-btn:hover { opacity: 0.88; }
    .sb-icon-only-btn ha-icon { --mdc-icon-size: 20px; }

    .sb-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 6px 4px;
      scrollbar-width: none;
    }
    .sb-nav::-webkit-scrollbar { display: none; }

    .sb-bottom {
      padding: 4px 6px 12px;
      border-top: 1px solid var(--rm-border);
    }

    .sb-item {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 9px 10px;
      background: none; border: none; border-radius: 8px;
      font-size: 14px; color: var(--rm-text-secondary);
      cursor: pointer; text-align: left;
      transition: background 0.12s, color 0.12s;
      position: relative;
    }
    .rm-sidebar.collapsed .sb-item {
      justify-content: center;
      padding: 10px 6px;
    }
    .sb-item ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
    .sb-item:hover:not(:disabled) { background: var(--rm-accent-soft); color: var(--rm-text); }
    .sb-item.active { background: var(--rm-accent-soft); color: var(--rm-accent); font-weight: 600; }
    .sb-item.placeholder { opacity: 0.4; cursor: default; }

    .sb-timer-badge {
      margin-left: auto;
      background: var(--rm-accent);
      color: #fff;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
    }
    .rm-sidebar.collapsed .sb-timer-badge {
      position: absolute;
      top: 4px; right: 4px;
      margin-left: 0;
      font-size: 9px;
      padding: 1px 4px;
    }

    /* ── Main content ────────────────────────── */

    .rm-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .rm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-bottom: 1px solid var(--rm-border);
      background: var(--rm-bg-surface);
      flex-shrink: 0;
      gap: 8px;
    }

    .rm-header-left, .rm-header-right {
      display: flex; align-items: center; gap: 6px;
      min-width: 0;
    }
    .rm-header-left { flex: 1; min-width: 0; }
    .rm-header-right { flex-shrink: 0; }

    .rm-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 17px; font-weight: 600; color: var(--rm-text);
      overflow: hidden; white-space: nowrap; flex: 1; min-width: 0;
    }
    .rm-title ha-icon { --mdc-icon-size: 22px; color: var(--rm-accent); flex-shrink: 0; }
    .rm-title span { overflow: hidden; text-overflow: ellipsis; }

    /* Star rating in header */
    .header-stars {
      display: flex;
      gap: 1px;
      align-items: center;
    }
    .hdr-star {
      font-size: 18px;
      color: var(--rm-border, rgba(0,0,0,0.2));
      line-height: 1;
      cursor: pointer;
      transition: color 0.1s, transform 0.1s;
      -webkit-text-stroke: 1px rgba(200,150,0,0.3);
    }
    .hdr-star:hover { transform: scale(1.2); color: #f5a623; }
    .hdr-star.filled { color: #f5a623; -webkit-text-stroke: 1px #c47f0a; }

    /* Timer pills */
    .timer-pills {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 2px;
    }
    .timer-pill {
      display: flex;
      align-items: center;
      gap: 3px;
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-radius: 10px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }
    .timer-pill.paused { opacity: 0.6; }
    .timer-pill ha-icon { --mdc-icon-size: 12px; }
    .timer-more {
      font-size: 11px;
      color: var(--rm-text-secondary);
      padding: 0 4px;
    }

    .rm-body {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .icon-btn {
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-secondary); width: 34px; height: 34px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s; padding: 0; flex-shrink: 0;
    }
    .icon-btn:hover { background: var(--rm-border); color: var(--rm-text); }
    .icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .icon-btn:disabled:hover { background: none; }
    .wake-toggle-btn.active { background: var(--rm-accent-soft); color: var(--rm-accent); }

    .text-btn {
      background: var(--rm-accent); color: #fff; border: none;
      border-radius: var(--rm-radius-sm); padding: 8px 16px;
      cursor: pointer; font-size: 14px; font-weight: 500;
    }

    .rm-loading {
      display: flex; justify-content: center; align-items: center; height: 200px;
    }

    .rm-error {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 40px 20px; gap: 12px;
      color: var(--rm-text-secondary); text-align: center;
    }
    .rm-error ha-icon { --mdc-icon-size: 48px; color: var(--error-color, #cf6679); }
    .rm-error p { margin: 0; font-size: 14px; }

    /* ── Timers view ─────────────────────────── */

    .timers-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      padding: 12px 16px 16px;
      gap: 12px;
    }

    .timer-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px 0 24px;
      color: var(--rm-text-secondary);
      text-align: center;
      font-size: 14px;
    }
    .timer-empty ha-icon { --mdc-icon-size: 48px; opacity: 0.35; }
    .timer-empty p { margin: 0; }
    .timer-empty-hint { font-size: 12px !important; color: var(--rm-text-muted) !important; }

    /* Active timer list: horizontal wrap of square arc tiles */
    .timer-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-card {
      position: relative;
      width: 180px; height: 180px;
      background: var(--rm-bg-elevated);
      border-radius: 16px;
      border: 1px solid var(--rm-border);
      padding: 10px 8px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-sizing: border-box;
    }
    .timer-card-name {
      font-size: 11px; font-weight: 600; color: var(--rm-text);
      text-align: center; width: 100%;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .timer-ctrl-btn {
      background: none;
      border: 1px solid var(--rm-border);
      border-radius: 50%;
      width: 28px; height: 28px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--rm-text-secondary);
      padding: 0; transition: background 0.15s, color 0.15s;
    }
    .timer-ctrl-btn ha-icon { --mdc-icon-size: 14px; }
    .timer-ctrl-btn:hover { background: var(--rm-accent-soft); color: var(--rm-accent); }
    .timer-ctrl-btn.danger:hover { background: rgba(207,102,121,0.12); color: var(--error-color, #cf6679); border-color: var(--error-color, #cf6679); }

    /* Preset timer grid: square arc tiles */
    .timer-presets-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-preset-card {
      position: relative;
      width: 160px; height: 160px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 16px;
      padding: 8px 8px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-sizing: border-box;
    }
    .timer-preset-card.alarming {
      border-color: var(--error-color, #cf6679);
      animation: alarm-pulse-border 0.8s ease-in-out infinite alternate;
    }
    @keyframes alarm-pulse-border {
      from { box-shadow: 0 0 0 0 rgba(207,102,121,0); }
      to   { box-shadow: 0 0 0 6px rgba(207,102,121,0.3); }
    }
    /* Arc wrap fills available vertical space in the square tile */
    .preset-arc-wrap {
      position: relative;
      flex: 1;
      width: 100%;
      min-height: 0;
    }
    .preset-arc-wrap svg {
      width: 100%; height: 100%;
      display: block;
    }
    .preset-arc-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .preset-arc-time {
      font-size: 17px; font-weight: 700;
      color: var(--rm-text); line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .preset-arc-name {
      font-size: 11px; font-weight: 600; color: var(--rm-text);
      text-align: center; width: 100%;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .preset-arc-btns {
      display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;
    }
    .preset-arc-btn {
      background: var(--rm-bg); border: 1px solid var(--rm-border);
      border-radius: 10px; padding: 2px 6px; font-size: 10px;
      color: var(--rm-text-secondary); cursor: pointer; transition: all 0.15s;
    }
    .preset-arc-btn:hover { background: var(--rm-accent-soft); color: var(--rm-accent); border-color: var(--rm-accent); }
    .preset-arc-btn.stop { color: var(--error-color, #cf6679); border-color: var(--error-color, #cf6679); }
    .preset-arc-btn.stop:hover { background: rgba(207,102,121,0.12); }
    .preset-arc-btn.play {
      background: var(--rm-accent); color: #fff; border-color: var(--rm-accent);
      padding: 3px 12px; font-size: 11px; border-radius: 12px;
    }
    .preset-arc-btn.play:hover { opacity: 0.85; }
    .preset-remove {
      position: absolute; top: 4px; right: 4px;
      background: none; border: none; cursor: pointer;
      color: var(--rm-text-muted); opacity: 0; padding: 2px;
      border-radius: 50%; transition: opacity 0.15s; z-index: 1;
    }
    .timer-preset-card:hover .preset-remove,
    .timer-card:hover .preset-remove { opacity: 1; }
    .preset-remove ha-icon { --mdc-icon-size: 13px; }

    /* Timer add section */
    .timer-add-section {
      border-top: 1px solid var(--rm-border);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .timer-add-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .timer-add-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--rm-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .timer-global-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--rm-border);
      cursor: pointer;
      font-size: 12px;
      color: var(--rm-text-muted);
      transition: all 0.15s;
      user-select: none;
    }
    .timer-global-toggle input { display: none; }
    .timer-global-toggle ha-icon { --mdc-icon-size: 14px; }
    .timer-global-toggle.active {
      border-color: var(--rm-accent);
      color: var(--rm-accent);
      background: var(--rm-accent-soft);
    }
    .timer-add-group { display: flex; flex-direction: column; gap: 5px; }
    .timer-add-group-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--rm-text-muted);
      opacity: 0.7;
    }
    .timer-add-row { display: flex; gap: 6px; align-items: center; }
    .timer-input {
      flex: 1;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 6px 9px;
      font-size: 13px;
      font-family: inherit;
      min-width: 0;
    }
    .timer-mins-input { max-width: 72px; flex: 0 0 72px; }
    .timer-input:focus { outline: none; border-color: var(--rm-accent); }
    .timer-global-badge {
      position: absolute;
      top: 4px;
      right: 22px;
      --mdc-icon-size: 11px;
      color: var(--rm-accent);
      opacity: 0.75;
    }

    .action-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 8px 14px;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .action-btn.primary {
      background: var(--rm-accent);
      border-color: var(--rm-accent);
      color: #fff;
    }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Timer alarm bubble ──────────────────── */

    .alarm-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alarm-bubble {
      background: var(--rm-bg-surface);
      border-radius: 20px;
      padding: 28px 24px;
      text-align: center;
      max-width: 300px;
      width: calc(100% - 48px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .alarm-icon {
      --mdc-icon-size: 52px;
      color: var(--rm-accent);
      animation: alarm-pulse 0.8s ease-in-out infinite alternate;
    }

    @keyframes alarm-pulse {
      from { transform: scale(1); opacity: 1; }
      to   { transform: scale(1.15); opacity: 0.8; }
    }

    .alarm-label {
      font-size: 18px;
      font-weight: 700;
      color: var(--rm-text);
    }

    .alarm-sub {
      font-size: 13px;
      color: var(--rm-text-secondary);
      margin-bottom: 8px;
    }

    .alarm-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }

    .alarm-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      color: var(--rm-text);
      padding: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.15s;
    }
    .alarm-btn:hover { background: var(--rm-accent-soft); }
    .alarm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .alarm-btn.accent { background: var(--rm-accent); color: #fff; border-color: var(--rm-accent); }
    .alarm-btn.stop {
      background: var(--error-color, #cf6679);
      color: #fff;
      border-color: var(--error-color, #cf6679);
      grid-column: 1 / -1;
    }
    .alarm-btn.stop:hover { opacity: 0.85; }
    .alarm-custom-row {
      display: flex; gap: 6px; grid-column: 1 / -1;
    }
    .alarm-custom-input {
      flex: 1; background: var(--rm-bg-elevated); border: 1px solid var(--rm-border);
      border-radius: 8px; color: var(--rm-text); padding: 8px 10px;
      font-size: 13px; font-family: inherit;
    }
    .alarm-custom-input:focus { outline: none; border-color: var(--rm-accent); }

    /* ── View transitions ───────────────────────────────────── */

    /* Generic directional slide for full-screen views (settings, add, planner, etc.) */
    @keyframes rm-slide-forward {
      from { opacity: 0; transform: translateX(48px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes rm-slide-back {
      from { opacity: 0; transform: translateX(-48px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .rm-body[data-nav="forward"] > *:not(.rm-detail-overlay) { animation: rm-slide-forward 0.25s cubic-bezier(0.25,0.46,0.45,0.94); }
    .rm-body[data-nav="back"]    > *:not(.rm-detail-overlay) { animation: rm-slide-back    0.25s cubic-bezier(0.25,0.46,0.45,0.94); }

    /* Recipe detail — sliding track (grid left pane, detail right pane) */
    .rm-slide-track {
      display: flex;
      flex-direction: row;
      width: 200%;
      height: 100%;
      transform: translateX(0);
      transition: transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
    }
    .rm-slide-track.show-detail {
      transform: translateX(-50%);
    }
    .rm-slide-pane {
      flex: 0 0 50%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .rm-slide-pane > * {
      flex: 1;
      min-height: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
    }

    /* ── Mobile bottom nav ───────────────── */

    .rm-bottom-nav {
      display: flex;
      justify-content: space-around;
      background: var(--rm-bg-surface);
      border-top: 1px solid var(--rm-border);
      padding: 6px 0;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
      z-index: 10;
      flex-shrink: 0;
    }

    .rm-bn-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      font-size: 10px;
      font-weight: 500;
      padding: 6px 4px;
      position: relative;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
      outline: none;
    }
    .rm-bn-btn ha-icon { --mdc-icon-size: 22px; }
    .rm-bn-btn.active { color: var(--rm-accent); }
    .rm-bn-btn:not(.rm-bn-add):hover { color: var(--rm-text); }

    .rm-bn-add {
      background: var(--rm-accent);
      color: white !important;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      flex: none;
      align-self: center;
      margin: 0 8px;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .rm-bn-add ha-icon { --mdc-icon-size: 26px; }

    .rm-bn-badge {
      position: absolute;
      top: 2px;
      right: calc(50% - 20px);
      background: var(--rm-accent);
      color: #fff;
      border-radius: 8px;
      font-size: 9px;
      font-weight: 700;
      padding: 1px 4px;
      min-width: 14px;
      text-align: center;
    }

    /* ── Mobile slide-in menu ────────────── */

    .rm-mobile-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 100;
      display: flex;
      justify-content: flex-end;
    }

    .rm-mobile-menu {
      width: min(280px, 80%);
      height: 100%;
      background: var(--rm-bg-surface);
      border-left: 1px solid var(--rm-border);
      display: flex;
      flex-direction: column;
      animation: rm-menu-slide-in 0.22s ease;
      overflow: hidden;
    }

    @keyframes rm-menu-slide-in {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    .rm-mm-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 12px 14px 16px;
      border-bottom: 1px solid var(--rm-border);
      flex-shrink: 0;
    }
    .rm-mm-logo { color: var(--rm-accent); --mdc-icon-size: 22px; }
    .rm-mm-title { flex: 1; font-weight: 700; font-size: 15px; color: var(--rm-text); }

    .rm-mm-items { padding: 8px 0; flex: 1; overflow-y: auto; }

    .rm-mm-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary);
      font-size: 14px;
      text-align: left;
      transition: background 0.12s, color 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .rm-mm-item ha-icon { --mdc-icon-size: 20px; flex-shrink: 0; }
    .rm-mm-item:hover:not(:disabled) { background: var(--rm-accent-soft); color: var(--rm-text); }
    .rm-mm-item:disabled { opacity: 0.4; cursor: default; }

    .rm-mm-soon {
      margin-left: auto;
      font-size: 10px;
      font-weight: 700;
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-radius: 6px;
      padding: 2px 6px;
    }

  `};try{customElements.define("mm-unified-app",er)}catch{}export{er as UnifiedApp};
