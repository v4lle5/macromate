import{a as ze,b as Et,c as Dt,d as pe,e as h,f as ye,g as he,h as te,i as o,j as st}from"./chunks/chunk-VYGSGG2W.js";var St=Et(($t,Ke)=>{(function(u){typeof $t=="object"&&typeof Ke<"u"?Ke.exports=u():typeof define=="function"&&define.amd?define([],u):(typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:this).JSZip=u()})(function(){return(function u(e,i,t){function r(c,_){if(!i[c]){if(!e[c]){var w=typeof ze=="function"&&ze;if(!_&&w)return w(c,!0);if(a)return a(c,!0);var y=new Error("Cannot find module '"+c+"'");throw y.code="MODULE_NOT_FOUND",y}var p=i[c]={exports:{}};e[c][0].call(p.exports,function(b){var d=e[c][1][b];return r(d||b)},p,p.exports,u,e,i,t)}return i[c].exports}for(var a=typeof ze=="function"&&ze,s=0;s<t.length;s++)r(t[s]);return r})({1:[function(u,e,i){"use strict";var t=u("./utils"),r=u("./support"),a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";i.encode=function(s){for(var c,_,w,y,p,b,d,g=[],m=0,x=s.length,$=x,T=t.getTypeOf(s)!=="string";m<s.length;)$=x-m,w=T?(c=s[m++],_=m<x?s[m++]:0,m<x?s[m++]:0):(c=s.charCodeAt(m++),_=m<x?s.charCodeAt(m++):0,m<x?s.charCodeAt(m++):0),y=c>>2,p=(3&c)<<4|_>>4,b=1<$?(15&_)<<2|w>>6:64,d=2<$?63&w:64,g.push(a.charAt(y)+a.charAt(p)+a.charAt(b)+a.charAt(d));return g.join("")},i.decode=function(s){var c,_,w,y,p,b,d=0,g=0,m="data:";if(s.substr(0,m.length)===m)throw new Error("Invalid base64 input, it looks like a data url.");var x,$=3*(s=s.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(s.charAt(s.length-1)===a.charAt(64)&&$--,s.charAt(s.length-2)===a.charAt(64)&&$--,$%1!=0)throw new Error("Invalid base64 input, bad content length.");for(x=r.uint8array?new Uint8Array(0|$):new Array(0|$);d<s.length;)c=a.indexOf(s.charAt(d++))<<2|(y=a.indexOf(s.charAt(d++)))>>4,_=(15&y)<<4|(p=a.indexOf(s.charAt(d++)))>>2,w=(3&p)<<6|(b=a.indexOf(s.charAt(d++))),x[g++]=c,p!==64&&(x[g++]=_),b!==64&&(x[g++]=w);return x}},{"./support":30,"./utils":32}],2:[function(u,e,i){"use strict";var t=u("./external"),r=u("./stream/DataWorker"),a=u("./stream/Crc32Probe"),s=u("./stream/DataLengthProbe");function c(_,w,y,p,b){this.compressedSize=_,this.uncompressedSize=w,this.crc32=y,this.compression=p,this.compressedContent=b}c.prototype={getContentWorker:function(){var _=new r(t.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new s("data_length")),w=this;return _.on("end",function(){if(this.streamInfo.data_length!==w.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),_},getCompressedWorker:function(){return new r(t.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},c.createWorkerFrom=function(_,w,y){return _.pipe(new a).pipe(new s("uncompressedSize")).pipe(w.compressWorker(y)).pipe(new s("compressedSize")).withStreamInfo("compression",w)},e.exports=c},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(u,e,i){"use strict";var t=u("./stream/GenericWorker");i.STORE={magic:"\0\0",compressWorker:function(){return new t("STORE compression")},uncompressWorker:function(){return new t("STORE decompression")}},i.DEFLATE=u("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(u,e,i){"use strict";var t=u("./utils"),r=(function(){for(var a,s=[],c=0;c<256;c++){a=c;for(var _=0;_<8;_++)a=1&a?3988292384^a>>>1:a>>>1;s[c]=a}return s})();e.exports=function(a,s){return a!==void 0&&a.length?t.getTypeOf(a)!=="string"?(function(c,_,w,y){var p=r,b=y+w;c^=-1;for(var d=y;d<b;d++)c=c>>>8^p[255&(c^_[d])];return-1^c})(0|s,a,a.length,0):(function(c,_,w,y){var p=r,b=y+w;c^=-1;for(var d=y;d<b;d++)c=c>>>8^p[255&(c^_.charCodeAt(d))];return-1^c})(0|s,a,a.length,0):0}},{"./utils":32}],5:[function(u,e,i){"use strict";i.base64=!1,i.binary=!1,i.dir=!1,i.createFolders=!0,i.date=null,i.compression=null,i.compressionOptions=null,i.comment=null,i.unixPermissions=null,i.dosPermissions=null},{}],6:[function(u,e,i){"use strict";var t=null;t=typeof Promise<"u"?Promise:u("lie"),e.exports={Promise:t}},{lie:37}],7:[function(u,e,i){"use strict";var t=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",r=u("pako"),a=u("./utils"),s=u("./stream/GenericWorker"),c=t?"uint8array":"array";function _(w,y){s.call(this,"FlateWorker/"+w),this._pako=null,this._pakoAction=w,this._pakoOptions=y,this.meta={}}i.magic="\b\0",a.inherits(_,s),_.prototype.processChunk=function(w){this.meta=w.meta,this._pako===null&&this._createPako(),this._pako.push(a.transformTo(c,w.data),!1)},_.prototype.flush=function(){s.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},_.prototype.cleanUp=function(){s.prototype.cleanUp.call(this),this._pako=null},_.prototype._createPako=function(){this._pako=new r[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var w=this;this._pako.onData=function(y){w.push({data:y,meta:w.meta})}},i.compressWorker=function(w){return new _("Deflate",w)},i.uncompressWorker=function(){return new _("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(u,e,i){"use strict";function t(p,b){var d,g="";for(d=0;d<b;d++)g+=String.fromCharCode(255&p),p>>>=8;return g}function r(p,b,d,g,m,x){var $,T,z=p.file,M=p.compression,F=x!==c.utf8encode,j=a.transformTo("string",x(z.name)),D=a.transformTo("string",c.utf8encode(z.name)),W=z.comment,K=a.transformTo("string",x(W)),k=a.transformTo("string",c.utf8encode(W)),O=D.length!==z.name.length,l=k.length!==W.length,A="",X="",B="",ee=z.dir,U=z.date,J={crc32:0,compressedSize:0,uncompressedSize:0};b&&!d||(J.crc32=p.crc32,J.compressedSize=p.compressedSize,J.uncompressedSize=p.uncompressedSize);var R=0;b&&(R|=8),F||!O&&!l||(R|=2048);var I=0,Y=0;ee&&(I|=16),m==="UNIX"?(Y=798,I|=(function(G,se){var de=G;return G||(de=se?16893:33204),(65535&de)<<16})(z.unixPermissions,ee)):(Y=20,I|=(function(G){return 63&(G||0)})(z.dosPermissions)),$=U.getUTCHours(),$<<=6,$|=U.getUTCMinutes(),$<<=5,$|=U.getUTCSeconds()/2,T=U.getUTCFullYear()-1980,T<<=4,T|=U.getUTCMonth()+1,T<<=5,T|=U.getUTCDate(),O&&(X=t(1,1)+t(_(j),4)+D,A+="up"+t(X.length,2)+X),l&&(B=t(1,1)+t(_(K),4)+k,A+="uc"+t(B.length,2)+B);var H="";return H+=`
\0`,H+=t(R,2),H+=M.magic,H+=t($,2),H+=t(T,2),H+=t(J.crc32,4),H+=t(J.compressedSize,4),H+=t(J.uncompressedSize,4),H+=t(j.length,2),H+=t(A.length,2),{fileRecord:w.LOCAL_FILE_HEADER+H+j+A,dirRecord:w.CENTRAL_FILE_HEADER+t(Y,2)+H+t(K.length,2)+"\0\0\0\0"+t(I,4)+t(g,4)+j+A+K}}var a=u("../utils"),s=u("../stream/GenericWorker"),c=u("../utf8"),_=u("../crc32"),w=u("../signature");function y(p,b,d,g){s.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=b,this.zipPlatform=d,this.encodeFileName=g,this.streamFiles=p,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}a.inherits(y,s),y.prototype.push=function(p){var b=p.meta.percent||0,d=this.entriesCount,g=this._sources.length;this.accumulate?this.contentBuffer.push(p):(this.bytesWritten+=p.data.length,s.prototype.push.call(this,{data:p.data,meta:{currentFile:this.currentFile,percent:d?(b+100*(d-g-1))/d:100}}))},y.prototype.openedSource=function(p){this.currentSourceOffset=this.bytesWritten,this.currentFile=p.file.name;var b=this.streamFiles&&!p.file.dir;if(b){var d=r(p,b,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:d.fileRecord,meta:{percent:0}})}else this.accumulate=!0},y.prototype.closedSource=function(p){this.accumulate=!1;var b=this.streamFiles&&!p.file.dir,d=r(p,b,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(d.dirRecord),b)this.push({data:(function(g){return w.DATA_DESCRIPTOR+t(g.crc32,4)+t(g.compressedSize,4)+t(g.uncompressedSize,4)})(p),meta:{percent:100}});else for(this.push({data:d.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},y.prototype.flush=function(){for(var p=this.bytesWritten,b=0;b<this.dirRecords.length;b++)this.push({data:this.dirRecords[b],meta:{percent:100}});var d=this.bytesWritten-p,g=(function(m,x,$,T,z){var M=a.transformTo("string",z(T));return w.CENTRAL_DIRECTORY_END+"\0\0\0\0"+t(m,2)+t(m,2)+t(x,4)+t($,4)+t(M.length,2)+M})(this.dirRecords.length,d,p,this.zipComment,this.encodeFileName);this.push({data:g,meta:{percent:100}})},y.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},y.prototype.registerPrevious=function(p){this._sources.push(p);var b=this;return p.on("data",function(d){b.processChunk(d)}),p.on("end",function(){b.closedSource(b.previous.streamInfo),b._sources.length?b.prepareNextSource():b.end()}),p.on("error",function(d){b.error(d)}),this},y.prototype.resume=function(){return!!s.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},y.prototype.error=function(p){var b=this._sources;if(!s.prototype.error.call(this,p))return!1;for(var d=0;d<b.length;d++)try{b[d].error(p)}catch{}return!0},y.prototype.lock=function(){s.prototype.lock.call(this);for(var p=this._sources,b=0;b<p.length;b++)p[b].lock()},e.exports=y},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(u,e,i){"use strict";var t=u("../compressions"),r=u("./ZipFileWorker");i.generateWorker=function(a,s,c){var _=new r(s.streamFiles,c,s.platform,s.encodeFileName),w=0;try{a.forEach(function(y,p){w++;var b=(function(x,$){var T=x||$,z=t[T];if(!z)throw new Error(T+" is not a valid compression method !");return z})(p.options.compression,s.compression),d=p.options.compressionOptions||s.compressionOptions||{},g=p.dir,m=p.date;p._compressWorker(b,d).withStreamInfo("file",{name:y,dir:g,date:m,comment:p.comment||"",unixPermissions:p.unixPermissions,dosPermissions:p.dosPermissions}).pipe(_)}),_.entriesCount=w}catch(y){_.error(y)}return _}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(u,e,i){"use strict";function t(){if(!(this instanceof t))return new t;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var r=new t;for(var a in this)typeof this[a]!="function"&&(r[a]=this[a]);return r}}(t.prototype=u("./object")).loadAsync=u("./load"),t.support=u("./support"),t.defaults=u("./defaults"),t.version="3.10.1",t.loadAsync=function(r,a){return new t().loadAsync(r,a)},t.external=u("./external"),e.exports=t},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(u,e,i){"use strict";var t=u("./utils"),r=u("./external"),a=u("./utf8"),s=u("./zipEntries"),c=u("./stream/Crc32Probe"),_=u("./nodejsUtils");function w(y){return new r.Promise(function(p,b){var d=y.decompressed.getContentWorker().pipe(new c);d.on("error",function(g){b(g)}).on("end",function(){d.streamInfo.crc32!==y.decompressed.crc32?b(new Error("Corrupted zip : CRC32 mismatch")):p()}).resume()})}e.exports=function(y,p){var b=this;return p=t.extend(p||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:a.utf8decode}),_.isNode&&_.isStream(y)?r.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):t.prepareContent("the loaded zip file",y,!0,p.optimizedBinaryString,p.base64).then(function(d){var g=new s(p);return g.load(d),g}).then(function(d){var g=[r.Promise.resolve(d)],m=d.files;if(p.checkCRC32)for(var x=0;x<m.length;x++)g.push(w(m[x]));return r.Promise.all(g)}).then(function(d){for(var g=d.shift(),m=g.files,x=0;x<m.length;x++){var $=m[x],T=$.fileNameStr,z=t.resolve($.fileNameStr);b.file(z,$.decompressed,{binary:!0,optimizedBinaryString:!0,date:$.date,dir:$.dir,comment:$.fileCommentStr.length?$.fileCommentStr:null,unixPermissions:$.unixPermissions,dosPermissions:$.dosPermissions,createFolders:p.createFolders}),$.dir||(b.file(z).unsafeOriginalName=T)}return g.zipComment.length&&(b.comment=g.zipComment),b})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(u,e,i){"use strict";var t=u("../utils"),r=u("../stream/GenericWorker");function a(s,c){r.call(this,"Nodejs stream input adapter for "+s),this._upstreamEnded=!1,this._bindStream(c)}t.inherits(a,r),a.prototype._bindStream=function(s){var c=this;(this._stream=s).pause(),s.on("data",function(_){c.push({data:_,meta:{percent:0}})}).on("error",function(_){c.isPaused?this.generatedError=_:c.error(_)}).on("end",function(){c.isPaused?c._upstreamEnded=!0:c.end()})},a.prototype.pause=function(){return!!r.prototype.pause.call(this)&&(this._stream.pause(),!0)},a.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},e.exports=a},{"../stream/GenericWorker":28,"../utils":32}],13:[function(u,e,i){"use strict";var t=u("readable-stream").Readable;function r(a,s,c){t.call(this,s),this._helper=a;var _=this;a.on("data",function(w,y){_.push(w)||_._helper.pause(),c&&c(y)}).on("error",function(w){_.emit("error",w)}).on("end",function(){_.push(null)})}u("../utils").inherits(r,t),r.prototype._read=function(){this._helper.resume()},e.exports=r},{"../utils":32,"readable-stream":16}],14:[function(u,e,i){"use strict";e.exports={isNode:typeof Buffer<"u",newBufferFrom:function(t,r){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(t,r);if(typeof t=="number")throw new Error('The "data" argument must not be a number');return new Buffer(t,r)},allocBuffer:function(t){if(Buffer.alloc)return Buffer.alloc(t);var r=new Buffer(t);return r.fill(0),r},isBuffer:function(t){return Buffer.isBuffer(t)},isStream:function(t){return t&&typeof t.on=="function"&&typeof t.pause=="function"&&typeof t.resume=="function"}}},{}],15:[function(u,e,i){"use strict";function t(z,M,F){var j,D=a.getTypeOf(M),W=a.extend(F||{},_);W.date=W.date||new Date,W.compression!==null&&(W.compression=W.compression.toUpperCase()),typeof W.unixPermissions=="string"&&(W.unixPermissions=parseInt(W.unixPermissions,8)),W.unixPermissions&&16384&W.unixPermissions&&(W.dir=!0),W.dosPermissions&&16&W.dosPermissions&&(W.dir=!0),W.dir&&(z=m(z)),W.createFolders&&(j=g(z))&&x.call(this,j,!0);var K=D==="string"&&W.binary===!1&&W.base64===!1;F&&F.binary!==void 0||(W.binary=!K),(M instanceof w&&M.uncompressedSize===0||W.dir||!M||M.length===0)&&(W.base64=!1,W.binary=!0,M="",W.compression="STORE",D="string");var k=null;k=M instanceof w||M instanceof s?M:b.isNode&&b.isStream(M)?new d(z,M):a.prepareContent(z,M,W.binary,W.optimizedBinaryString,W.base64);var O=new y(z,k,W);this.files[z]=O}var r=u("./utf8"),a=u("./utils"),s=u("./stream/GenericWorker"),c=u("./stream/StreamHelper"),_=u("./defaults"),w=u("./compressedObject"),y=u("./zipObject"),p=u("./generate"),b=u("./nodejsUtils"),d=u("./nodejs/NodejsStreamInputAdapter"),g=function(z){z.slice(-1)==="/"&&(z=z.substring(0,z.length-1));var M=z.lastIndexOf("/");return 0<M?z.substring(0,M):""},m=function(z){return z.slice(-1)!=="/"&&(z+="/"),z},x=function(z,M){return M=M!==void 0?M:_.createFolders,z=m(z),this.files[z]||t.call(this,z,null,{dir:!0,createFolders:M}),this.files[z]};function $(z){return Object.prototype.toString.call(z)==="[object RegExp]"}var T={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(z){var M,F,j;for(M in this.files)j=this.files[M],(F=M.slice(this.root.length,M.length))&&M.slice(0,this.root.length)===this.root&&z(F,j)},filter:function(z){var M=[];return this.forEach(function(F,j){z(F,j)&&M.push(j)}),M},file:function(z,M,F){if(arguments.length!==1)return z=this.root+z,t.call(this,z,M,F),this;if($(z)){var j=z;return this.filter(function(W,K){return!K.dir&&j.test(W)})}var D=this.files[this.root+z];return D&&!D.dir?D:null},folder:function(z){if(!z)return this;if($(z))return this.filter(function(D,W){return W.dir&&z.test(D)});var M=this.root+z,F=x.call(this,M),j=this.clone();return j.root=F.name,j},remove:function(z){z=this.root+z;var M=this.files[z];if(M||(z.slice(-1)!=="/"&&(z+="/"),M=this.files[z]),M&&!M.dir)delete this.files[z];else for(var F=this.filter(function(D,W){return W.name.slice(0,z.length)===z}),j=0;j<F.length;j++)delete this.files[F[j].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(z){var M,F={};try{if((F=a.extend(z||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:r.utf8encode})).type=F.type.toLowerCase(),F.compression=F.compression.toUpperCase(),F.type==="binarystring"&&(F.type="string"),!F.type)throw new Error("No output type specified.");a.checkSupport(F.type),F.platform!=="darwin"&&F.platform!=="freebsd"&&F.platform!=="linux"&&F.platform!=="sunos"||(F.platform="UNIX"),F.platform==="win32"&&(F.platform="DOS");var j=F.comment||this.comment||"";M=p.generateWorker(this,F,j)}catch(D){(M=new s("error")).error(D)}return new c(M,F.type||"string",F.mimeType)},generateAsync:function(z,M){return this.generateInternalStream(z).accumulate(M)},generateNodeStream:function(z,M){return(z=z||{}).type||(z.type="nodebuffer"),this.generateInternalStream(z).toNodejsStream(M)}};e.exports=T},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(u,e,i){"use strict";e.exports=u("stream")},{stream:void 0}],17:[function(u,e,i){"use strict";var t=u("./DataReader");function r(a){t.call(this,a);for(var s=0;s<this.data.length;s++)a[s]=255&a[s]}u("../utils").inherits(r,t),r.prototype.byteAt=function(a){return this.data[this.zero+a]},r.prototype.lastIndexOfSignature=function(a){for(var s=a.charCodeAt(0),c=a.charCodeAt(1),_=a.charCodeAt(2),w=a.charCodeAt(3),y=this.length-4;0<=y;--y)if(this.data[y]===s&&this.data[y+1]===c&&this.data[y+2]===_&&this.data[y+3]===w)return y-this.zero;return-1},r.prototype.readAndCheckSignature=function(a){var s=a.charCodeAt(0),c=a.charCodeAt(1),_=a.charCodeAt(2),w=a.charCodeAt(3),y=this.readData(4);return s===y[0]&&c===y[1]&&_===y[2]&&w===y[3]},r.prototype.readData=function(a){if(this.checkOffset(a),a===0)return[];var s=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./DataReader":18}],18:[function(u,e,i){"use strict";var t=u("../utils");function r(a){this.data=a,this.length=a.length,this.index=0,this.zero=0}r.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<this.zero+a||a<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var s,c=0;for(this.checkOffset(a),s=this.index+a-1;s>=this.index;s--)c=(c<<8)+this.byteAt(s);return this.index+=a,c},readString:function(a){return t.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date(Date.UTC(1980+(a>>25&127),(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1))}},e.exports=r},{"../utils":32}],19:[function(u,e,i){"use strict";var t=u("./Uint8ArrayReader");function r(a){t.call(this,a)}u("../utils").inherits(r,t),r.prototype.readData=function(a){this.checkOffset(a);var s=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(u,e,i){"use strict";var t=u("./DataReader");function r(a){t.call(this,a)}u("../utils").inherits(r,t),r.prototype.byteAt=function(a){return this.data.charCodeAt(this.zero+a)},r.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)-this.zero},r.prototype.readAndCheckSignature=function(a){return a===this.readData(4)},r.prototype.readData=function(a){this.checkOffset(a);var s=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./DataReader":18}],21:[function(u,e,i){"use strict";var t=u("./ArrayReader");function r(a){t.call(this,a)}u("../utils").inherits(r,t),r.prototype.readData=function(a){if(this.checkOffset(a),a===0)return new Uint8Array(0);var s=this.data.subarray(this.zero+this.index,this.zero+this.index+a);return this.index+=a,s},e.exports=r},{"../utils":32,"./ArrayReader":17}],22:[function(u,e,i){"use strict";var t=u("../utils"),r=u("../support"),a=u("./ArrayReader"),s=u("./StringReader"),c=u("./NodeBufferReader"),_=u("./Uint8ArrayReader");e.exports=function(w){var y=t.getTypeOf(w);return t.checkSupport(y),y!=="string"||r.uint8array?y==="nodebuffer"?new c(w):r.uint8array?new _(t.transformTo("uint8array",w)):new a(t.transformTo("array",w)):new s(w)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(u,e,i){"use strict";i.LOCAL_FILE_HEADER="PK",i.CENTRAL_FILE_HEADER="PK",i.CENTRAL_DIRECTORY_END="PK",i.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",i.ZIP64_CENTRAL_DIRECTORY_END="PK",i.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(u,e,i){"use strict";var t=u("./GenericWorker"),r=u("../utils");function a(s){t.call(this,"ConvertWorker to "+s),this.destType=s}r.inherits(a,t),a.prototype.processChunk=function(s){this.push({data:r.transformTo(this.destType,s.data),meta:s.meta})},e.exports=a},{"../utils":32,"./GenericWorker":28}],25:[function(u,e,i){"use strict";var t=u("./GenericWorker"),r=u("../crc32");function a(){t.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}u("../utils").inherits(a,t),a.prototype.processChunk=function(s){this.streamInfo.crc32=r(s.data,this.streamInfo.crc32||0),this.push(s)},e.exports=a},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(u,e,i){"use strict";var t=u("../utils"),r=u("./GenericWorker");function a(s){r.call(this,"DataLengthProbe for "+s),this.propName=s,this.withStreamInfo(s,0)}t.inherits(a,r),a.prototype.processChunk=function(s){if(s){var c=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=c+s.data.length}r.prototype.processChunk.call(this,s)},e.exports=a},{"../utils":32,"./GenericWorker":28}],27:[function(u,e,i){"use strict";var t=u("../utils"),r=u("./GenericWorker");function a(s){r.call(this,"DataWorker");var c=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,s.then(function(_){c.dataIsReady=!0,c.data=_,c.max=_&&_.length||0,c.type=t.getTypeOf(_),c.isPaused||c._tickAndRepeat()},function(_){c.error(_)})}t.inherits(a,r),a.prototype.cleanUp=function(){r.prototype.cleanUp.call(this),this.data=null},a.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,t.delay(this._tickAndRepeat,[],this)),!0)},a.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(t.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},a.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var s=null,c=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":s=this.data.substring(this.index,c);break;case"uint8array":s=this.data.subarray(this.index,c);break;case"array":case"nodebuffer":s=this.data.slice(this.index,c)}return this.index=c,this.push({data:s,meta:{percent:this.max?this.index/this.max*100:0}})},e.exports=a},{"../utils":32,"./GenericWorker":28}],28:[function(u,e,i){"use strict";function t(r){this.name=r||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}t.prototype={push:function(r){this.emit("data",r)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(r){this.emit("error",r)}return!0},error:function(r){return!this.isFinished&&(this.isPaused?this.generatedError=r:(this.isFinished=!0,this.emit("error",r),this.previous&&this.previous.error(r),this.cleanUp()),!0)},on:function(r,a){return this._listeners[r].push(a),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(r,a){if(this._listeners[r])for(var s=0;s<this._listeners[r].length;s++)this._listeners[r][s].call(this,a)},pipe:function(r){return r.registerPrevious(this)},registerPrevious:function(r){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=r.streamInfo,this.mergeStreamInfo(),this.previous=r;var a=this;return r.on("data",function(s){a.processChunk(s)}),r.on("end",function(){a.end()}),r.on("error",function(s){a.error(s)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var r=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),r=!0),this.previous&&this.previous.resume(),!r},flush:function(){},processChunk:function(r){this.push(r)},withStreamInfo:function(r,a){return this.extraStreamInfo[r]=a,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var r in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,r)&&(this.streamInfo[r]=this.extraStreamInfo[r])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var r="Worker "+this.name;return this.previous?this.previous+" -> "+r:r}},e.exports=t},{}],29:[function(u,e,i){"use strict";var t=u("../utils"),r=u("./ConvertWorker"),a=u("./GenericWorker"),s=u("../base64"),c=u("../support"),_=u("../external"),w=null;if(c.nodestream)try{w=u("../nodejs/NodejsStreamOutputAdapter")}catch{}function y(b,d){return new _.Promise(function(g,m){var x=[],$=b._internalType,T=b._outputType,z=b._mimeType;b.on("data",function(M,F){x.push(M),d&&d(F)}).on("error",function(M){x=[],m(M)}).on("end",function(){try{var M=(function(F,j,D){switch(F){case"blob":return t.newBlob(t.transformTo("arraybuffer",j),D);case"base64":return s.encode(j);default:return t.transformTo(F,j)}})(T,(function(F,j){var D,W=0,K=null,k=0;for(D=0;D<j.length;D++)k+=j[D].length;switch(F){case"string":return j.join("");case"array":return Array.prototype.concat.apply([],j);case"uint8array":for(K=new Uint8Array(k),D=0;D<j.length;D++)K.set(j[D],W),W+=j[D].length;return K;case"nodebuffer":return Buffer.concat(j);default:throw new Error("concat : unsupported type '"+F+"'")}})($,x),z);g(M)}catch(F){m(F)}x=[]}).resume()})}function p(b,d,g){var m=d;switch(d){case"blob":case"arraybuffer":m="uint8array";break;case"base64":m="string"}try{this._internalType=m,this._outputType=d,this._mimeType=g,t.checkSupport(m),this._worker=b.pipe(new r(m)),b.lock()}catch(x){this._worker=new a("error"),this._worker.error(x)}}p.prototype={accumulate:function(b){return y(this,b)},on:function(b,d){var g=this;return b==="data"?this._worker.on(b,function(m){d.call(g,m.data,m.meta)}):this._worker.on(b,function(){t.delay(d,arguments,g)}),this},resume:function(){return t.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(b){if(t.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new w(this,{objectMode:this._outputType!=="nodebuffer"},b)}},e.exports=p},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(u,e,i){"use strict";if(i.base64=!0,i.array=!0,i.string=!0,i.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",i.nodebuffer=typeof Buffer<"u",i.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")i.blob=!1;else{var t=new ArrayBuffer(0);try{i.blob=new Blob([t],{type:"application/zip"}).size===0}catch{try{var r=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);r.append(t),i.blob=r.getBlob("application/zip").size===0}catch{i.blob=!1}}}try{i.nodestream=!!u("readable-stream").Readable}catch{i.nodestream=!1}},{"readable-stream":16}],31:[function(u,e,i){"use strict";for(var t=u("./utils"),r=u("./support"),a=u("./nodejsUtils"),s=u("./stream/GenericWorker"),c=new Array(256),_=0;_<256;_++)c[_]=252<=_?6:248<=_?5:240<=_?4:224<=_?3:192<=_?2:1;c[254]=c[254]=1;function w(){s.call(this,"utf-8 decode"),this.leftOver=null}function y(){s.call(this,"utf-8 encode")}i.utf8encode=function(p){return r.nodebuffer?a.newBufferFrom(p,"utf-8"):(function(b){var d,g,m,x,$,T=b.length,z=0;for(x=0;x<T;x++)(64512&(g=b.charCodeAt(x)))==55296&&x+1<T&&(64512&(m=b.charCodeAt(x+1)))==56320&&(g=65536+(g-55296<<10)+(m-56320),x++),z+=g<128?1:g<2048?2:g<65536?3:4;for(d=r.uint8array?new Uint8Array(z):new Array(z),x=$=0;$<z;x++)(64512&(g=b.charCodeAt(x)))==55296&&x+1<T&&(64512&(m=b.charCodeAt(x+1)))==56320&&(g=65536+(g-55296<<10)+(m-56320),x++),g<128?d[$++]=g:(g<2048?d[$++]=192|g>>>6:(g<65536?d[$++]=224|g>>>12:(d[$++]=240|g>>>18,d[$++]=128|g>>>12&63),d[$++]=128|g>>>6&63),d[$++]=128|63&g);return d})(p)},i.utf8decode=function(p){return r.nodebuffer?t.transformTo("nodebuffer",p).toString("utf-8"):(function(b){var d,g,m,x,$=b.length,T=new Array(2*$);for(d=g=0;d<$;)if((m=b[d++])<128)T[g++]=m;else if(4<(x=c[m]))T[g++]=65533,d+=x-1;else{for(m&=x===2?31:x===3?15:7;1<x&&d<$;)m=m<<6|63&b[d++],x--;1<x?T[g++]=65533:m<65536?T[g++]=m:(m-=65536,T[g++]=55296|m>>10&1023,T[g++]=56320|1023&m)}return T.length!==g&&(T.subarray?T=T.subarray(0,g):T.length=g),t.applyFromCharCode(T)})(p=t.transformTo(r.uint8array?"uint8array":"array",p))},t.inherits(w,s),w.prototype.processChunk=function(p){var b=t.transformTo(r.uint8array?"uint8array":"array",p.data);if(this.leftOver&&this.leftOver.length){if(r.uint8array){var d=b;(b=new Uint8Array(d.length+this.leftOver.length)).set(this.leftOver,0),b.set(d,this.leftOver.length)}else b=this.leftOver.concat(b);this.leftOver=null}var g=(function(x,$){var T;for(($=$||x.length)>x.length&&($=x.length),T=$-1;0<=T&&(192&x[T])==128;)T--;return T<0||T===0?$:T+c[x[T]]>$?T:$})(b),m=b;g!==b.length&&(r.uint8array?(m=b.subarray(0,g),this.leftOver=b.subarray(g,b.length)):(m=b.slice(0,g),this.leftOver=b.slice(g,b.length))),this.push({data:i.utf8decode(m),meta:p.meta})},w.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:i.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},i.Utf8DecodeWorker=w,t.inherits(y,s),y.prototype.processChunk=function(p){this.push({data:i.utf8encode(p.data),meta:p.meta})},i.Utf8EncodeWorker=y},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(u,e,i){"use strict";var t=u("./support"),r=u("./base64"),a=u("./nodejsUtils"),s=u("./external");function c(d){return d}function _(d,g){for(var m=0;m<d.length;++m)g[m]=255&d.charCodeAt(m);return g}u("setimmediate"),i.newBlob=function(d,g){i.checkSupport("blob");try{return new Blob([d],{type:g})}catch{try{var m=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return m.append(d),m.getBlob(g)}catch{throw new Error("Bug : can't construct the Blob.")}}};var w={stringifyByChunk:function(d,g,m){var x=[],$=0,T=d.length;if(T<=m)return String.fromCharCode.apply(null,d);for(;$<T;)g==="array"||g==="nodebuffer"?x.push(String.fromCharCode.apply(null,d.slice($,Math.min($+m,T)))):x.push(String.fromCharCode.apply(null,d.subarray($,Math.min($+m,T)))),$+=m;return x.join("")},stringifyByChar:function(d){for(var g="",m=0;m<d.length;m++)g+=String.fromCharCode(d[m]);return g},applyCanBeUsed:{uint8array:(function(){try{return t.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}})(),nodebuffer:(function(){try{return t.nodebuffer&&String.fromCharCode.apply(null,a.allocBuffer(1)).length===1}catch{return!1}})()}};function y(d){var g=65536,m=i.getTypeOf(d),x=!0;if(m==="uint8array"?x=w.applyCanBeUsed.uint8array:m==="nodebuffer"&&(x=w.applyCanBeUsed.nodebuffer),x)for(;1<g;)try{return w.stringifyByChunk(d,m,g)}catch{g=Math.floor(g/2)}return w.stringifyByChar(d)}function p(d,g){for(var m=0;m<d.length;m++)g[m]=d[m];return g}i.applyFromCharCode=y;var b={};b.string={string:c,array:function(d){return _(d,new Array(d.length))},arraybuffer:function(d){return b.string.uint8array(d).buffer},uint8array:function(d){return _(d,new Uint8Array(d.length))},nodebuffer:function(d){return _(d,a.allocBuffer(d.length))}},b.array={string:y,array:c,arraybuffer:function(d){return new Uint8Array(d).buffer},uint8array:function(d){return new Uint8Array(d)},nodebuffer:function(d){return a.newBufferFrom(d)}},b.arraybuffer={string:function(d){return y(new Uint8Array(d))},array:function(d){return p(new Uint8Array(d),new Array(d.byteLength))},arraybuffer:c,uint8array:function(d){return new Uint8Array(d)},nodebuffer:function(d){return a.newBufferFrom(new Uint8Array(d))}},b.uint8array={string:y,array:function(d){return p(d,new Array(d.length))},arraybuffer:function(d){return d.buffer},uint8array:c,nodebuffer:function(d){return a.newBufferFrom(d)}},b.nodebuffer={string:y,array:function(d){return p(d,new Array(d.length))},arraybuffer:function(d){return b.nodebuffer.uint8array(d).buffer},uint8array:function(d){return p(d,new Uint8Array(d.length))},nodebuffer:c},i.transformTo=function(d,g){if(g=g||"",!d)return g;i.checkSupport(d);var m=i.getTypeOf(g);return b[m][d](g)},i.resolve=function(d){for(var g=d.split("/"),m=[],x=0;x<g.length;x++){var $=g[x];$==="."||$===""&&x!==0&&x!==g.length-1||($===".."?m.pop():m.push($))}return m.join("/")},i.getTypeOf=function(d){return typeof d=="string"?"string":Object.prototype.toString.call(d)==="[object Array]"?"array":t.nodebuffer&&a.isBuffer(d)?"nodebuffer":t.uint8array&&d instanceof Uint8Array?"uint8array":t.arraybuffer&&d instanceof ArrayBuffer?"arraybuffer":void 0},i.checkSupport=function(d){if(!t[d.toLowerCase()])throw new Error(d+" is not supported by this platform")},i.MAX_VALUE_16BITS=65535,i.MAX_VALUE_32BITS=-1,i.pretty=function(d){var g,m,x="";for(m=0;m<(d||"").length;m++)x+="\\x"+((g=d.charCodeAt(m))<16?"0":"")+g.toString(16).toUpperCase();return x},i.delay=function(d,g,m){setImmediate(function(){d.apply(m||null,g||[])})},i.inherits=function(d,g){function m(){}m.prototype=g.prototype,d.prototype=new m},i.extend=function(){var d,g,m={};for(d=0;d<arguments.length;d++)for(g in arguments[d])Object.prototype.hasOwnProperty.call(arguments[d],g)&&m[g]===void 0&&(m[g]=arguments[d][g]);return m},i.prepareContent=function(d,g,m,x,$){return s.Promise.resolve(g).then(function(T){return t.blob&&(T instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(T))!==-1)&&typeof FileReader<"u"?new s.Promise(function(z,M){var F=new FileReader;F.onload=function(j){z(j.target.result)},F.onerror=function(j){M(j.target.error)},F.readAsArrayBuffer(T)}):T}).then(function(T){var z=i.getTypeOf(T);return z?(z==="arraybuffer"?T=i.transformTo("uint8array",T):z==="string"&&($?T=r.decode(T):m&&x!==!0&&(T=(function(M){return _(M,t.uint8array?new Uint8Array(M.length):new Array(M.length))})(T))),T):s.Promise.reject(new Error("Can't read the data of '"+d+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(u,e,i){"use strict";var t=u("./reader/readerFor"),r=u("./utils"),a=u("./signature"),s=u("./zipEntry"),c=u("./support");function _(w){this.files=[],this.loadOptions=w}_.prototype={checkSignature:function(w){if(!this.reader.readAndCheckSignature(w)){this.reader.index-=4;var y=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+r.pretty(y)+", expected "+r.pretty(w)+")")}},isSignature:function(w,y){var p=this.reader.index;this.reader.setIndex(w);var b=this.reader.readString(4)===y;return this.reader.setIndex(p),b},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var w=this.reader.readData(this.zipCommentLength),y=c.uint8array?"uint8array":"array",p=r.transformTo(y,w);this.zipComment=this.loadOptions.decodeFileName(p)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var w,y,p,b=this.zip64EndOfCentralSize-44;0<b;)w=this.reader.readInt(2),y=this.reader.readInt(4),p=this.reader.readData(y),this.zip64ExtensibleData[w]={id:w,length:y,value:p}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var w,y;for(w=0;w<this.files.length;w++)y=this.files[w],this.reader.setIndex(y.localHeaderOffset),this.checkSignature(a.LOCAL_FILE_HEADER),y.readLocalPart(this.reader),y.handleUTF8(),y.processAttributes()},readCentralDir:function(){var w;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(a.CENTRAL_FILE_HEADER);)(w=new s({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(w);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var w=this.reader.lastIndexOfSignature(a.CENTRAL_DIRECTORY_END);if(w<0)throw this.isSignature(0,a.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(w);var y=w;if(this.checkSignature(a.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===r.MAX_VALUE_16BITS||this.diskWithCentralDirStart===r.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===r.MAX_VALUE_16BITS||this.centralDirRecords===r.MAX_VALUE_16BITS||this.centralDirSize===r.MAX_VALUE_32BITS||this.centralDirOffset===r.MAX_VALUE_32BITS){if(this.zip64=!0,(w=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(w),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,a.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var p=this.centralDirOffset+this.centralDirSize;this.zip64&&(p+=20,p+=12+this.zip64EndOfCentralSize);var b=y-p;if(0<b)this.isSignature(y,a.CENTRAL_FILE_HEADER)||(this.reader.zero=b);else if(b<0)throw new Error("Corrupted zip: missing "+Math.abs(b)+" bytes.")},prepareReader:function(w){this.reader=t(w)},load:function(w){this.prepareReader(w),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},e.exports=_},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(u,e,i){"use strict";var t=u("./reader/readerFor"),r=u("./utils"),a=u("./compressedObject"),s=u("./crc32"),c=u("./utf8"),_=u("./compressions"),w=u("./support");function y(p,b){this.options=p,this.loadOptions=b}y.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(p){var b,d;if(p.skip(22),this.fileNameLength=p.readInt(2),d=p.readInt(2),this.fileName=p.readData(this.fileNameLength),p.skip(d),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((b=(function(g){for(var m in _)if(Object.prototype.hasOwnProperty.call(_,m)&&_[m].magic===g)return _[m];return null})(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+r.pretty(this.compressionMethod)+" unknown (inner file : "+r.transformTo("string",this.fileName)+")");this.decompressed=new a(this.compressedSize,this.uncompressedSize,this.crc32,b,p.readData(this.compressedSize))},readCentralPart:function(p){this.versionMadeBy=p.readInt(2),p.skip(2),this.bitFlag=p.readInt(2),this.compressionMethod=p.readString(2),this.date=p.readDate(),this.crc32=p.readInt(4),this.compressedSize=p.readInt(4),this.uncompressedSize=p.readInt(4);var b=p.readInt(2);if(this.extraFieldsLength=p.readInt(2),this.fileCommentLength=p.readInt(2),this.diskNumberStart=p.readInt(2),this.internalFileAttributes=p.readInt(2),this.externalFileAttributes=p.readInt(4),this.localHeaderOffset=p.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");p.skip(b),this.readExtraFields(p),this.parseZIP64ExtraField(p),this.fileComment=p.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var p=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),p==0&&(this.dosPermissions=63&this.externalFileAttributes),p==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var p=t(this.extraFields[1].value);this.uncompressedSize===r.MAX_VALUE_32BITS&&(this.uncompressedSize=p.readInt(8)),this.compressedSize===r.MAX_VALUE_32BITS&&(this.compressedSize=p.readInt(8)),this.localHeaderOffset===r.MAX_VALUE_32BITS&&(this.localHeaderOffset=p.readInt(8)),this.diskNumberStart===r.MAX_VALUE_32BITS&&(this.diskNumberStart=p.readInt(4))}},readExtraFields:function(p){var b,d,g,m=p.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});p.index+4<m;)b=p.readInt(2),d=p.readInt(2),g=p.readData(d),this.extraFields[b]={id:b,length:d,value:g};p.setIndex(m)},handleUTF8:function(){var p=w.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=c.utf8decode(this.fileName),this.fileCommentStr=c.utf8decode(this.fileComment);else{var b=this.findExtraFieldUnicodePath();if(b!==null)this.fileNameStr=b;else{var d=r.transformTo(p,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(d)}var g=this.findExtraFieldUnicodeComment();if(g!==null)this.fileCommentStr=g;else{var m=r.transformTo(p,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(m)}}},findExtraFieldUnicodePath:function(){var p=this.extraFields[28789];if(p){var b=t(p.value);return b.readInt(1)!==1||s(this.fileName)!==b.readInt(4)?null:c.utf8decode(b.readData(p.length-5))}return null},findExtraFieldUnicodeComment:function(){var p=this.extraFields[25461];if(p){var b=t(p.value);return b.readInt(1)!==1||s(this.fileComment)!==b.readInt(4)?null:c.utf8decode(b.readData(p.length-5))}return null}},e.exports=y},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(u,e,i){"use strict";function t(b,d,g){this.name=b,this.dir=g.dir,this.date=g.date,this.comment=g.comment,this.unixPermissions=g.unixPermissions,this.dosPermissions=g.dosPermissions,this._data=d,this._dataBinary=g.binary,this.options={compression:g.compression,compressionOptions:g.compressionOptions}}var r=u("./stream/StreamHelper"),a=u("./stream/DataWorker"),s=u("./utf8"),c=u("./compressedObject"),_=u("./stream/GenericWorker");t.prototype={internalStream:function(b){var d=null,g="string";try{if(!b)throw new Error("No output type specified.");var m=(g=b.toLowerCase())==="string"||g==="text";g!=="binarystring"&&g!=="text"||(g="string"),d=this._decompressWorker();var x=!this._dataBinary;x&&!m&&(d=d.pipe(new s.Utf8EncodeWorker)),!x&&m&&(d=d.pipe(new s.Utf8DecodeWorker))}catch($){(d=new _("error")).error($)}return new r(d,g,"")},async:function(b,d){return this.internalStream(b).accumulate(d)},nodeStream:function(b,d){return this.internalStream(b||"nodebuffer").toNodejsStream(d)},_compressWorker:function(b,d){if(this._data instanceof c&&this._data.compression.magic===b.magic)return this._data.getCompressedWorker();var g=this._decompressWorker();return this._dataBinary||(g=g.pipe(new s.Utf8EncodeWorker)),c.createWorkerFrom(g,b,d)},_decompressWorker:function(){return this._data instanceof c?this._data.getContentWorker():this._data instanceof _?this._data:new a(this._data)}};for(var w=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],y=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},p=0;p<w.length;p++)t.prototype[w[p]]=y;e.exports=t},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(u,e,i){(function(t){"use strict";var r,a,s=t.MutationObserver||t.WebKitMutationObserver;if(s){var c=0,_=new s(b),w=t.document.createTextNode("");_.observe(w,{characterData:!0}),r=function(){w.data=c=++c%2}}else if(t.setImmediate||t.MessageChannel===void 0)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var d=t.document.createElement("script");d.onreadystatechange=function(){b(),d.onreadystatechange=null,d.parentNode.removeChild(d),d=null},t.document.documentElement.appendChild(d)}:function(){setTimeout(b,0)};else{var y=new t.MessageChannel;y.port1.onmessage=b,r=function(){y.port2.postMessage(0)}}var p=[];function b(){var d,g;a=!0;for(var m=p.length;m;){for(g=p,p=[],d=-1;++d<m;)g[d]();m=p.length}a=!1}e.exports=function(d){p.push(d)!==1||a||r()}}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(u,e,i){"use strict";var t=u("immediate");function r(){}var a={},s=["REJECTED"],c=["FULFILLED"],_=["PENDING"];function w(m){if(typeof m!="function")throw new TypeError("resolver must be a function");this.state=_,this.queue=[],this.outcome=void 0,m!==r&&d(this,m)}function y(m,x,$){this.promise=m,typeof x=="function"&&(this.onFulfilled=x,this.callFulfilled=this.otherCallFulfilled),typeof $=="function"&&(this.onRejected=$,this.callRejected=this.otherCallRejected)}function p(m,x,$){t(function(){var T;try{T=x($)}catch(z){return a.reject(m,z)}T===m?a.reject(m,new TypeError("Cannot resolve promise with itself")):a.resolve(m,T)})}function b(m){var x=m&&m.then;if(m&&(typeof m=="object"||typeof m=="function")&&typeof x=="function")return function(){x.apply(m,arguments)}}function d(m,x){var $=!1;function T(F){$||($=!0,a.reject(m,F))}function z(F){$||($=!0,a.resolve(m,F))}var M=g(function(){x(z,T)});M.status==="error"&&T(M.value)}function g(m,x){var $={};try{$.value=m(x),$.status="success"}catch(T){$.status="error",$.value=T}return $}(e.exports=w).prototype.finally=function(m){if(typeof m!="function")return this;var x=this.constructor;return this.then(function($){return x.resolve(m()).then(function(){return $})},function($){return x.resolve(m()).then(function(){throw $})})},w.prototype.catch=function(m){return this.then(null,m)},w.prototype.then=function(m,x){if(typeof m!="function"&&this.state===c||typeof x!="function"&&this.state===s)return this;var $=new this.constructor(r);return this.state!==_?p($,this.state===c?m:x,this.outcome):this.queue.push(new y($,m,x)),$},y.prototype.callFulfilled=function(m){a.resolve(this.promise,m)},y.prototype.otherCallFulfilled=function(m){p(this.promise,this.onFulfilled,m)},y.prototype.callRejected=function(m){a.reject(this.promise,m)},y.prototype.otherCallRejected=function(m){p(this.promise,this.onRejected,m)},a.resolve=function(m,x){var $=g(b,x);if($.status==="error")return a.reject(m,$.value);var T=$.value;if(T)d(m,T);else{m.state=c,m.outcome=x;for(var z=-1,M=m.queue.length;++z<M;)m.queue[z].callFulfilled(x)}return m},a.reject=function(m,x){m.state=s,m.outcome=x;for(var $=-1,T=m.queue.length;++$<T;)m.queue[$].callRejected(x);return m},w.resolve=function(m){return m instanceof this?m:a.resolve(new this(r),m)},w.reject=function(m){var x=new this(r);return a.reject(x,m)},w.all=function(m){var x=this;if(Object.prototype.toString.call(m)!=="[object Array]")return this.reject(new TypeError("must be an array"));var $=m.length,T=!1;if(!$)return this.resolve([]);for(var z=new Array($),M=0,F=-1,j=new this(r);++F<$;)D(m[F],F);return j;function D(W,K){x.resolve(W).then(function(k){z[K]=k,++M!==$||T||(T=!0,a.resolve(j,z))},function(k){T||(T=!0,a.reject(j,k))})}},w.race=function(m){var x=this;if(Object.prototype.toString.call(m)!=="[object Array]")return this.reject(new TypeError("must be an array"));var $=m.length,T=!1;if(!$)return this.resolve([]);for(var z=-1,M=new this(r);++z<$;)F=m[z],x.resolve(F).then(function(j){T||(T=!0,a.resolve(M,j))},function(j){T||(T=!0,a.reject(M,j))});var F;return M}},{immediate:36}],38:[function(u,e,i){"use strict";var t={};(0,u("./lib/utils/common").assign)(t,u("./lib/deflate"),u("./lib/inflate"),u("./lib/zlib/constants")),e.exports=t},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(u,e,i){"use strict";var t=u("./zlib/deflate"),r=u("./utils/common"),a=u("./utils/strings"),s=u("./zlib/messages"),c=u("./zlib/zstream"),_=Object.prototype.toString,w=0,y=-1,p=0,b=8;function d(m){if(!(this instanceof d))return new d(m);this.options=r.assign({level:y,method:b,chunkSize:16384,windowBits:15,memLevel:8,strategy:p,to:""},m||{});var x=this.options;x.raw&&0<x.windowBits?x.windowBits=-x.windowBits:x.gzip&&0<x.windowBits&&x.windowBits<16&&(x.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new c,this.strm.avail_out=0;var $=t.deflateInit2(this.strm,x.level,x.method,x.windowBits,x.memLevel,x.strategy);if($!==w)throw new Error(s[$]);if(x.header&&t.deflateSetHeader(this.strm,x.header),x.dictionary){var T;if(T=typeof x.dictionary=="string"?a.string2buf(x.dictionary):_.call(x.dictionary)==="[object ArrayBuffer]"?new Uint8Array(x.dictionary):x.dictionary,($=t.deflateSetDictionary(this.strm,T))!==w)throw new Error(s[$]);this._dict_set=!0}}function g(m,x){var $=new d(x);if($.push(m,!0),$.err)throw $.msg||s[$.err];return $.result}d.prototype.push=function(m,x){var $,T,z=this.strm,M=this.options.chunkSize;if(this.ended)return!1;T=x===~~x?x:x===!0?4:0,typeof m=="string"?z.input=a.string2buf(m):_.call(m)==="[object ArrayBuffer]"?z.input=new Uint8Array(m):z.input=m,z.next_in=0,z.avail_in=z.input.length;do{if(z.avail_out===0&&(z.output=new r.Buf8(M),z.next_out=0,z.avail_out=M),($=t.deflate(z,T))!==1&&$!==w)return this.onEnd($),!(this.ended=!0);z.avail_out!==0&&(z.avail_in!==0||T!==4&&T!==2)||(this.options.to==="string"?this.onData(a.buf2binstring(r.shrinkBuf(z.output,z.next_out))):this.onData(r.shrinkBuf(z.output,z.next_out)))}while((0<z.avail_in||z.avail_out===0)&&$!==1);return T===4?($=t.deflateEnd(this.strm),this.onEnd($),this.ended=!0,$===w):T!==2||(this.onEnd(w),!(z.avail_out=0))},d.prototype.onData=function(m){this.chunks.push(m)},d.prototype.onEnd=function(m){m===w&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=r.flattenChunks(this.chunks)),this.chunks=[],this.err=m,this.msg=this.strm.msg},i.Deflate=d,i.deflate=g,i.deflateRaw=function(m,x){return(x=x||{}).raw=!0,g(m,x)},i.gzip=function(m,x){return(x=x||{}).gzip=!0,g(m,x)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(u,e,i){"use strict";var t=u("./zlib/inflate"),r=u("./utils/common"),a=u("./utils/strings"),s=u("./zlib/constants"),c=u("./zlib/messages"),_=u("./zlib/zstream"),w=u("./zlib/gzheader"),y=Object.prototype.toString;function p(d){if(!(this instanceof p))return new p(d);this.options=r.assign({chunkSize:16384,windowBits:0,to:""},d||{});var g=this.options;g.raw&&0<=g.windowBits&&g.windowBits<16&&(g.windowBits=-g.windowBits,g.windowBits===0&&(g.windowBits=-15)),!(0<=g.windowBits&&g.windowBits<16)||d&&d.windowBits||(g.windowBits+=32),15<g.windowBits&&g.windowBits<48&&(15&g.windowBits)==0&&(g.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new _,this.strm.avail_out=0;var m=t.inflateInit2(this.strm,g.windowBits);if(m!==s.Z_OK)throw new Error(c[m]);this.header=new w,t.inflateGetHeader(this.strm,this.header)}function b(d,g){var m=new p(g);if(m.push(d,!0),m.err)throw m.msg||c[m.err];return m.result}p.prototype.push=function(d,g){var m,x,$,T,z,M,F=this.strm,j=this.options.chunkSize,D=this.options.dictionary,W=!1;if(this.ended)return!1;x=g===~~g?g:g===!0?s.Z_FINISH:s.Z_NO_FLUSH,typeof d=="string"?F.input=a.binstring2buf(d):y.call(d)==="[object ArrayBuffer]"?F.input=new Uint8Array(d):F.input=d,F.next_in=0,F.avail_in=F.input.length;do{if(F.avail_out===0&&(F.output=new r.Buf8(j),F.next_out=0,F.avail_out=j),(m=t.inflate(F,s.Z_NO_FLUSH))===s.Z_NEED_DICT&&D&&(M=typeof D=="string"?a.string2buf(D):y.call(D)==="[object ArrayBuffer]"?new Uint8Array(D):D,m=t.inflateSetDictionary(this.strm,M)),m===s.Z_BUF_ERROR&&W===!0&&(m=s.Z_OK,W=!1),m!==s.Z_STREAM_END&&m!==s.Z_OK)return this.onEnd(m),!(this.ended=!0);F.next_out&&(F.avail_out!==0&&m!==s.Z_STREAM_END&&(F.avail_in!==0||x!==s.Z_FINISH&&x!==s.Z_SYNC_FLUSH)||(this.options.to==="string"?($=a.utf8border(F.output,F.next_out),T=F.next_out-$,z=a.buf2string(F.output,$),F.next_out=T,F.avail_out=j-T,T&&r.arraySet(F.output,F.output,$,T,0),this.onData(z)):this.onData(r.shrinkBuf(F.output,F.next_out)))),F.avail_in===0&&F.avail_out===0&&(W=!0)}while((0<F.avail_in||F.avail_out===0)&&m!==s.Z_STREAM_END);return m===s.Z_STREAM_END&&(x=s.Z_FINISH),x===s.Z_FINISH?(m=t.inflateEnd(this.strm),this.onEnd(m),this.ended=!0,m===s.Z_OK):x!==s.Z_SYNC_FLUSH||(this.onEnd(s.Z_OK),!(F.avail_out=0))},p.prototype.onData=function(d){this.chunks.push(d)},p.prototype.onEnd=function(d){d===s.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=r.flattenChunks(this.chunks)),this.chunks=[],this.err=d,this.msg=this.strm.msg},i.Inflate=p,i.inflate=b,i.inflateRaw=function(d,g){return(g=g||{}).raw=!0,b(d,g)},i.ungzip=b},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(u,e,i){"use strict";var t=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";i.assign=function(s){for(var c=Array.prototype.slice.call(arguments,1);c.length;){var _=c.shift();if(_){if(typeof _!="object")throw new TypeError(_+"must be non-object");for(var w in _)_.hasOwnProperty(w)&&(s[w]=_[w])}}return s},i.shrinkBuf=function(s,c){return s.length===c?s:s.subarray?s.subarray(0,c):(s.length=c,s)};var r={arraySet:function(s,c,_,w,y){if(c.subarray&&s.subarray)s.set(c.subarray(_,_+w),y);else for(var p=0;p<w;p++)s[y+p]=c[_+p]},flattenChunks:function(s){var c,_,w,y,p,b;for(c=w=0,_=s.length;c<_;c++)w+=s[c].length;for(b=new Uint8Array(w),c=y=0,_=s.length;c<_;c++)p=s[c],b.set(p,y),y+=p.length;return b}},a={arraySet:function(s,c,_,w,y){for(var p=0;p<w;p++)s[y+p]=c[_+p]},flattenChunks:function(s){return[].concat.apply([],s)}};i.setTyped=function(s){s?(i.Buf8=Uint8Array,i.Buf16=Uint16Array,i.Buf32=Int32Array,i.assign(i,r)):(i.Buf8=Array,i.Buf16=Array,i.Buf32=Array,i.assign(i,a))},i.setTyped(t)},{}],42:[function(u,e,i){"use strict";var t=u("./common"),r=!0,a=!0;try{String.fromCharCode.apply(null,[0])}catch{r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{a=!1}for(var s=new t.Buf8(256),c=0;c<256;c++)s[c]=252<=c?6:248<=c?5:240<=c?4:224<=c?3:192<=c?2:1;function _(w,y){if(y<65537&&(w.subarray&&a||!w.subarray&&r))return String.fromCharCode.apply(null,t.shrinkBuf(w,y));for(var p="",b=0;b<y;b++)p+=String.fromCharCode(w[b]);return p}s[254]=s[254]=1,i.string2buf=function(w){var y,p,b,d,g,m=w.length,x=0;for(d=0;d<m;d++)(64512&(p=w.charCodeAt(d)))==55296&&d+1<m&&(64512&(b=w.charCodeAt(d+1)))==56320&&(p=65536+(p-55296<<10)+(b-56320),d++),x+=p<128?1:p<2048?2:p<65536?3:4;for(y=new t.Buf8(x),d=g=0;g<x;d++)(64512&(p=w.charCodeAt(d)))==55296&&d+1<m&&(64512&(b=w.charCodeAt(d+1)))==56320&&(p=65536+(p-55296<<10)+(b-56320),d++),p<128?y[g++]=p:(p<2048?y[g++]=192|p>>>6:(p<65536?y[g++]=224|p>>>12:(y[g++]=240|p>>>18,y[g++]=128|p>>>12&63),y[g++]=128|p>>>6&63),y[g++]=128|63&p);return y},i.buf2binstring=function(w){return _(w,w.length)},i.binstring2buf=function(w){for(var y=new t.Buf8(w.length),p=0,b=y.length;p<b;p++)y[p]=w.charCodeAt(p);return y},i.buf2string=function(w,y){var p,b,d,g,m=y||w.length,x=new Array(2*m);for(p=b=0;p<m;)if((d=w[p++])<128)x[b++]=d;else if(4<(g=s[d]))x[b++]=65533,p+=g-1;else{for(d&=g===2?31:g===3?15:7;1<g&&p<m;)d=d<<6|63&w[p++],g--;1<g?x[b++]=65533:d<65536?x[b++]=d:(d-=65536,x[b++]=55296|d>>10&1023,x[b++]=56320|1023&d)}return _(x,b)},i.utf8border=function(w,y){var p;for((y=y||w.length)>w.length&&(y=w.length),p=y-1;0<=p&&(192&w[p])==128;)p--;return p<0||p===0?y:p+s[w[p]]>y?p:y}},{"./common":41}],43:[function(u,e,i){"use strict";e.exports=function(t,r,a,s){for(var c=65535&t|0,_=t>>>16&65535|0,w=0;a!==0;){for(a-=w=2e3<a?2e3:a;_=_+(c=c+r[s++]|0)|0,--w;);c%=65521,_%=65521}return c|_<<16|0}},{}],44:[function(u,e,i){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(u,e,i){"use strict";var t=(function(){for(var r,a=[],s=0;s<256;s++){r=s;for(var c=0;c<8;c++)r=1&r?3988292384^r>>>1:r>>>1;a[s]=r}return a})();e.exports=function(r,a,s,c){var _=t,w=c+s;r^=-1;for(var y=c;y<w;y++)r=r>>>8^_[255&(r^a[y])];return-1^r}},{}],46:[function(u,e,i){"use strict";var t,r=u("../utils/common"),a=u("./trees"),s=u("./adler32"),c=u("./crc32"),_=u("./messages"),w=0,y=4,p=0,b=-2,d=-1,g=4,m=2,x=8,$=9,T=286,z=30,M=19,F=2*T+1,j=15,D=3,W=258,K=W+D+1,k=42,O=113,l=1,A=2,X=3,B=4;function ee(n,L){return n.msg=_[L],L}function U(n){return(n<<1)-(4<n?9:0)}function J(n){for(var L=n.length;0<=--L;)n[L]=0}function R(n){var L=n.state,E=L.pending;E>n.avail_out&&(E=n.avail_out),E!==0&&(r.arraySet(n.output,L.pending_buf,L.pending_out,E,n.next_out),n.next_out+=E,L.pending_out+=E,n.total_out+=E,n.avail_out-=E,L.pending-=E,L.pending===0&&(L.pending_out=0))}function I(n,L){a._tr_flush_block(n,0<=n.block_start?n.block_start:-1,n.strstart-n.block_start,L),n.block_start=n.strstart,R(n.strm)}function Y(n,L){n.pending_buf[n.pending++]=L}function H(n,L){n.pending_buf[n.pending++]=L>>>8&255,n.pending_buf[n.pending++]=255&L}function G(n,L){var E,v,f=n.max_chain_length,S=n.strstart,P=n.prev_length,N=n.nice_match,C=n.strstart>n.w_size-K?n.strstart-(n.w_size-K):0,q=n.window,V=n.w_mask,Z=n.prev,Q=n.strstart+W,ne=q[S+P-1],re=q[S+P];n.prev_length>=n.good_match&&(f>>=2),N>n.lookahead&&(N=n.lookahead);do if(q[(E=L)+P]===re&&q[E+P-1]===ne&&q[E]===q[S]&&q[++E]===q[S+1]){S+=2,E++;do;while(q[++S]===q[++E]&&q[++S]===q[++E]&&q[++S]===q[++E]&&q[++S]===q[++E]&&q[++S]===q[++E]&&q[++S]===q[++E]&&q[++S]===q[++E]&&q[++S]===q[++E]&&S<Q);if(v=W-(Q-S),S=Q-W,P<v){if(n.match_start=L,N<=(P=v))break;ne=q[S+P-1],re=q[S+P]}}while((L=Z[L&V])>C&&--f!=0);return P<=n.lookahead?P:n.lookahead}function se(n){var L,E,v,f,S,P,N,C,q,V,Z=n.w_size;do{if(f=n.window_size-n.lookahead-n.strstart,n.strstart>=Z+(Z-K)){for(r.arraySet(n.window,n.window,Z,Z,0),n.match_start-=Z,n.strstart-=Z,n.block_start-=Z,L=E=n.hash_size;v=n.head[--L],n.head[L]=Z<=v?v-Z:0,--E;);for(L=E=Z;v=n.prev[--L],n.prev[L]=Z<=v?v-Z:0,--E;);f+=Z}if(n.strm.avail_in===0)break;if(P=n.strm,N=n.window,C=n.strstart+n.lookahead,q=f,V=void 0,V=P.avail_in,q<V&&(V=q),E=V===0?0:(P.avail_in-=V,r.arraySet(N,P.input,P.next_in,V,C),P.state.wrap===1?P.adler=s(P.adler,N,V,C):P.state.wrap===2&&(P.adler=c(P.adler,N,V,C)),P.next_in+=V,P.total_in+=V,V),n.lookahead+=E,n.lookahead+n.insert>=D)for(S=n.strstart-n.insert,n.ins_h=n.window[S],n.ins_h=(n.ins_h<<n.hash_shift^n.window[S+1])&n.hash_mask;n.insert&&(n.ins_h=(n.ins_h<<n.hash_shift^n.window[S+D-1])&n.hash_mask,n.prev[S&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=S,S++,n.insert--,!(n.lookahead+n.insert<D)););}while(n.lookahead<K&&n.strm.avail_in!==0)}function de(n,L){for(var E,v;;){if(n.lookahead<K){if(se(n),n.lookahead<K&&L===w)return l;if(n.lookahead===0)break}if(E=0,n.lookahead>=D&&(n.ins_h=(n.ins_h<<n.hash_shift^n.window[n.strstart+D-1])&n.hash_mask,E=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart),E!==0&&n.strstart-E<=n.w_size-K&&(n.match_length=G(n,E)),n.match_length>=D)if(v=a._tr_tally(n,n.strstart-n.match_start,n.match_length-D),n.lookahead-=n.match_length,n.match_length<=n.max_lazy_match&&n.lookahead>=D){for(n.match_length--;n.strstart++,n.ins_h=(n.ins_h<<n.hash_shift^n.window[n.strstart+D-1])&n.hash_mask,E=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart,--n.match_length!=0;);n.strstart++}else n.strstart+=n.match_length,n.match_length=0,n.ins_h=n.window[n.strstart],n.ins_h=(n.ins_h<<n.hash_shift^n.window[n.strstart+1])&n.hash_mask;else v=a._tr_tally(n,0,n.window[n.strstart]),n.lookahead--,n.strstart++;if(v&&(I(n,!1),n.strm.avail_out===0))return l}return n.insert=n.strstart<D-1?n.strstart:D-1,L===y?(I(n,!0),n.strm.avail_out===0?X:B):n.last_lit&&(I(n,!1),n.strm.avail_out===0)?l:A}function ie(n,L){for(var E,v,f;;){if(n.lookahead<K){if(se(n),n.lookahead<K&&L===w)return l;if(n.lookahead===0)break}if(E=0,n.lookahead>=D&&(n.ins_h=(n.ins_h<<n.hash_shift^n.window[n.strstart+D-1])&n.hash_mask,E=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart),n.prev_length=n.match_length,n.prev_match=n.match_start,n.match_length=D-1,E!==0&&n.prev_length<n.max_lazy_match&&n.strstart-E<=n.w_size-K&&(n.match_length=G(n,E),n.match_length<=5&&(n.strategy===1||n.match_length===D&&4096<n.strstart-n.match_start)&&(n.match_length=D-1)),n.prev_length>=D&&n.match_length<=n.prev_length){for(f=n.strstart+n.lookahead-D,v=a._tr_tally(n,n.strstart-1-n.prev_match,n.prev_length-D),n.lookahead-=n.prev_length-1,n.prev_length-=2;++n.strstart<=f&&(n.ins_h=(n.ins_h<<n.hash_shift^n.window[n.strstart+D-1])&n.hash_mask,E=n.prev[n.strstart&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=n.strstart),--n.prev_length!=0;);if(n.match_available=0,n.match_length=D-1,n.strstart++,v&&(I(n,!1),n.strm.avail_out===0))return l}else if(n.match_available){if((v=a._tr_tally(n,0,n.window[n.strstart-1]))&&I(n,!1),n.strstart++,n.lookahead--,n.strm.avail_out===0)return l}else n.match_available=1,n.strstart++,n.lookahead--}return n.match_available&&(v=a._tr_tally(n,0,n.window[n.strstart-1]),n.match_available=0),n.insert=n.strstart<D-1?n.strstart:D-1,L===y?(I(n,!0),n.strm.avail_out===0?X:B):n.last_lit&&(I(n,!1),n.strm.avail_out===0)?l:A}function ae(n,L,E,v,f){this.good_length=n,this.max_lazy=L,this.nice_length=E,this.max_chain=v,this.func=f}function ce(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=x,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new r.Buf16(2*F),this.dyn_dtree=new r.Buf16(2*(2*z+1)),this.bl_tree=new r.Buf16(2*(2*M+1)),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new r.Buf16(j+1),this.heap=new r.Buf16(2*T+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new r.Buf16(2*T+1),J(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function oe(n){var L;return n&&n.state?(n.total_in=n.total_out=0,n.data_type=m,(L=n.state).pending=0,L.pending_out=0,L.wrap<0&&(L.wrap=-L.wrap),L.status=L.wrap?k:O,n.adler=L.wrap===2?0:1,L.last_flush=w,a._tr_init(L),p):ee(n,b)}function ge(n){var L=oe(n);return L===p&&(function(E){E.window_size=2*E.w_size,J(E.head),E.max_lazy_match=t[E.level].max_lazy,E.good_match=t[E.level].good_length,E.nice_match=t[E.level].nice_length,E.max_chain_length=t[E.level].max_chain,E.strstart=0,E.block_start=0,E.lookahead=0,E.insert=0,E.match_length=E.prev_length=D-1,E.match_available=0,E.ins_h=0})(n.state),L}function fe(n,L,E,v,f,S){if(!n)return b;var P=1;if(L===d&&(L=6),v<0?(P=0,v=-v):15<v&&(P=2,v-=16),f<1||$<f||E!==x||v<8||15<v||L<0||9<L||S<0||g<S)return ee(n,b);v===8&&(v=9);var N=new ce;return(n.state=N).strm=n,N.wrap=P,N.gzhead=null,N.w_bits=v,N.w_size=1<<N.w_bits,N.w_mask=N.w_size-1,N.hash_bits=f+7,N.hash_size=1<<N.hash_bits,N.hash_mask=N.hash_size-1,N.hash_shift=~~((N.hash_bits+D-1)/D),N.window=new r.Buf8(2*N.w_size),N.head=new r.Buf16(N.hash_size),N.prev=new r.Buf16(N.w_size),N.lit_bufsize=1<<f+6,N.pending_buf_size=4*N.lit_bufsize,N.pending_buf=new r.Buf8(N.pending_buf_size),N.d_buf=1*N.lit_bufsize,N.l_buf=3*N.lit_bufsize,N.level=L,N.strategy=S,N.method=E,ge(n)}t=[new ae(0,0,0,0,function(n,L){var E=65535;for(E>n.pending_buf_size-5&&(E=n.pending_buf_size-5);;){if(n.lookahead<=1){if(se(n),n.lookahead===0&&L===w)return l;if(n.lookahead===0)break}n.strstart+=n.lookahead,n.lookahead=0;var v=n.block_start+E;if((n.strstart===0||n.strstart>=v)&&(n.lookahead=n.strstart-v,n.strstart=v,I(n,!1),n.strm.avail_out===0)||n.strstart-n.block_start>=n.w_size-K&&(I(n,!1),n.strm.avail_out===0))return l}return n.insert=0,L===y?(I(n,!0),n.strm.avail_out===0?X:B):(n.strstart>n.block_start&&(I(n,!1),n.strm.avail_out),l)}),new ae(4,4,8,4,de),new ae(4,5,16,8,de),new ae(4,6,32,32,de),new ae(4,4,16,16,ie),new ae(8,16,32,32,ie),new ae(8,16,128,128,ie),new ae(8,32,128,256,ie),new ae(32,128,258,1024,ie),new ae(32,258,258,4096,ie)],i.deflateInit=function(n,L){return fe(n,L,x,15,8,0)},i.deflateInit2=fe,i.deflateReset=ge,i.deflateResetKeep=oe,i.deflateSetHeader=function(n,L){return n&&n.state?n.state.wrap!==2?b:(n.state.gzhead=L,p):b},i.deflate=function(n,L){var E,v,f,S;if(!n||!n.state||5<L||L<0)return n?ee(n,b):b;if(v=n.state,!n.output||!n.input&&n.avail_in!==0||v.status===666&&L!==y)return ee(n,n.avail_out===0?-5:b);if(v.strm=n,E=v.last_flush,v.last_flush=L,v.status===k)if(v.wrap===2)n.adler=0,Y(v,31),Y(v,139),Y(v,8),v.gzhead?(Y(v,(v.gzhead.text?1:0)+(v.gzhead.hcrc?2:0)+(v.gzhead.extra?4:0)+(v.gzhead.name?8:0)+(v.gzhead.comment?16:0)),Y(v,255&v.gzhead.time),Y(v,v.gzhead.time>>8&255),Y(v,v.gzhead.time>>16&255),Y(v,v.gzhead.time>>24&255),Y(v,v.level===9?2:2<=v.strategy||v.level<2?4:0),Y(v,255&v.gzhead.os),v.gzhead.extra&&v.gzhead.extra.length&&(Y(v,255&v.gzhead.extra.length),Y(v,v.gzhead.extra.length>>8&255)),v.gzhead.hcrc&&(n.adler=c(n.adler,v.pending_buf,v.pending,0)),v.gzindex=0,v.status=69):(Y(v,0),Y(v,0),Y(v,0),Y(v,0),Y(v,0),Y(v,v.level===9?2:2<=v.strategy||v.level<2?4:0),Y(v,3),v.status=O);else{var P=x+(v.w_bits-8<<4)<<8;P|=(2<=v.strategy||v.level<2?0:v.level<6?1:v.level===6?2:3)<<6,v.strstart!==0&&(P|=32),P+=31-P%31,v.status=O,H(v,P),v.strstart!==0&&(H(v,n.adler>>>16),H(v,65535&n.adler)),n.adler=1}if(v.status===69)if(v.gzhead.extra){for(f=v.pending;v.gzindex<(65535&v.gzhead.extra.length)&&(v.pending!==v.pending_buf_size||(v.gzhead.hcrc&&v.pending>f&&(n.adler=c(n.adler,v.pending_buf,v.pending-f,f)),R(n),f=v.pending,v.pending!==v.pending_buf_size));)Y(v,255&v.gzhead.extra[v.gzindex]),v.gzindex++;v.gzhead.hcrc&&v.pending>f&&(n.adler=c(n.adler,v.pending_buf,v.pending-f,f)),v.gzindex===v.gzhead.extra.length&&(v.gzindex=0,v.status=73)}else v.status=73;if(v.status===73)if(v.gzhead.name){f=v.pending;do{if(v.pending===v.pending_buf_size&&(v.gzhead.hcrc&&v.pending>f&&(n.adler=c(n.adler,v.pending_buf,v.pending-f,f)),R(n),f=v.pending,v.pending===v.pending_buf_size)){S=1;break}S=v.gzindex<v.gzhead.name.length?255&v.gzhead.name.charCodeAt(v.gzindex++):0,Y(v,S)}while(S!==0);v.gzhead.hcrc&&v.pending>f&&(n.adler=c(n.adler,v.pending_buf,v.pending-f,f)),S===0&&(v.gzindex=0,v.status=91)}else v.status=91;if(v.status===91)if(v.gzhead.comment){f=v.pending;do{if(v.pending===v.pending_buf_size&&(v.gzhead.hcrc&&v.pending>f&&(n.adler=c(n.adler,v.pending_buf,v.pending-f,f)),R(n),f=v.pending,v.pending===v.pending_buf_size)){S=1;break}S=v.gzindex<v.gzhead.comment.length?255&v.gzhead.comment.charCodeAt(v.gzindex++):0,Y(v,S)}while(S!==0);v.gzhead.hcrc&&v.pending>f&&(n.adler=c(n.adler,v.pending_buf,v.pending-f,f)),S===0&&(v.status=103)}else v.status=103;if(v.status===103&&(v.gzhead.hcrc?(v.pending+2>v.pending_buf_size&&R(n),v.pending+2<=v.pending_buf_size&&(Y(v,255&n.adler),Y(v,n.adler>>8&255),n.adler=0,v.status=O)):v.status=O),v.pending!==0){if(R(n),n.avail_out===0)return v.last_flush=-1,p}else if(n.avail_in===0&&U(L)<=U(E)&&L!==y)return ee(n,-5);if(v.status===666&&n.avail_in!==0)return ee(n,-5);if(n.avail_in!==0||v.lookahead!==0||L!==w&&v.status!==666){var N=v.strategy===2?(function(C,q){for(var V;;){if(C.lookahead===0&&(se(C),C.lookahead===0)){if(q===w)return l;break}if(C.match_length=0,V=a._tr_tally(C,0,C.window[C.strstart]),C.lookahead--,C.strstart++,V&&(I(C,!1),C.strm.avail_out===0))return l}return C.insert=0,q===y?(I(C,!0),C.strm.avail_out===0?X:B):C.last_lit&&(I(C,!1),C.strm.avail_out===0)?l:A})(v,L):v.strategy===3?(function(C,q){for(var V,Z,Q,ne,re=C.window;;){if(C.lookahead<=W){if(se(C),C.lookahead<=W&&q===w)return l;if(C.lookahead===0)break}if(C.match_length=0,C.lookahead>=D&&0<C.strstart&&(Z=re[Q=C.strstart-1])===re[++Q]&&Z===re[++Q]&&Z===re[++Q]){ne=C.strstart+W;do;while(Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Q<ne);C.match_length=W-(ne-Q),C.match_length>C.lookahead&&(C.match_length=C.lookahead)}if(C.match_length>=D?(V=a._tr_tally(C,1,C.match_length-D),C.lookahead-=C.match_length,C.strstart+=C.match_length,C.match_length=0):(V=a._tr_tally(C,0,C.window[C.strstart]),C.lookahead--,C.strstart++),V&&(I(C,!1),C.strm.avail_out===0))return l}return C.insert=0,q===y?(I(C,!0),C.strm.avail_out===0?X:B):C.last_lit&&(I(C,!1),C.strm.avail_out===0)?l:A})(v,L):t[v.level].func(v,L);if(N!==X&&N!==B||(v.status=666),N===l||N===X)return n.avail_out===0&&(v.last_flush=-1),p;if(N===A&&(L===1?a._tr_align(v):L!==5&&(a._tr_stored_block(v,0,0,!1),L===3&&(J(v.head),v.lookahead===0&&(v.strstart=0,v.block_start=0,v.insert=0))),R(n),n.avail_out===0))return v.last_flush=-1,p}return L!==y?p:v.wrap<=0?1:(v.wrap===2?(Y(v,255&n.adler),Y(v,n.adler>>8&255),Y(v,n.adler>>16&255),Y(v,n.adler>>24&255),Y(v,255&n.total_in),Y(v,n.total_in>>8&255),Y(v,n.total_in>>16&255),Y(v,n.total_in>>24&255)):(H(v,n.adler>>>16),H(v,65535&n.adler)),R(n),0<v.wrap&&(v.wrap=-v.wrap),v.pending!==0?p:1)},i.deflateEnd=function(n){var L;return n&&n.state?(L=n.state.status)!==k&&L!==69&&L!==73&&L!==91&&L!==103&&L!==O&&L!==666?ee(n,b):(n.state=null,L===O?ee(n,-3):p):b},i.deflateSetDictionary=function(n,L){var E,v,f,S,P,N,C,q,V=L.length;if(!n||!n.state||(S=(E=n.state).wrap)===2||S===1&&E.status!==k||E.lookahead)return b;for(S===1&&(n.adler=s(n.adler,L,V,0)),E.wrap=0,V>=E.w_size&&(S===0&&(J(E.head),E.strstart=0,E.block_start=0,E.insert=0),q=new r.Buf8(E.w_size),r.arraySet(q,L,V-E.w_size,E.w_size,0),L=q,V=E.w_size),P=n.avail_in,N=n.next_in,C=n.input,n.avail_in=V,n.next_in=0,n.input=L,se(E);E.lookahead>=D;){for(v=E.strstart,f=E.lookahead-(D-1);E.ins_h=(E.ins_h<<E.hash_shift^E.window[v+D-1])&E.hash_mask,E.prev[v&E.w_mask]=E.head[E.ins_h],E.head[E.ins_h]=v,v++,--f;);E.strstart=v,E.lookahead=D-1,se(E)}return E.strstart+=E.lookahead,E.block_start=E.strstart,E.insert=E.lookahead,E.lookahead=0,E.match_length=E.prev_length=D-1,E.match_available=0,n.next_in=N,n.input=C,n.avail_in=P,E.wrap=S,p},i.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(u,e,i){"use strict";e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(u,e,i){"use strict";e.exports=function(t,r){var a,s,c,_,w,y,p,b,d,g,m,x,$,T,z,M,F,j,D,W,K,k,O,l,A;a=t.state,s=t.next_in,l=t.input,c=s+(t.avail_in-5),_=t.next_out,A=t.output,w=_-(r-t.avail_out),y=_+(t.avail_out-257),p=a.dmax,b=a.wsize,d=a.whave,g=a.wnext,m=a.window,x=a.hold,$=a.bits,T=a.lencode,z=a.distcode,M=(1<<a.lenbits)-1,F=(1<<a.distbits)-1;e:do{$<15&&(x+=l[s++]<<$,$+=8,x+=l[s++]<<$,$+=8),j=T[x&M];t:for(;;){if(x>>>=D=j>>>24,$-=D,(D=j>>>16&255)===0)A[_++]=65535&j;else{if(!(16&D)){if((64&D)==0){j=T[(65535&j)+(x&(1<<D)-1)];continue t}if(32&D){a.mode=12;break e}t.msg="invalid literal/length code",a.mode=30;break e}W=65535&j,(D&=15)&&($<D&&(x+=l[s++]<<$,$+=8),W+=x&(1<<D)-1,x>>>=D,$-=D),$<15&&(x+=l[s++]<<$,$+=8,x+=l[s++]<<$,$+=8),j=z[x&F];i:for(;;){if(x>>>=D=j>>>24,$-=D,!(16&(D=j>>>16&255))){if((64&D)==0){j=z[(65535&j)+(x&(1<<D)-1)];continue i}t.msg="invalid distance code",a.mode=30;break e}if(K=65535&j,$<(D&=15)&&(x+=l[s++]<<$,($+=8)<D&&(x+=l[s++]<<$,$+=8)),p<(K+=x&(1<<D)-1)){t.msg="invalid distance too far back",a.mode=30;break e}if(x>>>=D,$-=D,(D=_-w)<K){if(d<(D=K-D)&&a.sane){t.msg="invalid distance too far back",a.mode=30;break e}if(O=m,(k=0)===g){if(k+=b-D,D<W){for(W-=D;A[_++]=m[k++],--D;);k=_-K,O=A}}else if(g<D){if(k+=b+g-D,(D-=g)<W){for(W-=D;A[_++]=m[k++],--D;);if(k=0,g<W){for(W-=D=g;A[_++]=m[k++],--D;);k=_-K,O=A}}}else if(k+=g-D,D<W){for(W-=D;A[_++]=m[k++],--D;);k=_-K,O=A}for(;2<W;)A[_++]=O[k++],A[_++]=O[k++],A[_++]=O[k++],W-=3;W&&(A[_++]=O[k++],1<W&&(A[_++]=O[k++]))}else{for(k=_-K;A[_++]=A[k++],A[_++]=A[k++],A[_++]=A[k++],2<(W-=3););W&&(A[_++]=A[k++],1<W&&(A[_++]=A[k++]))}break}}break}}while(s<c&&_<y);s-=W=$>>3,x&=(1<<($-=W<<3))-1,t.next_in=s,t.next_out=_,t.avail_in=s<c?c-s+5:5-(s-c),t.avail_out=_<y?y-_+257:257-(_-y),a.hold=x,a.bits=$}},{}],49:[function(u,e,i){"use strict";var t=u("../utils/common"),r=u("./adler32"),a=u("./crc32"),s=u("./inffast"),c=u("./inftrees"),_=1,w=2,y=0,p=-2,b=1,d=852,g=592;function m(k){return(k>>>24&255)+(k>>>8&65280)+((65280&k)<<8)+((255&k)<<24)}function x(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new t.Buf16(320),this.work=new t.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function $(k){var O;return k&&k.state?(O=k.state,k.total_in=k.total_out=O.total=0,k.msg="",O.wrap&&(k.adler=1&O.wrap),O.mode=b,O.last=0,O.havedict=0,O.dmax=32768,O.head=null,O.hold=0,O.bits=0,O.lencode=O.lendyn=new t.Buf32(d),O.distcode=O.distdyn=new t.Buf32(g),O.sane=1,O.back=-1,y):p}function T(k){var O;return k&&k.state?((O=k.state).wsize=0,O.whave=0,O.wnext=0,$(k)):p}function z(k,O){var l,A;return k&&k.state?(A=k.state,O<0?(l=0,O=-O):(l=1+(O>>4),O<48&&(O&=15)),O&&(O<8||15<O)?p:(A.window!==null&&A.wbits!==O&&(A.window=null),A.wrap=l,A.wbits=O,T(k))):p}function M(k,O){var l,A;return k?(A=new x,(k.state=A).window=null,(l=z(k,O))!==y&&(k.state=null),l):p}var F,j,D=!0;function W(k){if(D){var O;for(F=new t.Buf32(512),j=new t.Buf32(32),O=0;O<144;)k.lens[O++]=8;for(;O<256;)k.lens[O++]=9;for(;O<280;)k.lens[O++]=7;for(;O<288;)k.lens[O++]=8;for(c(_,k.lens,0,288,F,0,k.work,{bits:9}),O=0;O<32;)k.lens[O++]=5;c(w,k.lens,0,32,j,0,k.work,{bits:5}),D=!1}k.lencode=F,k.lenbits=9,k.distcode=j,k.distbits=5}function K(k,O,l,A){var X,B=k.state;return B.window===null&&(B.wsize=1<<B.wbits,B.wnext=0,B.whave=0,B.window=new t.Buf8(B.wsize)),A>=B.wsize?(t.arraySet(B.window,O,l-B.wsize,B.wsize,0),B.wnext=0,B.whave=B.wsize):(A<(X=B.wsize-B.wnext)&&(X=A),t.arraySet(B.window,O,l-A,X,B.wnext),(A-=X)?(t.arraySet(B.window,O,l-A,A,0),B.wnext=A,B.whave=B.wsize):(B.wnext+=X,B.wnext===B.wsize&&(B.wnext=0),B.whave<B.wsize&&(B.whave+=X))),0}i.inflateReset=T,i.inflateReset2=z,i.inflateResetKeep=$,i.inflateInit=function(k){return M(k,15)},i.inflateInit2=M,i.inflate=function(k,O){var l,A,X,B,ee,U,J,R,I,Y,H,G,se,de,ie,ae,ce,oe,ge,fe,n,L,E,v,f=0,S=new t.Buf8(4),P=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!k||!k.state||!k.output||!k.input&&k.avail_in!==0)return p;(l=k.state).mode===12&&(l.mode=13),ee=k.next_out,X=k.output,J=k.avail_out,B=k.next_in,A=k.input,U=k.avail_in,R=l.hold,I=l.bits,Y=U,H=J,L=y;e:for(;;)switch(l.mode){case b:if(l.wrap===0){l.mode=13;break}for(;I<16;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(2&l.wrap&&R===35615){S[l.check=0]=255&R,S[1]=R>>>8&255,l.check=a(l.check,S,2,0),I=R=0,l.mode=2;break}if(l.flags=0,l.head&&(l.head.done=!1),!(1&l.wrap)||(((255&R)<<8)+(R>>8))%31){k.msg="incorrect header check",l.mode=30;break}if((15&R)!=8){k.msg="unknown compression method",l.mode=30;break}if(I-=4,n=8+(15&(R>>>=4)),l.wbits===0)l.wbits=n;else if(n>l.wbits){k.msg="invalid window size",l.mode=30;break}l.dmax=1<<n,k.adler=l.check=1,l.mode=512&R?10:12,I=R=0;break;case 2:for(;I<16;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(l.flags=R,(255&l.flags)!=8){k.msg="unknown compression method",l.mode=30;break}if(57344&l.flags){k.msg="unknown header flags set",l.mode=30;break}l.head&&(l.head.text=R>>8&1),512&l.flags&&(S[0]=255&R,S[1]=R>>>8&255,l.check=a(l.check,S,2,0)),I=R=0,l.mode=3;case 3:for(;I<32;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}l.head&&(l.head.time=R),512&l.flags&&(S[0]=255&R,S[1]=R>>>8&255,S[2]=R>>>16&255,S[3]=R>>>24&255,l.check=a(l.check,S,4,0)),I=R=0,l.mode=4;case 4:for(;I<16;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}l.head&&(l.head.xflags=255&R,l.head.os=R>>8),512&l.flags&&(S[0]=255&R,S[1]=R>>>8&255,l.check=a(l.check,S,2,0)),I=R=0,l.mode=5;case 5:if(1024&l.flags){for(;I<16;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}l.length=R,l.head&&(l.head.extra_len=R),512&l.flags&&(S[0]=255&R,S[1]=R>>>8&255,l.check=a(l.check,S,2,0)),I=R=0}else l.head&&(l.head.extra=null);l.mode=6;case 6:if(1024&l.flags&&(U<(G=l.length)&&(G=U),G&&(l.head&&(n=l.head.extra_len-l.length,l.head.extra||(l.head.extra=new Array(l.head.extra_len)),t.arraySet(l.head.extra,A,B,G,n)),512&l.flags&&(l.check=a(l.check,A,G,B)),U-=G,B+=G,l.length-=G),l.length))break e;l.length=0,l.mode=7;case 7:if(2048&l.flags){if(U===0)break e;for(G=0;n=A[B+G++],l.head&&n&&l.length<65536&&(l.head.name+=String.fromCharCode(n)),n&&G<U;);if(512&l.flags&&(l.check=a(l.check,A,G,B)),U-=G,B+=G,n)break e}else l.head&&(l.head.name=null);l.length=0,l.mode=8;case 8:if(4096&l.flags){if(U===0)break e;for(G=0;n=A[B+G++],l.head&&n&&l.length<65536&&(l.head.comment+=String.fromCharCode(n)),n&&G<U;);if(512&l.flags&&(l.check=a(l.check,A,G,B)),U-=G,B+=G,n)break e}else l.head&&(l.head.comment=null);l.mode=9;case 9:if(512&l.flags){for(;I<16;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(R!==(65535&l.check)){k.msg="header crc mismatch",l.mode=30;break}I=R=0}l.head&&(l.head.hcrc=l.flags>>9&1,l.head.done=!0),k.adler=l.check=0,l.mode=12;break;case 10:for(;I<32;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}k.adler=l.check=m(R),I=R=0,l.mode=11;case 11:if(l.havedict===0)return k.next_out=ee,k.avail_out=J,k.next_in=B,k.avail_in=U,l.hold=R,l.bits=I,2;k.adler=l.check=1,l.mode=12;case 12:if(O===5||O===6)break e;case 13:if(l.last){R>>>=7&I,I-=7&I,l.mode=27;break}for(;I<3;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}switch(l.last=1&R,I-=1,3&(R>>>=1)){case 0:l.mode=14;break;case 1:if(W(l),l.mode=20,O!==6)break;R>>>=2,I-=2;break e;case 2:l.mode=17;break;case 3:k.msg="invalid block type",l.mode=30}R>>>=2,I-=2;break;case 14:for(R>>>=7&I,I-=7&I;I<32;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if((65535&R)!=(R>>>16^65535)){k.msg="invalid stored block lengths",l.mode=30;break}if(l.length=65535&R,I=R=0,l.mode=15,O===6)break e;case 15:l.mode=16;case 16:if(G=l.length){if(U<G&&(G=U),J<G&&(G=J),G===0)break e;t.arraySet(X,A,B,G,ee),U-=G,B+=G,J-=G,ee+=G,l.length-=G;break}l.mode=12;break;case 17:for(;I<14;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(l.nlen=257+(31&R),R>>>=5,I-=5,l.ndist=1+(31&R),R>>>=5,I-=5,l.ncode=4+(15&R),R>>>=4,I-=4,286<l.nlen||30<l.ndist){k.msg="too many length or distance symbols",l.mode=30;break}l.have=0,l.mode=18;case 18:for(;l.have<l.ncode;){for(;I<3;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}l.lens[P[l.have++]]=7&R,R>>>=3,I-=3}for(;l.have<19;)l.lens[P[l.have++]]=0;if(l.lencode=l.lendyn,l.lenbits=7,E={bits:l.lenbits},L=c(0,l.lens,0,19,l.lencode,0,l.work,E),l.lenbits=E.bits,L){k.msg="invalid code lengths set",l.mode=30;break}l.have=0,l.mode=19;case 19:for(;l.have<l.nlen+l.ndist;){for(;ae=(f=l.lencode[R&(1<<l.lenbits)-1])>>>16&255,ce=65535&f,!((ie=f>>>24)<=I);){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(ce<16)R>>>=ie,I-=ie,l.lens[l.have++]=ce;else{if(ce===16){for(v=ie+2;I<v;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(R>>>=ie,I-=ie,l.have===0){k.msg="invalid bit length repeat",l.mode=30;break}n=l.lens[l.have-1],G=3+(3&R),R>>>=2,I-=2}else if(ce===17){for(v=ie+3;I<v;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}I-=ie,n=0,G=3+(7&(R>>>=ie)),R>>>=3,I-=3}else{for(v=ie+7;I<v;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}I-=ie,n=0,G=11+(127&(R>>>=ie)),R>>>=7,I-=7}if(l.have+G>l.nlen+l.ndist){k.msg="invalid bit length repeat",l.mode=30;break}for(;G--;)l.lens[l.have++]=n}}if(l.mode===30)break;if(l.lens[256]===0){k.msg="invalid code -- missing end-of-block",l.mode=30;break}if(l.lenbits=9,E={bits:l.lenbits},L=c(_,l.lens,0,l.nlen,l.lencode,0,l.work,E),l.lenbits=E.bits,L){k.msg="invalid literal/lengths set",l.mode=30;break}if(l.distbits=6,l.distcode=l.distdyn,E={bits:l.distbits},L=c(w,l.lens,l.nlen,l.ndist,l.distcode,0,l.work,E),l.distbits=E.bits,L){k.msg="invalid distances set",l.mode=30;break}if(l.mode=20,O===6)break e;case 20:l.mode=21;case 21:if(6<=U&&258<=J){k.next_out=ee,k.avail_out=J,k.next_in=B,k.avail_in=U,l.hold=R,l.bits=I,s(k,H),ee=k.next_out,X=k.output,J=k.avail_out,B=k.next_in,A=k.input,U=k.avail_in,R=l.hold,I=l.bits,l.mode===12&&(l.back=-1);break}for(l.back=0;ae=(f=l.lencode[R&(1<<l.lenbits)-1])>>>16&255,ce=65535&f,!((ie=f>>>24)<=I);){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(ae&&(240&ae)==0){for(oe=ie,ge=ae,fe=ce;ae=(f=l.lencode[fe+((R&(1<<oe+ge)-1)>>oe)])>>>16&255,ce=65535&f,!(oe+(ie=f>>>24)<=I);){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}R>>>=oe,I-=oe,l.back+=oe}if(R>>>=ie,I-=ie,l.back+=ie,l.length=ce,ae===0){l.mode=26;break}if(32&ae){l.back=-1,l.mode=12;break}if(64&ae){k.msg="invalid literal/length code",l.mode=30;break}l.extra=15&ae,l.mode=22;case 22:if(l.extra){for(v=l.extra;I<v;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}l.length+=R&(1<<l.extra)-1,R>>>=l.extra,I-=l.extra,l.back+=l.extra}l.was=l.length,l.mode=23;case 23:for(;ae=(f=l.distcode[R&(1<<l.distbits)-1])>>>16&255,ce=65535&f,!((ie=f>>>24)<=I);){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if((240&ae)==0){for(oe=ie,ge=ae,fe=ce;ae=(f=l.distcode[fe+((R&(1<<oe+ge)-1)>>oe)])>>>16&255,ce=65535&f,!(oe+(ie=f>>>24)<=I);){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}R>>>=oe,I-=oe,l.back+=oe}if(R>>>=ie,I-=ie,l.back+=ie,64&ae){k.msg="invalid distance code",l.mode=30;break}l.offset=ce,l.extra=15&ae,l.mode=24;case 24:if(l.extra){for(v=l.extra;I<v;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}l.offset+=R&(1<<l.extra)-1,R>>>=l.extra,I-=l.extra,l.back+=l.extra}if(l.offset>l.dmax){k.msg="invalid distance too far back",l.mode=30;break}l.mode=25;case 25:if(J===0)break e;if(G=H-J,l.offset>G){if((G=l.offset-G)>l.whave&&l.sane){k.msg="invalid distance too far back",l.mode=30;break}se=G>l.wnext?(G-=l.wnext,l.wsize-G):l.wnext-G,G>l.length&&(G=l.length),de=l.window}else de=X,se=ee-l.offset,G=l.length;for(J<G&&(G=J),J-=G,l.length-=G;X[ee++]=de[se++],--G;);l.length===0&&(l.mode=21);break;case 26:if(J===0)break e;X[ee++]=l.length,J--,l.mode=21;break;case 27:if(l.wrap){for(;I<32;){if(U===0)break e;U--,R|=A[B++]<<I,I+=8}if(H-=J,k.total_out+=H,l.total+=H,H&&(k.adler=l.check=l.flags?a(l.check,X,H,ee-H):r(l.check,X,H,ee-H)),H=J,(l.flags?R:m(R))!==l.check){k.msg="incorrect data check",l.mode=30;break}I=R=0}l.mode=28;case 28:if(l.wrap&&l.flags){for(;I<32;){if(U===0)break e;U--,R+=A[B++]<<I,I+=8}if(R!==(4294967295&l.total)){k.msg="incorrect length check",l.mode=30;break}I=R=0}l.mode=29;case 29:L=1;break e;case 30:L=-3;break e;case 31:return-4;case 32:default:return p}return k.next_out=ee,k.avail_out=J,k.next_in=B,k.avail_in=U,l.hold=R,l.bits=I,(l.wsize||H!==k.avail_out&&l.mode<30&&(l.mode<27||O!==4))&&K(k,k.output,k.next_out,H-k.avail_out)?(l.mode=31,-4):(Y-=k.avail_in,H-=k.avail_out,k.total_in+=Y,k.total_out+=H,l.total+=H,l.wrap&&H&&(k.adler=l.check=l.flags?a(l.check,X,H,k.next_out-H):r(l.check,X,H,k.next_out-H)),k.data_type=l.bits+(l.last?64:0)+(l.mode===12?128:0)+(l.mode===20||l.mode===15?256:0),(Y==0&&H===0||O===4)&&L===y&&(L=-5),L)},i.inflateEnd=function(k){if(!k||!k.state)return p;var O=k.state;return O.window&&(O.window=null),k.state=null,y},i.inflateGetHeader=function(k,O){var l;return k&&k.state?(2&(l=k.state).wrap)==0?p:((l.head=O).done=!1,y):p},i.inflateSetDictionary=function(k,O){var l,A=O.length;return k&&k.state?(l=k.state).wrap!==0&&l.mode!==11?p:l.mode===11&&r(1,O,A,0)!==l.check?-3:K(k,O,A,A)?(l.mode=31,-4):(l.havedict=1,y):p},i.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(u,e,i){"use strict";var t=u("../utils/common"),r=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],a=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],c=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(_,w,y,p,b,d,g,m){var x,$,T,z,M,F,j,D,W,K=m.bits,k=0,O=0,l=0,A=0,X=0,B=0,ee=0,U=0,J=0,R=0,I=null,Y=0,H=new t.Buf16(16),G=new t.Buf16(16),se=null,de=0;for(k=0;k<=15;k++)H[k]=0;for(O=0;O<p;O++)H[w[y+O]]++;for(X=K,A=15;1<=A&&H[A]===0;A--);if(A<X&&(X=A),A===0)return b[d++]=20971520,b[d++]=20971520,m.bits=1,0;for(l=1;l<A&&H[l]===0;l++);for(X<l&&(X=l),k=U=1;k<=15;k++)if(U<<=1,(U-=H[k])<0)return-1;if(0<U&&(_===0||A!==1))return-1;for(G[1]=0,k=1;k<15;k++)G[k+1]=G[k]+H[k];for(O=0;O<p;O++)w[y+O]!==0&&(g[G[w[y+O]]++]=O);if(F=_===0?(I=se=g,19):_===1?(I=r,Y-=257,se=a,de-=257,256):(I=s,se=c,-1),k=l,M=d,ee=O=R=0,T=-1,z=(J=1<<(B=X))-1,_===1&&852<J||_===2&&592<J)return 1;for(;;){for(j=k-ee,W=g[O]<F?(D=0,g[O]):g[O]>F?(D=se[de+g[O]],I[Y+g[O]]):(D=96,0),x=1<<k-ee,l=$=1<<B;b[M+(R>>ee)+($-=x)]=j<<24|D<<16|W|0,$!==0;);for(x=1<<k-1;R&x;)x>>=1;if(x!==0?(R&=x-1,R+=x):R=0,O++,--H[k]==0){if(k===A)break;k=w[y+g[O]]}if(X<k&&(R&z)!==T){for(ee===0&&(ee=X),M+=l,U=1<<(B=k-ee);B+ee<A&&!((U-=H[B+ee])<=0);)B++,U<<=1;if(J+=1<<B,_===1&&852<J||_===2&&592<J)return 1;b[T=R&z]=X<<24|B<<16|M-d|0}}return R!==0&&(b[M+R]=k-ee<<24|64<<16|0),m.bits=X,0}},{"../utils/common":41}],51:[function(u,e,i){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(u,e,i){"use strict";var t=u("../utils/common"),r=0,a=1;function s(f){for(var S=f.length;0<=--S;)f[S]=0}var c=0,_=29,w=256,y=w+1+_,p=30,b=19,d=2*y+1,g=15,m=16,x=7,$=256,T=16,z=17,M=18,F=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],j=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],D=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],W=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],K=new Array(2*(y+2));s(K);var k=new Array(2*p);s(k);var O=new Array(512);s(O);var l=new Array(256);s(l);var A=new Array(_);s(A);var X,B,ee,U=new Array(p);function J(f,S,P,N,C){this.static_tree=f,this.extra_bits=S,this.extra_base=P,this.elems=N,this.max_length=C,this.has_stree=f&&f.length}function R(f,S){this.dyn_tree=f,this.max_code=0,this.stat_desc=S}function I(f){return f<256?O[f]:O[256+(f>>>7)]}function Y(f,S){f.pending_buf[f.pending++]=255&S,f.pending_buf[f.pending++]=S>>>8&255}function H(f,S,P){f.bi_valid>m-P?(f.bi_buf|=S<<f.bi_valid&65535,Y(f,f.bi_buf),f.bi_buf=S>>m-f.bi_valid,f.bi_valid+=P-m):(f.bi_buf|=S<<f.bi_valid&65535,f.bi_valid+=P)}function G(f,S,P){H(f,P[2*S],P[2*S+1])}function se(f,S){for(var P=0;P|=1&f,f>>>=1,P<<=1,0<--S;);return P>>>1}function de(f,S,P){var N,C,q=new Array(g+1),V=0;for(N=1;N<=g;N++)q[N]=V=V+P[N-1]<<1;for(C=0;C<=S;C++){var Z=f[2*C+1];Z!==0&&(f[2*C]=se(q[Z]++,Z))}}function ie(f){var S;for(S=0;S<y;S++)f.dyn_ltree[2*S]=0;for(S=0;S<p;S++)f.dyn_dtree[2*S]=0;for(S=0;S<b;S++)f.bl_tree[2*S]=0;f.dyn_ltree[2*$]=1,f.opt_len=f.static_len=0,f.last_lit=f.matches=0}function ae(f){8<f.bi_valid?Y(f,f.bi_buf):0<f.bi_valid&&(f.pending_buf[f.pending++]=f.bi_buf),f.bi_buf=0,f.bi_valid=0}function ce(f,S,P,N){var C=2*S,q=2*P;return f[C]<f[q]||f[C]===f[q]&&N[S]<=N[P]}function oe(f,S,P){for(var N=f.heap[P],C=P<<1;C<=f.heap_len&&(C<f.heap_len&&ce(S,f.heap[C+1],f.heap[C],f.depth)&&C++,!ce(S,N,f.heap[C],f.depth));)f.heap[P]=f.heap[C],P=C,C<<=1;f.heap[P]=N}function ge(f,S,P){var N,C,q,V,Z=0;if(f.last_lit!==0)for(;N=f.pending_buf[f.d_buf+2*Z]<<8|f.pending_buf[f.d_buf+2*Z+1],C=f.pending_buf[f.l_buf+Z],Z++,N===0?G(f,C,S):(G(f,(q=l[C])+w+1,S),(V=F[q])!==0&&H(f,C-=A[q],V),G(f,q=I(--N),P),(V=j[q])!==0&&H(f,N-=U[q],V)),Z<f.last_lit;);G(f,$,S)}function fe(f,S){var P,N,C,q=S.dyn_tree,V=S.stat_desc.static_tree,Z=S.stat_desc.has_stree,Q=S.stat_desc.elems,ne=-1;for(f.heap_len=0,f.heap_max=d,P=0;P<Q;P++)q[2*P]!==0?(f.heap[++f.heap_len]=ne=P,f.depth[P]=0):q[2*P+1]=0;for(;f.heap_len<2;)q[2*(C=f.heap[++f.heap_len]=ne<2?++ne:0)]=1,f.depth[C]=0,f.opt_len--,Z&&(f.static_len-=V[2*C+1]);for(S.max_code=ne,P=f.heap_len>>1;1<=P;P--)oe(f,q,P);for(C=Q;P=f.heap[1],f.heap[1]=f.heap[f.heap_len--],oe(f,q,1),N=f.heap[1],f.heap[--f.heap_max]=P,f.heap[--f.heap_max]=N,q[2*C]=q[2*P]+q[2*N],f.depth[C]=(f.depth[P]>=f.depth[N]?f.depth[P]:f.depth[N])+1,q[2*P+1]=q[2*N+1]=C,f.heap[1]=C++,oe(f,q,1),2<=f.heap_len;);f.heap[--f.heap_max]=f.heap[1],(function(re,me){var ke,be,$e,le,De,Ue,ve=me.dyn_tree,at=me.max_code,It=me.stat_desc.static_tree,At=me.stat_desc.has_stree,Rt=me.stat_desc.extra_bits,nt=me.stat_desc.extra_base,Se=me.stat_desc.max_length,Fe=0;for(le=0;le<=g;le++)re.bl_count[le]=0;for(ve[2*re.heap[re.heap_max]+1]=0,ke=re.heap_max+1;ke<d;ke++)Se<(le=ve[2*ve[2*(be=re.heap[ke])+1]+1]+1)&&(le=Se,Fe++),ve[2*be+1]=le,at<be||(re.bl_count[le]++,De=0,nt<=be&&(De=Rt[be-nt]),Ue=ve[2*be],re.opt_len+=Ue*(le+De),At&&(re.static_len+=Ue*(It[2*be+1]+De)));if(Fe!==0){do{for(le=Se-1;re.bl_count[le]===0;)le--;re.bl_count[le]--,re.bl_count[le+1]+=2,re.bl_count[Se]--,Fe-=2}while(0<Fe);for(le=Se;le!==0;le--)for(be=re.bl_count[le];be!==0;)at<($e=re.heap[--ke])||(ve[2*$e+1]!==le&&(re.opt_len+=(le-ve[2*$e+1])*ve[2*$e],ve[2*$e+1]=le),be--)}})(f,S),de(q,ne,f.bl_count)}function n(f,S,P){var N,C,q=-1,V=S[1],Z=0,Q=7,ne=4;for(V===0&&(Q=138,ne=3),S[2*(P+1)+1]=65535,N=0;N<=P;N++)C=V,V=S[2*(N+1)+1],++Z<Q&&C===V||(Z<ne?f.bl_tree[2*C]+=Z:C!==0?(C!==q&&f.bl_tree[2*C]++,f.bl_tree[2*T]++):Z<=10?f.bl_tree[2*z]++:f.bl_tree[2*M]++,q=C,ne=(Z=0)===V?(Q=138,3):C===V?(Q=6,3):(Q=7,4))}function L(f,S,P){var N,C,q=-1,V=S[1],Z=0,Q=7,ne=4;for(V===0&&(Q=138,ne=3),N=0;N<=P;N++)if(C=V,V=S[2*(N+1)+1],!(++Z<Q&&C===V)){if(Z<ne)for(;G(f,C,f.bl_tree),--Z!=0;);else C!==0?(C!==q&&(G(f,C,f.bl_tree),Z--),G(f,T,f.bl_tree),H(f,Z-3,2)):Z<=10?(G(f,z,f.bl_tree),H(f,Z-3,3)):(G(f,M,f.bl_tree),H(f,Z-11,7));q=C,ne=(Z=0)===V?(Q=138,3):C===V?(Q=6,3):(Q=7,4)}}s(U);var E=!1;function v(f,S,P,N){H(f,(c<<1)+(N?1:0),3),(function(C,q,V,Z){ae(C),Z&&(Y(C,V),Y(C,~V)),t.arraySet(C.pending_buf,C.window,q,V,C.pending),C.pending+=V})(f,S,P,!0)}i._tr_init=function(f){E||((function(){var S,P,N,C,q,V=new Array(g+1);for(C=N=0;C<_-1;C++)for(A[C]=N,S=0;S<1<<F[C];S++)l[N++]=C;for(l[N-1]=C,C=q=0;C<16;C++)for(U[C]=q,S=0;S<1<<j[C];S++)O[q++]=C;for(q>>=7;C<p;C++)for(U[C]=q<<7,S=0;S<1<<j[C]-7;S++)O[256+q++]=C;for(P=0;P<=g;P++)V[P]=0;for(S=0;S<=143;)K[2*S+1]=8,S++,V[8]++;for(;S<=255;)K[2*S+1]=9,S++,V[9]++;for(;S<=279;)K[2*S+1]=7,S++,V[7]++;for(;S<=287;)K[2*S+1]=8,S++,V[8]++;for(de(K,y+1,V),S=0;S<p;S++)k[2*S+1]=5,k[2*S]=se(S,5);X=new J(K,F,w+1,y,g),B=new J(k,j,0,p,g),ee=new J(new Array(0),D,0,b,x)})(),E=!0),f.l_desc=new R(f.dyn_ltree,X),f.d_desc=new R(f.dyn_dtree,B),f.bl_desc=new R(f.bl_tree,ee),f.bi_buf=0,f.bi_valid=0,ie(f)},i._tr_stored_block=v,i._tr_flush_block=function(f,S,P,N){var C,q,V=0;0<f.level?(f.strm.data_type===2&&(f.strm.data_type=(function(Z){var Q,ne=4093624447;for(Q=0;Q<=31;Q++,ne>>>=1)if(1&ne&&Z.dyn_ltree[2*Q]!==0)return r;if(Z.dyn_ltree[18]!==0||Z.dyn_ltree[20]!==0||Z.dyn_ltree[26]!==0)return a;for(Q=32;Q<w;Q++)if(Z.dyn_ltree[2*Q]!==0)return a;return r})(f)),fe(f,f.l_desc),fe(f,f.d_desc),V=(function(Z){var Q;for(n(Z,Z.dyn_ltree,Z.l_desc.max_code),n(Z,Z.dyn_dtree,Z.d_desc.max_code),fe(Z,Z.bl_desc),Q=b-1;3<=Q&&Z.bl_tree[2*W[Q]+1]===0;Q--);return Z.opt_len+=3*(Q+1)+5+5+4,Q})(f),C=f.opt_len+3+7>>>3,(q=f.static_len+3+7>>>3)<=C&&(C=q)):C=q=P+5,P+4<=C&&S!==-1?v(f,S,P,N):f.strategy===4||q===C?(H(f,2+(N?1:0),3),ge(f,K,k)):(H(f,4+(N?1:0),3),(function(Z,Q,ne,re){var me;for(H(Z,Q-257,5),H(Z,ne-1,5),H(Z,re-4,4),me=0;me<re;me++)H(Z,Z.bl_tree[2*W[me]+1],3);L(Z,Z.dyn_ltree,Q-1),L(Z,Z.dyn_dtree,ne-1)})(f,f.l_desc.max_code+1,f.d_desc.max_code+1,V+1),ge(f,f.dyn_ltree,f.dyn_dtree)),ie(f),N&&ae(f)},i._tr_tally=function(f,S,P){return f.pending_buf[f.d_buf+2*f.last_lit]=S>>>8&255,f.pending_buf[f.d_buf+2*f.last_lit+1]=255&S,f.pending_buf[f.l_buf+f.last_lit]=255&P,f.last_lit++,S===0?f.dyn_ltree[2*P]++:(f.matches++,S--,f.dyn_ltree[2*(l[P]+w+1)]++,f.dyn_dtree[2*I(S)]++),f.last_lit===f.lit_bufsize-1},i._tr_align=function(f){H(f,2,3),G(f,$,K),(function(S){S.bi_valid===16?(Y(S,S.bi_buf),S.bi_buf=0,S.bi_valid=0):8<=S.bi_valid&&(S.pending_buf[S.pending++]=255&S.bi_buf,S.bi_buf>>=8,S.bi_valid-=8)})(f)}},{"../utils/common":41}],53:[function(u,e,i){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(u,e,i){(function(t){(function(r,a){"use strict";if(!r.setImmediate){var s,c,_,w,y=1,p={},b=!1,d=r.document,g=Object.getPrototypeOf&&Object.getPrototypeOf(r);g=g&&g.setTimeout?g:r,s={}.toString.call(r.process)==="[object process]"?function(T){process.nextTick(function(){x(T)})}:(function(){if(r.postMessage&&!r.importScripts){var T=!0,z=r.onmessage;return r.onmessage=function(){T=!1},r.postMessage("","*"),r.onmessage=z,T}})()?(w="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",$,!1):r.attachEvent("onmessage",$),function(T){r.postMessage(w+T,"*")}):r.MessageChannel?((_=new MessageChannel).port1.onmessage=function(T){x(T.data)},function(T){_.port2.postMessage(T)}):d&&"onreadystatechange"in d.createElement("script")?(c=d.documentElement,function(T){var z=d.createElement("script");z.onreadystatechange=function(){x(T),z.onreadystatechange=null,c.removeChild(z),z=null},c.appendChild(z)}):function(T){setTimeout(x,0,T)},g.setImmediate=function(T){typeof T!="function"&&(T=new Function(""+T));for(var z=new Array(arguments.length-1),M=0;M<z.length;M++)z[M]=arguments[M+1];var F={callback:T,args:z};return p[y]=F,s(y),y++},g.clearImmediate=m}function m(T){delete p[T]}function x(T){if(b)setTimeout(x,0,T);else{var z=p[T];if(z){b=!0;try{(function(M){var F=M.callback,j=M.args;switch(j.length){case 0:F();break;case 1:F(j[0]);break;case 2:F(j[0],j[1]);break;case 3:F(j[0],j[1],j[2]);break;default:F.apply(a,j)}})(z)}finally{m(T),b=!1}}}}function $(T){T.source===r&&typeof T.data=="string"&&T.data.indexOf(w)===0&&x(+T.data.slice(w.length))}})(typeof self>"u"?t===void 0?this:t:self)}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})});var Oe=class{constructor(e){this.hass=e}subscribe(e){return this.hass.connection.subscribeMessage(e,{type:"recipe_manager/subscribe"})}async getAllRecipes(){return this.hass.callWS({type:"recipe_manager/recipes/get_all"})}async getRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/get",recipe_id:e})}async scrapeRecipe(e,i=!1){return this.hass.callWS({type:"recipe_manager/recipes/scrape",url:e,enabled:i})}async addRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/add",...e})}async updateRecipe(e,i){return this.hass.callWS({type:"recipe_manager/recipes/update",recipe_id:e,...i})}async deleteRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/delete",recipe_id:e})}async toggleFavourite(e){return this.hass.callWS({type:"recipe_manager/recipes/toggle_favourite",recipe_id:e})}async downloadRecipeImage(e,i){if(!window.confirm("Allow MacroMate to download and privately normalize this remote image?"))throw{code:"invalid_request"};return this.hass.callWS({type:"recipe_manager/recipes/download_image",recipe_id:e,image_url:i,enabled:!0})}async getTags(){return this.hass.callWS({type:"recipe_manager/tags/get_all"})}async getMealPlan(e){let i={type:"recipe_manager/meal_plan/get"};return e&&(i.week_start=e),this.hass.callWS(i)}async addToMealPlan(e,i,t,r=1,a=null){let s={type:"recipe_manager/meal_plan/add",recipe_id:e,date:i,meal_type:t,servings:r};return a&&(s.notes=a),this.hass.callWS(s)}async removeFromMealPlan(e){return this.hass.callWS({type:"recipe_manager/meal_plan/remove",entry_id:e})}async clearMealPlanWeek(e){return this.hass.callWS({type:"recipe_manager/meal_plan/clear",week_start:e,confirm:!0})}async getGlobalTimers(){return this.hass.callWS({type:"recipe_manager/global_timers/get"})}async addGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/add",...e})}async updateGlobalTimer(e,i){return this.hass.callWS({type:"recipe_manager/global_timers/update",timer_id:e,...i})}async deleteGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/delete",timer_id:e})}async importRecipeKeeper(e){return this.hass.callWS({type:"recipe_manager/import/recipe_keeper",html_content:e})}async uploadRecipeImage(e,i){return this.hass.callWS({type:"recipe_manager/recipes/upload_image",recipe_id:e,image_data:i})}};var Le=(u,e)=>`macromate:ui:${u.context.user}:${e}`;function ot(u,e){try{let i=u.getItem(e);return i&&i.length<=131072?JSON.parse(i):null}catch{return null}}function lt(u){if(!u.current()||!u.context.admin)return{};let e=ot(sessionStorage,Le(u,"view"))||{},i=ot(localStorage,Le(u,"timers")),t=Date.now();return{view:typeof e.view=="string"?e.view:null,recipeId:typeof e.recipeId=="string"?e.recipeId:null,recentIds:Array.isArray(e.recentIds)?e.recentIds.filter(r=>typeof r=="string"&&r.length<=128).slice(0,200):[],timers:Array.isArray(i)?i.slice(0,100).filter(r=>r&&typeof r.id=="string"&&typeof r.label=="string"&&r.label.length<=300&&Number.isFinite(r.total)&&r.total>0&&r.total<=604800&&Number.isFinite(r.remaining)&&Number.isFinite(r.savedAt)).map(r=>({id:r.id,label:r.label,total:r.total,remaining:Math.max(0,r.remaining-(r.running?Math.max(0,Math.floor((t-r.savedAt)/1e3)):0)),running:r.running===!0,presetId:r.presetId||null})).filter(r=>r.remaining>0):[]}}function ct(u,e,i){if(!(!u?.current()||!u.context.admin))try{sessionStorage.setItem(Le(u,"view"),JSON.stringify(e)),localStorage.setItem(Le(u,"timers"),JSON.stringify(i.filter(t=>!t.global).slice(0,100).map(t=>({id:t.id,label:t.label,total:t.total,remaining:t.remaining,running:t.running===!0,presetId:t.presetId||null,savedAt:Date.now()}))))}catch{}}var Me=Object.freeze({theme:"glass-wave",darkMode:"system",fontSize:"medium",columns:3,showFavourites:!0,showPlanner:!0,recentCount:12,timerSound:"beep",keepScreenOn:!1,keepScreenOnMins:30,showUnitConversion:!1,language:"en",unitSystem:"imperial"});function _e(u={}){let e=u&&typeof u=="object"&&!Array.isArray(u)?u:{};return{...Me,...e,theme:"glass-wave",darkMode:["off","system","on"].includes(e.darkMode)?e.darkMode:Me.darkMode,fontSize:["small","medium","large"].includes(e.fontSize)?e.fontSize:Me.fontSize,columns:[2,3,4,5,8,10].includes(e.columns)?e.columns:Me.columns}}var Ft={"--rm-font-family":'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',"--rm-font-size-sm":"calc(var(--rm-font-size-base) * 0.875)","--rm-font-size-xs":"max(12px, calc(var(--rm-font-size-base) * 0.8125))","--rm-line-height":"1.55","--rm-touch-target":"44px","--rm-radius":"18px","--rm-radius-sm":"12px","--rm-radius-lg":"24px","--rm-space-1":"4px","--rm-space-2":"8px","--rm-space-3":"12px","--rm-space-4":"16px","--rm-space-5":"24px","--rm-space-6":"32px","--rm-disabled-opacity":"1"},Ot=Object.freeze({light:Object.freeze({"--rm-bg-canvas":"#e9efed","--rm-bg-main":"#f7f4ed","--rm-bg-surface":"rgba(255, 252, 246, 0.96)","--rm-bg-elevated":"#fffdf8","--rm-dialog-bg":"#fffdf8","--rm-text":"#233b47","--rm-text-secondary":"#4c626c","--rm-text-muted":"#536873","--rm-accent":"#326382","--rm-primary":"#326382","--rm-accent-text":"#ffffff","--rm-accent-soft":"#e2edf1","--rm-border":"#c6d1d0","--rm-border-subtle":"#dce3df","--rm-border-strong":"#738991","--rm-focus":"#326382","--rm-success":"#2e664a","--rm-success-soft":"#e2eee5","--rm-success-text":"#ffffff","--rm-warning":"#765500","--rm-warning-soft":"#f4ebd0","--rm-warning-text":"#ffffff","--rm-danger":"#9b3e2f","--rm-danger-soft":"#f7e6df","--rm-danger-text":"#ffffff","--rm-error":"#9b3e2f","--rm-error-soft":"#f7e6df","--rm-error-text":"#ffffff","--rm-disabled-bg":"#e4e6e0","--rm-disabled-text":"#536873","--rm-shadow":"0 8px 28px rgba(35, 59, 71, 0.08)","--rm-glass-highlight":"rgba(255, 255, 255, 0.7)"}),dark:Object.freeze({"--rm-bg-canvas":"#101e25","--rm-bg-main":"#14262f","--rm-bg-surface":"rgba(28, 49, 60, 0.97)","--rm-bg-elevated":"#213c48","--rm-dialog-bg":"#213c48","--rm-text":"#f1f5f3","--rm-text-secondary":"#c0d0d6","--rm-text-muted":"#b3c7d0","--rm-accent":"#9ccce2","--rm-primary":"#9ccce2","--rm-accent-text":"#163442","--rm-accent-soft":"#294957","--rm-border":"#43616d","--rm-border-subtle":"#304d59","--rm-border-strong":"#7e9aa7","--rm-focus":"#b6e1ef","--rm-success":"#a6d9b7","--rm-success-soft":"#244837","--rm-success-text":"#173524","--rm-warning":"#ecd28d","--rm-warning-soft":"#494021","--rm-warning-text":"#382b0e","--rm-danger":"#ffb9a7","--rm-danger-soft":"#55352f","--rm-danger-text":"#47251d","--rm-error":"#ffb9a7","--rm-error-soft":"#55352f","--rm-error-text":"#47251d","--rm-disabled-bg":"#2a414b","--rm-disabled-text":"#b3c7d0","--rm-shadow":"0 8px 28px rgba(0, 0, 0, 0.22)","--rm-glass-highlight":"rgba(216, 239, 245, 0.06)"})});function Lt(u={},e=!1){let i=_e(u),t=i.darkMode==="on"||i.darkMode==="system"&&e;return{...Ft,...Ot[t?"dark":"light"],"--rm-font-size-base":{small:"14px",medium:"16px",large:"18px"}[i.fontSize],"--rm-grid-columns":`repeat(${i.columns}, minmax(0, 1fr))`}}function dt(u,e={},i=!1){let t=_e(e),r=t.darkMode==="on"||t.darkMode==="system"&&i?"dark":"light";for(let[a,s]of Object.entries(Lt(t,i)))u.style.setProperty(a,s);u.toggleAttribute("glass-wave",!0),u.setAttribute("data-appearance",r),u.style.colorScheme=r}var pt=["de","es","fr","it","nl","pt"],Pe=["de","en","es","fr","it","nl","pt"];var{getLocale:Mt,setLocale:Pt}=st({sourceLocale:"en",targetLocales:pt,loadLocale:u=>({de:()=>import("./chunks/de-EHQ56H34.js"),es:()=>import("./chunks/es-54MLVVJR.js"),fr:()=>import("./chunks/fr-GPRE472V.js"),it:()=>import("./chunks/it-J7OBEZFG.js"),nl:()=>import("./chunks/nl-XCF57UHI.js"),pt:()=>import("./chunks/pt-RNXHHZAN.js")})[u]()});async function Te(u){let e=Pe.includes(u)?u:"en";e!==Mt()&&await Pt(e)}var Ie=new Set,We=new Set,we=null,Ce=null;function xe(){return typeof navigator<"u"&&"wakeLock"in navigator}function qe(){let u=!!we;We.forEach(e=>e(u))}async function ut(){if(Ce)return Ce;if(!(!xe()||we)&&!(typeof document<"u"&&document.visibilityState!=="visible"))return Ce=(async()=>{try{let u=await navigator.wakeLock.request("screen");if(!Ie.size||document.visibilityState!=="visible"){await u.release();return}we=u,we.addEventListener("release",()=>{we=null,qe()}),qe()}catch(u){console.warn("[RM] Wake Lock request failed:",u)}finally{Ce=null}})(),Ce}async function Nt(){if(we){try{await we.release()}catch{}we=null,qe()}}async function mt(){Ie.size>0?await ut():await Nt()}typeof document<"u"&&document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&Ie.size>0&&ut()});async function Ne(u){Ie.add(u),await mt()}async function Ae(u){Ie.delete(u),await mt()}function ft(u){return We.add(u),()=>We.delete(u)}var ue=pe`
  :host {
    min-width: 0;
    min-height: 0;
    color: var(--rm-text, #243c42);
    color-scheme: inherit;
    font-family: var(
      --rm-font-family,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif
    );
    font-size: var(--rm-font-size-base, 15px);
    line-height: var(--rm-line-height, 1.55);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
    line-height: 1.4;
    letter-spacing: inherit;
  }

  input,
  select,
  textarea {
    min-width: 0;
    max-width: 100%;
    accent-color: var(--rm-accent, #315d75);
    color-scheme: inherit;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--rm-text-secondary, #506770);
    opacity: 1;
  }

  select option {
    color: var(--rm-text, #243c42);
    background: var(--rm-dialog-bg, #f3f7f8);
  }

  :host :is(button, a, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid var(--rm-focus, var(--rm-accent, #315d75));
    outline-offset: 2px;
  }

  :host button:disabled {
    color: var(--rm-disabled-text, var(--rm-text-secondary, #506770));
    background: var(--rm-disabled-bg, var(--rm-bg-elevated, #e4ecef));
    opacity: 1;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;var Ze=class extends he{static properties={recipes:{type:Array},allRecipes:{type:Array},tags:{type:Array},searchQuery:{type:String},activeTag:{type:String},columns:{type:Number},showFavourites:{type:Boolean},hideSidebar:{type:Boolean},scrollPos:{type:Number},recentRecipes:{type:Array},recentCount:{type:Number},_filterMode:{type:String},_starFilter:{type:Number},_sortByRating:{type:Boolean},_showRatingMenu:{type:Boolean},_selectedCourses:{type:Object},_selectedCategories:{type:Object},_selectedCollections:{type:Object},filterPreset:{type:Object}};constructor(){super(),this.recipes=[],this.allRecipes=[],this.tags=[],this.searchQuery="",this.activeTag=null,this.columns=3,this.showFavourites=!0,this.hideSidebar=!1,this.scrollPos=0,this.recentRecipes=[],this.recentCount=12,this._filterMode="all",this._starFilter=0,this._sortByRating=!1,this._showRatingMenu=!1,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,this._lastScrollPos=0,this._hasRestoredScroll=!1,this.filterPreset=null}_toggleChip(e,i){let t=e==="courses"?"_selectedCourses":e==="categories"?"_selectedCategories":"_selectedCollections",r=new Set(this[t]);r.has(i)?r.delete(i):r.add(i),this[t]=r}updated(e){if(e.has("filterPreset")&&this.filterPreset){let{filterMode:i,selectedValues:t}=this.filterPreset;this._filterMode=i,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,i==="courses"&&(this._selectedCourses=new Set(t)),i==="categories"&&(this._selectedCategories=new Set(t)),i==="collections"&&(this._selectedCollections=new Set(t))}e.has("scrollPos")&&(this._hasRestoredScroll=!1),this.scrollPos!=null&&!this._hasRestoredScroll&&(this._hasRestoredScroll=!0,this.updateComplete.then(()=>{requestAnimationFrame(()=>{let i=this.shadowRoot?.querySelector(".grid-scroll");i&&(i.scrollTop=this.scrollPos)})}))}_handleSearchInput(e){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:e.target.value},bubbles:!0,composed:!0}))}_handleClearSearch(){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:""},bubbles:!0,composed:!0}))}_handleTagClick(e){this.dispatchEvent(new CustomEvent("rm-tag-filter",{detail:{tag:e},bubbles:!0,composed:!0}))}_handleOpenRecipe(e){this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:e},bubbles:!0,composed:!0}))}_handleToggleFavourite(e,i){e.stopPropagation(),this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:i.id},bubbles:!0,composed:!0}))}_recipeMatchesTag(e,i){return i?e.tags?.includes(i)||e.courses?.includes(i)||e.categories?.includes(i)||e.collections?.includes(i):!0}_recipeMatchesSearch(e,i){let t=(i||"").trim().toLowerCase();return t?e.name?.toLowerCase().includes(t)||e.description?.toLowerCase().includes(t)||e.tags?.some(r=>r.toLowerCase().includes(t)):!0}_formatTime(e){if(!e)return null;if(e<60)return`${e}m`;let i=Math.floor(e/60),t=e%60;return t?`${i}h ${t}m`:`${i}h`}_getFilteredList(){let e=this._selectedCourses.size>0,i=this._selectedCategories.size>0,t=this._selectedCollections.size>0,r=e||i||t,a;switch(r?a=this.allRecipes.filter(s=>{let c=!e||(s.courses||[]).some(y=>this._selectedCourses.has(y)),_=!i||(s.categories||[]).some(y=>this._selectedCategories.has(y)),w=!t||(s.collections||[]).some(y=>this._selectedCollections.has(y));return c&&_&&w&&this._recipeMatchesSearch(s,this.searchQuery)}):a=this.recipes,this._filterMode){case"favourites":a=this.allRecipes.filter(s=>s.is_favourite).filter(s=>!r||a.some(c=>c.id===s.id));break;case"recent":a=this.recentRecipes.slice(0,this.recentCount).filter(s=>!r||a.some(c=>c.id===s.id));break}return a=a.filter(s=>this._recipeMatchesSearch(s,this.searchQuery)&&this._recipeMatchesTag(s,this.activeTag)),this._starFilter>0&&(a=a.filter(s=>(s.rating||0)>=this._starFilter)),this._sortByRating&&(a=[...a].sort((s,c)=>(c.rating||0)-(s.rating||0))),a}get _allCourses(){let e=new Set;return this.allRecipes.forEach(i=>(i.courses||[]).forEach(t=>e.add(t))),[...e].sort()}get _coursecounts(){let e={};return this.allRecipes.forEach(i=>(i.courses||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}get _allCategories(){let e=new Set;return this.allRecipes.forEach(i=>(i.categories||[]).forEach(t=>e.add(t))),[...e].sort()}get _categorycounts(){let e={};return this.allRecipes.forEach(i=>(i.categories||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}get _allCollections(){let e=new Set;return this.allRecipes.forEach(i=>(i.collections||[]).forEach(t=>e.add(t))),[...e].sort()}get _collectioncounts(){let e={};return this.allRecipes.forEach(i=>(i.collections||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}_renderStars(e){let i=e||0;return h`
      <div class="card-stars">
        ${[1,2,3,4,5].map(t=>h`<span class="card-star ${t<=i?"filled":""}"
              >${t<=i?"\u2605":"\u2606"}</span
            >`)}
      </div>
    `}_renderRecipeCard(e){let i=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return h`
      <article class="recipe-card">
        <div class="recipe-thumb">
          ${e.image_url?h`
                <img
                  src="${e.image_url}"
                  alt="${e.name}"
                  loading="lazy"
                />
              `:h`
                <div class="recipe-thumb-placeholder">
                  <ha-icon icon="mdi:food"></ha-icon>
                </div>
              `}
          <button
            class="fav-btn ${e.is_favourite?"active":""}"
            @click=${t=>this._handleToggleFavourite(t,e)}
            title="${e.is_favourite?o("Remove from favourites"):o("Add to favourites")}"
          >
            <ha-icon
              icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"
            ></ha-icon>
          </button>
        </div>
        <div class="recipe-info">
          <h3 class="recipe-name">
            <button
              class="recipe-open"
              @click=${()=>this._handleOpenRecipe(e)}
            >
              ${e.name}
            </button>
          </h3>
          ${this._renderStars(e.rating)}
          <div class="recipe-meta">
            ${i?h`
                  <span class="meta-chip">
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${this._formatTime(i)}
                  </span>
                `:""}
            ${e.servings?h`
                  <span class="meta-chip">
                    <ha-icon icon="mdi:account-group-outline"></ha-icon>
                    ${e.servings}
                  </span>
                `:""}
            ${e.tags?.length?h`
                  <span class="meta-chip tag-chip">${e.tags[0]}</span>
                `:""}
          </div>
        </div>
      </article>
    `}_renderRatingMenu(){return h`
      <div class="rating-menu" @click=${e=>e.stopPropagation()}>
        <div class="rating-menu-section">${o("Filter by rating")}</div>
        ${[0,1,2,3,4,5].map(e=>h`
            <button
              class="rating-menu-item ${this._starFilter===e?"active":""}"
              @click=${()=>{this._starFilter=e,this._showRatingMenu=!1}}
            >
              ${e===0?o("All ratings"):o(te`${"\u2605".repeat(e)}${"\u2606".repeat(5-e)} ${e}+`)}
            </button>
          `)}
        <div class="rating-menu-section" style="margin-top:6px">
          ${o("Sort")}
        </div>
        <button
          class="rating-menu-item ${this._sortByRating?"active":""}"
          @click=${()=>{this._sortByRating=!this._sortByRating,this._showRatingMenu=!1}}
        >
          ${o(te`${this._sortByRating?"\u2713 ":""}Sort by rating`)}
        </button>
      </div>
    `}render(){let e=this._getFilteredList(),i=this._filterMode==="all"&&this.showFavourites&&!this.activeTag&&!this.searchQuery&&!this._starFilter&&!this._sortByRating,t=i?e.filter(c=>c.is_favourite):[],r=i&&t.length?e.filter(c=>!c.is_favourite):e,a=`grid-template-columns: var(--rm-grid-columns, repeat(${this.columns}, minmax(0, 1fr)));`,s=this._starFilter>0||this._sortByRating;return h`
      <div
        class="grid-container"
        @click=${()=>{this._showRatingMenu&&(this._showRatingMenu=!1)}}
      >
        <!-- Search bar — only shown on narrow (sidebar-less) view -->
        ${this.hideSidebar?"":h`
              <div class="search-row">
                <div class="search-wrap">
                  <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="${o("Search recipes\u2026")}"
                    .value=${this.searchQuery}
                    @input=${this._handleSearchInput}
                  />
                  ${this.searchQuery?h`
                        <button
                          class="clear-btn"
                          @click=${this._handleClearSearch}
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      `:""}
                </div>
              </div>
            `}

        <!-- Filter tabs + rating filter button (wide view) -->
        ${this.hideSidebar?h`
              <div class="filter-tabs-row">
                <div class="filter-tabs">
                  ${[["all","mdi:view-grid",o("All"),null],["courses","mdi:silverware-fork-knife",o("Courses"),"_selectedCourses"],["categories","mdi:tag-multiple-outline",o("Categories"),"_selectedCategories"],["collections","mdi:folder-multiple-outline",o("Collections"),"_selectedCollections"],["favourites","mdi:heart-outline",o("Favourites"),null],["recent","mdi:history",o("Recent"),null]].map(([c,_,w,y])=>h`
                      <button
                        class="filter-tab ${this._filterMode===c?"active":""}"
                        @click=${()=>{this._filterMode=c,c==="all"&&(this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set)}}
                      >
                        <ha-icon icon="${_}"></ha-icon>
                        <span>${w}</span>
                        ${y&&this[y]?.size>0?h`<span class="tab-badge"></span>`:""}
                      </button>
                    `)}
                </div>
                <!-- Rating filter button -->
                <div class="rating-filter-wrap">
                  <button
                    class="rating-filter-btn ${s?"active":""}"
                    @click=${c=>{c.stopPropagation(),this._showRatingMenu=!this._showRatingMenu}}
                    title="${o("Filter/sort by rating")}"
                  >
                    <ha-icon icon="mdi:filter-menu-outline"></ha-icon>
                    ${s?h`<span class="rating-filter-badge"></span>`:""}
                  </button>
                  ${this._showRatingMenu?this._renderRatingMenu():""}
                </div>
              </div>
            `:""}

        <!-- Sub-filter chips for Courses / Categories / Collections (multi-select) -->
        ${this.hideSidebar&&this._filterMode==="courses"&&this._allCourses.length?h`
              <div class="sub-filter-row">
                <button
                  class="sub-chip ${this._selectedCourses.size?"":"active"}"
                  @click=${()=>{this._selectedCourses=new Set}}
                >
                  ${o("All")}
                </button>
                ${this._allCourses.map(c=>h`
                    <button
                      class="sub-chip ${this._selectedCourses.has(c)?"active":""}"
                      @click=${()=>this._toggleChip("courses",c)}
                    >
                      ${c}<span class="sub-chip-count"
                        >${this._coursecounts[c]||0}</span
                      >
                    </button>
                  `)}
              </div>
            `:""}
        ${this.hideSidebar&&this._filterMode==="categories"&&this._allCategories.length?h`
              <div class="sub-filter-row">
                <button
                  class="sub-chip ${this._selectedCategories.size?"":"active"}"
                  @click=${()=>{this._selectedCategories=new Set}}
                >
                  ${o("All")}
                </button>
                ${this._allCategories.map(c=>h`
                    <button
                      class="sub-chip ${this._selectedCategories.has(c)?"active":""}"
                      @click=${()=>this._toggleChip("categories",c)}
                    >
                      ${c}<span class="sub-chip-count"
                        >${this._categorycounts[c]||0}</span
                      >
                    </button>
                  `)}
              </div>
            `:""}
        ${this.hideSidebar&&this._filterMode==="collections"&&this._allCollections.length?h`
              <div class="sub-filter-row">
                <button
                  class="sub-chip ${this._selectedCollections.size?"":"active"}"
                  @click=${()=>{this._selectedCollections=new Set}}
                >
                  ${o("All")}
                </button>
                ${this._allCollections.map(c=>h`
                    <button
                      class="sub-chip ${this._selectedCollections.has(c)?"active":""}"
                      @click=${()=>this._toggleChip("collections",c)}
                    >
                      ${c}<span class="sub-chip-count"
                        >${this._collectioncounts[c]||0}</span
                      >
                    </button>
                  `)}
              </div>
            `:""}

        <!-- Tag chips (narrow view only) -->
        ${!this.hideSidebar&&this.tags.length?h`
              <div class="tags-row">
                ${this.tags.map(c=>h`
                    <button
                      class="tag-btn ${this.activeTag===c?"active":""}"
                      @click=${()=>this._handleTagClick(c)}
                    >
                      ${c}
                    </button>
                  `)}
              </div>
            `:""}

        <!-- Active filter hint -->
        ${s?h`
              <div class="active-filter-bar">
                ${this._starFilter>0?h`<span
                      >${o(te`⭐ ${this._starFilter}+ stars`)}</span
                    >`:""}
                ${this._sortByRating?h`<span>${o("Sorted by rating")}</span>`:""}
                <button
                  class="clear-filter-btn"
                  @click=${()=>{this._starFilter=0,this._sortByRating=!1}}
                >
                  <ha-icon icon="mdi:close"></ha-icon> ${o("Clear")}
                </button>
              </div>
            `:""}

        <!-- Recipe content -->
        <div
          class="grid-scroll"
          @scroll=${c=>{this._lastScrollPos=c.target.scrollTop}}
        >
          ${e.length===0?h`
                <div class="empty-state">
                  <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
                  <p>
                    ${this.searchQuery||this.activeTag?o("No matching recipes"):this._starFilter>0?o(te`No recipes with ${this._starFilter}+ stars`):this._filterMode==="favourites"?o("No favourites yet \u2014 heart a recipe!"):this._filterMode==="recent"?o("No recently viewed recipes yet."):o("No recipes yet \u2014 add one!")}
                  </p>
                </div>
              `:h`
                ${i&&t.length?h`
                      <div class="section-label">${o("Favourites")}</div>
                      <div class="recipe-grid" style=${a}>
                        ${t.map(c=>this._renderRecipeCard(c))}
                      </div>
                      ${r.length?h`<div class="section-label">
                            ${o("All Recipes")}
                          </div>`:""}
                    `:""}

                <div class="recipe-grid" style=${a}>
                  ${r.map(c=>this._renderRecipeCard(c))}
                </div>
              `}
        </div>
      </div>
    `}static styles=pe`
    :host {
      display: block;
      height: 100%;
      position: relative;
    }

    .grid-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      min-width: 0;
      min-height: 0;
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
      border: 1px solid var(--rm-border-strong, var(--rm-border));
    }
    .search-icon {
      color: var(--rm-text-secondary, #8e8e93);
      --mdc-icon-size: 18px;
    }
    .search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text, #e5e5ea);
      font-size: var(--rm-font-size-base, 16px);
      padding: 11px 0;
      min-width: 0;
    }
    .search-input::placeholder {
      color: var(--rm-text-secondary, #8e8e93);
    }
    .clear-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      padding: 2px;
      display: flex;
      align-items: center;
    }
    .clear-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    /* Filter tabs row (wide view) */
    .filter-tabs-row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 14px 4px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    }

    .filter-tabs {
      display: flex;
      gap: 2px;
      flex: 1;
      overflow-x: auto;
      scrollbar-width: none;
      min-width: 0;
    }
    .filter-tabs::-webkit-scrollbar {
      display: none;
    }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      min-height: var(--rm-touch-target, 44px);
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      color: var(--rm-text-secondary, #8e8e93);
      cursor: pointer;
      white-space: nowrap;
      transition:
        background 0.12s,
        color 0.12s;
    }
    .filter-tab ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }
    .filter-tab:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .filter-tab {
      position: relative;
    }
    .tab-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--rm-accent);
    }
    .filter-tab.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      font-weight: 600;
    }

    /* Rating filter button */
    .rating-filter-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .rating-filter-btn {
      background: none;
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      color: var(--rm-text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
      min-width: var(--rm-touch-target, 44px);
      min-height: var(--rm-touch-target, 44px);
      transition:
        background 0.12s,
        color 0.12s;
    }
    .rating-filter-btn ha-icon {
      --mdc-icon-size: 18px;
    }
    .rating-filter-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .rating-filter-btn.active {
      color: var(--rm-accent);
      border-color: var(--rm-accent);
      background: var(--rm-accent-soft);
    }
    .rating-filter-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 7px;
      height: 7px;
      background: var(--rm-accent);
      border-radius: 50%;
    }

    .rating-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      background: var(--rm-dialog-bg, var(--rm-bg-surface));
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      box-shadow: var(--rm-shadow, 0 4px 12px rgba(0, 0, 0, 0.2));
      min-width: 170px;
      z-index: 50;
      overflow: hidden;
      padding: 4px 0;
    }
    .rating-menu-section {
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rm-text-muted);
      padding: 8px 14px 4px;
    }
    .rating-menu-item {
      display: block;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      padding: 10px 14px;
      font-size: var(--rm-font-size-sm, 14px);
      min-height: var(--rm-touch-target, 44px);
      cursor: pointer;
      color: var(--rm-text-secondary);
      transition: background 0.12s;
    }
    .rating-menu-item:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .rating-menu-item.active {
      color: var(--rm-accent);
      font-weight: 600;
    }

    /* Active filter hint bar */
    .active-filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 14px;
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-accent);
      background: var(--rm-accent-soft);
      flex-shrink: 0;
    }
    .clear-filter-btn {
      margin-left: auto;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 3px;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-xs, 12px);
      cursor: pointer;
    }
    .clear-filter-btn ha-icon {
      --mdc-icon-size: 14px;
    }

    /* Sub-filter chips */
    .sub-filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 6px 14px;
      flex-shrink: 0;
      max-height: 88px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border) transparent;
    }
    .sub-filter-row::-webkit-scrollbar {
      width: 4px;
    }
    .sub-filter-row::-webkit-scrollbar-track {
      background: transparent;
    }
    .sub-filter-row::-webkit-scrollbar-thumb {
      background: var(--rm-border);
      border-radius: 4px;
    }
    .sub-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 20px;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-xs, 12px);
      padding: 4px 8px 4px 12px;
      cursor: pointer;
      white-space: nowrap;
      min-height: 36px;
      transition: all 0.15s;
    }
    .sub-chip.active {
      background: var(--rm-accent-soft);
      border-color: var(--rm-accent);
      color: var(--rm-accent);
    }
    .sub-chip-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: 10px;
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 700;
      padding: 1px 5px;
      min-width: 16px;
      line-height: 1.4;
    }

    /* Tags (narrow view) */
    .tags-row {
      display: flex;
      gap: 6px;
      padding: 4px 14px 8px;
      overflow-x: auto;
      flex-shrink: 0;
      scrollbar-width: none;
    }
    .tags-row::-webkit-scrollbar {
      display: none;
    }
    .tag-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 20px;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-xs, 12px);
      padding: 4px 10px;
      cursor: pointer;
      white-space: nowrap;
      min-height: 36px;
      transition: all 0.15s;
    }
    .tag-btn.active {
      background: var(--rm-accent-soft);
      border-color: var(--rm-accent);
      color: var(--rm-accent);
    }

    /* Grid scroll area */
    .grid-scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 4px 14px 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border) transparent;
    }

    .section-label {
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rm-text-secondary);
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
      position: relative;
      background: var(--rm-bg-surface);
      border-radius: var(--rm-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      transition:
        transform 0.15s,
        box-shadow 0.15s;
      border: 1px solid var(--rm-border);
    }
    .recipe-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--rm-shadow);
    }
    .recipe-card:focus-within {
      outline: 3px solid var(--rm-focus, var(--rm-accent));
      outline-offset: 2px;
    }
    .recipe-open {
      border: 0;
      padding: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .recipe-open::after {
      content: "";
      position: absolute;
      inset: 0;
    }

    .recipe-thumb {
      position: relative;
      aspect-ratio: 4/3;
      background: var(--rm-border);
      overflow: hidden;
    }
    .recipe-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .recipe-thumb-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary);
    }
    .recipe-thumb-placeholder ha-icon {
      --mdc-icon-size: 36px;
    }

    .fav-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      z-index: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: color 0.15s;
      padding: 0;
    }
    .fav-btn ha-icon {
      --mdc-icon-size: 22px;
    }
    .fav-btn.active {
      color: #ffb5c0;
    }

    .recipe-info {
      padding: 12px 14px 14px;
    }
    .recipe-name {
      margin: 0 0 4px;
      font-size: var(--rm-font-size-base, 16px);
      font-weight: 600;
      color: var(--rm-text);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.4;
    }

    /* Star rating on cards */
    .card-stars {
      display: flex;
      gap: 1px;
      margin-bottom: 5px;
    }
    .card-star {
      font-size: var(--rm-font-size-sm, 14px);
      line-height: 1;
      color: var(--rm-border, rgba(200, 150, 0, 0.25));
      -webkit-text-stroke: 1px rgba(200, 150, 0, 0.5);
    }
    .card-star.filled {
      color: #f5a623;
      -webkit-text-stroke: 1px #c47f0a;
    }

    .recipe-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .meta-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary);
      background: var(--rm-bg-elevated);
      border-radius: 6px;
      padding: 2px 6px;
    }
    .meta-chip ha-icon {
      --mdc-icon-size: 12px;
    }
    .tag-chip {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .empty-state ha-icon {
      --mdc-icon-size: 56px;
      opacity: 0.4;
    }
    .empty-state p {
      margin: 0;
      font-size: var(--rm-font-size-base, 16px);
    }
    ${ue}
  `};try{customElements.define("rm-recipe-grid",Ze)}catch{}var Bt={"\xBD":.5,"\xBC":.25,"\xBE":.75,"\u2153":.3333333333333333,"\u2154":.6666666666666666,"\u215B":.125,"\u215C":.375,"\u215D":.625,"\u215E":.875};function Ge(u){if(u==null)return null;let e=String(u).trim().replace(",","."),i,t=e.match(/^(\d+)?\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/),r=e.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);if(t)i=Number(t[1]||0)+Bt[t[2]];else if(r){if(Number(r[3])===0)return null;i=Number(r[1]||0)+Number(r[2])/Number(r[3])}else if(/^\d+(?:\.\d+)?$/.test(e))i=Number(e);else return null;return Number.isFinite(i)&&i>=0&&i<=1e6?i:null}function gt(u,e){let i=Ge(u);if(i===null||!Number.isFinite(e)||e<=0||e>1e4)return u;let t=i*e;return!Number.isFinite(t)||t>1e10?u:String(Number(t.toFixed(4)))}function Re(u){return String(u).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map(e=>e.startsWith("**")?h`<strong>${e.slice(2,-2)}</strong>`:e.startsWith("`")?h`<code>${e.slice(1,-1)}</code>`:e.startsWith("*")?h`<em>${e.slice(1,-1)}</em>`:e)}function Ee(u){return String(u||"").split(`
`).map(e=>e.startsWith("### ")?h`<h3>${Re(e.slice(4))}</h3>`:e.startsWith("## ")?h`<h2>${Re(e.slice(3))}</h2>`:e.startsWith("# ")?h`<h1>${Re(e.slice(2))}</h1>`:/^[-*] /.test(e)?h`<ul>
                  <li>${Re(e.slice(2))}</li>
                </ul>`:h`<p>${Re(e)}</p>`)}var bt=pe`
  :host {
    display: block;
    height: 100%;
    overflow: auto;
    overscroll-behavior: contain;
  }
  section {
    padding: 24px;
    max-width: 1000px;
    margin: auto;
  }
  h2 {
    margin: 0 0 20px;
    font-size: clamp(22px, 3vw, 28px);
    line-height: 1.25;
    letter-spacing: -0.02em;
  }
  h3 {
    font-size: var(--rm-font-size-base, 16px);
  }
  nav,
  .toolbar,
  .row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  button,
  select,
  input,
  textarea {
    font: inherit;
    color: inherit;
    background: var(--rm-bg-surface, white);
    border: 1px solid var(--rm-border-strong, var(--rm-border, #a6bbc4));
    border-radius: 12px;
    padding: 10px 14px;
    min-height: 44px;
  }
  button {
    cursor: pointer;
    font-weight: 600;
  }
  button:hover,
  button.active {
    background: var(--rm-accent-soft, #dce9f0);
    color: var(--rm-accent, #315d75);
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 12px 0;
  }
  input,
  textarea,
  select {
    max-width: 100%;
    box-sizing: border-box;
  }
  textarea {
    min-height: 80px;
    resize: vertical;
  }
  input[type="checkbox"],
  input[type="radio"] {
    min-height: 20px;
    width: 20px;
    height: 20px;
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    max-height: 340px;
    overflow: auto;
  }
  .record {
    padding: 14px;
    background: var(--rm-bg-surface, white);
    border: 1px solid var(--rm-border, #ddd);
    border-radius: var(--rm-radius, 16px);
    margin: 8px 0;
  }
  .muted {
    color: var(--rm-text-secondary, #666);
  }
  .row strong {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .checked strong {
    text-decoration: line-through;
  }
  form {
    max-width: 720px;
  }
  .danger {
    color: var(--rm-error, #983d25);
  }
  @media (max-width: 600px) {
    section {
      padding: 12px;
    }
    nav {
      gap: 4px;
    }
    nav button {
      padding: 8px 12px;
      font-size: var(--rm-font-size-sm, 14px);
    }
  }
  ${ue}
`;var He=class extends he{static properties={api:{attribute:!1},recipe:{attribute:!1},servings:{type:Number},open:{state:!0},error:{state:!0},result:{state:!0}};static styles=bt;constructor(){super(),this.servings=1,this.open=!1,this.error="",this.result=null}get de(){return this.api?.hass?.language?.startsWith("de")}async submit(e){e.preventDefault();let i=e.target,t={recipe_id:this.recipe.id,servings:Number(i.elements.servings.value),meal_type:i.elements.meal_type.value};i.elements.date.value&&(t.date=i.elements.date.value);try{this.result=await this.api.call("recipe_log",t),this.error="",this.open=!1}catch(r){this.error=r.message}}render(){let e=["per_serving","per_recipe"].includes(this.recipe?.nutrition_basis)&&Number.isFinite(this.recipe?.declared_nutrition?.calories);return h`<section style="padding:8px">
      <button
        @click=${()=>{this.open=!this.open}}
        ?disabled=${!e||!!this.api?.pending}
      >
        ${this.de?"Portionen eintragen":"Log servings"}</button
      >${e?"":h`<small>
            ${this.de?"Deklarierte Kalorien und bekannte N\xE4hrwertbasis erforderlich.":"Declared calories and a known nutrition basis are required."}</small
          >`}${this.open?h`<form @submit=${this.submit}>
            <label
              >${this.de?"Rezeptportionen":"Recipe servings"}<input
                aria-label="Recipe servings"
                name="servings"
                type="number"
                required
                min="0.001"
                max="10000"
                step="any"
                .value=${this.servings} /></label
            ><label
              >${this.de?"Mahlzeit":"Meal"}<select name="meal_type">
                <option value="breakfast">
                  ${this.de?"Fr\xFChst\xFCck":"Breakfast"}
                </option>
                <option value="lunch">
                  ${this.de?"Mittagessen":"Lunch"}
                </option>
                <option value="dinner" selected>
                  ${this.de?"Abendessen":"Dinner"}
                </option>
                <option value="snack">${this.de,"Snack"}</option>
              </select></label
            ><label
              >${this.de?"Datum (leer = heute in Home Assistant)":"Date (empty = Home Assistant today)"}<input
                name="date"
                type="date"
            /></label>
            <p class="muted">
              ${this.de?"Speichert einen unver\xE4nderlichen Rezept-N\xE4hrwert-Snapshot im Tagebuch.":"Saves an immutable snapshot of declared recipe nutrition in the diary."}
            </p>
            <button type="submit" ?disabled=${!!this.api?.pending}>
              ${this.de?"Best\xE4tigen und eintragen":"Confirm and log"}
            </button>
          </form>`:""}${this.error?h`<p role="alert">${this.error}</p>`:""}${this.result?h`<p role="status">
            ${this.de?"Tagebucheintrag gespeichert.":"Diary entry saved."}
          </p>`:""}
    </section>`}};customElements.define("mm-recipe-log",He);function Be(u,e){return h`<fieldset>
    <legend>Declared nutrition for diary logging</legend>
    <p>
      Original nutrition text is retained separately. Enter numeric values only
      when declared by the recipe. Missing values stay unknown.
    </p>
    <label
      >Nutrition basis<select
        aria-label="Nutrition basis"
        .value=${u.nutrition_basis||"unknown"}
        @change=${i=>e("nutrition_basis",i.target.value)}
      >
        <option value="unknown">Unknown</option>
        <option value="per_serving">Per serving</option>
        <option value="per_recipe">Whole recipe</option>
      </select></label
    >${["calories","protein","carbs","fat","fiber","sugar","sodium","saturated_fat"].map(i=>h`<label
          >Declared ${i.replaceAll("_"," ")}
          (${i==="calories"?"kcal":i==="sodium"?"mg":"g"})<input
            aria-label=${`Declared ${i.replaceAll("_"," ")} (${i==="calories"?"kcal":i==="sodium"?"mg":"g"})`}
            type="number"
            min="0"
            step="any"
            .value=${u.declared_nutrition?.[i]??""}
            @input=${t=>e("declared_nutrition",{...u.declared_nutrition,[i]:t.target.value})}
        /></label>`)}
  </fieldset>`}function je(u){return Object.fromEntries(Object.entries(u||{}).filter(([,e])=>e!==""&&e!==void 0).map(([e,i])=>[e,i===null?null:Number(i)]))}var vt=u=>class extends u{_startEdit(){let e=this.recipe.nutrition||{};this._editData={nutrition_basis:this.recipe.nutrition_basis||"unknown",declared_nutrition:{...this.recipe.declared_nutrition||{}},name:this.recipe.name||"",description:this.recipe.description||"",source_url:this.recipe.source_url||"",servings:this.recipe.servings||"",prep_time:this.recipe.prep_time||"",cook_time:this.recipe.cook_time||"",tags:[...this.recipe.tags||[]],courses:[...this.recipe.courses||[]],categories:[...this.recipe.categories||[]],collections:[...this.recipe.collections||[]],notes:this.recipe.notes||"",rating:this.recipe.rating||0,image_url:this.recipe.media_refs?.image_url??this.recipe.image_url??"",photos:[...this.recipe.media_refs?.photos??this.recipe.photos??[]],ingredients:[...this.recipe.ingredients||[]],instructions:[...this.recipe.instructions||[]],cal:e.calories??"",fat:e.fat??"",satf:e.saturated_fat??"",chol:e.cholesterol??"",sod:e.sodium??"",carb:e.carbohydrates??"",fib:e.fiber??"",sug:e.sugar??"",prot:e.protein??""},this._editing=!0}_cancelEdit(){this._editing=!1,this._editData={}}_handleEditField(e,i){this._editData={...this._editData,[e]:i}}_renderListPicker(e,i,t){let r=this._editData[e]||[],a=this._tagPickerField===e,s=(t||[]).filter(_=>!r.includes(_)),c=a?this._tagPickerInput:"";return h`
        <div class="edit-field list-picker-field">
          <label>${i}</label>
          <div class="list-picker-wrap">
            <!-- Selected chips -->
            <div class="list-picker-chips">
              ${r.map(_=>h`
                  <span class="list-chip selected">
                    ${_}
                    <button
                      class="list-chip-remove"
                      @click=${()=>this._toggleListValue(e,_)}
                      title="${o("Remove")}"
                    >
                      ×
                    </button>
                  </span>
                `)}
              <button
                class="list-chip-add-btn"
                @click=${()=>{this._tagPickerField=a?null:e,this._tagPickerInput=""}}
                title="${o(te`Add ${i.toLowerCase()}`)}"
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
            <!-- Picker dropdown -->
            ${a?h`
                  <div class="list-picker-dropdown">
                    ${s.length?h`
                          <div class="list-picker-existing">
                            ${s.map(_=>h`
                                <span
                                  class="list-chip available"
                                  @click=${()=>{this._toggleListValue(e,_)}}
                                >
                                  ${_}
                                </span>
                              `)}
                          </div>
                        `:""}
                    <div class="list-picker-new-row">
                      <input
                        class="list-picker-input"
                        type="text"
                        placeholder="${o(te`New ${i.toLowerCase()}…`)}"
                        .value=${c}
                        @input=${_=>{this._tagPickerInput=_.target.value}}
                        @keydown=${_=>{_.key==="Enter"&&(_.preventDefault(),this._addListValue(e,this._tagPickerInput)),_.key==="Escape"&&(this._tagPickerField=null)}}
                      />
                      <button
                        class="list-picker-new-btn"
                        @click=${()=>this._addListValue(e,this._tagPickerInput)}
                        ?disabled=${!this._tagPickerInput.trim()}
                      >
                        ${o("Add")}
                      </button>
                    </div>
                  </div>
                `:""}
          </div>
        </div>
      `}_toggleListValue(e,i){let t=this._editData[e]||[],r=t.includes(i)?t.filter(a=>a!==i):[...t,i];this._editData={...this._editData,[e]:r}}_addListValue(e,i){let t=(i||"").trim();if(!t)return;let r=this._editData[e]||[];r.includes(t)||(this._editData={...this._editData,[e]:[...r,t]}),this._tagPickerInput="",this._tagPickerField=null}_startEditIngredient(e){let i=(this._editData.ingredients||[])[e];if(i)if(i.is_heading||i.name?.startsWith("#")){let t=i.name?.startsWith("#")?i.name.slice(1).trim():i.name;this._editIngEdit={idx:e,heading:!0,name:t}}else this._editIngEdit={idx:e,heading:!1,amount:i.amount||"",unit:i.unit||"",name:i.name||""}}_saveEditIngredient(){let e=this._editIngEdit;if(!e)return;let i=[...this._editData.ingredients||[]];e.heading?i[e.idx]={name:`# ${e.name}`,is_heading:!0}:i[e.idx]={amount:e.amount,unit:e.unit,name:e.name},this._editData={...this._editData,ingredients:i},this._editIngEdit=null}_cancelEditIngredient(){this._editIngEdit=null}_editAddIngredient(){let e=this._editIngInput.trim();if(!e)return;let i;if(e.startsWith("#"))i={name:e,is_heading:!0};else{let t=e.split(/\s+/),r="",a="",s="";t.length>=3&&!isNaN(parseFloat(t[0]))?(r=t[0],a=t[1],s=t.slice(2).join(" ")):t.length===2&&!isNaN(parseFloat(t[0]))?(r=t[0],s=t[1]):s=e,i={amount:r,unit:a,name:s}}this._editData={...this._editData,ingredients:[...this._editData.ingredients||[],i]},this._editIngInput=""}_editRemoveIngredient(e){this._editData={...this._editData,ingredients:(this._editData.ingredients||[]).filter((i,t)=>t!==e)}}_editMoveIngredient(e,i){let t=[...this._editData.ingredients||[]],r=e+i;r<0||r>=t.length||([t[e],t[r]]=[t[r],t[e]],this._editData={...this._editData,ingredients:t})}_editMoveStep(e,i){let t=[...this._editData.instructions||[]],r=e+i;r<0||r>=t.length||([t[e],t[r]]=[t[r],t[e]],this._editData={...this._editData,instructions:t})}_editDropIngredient(e,i){if(e===i||e<0||i<0)return;let t=[...this._editData.ingredients||[]],[r]=t.splice(e,1);t.splice(i,0,r),this._editData={...this._editData,ingredients:t},this._dragIngOver=-1,this._dragIngFrom=-1}_editDropStep(e,i){if(e===i||e<0||i<0)return;let t=[...this._editData.instructions||[]],[r]=t.splice(e,1);t.splice(i,0,r),this._editData={...this._editData,instructions:t},this._dragStepOver=-1,this._dragStepFrom=-1}_editAddStep(e){e.trim()&&(this._editData={...this._editData,instructions:[...this._editData.instructions||[],e.trim()]})}_editRemoveStep(e){this._editData={...this._editData,instructions:(this._editData.instructions||[]).filter((i,t)=>t!==e)}}async _editUploadImage(e){if(!e||!this.recipe?.id)return;this._editImageUploading=!0;let i=new FileReader;i.onload=async t=>{let r=t.target.result.split(",")[1];try{let a=await this.api.uploadRecipeImage(this.recipe.id,r),s=a?.image_url||a?.local_url;s&&(this._editData={...this._editData,image_url:this._editData.image_url||s,photos:[...new Set([...this._editData.photos||[],s])]})}catch(a){console.warn("Image upload failed:",a)}finally{this._editImageUploading=!1}},i.readAsDataURL(e)}async _saveEdit(){let e=this._editData,i={},t={cal:"calories",fat:"fat",satf:"saturated_fat",chol:"cholesterol",sod:"sodium",carb:"carbohydrates",fib:"fiber",sug:"sugar",prot:"protein"},r=!1;for(let[s,c]of Object.entries(t))e[s]!==""&&e[s]!=null&&(i[c]=e[s],r=!0);let a={name:e.name,description:e.description,source_url:e.source_url,image_url:e.image_url||null,servings:e.servings===""?null:Number(e.servings),prep_time:e.prep_time===""?null:Number(e.prep_time),cook_time:e.cook_time===""?null:Number(e.cook_time),tags:Array.isArray(e.tags)?e.tags:[],courses:Array.isArray(e.courses)?e.courses:[],categories:Array.isArray(e.categories)?e.categories:[],collections:Array.isArray(e.collections)?e.collections:[],notes:e.notes,rating:e.rating||null,photos:e.photos||[],ingredients:e.ingredients||[],instructions:e.instructions||[],nutrition:r?i:null,nutrition_basis:e.nutrition_basis||"unknown",declared_nutrition:je(e.declared_nutrition)};try{await this.api.updateRecipe(this.recipe.id,a),this._editing=!1,this.dispatchEvent(new CustomEvent("rm-recipe-saved",{bubbles:!0,composed:!0}))}catch(s){this._saveError=s.message,this.requestUpdate()}}_renderEditPanel(){let e=this._editData;return h`
        <div
          class="edit-overlay"
          @click=${i=>{i.target===i.currentTarget&&this._cancelEdit()}}
        >
          <div class="edit-panel">
            <div class="edit-header">
              <span>${o("Edit Recipe")}</span>
              <button class="icon-btn" @click=${this._cancelEdit}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
            <div class="edit-body">
              ${this._renderField(o("Name"),"name","text")}

              <!-- Image section -->
              <div class="edit-section-label">${o("Image")}</div>
              <div class="edit-photo-row">
                ${(()=>{let i=[...new Set([e.image_url,...e.photos||[]].filter(Boolean))];return h`
                    ${i.map(t=>h`
                        <div
                          class="edit-photo-thumb ${t===e.image_url?"selected":""}"
                          @click=${()=>this._handleEditField("image_url",t)}
                          title="${o("Set as main image")}"
                        >
                          <img
                            src="${this.api.transport.previewURL(t)||ye}"
                            alt=""
                          />
                          ${t===e.image_url?h`<span class="edit-thumb-badge"
                                ><ha-icon icon="mdi:check"></ha-icon
                              ></span>`:""}
                        </div>
                      `)}
                    <label
                      class="edit-photo-add ${this._editImageUploading?"loading":""}"
                      title="${o("Upload photo")}"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style="display:none"
                        @change=${t=>{let r=t.target.files?.[0];r&&this._editUploadImage(r),t.target.value=""}}
                      />
                      <ha-icon
                        icon="${this._editImageUploading?"mdi:loading":"mdi:plus"}"
                      ></ha-icon>
                    </label>
                  `})()}
              </div>
              <div class="edit-field">
                <label>${o("Or paste image URL")}</label>
                <input
                  type="url"
                  .value=${e.image_url??""}
                  @input=${i=>this._handleEditField("image_url",i.target.value)}
                  placeholder="https://…"
                />
              </div>

              ${this._renderField(o("Description"),"description","textarea")}
              ${this._renderField(o("Source URL"),"source_url","url")}
              ${this._saveError?h`<p role="alert">${this._saveError}</p>`:""}
              ${Be(e,(i,t)=>this._handleEditField(i,t))}

              <div class="edit-row-3">
                ${this._renderField(o("Prep (min)"),"prep_time","number")}
                ${this._renderField(o("Cook (min)"),"cook_time","number")}
                ${this._renderField(o("Servings"),"servings","number")}
              </div>

              <!-- Star rating picker -->
              <div class="edit-field">
                <label>${o("Rating")}</label>
                <div class="edit-stars">
                  ${[1,2,3,4,5].map(i=>h`
                      <span
                        class="edit-star ${i<=(e.rating||0)?"filled":""}"
                        @click=${()=>this._handleEditField("rating",e.rating===i?0:i)}
                        >★</span
                      >
                    `)}
                </div>
              </div>

              ${this._renderListPicker("tags",o("Tags"),this.allTags)}
              ${this._renderListPicker("courses",o("Courses"),this.allCourses)}
              ${this._renderListPicker("categories",o("Categories"),this.allCategories)}
              ${this._renderListPicker("collections",o("Collections"),this.allCollections)}
              ${this._renderField(o("Notes"),"notes","textarea")}

              <!-- Ingredients editor -->
              <div class="edit-section-label">
                ${o(te`Ingredients (${(e.ingredients||[]).length})`)}
              </div>
              ${(e.ingredients||[]).length?h`
                    <ul class="edit-ing-list">
                      ${(e.ingredients||[]).map((i,t)=>{let r=this._editIngEdit?.idx===t,a=i.is_heading||i.name?.startsWith("#");if(r){let s=this._editIngEdit;return h`
                            <li
                              class="edit-ing-inline-edit ${a?"edit-ing-heading":""}"
                            >
                              ${s.heading?h`
                                    <input
                                      class="ing-inline-input ing-inline-name"
                                      type="text"
                                      placeholder="${o("Section header")}"
                                      .value=${s.name}
                                      @input=${c=>{this._editIngEdit={...s,name:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                  `:h`
                                    <input
                                      class="ing-inline-input ing-inline-amt"
                                      type="text"
                                      placeholder="${o("Amt")}"
                                      .value=${s.amount}
                                      @input=${c=>{this._editIngEdit={...s,amount:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                    <input
                                      class="ing-inline-input ing-inline-unit"
                                      type="text"
                                      placeholder="${o("Unit")}"
                                      .value=${s.unit}
                                      @input=${c=>{this._editIngEdit={...s,unit:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                    <input
                                      class="ing-inline-input ing-inline-name"
                                      type="text"
                                      placeholder="${o("Ingredient")}"
                                      .value=${s.name}
                                      @input=${c=>{this._editIngEdit={...s,name:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                  `}
                              <button
                                class="ing-inline-save"
                                @click=${this._saveEditIngredient}
                                title="${o("Save")}"
                              >
                                <ha-icon icon="mdi:check"></ha-icon>
                              </button>
                              <button
                                class="ing-inline-cancel"
                                @click=${this._cancelEditIngredient}
                                title="${o("Cancel")}"
                              >
                                <ha-icon icon="mdi:close"></ha-icon>
                              </button>
                            </li>
                          `}return h`
                          <li
                            draggable="true"
                            class="${a?"edit-ing-heading":""} ${this._dragIngOver===t?"drag-over":""}"
                            @dragstart=${s=>{this._dragIngFrom=t,s.dataTransfer.effectAllowed="move",s.dataTransfer.setData("text/plain",String(t))}}
                            @dragover=${s=>{s.preventDefault(),s.dataTransfer.dropEffect="move",this._dragIngOver!==t&&(this._dragIngOver=t)}}
                            @dragleave=${()=>{this._dragIngOver===t&&(this._dragIngOver=-1)}}
                            @drop=${s=>{s.preventDefault(),this._editDropIngredient(this._dragIngFrom,t)}}
                            @dragend=${()=>{this._dragIngOver=-1,this._dragIngFrom=-1}}
                          >
                            <ha-icon
                              icon="mdi:drag-vertical"
                              class="drag-handle"
                            ></ha-icon>
                            <span
                              class="edit-ing-text"
                              @click=${()=>this._startEditIngredient(t)}
                              title="${o("Click to edit")}"
                            >
                              ${a?h`<strong
                                    >${i.name?.startsWith("#")?i.name.slice(1).trim():i.name}</strong
                                  >`:h`${i.amount?`${i.amount}${i.unit?" "+i.unit:""} `:""}${i.name}`}
                            </span>
                            <div class="edit-reorder-btns">
                              <button
                                class="edit-move-btn"
                                ?disabled=${t===0}
                                @click=${()=>this._editMoveIngredient(t,-1)}
                                title="${o("Move up")}"
                              >
                                <ha-icon icon="mdi:chevron-up"></ha-icon>
                              </button>
                              <button
                                class="edit-move-btn"
                                ?disabled=${t===e.ingredients.length-1}
                                @click=${()=>this._editMoveIngredient(t,1)}
                                title="${o("Move down")}"
                              >
                                <ha-icon icon="mdi:chevron-down"></ha-icon>
                              </button>
                            </div>
                            <button
                              class="edit-remove-btn"
                              @click=${()=>this._editRemoveIngredient(t)}
                            >
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
                  placeholder="${o('e.g. "2 cups flour" or "# Section Header"')}"
                />
                <button class="edit-add-btn" @click=${this._editAddIngredient}>
                  ${o("Add")}
                </button>
              </div>

              <!-- Instructions editor -->
              <div class="edit-section-label">
                ${o(te`Directions (${(e.instructions||[]).length} steps)`)}
              </div>
              ${(e.instructions||[]).length?h`
                    <ol class="edit-steps-list">
                      ${(e.instructions||[]).map((i,t)=>h`
                          <li
                            draggable="true"
                            class="${this._dragStepOver===t?"drag-over":""}"
                            @dragstart=${r=>{this._dragStepFrom=t,r.dataTransfer.effectAllowed="move",r.dataTransfer.setData("text/plain",String(t))}}
                            @dragover=${r=>{r.preventDefault(),r.dataTransfer.dropEffect="move",this._dragStepOver!==t&&(this._dragStepOver=t)}}
                            @dragleave=${()=>{this._dragStepOver===t&&(this._dragStepOver=-1)}}
                            @drop=${r=>{r.preventDefault(),this._editDropStep(this._dragStepFrom,t)}}
                            @dragend=${()=>{this._dragStepOver=-1,this._dragStepFrom=-1}}
                          >
                            <ha-icon
                              icon="mdi:drag-vertical"
                              class="drag-handle"
                            ></ha-icon>
                            <span class="edit-ing-text">${i}</span>
                            <div class="edit-reorder-btns">
                              <button
                                class="edit-move-btn"
                                ?disabled=${t===0}
                                @click=${()=>this._editMoveStep(t,-1)}
                                title="${o("Move up")}"
                              >
                                <ha-icon icon="mdi:chevron-up"></ha-icon>
                              </button>
                              <button
                                class="edit-move-btn"
                                ?disabled=${t===e.instructions.length-1}
                                @click=${()=>this._editMoveStep(t,1)}
                                title="${o("Move down")}"
                              >
                                <ha-icon icon="mdi:chevron-down"></ha-icon>
                              </button>
                            </div>
                            <button
                              class="edit-remove-btn"
                              @click=${()=>this._editRemoveStep(t)}
                            >
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
                  placeholder="${o("Type a step, press Enter to add\u2026")}"
                ></textarea>
                <button
                  class="edit-add-btn"
                  @click=${()=>{this._editAddStep(this._editStepInput),this._editStepInput=""}}
                >
                  ${o("Add")}
                </button>
              </div>

              <!-- Nutrition section -->
              <div class="edit-section-label">
                ${o("Nutrition Facts (per serving)")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(o("Calories (kcal)"),"cal","number")}
                ${this._renderField(o("Protein (g)"),"prot","number")}
                ${this._renderField(o("Fat (g)"),"fat","number")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(o("Saturated Fat (g)"),"satf","number")}
                ${this._renderField(o("Carbs (g)"),"carb","number")}
                ${this._renderField(o("Fiber (g)"),"fib","number")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(o("Sugar (g)"),"sug","number")}
                ${this._renderField(o("Sodium (mg)"),"sod","number")}
                ${this._renderField(o("Cholesterol (mg)"),"chol","number")}
              </div>
            </div>
            <div class="edit-footer">
              <button
                class="action-btn danger-outline"
                @click=${this._handleDeleteRecipe}
                title="${this._confirmDelete?o("Click again to confirm delete"):o("Delete recipe")}"
              >
                <ha-icon
                  icon="${this._confirmDelete?"mdi:alert":"mdi:trash-can-outline"}"
                ></ha-icon>
                ${this._confirmDelete?o("Confirm?"):o("Delete")}
              </button>
              <div class="edit-footer-right">
                <button class="action-btn" @click=${this._cancelEdit}>
                  ${o("Cancel")}
                </button>
                <button class="action-btn primary" @click=${this._saveEdit}>
                  ${o("Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      `}_renderField(e,i,t){let r=this._editData[i]??"";return t==="textarea"?h`
          <div class="edit-field">
            <label>${e}</label>
            <textarea
              .value=${r}
              @input=${a=>this._handleEditField(i,a.target.value)}
              rows="3"
            ></textarea>
          </div>
        `:h`
        <div class="edit-field">
          <label>${e}</label>
          <input
            type="${t}"
            .value=${String(r)}
            @input=${a=>this._handleEditField(i,a.target.value)}
          />
        </div>
      `}};var _t=pe`
  :host {
    display: block;
    height: 100%;
  }

  .detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  /* Wide two-column layout */
  .detail-container.wide {
    flex-direction: row;
  }
  .detail-left {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--rm-border);
    overflow: hidden;
  }
  .detail-left .hero-img {
    height: 240px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    background: var(--rm-bg-elevated);
  }
  .detail-left .hero-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .detail-left .hero-img .hero-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
  }
  .detail-left .hero-img .hero-placeholder ha-icon {
    --mdc-icon-size: 64px;
    opacity: 0.3;
  }
  .detail-left-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 16px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border) transparent;
  }
  .detail-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .detail-right-header {
    padding: 16px 16px 0;
    flex-shrink: 0;
  }
  .detail-right-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px 16px 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border) transparent;
  }
  .notes-section {
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid var(--rm-border);
  }
  .notes-section h3 {
    margin: 0 0 8px;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--rm-text-secondary);
  }

  /* Recipe title */
  .recipe-title {
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 700;
    color: var(--rm-text);
    line-height: 1.2;
  }
  .recipe-title.wide-centered {
    text-align: center;
    font-size: 22px;
  }
  .detail-desc.wide-centered {
    text-align: center;
  }
  .detail-right-header .quick-rating {
    justify-content: center;
  }
  .detail-right-header .action-btns-row {
    justify-content: center;
  }

  /* Quick rating */
  .quick-rating {
    display: flex;
    gap: 2px;
    margin: 0 0 8px;
  }
  .qr-star {
    font-size: 20px;
    cursor: pointer;
    color: var(--rm-border);
    -webkit-text-stroke: 1px rgba(200, 150, 0, 0.4);
    transition: color 0.15s;
  }
  .qr-star.filled {
    color: #f5a623;
    -webkit-text-stroke: 1px #c47f0a;
  }
  .qr-star:hover {
    color: #f5a623;
  }

  /* Action buttons row */
  .action-btns-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin: 6px 0 10px;
    justify-content: center;
  }
  .action-icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--rm-text-secondary);
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    transition: color 0.15s;
    text-decoration: none;
    width: 56px;
  }
  .action-icon-btn .btn-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .action-icon-btn ha-icon {
    --mdc-icon-size: 22px;
  }
  .action-icon-btn:hover .btn-icon {
    background: var(--rm-accent-soft);
  }
  .action-icon-btn:hover {
    color: var(--rm-accent, #ff6b35);
  }
  .action-icon-btn.fav-active .btn-icon {
    background: var(--rm-error-soft, #f6e5df);
  }
  .action-icon-btn.fav-active {
    color: var(--rm-error, #983d25);
  }
  .action-icon-btn.danger .btn-icon {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }
  .action-icon-btn.danger {
    color: var(--rm-error, #983d25);
  }

  /* Meta chips (wide layout) */
  .meta-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
    justify-content: center;
  }
  .meta-chip-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 5px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary);
    font-weight: 600;
  }
  .meta-chip-icon ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Chip groups: column of rows, each row = label chip + value chips */
  .chips-area {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .chip-group-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .chip-label {
    background: var(--rm-bg-main);
    border: 1px solid var(--rm-border);
    color: var(--rm-text-secondary);
    font-weight: 600;
    cursor: default;
  }

  /* Hero */
  .hero {
    flex-shrink: 0;
    height: 180px;
    position: relative;
    background: var(--rm-bg-elevated, #2c2c2e);
    overflow: hidden;
  }
  .hero.no-image {
    height: 80px;
  }
  .hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
  .hero-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .hero-placeholder ha-icon {
    --mdc-icon-size: 48px;
    opacity: 0.4;
  }

  .hero-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
  }
  .hero-btn {
    background: rgba(0, 0, 0, 0.55);
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    transition:
      background 0.15s,
      color 0.15s;
    padding: 0;
  }
  .hero-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .hero-btn:hover {
    background: rgba(0, 0, 0, 0.75);
  }
  .hero-btn.fav-active {
    color: #ffb5c0;
  }
  .hero-btn.delete-btn.confirm {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }

  /* Scroll area */
  .detail-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border, rgba(255, 255, 255, 0.08)) transparent;
  }

  .detail-head {
    margin-bottom: 12px;
  }
  .detail-desc {
    margin: 0 0 8px;
    font-size: var(--rm-font-size-sm, 14px);
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
  .meta-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .meta-val {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text, #e5e5ea);
  }

  .tags-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .tag-chip {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
    color: var(--rm-accent, #ff6b35);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: var(--rm-font-size-xs, 12px);
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
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .chip {
    border-radius: 20px;
    padding: 3px 10px;
    font-size: var(--rm-font-size-xs, 12px);
    border: none;
    cursor: default;
  }
  .chip-nav {
    cursor: pointer;
    transition:
      filter 0.15s,
      opacity 0.15s;
  }
  .chip-nav:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .chip-course {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
  }
  .chip-category {
    background: var(--rm-success-soft, #e2eee7);
    color: var(--rm-success, #326044);
  }
  .chip-collection {
    background: var(--rm-warning-soft, #f2ebd5);
    color: var(--rm-warning, #765600);
  }
  .chip-tag {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
  }

  /* Scaler */
  .scaler-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .scaler-icon {
    --mdc-icon-size: 18px;
    color: var(--rm-text-secondary);
    flex-shrink: 0;
  }
  .scaler-ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .scaler-btn {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
    padding: 0;
    transition: all 0.15s;
  }
  .scaler-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .scaler-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .scaler-val {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text);
    min-width: 34px;
    height: 34px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 8px;
  }

  /* Tabs */
  .tabs-row {
    display: flex;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    margin-bottom: 14px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs-row::-webkit-scrollbar {
    display: none;
  }
  .tab-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 11px 14px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text-secondary, #8e8e93);
    transition:
      color 0.15s,
      border-color 0.15s;
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
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    cursor: pointer;
    color: var(--rm-text-secondary);
    transition: all 0.15s;
  }
  .wakelock-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .wakelock-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .wakelock-unsupported {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px dashed var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-muted);
  }
  .wakelock-unsupported ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Metric toggle */
  .metric-toggle-row {
    display: flex;
    justify-content: flex-end;
    padding: 0 0 8px;
  }
  .metric-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    cursor: pointer;
    color: var(--rm-text-secondary);
    transition: all 0.15s;
  }
  .metric-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .metric-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }

  /* Ingredient section heading */
  .ing-heading {
    list-style: none;
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rm-accent);
    padding: 10px 0 4px;
    margin-top: 6px;
  }

  /* Ingredients */
  .ingredient-list {
    list-style: none;
    padding: 0;
    margin: 0 0 16px;
  }
  .ingredient-item {
    display: flex;
    gap: 10px;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
  }
  .ingredient-item:last-child {
    border-bottom: none;
  }
  .ing-amount {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-accent, #ff6b35);
    min-width: 70px;
    flex-shrink: 0;
  }
  .ing-name {
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
  }
  .ing-notes {
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    font-style: italic;
  }

  /* Ingredient checkbox selection */
  .ingredient-item.selectable {
    cursor: pointer;
    border-radius: 6px;
    padding-left: 4px;
  }
  .ingredient-item.selectable:hover {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.1));
  }
  .ing-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--rm-border, rgba(255, 255, 255, 0.15));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .ing-check.checked {
    background: var(--rm-accent, #ff6b35);
    border-color: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }
  .ing-check ha-icon {
    --mdc-icon-size: 12px;
  }

  /* Shopping */
  .shopping-section {
    margin-top: 12px;
  }
  .shopping-btn {
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
  .shopping-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .shopping-picker-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
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
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 6px;
    color: var(--rm-text-secondary, #8e8e93);
    padding: 4px 10px;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .picker-sel-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-text);
  }
  .picker-btns {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .shopping-note {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
  }
  .list-select {
    flex: 1;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    min-width: 120px;
  }
  .shopping-success {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--rm-success, #326044);
    font-size: var(--rm-font-size-sm, 14px);
    padding: 8px 0;
  }
  .shopping-success ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Directions */
  .steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
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
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-accent-text, #fff);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;
    user-select: none;
  }
  .step-num:hover {
    opacity: 0.8;
  }
  .step-num.done {
    background: transparent;
    border: 2px solid var(--rm-border, rgba(255, 255, 255, 0.2));
    color: var(--rm-text-muted);
  }
  .step-num.done ha-icon {
    --mdc-icon-size: 16px;
  }
  .step-item.step-done .step-text {
    color: var(--rm-text-secondary);
    text-decoration: line-through;
    text-decoration-color: var(--rm-border);
  }
  .step-text {
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
    line-height: 1.7;
    transition: opacity 0.2s;
  }

  /* Timer chip in directions */
  .time-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
    color: var(--rm-accent, #ff6b35);
    border: 1px solid var(--rm-accent, #ff6b35);
    border-radius: 12px;
    padding: 1px 7px;
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    vertical-align: middle;
  }
  .time-chip ha-icon {
    --mdc-icon-size: 12px;
  }
  .time-chip:hover {
    background: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }

  /* Notes */
  .notes-text {
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
    line-height: 1.6;
  }
  .empty-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    text-align: center;
    padding: 20px 0;
    margin: 0;
  }
  .empty-tab ha-icon {
    --mdc-icon-size: 40px;
    opacity: 0.35;
  }
  .empty-tab p {
    margin: 0;
  }

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
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    margin-bottom: 6px;
  }
  .nutr-divider {
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.15));
    margin: 2px 0;
  }
  .nutr-divider.thick {
    border-top: 6px solid var(--rm-text, #e5e5ea);
    margin: 4px 0;
  }
  .nutr-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 0;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
  }
  .nutr-bold {
    font-weight: 700;
    font-size: var(--rm-font-size-base, 16px);
  }
  .nutr-indent {
    padding-left: 14px;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .nutr-val {
    font-weight: 600;
    white-space: nowrap;
  }
  .nutr-val em {
    font-style: normal;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
  }

  /* Nutrition card */
  .nutr-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .nutr-top {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .nutr-ring-wrap {
    flex-shrink: 0;
    width: 90px;
    height: 90px;
  }
  .nutr-macro-cols {
    display: flex;
    gap: 10px;
    flex: 1;
    justify-content: space-around;
  }
  .nutr-macro-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .nutr-mcol-num {
    font-size: 17px;
    font-weight: 700;
    line-height: 1;
  }
  .nutr-mcol-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary);
    font-weight: 500;
  }
  .nutr-mcol-pct {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
  }
  .nutr-serving-note {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-muted);
    text-align: center;
    margin-top: -4px;
  }
  /* Daily RDA expandable */
  .nutr-rda-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    border-top: 1px solid var(--rm-border);
    padding: 10px 0 0;
    cursor: pointer;
    color: var(--rm-text);
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    width: 100%;
    text-align: left;
  }
  .nutr-rda-title {
    flex: 1;
  }
  .nutr-rda-count {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    color: var(--rm-text-secondary);
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 10px;
    padding: 1px 7px;
  }
  .nutr-rda-toggle ha-icon {
    --mdc-icon-size: 18px;
    color: var(--rm-text-secondary);
  }
  .nutr-rda-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 6px;
  }
  .nutr-rda-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-template-rows: auto 4px;
    column-gap: 8px;
    row-gap: 4px;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .nutr-rda-label {
    color: var(--rm-text-secondary);
    grid-column: 1;
    grid-row: 1;
  }
  .nutr-rda-val {
    color: var(--rm-text);
    font-weight: 600;
    grid-column: 2;
    grid-row: 1;
    white-space: nowrap;
  }
  .nutr-rda-pct {
    color: var(--rm-text-muted);
    grid-column: 3;
    grid-row: 1;
    white-space: nowrap;
    min-width: 36px;
    text-align: right;
  }
  .nutr-rda-bar-wrap {
    grid-column: 1 / -1;
    grid-row: 2;
    background: var(--rm-border);
    border-radius: 2px;
    height: 4px;
    overflow: hidden;
  }
  .nutr-rda-bar {
    height: 100%;
    background: var(--rm-accent);
    border-radius: 2px;
    transition: width 0.3s;
  }
  .nutr-rda-bar.over {
    background: var(--rm-error, #983d25);
  }

  /* Photos tab */
  .photos-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
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
  .photo-item.main-photo {
    border-color: var(--rm-accent, #ff6b35);
  }
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .photo-badge {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .photo-action {
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
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
  .photo-action ha-icon {
    --mdc-icon-size: 14px;
  }
  .photo-action:hover {
    background: rgba(0, 0, 0, 0.85);
  }
  .remove-photo {
    top: 4px;
    right: 4px;
  }
  .set-main {
    bottom: 4px;
    left: 4px;
  }

  .photo-add-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
  }
  .photo-add-label {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .photo-url-row {
    display: flex;
    gap: 8px;
  }
  .photo-url-input {
    flex: 1;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
  }
  .photo-url-input:focus {
    outline: none;
    border-color: var(--rm-accent, #ff6b35);
  }
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
    font-size: var(--rm-font-size-xs, 12px);
    text-align: center;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .camera-btn-split:hover {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
  }
  .camera-btn-split ha-icon {
    --mdc-icon-size: 28px;
    color: var(--rm-accent, #ff6b35);
  }
  .camera-input {
    display: none;
  }

  /* Buttons */
  .action-btn {
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 14px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s;
  }
  .action-btn.primary {
    background: var(--rm-accent, #ff6b35);
    border-color: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }
  .action-btn:disabled {
    color: var(--rm-disabled-text, var(--rm-text-secondary));
    background: var(--rm-disabled-bg, var(--rm-bg-elevated));
    cursor: not-allowed;
  }
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--rm-text-secondary, #8e8e93);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  /* Edit overlay */
  .edit-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    z-index: 10;
  }
  .edit-panel {
    background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
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
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    font-weight: 600;
    font-size: var(--rm-font-size-base, 16px);
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
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rm-text-muted, #8e8e93);
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
  }
  .edit-row-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .edit-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .edit-field label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .edit-field input,
  .edit-field textarea {
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    resize: vertical;
  }
  .edit-field input:focus,
  .edit-field textarea:focus {
    outline: none;
    border-color: var(--rm-accent, #ff6b35);
  }
  .edit-photo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
  }
  .edit-photo-thumb {
    position: relative;
    width: 144px;
    height: 144px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid transparent;
    transition: border-color 0.15s;
  }
  .edit-photo-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .edit-photo-thumb.selected {
    border-color: var(--rm-accent, #ff6b35);
  }
  .edit-thumb-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: var(--rm-accent, #ff6b35);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .edit-thumb-badge ha-icon {
    --mdc-icon-size: 16px;
    color: var(--rm-accent-text, #fff);
  }
  .edit-photo-add {
    width: 144px;
    height: 144px;
    border-radius: 8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    border: 2px dashed var(--rm-accent, #ff6b35);
    cursor: pointer;
    color: var(--rm-accent, #ff6b35);
    transition: background 0.15s;
  }
  .edit-photo-add:hover {
    background: var(--rm-accent-soft);
  }
  .edit-photo-add.loading {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .edit-photo-add ha-icon {
    --mdc-icon-size: 40px;
  }
  .edit-stars {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }
  .edit-star {
    font-size: 32px;
    color: var(--rm-border, rgba(255, 255, 255, 0.3));
    cursor: pointer;
    transition: color 0.12s;
    line-height: 1;
    -webkit-text-stroke: 1px rgba(200, 150, 50, 0.5);
  }
  .edit-star.filled {
    color: #f5a623;
    -webkit-text-stroke: 1px #d4881b;
  }
  .edit-star:hover {
    color: #f5a623;
  }
  .edit-footer {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
  }
  .edit-footer-right {
    display: flex;
    gap: 8px;
  }

  /* Edit ingredient/step lists */
  .edit-ing-list,
  .edit-steps-list {
    list-style: none;
    padding: 0;
    margin: 0 0 6px;
  }
  .edit-ing-list li,
  .edit-steps-list li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
  }
  .edit-ing-heading {
    font-weight: 700;
    color: var(--rm-accent) !important;
  }
  .edit-ing-text {
    flex: 1;
    line-height: 1.4;
  }
  .drag-handle {
    flex-shrink: 0;
    cursor: grab;
    color: var(--rm-text-muted, #636366);
    --mdc-icon-size: 18px;
    touch-action: none;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
  .edit-ing-list li.drag-over,
  .edit-steps-list li.drag-over {
    border-top: 2px solid var(--rm-accent);
    margin-top: -1px;
  }
  .edit-reorder-btns {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 0;
  }
  .edit-move-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    color: var(--rm-text-secondary, #8e8e93);
    --mdc-icon-size: 14px;
  }
  .edit-move-btn:disabled {
    opacity: 0.2;
    cursor: default;
  }
  .edit-remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    color: var(--rm-text-secondary, #8e8e93);
    padding: 2px;
    margin-top: 1px;
  }
  .edit-remove-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .edit-add-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-bottom: 4px;
  }
  .edit-add-row input,
  .edit-add-row textarea {
    flex: 1;
    background: var(--rm-bg-elevated, #232833);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 7px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    resize: none;
  }
  .edit-add-row input:focus,
  .edit-add-row textarea:focus {
    outline: none;
    border-color: var(--rm-accent, #9fa8da);
  }
  .edit-add-btn {
    background: var(--rm-accent, #9fa8da);
    border: none;
    border-radius: 8px;
    color: var(--rm-accent-text, #fff);
    padding: 7px 12px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Danger outline button */
  .action-btn.danger-outline {
    color: var(--rm-error, #983d25);
    border-color: var(--rm-error, #983d25);
  }
  .action-btn.danger-outline:hover {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
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
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .wide-image-square .hero-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
  }
  .wide-image-square .hero-placeholder ha-icon {
    --mdc-icon-size: 64px;
    opacity: 0.3;
  }
  .slide-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.45);
    border: none;
    color: #fff;
    cursor: pointer;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 2;
    transition: background 0.15s;
  }
  .slide-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  .slide-btn ha-icon {
    --mdc-icon-size: 20px;
  }
  .slide-prev {
    left: 6px;
  }
  .slide-next {
    right: 6px;
  }
  .slide-dots {
    position: absolute;
    bottom: 7px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    z-index: 2;
  }
  .slide-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
    transition: background 0.15s;
  }
  .slide-dot.active {
    background: #fff;
  }

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
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 700;
    color: var(--rm-text);
    line-height: 1.2;
    text-align: center;
  }
  .wide-desc {
    text-align: center;
    margin: 6px 0;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary);
    line-height: 1.5;
  }
  .wide-info-card .quick-rating {
    justify-content: center;
    margin-bottom: 6px;
  }
  .wide-info-card .action-btns-row {
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
  .wide-info-card .meta-chips {
    justify-content: center;
    margin-top: 6px;
  }
  /* Chips pushed to bottom-left of info card */
  .wide-info-card .chips-area {
    align-self: flex-start;
    margin-top: auto;
    padding-top: 10px;
  }

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
  .wide-dir-spacer {
    min-height: 42px;
  }
  .ing-shop-btn {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
    padding: 0;
    transition: all 0.15s;
  }
  .ing-shop-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .ing-shop-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .ing-shop-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent);
    border-color: var(--rm-accent);
  }
  .ing-shop-success {
    color: var(--rm-success, #326044);
    display: flex;
    align-items: center;
  }
  .ing-shop-success ha-icon {
    --mdc-icon-size: 22px;
  }
  .shopping-review-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    padding: 12px;
  }
  .review-title {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .review-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
  }
  .review-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .review-ing {
    display: flex;
    align-items: baseline;
    gap: 4px;
    flex-wrap: wrap;
  }
  .review-qty {
    font-size: 0.8rem;
    color: var(--rm-text-secondary, #8e8e93);
    flex-shrink: 0;
  }
  .review-ing-name {
    font-size: 0.9rem;
    font-weight: 500;
  }
  .review-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .review-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1.5px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    background: none;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text, #e5e5ea);
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .review-chip ha-icon {
    --mdc-icon-size: 13px;
  }
  .review-chip.selected {
    border-color: var(--rm-accent, #ff6b35);
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    color: var(--rm-accent, #ff6b35);
    font-weight: 600;
  }
  .review-chip.manual {
    border-style: dashed;
  }
  .review-btns {
    margin-top: 2px;
  }

  /* Section cards (ingredients, nutrition, notes) */
  .wide-section-card {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 14px;
    padding: 12px 14px;
  }
  .wide-section-title {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-text);
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--rm-border);
  }

  /* Per-step direction cards in wide layout */
  .wide-step-card {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .wide-step-card .step-num {
    flex-shrink: 0;
  }
  .wide-step-card .step-text {
    flex: 1;
  }
  .wide-step-card.step-done .step-text {
    color: var(--rm-text-secondary);
    text-decoration: line-through;
    text-decoration-color: var(--rm-border);
  }

  /* ── Markdown content ─────────────────────────────── */
  .md-content {
    font-size: var(--rm-font-size-sm, 14px);
    line-height: 1.65;
  }
  .md-content p {
    margin: 0 0 6px;
  }
  .md-content p.md-gap {
    margin: 0 0 10px;
  }
  .md-content h1 {
    font-size: 18px;
    font-weight: 700;
    margin: 10px 0 4px;
  }
  .md-content h2 {
    font-size: var(--rm-font-size-base, 16px);
    font-weight: 700;
    margin: 8px 0 4px;
  }
  .md-content h3 {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    margin: 6px 0 3px;
  }
  .md-content ul,
  .md-content ol {
    padding-left: 20px;
    margin: 4px 0 8px;
  }
  .md-content li {
    margin: 2px 0;
  }
  .md-content strong {
    font-weight: 700;
  }
  .md-content em {
    font-style: italic;
  }
  .md-content code {
    font-family: monospace;
    font-size: var(--rm-font-size-xs, 12px);
    background: var(--rm-bg-elevated);
    padding: 1px 4px;
    border-radius: 3px;
  }
  .md-content a {
    color: var(--rm-accent);
    text-decoration: none;
  }
  .md-content a:hover {
    text-decoration: underline;
  }
  .md-content hr {
    border: none;
    border-top: 1px solid var(--rm-border);
    margin: 8px 0;
  }

  /* ── List picker (tags / courses / categories / collections) ─── */
  .list-picker-field {
    position: relative;
  }
  .list-picker-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .list-picker-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    min-height: 28px;
  }
  .list-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 14px;
    font-size: var(--rm-font-size-xs, 12px);
    border: 1px solid var(--rm-border);
    background: var(--rm-bg-elevated);
    color: var(--rm-text);
    cursor: default;
    transition: all 0.12s;
  }
  .list-chip.selected {
    background: var(--rm-accent-soft);
    border-color: var(--rm-accent);
    color: var(--rm-accent);
  }
  .list-chip.available {
    cursor: pointer;
    color: var(--rm-text-muted);
  }
  .list-chip.available:hover {
    border-color: var(--rm-accent);
    color: var(--rm-accent);
    background: var(--rm-accent-soft);
  }
  .list-chip-remove {
    background: none;
    border: none;
    padding: 0 0 0 2px;
    cursor: pointer;
    color: inherit;
    font-size: var(--rm-font-size-sm, 14px);
    line-height: 1;
    opacity: 0.7;
  }
  .list-chip-remove:hover {
    opacity: 1;
  }
  .list-chip-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px dashed var(--rm-border);
    background: none;
    cursor: pointer;
    color: var(--rm-text-muted);
    transition: all 0.12s;
  }
  .list-chip-add-btn:hover {
    border-color: var(--rm-accent);
    color: var(--rm-accent);
  }
  .list-chip-add-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .list-picker-dropdown {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  }
  .list-picker-existing {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .list-picker-new-row {
    display: flex;
    gap: 6px;
  }
  .list-picker-input {
    flex: 1;
    background: var(--rm-bg-surface, var(--rm-bg-main));
    border: 1px solid var(--rm-border);
    border-radius: 7px;
    color: var(--rm-text);
    padding: 5px 9px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    min-width: 0;
  }
  .list-picker-input:focus {
    outline: none;
    border-color: var(--rm-accent);
  }
  .list-picker-new-btn {
    padding: 5px 12px;
    border-radius: 7px;
    border: 1px solid var(--rm-accent);
    background: var(--rm-accent);
    color: var(--rm-accent-text, #fff);
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
  }
  .list-picker-new-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ── Inline ingredient edit ──────────────────────── */
  .edit-ing-text {
    cursor: pointer;
    flex: 1;
  }
  .edit-ing-text:hover {
    color: var(--rm-accent);
  }
  .edit-ing-inline-edit {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
    list-style: none;
  }
  .ing-inline-input {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-accent);
    border-radius: 6px;
    color: var(--rm-text);
    padding: 4px 6px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    min-width: 0;
  }
  .ing-inline-input:focus {
    outline: none;
  }
  .ing-inline-amt {
    width: 52px;
    flex: 0 0 52px;
  }
  .ing-inline-unit {
    width: 60px;
    flex: 0 0 60px;
  }
  .ing-inline-name {
    flex: 1;
  }
  .ing-inline-save,
  .ing-inline-cancel {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid var(--rm-border);
    background: none;
    cursor: pointer;
    color: var(--rm-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ing-inline-save {
    border-color: var(--rm-accent);
    color: var(--rm-accent);
  }
  .ing-inline-save:hover {
    background: var(--rm-accent);
    color: var(--rm-accent-text, #fff);
  }
  .ing-inline-save ha-icon,
  .ing-inline-cancel ha-icon {
    --mdc-icon-size: 13px;
  }

  .detail-container,
  .detail-right,
  .detail-left-scroll,
  .detail-right-scroll,
  .detail-scroll,
  .edit-body {
    min-width: 0;
    min-height: 0;
  }
  .detail-desc,
  .ing-name,
  .notes-text,
  .recipe-title {
    overflow-wrap: anywhere;
  }
  .action-btn,
  .tab-btn,
  .wakelock-btn,
  .metric-btn,
  .photo-url-input,
  .edit-field input,
  .edit-field textarea {
    min-height: var(--rm-touch-target, 44px);
  }
  .hero-btn,
  .scaler-btn,
  .icon-btn,
  .photo-action,
  .slide-btn,
  .ing-shop-btn {
    width: var(--rm-touch-target, 44px);
    height: var(--rm-touch-target, 44px);
  }
  .action-icon-btn {
    width: 76px;
    line-height: 1.4;
  }
  .edit-field input,
  .edit-field textarea,
  .photo-url-input {
    font-size: var(--rm-font-size-base, 16px);
    border-color: var(--rm-border-strong, var(--rm-border));
  }
  .edit-panel {
    border: 1px solid var(--rm-border);
    max-height: 82dvh;
  }
  .edit-footer,
  .edit-footer-right {
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .edit-row-3 {
      grid-template-columns: minmax(0, 1fr);
    }
    .action-btns-row {
      gap: 8px;
    }
    .nutr-top {
      flex-wrap: wrap;
      justify-content: center;
    }
    .photo-url-row {
      flex-wrap: wrap;
    }
  }
  ${ue}
`;var xt="recipe-detail",wt=[{key:"calories",label:o("Calories"),unit:"kcal",bold:!0},{key:"fat",label:o("Total Fat"),unit:"g"},{key:"saturated_fat",label:o("Saturated Fat"),unit:"g",indent:!0},{key:"cholesterol",label:o("Cholesterol"),unit:"mg"},{key:"sodium",label:o("Sodium"),unit:"mg"},{key:"carbohydrates",label:o("Total Carbohydrate"),unit:"g"},{key:"fiber",label:o("Dietary Fiber"),unit:"g",indent:!0},{key:"sugar",label:o("Total Sugars"),unit:"g",indent:!0},{key:"protein",label:o("Protein"),unit:"g"}],yt=/(\d+\s*(?:hours?|hrs?)\s*(?:and\s*)?\d*\s*(?:minutes?|mins?)?|\d+\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?))/gi;function jt(u){let e=u.toLowerCase(),i=0,t=e.match(/(\d+)\s*h(?:ours?|rs?)?/);t&&(i+=parseInt(t[1])*3600);let r=e.match(/(\d+)\s*m(?:in(?:utes?)?)?(?!\s*l)/);r&&(i+=parseInt(r[1])*60);let a=e.match(/(\d+)\s*s(?:ec(?:onds?)?)?/);if(a&&(i+=parseInt(a[1])),!i){let s=e.match(/^(\d+)$/);s&&(i=parseInt(s[1])*60)}return i||0}var Ut={calories:{label:o("Calories"),val:2e3,unit:"kcal"},fat:{label:o("Total Fat"),val:65,unit:"g"},saturated_fat:{label:o("Saturated Fat"),val:20,unit:"g"},cholesterol:{label:o("Cholesterol"),val:300,unit:"mg"},sodium:{label:o("Sodium"),val:2300,unit:"mg"},carbohydrates:{label:o("Total Carbohydrate"),val:300,unit:"g"},fiber:{label:o("Dietary Fiber"),val:28,unit:"g"},sugar:{label:o("Added Sugars"),val:50,unit:"g"},protein:{label:o("Protein"),val:50,unit:"g"}},kt={oz:{factor:28.3495,to:"g",toFull:"g"},lb:{factor:453.592,to:"g",toFull:"g",thresholdKg:500},cup:{factor:250,to:"ml",toFull:"ml"},cups:{factor:250,to:"ml",toFull:"ml"},"fl oz":{factor:29.5735,to:"ml",toFull:"ml"},pt:{factor:473.176,to:"ml",toFull:"ml"},qt:{factor:946.353,to:"ml",toFull:"ml"}};function Wt(u,e){if(!u||!e)return null;let i=Ge(u);if(i===null)return null;let t=e.toLowerCase().trim(),r=kt[t];if(!r)return null;let a=i*r.factor,s=r.to;t==="lb"&&a>=500&&(a=a/1e3,s="kg"),s==="ml"&&a>=1e3&&(a=a/1e3,s="L");let c=a>=10?Math.round(a):Math.round(a*10)/10;return{amount:String(c),unit:s}}var Ve=class extends vt(he){static properties={recipe:{type:Object},api:{type:Object},settings:{type:Object},wide:{type:Boolean},_editing:{type:Boolean},_editData:{type:Object},_servingMult:{type:Number},_activeTab:{type:String},_confirmDelete:{type:Boolean},_downloading:{type:Boolean},_photoUrlInput:{type:String},_addingPhotoUrl:{type:Boolean},_metricMode:{type:Boolean},_wakeActive:{type:Boolean},_completedSteps:{type:Object},_editIngInput:{type:String},_editStepInput:{type:String},_nutritionExpanded:{type:Boolean},_dragIngOver:{type:Number},_dragStepOver:{type:Number},_editImageUploading:{type:Boolean},_slideIdx:{type:Number},allTags:{type:Array},allCourses:{type:Array},allCategories:{type:Array},allCollections:{type:Array},_tagPickerField:{type:String},_tagPickerInput:{type:String},_editIngEdit:{type:Object}};constructor(){super(),this.recipe=null,this.api=null,this.settings={},this.wide=!1,this._editing=!1,this._editData={},this._servingMult=1,this._activeTab="ingredients",this._confirmDelete=!1,this._downloading=!1,this._photoUrlInput="",this._addingPhotoUrl=!1,this._metricMode=this.settings?.unitSystem==="metric",this._wakeActive=!1,this._completedSteps=new Set,this._editIngInput="",this._editStepInput="",this._nutritionExpanded=!1,this._dragIngOver=-1,this._dragStepOver=-1,this._dragIngFrom=-1,this._dragStepFrom=-1,this._editImageUploading=!1,this._slideIdx=0,this.allTags=[],this.allCourses=[],this.allCategories=[],this.allCollections=[],this._tagPickerField=null,this._tagPickerInput="",this._editIngEdit=null,this._slideTimer=null,this._slideTouchStartX=null,this._wakeLockTimeout=null,this._wakeLockUnsubscribeFn=null}connectedCallback(){super.connectedCallback(),this._wakeLockUnsubscribeFn=ft(e=>{this._wakeActive=e})}disconnectedCallback(){super.disconnectedCallback(),this._releaseWakeLock(),this._wakeLockUnsubscribeFn?.(),this._wakeLockUnsubscribeFn=null,this._stopSlideTimer()}async _requestWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await Ne(xt);let e=this.settings?.wakeLockDuration??60;this._wakeLockTimeout=setTimeout(()=>this._releaseWakeLock(),e*6e4)}async _releaseWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await Ae(xt)}updated(e){if(e.has("recipe")&&this.recipe){let i=e.get("recipe"),t=!i||i.id!==this.recipe.id;this._servingMult=1,t&&(this._editing=!1,this._confirmDelete=!1,this._photoUrlInput="",this._metricMode=this.settings?.unitSystem==="metric",this._completedSteps=new Set),this._slideIdx=0,this._startSlideTimer()}e.has("settings")&&this._startSlideTimer(),(e.has("recipe")||e.has("settings"))&&this.recipe&&(this.settings?.keepScreenOn?this._requestWakeLock():this._releaseWakeLock()),e.has("recipe")&&!this.recipe&&this._releaseWakeLock()}_formatTime(e){if(!e)return null;if(e<60)return o(te`${e} min`);let i=Math.floor(e/60),t=e%60;return t?o(te`${i}h ${t}m`):o(te`${i}h`)}_scaleAmount(e){return gt(e,this._servingMult)}_handleToggleFav(){this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}async _handleDownloadImage(){if(this.recipe.image_url){this._downloading=!0;try{let e=await this.api.downloadRecipeImage(this.recipe.id,this.recipe.image_url);e?.local_url&&this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e.local_url}},bubbles:!0,composed:!0}))}catch(e){console.warn("Image download failed:",e)}finally{this._downloading=!1}}}_handleDeleteRecipe(){if(!this._confirmDelete){this._confirmDelete=!0,setTimeout(()=>{this._confirmDelete=!1},3e3);return}this.dispatchEvent(new CustomEvent("rm-delete-recipe",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}_handleQuickRate(e){let i=this.recipe.rating===e?null:e;this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{rating:i}},bubbles:!0,composed:!0}))}_handleShowPlanner(){this.dispatchEvent(new CustomEvent("rm-show-planner",{bubbles:!0,composed:!0}))}_handleChipNav(e,i){this.dispatchEvent(new CustomEvent("rm-chip-nav",{detail:{filterMode:e,value:i},bubbles:!0,composed:!0}))}_fireTimer(e,i){let t=this.recipe?.name,r=t?o(te`${t} — ${i}`):i;this.dispatchEvent(new CustomEvent("rm-start-timer",{detail:{seconds:e,label:r},bubbles:!0,composed:!0}))}async _handleAddPhotoUrl(){let e=this._photoUrlInput.trim();if(e){this._addingPhotoUrl=!0;try{let r={photos:[...this.recipe.photos||[],e]};this.recipe.image_url||(r.image_url=e),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:r},bubbles:!0,composed:!0})),this._photoUrlInput=""}finally{this._addingPhotoUrl=!1}}}_handleCameraCapture(e){let i=e.target.files?.[0];if(!i)return;let t=new FileReader;t.onload=async r=>{let a=r.target.result.split(",")[1];try{await this.api.uploadRecipeImage(this.recipe.id,a)}catch(s){console.warn("Camera upload failed:",s)}},t.readAsDataURL(i)}_setMainPhoto(e){this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e}},bubbles:!0,composed:!0}))}_removePhoto(e){let i=(this.recipe.photos||[]).filter(r=>r!==e),t={photos:i};this.recipe.image_url===e&&(t.image_url=i[0]||null),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:t},bubbles:!0,composed:!0}))}_getSlideImages(){let e=this.recipe;if(!e)return[];let i=[e.image_url,...e.photos||[]].filter(Boolean);return[...new Set(i)]}_prevSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx-1+e.length)%e.length,this._startSlideTimer())}_nextSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx+1)%e.length,this._startSlideTimer())}_startSlideTimer(){this._stopSlideTimer();let e=this.settings?.slideshowInterval??5;e<=0||this._getSlideImages().length<2||(this._slideTimer=setInterval(()=>{this._slideIdx=(this._slideIdx+1)%this._getSlideImages().length},e*1e3))}_stopSlideTimer(){this._slideTimer&&(clearInterval(this._slideTimer),this._slideTimer=null)}_slideTouchStart(e){this._slideTouchStartX=e.touches[0]?.clientX??null}_slideTouchEnd(e){if(this._slideTouchStartX==null)return;let i=(e.changedTouches[0]?.clientX??0)-this._slideTouchStartX;this._slideTouchStartX=null,!(Math.abs(i)<50)&&(i<0?this._nextSlide():this._prevSlide())}_renderSlideshow(e){let i=this._getSlideImages(),t=Math.min(this._slideIdx,i.length-1),r=i.length>1,a=i[t]||null;return h`
      <div
        class="wide-image-square"
        @touchstart=${r?this._slideTouchStart:null}
        @touchend=${r?this._slideTouchEnd:null}
      >
        ${a?h`<img
              src="${this.api.transport.previewURL(a)||ye}"
              alt="${e.name}"
            />`:h`
              <div class="hero-placeholder">
                <ha-icon icon="mdi:food"></ha-icon>
              </div>
            `}
        ${r?h`
              <button
                class="slide-btn slide-prev"
                @click=${this._prevSlide}
                title="${o("Previous")}"
              >
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </button>
              <button
                class="slide-btn slide-next"
                @click=${this._nextSlide}
                title="${o("Next")}"
              >
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>
              <div class="slide-dots">
                ${i.map((s,c)=>h`<span
                      class="slide-dot ${c===t?"active":""}"
                    ></span>`)}
              </div>
            `:""}
      </div>
    `}_renderChipGroup(e,i,t){return i?.length?h`
      <div class="chip-group">
        <span class="chip-group-label">${e}:</span>
        ${i.map(r=>h`<span class="chip ${t}">${r}</span>`)}
      </div>
    `:""}_renderChipGroups(e){let i=e.courses||[],t=e.categories||[],r=e.collections||[];return!i.length&&!t.length&&!r.length?"":h`
      <div class="chips-area">
        ${i.length?h` <div class="chip-group-row">
              <span class="chip chip-label">${o("Course:")}</span>
              ${i.map(a=>h`<button
                    class="chip chip-course chip-nav"
                    @click=${()=>this._handleChipNav("courses",a)}
                    title="${o(te`Filter by course: ${a}`)}"
                  >
                    ${a}
                  </button>`)}
            </div>`:""}
        ${t.length?h` <div class="chip-group-row">
              <span class="chip chip-label">${o("Category:")}</span>
              ${t.map(a=>h`<button
                    class="chip chip-category chip-nav"
                    @click=${()=>this._handleChipNav("categories",a)}
                    title="${o(te`Filter by category: ${a}`)}"
                  >
                    ${a}
                  </button>`)}
            </div>`:""}
        ${r.length?h` <div class="chip-group-row">
              <span class="chip chip-label">${o("Collection:")}</span>
              ${r.map(a=>h`<button
                    class="chip chip-collection chip-nav"
                    @click=${()=>this._handleChipNav("collections",a)}
                    title="${o(te`Filter by collection: ${a}`)}"
                  >
                    ${a}
                  </button>`)}
            </div>`:""}
      </div>
    `}_renderMetaRow(e){if(!(e.servings||e.prep_time||e.cook_time||e.total_time))return"";let t=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null,r=(e.prep_time||0)+(e.cook_time||0),a=t&&t!==r;return h`
      <div class="meta-chips">
        ${e.servings?h`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
                ${e.servings_text||e.servings}
              </span>
            `:""}
        ${e.prep_time?h`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:pencil-outline"></ha-icon>
                ${this._formatTime(e.prep_time)}
              </span>
            `:""}
        ${e.cook_time?h`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
                ${this._formatTime(e.cook_time)}
              </span>
            `:""}
        ${a?h`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:clock-outline"></ha-icon>
                ${this._formatTime(t)}
              </span>
            `:""}
      </div>
    `}_renderQuickRating(e){let i=e.rating||0;return h`
      <div class="quick-rating">
        ${[1,2,3,4,5].map(t=>h`
            <span
              class="qr-star ${t<=i?"filled":""}"
              @click=${()=>this._handleQuickRate(t)}
              >★</span
            >
          `)}
      </div>
    `}_renderActionButtons(e){return h`
      <div class="action-btns-row">
        <button
          class="action-icon-btn ${e.is_favourite?"fav-active":""}"
          @click=${this._handleToggleFav}
          title="${e.is_favourite?o("Remove from favourites"):o("Add to favourites")}"
        >
          <span class="btn-icon"
            ><ha-icon
              icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"
            ></ha-icon
          ></span>
          <span>${o("Favourite")}</span>
        </button>
        <button
          class="action-icon-btn"
          @click=${this._handleShowPlanner}
          title="${o("Add to meal plan")}"
        >
          <span class="btn-icon"
            ><ha-icon icon="mdi:calendar-plus"></ha-icon
          ></span>
          <span>${o("Plan")}</span>
        </button>
        ${e.source_url?h`
              <a
                class="action-icon-btn"
                href="${e.source_url}"
                target="_blank"
                rel="noopener"
                title="${o("Open source")}"
              >
                <span class="btn-icon"
                  ><ha-icon icon="mdi:open-in-new"></ha-icon
                ></span>
                <span>${o("Source")}</span>
              </a>
            `:""}
        <button
          class="action-icon-btn"
          @click=${this._startEdit}
          title="${o("Edit recipe")}"
        >
          <span class="btn-icon"
            ><ha-icon icon="mdi:pencil-outline"></ha-icon
          ></span>
          <span>${o("Edit")}</span>
        </button>
      </div>
    `}_renderScaler(){return this.recipe?.servings?h`
      <div class="scaler-row">
        <ha-icon class="scaler-icon" icon="mdi:silverware-fork-knife"></ha-icon>
        <div class="scaler-ctrl">
          <button
            class="scaler-btn"
            @click=${()=>{this._servingMult>.25&&(this._servingMult=Math.round((this._servingMult-.25)*4)/4)}}
          >
            <ha-icon icon="mdi:minus"></ha-icon>
          </button>
          <span class="scaler-val">×${this._servingMult}</span>
          <button
            class="scaler-btn"
            @click=${()=>{this._servingMult=Math.round((this._servingMult+.25)*4)/4}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>
    `:""}_renderWakeLock(){return this.settings?.keepScreenOn?xe()?h`
      <div class="wakelock-row">
        <button
          class="wakelock-btn ${this._wakeActive?"active":""}"
          @click=${()=>this._wakeActive?this._releaseWakeLock():this._requestWakeLock()}
          title="${this._wakeActive?o("Release screen lock"):o("Keep screen on")}"
        >
          <ha-icon
            icon="${this._wakeActive?"mdi:eye":"mdi:eye-off-outline"}"
          ></ha-icon>
          ${this._wakeActive?o("Screen on"):o("Keep screen on")}
        </button>
      </div>
    `:h`
        <div class="wakelock-row">
          <span
            class="wakelock-unsupported"
            title="${o("Requires a secure (HTTPS) connection and a browser that supports the Wake Lock API")}"
          >
            <ha-icon icon="mdi:eye-off-outline"></ha-icon>
            ${o("Screen lock unavailable")}
          </span>
        </div>
      `:""}render(){if(!this.recipe)return h``;let e=this.recipe;return this.wide?this._renderWide(e):this._renderNarrow(e)}_renderWide(e){let i=this._groupIngredients(e.ingredients);return h`
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
            <div class="wide-image-card">${this._renderSlideshow(e)}</div>

            <!-- col 2: info card -->
            <div class="wide-info-card">
              <h1 class="wide-title">${e.name}</h1>
              ${this._renderActionButtons(e)}
              <mm-recipe-log
                .api=${this.api.transport}
                .recipe=${e}
                .servings=${(e.servings||1)*this._servingMult}
              ></mm-recipe-log>
              ${e.description?h`<div class="wide-desc md-content">
                    ${Ee(e.description)}
                  </div>`:""}
              ${this._renderMetaRow(e)} ${this._renderChipGroups(e)}
            </div>
          </div>
          <!-- end wide-row 1 -->

          <!-- row 2: ingredients (1/3) + directions (2/3) -->
          <div class="wide-row">
            <!-- col 1: ingredients column -->
            <div class="wide-ing-col">
              <!-- Ingredient serving controls -->
              <div class="wide-ing-controls">${this._renderScaler()}</div>

              ${i.map(t=>h`
                  <div class="wide-section-card">
                    ${t.header?h`<div class="wide-section-title">${t.header}</div>`:""}
                    ${t.items.length?h`
                          <ul class="ingredient-list">
                            ${t.items.map(r=>{let{amount:a,unit:s}=this._getDisplayAmount(r);return h`
                                <li class="ingredient-item">
                                  <span class="ing-amount"
                                    >${a} ${s}</span
                                  >
                                  <span class="ing-name"
                                    >${r.name}${r.notes?h` <em class="ing-notes"
                                          >(${r.notes})</em
                                        >`:""}</span
                                  >
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
              ${(e.instructions||[]).length?(e.instructions||[]).map((t,r)=>{let a=this._completedSteps.has(r);return h`
                      <div
                        class="wide-section-card wide-step-card ${a?"step-done":""}"
                      >
                        <span
                          class="step-num ${a?"done":""}"
                          @click=${s=>{s.stopPropagation(),this._toggleStepComplete(r)}}
                          title="${a?o("Mark incomplete"):o("Mark complete")}"
                          >${a?h`<ha-icon icon="mdi:check"></ha-icon>`:r+1}</span
                        >
                        <span class="step-text"
                          >${this._renderStepWithTimers(t)}</span
                        >
                      </div>
                    `}):h`<p class="empty-tab">
                    ${o("No directions listed.")}
                  </p>`}
              ${e.notes?h`
                    <div class="wide-section-card">
                      <div class="wide-section-title">${o("Notes")}</div>
                      <div class="notes-text md-content">
                        ${Ee(e.notes)}
                      </div>
                    </div>
                  `:""}
            </div>
          </div>
          <!-- end wide-row 2 -->
        </div>

        <!-- Edit overlay -->
        ${this._editing?this._renderEditPanel():""}
      </div>
    `}_renderNarrow(e){let i=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return h`
      <div class="detail-container">
        <!-- Hero image -->
        <div class="hero ${e.image_url?"":"no-image"}">
          ${e.image_url?h`
                <img
                  src="${this.api.transport.previewURL(e.image_url)||ye}"
                  alt="${e.name}"
                />
                <div class="hero-overlay"></div>
              `:h`
                <div class="hero-placeholder">
                  <ha-icon icon="mdi:food"></ha-icon>
                </div>
              `}
          <div class="hero-actions">
            <button
              class="hero-btn ${e.is_favourite?"fav-active":""}"
              @click=${this._handleToggleFav}
              title="${e.is_favourite?o("Remove from favourites"):o("Add to favourites")}"
            >
              <ha-icon
                icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"
              ></ha-icon>
            </button>
            ${e.source_url?h`
                  <a
                    class="hero-btn"
                    href="${e.source_url}"
                    target="_blank"
                    rel="noopener"
                    title="${o("Open source")}"
                  >
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
            <mm-recipe-log
              .api=${this.api.transport}
              .recipe=${e}
              .servings=${(e.servings||1)*this._servingMult}
            ></mm-recipe-log>
            ${e.description?h`<div class="detail-desc md-content">
                  ${Ee(e.description)}
                </div>`:""}

            <div class="meta-row">
              ${e.prep_time?h`
                    <div class="meta-item">
                      <span class="meta-label">${o("Prep")}</span>
                      <span class="meta-val"
                        >${this._formatTime(e.prep_time)}</span
                      >
                    </div>
                  `:""}
              ${e.cook_time?h`
                    <div class="meta-item">
                      <span class="meta-label">${o("Cook")}</span>
                      <span class="meta-val"
                        >${this._formatTime(e.cook_time)}</span
                      >
                    </div>
                  `:""}
              ${i?h`
                    <div class="meta-item">
                      <span class="meta-label">${o("Total")}</span>
                      <span class="meta-val"
                        >${this._formatTime(i)}</span
                      >
                    </div>
                  `:""}
              ${e.servings?h`
                    <div class="meta-item">
                      <span class="meta-label">${o("Serves")}</span>
                      <span class="meta-val"
                        >${e.servings_text||e.servings}</span
                      >
                    </div>
                  `:""}
            </div>

            ${this._renderChipGroups(e)}
          </div>

          <!-- Serving scaler -->
          ${this._renderScaler()}

          <!-- Tabs -->
          <div class="tabs-row">
            ${[["ingredients",o("Ingredients")],["directions",o("Directions")],["notes",o("Notes")],["nutrition",o("Nutrition")],["photos",o("Photos")]].map(([t,r])=>h`
                <button
                  class="tab-btn ${this._activeTab===t?"active":""}"
                  @click=${()=>{this._activeTab=t}}
                >
                  ${r}
                </button>
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
    `}_getDisplayAmount(e){if(this._metricMode){let i=Wt(this._scaleAmount(e.amount),e.unit);if(i)return i}return{amount:this._scaleAmount(e.amount)||"",unit:e.unit||""}}_groupIngredients(e){let i=[],t={header:null,items:[]};for(let r of e||[])r.is_heading||r.name?.startsWith("#")?((t.items.length>0||t.header!==null)&&i.push(t),t={header:(r.name?.startsWith("#")?r.name.slice(1).trim():r.name)||"",items:[]}):t.items.push(r);return(t.items.length>0||t.header!==null)&&i.push(t),i.length?i:[{header:null,items:e||[]}]}_renderIngredients(e){let i=(e.ingredients||[]).some(t=>t.unit&&kt[t.unit.toLowerCase().trim()]);return h`
      ${this.settings?.showUnitConversion&&i?h`
            <div class="metric-toggle-row">
              <button
                class="metric-btn ${this._metricMode?"active":""}"
                @click=${()=>{this._metricMode=!this._metricMode}}
              >
                <ha-icon icon="mdi:swap-horizontal"></ha-icon>
                ${this._metricMode?o("Showing metric"):o("Convert to metric")}
              </button>
            </div>
          `:""}
      ${e.ingredients?.length?h`
            <ul class="ingredient-list">
              ${e.ingredients.map((t,r)=>{if(t.is_heading||t.name?.startsWith("#")){let c=t.name?.startsWith("#")?t.name.slice(1).trim():t.name;return h`<li class="ing-heading">${c}</li>`}let{amount:a,unit:s}=this._getDisplayAmount(t);return h`
                  <li class="ingredient-item">
                    <span class="ing-amount">${a} ${s}</span>
                    <span class="ing-name"
                      >${t.name}${t.notes?h` <em class="ing-notes">(${t.notes})</em>`:""}</span
                    >
                  </li>
                `})}
            </ul>
          `:h`<p class="empty-tab">${o("No ingredients listed.")}</p>`}
    `}_toggleStepComplete(e){let i=new Set(this._completedSteps);i.has(e)?i.delete(e):i.add(e),this._completedSteps=i}_renderDirections(e){return e.instructions?.length?h`
      <ol class="steps-list">
        ${e.instructions.map((i,t)=>{let r=this._completedSteps.has(t);return h`
            <li class="step-item ${r?"step-done":""}">
              <span
                class="step-num ${r?"done":""}"
                @click=${a=>{a.stopPropagation(),this._toggleStepComplete(t)}}
                title="${r?o("Mark incomplete"):o("Mark complete")}"
                >${r?h`<ha-icon icon="mdi:check"></ha-icon>`:t+1}</span
              >
              <span class="step-text">${this._renderStepWithTimers(i)}</span>
            </li>
          `})}
      </ol>
    `:h`<p class="empty-tab">${o("No directions listed.")}</p>`}_renderStepWithTimers(e){let i=[],t=0,r;for(yt.lastIndex=0;(r=yt.exec(e))!==null;){r.index>t&&i.push(e.slice(t,r.index));let a=r[0],s=jt(a);s>0?i.push(h`<button
            class="time-chip"
            @click=${c=>{c.stopPropagation(),this._fireTimer(s,a)}}
            title="${o(te`Start timer for ${a}`)}"
          >
            <ha-icon icon="mdi:timer-outline"></ha-icon>${a}
          </button>`):i.push(a),t=r.index+r[0].length}return t<e.length&&i.push(e.slice(t)),i}_renderNotes(e){return h`
      ${e.notes?h`<div class="notes-text md-content">${Ee(e.notes)}</div>`:h`<p class="empty-tab">${o("No notes.")}</p>`}
    `}_renderNutrition(e){let i=e.nutrition||{};if(!wt.some(a=>i[a.key]!=null&&i[a.key]!==""))return h`
        <div class="empty-tab">
          <p>${o("No nutrition info. Add it via the edit panel.")}</p>
        </div>
      `;let r=e.servings?o(te`Per serving (${e.servings_text||e.servings})`):o("Per serving");return h`
      <div class="nutrition-panel">
        <div class="nutr-header">${o("Nutrition Facts")}</div>
        <div class="nutr-sub">${r}</div>
        <div class="nutr-divider thick"></div>
        ${wt.map(a=>{let s=i[a.key];return s==null||s===""?"":h`
            <div
              class="nutr-row ${a.bold?"nutr-bold":""} ${a.indent?"nutr-indent":""}"
            >
              <span class="nutr-label">${a.label}</span>
              <span class="nutr-val"
                >${s}${a.unit!=="kcal"?h`<em> ${a.unit}</em>`:""}</span
              >
            </div>
            <div class="nutr-divider"></div>
          `})}
      </div>
    `}_renderNutritionRing(e){let i=e?.declared_nutrition||{},t=A=>typeof A=="number"&&Number.isFinite(A)&&A>=0?A:null,r=t(i.calories),a=t(i.fat),s=t(i.carbs),c=t(i.protein),_=[a,s,c].every(A=>A!==null),w=a*9,y=s*4,p=c*4,b=_?w+y+p:0;if(![r,a,s,c].some(A=>A!==null))return h` <div class="nutr-card">
          <p class="empty-tab" style="margin:0;padding:8px 0;text-align:center">
            ${o("No nutritional information available.")}
          </p>
        </div>
        ${this._renderOriginalNutrition(e)}`;let g=[{label:o("Carbs"),val:s,cal:y,color:"#f59e0b"},{label:o("Total fat"),val:a,cal:w,color:"#3b82f6"},{label:o("Protein"),val:c,cal:p,color:"#22c55e"}],m=42,x=50,$=50,T=7,z=2*Math.PI*m,M=T+z*4/360,F=b>0?Math.max(0,y/b*z-M):0,j=b>0?Math.max(0,w/b*z-M):0,D=b>0?Math.max(0,p/b*z-M):0,W=-90,K=W+(b>0?y/b*360:0),k=K+(b>0?w/b*360:0),O=r!==null?Math.round(r):null,l=Object.entries(Ut).filter(([A])=>t(i[A==="carbohydrates"?"carbs":A])!==null&&e.nutrition_basis==="per_serving").map(([A,X])=>{let B=t(i[A==="carbohydrates"?"carbs":A]),ee=Math.min(Math.round(B/X.val*100),999);return{key:A,label:X.label,val:B,unit:X.unit,pct:ee}});return h`
      <div class="nutr-card">
        <!-- Top row: donut ring + macro columns -->
        <div class="nutr-top">
          <div class="nutr-ring-wrap">
            <svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              style="display:block"
            >
              <!-- Background track — always visible -->
              <circle
                cx="${x}"
                cy="${$}"
                r="${m}"
                fill="none"
                stroke="var(--rm-border)"
                stroke-width="7"
              />
              <!-- Colored arcs: all 3 inline in the same html template so they
                   inherit SVG namespace from the parser. Hidden via opacity when
                   there's no data. Dynamic values are attributes, not new elements. -->
              <circle
                cx="${x}"
                cy="${$}"
                r="${m}"
                fill="none"
                stroke="#f59e0b"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${F} ${z}"
                transform="rotate(${W} ${x} ${$})"
                opacity="${b>0&&F>0?.95:0}"
              />
              <circle
                cx="${x}"
                cy="${$}"
                r="${m}"
                fill="none"
                stroke="#3b82f6"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${j} ${z}"
                transform="rotate(${K} ${x} ${$})"
                opacity="${b>0&&j>0?.95:0}"
              />
              <circle
                cx="${x}"
                cy="${$}"
                r="${m}"
                fill="none"
                stroke="#22c55e"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${D} ${z}"
                transform="rotate(${k} ${x} ${$})"
                opacity="${b>0&&D>0?.95:0}"
              />
              <text
                x="${x}"
                y="${$-2}"
                text-anchor="middle"
                fill="var(--rm-text)"
                font-size="16"
                font-weight="700"
                font-family="inherit"
              >
                ${O??"\u2013"}
              </text>
              <text
                x="${x}"
                y="${$+12}"
                text-anchor="middle"
                fill="var(--rm-text-secondary)"
                font-size="9"
                font-family="inherit"
              >
                ${o("cals")}
              </text>
            </svg>
          </div>

          <div class="nutr-macro-cols">
            ${g.map(A=>{let X=b>0?Math.round(A.cal/b*100):0;return h`
                <div class="nutr-macro-col">
                  <span class="nutr-mcol-num" style="color:${A.color}"
                    >${A.val!==null?`${A.val} g`:"\u2014"}</span
                  >
                  <span class="nutr-mcol-label">${A.label}</span>
                  ${X>0?h`<span class="nutr-mcol-pct" style="color:${A.color}"
                        >${X}% cals</span
                      >`:""}
                </div>
              `})}
          </div>
        </div>

        ${e?.servings?h`
              <div class="nutr-serving-note">
                ${e.nutrition_basis==="per_serving"?o("Per serving"):e.nutrition_basis==="per_recipe"?"Per recipe":"Unknown nutrition basis"}
              </div>
            `:""}

        <!-- Daily RDA collapsible -->
        ${l.length?h`
              <button
                class="nutr-rda-toggle"
                @click=${()=>{this._nutritionExpanded=!this._nutritionExpanded}}
              >
                <span class="nutr-rda-title"
                  >${o("Daily RDA Nutrition")}</span
                >
                <span class="nutr-rda-count">${l.length}</span>
                <ha-icon
                  icon="${this._nutritionExpanded?"mdi:chevron-up":"mdi:chevron-down"}"
                ></ha-icon>
              </button>
              ${this._nutritionExpanded?h`
                    <div class="nutr-rda-rows">
                      ${l.map(A=>h`
                          <div class="nutr-rda-row">
                            <span class="nutr-rda-label">${A.label}</span>
                            <span class="nutr-rda-val"
                              >${A.val} ${A.unit}</span
                            >
                            <span class="nutr-rda-pct">${A.pct}%</span>
                            <div class="nutr-rda-bar-wrap">
                              <div
                                class="nutr-rda-bar ${A.pct>100?"over":""}"
                                style="width:${Math.min(A.pct,100)}%"
                              ></div>
                            </div>
                          </div>
                        `)}
                    </div>
                  `:""}
            `:""}
      </div>
      ${this._renderOriginalNutrition(e)}
    `}_renderOriginalNutrition(e){let i=Object.entries(e.nutrition||{}).filter(([,t])=>t!==null&&t!=="");return i.length?h`<details class="nutr-original" open>
          <summary>Original nutrition text</summary>
          ${i.map(([t,r])=>h`<p>
                <strong>${t}</strong>
                <span
                  >${typeof r=="object"?JSON.stringify(r):r}</span
                >
              </p>`)}
        </details>`:""}_renderPhotos(e){let i=e.photos||[],t=e.image_url,r=t?[t,...i.filter(a=>a!==t)]:i;return h`
      <div class="photos-tab">
        ${r.length?h`
              <div class="photos-grid">
                ${r.map(a=>h`
                    <div
                      class="photo-item ${a===t?"main-photo":""}"
                    >
                      <img
                        src="${this.api.transport.previewURL(a)||ye}"
                        alt="${o("Recipe photo")}"
                        loading="lazy"
                      />
                      ${a===t?h`<span class="photo-badge">${o("Main")}</span>`:h`
                            <button
                              class="photo-action set-main"
                              @click=${()=>this._setMainPhoto(a)}
                              title="${o("Set as main photo")}"
                            >
                              <ha-icon icon="mdi:star-outline"></ha-icon>
                            </button>
                          `}
                      <button
                        class="photo-action remove-photo"
                        @click=${()=>this._removePhoto(a)}
                        title="${o("Remove photo")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                  `)}
              </div>
            `:h`
              <div class="empty-tab">
                <ha-icon icon="mdi:image-off-outline"></ha-icon>
                <p>${o("No photos yet.")}</p>
              </div>
            `}

        <div class="photo-add-section">
          <div class="photo-add-label">${o("Add a photo")}</div>
          <div class="photo-url-row">
            <input
              type="url"
              class="photo-url-input"
              placeholder="${o("Paste image URL\u2026")}"
              .value=${this._photoUrlInput}
              @input=${a=>{this._photoUrlInput=a.target.value}}
              @keydown=${a=>{a.key==="Enter"&&this._handleAddPhotoUrl()}}
            />
            <button
              class="action-btn primary"
              ?disabled=${!this._photoUrlInput.trim()||this._addingPhotoUrl}
              @click=${this._handleAddPhotoUrl}
            >
              ${o("Add")}
            </button>
          </div>
          <div class="camera-btns">
            <label class="camera-btn-split">
              <ha-icon icon="mdi:camera"></ha-icon>
              <span>${o("Take Photo")}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                class="camera-input"
                @change=${this._handleCameraCapture}
              />
            </label>
            <label class="camera-btn-split">
              <ha-icon icon="mdi:image-multiple-outline"></ha-icon>
              <span>${o("Choose from Library")}</span>
              <input
                type="file"
                accept="image/*"
                class="camera-input"
                @change=${this._handleCameraCapture}
              />
            </label>
          </div>
        </div>
      </div>
    `}static styles=_t};try{customElements.define("rm-recipe-detail",Ve)}catch{}var zt=Dt(St(),1);var Qe=class extends he{static properties={api:{type:Object},asPanel:{type:Boolean},inlineMode:{type:Boolean},_mode:{type:String},_url:{type:String},_scraping:{type:Boolean},_remoteConsent:{type:Boolean},_scrapeError:{type:String},_form:{type:Object},_saving:{type:Boolean},_ingredientInput:{type:String},_ratingHover:{type:Number},_importFile:{type:Object},_importing:{type:Boolean},_importResult:{type:Object},_importError:{type:String},_importDownloadImages:{type:Boolean}};constructor(){super(),this.api=null,this.asPanel=!1,this.inlineMode=!1,this._mode="url",this._url="",this._scraping=!1,this._scrapeError=null,this._saving=!1,this._ingredientInput="",this._ratingHover=0,this._remoteConsent=!1,this._form=this._emptyForm(),this._importFile=null,this._importing=!1,this._importResult=null,this._importError=null,this._importDownloadImages=!0}_emptyForm(){return{nutrition_basis:"unknown",declared_nutrition:{},name:"",description:"",source_url:"",servings:"",prep_time:"",cook_time:"",image_url:"",tags:"",courses:"",categories:"",collections:"",rating:0,notes:"",ingredients:[],instructions:[],cal:"",fat:"",satf:"",chol:"",sod:"",carb:"",fib:"",sug:"",prot:""}}_close(){this.dispatchEvent(new CustomEvent("rm-close",{bubbles:!0,composed:!0}))}async _handleScrape(){if(!(!this._url.trim()||this._scraping||!this._remoteConsent)){this._scraping=!0,this._scrapeError=null;try{let e=await this.api.scrapeRecipe(this._url.trim(),this._remoteConsent);if(e?.recipe){let i=e.recipe;this._importedRecipe=structuredClone(i);let t=i.nutrition||{};this._form={nutrition_basis:i.nutrition_basis||"unknown",declared_nutrition:{...i.declared_nutrition||{}},name:i.name||"",description:i.description||"",source_url:i.source_url||this._url.trim(),servings:i.servings||"",prep_time:i.prep_time||"",cook_time:i.cook_time||"",image_url:i.media_refs?.image_url??i.image_url??"",tags:(i.tags||[]).join(", "),courses:(i.courses||[]).join(", "),categories:(i.categories||[]).join(", "),collections:(i.collections||[]).join(", "),rating:i.rating||0,notes:i.notes||"",ingredients:i.ingredients||[],instructions:i.instructions||[],cal:t.calories??"",fat:t.fat??"",satf:t.saturated_fat??"",chol:t.cholesterol??"",sod:t.sodium??"",carb:t.carbohydrates??"",fib:t.fiber??"",sug:t.sugar??"",prot:t.protein??""},this._mode="manual"}else this._scrapeError=e?.error||o("Could not extract recipe from this URL.")}catch(e){this._scrapeError=e.message||o("Scraping failed.")}finally{this._scraping=!1}}}_handleImportFileChange(e){this._importFile=e.target.files[0]||null,this._importResult=null,this._importError=null}async _handleImport(){if(!(!this._importFile||this._importing)){this._importing=!0,this._importError=null,this._importResult=null;try{if(this._importFile.size>8e6)throw new Error("Archive exceeds the 8 MB upload limit.");let e;if(this._importDownloadImages){let i=await new Promise((t,r)=>{let a=new FileReader;a.onload=()=>t(String(a.result).split(",")[1]),a.onerror=()=>r(new Error("File could not be read.")),a.readAsDataURL(this._importFile)});e=await this.api.transport.call("recipe_keeper_import",{base64_data:i})}else{let i=await zt.default.loadAsync(this._importFile),t=Object.values(i.files);if(t.length>2e3||t.some(s=>[s.name,s.unsafeOriginalName].filter(Boolean).some(c=>c.startsWith("/")||c.includes("\\")||c.split("/").includes(".."))))throw new Error("Unsafe archive members.");let r=t.find(s=>!s.dir&&s.name.endsWith(".html"));if(!r||!Number.isFinite(r._data?.uncompressedSize)||r._data.uncompressedSize>8e6||r._data.uncompressedSize/Math.max(1,r._data.compressedSize)>100)throw new Error("Missing or oversized Recipe Keeper HTML.");let a=await r.async("text");if(a.length>8e6)throw new Error("Recipe Keeper HTML exceeds the limit.");e=await this.api.importRecipeKeeper(a)}this._importResult=e,e.imported>0&&this.dispatchEvent(new CustomEvent("rm-import-done",{bubbles:!0,composed:!0}))}catch(e){this._importError=e.code?e.message:"Archive could not be read safely."}finally{this._importing=!1}}}async _handleSave(){if(!(!this._form.name.trim()||this._saving)){this._saving=!0;try{let e=this._form,i=_=>_?_.split(",").map(w=>w.trim()).filter(Boolean):[],t={cal:"calories",fat:"fat",satf:"saturated_fat",chol:"cholesterol",sod:"sodium",carb:"carbohydrates",fib:"fiber",sug:"sugar",prot:"protein"},r={},a=!1;for(let[_,w]of Object.entries(t))e[_]!==""&&e[_]!=null&&(r[w]=e[_],a=!0);let c={...Object.fromEntries(Object.entries(this._importedRecipe||{}).filter(([_])=>Object.hasOwn(this.api.transport.actions.recipes_add?.schema.properties||{},_))),name:e.name,description:e.description,source_url:e.source_url,image_url:e.image_url,servings:e.servings===""?null:Number(e.servings),prep_time:e.prep_time===""?null:Number(e.prep_time),cook_time:e.cook_time===""?null:Number(e.cook_time),tags:i(e.tags),courses:i(e.courses),categories:i(e.categories),collections:i(e.collections),rating:e.rating||null,notes:e.notes,ingredients:e.ingredients,instructions:e.instructions,nutrition:a?r:null,nutrition_basis:e.nutrition_basis||"unknown",declared_nutrition:je(e.declared_nutrition)};await this.api.addRecipe(c),this.dispatchEvent(new CustomEvent("rm-import-done",{bubbles:!0,composed:!0})),this._importedRecipe=null,this._form=this._emptyForm()}catch(e){this._saveError=e.message,this.requestUpdate()}finally{this._saving=!1}}}_setField(e,i){this._form={...this._form,[e]:i}}_addIngredient(){let e=this._ingredientInput.trim();if(!e)return;let i;if(e.startsWith("#"))i={name:e,is_heading:!0};else{let t=e.split(/\s+/),r="",a="",s="";t.length>=3&&!isNaN(parseFloat(t[0]))?(r=t[0],a=t[1],s=t.slice(2).join(" ")):t.length===2&&!isNaN(parseFloat(t[0]))?(r=t[0],s=t[1]):s=e,i={amount:r,unit:a,name:s}}this._form={...this._form,ingredients:[...this._form.ingredients,i]},this._ingredientInput=""}_addIngredientsBulk(e){let t=e.split(`
`).map(r=>r.trim()).filter(Boolean).map(r=>{if(r.startsWith("#"))return{name:r,is_heading:!0};let a=r.split(/\s+/),s="",c="",_="";return a.length>=3&&!isNaN(parseFloat(a[0]))?(s=a[0],c=a[1],_=a.slice(2).join(" ")):a.length===2&&!isNaN(parseFloat(a[0]))?(s=a[0],_=a[1]):_=r,{amount:s,unit:c,name:_}});t.length&&(this._form={...this._form,ingredients:[...this._form.ingredients,...t]})}_removeIngredient(e){this._form={...this._form,ingredients:this._form.ingredients.filter((i,t)=>t!==e)}}_addStep(e){e.trim()&&(this._form={...this._form,instructions:[...this._form.instructions,e.trim()]})}_removeStep(e){this._form={...this._form,instructions:this._form.instructions.filter((i,t)=>t!==e)}}_renderPanelContent(){return h`
      <div class="dialog-header">
        <div class="mode-toggle">
          <button
            class="mode-btn ${this._mode==="url"?"active":""}"
            aria-pressed=${this._mode==="url"}
            @click=${()=>{this._mode="url"}}
          >
            <ha-icon icon="mdi:link-variant"></ha-icon> ${o("From URL")}
          </button>
          <button
            class="mode-btn ${this._mode==="manual"?"active":""}"
            aria-pressed=${this._mode==="manual"}
            @click=${()=>{this._mode="manual"}}
          >
            <ha-icon icon="mdi:pencil-outline"></ha-icon> ${o("Manual")}
          </button>
          <button
            class="mode-btn ${this._mode==="import"?"active":""}"
            aria-pressed=${this._mode==="import"}
            @click=${()=>{this._mode="import"}}
          >
            <ha-icon icon="mdi:import"></ha-icon> ${o("Import")}
          </button>
        </div>
        ${this.inlineMode?"":h`<button
              class="icon-btn"
              aria-label=${o("Close")}
              @click=${this._close}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>`}
      </div>

      <div class="dialog-body">
        ${this._mode==="url"?this._renderUrlMode():""}
        ${this._mode==="import"?this._renderImportMode():""}
        ${this._mode==="manual"?this._renderManualMode():""}
      </div>

      ${this._mode==="manual"?h`
            <div class="dialog-footer">
              <button class="action-btn" @click=${this._close}>
                ${o("Cancel")}
              </button>
              <button
                class="action-btn primary"
                ?disabled=${!this._form.name.trim()||this._saving}
                @click=${this._handleSave}
              >
                ${this._saving?h`<ha-circular-progress
                      active
                      size="tiny"
                    ></ha-circular-progress>`:h`<ha-icon icon="mdi:content-save-outline"></ha-icon>`}
                ${o("Save Recipe")}
              </button>
            </div>
          `:""}
    `}render(){return this.inlineMode?h`<div class="dialog-panel inline-panel">
        ${this._renderPanelContent()}
      </div>`:h`
      <div
        class="dialog-overlay ${this.asPanel?"panel-mode":""}"
        @click=${e=>{e.target===e.currentTarget&&this._close()}}
      >
        <div class="dialog-panel">${this._renderPanelContent()}</div>
      </div>
    `}_renderImportMode(){return h`
      <div class="import-mode">
        <div class="import-info">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div>
            <strong>${o("Recipe Keeper import")}</strong><br />
            ${o(h`Export your recipes from the Recipe Keeper app (<em
                  >Menu → Export → Recipe Keeper File</em
                >), then select the exported <code>.zip</code> file below.
                Recipe photos will be saved locally if available.`)}
          </div>
        </div>

        <label class="file-label">
          <ha-icon icon="mdi:file-import-outline"></ha-icon>
          ${this._importFile?this._importFile.name:o("Choose .zip file\u2026")}
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
          ${o("Save recipe photos locally")}
        </label>

        ${this._importResult?h`
              <div
                class="import-result ${this._importResult.failed>0?"partial":"success"}"
              >
                <ha-icon
                  icon="${this._importResult.failed>0?"mdi:alert-circle-outline":"mdi:check-circle-outline"}"
                ></ha-icon>
                <div>
                  <strong
                    >${o(te`${this._importResult.imported} recipe${this._importResult.imported!==1?"s":""} imported`)}</strong
                  >
                  ${this._importResult.imagesSaved>0?h` ${o(te`with ${this._importResult.imagesSaved} photo${this._importResult.imagesSaved!==1?"s":""}`)}`:""}
                  ${this._importResult.failed>0?h`<br /><small
                          >${o(te`${this._importResult.failed} failed — check HA logs for details`)}</small
                        >`:""}
                </div>
              </div>
            `:this._importError?h`
                <div class="import-result error">
                  <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                  <div>
                    <strong>${o("Import failed")}</strong><br /><small
                      >${this._importError}</small
                    >
                  </div>
                </div>
              `:""}

        <button
          class="action-btn primary import-btn"
          ?disabled=${!this._importFile||this._importing}
          @click=${this._handleImport}
        >
          ${this._importing?h`<ha-circular-progress
                  active
                  size="tiny"
                ></ha-circular-progress>
                ${o("Importing\u2026")}`:h`<ha-icon icon="mdi:import"></ha-icon> ${o("Import Recipes")}`}
        </button>
      </div>
    `}_renderUrlMode(){return h`
      <div class="url-mode">
        <div class="url-hint">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          ${o("Paste a recipe URL to automatically extract the recipe details.")}
        </div>
        <label
          ><input
            type="checkbox"
            aria-label="Allow remote import"
            .checked=${this._remoteConsent}
            @change=${e=>{this._remoteConsent=e.target.checked}}
          />
          ${this.api?.transport?.hass?.language==="de"?"Remote-Import erlauben":"Allow remote import"}</label
        >
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
            ${this._scraping?h`<ha-circular-progress
                  active
                  size="tiny"
                ></ha-circular-progress>`:h`<ha-icon icon="mdi:download-outline"></ha-icon>`}
            ${o("Fetch")}
          </button>
        </div>
        ${this._scrapeError?h`
              <div class="error-msg">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                ${this._scrapeError}
              </div>
              <button
                class="action-btn"
                @click=${()=>{this._mode="manual",this._form={...this._emptyForm(),source_url:this._url}}}
              >
                ${o("Enter manually instead")}
              </button>
            `:""}
      </div>
    `}_renderManualMode(){let e=this._form,i=this._ratingHover||e.rating||0;return h`
      <div class="manual-mode">
        ${this._saveError?h`<p role="alert">${this._saveError}</p>`:""}
        ${Be(e,(t,r)=>this._setField(t,r))}

        <!-- Name -->
        <div class="field">
          <label>${o("Recipe Name *")}</label>
          <input
            type="text"
            .value=${e.name}
            @input=${t=>this._setField("name",t.target.value)}
            placeholder="${o("e.g. Spaghetti Bolognese")}"
          />
        </div>

        <!-- Description -->
        <div class="field">
          <label>${o("Description")}</label>
          <textarea
            rows="2"
            .value=${e.description}
            @input=${t=>this._setField("description",t.target.value)}
            placeholder="${o("Short description\u2026")}"
          ></textarea>
        </div>

        <!-- Source URL + Image URL -->
        <div class="field-row">
          <div class="field">
            <label>${o("Source URL")}</label>
            <input
              type="url"
              .value=${e.source_url}
              @input=${t=>this._setField("source_url",t.target.value)}
              placeholder="https://…"
            />
          </div>
          <div class="field">
            <label>${o("Image URL")}</label>
            <input
              type="url"
              .value=${e.image_url}
              @input=${t=>this._setField("image_url",t.target.value)}
              placeholder="https://…/image.jpg"
            />
          </div>
        </div>

        <!-- Times + servings -->
        <div class="field-row-3">
          <div class="field">
            <label>${o("Prep (min)")}</label>
            <input
              type="number"
              .value=${String(e.prep_time)}
              @input=${t=>this._setField("prep_time",t.target.value)}
              placeholder="15"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Cook (min)")}</label>
            <input
              type="number"
              .value=${String(e.cook_time)}
              @input=${t=>this._setField("cook_time",t.target.value)}
              placeholder="30"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Servings")}</label>
            <input
              type="number"
              .value=${String(e.servings)}
              @input=${t=>this._setField("servings",t.target.value)}
              placeholder="4"
              min="1"
            />
          </div>
        </div>

        <!-- Rating -->
        <div class="field">
          <label>${o("Rating")}</label>
          <div
            class="star-row"
            @mouseleave=${()=>{this._ratingHover=0}}
          >
            ${[1,2,3,4,5].map(t=>h`
                <span
                  class="star ${t<=i?"filled":""}"
                  @mouseenter=${()=>{this._ratingHover=t}}
                  @click=${()=>this._setField("rating",e.rating===t?0:t)}
                  >★</span
                >
              `)}
            ${e.rating?h`<button
                  class="clear-rating"
                  @click=${()=>this._setField("rating",0)}
                >
                  ${o("Clear")}
                </button>`:""}
          </div>
        </div>

        <!-- Categorisation row -->
        <div class="field">
          <label>${o("Tags (comma-separated)")}</label>
          <input
            type="text"
            .value=${e.tags}
            @input=${t=>this._setField("tags",t.target.value)}
            placeholder="${o("quick, weeknight, family")}"
          />
        </div>

        <div class="field">
          <label>${o("Courses (comma-separated)")}</label>
          <input
            type="text"
            .value=${e.courses}
            @input=${t=>this._setField("courses",t.target.value)}
            placeholder="${o("Dinner, Main Course")}"
          />
        </div>

        <div class="field-row">
          <div class="field">
            <label>${o("Categories (comma-separated)")}</label>
            <input
              type="text"
              .value=${e.categories}
              @input=${t=>this._setField("categories",t.target.value)}
              placeholder="${o("Italian, Gluten Free")}"
            />
          </div>
          <div class="field">
            <label>${o("Collections (comma-separated)")}</label>
            <input
              type="text"
              .value=${e.collections}
              @input=${t=>this._setField("collections",t.target.value)}
              placeholder="${o("30 Minutes, Summer")}"
            />
          </div>
        </div>

        <!-- Ingredients -->
        <div class="field">
          <label>${o(te`Ingredients (${e.ingredients.length})`)}</label>
          ${e.ingredients.length?h`
                <ul class="ing-list">
                  ${e.ingredients.map((t,r)=>h`
                      <li
                        class="${t.is_heading||t.name?.startsWith("#")?"ing-heading":""}"
                      >
                        <span class="ing-text">
                          ${t.is_heading||t.name?.startsWith("#")?h`<strong
                                >${t.name?.startsWith("#")?t.name.slice(1).trim():t.name}</strong
                              >`:h`${t.amount?`${t.amount}${t.unit?" "+t.unit:""} `:""}${t.name}`}
                        </span>
                        <button
                          class="remove-btn"
                          @click=${()=>this._removeIngredient(r)}
                        >
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
              placeholder="${o('e.g. "2 cups flour", "salt", or "# Section"')}"
            />
            <button class="action-btn sm" @click=${this._addIngredient}>
              ${o("Add")}
            </button>
          </div>
          <div class="bulk-hint">
            ${o(h`Tip: Use <code>#Section Name</code> to add a section header.
                Or paste multiple lines at once:`)}
            <button
              class="action-btn sm bulk-btn"
              @click=${()=>{let t=prompt(o("Paste ingredients (one per line, use # for headers):"));t&&this._addIngredientsBulk(t)}}
            >
              <ha-icon icon="mdi:text-box-multiple-outline"></ha-icon> ${o("Bulk paste")}
            </button>
          </div>
        </div>

        <!-- Directions -->
        <div class="field">
          <label
            >${o(te`Directions (${e.instructions.length} steps)`)}</label
          >
          ${e.instructions.length?h`
                <ol class="steps-edit">
                  ${e.instructions.map((t,r)=>h`
                      <li>
                        <span class="step-text">${t}</span>
                        <button
                          class="remove-btn"
                          @click=${()=>this._removeStep(r)}
                        >
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
              placeholder="${o("Type a step, press Enter to add\u2026")}"
            ></textarea>
            <button
              class="action-btn sm"
              @click=${t=>{let r=t.target.closest(".add-row").querySelector("textarea");this._addStep(r.value),r.value=""}}
            >
              ${o("Add")}
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="field">
          <label>${o("Notes")}</label>
          <textarea
            rows="2"
            .value=${e.notes}
            @input=${t=>this._setField("notes",t.target.value)}
            placeholder="${o("Variations, tips\u2026")}"
          ></textarea>
        </div>

        <!-- Nutrition -->
        <div class="section-divider">
          ${o("Nutrition Facts (per serving \u2014 optional)")}
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>${o("Calories (kcal)")}</label>
            <input
              type="number"
              .value=${String(e.cal)}
              @input=${t=>this._setField("cal",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Protein (g)")}</label>
            <input
              type="number"
              .value=${String(e.prot)}
              @input=${t=>this._setField("prot",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Fat (g)")}</label>
            <input
              type="number"
              .value=${String(e.fat)}
              @input=${t=>this._setField("fat",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>${o("Saturated Fat (g)")}</label>
            <input
              type="number"
              .value=${String(e.satf)}
              @input=${t=>this._setField("satf",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Carbohydrates (g)")}</label>
            <input
              type="number"
              .value=${String(e.carb)}
              @input=${t=>this._setField("carb",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Dietary Fiber (g)")}</label>
            <input
              type="number"
              .value=${String(e.fib)}
              @input=${t=>this._setField("fib",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>${o("Sugars (g)")}</label>
            <input
              type="number"
              .value=${String(e.sug)}
              @input=${t=>this._setField("sug",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Sodium (mg)")}</label>
            <input
              type="number"
              .value=${String(e.sod)}
              @input=${t=>this._setField("sod",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div class="field">
            <label>${o("Cholesterol (mg)")}</label>
            <input
              type="number"
              .value=${String(e.chol)}
              @input=${t=>this._setField("chol",t.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>
    `}static styles=pe`
    :host {
      display: block;
      height: 100%;
      color: var(--rm-text, #424242);
      color-scheme: inherit;
    }

    .file-label:focus-within {
      outline: 3px solid var(--rm-focus, var(--rm-accent, #416f8f));
      outline-offset: 2px;
    }

    button,
    select {
      min-height: var(--rm-touch-target, 44px);
    }

    .inline-panel {
      border-radius: 0 !important;
      max-width: 100% !important;
      max-height: 100% !important;
      height: 100%;
      border-left: none !important;
      box-shadow: none !important;
      border-top: 1px solid var(--rm-border, rgba(0, 0, 0, 0.08));
    }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 1000;
    }

    /* Right-side panel mode (wide/tablet layout) */
    .dialog-overlay.panel-mode {
      align-items: stretch;
      justify-content: flex-end;
      background: rgba(0, 0, 0, 0.45);
    }

    .dialog-panel {
      background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
      border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      max-height: 90dvh;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--rm-border);
      box-shadow: var(--rm-shadow);
    }

    .panel-mode .dialog-panel {
      border-radius: 0;
      max-width: 420px;
      max-height: 100%;
      height: 100%;
      border-left: 1px solid var(--rm-border, rgba(0, 0, 0, 0.1));
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
      flex-shrink: 0;
      gap: 8px;
    }

    .mode-toggle {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 8px;
      padding: 3px;
    }
    .mode-btn {
      background: none;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text-secondary, #8e8e93);
      display: flex;
      align-items: center;
      gap: 5px;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .mode-btn ha-icon {
      --mdc-icon-size: 16px;
    }
    .mode-btn.active {
      background: var(--rm-accent, #ff6b35);
      color: var(--rm-accent-text, #fff);
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .dialog-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border, rgba(255, 255, 255, 0.08)) transparent;
    }

    /* URL mode */
    .url-mode {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .url-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text-secondary, #8e8e93);
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 8px;
      padding: 10px 12px;
    }
    .url-hint ha-icon {
      --mdc-icon-size: 18px;
      flex-shrink: 0;
    }
    .url-row {
      display: flex;
      gap: 8px;
    }
    .url-input {
      flex: 1;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 10px 12px;
      font-size: var(--rm-font-size-sm, 14px);
    }
    .url-input:focus {
      outline: none;
      border-color: var(--rm-accent, #ff6b35);
    }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--rm-error, var(--error-color, #cf6679));
      font-size: var(--rm-font-size-sm, 14px);
    }
    .error-msg ha-icon {
      --mdc-icon-size: 16px;
    }

    /* Manual form */
    .manual-mode {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field label {
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--rm-text-secondary, #8e8e93);
    }
    .field input,
    .field textarea {
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 10px;
      font-size: var(--rm-font-size-sm, 14px);
      font-family: inherit;
      resize: vertical;
    }
    .field input:focus,
    .field textarea:focus {
      outline: none;
      border-color: var(--rm-accent, #ff6b35);
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .field-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    /* Star rating */
    .star-row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 0;
    }
    .star {
      font-size: 28px;
      color: var(--rm-border, rgba(255, 255, 255, 0.2));
      cursor: pointer;
      line-height: 1;
      transition: color 0.1s;
    }
    .star.filled {
      color: #f5a623;
    }
    .star:hover {
      color: #f5a623;
    }
    .clear-rating {
      margin-left: 8px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary, #8e8e93);
      text-decoration: underline;
      padding: 0;
    }

    /* Section divider */
    .section-divider {
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rm-text-secondary, #8e8e93);
      padding-top: 8px;
      border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    }

    /* Ingredient / step lists */
    .ing-list,
    .steps-edit {
      list-style: none;
      padding: 0;
      margin: 0 0 6px;
    }
    .ing-list li,
    .steps-edit li {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 5px 0;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text, #e5e5ea);
    }
    .ing-list li.ing-heading {
      font-weight: 700;
      color: var(--rm-accent, #9fa8da);
    }
    .ing-text,
    .step-text {
      flex: 1;
    }
    .bulk-hint {
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary, #8e8e93);
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .bulk-hint code {
      background: var(--rm-accent-soft);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: var(--rm-font-size-xs, 12px);
    }
    .bulk-btn {
      padding: 4px 8px !important;
      font-size: var(--rm-font-size-xs, 12px) !important;
    }
    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      padding: 2px;
      flex-shrink: 0;
    }
    .remove-btn ha-icon {
      --mdc-icon-size: 14px;
    }

    .add-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .add-row input,
    .add-row textarea {
      flex: 1;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 8px 10px;
      font-size: var(--rm-font-size-sm, 14px);
      font-family: inherit;
      resize: none;
    }
    .add-row input:focus,
    .add-row textarea:focus {
      outline: none;
      border-color: var(--rm-accent, #ff6b35);
    }

    /* Buttons */
    .action-btn {
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      color: var(--rm-text, #e5e5ea);
      padding: 9px 14px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm, 14px);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .action-btn ha-icon {
      --mdc-icon-size: 16px;
    }
    .action-btn.primary {
      background: var(--rm-accent, #ff6b35);
      border-color: var(--rm-accent, #ff6b35);
      color: var(--rm-accent-text, #fff);
    }
    .action-btn.sm {
      padding: 6px 10px;
      font-size: var(--rm-font-size-sm, 14px);
    }
    .action-btn:disabled {
      opacity: 1;
      cursor: not-allowed;
    }
    .action-btn.primary:disabled {
      background: var(--rm-disabled-bg, var(--rm-accent));
      color: var(--rm-disabled-text, var(--rm-accent-text, #fff));
      opacity: 1;
    }

    /* Import mode */
    .import-mode {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .import-info {
      display: flex;
      gap: 12px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 10px;
      padding: 12px 14px;
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text-secondary, #8e8e93);
      line-height: 1.5;
    }
    .import-info ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .import-info strong {
      color: var(--rm-text, #e5e5ea);
    }
    .import-info code {
      background: var(--rm-accent-soft);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: var(--rm-font-size-xs, 12px);
    }

    .file-label {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 2px dashed var(--rm-border, rgba(255, 255, 255, 0.15));
      border-radius: 10px;
      padding: 16px 14px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text, #e5e5ea);
      transition: border-color 0.15s;
    }
    .file-label:hover {
      border-color: var(--rm-accent, #ff6b35);
    }
    .file-label ha-icon {
      --mdc-icon-size: 22px;
      color: var(--rm-accent, #ff6b35);
    }
    .file-input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text-secondary, #8e8e93);
      cursor: pointer;
    }
    .toggle-row input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .import-result {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: var(--rm-font-size-sm, 14px);
    }
    .import-result ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .import-result.success {
      background: var(--rm-success-soft, #e2eee7);
      color: var(--rm-success, #326044);
    }
    .import-result.partial {
      background: var(--rm-warning-soft, #f2ebd5);
      color: var(--rm-warning, #765600);
    }
    .import-result.error {
      background: var(--rm-error-soft, #f6e5df);
      color: var(--rm-error, #983d25);
    }
    .import-result strong {
      display: block;
    }
    .import-result small {
      font-size: var(--rm-font-size-sm, 14px);
    }

    .import-btn {
      width: 100%;
      justify-content: center;
      gap: 8px;
    }
    .import-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    .dialog-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
      padding: 12px 16px;
      border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
      flex-shrink: 0;
    }
    .url-input,
    .field input,
    .field textarea,
    .add-row input,
    .add-row textarea {
      min-height: var(--rm-touch-target, 44px);
      font-size: var(--rm-font-size-base, 16px);
      border-color: var(--rm-border-strong, var(--rm-border));
    }
    @media (max-width: 480px) {
      .field-row,
      .field-row-3 {
        grid-template-columns: minmax(0, 1fr);
      }
      .mode-btn {
        padding: 8px;
      }
      .dialog-header,
      .dialog-body,
      .dialog-footer {
        padding: 12px;
      }
    }
    ${ue}
  `};try{customElements.define("rm-add-recipe-dialog",Qe)}catch{}var qt=["breakfast","lunch","dinner","snack"],Xe=class extends he{static properties={api:{type:Object},recipes:{type:Array},settings:{type:Object},fromRecipe:{type:Object},_weekStart:{type:String},_plan:{type:Array},_loading:{type:Boolean},_showPicker:{type:Boolean},_pickerTarget:{type:Object},_pickerSearch:{type:String},_pickerServings:{type:Number}};constructor(){super(),this.api=null,this.recipes=[],this.settings={},this.fromRecipe=null,this._plan=[],this._loading=!1,this._showPicker=!1,this._pickerTarget=null,this._pickerSearch="",this._pickerServings=2,this._weekStart=this._getMondayISO(new Date)}updated(e){(e.has("api")||e.has("_weekStart"))&&this.api&&this._loadPlan()}_getMondayISO(e){let i=e.getDay(),t=i===0?-6:1-i,r=new Date(e);r.setDate(r.getDate()+t);let a=r.getFullYear(),s=String(r.getMonth()+1).padStart(2,"0"),c=String(r.getDate()).padStart(2,"0");return`${a}-${s}-${c}`}_addDays(e,i){let t=new Date(e+"T00:00:00Z");return t.setUTCDate(t.getUTCDate()+i),t.toISOString().split("T")[0]}_formatDisplayDate(e){return new Date(e+"T00:00:00Z").getUTCDate().toString()}_formatMonthYear(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{month:"long",year:"numeric",timeZone:"UTC"})}_formatDayName(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{weekday:"short",timeZone:"UTC"})}_prevWeek(){this._weekStart=this._addDays(this._weekStart,-7)}_nextWeek(){this._weekStart=this._addDays(this._weekStart,7)}_isCurrentWeek(){return this._weekStart===this._getMondayISO(new Date)}async _loadPlan(){this._loading=!0;try{let e=await this.api.getMealPlan(this._weekStart);this._plan=e?.entries??[]}catch{this._plan=[]}finally{this._loading=!1}}_getEntriesForSlot(e,i){return this._plan.filter(t=>t.date===e&&t.meal_type===i)}_openPicker(e,i){this._pickerTarget={date:e,mealType:i},this._pickerSearch="",this._pickerServings=2,this._showPicker=!0}async _handlePickRecipe(e){this._pickerTarget&&(await this.api.addToMealPlan(e.id,this._pickerTarget.date,this._pickerTarget.mealType,this._pickerServings),this._showPicker=!1,await this._loadPlan())}async _handleRemoveEntry(e){await this.api.removeFromMealPlan(e),await this._loadPlan()}async _handleClearWeek(){await this.api.clearMealPlanWeek(this._weekStart),await this._loadPlan()}_openRecipeDetail(e){let i=this.recipes.find(t=>t.id===e.recipe_id);i&&this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:i},bubbles:!0,composed:!0}))}_mealTypeLabel(e){switch(e){case"breakfast":return o("Breakfast");case"lunch":return o("Lunch");case"dinner":return o("Dinner");case"snack":return o("Snack");default:return e}}get _pickerFiltered(){let e=this._pickerSearch.trim().toLowerCase();return e?this.recipes.filter(i=>i.name?.toLowerCase().includes(e)||i.tags?.some(t=>t.toLowerCase().includes(e))):this.recipes}render(){let e=Array.from({length:7},(t,r)=>this._addDays(this._weekStart,r)),i=new Date().toISOString().split("T")[0];return h`
      <div class="planner-container">
        ${this.fromRecipe?h`
              <div class="back-to-recipe">
                <button
                  class="back-recipe-btn"
                  @click=${()=>this.dispatchEvent(new CustomEvent("rm-back-to-recipe",{bubbles:!0,composed:!0}))}
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                  <span>${o(te`Back to ${this.fromRecipe.name}`)}</span>
                </button>
              </div>
            `:""}
        <!-- Week navigation -->
        <div class="week-nav">
          <button
            class="nav-btn"
            aria-label=${o("Previous week")}
            @click=${this._prevWeek}
          >
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <div class="week-label">
            <span class="week-month"
              >${this._formatMonthYear(this._weekStart)}</span
            >
            ${this._isCurrentWeek()?h`<span class="today-badge">${o("This week")}</span>`:h`
                  <button
                    class="text-link"
                    @click=${()=>{this._weekStart=this._getMondayISO(new Date)}}
                  >
                    ${o("Today")}
                  </button>
                `}
          </div>
          <button
            class="nav-btn"
            aria-label=${o("Next week")}
            @click=${this._nextWeek}
          >
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </button>
        </div>

        <div
          class="week-scroll"
          tabindex="0"
          role="region"
          aria-label=${o("Meal plan")}
        >
          <!-- Day headers share the grid's horizontal scroll on narrow screens. -->
          <div class="day-headers">
            ${e.map(t=>h`
                <div class="day-header ${t===i?"today":""}">
                  <span class="day-name">${this._formatDayName(t)}</span>
                  <span class="day-num">${this._formatDisplayDate(t)}</span>
                </div>
              `)}
          </div>

          <!-- Plan grid scroll -->
          <div class="plan-scroll">
            ${this._loading?h`
                  <div class="plan-loading">
                    <ha-circular-progress active></ha-circular-progress>
                  </div>
                `:h`
                  ${qt.map(t=>h`
                      <div class="meal-row">
                        <div class="meal-label">
                          ${this._mealTypeLabel(t)}
                        </div>
                        <div class="meal-cells">
                          ${e.map(r=>{let a=this._getEntriesForSlot(r,t);return h`
                              <div
                                class="meal-cell ${r===i?"today":""}"
                              >
                                ${a.map(s=>{let c=this.recipes.find(_=>_.id===s.recipe_id);return h`
                                    <div class="meal-entry">
                                      <button
                                        class="entry-open"
                                        aria-label=${c?.name??o("Unknown")}
                                        @click=${()=>this._openRecipeDetail(s)}
                                      >
                                        ${c?.image_url?h`
                                              <img
                                                src="${c.image_url}"
                                                alt="${c?.name||""}"
                                                class="entry-thumb"
                                              />
                                            `:h`
                                              <span
                                                class="entry-thumb entry-placeholder"
                                              >
                                                <ha-icon
                                                  icon="mdi:food"
                                                ></ha-icon>
                                              </span>
                                            `}
                                        <span class="entry-name"
                                          >${c?.name??o("Unknown")}</span
                                        >
                                        ${s.servings&&s.servings!==1?h`
                                              <span class="entry-servings"
                                                >×${s.servings}</span
                                              >
                                            `:""}
                                      </button>
                                      <button
                                        class="entry-remove"
                                        aria-label=${o("Remove")}
                                        @click=${_=>{_.stopPropagation(),this._handleRemoveEntry(s.id)}}
                                      >
                                        <ha-icon icon="mdi:close"></ha-icon>
                                      </button>
                                    </div>
                                  `})}
                                <button
                                  class="add-slot-btn"
                                  aria-label=${`${this._formatDayName(r)} ${this._formatDisplayDate(r)} \xB7 ${this._mealTypeLabel(t)}: ${o("Add recipe")}`}
                                  @click=${()=>this._openPicker(r,t)}
                                >
                                  <ha-icon icon="mdi:plus"></ha-icon>
                                </button>
                              </div>
                            `})}
                        </div>
                      </div>
                    `)}
                `}

            <!-- Clear week button -->
            ${this._plan.length?h`
                  <div class="clear-row">
                    <button
                      class="text-danger-btn"
                      @click=${this._handleClearWeek}
                    >
                      <ha-icon icon="mdi:calendar-remove-outline"></ha-icon>
                      ${o("Clear this week")}
                    </button>
                  </div>
                `:""}
          </div>
        </div>

        <!-- Recipe picker dialog -->
        ${this._showPicker?this._renderPicker():""}
      </div>
    `}_renderPicker(){let e=this._pickerTarget;return h`
      <div
        class="picker-overlay"
        @click=${i=>{i.target===i.currentTarget&&(this._showPicker=!1)}}
      >
        <div class="picker-panel">
          <div class="picker-header">
            <span
              >${o(te`Add to ${this._mealTypeLabel(e.mealType)}`)}</span
            >
            <button
              class="icon-btn"
              aria-label=${o("Close")}
              @click=${()=>{this._showPicker=!1}}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="picker-servings-row">
            <span class="picker-label">${o("Servings:")}</span>
            <div class="servings-ctrl">
              <button
                class="scaler-btn"
                aria-label=${o("Decrease servings")}
                ?disabled=${this._pickerServings<=1}
                @click=${()=>{this._pickerServings>1&&this._pickerServings--}}
              >
                <ha-icon icon="mdi:minus"></ha-icon>
              </button>
              <span class="servings-val">${this._pickerServings}</span>
              <button
                class="scaler-btn"
                aria-label=${o("Increase servings")}
                @click=${()=>{this._pickerServings++}}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
          </div>
          <div class="picker-search-wrap">
            <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
            <input
              type="text"
              class="picker-search"
              aria-label=${o("Search recipes\u2026")}
              placeholder="${o("Search recipes\u2026")}"
              .value=${this._pickerSearch}
              @input=${i=>{this._pickerSearch=i.target.value}}
            />
          </div>
          <div class="picker-list">
            ${this._pickerFiltered.length===0?h`
                  <div class="picker-empty">${o("No recipes found")}</div>
                `:this._pickerFiltered.map(i=>h`
                    <button
                      class="picker-item"
                      @click=${()=>this._handlePickRecipe(i)}
                    >
                      ${i.image_url?h`
                            <img
                              src="${i.image_url}"
                              alt="${i.name}"
                              class="picker-thumb"
                            />
                          `:h`
                            <span class="picker-thumb picker-placeholder">
                              <ha-icon icon="mdi:food"></ha-icon>
                            </span>
                          `}
                      <span class="picker-info">
                        <span class="picker-name">${i.name}</span>
                        ${i.tags?.length?h`<span class="picker-tags"
                              >${i.tags.slice(0,2).join(", ")}</span
                            >`:""}
                      </span>
                      ${i.is_favourite?h`<ha-icon
                            icon="mdi:heart"
                            class="picker-fav"
                          ></ha-icon>`:""}
                    </button>
                  `)}
          </div>
        </div>
      </div>
    `}static styles=pe`
    :host {
      display: block;
      height: 100%;
    }

    .planner-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
      min-height: 0;
      min-width: 0;
    }

    /* Back to recipe */
    .back-to-recipe {
      padding: 6px 14px 0;
      flex-shrink: 0;
    }
    .back-recipe-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-accent, #ff6b35);
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      padding: 4px 6px;
      border-radius: 8px;
      transition: background 0.15s;
    }
    .back-recipe-btn:hover {
      background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    }
    .back-recipe-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    /* Week nav */
    .week-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    }
    .nav-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .nav-btn:hover {
      background: var(--rm-border, rgba(255, 255, 255, 0.08));
    }
    .week-label {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      color: var(--rm-text, #e5e5ea);
    }
    .today-badge {
      font-size: var(--rm-font-size-xs, 12px);
      background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
      color: var(--rm-accent, #ff6b35);
      border-radius: 10px;
      padding: 2px 8px;
    }
    .text-link {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-accent, #ff6b35);
      font-size: var(--rm-font-size-xs, 12px);
      padding: 0;
    }

    /* Day headers */
    .week-scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border-strong, var(--rm-border)) transparent;
    }
    .day-headers {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      padding: 12px 14px 8px;
      flex-shrink: 0;
      min-width: 980px;
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--rm-dialog-bg, var(--rm-bg-main));
    }
    .day-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .day-name {
      font-size: var(--rm-font-size-xs, 12px);
      text-transform: uppercase;
      color: var(--rm-text-secondary, #8e8e93);
      letter-spacing: 0.05em;
    }
    .day-num {
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 600;
      color: var(--rm-text, #e5e5ea);
    }
    .day-header.today .day-num {
      background: var(--rm-accent, #ff6b35);
      color: var(--rm-accent-text, #fff);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--rm-font-size-xs, 12px);
    }

    /* Plan scroll */
    .plan-scroll {
      min-width: 980px;
      padding: 4px 14px 16px;
    }

    .plan-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 120px;
    }

    .meal-row {
      margin-bottom: 16px;
    }
    .meal-label {
      font-size: var(--rm-font-size-xs, 12px);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--rm-text-secondary, #8e8e93);
      font-weight: 600;
      padding: 4px 2px 3px;
    }
    .meal-cells {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 8px;
    }
    .meal-cell {
      min-height: 76px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 12px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid var(--rm-border);
    }
    .meal-cell.today {
      border-color: var(--rm-accent, #ff6b35);
    }

    .meal-entry {
      display: flex;
      align-items: center;
      gap: 3px;
      flex-wrap: wrap;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      padding: 6px;
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text, #e5e5ea);
      position: relative;
      min-width: 0;
    }
    .entry-open {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      flex: 1 1 100%;
      min-width: 0;
      min-height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      text-align: left;
    }
    .entry-thumb {
      width: 24px;
      height: 24px;
      border-radius: 3px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .entry-placeholder {
      background: var(--rm-border, rgba(255, 255, 255, 0.08));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .entry-placeholder ha-icon {
      --mdc-icon-size: 10px;
    }
    .entry-name {
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: var(--rm-font-size-sm, 14px);
    }
    .entry-servings {
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary, #8e8e93);
      flex-shrink: 0;
    }
    .entry-remove {
      background: var(--rm-error-soft, #f6e5df);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      min-width: 44px;
      margin-left: auto;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-error, #983d25);
      padding: 0;
      opacity: 1;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .entry-remove:hover {
      background: var(--rm-error, #983d25);
      color: var(--rm-error-text, #fff);
    }
    .entry-remove ha-icon {
      --mdc-icon-size: 18px;
    }

    .add-slot-btn {
      background: none;
      border: 1px dashed var(--rm-border, rgba(255, 255, 255, 0.12));
      border-radius: 4px;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        border-color 0.15s,
        color 0.15s;
      padding: 0;
      margin-top: auto;
    }
    .add-slot-btn ha-icon {
      --mdc-icon-size: 20px;
    }
    .add-slot-btn:hover {
      border-color: var(--rm-accent, #ff6b35);
      color: var(--rm-accent, #ff6b35);
    }

    .clear-row {
      display: flex;
      justify-content: center;
      padding: 8px;
    }
    .text-danger-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-error, #983d25);
      font-size: var(--rm-font-size-sm, 14px);
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: 6px;
    }
    .text-danger-btn:hover {
      opacity: 1;
      background: var(--rm-error-soft, #f6e5df);
    }
    .text-danger-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    /* Picker */
    .picker-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      z-index: 20;
    }
    .picker-panel {
      background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
      border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
      width: 100%;
      max-height: 80%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--rm-border);
      min-height: 0;
    }
    .picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
      font-weight: 600;
      font-size: var(--rm-font-size-base, 16px);
      color: var(--rm-text, #e5e5ea);
      text-transform: capitalize;
      flex-shrink: 0;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .picker-servings-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
      flex-shrink: 0;
    }
    .picker-label {
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text-secondary, #8e8e93);
    }
    .servings-ctrl {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .scaler-btn {
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
      border-radius: 50%;
      width: 44px;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text, #e5e5ea);
      padding: 0;
    }
    .scaler-btn ha-icon {
      --mdc-icon-size: 14px;
    }
    .servings-val {
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 600;
      color: var(--rm-text, #e5e5ea);
      min-width: 24px;
      text-align: center;
    }

    .picker-search-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
      flex-shrink: 0;
    }
    .search-icon {
      color: var(--rm-text-secondary, #8e8e93);
      --mdc-icon-size: 18px;
    }
    .picker-search {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text, #e5e5ea);
      font-size: var(--rm-font-size-base, 16px);
      padding: 10px 0;
    }
    .picker-search::placeholder {
      color: var(--rm-text-secondary, #8e8e93);
    }

    .picker-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border, rgba(255, 255, 255, 0.08)) transparent;
    }
    .picker-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      width: 100%;
      border: 0;
      background: transparent;
      color: var(--rm-text);
      text-align: left;
      cursor: pointer;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.05));
      transition: background 0.12s;
    }
    .picker-item:hover {
      background: var(--rm-bg-elevated, #2c2c2e);
    }
    .picker-thumb {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .picker-placeholder {
      background: var(--rm-bg-elevated, #2c2c2e);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary, #8e8e93);
    }
    .picker-placeholder ha-icon {
      --mdc-icon-size: 22px;
    }
    .picker-info {
      display: block;
      flex: 1;
      min-width: 0;
    }
    .picker-name {
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      color: var(--rm-text, #e5e5ea);
      display: block;
    }
    .picker-tags {
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary, #8e8e93);
    }
    .picker-fav {
      color: var(--rm-error, #983d25);
      --mdc-icon-size: 16px;
    }
    .picker-empty {
      padding: 30px;
      text-align: center;
      color: var(--rm-text-secondary, #8e8e93);
      font-size: var(--rm-font-size-sm, 14px);
    }
    ${ue}
  `};try{customElements.define("rm-meal-planner",Xe)}catch{}var Tt="unified",Zt=[["en","English"],["es","Espa\xF1ol"],["fr","Fran\xE7ais"],["de","Deutsch"],["pt","Portugu\xEAs"],["nl","Nederlands"],["it","Italiano"]],Ye=class extends he{static properties={hass:{type:Object},settings:{type:Object},_activeTab:{type:String},_rmVersion:{type:String},_rmcVersion:{type:String},_backupState:{type:String}};constructor(){super(),this.settings={},this._activeTab="appearance",this._rmVersion="\u2026",this._rmcVersion="\u2026",this._backupState=null}updated(e){e.has("hass")&&this.hass&&this._rmVersion==="\u2026"&&this._fetchVersionsFromHacs()}async _backup(){if(this._backupState!=="loading"){this._backupState="loading";try{let e=await this.hass.callWS({type:"recipe_manager/backup"}),i=JSON.stringify(e,null,2),t=new Blob([i],{type:"application/json"}),r=URL.createObjectURL(t),a=document.createElement("a");a.href=r,a.download=`macromate-backup-${new Date().toISOString().slice(0,10)}.json`,a.click(),URL.revokeObjectURL(r),this._backupState="done"}catch(e){console.error("[RM] Backup failed:",e),this._backupState="error"}setTimeout(()=>{this._backupState=null},3e3)}}_fetchVersionsFromHacs(){this.hass&&(this._rmVersion="\u2026",this._rmcVersion="\u2026",this.hass.callWS({type:"recipe_manager/get_info"}).then(e=>{this._rmVersion=e.version||"\u2014",this._rmcVersion=Tt}).catch(()=>{this._rmVersion="\u2014",this._rmcVersion=Tt}))}_update(e){let i=_e({...this.settings,...e});this.dispatchEvent(new CustomEvent("rm-settings-change",{detail:{settings:i},bubbles:!0,composed:!0}))}render(){let e=_e(this.settings);return h`
      <div class="settings-root">
        <div class="tab-bar">
          ${[["appearance","mdi:palette-outline",o("Appearance")],["advanced","mdi:tune-variant",o("Advanced")],["sync","mdi:cloud-sync-outline",o("Sync")],["help","mdi:help-circle-outline",o("Help")]].map(([i,t,r])=>h`
              <button
                class="tab-item ${this._activeTab===i?"active":""}"
                aria-pressed=${this._activeTab===i}
                @click=${()=>{this._activeTab=i}}
              >
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
    `}_renderAppearance(e){return h`
      <!-- ── Language & Units ── -->
      <div class="section">
        <div class="section-label">${o("Language & Units")}</div>

        <div class="setting-row">
          <span class="setting-name">${o("Language")}</span>
          <select
            class="setting-select"
            aria-label=${o("Language")}
            @change=${i=>this._update({language:i.target.value})}
          >
            ${Zt.map(([i,t])=>h`
                <option
                  value="${i}"
                  ?selected=${(e.language??"en")===i}
                >
                  ${t}
                </option>
              `)}
          </select>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Preferred units")}</span>
          <div class="btn-group">
            ${[["imperial",o("Imperial")],["metric",o("Metric")]].map(([i,t])=>h`
                <button
                  class="seg-btn ${(e.unitSystem??"imperial")===i?"active":""}"
                  aria-pressed=${(e.unitSystem??"imperial")===i}
                  @click=${()=>this._update({unitSystem:i})}
                >
                  ${t}
                </button>
              `)}
          </div>
        </div>
      </div>

      <!-- ── Theme ── -->
      <div class="section">
        <div class="section-label">${o("Theme")}</div>

        <div class="theme-identity">
          <ha-icon icon="mdi:waves"></ha-icon>
          <span class="theme-name">Glass Wave</span>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Dark mode")}</span>
          <div class="btn-group" role="group" aria-label=${o("Dark mode")}>
            ${[["off",o("Light")],["system",o("Auto")],["on",o("Dark")]].map(([i,t])=>h`
                <button
                  class="seg-btn ${e.darkMode===i?"active":""}"
                  aria-pressed=${e.darkMode===i}
                  @click=${()=>this._update({darkMode:i})}
                >
                  ${t}
                </button>
              `)}
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Text size")}</span>
          <div class="btn-group">
            ${[["small",o("S")],["medium",o("M")],["large",o("L")]].map(([i,t])=>h`
                <button
                  class="seg-btn ${e.fontSize===i?"active":""}"
                  aria-pressed=${e.fontSize===i}
                  @click=${()=>this._update({fontSize:i})}
                >
                  ${t}
                </button>
              `)}
          </div>
        </div>
      </div>

      <!-- ── Recipe Grid ── -->
      <div class="section">
        <div class="section-label">${o("Recipe Grid")}</div>

        <div class="setting-row">
          <span class="setting-name">${o("Recipe columns")}</span>
          <div class="btn-group">
            ${[2,3,4,5,8,10].map(i=>h`
                <button
                  class="seg-btn ${e.columns===i?"active":""}"
                  aria-pressed=${e.columns===i}
                  @click=${()=>this._update({columns:i})}
                >
                  ${i}
                </button>
              `)}
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Favourites section")}</span>
          <label class="toggle">
            <input
              type="checkbox"
              aria-label=${o("Favourites section")}
              ?checked=${e.showFavourites}
              @change=${i=>this._update({showFavourites:i.target.checked})}
            />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Recent recipes count")}</span>
            <span class="setting-hint"
              >${o("Recipes shown in the Recent filter tab")}</span
            >
          </div>
          <div class="btn-group">
            ${[6,12,24].map(i=>h`
                <button
                  class="seg-btn ${(e.recentCount??12)===i?"active":""}"
                  aria-pressed=${(e.recentCount??12)===i}
                  @click=${()=>this._update({recentCount:i})}
                >
                  ${i}
                </button>
              `)}
          </div>
        </div>
      </div>

      <!-- ── Navigation ── -->
      <div class="section">
        <div class="section-label">${o("Navigation")}</div>

        <div class="setting-row">
          <span class="setting-name">${o("Meal planner")}</span>
          <label class="toggle">
            <input
              type="checkbox"
              aria-label=${o("Meal planner")}
              ?checked=${e.showPlanner}
              @change=${i=>this._update({showPlanner:i.target.checked})}
            />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
    `}_renderAdvanced(e){return h`
      <!-- ── Timer Sound ── -->
      <div class="section">
        <div class="section-label">${o("Timer Sound")}</div>

        <div class="setting-row">
          <span class="setting-name">${o("Alarm sound")}</span>
          <select
            class="setting-select"
            aria-label=${o("Alarm sound")}
            @change=${i=>this._update({timerSound:i.target.value})}
          >
            <option
              value="beep"
              ?selected=${(e.timerSound??"beep")==="beep"}
            >
              ${o("Beep")}
            </option>
            <option value="ding" ?selected=${e.timerSound==="ding"}>
              ${o("Ding")}
            </option>
            <option value="alarm" ?selected=${e.timerSound==="alarm"}>
              ${o("Alarm (3 beeps)")}
            </option>
            <option value="none" ?selected=${e.timerSound==="none"}>
              ${o("Silent")}
            </option>
            <option value="file" ?selected=${e.timerSound==="file"}>
              ${o("Custom file\u2026")}
            </option>
          </select>
        </div>

        ${e.timerSound==="file"?h`
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">${o("Sound file")}</span>
                  <span class="setting-hint"
                    >${e.timerSoundFileName||o("No file selected")}</span
                  >
                </div>
                <label class="file-label">
                  <input
                    type="file"
                    accept="audio/*"
                    class="file-input"
                    @change=${this._handleSoundFileChange}
                  />
                  <ha-icon icon="mdi:folder-music-outline"></ha-icon>
                  ${e.timerSoundFile?o("Change"):o("Choose file")}
                </label>
              </div>
            `:""}

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Test sound")}</span>
            <span class="setting-hint"
              >${o("Play a preview of the selected alarm")}</span
            >
          </div>
          <button
            class="seg-btn active"
            @click=${()=>this._testSound(e.timerSound??"beep",e.timerSoundFile)}
          >
            <ha-icon icon="mdi:volume-high"></ha-icon> ${o("Play")}
          </button>
        </div>
      </div>

      <!-- ── Keep Screen On ── -->
      <div class="section">
        <div class="section-label">${o("Keep Screen On")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name"
              >${o("Keep screen on while viewing a recipe")}</span
            >
            <span class="setting-hint"
              >${o("Uses the Wake Lock API \u2014 engages automatically while a recipe is open")}</span
            >
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              aria-label=${o("Keep screen on while viewing a recipe")}
              ?checked=${e.keepScreenOn}
              @change=${i=>this._update({keepScreenOn:i.target.checked})}
            />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        ${e.keepScreenOn&&!xe()?h`
              <div class="setting-row muted-row">
                <span class="setting-hint"
                  >${o(`Not available in this browser/connection \u2014 the Wake Lock API requires a secure (HTTPS) connection to Home Assistant. This is the most common reason "keep screen on" doesn't work.`)}</span
                >
              </div>
            `:""}
        ${e.keepScreenOn?h`
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">${o("Auto-release after")}</span>
                  <span class="setting-hint"
                    >${o("Screen lock released after this many minutes")}</span
                  >
                </div>
                <div class="btn-group">
                  ${[15,30,45,60].map(i=>h`
                      <button
                        class="seg-btn ${(e.wakeLockDuration??60)===i?"active":""}"
                        aria-pressed=${(e.wakeLockDuration??60)===i}
                        @click=${()=>this._update({wakeLockDuration:i})}
                      >
                        ${i}m
                      </button>
                    `)}
                </div>
              </div>
            `:""}
      </div>

      <!-- ── Unit Conversion ── -->
      <div class="section">
        <div class="section-label">${o("Unit Conversion")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name"
              >${o("Show metric conversion button")}</span
            >
            <span class="setting-hint"
              >${o("Button in Ingredients tab converts oz/lb/cups/fl oz \u2192 g/ml/kg")}</span
            >
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              aria-label=${o("Show metric conversion button")}
              ?checked=${e.showUnitConversion}
              @change=${i=>this._update({showUnitConversion:i.target.checked})}
            />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>

      <!-- ── Image Slideshow ── -->
      <div class="section">
        <div class="section-label">${o("Image Slideshow")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Auto-advance interval")}</span>
            <span class="setting-hint"
              >${o("Seconds between slides when a recipe has multiple images (0 = off)")}</span
            >
          </div>
          <div class="btn-group">
            ${[0,3,5,10,15].map(i=>h`
                <button
                  class="seg-btn ${(e.slideshowInterval??5)===i?"active":""}"
                  aria-pressed=${(e.slideshowInterval??5)===i}
                  @click=${()=>this._update({slideshowInterval:i})}
                >
                  ${i===0?o("Off"):`${i}s`}
                </button>
              `)}
          </div>
        </div>
      </div>
    `}_handleSoundFileChange(e){let i=e.target.files?.[0];if(!i)return;let t=new FileReader;t.onload=r=>{this._update({timerSoundFile:r.target.result,timerSoundFileName:i.name})},t.readAsDataURL(i)}_testSound(e,i){if(e==="file"){typeof i=="string"&&i.length<=2e6&&/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(i)&&new Audio(i).play().catch(r=>console.warn("Could not play file:",r));return}try{let t=new(window.AudioContext||window.webkitAudioContext);if(e==="ding"){let r=t.createOscillator(),a=t.createGain();r.connect(a),a.connect(t.destination),r.type="sine",r.frequency.setValueAtTime(1046,t.currentTime),a.gain.setValueAtTime(.6,t.currentTime),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+1),r.start(t.currentTime),r.stop(t.currentTime+1)}else if(e==="alarm")for(let r=0;r<3;r++){let a=t.currentTime+r*.35,s=t.createOscillator(),c=t.createGain();s.connect(c),c.connect(t.destination),s.type="square",s.frequency.setValueAtTime(660,a),c.gain.setValueAtTime(.3,a),c.gain.exponentialRampToValueAtTime(.001,a+.2),s.start(a),s.stop(a+.2)}else if(e!=="none"){let r=t.createOscillator(),a=t.createGain();r.connect(a),a.connect(t.destination),r.type="sine",r.frequency.setValueAtTime(880,t.currentTime),a.gain.setValueAtTime(.5,t.currentTime),a.gain.exponentialRampToValueAtTime(.001,t.currentTime+.5),r.start(t.currentTime),r.stop(t.currentTime+.5)}}catch(t){console.warn("Audio test failed:",t)}}_renderSync(){let e=this._backupState==="loading"?o("Backing up\u2026"):this._backupState==="done"?o("Downloaded \u2713"):this._backupState==="error"?o("Failed \u2717"):o("Download backup");return h`
      <div class="section">
        <div class="section-label">${o("Backup")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Export recipes")}</span>
            <span class="setting-hint"
              >${o("Download all recipes and meal plans as a JSON file")}</span
            >
          </div>
          <button
            class="seg-btn backup-btn ${this._backupState||""}"
            ?disabled=${this._backupState==="loading"}
            @click=${()=>this._backup()}
          >
            ${e}
          </button>
        </div>
      </div>
    `}_renderHelp(){return h`
      <div class="section">
        <div class="section-label">${o("FAQ & Support")}</div>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate#readme"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:help-circle-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${o("FAQ")}</span>
            <span class="setting-hint"
              >${o("Frequently asked questions")}</span
            >
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:bug-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${o("Report a Problem")}</span>
            <span class="setting-hint"
              >${o("Submit an issue on GitHub")}</span
            >
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:github"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${o("GitHub Repository")}</span>
            <span class="setting-hint">${o("View source code")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>
      </div>

      <div class="section">
        <div class="section-label">${o("About")}</div>

        <div class="setting-row">
          <span class="setting-name">MacroMate</span>
          <span class="muted-note"
            >${o(te`Integration version ${this._rmVersion}`)}</span
          >
        </div>

        <div class="setting-row">
          <span class="setting-name">MacroMate UI</span>
          <span class="muted-note"
            >${o(te`Card version ${this._rmcVersion}`)}</span
          >
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Refresh versions")}</span>
          <button
            class="seg-btn"
            aria-label=${o("Refresh versions")}
            @click=${()=>this._fetchVersionsFromHacs()}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderPlaceholder(e,i,t){return h`
      <div class="placeholder-tab">
        <ha-icon icon="${i}"></ha-icon>
        <div class="placeholder-title">${e}</div>
        <div class="placeholder-msg">${t}</div>
      </div>
    `}static styles=pe`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    .settings-root {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .tab-bar {
      display: flex;
      border-bottom: 1px solid var(--rm-border, rgba(0, 0, 0, 0.08));
      background: var(--rm-bg-surface, #fff);
      flex-shrink: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tab-bar::-webkit-scrollbar {
      display: none;
    }

    .tab-item {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 10px 14px;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      color: var(--rm-text-secondary, #6b5c4a);
      cursor: pointer;
      white-space: nowrap;
      transition:
        color 0.15s,
        border-color 0.15s;
      flex-shrink: 0;
    }
    .tab-item ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }
    .tab-item:hover {
      color: var(--rm-text, #2d2016);
    }
    .tab-item.active {
      color: var(--rm-accent);
      border-bottom-color: var(--rm-accent);
    }

    .settings-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 20px 32px;
      background: var(--rm-bg-main);
    }

    .section {
      max-width: 880px;
      margin: 16px auto;
      border: 1px solid var(--rm-border);
      border-radius: var(--rm-radius);
      background: var(--rm-bg-surface);
      overflow: hidden;
    }

    .theme-identity {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      color: var(--rm-accent);
      background: var(--rm-accent-soft);
      margin: 12px 20px 4px;
      border-radius: var(--rm-radius-sm);
    }
    .theme-identity ha-icon {
      --mdc-icon-size: 28px;
    }
    .theme-name {
      font-size: 1.125em;
      font-weight: 700;
    }

    .section-label {
      font-size: var(--rm-font-size-sm);
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--rm-text-muted, #a08060);
      padding: 16px 20px 6px;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--rm-border-subtle);
      gap: 16px;
    }
    .setting-row:last-child {
      border-bottom: none;
    }
    .setting-row.muted-row {
      background: var(--rm-accent-soft);
    }

    .setting-name {
      font-size: 1em;
      font-weight: 600;
      flex-shrink: 1;
      overflow-wrap: anywhere;
      color: var(--rm-text);
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .setting-hint {
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-muted, #a08060);
    }

    .muted-note {
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-muted, #a08060);
    }

    .backup-btn {
      min-width: 140px;
      white-space: nowrap;
    }
    .backup-btn.done {
      background: var(--rm-success, #4caf50);
      color: var(--rm-success-text);
    }
    .backup-btn.error {
      background: var(--rm-danger, #e53935);
      color: var(--rm-danger-text);
    }
    .backup-btn.loading {
      opacity: 0.7;
      cursor: wait;
    }

    .help-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--rm-border, rgba(0, 0, 0, 0.06));
      text-decoration: none;
      color: inherit;
    }
    .help-link:last-of-type {
      border-bottom: none;
    }
    .help-link ha-icon {
      color: var(--rm-accent, #a0522d);
      flex-shrink: 0;
    }
    .help-link-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .help-link-ext {
      --mdc-icon-size: 16px;
      color: var(--rm-text-secondary);
    }

    .setting-select {
      background: var(--rm-bg-surface, #fff);
      color: var(--rm-text, #2d2016);
      border: 1px solid var(--rm-border-strong);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: var(--rm-font-size-sm);
      cursor: pointer;
      min-width: 160px;
      max-width: 100%;
      flex-shrink: 1;
    }

    .btn-group {
      display: flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--rm-border-strong);
      flex-shrink: 1;
    }
    .seg-btn {
      background: transparent;
      border: none;
      padding: 8px 14px;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      color: var(--rm-text-secondary, #6b5c4a);
      border-right: 1px solid var(--rm-border, rgba(0, 0, 0, 0.1));
      transition:
        background 0.12s,
        color 0.12s;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .seg-btn ha-icon {
      --mdc-icon-size: 16px;
    }
    .seg-btn:last-child {
      border-right: none;
    }
    .seg-btn.active {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #111);
    }
    .tab-item,
    .setting-select,
    .seg-btn,
    .file-label,
    .toggle {
      min-height: var(--rm-touch-target, 44px);
    }
    @media (max-width: 480px) {
      .settings-body {
        padding: 4px 12px 24px;
      }
      .setting-row {
        flex-wrap: wrap;
      }
      .btn-group {
        max-width: 100%;
        flex-wrap: wrap;
      }
      .seg-btn {
        flex: 1;
        justify-content: center;
      }
    }
    .seg-btn:hover:not(.active) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }

    .toggle {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .toggle input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    .toggle input:focus-visible + .toggle-track {
      outline: 3px solid var(--rm-focus);
      outline-offset: 3px;
    }
    .toggle-track {
      width: 44px;
      height: 24px;
      background: var(--rm-border-strong);
      border-radius: 12px;
      position: relative;
      transition: background 0.2s;
    }
    .toggle input:checked + .toggle-track {
      background: var(--rm-accent);
    }
    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: var(--rm-bg-elevated);
      border-radius: 50%;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .toggle input:checked ~ .toggle-track .toggle-thumb {
      transform: translateX(20px);
    }

    .file-label {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text);
      cursor: pointer;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .file-label:hover {
      background: var(--rm-accent-soft);
    }
    .file-label ha-icon {
      --mdc-icon-size: 18px;
      color: var(--rm-accent);
    }
    .file-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    .file-label:focus-within {
      outline: 3px solid var(--rm-focus);
      outline-offset: 3px;
    }

    .placeholder-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .placeholder-tab ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.3;
    }
    .placeholder-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--rm-text);
    }
    .placeholder-msg {
      font-size: var(--rm-font-size-sm);
      max-width: 280px;
      line-height: 1.5;
    }
    ${ue}
  `};try{customElements.define("rm-settings-view",Ye)}catch{}import{MacroMateNutritionBase as Gt}from"../nutrition-base.js";var Je=class extends Gt{get profilesEnabled(){return!0}renderOverview(){let e=document.createElement("mm-summary");e._hass=this.hass,e.data=this.data;let i=document.createElement("div");return i.className="nutrition-overview",i.append(e.renderEnergy(),e.renderMacros()),i}renderDiary(){super.renderDiary();let e=this.data.recommendation;if(e?.fallback_reasons?.includes("weight_unavailable")){let i=document.createElement("p");i.className="weight-fallback",i.setAttribute("role","status"),i.textContent=this.hass.language==="de"?`Gewichtssensor nicht verf\xFCgbar. Gespeichertes Profilgewicht: ${e.weight_kg} kg (kein Live-Messwert).`:`Weight sensor unavailable. Saved profile weight: ${e.weight_kg} kg (not live).`,this.diaryNode.append(i)}}};customElements.define("mm-nutrition",Je);var et="manual-toggle",Ct=["grid","detail","settings","planner"];function tt(u){let e=Math.floor(u/3600),i=Math.floor(u%3600/60),t=u%60;return e>0?`${e}:${String(i).padStart(2,"0")}:${String(t).padStart(2,"0")}`:`${i}:${String(t).padStart(2,"0")}`}function it(u){try{let e=new(window.AudioContext||window.webkitAudioContext);e.createGain().connect(e.destination);let t=(r,a,s,c=.6)=>{let _=e.createOscillator(),w=e.createGain();_.connect(w),w.connect(e.destination),_.frequency.value=r,w.gain.setValueAtTime(c,e.currentTime+a),w.gain.exponentialRampToValueAtTime(.001,e.currentTime+a+s),_.start(e.currentTime+a),_.stop(e.currentTime+a+s+.05)};if(u==="beep")t(880,0,.15),t(880,.2,.15),t(880,.4,.15);else if(u==="ding")t(1318,0,.8,.5),t(1047,.1,.6,.3);else if(u==="alarm")for(let r=0;r<5;r++)t(880,r*.25,.12),t(660,r*.25+.13,.1)}catch{}}var rt=class extends he{static properties={hass:{type:Object},systemDark:{attribute:!1},_config:{type:Object},_view:{type:String},_recipes:{type:Array},_tags:{type:Array},_selectedRecipe:{type:Object},_loading:{type:Boolean},_error:{type:String},_searchQuery:{type:String},_activeTag:{type:String},_settings:{type:Object},_wide:{type:Boolean},_sidebarCollapsed:{type:Boolean},_gridScrollPos:{type:Number},_recentRecipeIds:{type:Array},_timers:{type:Array},_timerAlarm:{type:Object},_timerAlarmQueue:{type:Array},_timersPrevView:{type:String},_customTimerInput:{type:String},_hdrStarHover:{type:Number},_mobileMenuOpen:{type:Boolean},_navDirection:{type:String},_closingDetail:{type:Boolean},_gridFilterPreset:{type:Object},_timerPresets:{type:Array},_presetNameInput:{type:String},_presetMinsInput:{type:String},_alarmAddInput:{type:String},_plannerFromRecipe:{type:Object},_globalMode:{type:Boolean},_quickTimerLabel:{type:String},_globalWakeActive:{type:Boolean}};constructor(){super(),this._pendingViewRestore=null,this._view="grid",this._recipes=[],this._tags=[],this._selectedRecipe=null,this._loading=!1,this._error=null,this._searchQuery="",this._activeTag=null,this._settings=_e(),this._languageAutoDetectPending=!0,Te(this._settings.language),this._wide=!1,this._sidebarCollapsed=!1,this._gridScrollPos=0,this._recentRecipeIds=[],this._timers=[],this._timerAlarm=null,this._timerAlarmQueue=[],this._timersPrevView=null,this._customTimerInput="",this._hdrStarHover=0,this._mobileMenuOpen=!1,this._navDirection="forward",this._closingDetail=!1,this._gridFilterPreset=null,this._timerPresets=[],this._presetNameInput="",this._presetMinsInput="",this._alarmAddInput="",this._plannerFromRecipe=null,this._globalMode=!1,this._quickTimerLabel="",this._alarmLoopActive=!1,this._alarmInterval=null,this._alarmTimeout=null,this._alarmAudio=null,this._unsubscribe=null,this._refreshGeneration=0,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._recipeRefreshDeferred=!1,this._darkModeQuery=null,this._resizeObserver=null,this._timerTick=null,this._globalWakeActive=!1,this._globalWakeUnsubscribeFn=null}setConfig(e){this._config=e}static getStubConfig(){return{}}getCardSize(){return 6}_updateHeight(){requestAnimationFrame(()=>requestAnimationFrame(()=>{let e=this.getBoundingClientRect().top,i=window.innerHeight-Math.max(e,0);i>100&&(this.style.height=`${i}px`)}))}connectedCallback(){super.connectedCallback(),this._darkModeQuery=window.matchMedia("(prefers-color-scheme: dark)"),this._darkModeQuery.addEventListener("change",this._onSystemDark),this._applyTheme(),this._resizeObserver=new ResizeObserver(e=>{let i=e[0]?.contentRect?.width??0;this._wide=i>=620}),this._resizeObserver.observe(this),this._onViewportResize=()=>this._updateHeight(),window.visualViewport?.addEventListener("resize",this._onViewportResize),window.addEventListener("resize",this._onViewportResize),this._updateHeight(),this._timerTick=setInterval(()=>this._tickTimers(),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._refreshGeneration++,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null),this._darkModeQuery?.removeEventListener("change",this._onSystemDark),this._resizeObserver?.disconnect(),window.visualViewport?.removeEventListener("resize",this._onViewportResize),window.removeEventListener("resize",this._onViewportResize),this._timerTick&&(clearInterval(this._timerTick),this._timerTick=null),this._timerAlarm&&(this._stopAlarmLoop(),this._timerAlarm=null),this._timerAlarmQueue=[],this._globalWakeActive&&Ae(et)}_onSystemDark=()=>{this._settings.darkMode==="system"&&this._applyTheme()};updated(e){if(e.has("hass")&&this.hass&&!this._api&&(this._api=new Oe(this.hass),this._api.transport=this.transport,this._init()),e.has("hass")&&this.hass&&this._languageAutoDetectPending){this._languageAutoDetectPending=!1;let i=(this.hass.language||"").split("-")[0].toLowerCase(),t=Pe.includes(i)?i:this._settings.language;this._settings={...this._settings,language:t},Te(t)}e.has("hass")&&this._api&&(this._api.hass=this.hass),(e.has("_settings")||e.has("systemDark"))&&this._applyTheme(),(e.has("_view")||e.has("_selectedRecipe")||e.has("_timers")||e.has("_recentRecipeIds"))&&this._saveViewState(),(e.has("_view")||e.has("_closingDetail"))&&this._recipeRefreshDeferred&&!this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail")&&this._queueRefresh()}_saveViewState(){if(!this._cacheBootstrapped||!this.transport?.current())return;let e=Ct.includes(this._view)?this._view:"grid";ct(this.transport,{view:e,recipeId:e==="detail"&&this._selectedRecipe?.id||null,recentIds:this._recentRecipeIds},this._timers)}_restoreViewState(){let e=this._pendingViewRestore;if(this._pendingViewRestore=null,!(!e||!Ct.includes(e.view)))if(e.view==="detail"&&e.recipeId){let i=this._recipes.find(t=>t.id===e.recipeId);i&&(this._selectedRecipe=i,this._view="detail")}else e.view!=="detail"&&(this._view=e.view)}_applyTheme(){dt(this,this._settings,this.systemDark??this._darkModeQuery?.matches??!1),this.dispatchEvent(new CustomEvent("macromate-appearance",{detail:{settings:this._settings},bubbles:!0,composed:!0}))}async _init(){if(this._loading=!0,this._error=null,this.hass.user.is_admin||(this._view="nutrition"),!this._cacheBootstrapped&&this.hass.user.is_admin){let e=lt(this.transport);this._pendingViewRestore=e,this._recentRecipeIds=e.recentIds||[],this._timers=e.timers||[],this._cacheBootstrapped=!0}try{let e;try{e=await this.transport.call("preferences_get")}catch(i){if(this.hass.user.is_admin)throw i;return}if(e.preferences?.recipe_settings&&(this._settings=_e({...this._settings,...e.preferences.recipe_settings}),await Te(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade()),!this.hass.user.is_admin){this._view="nutrition";return}await Promise.all([this._loadRecipes(),this._loadTags(),this._loadGlobalTimers()]),this._restoreViewState(),await this._loadPresets(),await this._subscribe()}catch(e){this._error=e.message||o("Failed to load recipes")}finally{this._loading=!1}}async _loadGlobalTimers(){try{let{timers:e}=await this._api.getGlobalTimers(),i=Date.now()/1e3;this._timers=[...this._timers.filter(t=>!t.global),...(e||[]).map(t=>this._globalTimerToLocal(t,i))]}catch{}}_globalTimerToLocal(e,i=Date.now()/1e3){let t=e.running?Math.max(0,e.duration-(i-e.start_time)):e.paused_remaining??e.duration;return{id:e.id,label:e.label,total:e.duration,remaining:Math.round(t),running:e.running&&t>0,alarming:e.running&&t<=0,presetId:e.preset_id||null,global:!0,duration:e.duration,start_time:e.start_time,paused_remaining:e.paused_remaining}}async _loadRecipes(){let e=await this._api.getAllRecipes();this._recipes=e?.recipes??[]}async _loadTags(){let e=await this._api.getTags();this._tags=e?.tags??[]}async _subscribe(){if(this._unsubscribe)return;let e=this._refreshGeneration,i=await this._api.subscribe(()=>this._queueRefresh());!this.isConnected||e!==this._refreshGeneration||!this.transport.current()?i():this._unsubscribe=i}_queueRefresh(){if(this._refreshRequested=!0,this._refreshScheduled||this._refreshRunning)return;this._refreshScheduled=!0;let e=this._refreshGeneration;queueMicrotask(()=>{e===this._refreshGeneration&&(this._refreshScheduled=!1,this._refreshLive())})}async _refreshLive(){let e=this.transport;if(!this._refreshRequested||!this.isConnected||!e?.current()||e.pending)return;this._refreshRequested=!1,this._refreshRunning=!0;let i=this._refreshGeneration,t=()=>!!this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail"),r=t();try{let[a,s,c]=await Promise.all([r?null:this._api.getAllRecipes(),r?null:this._api.getTags(),r?null:this._api.getGlobalTimers()]);if(!this.isConnected||i!==this._refreshGeneration||this.transport!==e||!e.current())return;if(e.pending){this._refreshRequested=!0;return}this._recipeRefreshDeferred=r||t(),r&&!t()&&(this._refreshRequested=!0),this._recipeRefreshDeferred||(this._recipes=a?.recipes??[],this._tags=s?.tags??[],this._timers=[...this._timers.filter(_=>!_.global),...(c?.timers||[]).map(_=>this._globalTimerToLocal(_))])}catch{}finally{i===this._refreshGeneration&&(this._refreshRunning=!1,this._refreshRequested&&!e.pending&&e.current()&&this._queueRefresh())}}get _filteredRecipes(){let e=this._recipes;if(this._activeTag&&(e=e.filter(i=>i.tags?.includes(this._activeTag)||i.courses?.includes(this._activeTag)||i.categories?.includes(this._activeTag)||i.collections?.includes(this._activeTag))),this._searchQuery.trim()){let i=this._searchQuery.trim().toLowerCase();e=e.filter(t=>t.name?.toLowerCase().includes(i)||t.description?.toLowerCase().includes(i)||t.tags?.some(r=>r.toLowerCase().includes(i)))}return e}get _recentRecipes(){let e=this._settings.recentCount??12;return this._recentRecipeIds.slice(0,e).map(i=>this._recipes.find(t=>t.id===i)).filter(Boolean)}async _handleSettingsChange(e){let i=this._settings.language;if(this._settings=_e(e.detail.settings),this._settings.language!==i){await Te(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade(),this.requestUpdate();for(let t of this.shadowRoot.querySelectorAll("*"))t.requestUpdate?.()}try{await this.transport.call("preferences_update",{preferences:{recipe_settings:this._settings}}),this._error=null}catch(t){this._error=this._settings.language==="de"?t.code==="uncertain"?"Speicherstatus unklar. Gleiche Anfrage nur ausdr\xFCcklich erneut senden.":t.code==="pending"?"Zuerst die unklare Anfrage kl\xE4ren.":"Einstellungen konnten nicht gespeichert werden. Felder und Berechtigungen pr\xFCfen.":t.message}}async _toggleGlobalWakeLock(){xe()&&(this._globalWakeActive?(await Ae(et),this._globalWakeActive=!1):(await Ne(et),this._globalWakeActive=!0))}_tickTimers(){if(!this._timers.length)return;let e=!1,i=[],t=Date.now()/1e3,r=this._timers.map(a=>{if(a.alarming||!a.running)return a;let s=a.global?Math.max(0,a.duration-(t-a.start_time)):a.remaining-1;if(e=!0,s<=0){if(a.presetId)return{...a,remaining:0,running:!1,alarming:!0};i.push({id:a.id,label:a.label})}return{...a,remaining:Math.round(s),running:s>0}});e&&(this._timers=r),i.length&&(this._timerAlarm||(this._timerAlarm=i.shift(),this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile)),i.length&&(this._timerAlarmQueue=[...this._timerAlarmQueue,...i]))}async _startTimer(e,i,t=null,r=!1){if(!Number.isFinite(e)||e<=0||e>604800||i&&String(i).length>300)return;let a=i||o(te`${Math.floor(e/60)} min timer`);if(r&&this._api)try{let c=Date.now()/1e3;await this._api.addGlobalTimer({label:a,duration:e,start_time:c,running:!0,paused_remaining:null,...t?{preset_id:t}:{}}),await this._loadGlobalTimers();return}catch(c){this._error=c.message;return}let s=crypto.randomUUID();this._timers=[...this._timers,{id:s,label:a,total:e,remaining:e,running:!0,presetId:t||null}]}async _stopTimer(e){if(this._timers.find(t=>t.id===e)?.global){try{await this._api.deleteGlobalTimer(e),await this._loadGlobalTimers()}catch(t){this._error=t.message}return}this._timers=this._timers.filter(t=>t.id!==e)}async _pauseTimer(e){let i=this._timers.find(t=>t.id===e);if(i){if(i.global){try{await this._api.updateGlobalTimer(e,i.running?{running:!1,paused_remaining:i.remaining}:{running:!0,start_time:Date.now()/1e3-(i.duration-i.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(t){this._error=t.message}return}this._timers=this._timers.map(t=>t.id===e?{...t,running:!t.running}:t)}}async _addTimeToTimer(e,i){let t=this._timers.find(r=>r.id===e);if(t){if(t.global){try{await this._api.updateGlobalTimer(e,{duration:t.duration+i,running:!0,start_time:Date.now()/1e3-(t.duration-t.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(r){this._error=r.message}return}this._timers=this._timers.map(r=>r.id===e?{...r,total:r.total+i,remaining:r.remaining+i,running:!0,alarming:!1}:r)}}_dismissAlarm(){this._timerAlarm&&(this._stopAlarmLoop(),this._stopTimer(this._timerAlarm.id),this._timerAlarm=this._timerAlarmQueue.length?this._timerAlarmQueue.shift():null,this._timerAlarm&&this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile))}async _loadPresets(){let e=await this.transport.call("timer_presets_get");this._timerPresets=e.presets||[]}async _addPresetTimer(){let e=this._presetNameInput.trim(),i=Number(this._presetMinsInput);if(!(!e||!Number.isFinite(i)||i<=0))try{await this.transport.call("timer_presets_add",{name:e,seconds:Math.round(i*60)}),await this._loadPresets(),this._presetNameInput="",this._presetMinsInput=""}catch(t){this._error=t.message}}async _removePreset(e){try{await this.transport.call("timer_presets_delete",{preset_id:e}),await this._loadPresets()}catch(i){this._error=i.message}}_startAlarmLoop(e,i){if(this._stopAlarmLoop(),e!=="none"&&!(e==="file"&&(typeof i!="string"||i.length>2e6||!/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(i))))if(e==="file"&&i){this._alarmLoopActive=!0;let t=()=>{this._alarmLoopActive&&(this._alarmAudio=new Audio(i),this._alarmAudio.onended=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(t,2e3))},this._alarmAudio.onerror=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(()=>it("beep"),2e3))},this._alarmAudio.play().catch(()=>{}))};t()}else it(e),this._alarmInterval=setInterval(()=>it(e),4e3)}_stopAlarmLoop(){this._alarmLoopActive=!1,this._alarmInterval&&(clearInterval(this._alarmInterval),this._alarmInterval=null),this._alarmTimeout&&(clearTimeout(this._alarmTimeout),this._alarmTimeout=null),this._alarmAudio&&(this._alarmAudio.pause(),this._alarmAudio.onended=null,this._alarmAudio.onerror=null,this._alarmAudio=null)}_handleStartTimer(e){let{seconds:i,label:t}=e.detail;this._startTimer(i,t,null,this._globalMode)}_handleSearch(e){this._searchQuery=e.detail?.query??""}_handleTagFilter(e){let i=e.detail?.tag;this._activeTag=this._activeTag===i?null:i}_handleChipNav(e){let{filterMode:i,value:t}=e.detail;this._navDirection="back",i==="tags"?(this._activeTag=t,this._gridFilterPreset=null):(this._activeTag=null,this._gridFilterPreset={filterMode:i,selectedValues:[t]}),this._view="grid"}_handleBack(){this._closingDetail||(this._view==="detail"&&this._selectedRecipe&&!this._closingDetail?(this._closingDetail=!0,this._view="grid",window.matchMedia("(prefers-reduced-motion: reduce)").matches&&(this._closingDetail=!1,this._selectedRecipe=null)):(this._navDirection="back",this._view="grid",this._selectedRecipe=null,this._closingDetail=!1))}_onDetailTransitionEnd(e){e.target===e.currentTarget&&e.propertyName==="transform"&&this._closingDetail&&(this._closingDetail=!1,this._selectedRecipe=null)}_handleShowGrid(){if(!this.hass.user.is_admin){this._view="nutrition";return}this._navDirection="back",this._view="grid",this._selectedRecipe=null}_handleShowPlanner(){this._plannerFromRecipe=this._selectedRecipe||null,this._navDirection="forward",this._view="planner"}_handleBackToRecipe(){this._plannerFromRecipe&&(this._selectedRecipe=this._plannerFromRecipe,this._plannerFromRecipe=null,this._navDirection="back",this._view="detail")}_handleOpenRecipe(e){let i=this.shadowRoot?.querySelector("rm-recipe-grid");if(i){let r=i.shadowRoot?.querySelector(".grid-scroll");this._gridScrollPos=r?.scrollTop??0}let t=e.detail?.recipe;if(this._closingDetail=!1,this._navDirection="forward",this._selectedRecipe=t,this._view="detail",t?.id){let r=[t.id,...this._recentRecipeIds.filter(a=>a!==t.id)].slice(0,50);this._recentRecipeIds=r}}async _handleToggleFavourite(e){try{let{recipeId:i}=e.detail;await this._api.toggleFavourite(i),await this._loadRecipes(),this._selectedRecipe?.id===i&&(this._selectedRecipe=this._recipes.find(t=>t.id===i)??this._selectedRecipe)}catch{}}async _handleDeleteRecipe(e){try{await this._api.deleteRecipe(e.detail.recipeId),await this._loadRecipes(),await this._loadTags(),this._navDirection="back",this._view="grid",this._selectedRecipe=null}catch{}}async _handleUpdateRecipe(e){try{let{recipeId:i,data:t}=e.detail;await this._api.updateRecipe(i,t),await this._loadRecipes(),await this._loadTags(),this._selectedRecipe?.id===i&&(this._selectedRecipe=this._recipes.find(r=>r.id===i)??null)}catch{}}async _handleAddRecipe(e){try{await this._api.addRecipe(e.detail.data),this._navDirection="back",this._view="grid",await this._loadRecipes(),await this._loadTags()}catch(i){console.error("[Recipe Manager] Failed to save recipe:",i)}}async _handleImportDone(){this._navDirection="back",this._view="grid",await this._loadRecipes(),await this._loadTags()}_renderStars(e){let i=e||0,t=this._hdrStarHover,r=t>0?t:i;return h`
      <div
        class="header-stars"
        @mouseleave=${()=>{this._hdrStarHover=0}}
        title="${t>0?o(te`Set rating: ${t}★`):i>0?o(te`Rating: ${i}★ — click to change`):o("Click to rate")}"
      >
        ${[1,2,3,4,5].map(a=>h`
            <button
              class="hdr-star ${a<=r?"filled":""}"
              aria-label=${o(te`Set rating: ${a}★`)}
              aria-pressed=${a===i}
              @mouseover=${()=>{this._hdrStarHover=a}}
              @click=${()=>this._handleRateRecipe(a)}
            >
              ★
            </button>
          `)}
      </div>
    `}async _handleRateRecipe(e){try{if(!this._selectedRecipe)return;let i=this._selectedRecipe.rating===e?null:e;this._hdrStarHover=0,await this._handleUpdateRecipe({detail:{recipeId:this._selectedRecipe.id,data:{rating:i}}})}catch{}}_renderSidebar(){if(!this.hass?.user?.is_admin)return h`<nav class="rm-sidebar">
        <div class="sb-nav">
          <button
            class="sb-item"
            @click=${()=>{this._view="nutrition"}}
          >
            ${this.hass.language==="de"?"Ern\xE4hrung":"Nutrition"}</button
          ><button
            class="sb-item"
            @click=${()=>{this._view="settings"}}
          >
            ${o("Settings")}
          </button>
        </div>
      </nav>`;let e=this._view,i=this._sidebarCollapsed,t=(r,a,s,c=!1,_=null)=>h`
      <button
        class="sb-item ${e===s?"active":""} ${c?"placeholder":""}"
        title="${c?o(te`${a} — coming soon`):a}"
        @click=${c?void 0:_||(()=>{this._navDirection="forward",this._view=s,this._selectedRecipe=null})}
        ?disabled=${c}
      >
        <ha-icon icon="${r}"></ha-icon>
        ${i?"":h`<span>${a}</span>`}
      </button>
    `;return h`
      <nav class="rm-sidebar ${i?"collapsed":""}">
        <div class="sb-top">
          <div class="sb-logo-row">
            <button
              class="sb-collapse-btn"
              @click=${()=>{this._sidebarCollapsed=!this._sidebarCollapsed}}
              title="${i?o("Expand sidebar"):o("Collapse sidebar")}"
            >
              <ha-icon
                icon="${i?"mdi:menu-close":"mdi:menu-open"}"
              ></ha-icon>
            </button>
          </div>

          ${i?h`
                <button
                  class="sb-icon-only-btn"
                  @click=${()=>{this._view="add"}}
                  title="${o("New Recipe")}"
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                </button>
              `:h`
                <div class="sb-search">
                  <ha-icon icon="mdi:magnify" class="sb-search-icon"></ha-icon>
                  <input
                    class="sb-search-input"
                    type="text"
                    placeholder="${o("Search\u2026")}"
                    .value=${this._searchQuery}
                    @input=${r=>{this._searchQuery=r.target.value,this._navDirection="back",this._view="grid"}}
                  />
                  ${this._searchQuery?h`
                        <button
                          class="sb-search-clear"
                          @click=${()=>{this._searchQuery=""}}
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      `:""}
                </div>

                <button
                  class="sb-new-btn"
                  @click=${()=>{this._view="add"}}
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                  <span>${o("New Recipe")}</span>
                </button>
              `}
        </div>

        <div class="sb-nav">
          ${t("mdi:home",o("Home"),"grid")}
          ${t("mdi:heart-pulse",this._settings.language==="de"?"Ern\xE4hrung":"Nutrition","nutrition")}
          ${this._settings.showPlanner?t("mdi:calendar-week",o("Meal Planner"),"planner",!1,()=>{this._plannerFromRecipe=null,this._navDirection="forward",this._view="planner",this._selectedRecipe=null}):""}
          ${t("mdi:book-open-variant",o("Cookbook"),"cookbook",!0)}
          <button
            class="sb-item ${e==="timers"?"active":""}"
            title="${o("Timers")}"
            @click=${()=>{this._timersPrevView=this._view,this._view="timers"}}
          >
            <ha-icon icon="mdi:timer-outline"></ha-icon>
            ${i?"":h`<span>${o("Timers")}</span>`}
            ${this._timers.length?h`<span class="sb-timer-badge">${this._timers.length}</span>`:""}
          </button>
        </div>

        <div class="sb-bottom">
          <button
            class="sb-item placeholder"
            disabled
            title="${o("Sync \u2014 coming soon")}"
          >
            <ha-icon icon="mdi:cloud-sync-outline"></ha-icon>${i?"":h`<span>${o("Sync")}</span>`}
          </button>
          <button
            class="sb-item placeholder"
            disabled
            title="${o("Help \u2014 coming soon")}"
          >
            <ha-icon icon="mdi:help-circle-outline"></ha-icon>${i?"":h`<span>${o("Help")}</span>`}
          </button>
          <button
            class="sb-item ${e==="settings"?"active":""}"
            @click=${()=>{this._view="settings"}}
          >
            <ha-icon icon="mdi:cog-outline"></ha-icon>${i?"":h`<span>${o("Settings")}</span>`}
          </button>
        </div>
      </nav>
    `}_renderHeader(){let e=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe,i=this._view==="settings",t=this._view==="add",r=this._view==="timers",a=this._wide,s=i?o("Settings"):t?o("New Recipe"):r?o("Timers"):e?"":this._view==="planner"?o("Meal Planner"):this._view==="nutrition"?this._settings.language==="de"?"Ern\xE4hrung":"Nutrition":o("Recipes");return h`
      <div class="rm-header">
        <div class="rm-header-left">
          ${e||t?h`
                <button
                  class="icon-btn"
                  @click=${this._handleBack}
                  title="${o("Back")}"
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                </button>
              `:r&&this._timersPrevView==="detail"?h`
                  <button
                    class="icon-btn"
                    @click=${()=>{this._navDirection="back",this._view="detail",this._timersPrevView=null}}
                    title="${o("Back to recipe")}"
                  >
                    <ha-icon icon="mdi:arrow-left"></ha-icon>
                  </button>
                `:!a&&this._view!=="grid"&&!i&&!r?h`
                    <button
                      class="icon-btn"
                      aria-label=${o("Back")}
                      @click=${this._handleShowGrid}
                    >
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
          ${this._timers.length&&this._view!=="timers"?h`
                <button
                  class="timer-pills"
                  aria-label=${o("Timers")}
                  @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}
                >
                  ${this._timers.slice(0,3).map(c=>h`
                      <div class="timer-pill ${c.running?"":"paused"}">
                        <ha-icon icon="mdi:timer-outline"></ha-icon>
                        <span>${tt(c.remaining)}</span>
                      </div>
                    `)}
                  ${this._timers.length>3?h`<span class="timer-more"
                        >+${this._timers.length-3}</span
                      >`:""}
                </button>
              `:""}
          ${e?this._renderStars(this._selectedRecipe.rating):""}

          <button
            class="icon-btn wake-toggle-btn ${this._globalWakeActive?"active":""}"
            @click=${this._toggleGlobalWakeLock}
            ?disabled=${!xe()}
            title="${xe()?this._globalWakeActive?o("Screen awake \u2014 click to allow sleep"):o("Keep screen awake"):o("Keep screen awake \u2014 requires a secure (HTTPS) connection and a supported browser")}"
          >
            <ha-icon
              icon="${this._globalWakeActive?"mdi:eye":"mdi:eye-off-outline"}"
            ></ha-icon>
          </button>

          ${i||t||r?h`
                <button
                  class="icon-btn"
                  aria-label=${o("Close")}
                  @click=${this._handleShowGrid}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `:a?"":h`
                  <button
                    class="icon-btn"
                    @click=${()=>{this._mobileMenuOpen=!this._mobileMenuOpen}}
                    title="${this._mobileMenuOpen?o("Close menu"):o("Menu")}"
                  >
                    <ha-icon
                      icon="${this._mobileMenuOpen?"mdi:close":"mdi:menu"}"
                    ></ha-icon>
                  </button>
                `}
        </div>
      </div>
    `}_renderBody(){let e=this._settings;if(this._view==="nutrition")return h`<mm-nutrition .hass=${this.hass}></mm-nutrition>`;if(this._view==="settings")return h`
        <rm-settings-view
          .hass=${this.hass}
          .settings=${e}
          @rm-settings-change=${this._handleSettingsChange}
        ></rm-settings-view>
      `;if(this._view==="add")return h`
        <rm-add-recipe-dialog
          .api=${this._api}
          .asPanel=${!0}
          .inlineMode=${!0}
          @rm-add-recipe=${this._handleAddRecipe}
          @rm-import-done=${this._handleImportDone}
          @rm-close=${()=>{this._navDirection="back",this._view="grid"}}
        ></rm-add-recipe-dialog>
      `;if(this._view==="timers")return this._renderTimersView();if(this._view==="planner")return h`
        <rm-meal-planner
          .api=${this._api}
          .recipes=${this._recipes}
          .fromRecipe=${this._plannerFromRecipe}
          .settings=${e}
          @rm-open-recipe=${this._handleOpenRecipe}
          @rm-back-to-recipe=${this._handleBackToRecipe}
        ></rm-meal-planner>
      `;if(this._loading)return h`
        <div class="rm-loading">
          <ha-circular-progress active size="large"></ha-circular-progress>
        </div>
      `;if(this._error)return h`
        <div class="rm-error">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <p>${this._error}</p>
          <button class="text-btn" @click=${this._init.bind(this)}>
            ${o("Retry")}
          </button>
        </div>
      `;let i=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe;return h`
      <div
        class="rm-slide-track ${this._view==="detail"?"show-detail":""}"
        @transitionend=${this._onDetailTransitionEnd}
      >
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
          ${i?h`
                <rm-recipe-detail
                  .recipe=${this._selectedRecipe}
                  .api=${this._api}
                  .settings=${e}
                  .wide=${this._wide}
                  .allTags=${this._tags||[]}
                  .allCourses=${[...new Set(this._recipes.flatMap(t=>t.courses||[]))].sort()}
                  .allCategories=${[...new Set(this._recipes.flatMap(t=>t.categories||[]))].sort()}
                  .allCollections=${[...new Set(this._recipes.flatMap(t=>t.collections||[]))].sort()}
                  @rm-back=${this._handleBack}
                  @rm-toggle-favourite=${this._handleToggleFavourite}
                  @rm-delete-recipe=${this._handleDeleteRecipe}
                  @rm-update-recipe=${this._handleUpdateRecipe}
                  @rm-recipe-saved=${async()=>{await this._loadRecipes(),this._selectedRecipe=this._recipes.find(t=>t.id===this._selectedRecipe?.id)||null}}
                  @rm-start-timer=${this._handleStartTimer}
                  @rm-show-planner=${this._handleShowPlanner}
                  @rm-chip-nav=${this._handleChipNav}
                ></rm-recipe-detail>
              `:""}
        </div>
      </div>
    `}_renderTimersView(){let e=this._customTimerInput.trim(),i=this._presetNameInput.trim()&&this._presetMinsInput.trim(),t=[{label:"+30s",secs:30},{label:"+1m",secs:60},{label:"+5m",secs:300},{label:"+10m",secs:600}],r=this._timers.filter(s=>!s.presetId),a=263.9;return h`
      <div class="timers-view">
        <!-- Active timers (non-preset): horizontal wrap of square arc tiles -->
        ${r.length?h`
              <div class="timer-list">
                ${r.map(s=>{let c=s.remaining<60?"#f59e0b":"var(--rm-accent)",_=a*(1-s.remaining/s.total);return h`
                    <div class="timer-card">
                      <button
                        class="preset-remove"
                        @click=${()=>this._stopTimer(s.id)}
                        title="${o("Remove")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                      ${s.global?h`<ha-icon
                            class="timer-global-badge"
                            icon="mdi:earth"
                            title="${o("Global timer")}"
                          ></ha-icon>`:""}
                      <span class="timer-card-name">${s.label}</span>
                      <div class="preset-arc-wrap">
                        <svg viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="var(--rm-border)"
                            stroke-width="6"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="${c}"
                            stroke-width="6"
                            stroke-linecap="round"
                            stroke-dasharray="${a}"
                            stroke-dashoffset="${_}"
                            transform="rotate(-90 50 50)"
                            style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"
                          />
                        </svg>
                        <div class="preset-arc-center">
                          <span class="preset-arc-time"
                            >${tt(s.remaining)}</span
                          >
                        </div>
                      </div>
                      <div class="preset-arc-btns">
                        <button
                          class="timer-ctrl-btn"
                          @click=${()=>this._pauseTimer(s.id)}
                          title="${s.running?o("Pause"):o("Resume")}"
                        >
                          <ha-icon
                            icon="${s.running?"mdi:pause":"mdi:play"}"
                          ></ha-icon>
                        </button>
                        <button
                          class="timer-ctrl-btn danger"
                          @click=${()=>this._stopTimer(s.id)}
                          title="${o("Stop")}"
                        >
                          <ha-icon icon="mdi:stop"></ha-icon>
                        </button>
                      </div>
                    </div>
                  `})}
              </div>
            `:h`
              <div class="timer-empty">
                <ha-icon icon="mdi:timer-off-outline"></ha-icon>
                <p>${o("No active timers.")}</p>
                <p class="timer-empty-hint">
                  ${o("Tap a highlighted time in a recipe's directions to start one.")}
                </p>
              </div>
            `}

        <!-- Spacer pushes add+presets to bottom -->
        <div style="flex:1"></div>

        <!-- Add timer section -->
        <div class="timer-add-section">
          <div class="timer-add-header">
            <span class="timer-add-title">${o("Add Timer")}</span>
            <label
              class="timer-global-toggle ${this._globalMode?"active":""}"
              title="${o("Sync timer across all devices via Home Assistant")}"
            >
              <input
                type="checkbox"
                .checked=${this._globalMode}
                @change=${s=>{this._globalMode=s.target.checked}}
              />
              <ha-icon icon="mdi:earth"></ha-icon>
              ${o("Global")}
            </label>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${o("Quick start")}</div>
            <div class="timer-add-row">
              <input
                type="text"
                class="timer-input"
                placeholder="${o("Label (optional)")}"
                .value=${this._quickTimerLabel}
                @input=${s=>{this._quickTimerLabel=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <input
                type="number"
                class="timer-input timer-mins-input"
                placeholder="${o("min")}"
                min="0.5"
                step="0.5"
                .value=${this._customTimerInput}
                @input=${s=>{this._customTimerInput=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <button
                class="action-btn primary"
                ?disabled=${!e}
                @click=${()=>{this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel=""}}
              >
                <ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon>
                ${o("Start")}
              </button>
            </div>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${o("Save preset")}</div>
            <div class="timer-add-row">
              <input
                type="text"
                class="timer-input"
                placeholder="${o("Preset name")}"
                .value=${this._presetNameInput}
                @input=${s=>{this._presetNameInput=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&this._addPresetTimer()}}
              />
              <input
                type="number"
                class="timer-input timer-mins-input"
                placeholder="${o("min")}"
                min="0.5"
                step="0.5"
                .value=${this._presetMinsInput}
                @input=${s=>{this._presetMinsInput=s.target.value}}
                @keydown=${s=>{s.key==="Enter"&&this._addPresetTimer()}}
              />
              <button
                class="action-btn"
                ?disabled=${!i}
                @click=${this._addPresetTimer}
              >
                ${o("+ Preset")}
              </button>
            </div>
          </div>
        </div>

        <!-- Preset timers grid (bottom) -->
        ${this._timerPresets.length?h`
              <div class="timer-presets-grid">
                ${this._timerPresets.map(s=>{let c=this._timers.find(g=>g.presetId===s.id),_=c&&c.running,w=c&&c.alarming,y=c?c.remaining:s.seconds,p=c?c.total:s.seconds,b=w?"var(--rm-error)":y<60&&c?"#f59e0b":"var(--rm-accent)",d=w?0:c?a*(1-y/p):a;return h`
                    <div
                      class="timer-preset-card ${w?"alarming":""}"
                    >
                      <button
                        class="preset-remove"
                        @click=${()=>{c&&this._stopTimer(c.id),this._removePreset(s.id)}}
                        title="${o("Remove")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                      <span class="preset-arc-name">${s.name}</span>
                      <div class="preset-arc-wrap">
                        <svg viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="var(--rm-border)"
                            stroke-width="7"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="${b}"
                            stroke-width="7"
                            stroke-linecap="round"
                            stroke-dasharray="${a}"
                            stroke-dashoffset="${d}"
                            transform="rotate(-90 50 50)"
                            style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"
                          />
                        </svg>
                        <div class="preset-arc-center">
                          ${w?h`
                                <span
                                  class="preset-arc-time"
                                  style="color:var(--rm-error)"
                                  >${o("Done!")}</span
                                >
                              `:h`
                                <span class="preset-arc-time"
                                  >${tt(y)}</span
                                >
                              `}
                        </div>
                      </div>
                      <div class="preset-arc-btns">
                        ${w?h`
                              <button
                                class="preset-arc-btn"
                                @click=${()=>this._addTimeToTimer(c.id,30)}
                              >
                                ${o("+30s")}
                              </button>
                              <button
                                class="preset-arc-btn"
                                @click=${()=>this._addTimeToTimer(c.id,60)}
                              >
                                ${o("+1m")}
                              </button>
                              <button
                                class="preset-arc-btn"
                                @click=${()=>this._addTimeToTimer(c.id,300)}
                              >
                                ${o("+5m")}
                              </button>
                              <button
                                class="preset-arc-btn stop"
                                @click=${()=>this._stopTimer(c.id)}
                              >
                                ${o("Stop")}
                              </button>
                            `:_?h`
                                <button
                                  class="preset-arc-btn"
                                  @click=${()=>this._addTimeToTimer(c.id,30)}
                                >
                                  ${o("+30s")}
                                </button>
                                <button
                                  class="preset-arc-btn"
                                  @click=${()=>this._addTimeToTimer(c.id,60)}
                                >
                                  ${o("+1m")}
                                </button>
                                <button
                                  class="preset-arc-btn"
                                  @click=${()=>this._pauseTimer(c.id)}
                                >
                                  <ha-icon
                                    icon="mdi:pause"
                                    style="--mdc-icon-size:12px;vertical-align:middle"
                                  ></ha-icon>
                                </button>
                                <button
                                  class="preset-arc-btn stop"
                                  @click=${()=>this._stopTimer(c.id)}
                                >
                                  ${o("Stop")}
                                </button>
                              `:c?h`
                                  <button
                                    class="preset-arc-btn"
                                    @click=${()=>this._pauseTimer(c.id)}
                                  >
                                    ${o("Resume")}
                                  </button>
                                  <button
                                    class="preset-arc-btn stop"
                                    @click=${()=>this._stopTimer(c.id)}
                                  >
                                    ${o("Stop")}
                                  </button>
                                `:h`
                                  <button
                                    class="preset-arc-btn play"
                                    @click=${()=>this._startTimer(s.seconds,s.name,s.id)}
                                  >
                                    <ha-icon
                                      icon="mdi:play"
                                      style="--mdc-icon-size:14px;vertical-align:middle"
                                    ></ha-icon>
                                    ${o("Start")}
                                  </button>
                                `}
                      </div>
                    </div>
                  `})}
              </div>
            `:""}
      </div>
    `}_renderTimerAlarm(){let e=this._timerAlarm;return e?h`
      <div class="alarm-overlay">
        <div class="alarm-bubble">
          <ha-icon icon="mdi:alarm" class="alarm-icon"></ha-icon>
          <div class="alarm-label">${e.label}</div>
          <div class="alarm-sub">${o("Timer complete!")}</div>
          <div class="alarm-btns">
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,30)}
            >
              ${o("+30s")}
            </button>
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,60)}
            >
              ${o("+1 min")}
            </button>
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,300)}
            >
              ${o("+5 min")}
            </button>
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,600)}
            >
              ${o("+10 min")}
            </button>
            <div class="alarm-custom-row">
              <input
                type="number"
                class="alarm-custom-input"
                placeholder="${o("min")}"
                min="1"
                .value=${this._alarmAddInput}
                @input=${i=>{this._alarmAddInput=i.target.value}}
                @keydown=${i=>{if(i.key==="Enter"&&this._alarmAddInput){let t=parseInt(this._alarmAddInput);t>0&&this._addTimeToTimer(e.id,t*60),this._alarmAddInput=""}}}
              />
              <button
                class="alarm-btn accent"
                ?disabled=${!this._alarmAddInput}
                @click=${()=>{let i=parseInt(this._alarmAddInput);i>0&&this._addTimeToTimer(e.id,i*60),this._alarmAddInput=""}}
              >
                ${o("+min")}
              </button>
            </div>
            <button class="alarm-btn stop" @click=${this._dismissAlarm}>
              ${o("Stop")}
            </button>
          </div>
        </div>
      </div>
    `:""}_renderBottomNav(){if(!this.hass?.user?.is_admin)return h`<nav class="rm-bottom-nav">
        <button
          class="rm-bn-btn"
          @click=${()=>{this._view="nutrition"}}
        >
          ${this.hass.language==="de"?"Ern\xE4hrung":"Nutrition"}</button
        ><button
          class="rm-bn-btn"
          @click=${()=>{this._view="settings"}}
        >
          ${o("Settings")}
        </button>
      </nav>`;let e=this._view,i=(t,r,a,s)=>h`
      <button
        class="rm-bn-btn ${e===a?"active":""}"
        @click=${s||(()=>{this._navDirection="forward",this._view=a,this._selectedRecipe=null})}
        title="${r}"
      >
        <ha-icon icon="${t}"></ha-icon>
        <span>${r}</span>
      </button>
    `;return h`
      <nav class="rm-bottom-nav">
        ${i("mdi:home",o("Home"),"grid",()=>{this._navDirection="back",this._view="grid",this._selectedRecipe=null})}
        ${i("mdi:heart-pulse",this._settings.language==="de"?"Ern\xE4hrung":"Nutrition","nutrition")}
        <button
          class="rm-bn-btn rm-bn-add"
          @click=${()=>{this._navDirection="forward",this._view="add"}}
          title="${o("New Recipe")}"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        ${i("mdi:calendar-week",o("Planner"),"planner",()=>{this._plannerFromRecipe=null,this._navDirection="forward",this._view="planner",this._selectedRecipe=null})}
        <button
          class="rm-bn-btn ${e==="timers"?"active":""}"
          @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}
          title="${o("Timers")}"
        >
          <ha-icon icon="mdi:timer-outline"></ha-icon>
          <span>${o("Timers")}</span>
          ${this._timers.length?h`<span class="rm-bn-badge">${this._timers.length}</span>`:""}
        </button>
      </nav>
    `}_renderMobileMenu(){return h`
      <div
        class="rm-mobile-overlay"
        @click=${()=>{this._mobileMenuOpen=!1}}
      >
        <nav class="rm-mobile-menu" @click=${e=>e.stopPropagation()}>
          <div class="rm-mm-header">
            <ha-icon icon="mdi:chef-hat" class="rm-mm-logo"></ha-icon>
            <span class="rm-mm-title">${o("Recipes")}</span>
            <button
              class="icon-btn"
              @click=${()=>{this._mobileMenuOpen=!1}}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="rm-mm-items">
            <button
              class="rm-mm-item"
              @click=${()=>{this._view="settings",this._mobileMenuOpen=!1}}
            >
              <ha-icon icon="mdi:cog-outline"></ha-icon>
              <span>${o("Settings")}</span>
            </button>
            <button class="rm-mm-item" disabled>
              <ha-icon icon="mdi:help-circle-outline"></ha-icon>
              <span>${o("Help")}</span>
              <span class="rm-mm-soon">${o("Soon")}</span>
            </button>
          </div>
        </nav>
      </div>
    `}render(){let e=this._wide;return h`
      <ha-card class="rm-card ${e?"rm-wide":""}">
        ${e?this._renderSidebar():""}
        <div class="rm-main">
          ${this._renderHeader()}
          <div class="rm-body" data-nav="${this._navDirection}">
            ${this._renderBody()}
          </div>
          ${e?"":this._renderBottomNav()}
        </div>

        ${!e&&this._mobileMenuOpen?this._renderMobileMenu():""}

        <!-- Timer alarm modal -->
        ${this._timerAlarm?this._renderTimerAlarm():""}
      </ha-card>
    `}static styles=pe`
    :host {
      display: block;
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
      max-height: -webkit-fill-available;
      --rm-bg-main: #f7f4ed;
      --rm-bg-surface: rgba(255, 252, 246, 0.96);
      --rm-bg-elevated: #fffdf8;
      --rm-text: #233b47;
      --rm-text-secondary: #4c626c;
      --rm-text-muted: #536873;
      --rm-accent: #326382;
      --rm-accent-soft: #e2edf1;
      --rm-border: #c6d1d0;
      --rm-shadow: 0 8px 28px rgba(35, 59, 71, 0.08);
      --rm-radius: 18px;
      --rm-radius-sm: 12px;
      --rm-font-size-base: 16px;
      --rm-grid-columns: repeat(3, minmax(0, 1fr));
      font-size: var(--rm-font-size-base);
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    button,
    select {
      min-height: var(--rm-touch-target, 44px);
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
      border: 1px solid var(--rm-border);
      border-radius: var(--rm-radius-lg, 24px);
      box-shadow: var(--rm-shadow);
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
      width: 216px;
      min-width: 216px;
      display: flex;
      flex-direction: column;
      background:
        linear-gradient(var(--rm-glass-highlight), transparent),
        var(--rm-bg-surface);
      border-right: 1px solid var(--rm-border);
      overflow: hidden;
      transition:
        width 0.2s ease,
        min-width 0.2s ease;
    }

    .rm-sidebar.collapsed {
      width: 56px;
      min-width: 56px;
    }

    ha-card:not(.rm-wide) .rm-sidebar {
      display: none;
    }

    .sb-top {
      padding: 20px 12px 12px;
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
      font-size: 1em;
      color: var(--rm-text);
      letter-spacing: -0.025em;
      overflow: hidden;
    }
    .sb-logo ha-icon {
      --mdc-icon-size: 22px;
      flex-shrink: 0;
    }

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
      transition:
        background 0.15s,
        color 0.15s;
    }
    .sb-collapse-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .sb-collapse-btn ha-icon {
      --mdc-icon-size: 20px;
    }

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
    .sb-search-icon {
      --mdc-icon-size: 16px;
      color: var(--rm-text-muted);
      flex-shrink: 0;
    }
    .sb-search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text);
      font-size: var(--rm-font-size-sm);
      padding: 7px 0;
    }
    .sb-search-input::placeholder {
      color: var(--rm-text-muted);
    }
    .sb-search-clear {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      padding: 2px;
      display: flex;
      align-items: center;
    }
    .sb-search-clear ha-icon {
      --mdc-icon-size: 14px;
    }

    .sb-new-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 10px;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border: none;
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-sm);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .sb-new-btn:hover {
      opacity: 0.88;
    }
    .sb-new-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    .sb-icon-only-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      margin: 0 auto;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .sb-icon-only-btn:hover {
      opacity: 0.88;
    }
    .sb-icon-only-btn ha-icon {
      --mdc-icon-size: 20px;
    }

    .sb-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 10px 12px;
      scrollbar-width: none;
    }
    .sb-nav::-webkit-scrollbar {
      display: none;
    }

    .sb-bottom {
      padding: 12px 10px 16px;
      border-top: 1px solid var(--rm-border);
    }

    .sb-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      background: none;
      border: none;
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-secondary);
      cursor: pointer;
      text-align: left;
      transition:
        background 0.12s,
        color 0.12s;
      position: relative;
    }
    .rm-sidebar.collapsed .sb-item {
      justify-content: center;
      padding: 10px 6px;
    }
    .sb-item ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .sb-item:hover:not(:disabled) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .sb-item.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      font-weight: 600;
    }
    .sb-item.placeholder {
      opacity: 0.4;
      cursor: default;
    }

    .sb-timer-badge {
      margin-left: auto;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: 10px;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
    }
    .rm-sidebar.collapsed .sb-timer-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      margin-left: 0;
      font-size: var(--rm-font-size-xs);
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
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--rm-border);
      background: var(--rm-bg-surface);
      flex-shrink: 0;
      gap: 8px;
    }

    .rm-header-left,
    .rm-header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .rm-header-left {
      flex: 1;
      min-width: 0;
    }
    .rm-header-right {
      flex-shrink: 0;
      flex-wrap: wrap;
      max-width: 100%;
      margin-left: auto;
    }

    .rm-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125em;
      font-weight: 700;
      color: var(--rm-text);
      overflow: hidden;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }
    .rm-title ha-icon {
      --mdc-icon-size: 22px;
      color: var(--rm-accent);
      flex-shrink: 0;
    }
    .rm-title span {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Star rating in header */
    .header-stars {
      display: flex;
      gap: 1px;
      align-items: center;
    }
    .hdr-star {
      font-size: 20px;
      width: var(--rm-touch-target, 44px);
      padding: 0;
      border: none;
      border-radius: var(--rm-radius-sm);
      background: transparent;
      color: var(--rm-text-secondary);
      line-height: 1;
      cursor: pointer;
      transition:
        color 0.1s,
        transform 0.1s;
      -webkit-text-stroke: 1px currentColor;
    }
    .hdr-star:hover {
      transform: scale(1.2);
      color: var(--rm-warning);
    }
    .hdr-star.filled {
      color: var(--rm-warning);
      -webkit-text-stroke: 1px currentColor;
    }

    /* Timer pills */
    .timer-pills {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 2px;
      background: transparent;
      border: none;
      border-radius: var(--rm-radius-sm);
      min-width: 0;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .timer-pill {
      display: flex;
      align-items: center;
      gap: 3px;
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-radius: 10px;
      padding: 3px 8px;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      white-space: nowrap;
    }
    .timer-pill.paused {
      background: var(--rm-bg-elevated);
      color: var(--rm-text-secondary);
      border: 1px dashed var(--rm-border-strong);
    }
    .timer-pill ha-icon {
      --mdc-icon-size: 12px;
    }
    .timer-more {
      font-size: var(--rm-font-size-xs);
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
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary);
      width: var(--rm-touch-target, 44px);
      height: var(--rm-touch-target, 44px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background 0.15s,
        color 0.15s;
      padding: 0;
      flex-shrink: 0;
    }
    .icon-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .icon-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .icon-btn:disabled:hover {
      background: none;
    }
    .wake-toggle-btn.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
    }

    .text-btn {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border: none;
      border-radius: var(--rm-radius-sm);
      padding: 8px 16px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
    }

    .rm-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .rm-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .rm-error ha-icon {
      --mdc-icon-size: 48px;
      color: var(--rm-error);
    }
    .rm-error p {
      margin: 0;
      font-size: var(--rm-font-size-sm);
    }

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
      font-size: var(--rm-font-size-sm);
    }
    .timer-empty ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.35;
    }
    .timer-empty p {
      margin: 0;
    }
    .timer-empty-hint {
      font-size: var(--rm-font-size-xs) !important;
      color: var(--rm-text-muted) !important;
    }

    /* Active timer list: horizontal wrap of square arc tiles */
    .timer-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-card {
      position: relative;
      width: 180px;
      height: 180px;
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
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text);
      text-align: center;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .timer-ctrl-btn {
      background: none;
      border: 1px solid var(--rm-border);
      border-radius: 50%;
      width: var(--rm-touch-target, 44px);
      height: var(--rm-touch-target, 44px);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary);
      padding: 0;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .timer-ctrl-btn ha-icon {
      --mdc-icon-size: 14px;
    }
    .timer-ctrl-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
    }
    .timer-ctrl-btn.danger:hover {
      background: var(--rm-error-soft);
      color: var(--rm-error);
      border-color: var(--rm-error);
    }

    /* Preset timer grid: square arc tiles */
    .timer-presets-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-preset-card {
      position: relative;
      width: 160px;
      height: 160px;
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
      border-color: var(--rm-error);
      animation: alarm-pulse-border 0.8s ease-in-out infinite alternate;
    }
    @keyframes alarm-pulse-border {
      from {
        box-shadow: 0 0 0 0 rgba(207, 102, 121, 0);
      }
      to {
        box-shadow: 0 0 0 6px rgba(207, 102, 121, 0.3);
      }
    }
    /* Arc wrap fills available vertical space in the square tile */
    .preset-arc-wrap {
      position: relative;
      flex: 1;
      width: 100%;
      min-height: 0;
    }
    .preset-arc-wrap svg {
      width: 100%;
      height: 100%;
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
      font-size: 17px;
      font-weight: 700;
      color: var(--rm-text);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .preset-arc-name {
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text);
      text-align: center;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .preset-arc-btns {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .preset-arc-btn {
      background: var(--rm-bg-main);
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      padding: 2px 6px;
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .preset-arc-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-color: var(--rm-accent);
    }
    .preset-arc-btn.stop {
      color: var(--rm-error);
      border-color: var(--rm-error);
    }
    .preset-arc-btn.stop:hover {
      background: var(--rm-error-soft);
    }
    .preset-arc-btn.play {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-color: var(--rm-accent);
      padding: 3px 12px;
      font-size: var(--rm-font-size-xs);
      border-radius: 12px;
    }
    .preset-arc-btn.play:hover {
      opacity: 0.85;
    }
    .preset-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      opacity: 0;
      padding: 2px;
      border-radius: 50%;
      transition: opacity 0.15s;
      z-index: 1;
    }
    .timer-preset-card:hover .preset-remove,
    .timer-card:hover .preset-remove,
    .preset-remove:focus-visible {
      opacity: 1;
    }
    .preset-remove ha-icon {
      --mdc-icon-size: 13px;
    }

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
      font-size: var(--rm-font-size-xs);
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
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-muted);
      transition: all 0.15s;
      user-select: none;
    }
    .timer-global-toggle input {
      width: 16px;
      height: 16px;
      accent-color: var(--rm-accent);
    }
    .timer-global-toggle:focus-within {
      outline: 3px solid var(--rm-focus);
      outline-offset: 2px;
    }
    .timer-global-toggle ha-icon {
      --mdc-icon-size: 14px;
    }
    .timer-global-toggle.active {
      border-color: var(--rm-accent);
      color: var(--rm-accent);
      background: var(--rm-accent-soft);
    }
    .timer-add-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .timer-add-group-label {
      font-size: var(--rm-font-size-xs);
      font-weight: 500;
      color: var(--rm-text-muted);
    }
    .timer-add-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .timer-input {
      flex: 1;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 6px 9px;
      font-size: var(--rm-font-size-sm);
      font-family: inherit;
      min-width: 0;
    }
    .timer-mins-input {
      max-width: 72px;
      flex: 0 0 72px;
    }
    .timer-input:focus {
      outline: none;
      border-color: var(--rm-accent);
    }
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
      font-size: var(--rm-font-size-sm);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .action-btn.primary {
      background: var(--rm-accent);
      border-color: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
    }
    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ── Timer alarm bubble ──────────────────── */

    .alarm-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
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
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
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
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(1.15);
        opacity: 0.8;
      }
    }

    .alarm-label {
      font-size: 18px;
      font-weight: 700;
      color: var(--rm-text);
    }

    .alarm-sub {
      font-size: var(--rm-font-size-sm);
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
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      transition: background 0.15s;
    }
    .alarm-btn:hover {
      background: var(--rm-accent-soft);
    }
    .alarm-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .alarm-btn.accent {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-color: var(--rm-accent);
    }
    .alarm-btn.stop {
      background: var(--rm-error);
      color: var(--rm-error-text);
      border-color: var(--rm-error);
      grid-column: 1 / -1;
    }
    .alarm-btn.stop:hover {
      opacity: 0.85;
    }
    .alarm-custom-row {
      display: flex;
      gap: 6px;
      grid-column: 1 / -1;
    }
    .alarm-custom-input {
      flex: 1;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 8px 10px;
      font-size: var(--rm-font-size-sm);
      font-family: inherit;
    }
    .alarm-custom-input:focus {
      outline: none;
      border-color: var(--rm-accent);
    }

    /* ── View transitions ───────────────────────────────────── */

    /* Generic directional slide for full-screen views (settings, add, planner, etc.) */
    @keyframes rm-slide-forward {
      from {
        opacity: 0;
        transform: translateX(48px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes rm-slide-back {
      from {
        opacity: 0;
        transform: translateX(-48px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .rm-body[data-nav="forward"] > *:not(.rm-detail-overlay) {
      animation: rm-slide-forward 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .rm-body[data-nav="back"] > *:not(.rm-detail-overlay) {
      animation: rm-slide-back 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

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
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
    }

    /* ── Mobile bottom nav ───────────────── */

    .rm-bottom-nav {
      display: flex;
      justify-content: space-around;
      background: var(--rm-bg-surface);
      border-top: 1px solid var(--rm-border);
      padding: 6px 0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
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
      font-size: var(--rm-font-size-xs);
      font-weight: 500;
      padding: 6px 4px;
      position: relative;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
      outline: none;
    }
    .rm-bn-btn ha-icon {
      --mdc-icon-size: 22px;
    }
    .rm-bn-btn.active {
      color: var(--rm-accent);
    }
    .rm-bn-btn:not(.rm-bn-add):hover {
      color: var(--rm-text);
    }

    .rm-bn-add {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff) !important;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      flex: none;
      align-self: center;
      margin: 0 8px;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .rm-bn-add ha-icon {
      --mdc-icon-size: 26px;
    }

    .rm-bn-badge {
      position: absolute;
      top: 2px;
      right: calc(50% - 20px);
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      padding: 1px 4px;
      min-width: 14px;
      text-align: center;
    }

    /* ── Mobile slide-in menu ────────────── */

    .rm-mobile-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
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
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .rm-mm-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 12px 14px 16px;
      border-bottom: 1px solid var(--rm-border);
      flex-shrink: 0;
    }
    .rm-mm-logo {
      color: var(--rm-accent);
      --mdc-icon-size: 22px;
    }
    .rm-mm-title {
      flex: 1;
      font-weight: 700;
      font-size: 1em;
      color: var(--rm-text);
    }

    .rm-mm-items {
      padding: 8px 0;
      flex: 1;
      overflow-y: auto;
    }

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
      font-size: var(--rm-font-size-sm);
      text-align: left;
      transition:
        background 0.12s,
        color 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .rm-mm-item ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .rm-mm-item:hover:not(:disabled) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .rm-mm-item:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .rm-mm-soon {
      margin-left: auto;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      background: var(--rm-accent-soft);
      color: var(--rm-accent);
      border-radius: 6px;
      padding: 2px 6px;
    }
    @media (hover: none) {
      .preset-remove {
        opacity: 1;
      }
    }
    @media (max-width: 480px) {
      .rm-header {
        padding: 10px 12px;
        flex-wrap: wrap;
      }
      .rm-header-right {
        max-width: 100%;
        flex-wrap: wrap;
        margin-left: auto;
      }
      .rm-title {
        font-size: 1em;
      }
      .rm-title ha-icon {
        display: none;
      }
    }

    ${ue}
  `};try{customElements.define("mm-unified-app",rt)}catch{}export{rt as UnifiedApp};
