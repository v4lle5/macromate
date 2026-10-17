import{a as ke,b as At,c as Rt,d as pe,e as h,f as $e,g as he,h as te,i as o,j as nt}from"./chunks/chunk-VYGSGG2W.js";var xt=At((_t,Ve)=>{(function(m){typeof _t=="object"&&typeof Ve<"u"?Ve.exports=m():typeof define=="function"&&define.amd?define([],m):(typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:this).JSZip=m()})(function(){return(function m(e,i,t){function r(c,_){if(!i[c]){if(!e[c]){var w=typeof ke=="function"&&ke;if(!_&&w)return w(c,!0);if(n)return n(c,!0);var y=new Error("Cannot find module '"+c+"'");throw y.code="MODULE_NOT_FOUND",y}var p=i[c]={exports:{}};e[c][0].call(p.exports,function(b){var d=e[c][1][b];return r(d||b)},p,p.exports,m,e,i,t)}return i[c].exports}for(var n=typeof ke=="function"&&ke,a=0;a<t.length;a++)r(t[a]);return r})({1:[function(m,e,i){"use strict";var t=m("./utils"),r=m("./support"),n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";i.encode=function(a){for(var c,_,w,y,p,b,d,g=[],u=0,x=a.length,$=x,T=t.getTypeOf(a)!=="string";u<a.length;)$=x-u,w=T?(c=a[u++],_=u<x?a[u++]:0,u<x?a[u++]:0):(c=a.charCodeAt(u++),_=u<x?a.charCodeAt(u++):0,u<x?a.charCodeAt(u++):0),y=c>>2,p=(3&c)<<4|_>>4,b=1<$?(15&_)<<2|w>>6:64,d=2<$?63&w:64,g.push(n.charAt(y)+n.charAt(p)+n.charAt(b)+n.charAt(d));return g.join("")},i.decode=function(a){var c,_,w,y,p,b,d=0,g=0,u="data:";if(a.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var x,$=3*(a=a.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(a.charAt(a.length-1)===n.charAt(64)&&$--,a.charAt(a.length-2)===n.charAt(64)&&$--,$%1!=0)throw new Error("Invalid base64 input, bad content length.");for(x=r.uint8array?new Uint8Array(0|$):new Array(0|$);d<a.length;)c=n.indexOf(a.charAt(d++))<<2|(y=n.indexOf(a.charAt(d++)))>>4,_=(15&y)<<4|(p=n.indexOf(a.charAt(d++)))>>2,w=(3&p)<<6|(b=n.indexOf(a.charAt(d++))),x[g++]=c,p!==64&&(x[g++]=_),b!==64&&(x[g++]=w);return x}},{"./support":30,"./utils":32}],2:[function(m,e,i){"use strict";var t=m("./external"),r=m("./stream/DataWorker"),n=m("./stream/Crc32Probe"),a=m("./stream/DataLengthProbe");function c(_,w,y,p,b){this.compressedSize=_,this.uncompressedSize=w,this.crc32=y,this.compression=p,this.compressedContent=b}c.prototype={getContentWorker:function(){var _=new r(t.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),w=this;return _.on("end",function(){if(this.streamInfo.data_length!==w.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),_},getCompressedWorker:function(){return new r(t.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},c.createWorkerFrom=function(_,w,y){return _.pipe(new n).pipe(new a("uncompressedSize")).pipe(w.compressWorker(y)).pipe(new a("compressedSize")).withStreamInfo("compression",w)},e.exports=c},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(m,e,i){"use strict";var t=m("./stream/GenericWorker");i.STORE={magic:"\0\0",compressWorker:function(){return new t("STORE compression")},uncompressWorker:function(){return new t("STORE decompression")}},i.DEFLATE=m("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(m,e,i){"use strict";var t=m("./utils"),r=(function(){for(var n,a=[],c=0;c<256;c++){n=c;for(var _=0;_<8;_++)n=1&n?3988292384^n>>>1:n>>>1;a[c]=n}return a})();e.exports=function(n,a){return n!==void 0&&n.length?t.getTypeOf(n)!=="string"?(function(c,_,w,y){var p=r,b=y+w;c^=-1;for(var d=y;d<b;d++)c=c>>>8^p[255&(c^_[d])];return-1^c})(0|a,n,n.length,0):(function(c,_,w,y){var p=r,b=y+w;c^=-1;for(var d=y;d<b;d++)c=c>>>8^p[255&(c^_.charCodeAt(d))];return-1^c})(0|a,n,n.length,0):0}},{"./utils":32}],5:[function(m,e,i){"use strict";i.base64=!1,i.binary=!1,i.dir=!1,i.createFolders=!0,i.date=null,i.compression=null,i.compressionOptions=null,i.comment=null,i.unixPermissions=null,i.dosPermissions=null},{}],6:[function(m,e,i){"use strict";var t=null;t=typeof Promise<"u"?Promise:m("lie"),e.exports={Promise:t}},{lie:37}],7:[function(m,e,i){"use strict";var t=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",r=m("pako"),n=m("./utils"),a=m("./stream/GenericWorker"),c=t?"uint8array":"array";function _(w,y){a.call(this,"FlateWorker/"+w),this._pako=null,this._pakoAction=w,this._pakoOptions=y,this.meta={}}i.magic="\b\0",n.inherits(_,a),_.prototype.processChunk=function(w){this.meta=w.meta,this._pako===null&&this._createPako(),this._pako.push(n.transformTo(c,w.data),!1)},_.prototype.flush=function(){a.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},_.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},_.prototype._createPako=function(){this._pako=new r[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var w=this;this._pako.onData=function(y){w.push({data:y,meta:w.meta})}},i.compressWorker=function(w){return new _("Deflate",w)},i.uncompressWorker=function(){return new _("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(m,e,i){"use strict";function t(p,b){var d,g="";for(d=0;d<b;d++)g+=String.fromCharCode(255&p),p>>>=8;return g}function r(p,b,d,g,u,x){var $,T,z=p.file,P=p.compression,D=x!==c.utf8encode,j=n.transformTo("string",x(z.name)),F=n.transformTo("string",c.utf8encode(z.name)),W=z.comment,K=n.transformTo("string",x(W)),k=n.transformTo("string",c.utf8encode(W)),O=F.length!==z.name.length,l=k.length!==W.length,I="",X="",B="",ee=z.dir,U=z.date,J={crc32:0,compressedSize:0,uncompressedSize:0};b&&!d||(J.crc32=p.crc32,J.compressedSize=p.compressedSize,J.uncompressedSize=p.uncompressedSize);var A=0;b&&(A|=8),D||!O&&!l||(A|=2048);var E=0,Y=0;ee&&(E|=16),u==="UNIX"?(Y=798,E|=(function(G,se){var de=G;return G||(de=se?16893:33204),(65535&de)<<16})(z.unixPermissions,ee)):(Y=20,E|=(function(G){return 63&(G||0)})(z.dosPermissions)),$=U.getUTCHours(),$<<=6,$|=U.getUTCMinutes(),$<<=5,$|=U.getUTCSeconds()/2,T=U.getUTCFullYear()-1980,T<<=4,T|=U.getUTCMonth()+1,T<<=5,T|=U.getUTCDate(),O&&(X=t(1,1)+t(_(j),4)+F,I+="up"+t(X.length,2)+X),l&&(B=t(1,1)+t(_(K),4)+k,I+="uc"+t(B.length,2)+B);var V="";return V+=`
\0`,V+=t(A,2),V+=P.magic,V+=t($,2),V+=t(T,2),V+=t(J.crc32,4),V+=t(J.compressedSize,4),V+=t(J.uncompressedSize,4),V+=t(j.length,2),V+=t(I.length,2),{fileRecord:w.LOCAL_FILE_HEADER+V+j+I,dirRecord:w.CENTRAL_FILE_HEADER+t(Y,2)+V+t(K.length,2)+"\0\0\0\0"+t(E,4)+t(g,4)+j+I+K}}var n=m("../utils"),a=m("../stream/GenericWorker"),c=m("../utf8"),_=m("../crc32"),w=m("../signature");function y(p,b,d,g){a.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=b,this.zipPlatform=d,this.encodeFileName=g,this.streamFiles=p,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}n.inherits(y,a),y.prototype.push=function(p){var b=p.meta.percent||0,d=this.entriesCount,g=this._sources.length;this.accumulate?this.contentBuffer.push(p):(this.bytesWritten+=p.data.length,a.prototype.push.call(this,{data:p.data,meta:{currentFile:this.currentFile,percent:d?(b+100*(d-g-1))/d:100}}))},y.prototype.openedSource=function(p){this.currentSourceOffset=this.bytesWritten,this.currentFile=p.file.name;var b=this.streamFiles&&!p.file.dir;if(b){var d=r(p,b,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:d.fileRecord,meta:{percent:0}})}else this.accumulate=!0},y.prototype.closedSource=function(p){this.accumulate=!1;var b=this.streamFiles&&!p.file.dir,d=r(p,b,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(d.dirRecord),b)this.push({data:(function(g){return w.DATA_DESCRIPTOR+t(g.crc32,4)+t(g.compressedSize,4)+t(g.uncompressedSize,4)})(p),meta:{percent:100}});else for(this.push({data:d.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},y.prototype.flush=function(){for(var p=this.bytesWritten,b=0;b<this.dirRecords.length;b++)this.push({data:this.dirRecords[b],meta:{percent:100}});var d=this.bytesWritten-p,g=(function(u,x,$,T,z){var P=n.transformTo("string",z(T));return w.CENTRAL_DIRECTORY_END+"\0\0\0\0"+t(u,2)+t(u,2)+t(x,4)+t($,4)+t(P.length,2)+P})(this.dirRecords.length,d,p,this.zipComment,this.encodeFileName);this.push({data:g,meta:{percent:100}})},y.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},y.prototype.registerPrevious=function(p){this._sources.push(p);var b=this;return p.on("data",function(d){b.processChunk(d)}),p.on("end",function(){b.closedSource(b.previous.streamInfo),b._sources.length?b.prepareNextSource():b.end()}),p.on("error",function(d){b.error(d)}),this},y.prototype.resume=function(){return!!a.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},y.prototype.error=function(p){var b=this._sources;if(!a.prototype.error.call(this,p))return!1;for(var d=0;d<b.length;d++)try{b[d].error(p)}catch{}return!0},y.prototype.lock=function(){a.prototype.lock.call(this);for(var p=this._sources,b=0;b<p.length;b++)p[b].lock()},e.exports=y},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(m,e,i){"use strict";var t=m("../compressions"),r=m("./ZipFileWorker");i.generateWorker=function(n,a,c){var _=new r(a.streamFiles,c,a.platform,a.encodeFileName),w=0;try{n.forEach(function(y,p){w++;var b=(function(x,$){var T=x||$,z=t[T];if(!z)throw new Error(T+" is not a valid compression method !");return z})(p.options.compression,a.compression),d=p.options.compressionOptions||a.compressionOptions||{},g=p.dir,u=p.date;p._compressWorker(b,d).withStreamInfo("file",{name:y,dir:g,date:u,comment:p.comment||"",unixPermissions:p.unixPermissions,dosPermissions:p.dosPermissions}).pipe(_)}),_.entriesCount=w}catch(y){_.error(y)}return _}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(m,e,i){"use strict";function t(){if(!(this instanceof t))return new t;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var r=new t;for(var n in this)typeof this[n]!="function"&&(r[n]=this[n]);return r}}(t.prototype=m("./object")).loadAsync=m("./load"),t.support=m("./support"),t.defaults=m("./defaults"),t.version="3.10.1",t.loadAsync=function(r,n){return new t().loadAsync(r,n)},t.external=m("./external"),e.exports=t},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(m,e,i){"use strict";var t=m("./utils"),r=m("./external"),n=m("./utf8"),a=m("./zipEntries"),c=m("./stream/Crc32Probe"),_=m("./nodejsUtils");function w(y){return new r.Promise(function(p,b){var d=y.decompressed.getContentWorker().pipe(new c);d.on("error",function(g){b(g)}).on("end",function(){d.streamInfo.crc32!==y.decompressed.crc32?b(new Error("Corrupted zip : CRC32 mismatch")):p()}).resume()})}e.exports=function(y,p){var b=this;return p=t.extend(p||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),_.isNode&&_.isStream(y)?r.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):t.prepareContent("the loaded zip file",y,!0,p.optimizedBinaryString,p.base64).then(function(d){var g=new a(p);return g.load(d),g}).then(function(d){var g=[r.Promise.resolve(d)],u=d.files;if(p.checkCRC32)for(var x=0;x<u.length;x++)g.push(w(u[x]));return r.Promise.all(g)}).then(function(d){for(var g=d.shift(),u=g.files,x=0;x<u.length;x++){var $=u[x],T=$.fileNameStr,z=t.resolve($.fileNameStr);b.file(z,$.decompressed,{binary:!0,optimizedBinaryString:!0,date:$.date,dir:$.dir,comment:$.fileCommentStr.length?$.fileCommentStr:null,unixPermissions:$.unixPermissions,dosPermissions:$.dosPermissions,createFolders:p.createFolders}),$.dir||(b.file(z).unsafeOriginalName=T)}return g.zipComment.length&&(b.comment=g.zipComment),b})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(m,e,i){"use strict";var t=m("../utils"),r=m("../stream/GenericWorker");function n(a,c){r.call(this,"Nodejs stream input adapter for "+a),this._upstreamEnded=!1,this._bindStream(c)}t.inherits(n,r),n.prototype._bindStream=function(a){var c=this;(this._stream=a).pause(),a.on("data",function(_){c.push({data:_,meta:{percent:0}})}).on("error",function(_){c.isPaused?this.generatedError=_:c.error(_)}).on("end",function(){c.isPaused?c._upstreamEnded=!0:c.end()})},n.prototype.pause=function(){return!!r.prototype.pause.call(this)&&(this._stream.pause(),!0)},n.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},e.exports=n},{"../stream/GenericWorker":28,"../utils":32}],13:[function(m,e,i){"use strict";var t=m("readable-stream").Readable;function r(n,a,c){t.call(this,a),this._helper=n;var _=this;n.on("data",function(w,y){_.push(w)||_._helper.pause(),c&&c(y)}).on("error",function(w){_.emit("error",w)}).on("end",function(){_.push(null)})}m("../utils").inherits(r,t),r.prototype._read=function(){this._helper.resume()},e.exports=r},{"../utils":32,"readable-stream":16}],14:[function(m,e,i){"use strict";e.exports={isNode:typeof Buffer<"u",newBufferFrom:function(t,r){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(t,r);if(typeof t=="number")throw new Error('The "data" argument must not be a number');return new Buffer(t,r)},allocBuffer:function(t){if(Buffer.alloc)return Buffer.alloc(t);var r=new Buffer(t);return r.fill(0),r},isBuffer:function(t){return Buffer.isBuffer(t)},isStream:function(t){return t&&typeof t.on=="function"&&typeof t.pause=="function"&&typeof t.resume=="function"}}},{}],15:[function(m,e,i){"use strict";function t(z,P,D){var j,F=n.getTypeOf(P),W=n.extend(D||{},_);W.date=W.date||new Date,W.compression!==null&&(W.compression=W.compression.toUpperCase()),typeof W.unixPermissions=="string"&&(W.unixPermissions=parseInt(W.unixPermissions,8)),W.unixPermissions&&16384&W.unixPermissions&&(W.dir=!0),W.dosPermissions&&16&W.dosPermissions&&(W.dir=!0),W.dir&&(z=u(z)),W.createFolders&&(j=g(z))&&x.call(this,j,!0);var K=F==="string"&&W.binary===!1&&W.base64===!1;D&&D.binary!==void 0||(W.binary=!K),(P instanceof w&&P.uncompressedSize===0||W.dir||!P||P.length===0)&&(W.base64=!1,W.binary=!0,P="",W.compression="STORE",F="string");var k=null;k=P instanceof w||P instanceof a?P:b.isNode&&b.isStream(P)?new d(z,P):n.prepareContent(z,P,W.binary,W.optimizedBinaryString,W.base64);var O=new y(z,k,W);this.files[z]=O}var r=m("./utf8"),n=m("./utils"),a=m("./stream/GenericWorker"),c=m("./stream/StreamHelper"),_=m("./defaults"),w=m("./compressedObject"),y=m("./zipObject"),p=m("./generate"),b=m("./nodejsUtils"),d=m("./nodejs/NodejsStreamInputAdapter"),g=function(z){z.slice(-1)==="/"&&(z=z.substring(0,z.length-1));var P=z.lastIndexOf("/");return 0<P?z.substring(0,P):""},u=function(z){return z.slice(-1)!=="/"&&(z+="/"),z},x=function(z,P){return P=P!==void 0?P:_.createFolders,z=u(z),this.files[z]||t.call(this,z,null,{dir:!0,createFolders:P}),this.files[z]};function $(z){return Object.prototype.toString.call(z)==="[object RegExp]"}var T={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(z){var P,D,j;for(P in this.files)j=this.files[P],(D=P.slice(this.root.length,P.length))&&P.slice(0,this.root.length)===this.root&&z(D,j)},filter:function(z){var P=[];return this.forEach(function(D,j){z(D,j)&&P.push(j)}),P},file:function(z,P,D){if(arguments.length!==1)return z=this.root+z,t.call(this,z,P,D),this;if($(z)){var j=z;return this.filter(function(W,K){return!K.dir&&j.test(W)})}var F=this.files[this.root+z];return F&&!F.dir?F:null},folder:function(z){if(!z)return this;if($(z))return this.filter(function(F,W){return W.dir&&z.test(F)});var P=this.root+z,D=x.call(this,P),j=this.clone();return j.root=D.name,j},remove:function(z){z=this.root+z;var P=this.files[z];if(P||(z.slice(-1)!=="/"&&(z+="/"),P=this.files[z]),P&&!P.dir)delete this.files[z];else for(var D=this.filter(function(F,W){return W.name.slice(0,z.length)===z}),j=0;j<D.length;j++)delete this.files[D[j].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(z){var P,D={};try{if((D=n.extend(z||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:r.utf8encode})).type=D.type.toLowerCase(),D.compression=D.compression.toUpperCase(),D.type==="binarystring"&&(D.type="string"),!D.type)throw new Error("No output type specified.");n.checkSupport(D.type),D.platform!=="darwin"&&D.platform!=="freebsd"&&D.platform!=="linux"&&D.platform!=="sunos"||(D.platform="UNIX"),D.platform==="win32"&&(D.platform="DOS");var j=D.comment||this.comment||"";P=p.generateWorker(this,D,j)}catch(F){(P=new a("error")).error(F)}return new c(P,D.type||"string",D.mimeType)},generateAsync:function(z,P){return this.generateInternalStream(z).accumulate(P)},generateNodeStream:function(z,P){return(z=z||{}).type||(z.type="nodebuffer"),this.generateInternalStream(z).toNodejsStream(P)}};e.exports=T},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(m,e,i){"use strict";e.exports=m("stream")},{stream:void 0}],17:[function(m,e,i){"use strict";var t=m("./DataReader");function r(n){t.call(this,n);for(var a=0;a<this.data.length;a++)n[a]=255&n[a]}m("../utils").inherits(r,t),r.prototype.byteAt=function(n){return this.data[this.zero+n]},r.prototype.lastIndexOfSignature=function(n){for(var a=n.charCodeAt(0),c=n.charCodeAt(1),_=n.charCodeAt(2),w=n.charCodeAt(3),y=this.length-4;0<=y;--y)if(this.data[y]===a&&this.data[y+1]===c&&this.data[y+2]===_&&this.data[y+3]===w)return y-this.zero;return-1},r.prototype.readAndCheckSignature=function(n){var a=n.charCodeAt(0),c=n.charCodeAt(1),_=n.charCodeAt(2),w=n.charCodeAt(3),y=this.readData(4);return a===y[0]&&c===y[1]&&_===y[2]&&w===y[3]},r.prototype.readData=function(n){if(this.checkOffset(n),n===0)return[];var a=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,a},e.exports=r},{"../utils":32,"./DataReader":18}],18:[function(m,e,i){"use strict";var t=m("../utils");function r(n){this.data=n,this.length=n.length,this.index=0,this.zero=0}r.prototype={checkOffset:function(n){this.checkIndex(this.index+n)},checkIndex:function(n){if(this.length<this.zero+n||n<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+n+"). Corrupted zip ?")},setIndex:function(n){this.checkIndex(n),this.index=n},skip:function(n){this.setIndex(this.index+n)},byteAt:function(){},readInt:function(n){var a,c=0;for(this.checkOffset(n),a=this.index+n-1;a>=this.index;a--)c=(c<<8)+this.byteAt(a);return this.index+=n,c},readString:function(n){return t.transformTo("string",this.readData(n))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var n=this.readInt(4);return new Date(Date.UTC(1980+(n>>25&127),(n>>21&15)-1,n>>16&31,n>>11&31,n>>5&63,(31&n)<<1))}},e.exports=r},{"../utils":32}],19:[function(m,e,i){"use strict";var t=m("./Uint8ArrayReader");function r(n){t.call(this,n)}m("../utils").inherits(r,t),r.prototype.readData=function(n){this.checkOffset(n);var a=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,a},e.exports=r},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(m,e,i){"use strict";var t=m("./DataReader");function r(n){t.call(this,n)}m("../utils").inherits(r,t),r.prototype.byteAt=function(n){return this.data.charCodeAt(this.zero+n)},r.prototype.lastIndexOfSignature=function(n){return this.data.lastIndexOf(n)-this.zero},r.prototype.readAndCheckSignature=function(n){return n===this.readData(4)},r.prototype.readData=function(n){this.checkOffset(n);var a=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,a},e.exports=r},{"../utils":32,"./DataReader":18}],21:[function(m,e,i){"use strict";var t=m("./ArrayReader");function r(n){t.call(this,n)}m("../utils").inherits(r,t),r.prototype.readData=function(n){if(this.checkOffset(n),n===0)return new Uint8Array(0);var a=this.data.subarray(this.zero+this.index,this.zero+this.index+n);return this.index+=n,a},e.exports=r},{"../utils":32,"./ArrayReader":17}],22:[function(m,e,i){"use strict";var t=m("../utils"),r=m("../support"),n=m("./ArrayReader"),a=m("./StringReader"),c=m("./NodeBufferReader"),_=m("./Uint8ArrayReader");e.exports=function(w){var y=t.getTypeOf(w);return t.checkSupport(y),y!=="string"||r.uint8array?y==="nodebuffer"?new c(w):r.uint8array?new _(t.transformTo("uint8array",w)):new n(t.transformTo("array",w)):new a(w)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(m,e,i){"use strict";i.LOCAL_FILE_HEADER="PK",i.CENTRAL_FILE_HEADER="PK",i.CENTRAL_DIRECTORY_END="PK",i.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",i.ZIP64_CENTRAL_DIRECTORY_END="PK",i.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(m,e,i){"use strict";var t=m("./GenericWorker"),r=m("../utils");function n(a){t.call(this,"ConvertWorker to "+a),this.destType=a}r.inherits(n,t),n.prototype.processChunk=function(a){this.push({data:r.transformTo(this.destType,a.data),meta:a.meta})},e.exports=n},{"../utils":32,"./GenericWorker":28}],25:[function(m,e,i){"use strict";var t=m("./GenericWorker"),r=m("../crc32");function n(){t.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}m("../utils").inherits(n,t),n.prototype.processChunk=function(a){this.streamInfo.crc32=r(a.data,this.streamInfo.crc32||0),this.push(a)},e.exports=n},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(m,e,i){"use strict";var t=m("../utils"),r=m("./GenericWorker");function n(a){r.call(this,"DataLengthProbe for "+a),this.propName=a,this.withStreamInfo(a,0)}t.inherits(n,r),n.prototype.processChunk=function(a){if(a){var c=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=c+a.data.length}r.prototype.processChunk.call(this,a)},e.exports=n},{"../utils":32,"./GenericWorker":28}],27:[function(m,e,i){"use strict";var t=m("../utils"),r=m("./GenericWorker");function n(a){r.call(this,"DataWorker");var c=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,a.then(function(_){c.dataIsReady=!0,c.data=_,c.max=_&&_.length||0,c.type=t.getTypeOf(_),c.isPaused||c._tickAndRepeat()},function(_){c.error(_)})}t.inherits(n,r),n.prototype.cleanUp=function(){r.prototype.cleanUp.call(this),this.data=null},n.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,t.delay(this._tickAndRepeat,[],this)),!0)},n.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(t.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},n.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var a=null,c=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":a=this.data.substring(this.index,c);break;case"uint8array":a=this.data.subarray(this.index,c);break;case"array":case"nodebuffer":a=this.data.slice(this.index,c)}return this.index=c,this.push({data:a,meta:{percent:this.max?this.index/this.max*100:0}})},e.exports=n},{"../utils":32,"./GenericWorker":28}],28:[function(m,e,i){"use strict";function t(r){this.name=r||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}t.prototype={push:function(r){this.emit("data",r)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(r){this.emit("error",r)}return!0},error:function(r){return!this.isFinished&&(this.isPaused?this.generatedError=r:(this.isFinished=!0,this.emit("error",r),this.previous&&this.previous.error(r),this.cleanUp()),!0)},on:function(r,n){return this._listeners[r].push(n),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(r,n){if(this._listeners[r])for(var a=0;a<this._listeners[r].length;a++)this._listeners[r][a].call(this,n)},pipe:function(r){return r.registerPrevious(this)},registerPrevious:function(r){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=r.streamInfo,this.mergeStreamInfo(),this.previous=r;var n=this;return r.on("data",function(a){n.processChunk(a)}),r.on("end",function(){n.end()}),r.on("error",function(a){n.error(a)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var r=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),r=!0),this.previous&&this.previous.resume(),!r},flush:function(){},processChunk:function(r){this.push(r)},withStreamInfo:function(r,n){return this.extraStreamInfo[r]=n,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var r in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,r)&&(this.streamInfo[r]=this.extraStreamInfo[r])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var r="Worker "+this.name;return this.previous?this.previous+" -> "+r:r}},e.exports=t},{}],29:[function(m,e,i){"use strict";var t=m("../utils"),r=m("./ConvertWorker"),n=m("./GenericWorker"),a=m("../base64"),c=m("../support"),_=m("../external"),w=null;if(c.nodestream)try{w=m("../nodejs/NodejsStreamOutputAdapter")}catch{}function y(b,d){return new _.Promise(function(g,u){var x=[],$=b._internalType,T=b._outputType,z=b._mimeType;b.on("data",function(P,D){x.push(P),d&&d(D)}).on("error",function(P){x=[],u(P)}).on("end",function(){try{var P=(function(D,j,F){switch(D){case"blob":return t.newBlob(t.transformTo("arraybuffer",j),F);case"base64":return a.encode(j);default:return t.transformTo(D,j)}})(T,(function(D,j){var F,W=0,K=null,k=0;for(F=0;F<j.length;F++)k+=j[F].length;switch(D){case"string":return j.join("");case"array":return Array.prototype.concat.apply([],j);case"uint8array":for(K=new Uint8Array(k),F=0;F<j.length;F++)K.set(j[F],W),W+=j[F].length;return K;case"nodebuffer":return Buffer.concat(j);default:throw new Error("concat : unsupported type '"+D+"'")}})($,x),z);g(P)}catch(D){u(D)}x=[]}).resume()})}function p(b,d,g){var u=d;switch(d){case"blob":case"arraybuffer":u="uint8array";break;case"base64":u="string"}try{this._internalType=u,this._outputType=d,this._mimeType=g,t.checkSupport(u),this._worker=b.pipe(new r(u)),b.lock()}catch(x){this._worker=new n("error"),this._worker.error(x)}}p.prototype={accumulate:function(b){return y(this,b)},on:function(b,d){var g=this;return b==="data"?this._worker.on(b,function(u){d.call(g,u.data,u.meta)}):this._worker.on(b,function(){t.delay(d,arguments,g)}),this},resume:function(){return t.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(b){if(t.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new w(this,{objectMode:this._outputType!=="nodebuffer"},b)}},e.exports=p},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(m,e,i){"use strict";if(i.base64=!0,i.array=!0,i.string=!0,i.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",i.nodebuffer=typeof Buffer<"u",i.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")i.blob=!1;else{var t=new ArrayBuffer(0);try{i.blob=new Blob([t],{type:"application/zip"}).size===0}catch{try{var r=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);r.append(t),i.blob=r.getBlob("application/zip").size===0}catch{i.blob=!1}}}try{i.nodestream=!!m("readable-stream").Readable}catch{i.nodestream=!1}},{"readable-stream":16}],31:[function(m,e,i){"use strict";for(var t=m("./utils"),r=m("./support"),n=m("./nodejsUtils"),a=m("./stream/GenericWorker"),c=new Array(256),_=0;_<256;_++)c[_]=252<=_?6:248<=_?5:240<=_?4:224<=_?3:192<=_?2:1;c[254]=c[254]=1;function w(){a.call(this,"utf-8 decode"),this.leftOver=null}function y(){a.call(this,"utf-8 encode")}i.utf8encode=function(p){return r.nodebuffer?n.newBufferFrom(p,"utf-8"):(function(b){var d,g,u,x,$,T=b.length,z=0;for(x=0;x<T;x++)(64512&(g=b.charCodeAt(x)))==55296&&x+1<T&&(64512&(u=b.charCodeAt(x+1)))==56320&&(g=65536+(g-55296<<10)+(u-56320),x++),z+=g<128?1:g<2048?2:g<65536?3:4;for(d=r.uint8array?new Uint8Array(z):new Array(z),x=$=0;$<z;x++)(64512&(g=b.charCodeAt(x)))==55296&&x+1<T&&(64512&(u=b.charCodeAt(x+1)))==56320&&(g=65536+(g-55296<<10)+(u-56320),x++),g<128?d[$++]=g:(g<2048?d[$++]=192|g>>>6:(g<65536?d[$++]=224|g>>>12:(d[$++]=240|g>>>18,d[$++]=128|g>>>12&63),d[$++]=128|g>>>6&63),d[$++]=128|63&g);return d})(p)},i.utf8decode=function(p){return r.nodebuffer?t.transformTo("nodebuffer",p).toString("utf-8"):(function(b){var d,g,u,x,$=b.length,T=new Array(2*$);for(d=g=0;d<$;)if((u=b[d++])<128)T[g++]=u;else if(4<(x=c[u]))T[g++]=65533,d+=x-1;else{for(u&=x===2?31:x===3?15:7;1<x&&d<$;)u=u<<6|63&b[d++],x--;1<x?T[g++]=65533:u<65536?T[g++]=u:(u-=65536,T[g++]=55296|u>>10&1023,T[g++]=56320|1023&u)}return T.length!==g&&(T.subarray?T=T.subarray(0,g):T.length=g),t.applyFromCharCode(T)})(p=t.transformTo(r.uint8array?"uint8array":"array",p))},t.inherits(w,a),w.prototype.processChunk=function(p){var b=t.transformTo(r.uint8array?"uint8array":"array",p.data);if(this.leftOver&&this.leftOver.length){if(r.uint8array){var d=b;(b=new Uint8Array(d.length+this.leftOver.length)).set(this.leftOver,0),b.set(d,this.leftOver.length)}else b=this.leftOver.concat(b);this.leftOver=null}var g=(function(x,$){var T;for(($=$||x.length)>x.length&&($=x.length),T=$-1;0<=T&&(192&x[T])==128;)T--;return T<0||T===0?$:T+c[x[T]]>$?T:$})(b),u=b;g!==b.length&&(r.uint8array?(u=b.subarray(0,g),this.leftOver=b.subarray(g,b.length)):(u=b.slice(0,g),this.leftOver=b.slice(g,b.length))),this.push({data:i.utf8decode(u),meta:p.meta})},w.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:i.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},i.Utf8DecodeWorker=w,t.inherits(y,a),y.prototype.processChunk=function(p){this.push({data:i.utf8encode(p.data),meta:p.meta})},i.Utf8EncodeWorker=y},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(m,e,i){"use strict";var t=m("./support"),r=m("./base64"),n=m("./nodejsUtils"),a=m("./external");function c(d){return d}function _(d,g){for(var u=0;u<d.length;++u)g[u]=255&d.charCodeAt(u);return g}m("setimmediate"),i.newBlob=function(d,g){i.checkSupport("blob");try{return new Blob([d],{type:g})}catch{try{var u=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return u.append(d),u.getBlob(g)}catch{throw new Error("Bug : can't construct the Blob.")}}};var w={stringifyByChunk:function(d,g,u){var x=[],$=0,T=d.length;if(T<=u)return String.fromCharCode.apply(null,d);for(;$<T;)g==="array"||g==="nodebuffer"?x.push(String.fromCharCode.apply(null,d.slice($,Math.min($+u,T)))):x.push(String.fromCharCode.apply(null,d.subarray($,Math.min($+u,T)))),$+=u;return x.join("")},stringifyByChar:function(d){for(var g="",u=0;u<d.length;u++)g+=String.fromCharCode(d[u]);return g},applyCanBeUsed:{uint8array:(function(){try{return t.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}})(),nodebuffer:(function(){try{return t.nodebuffer&&String.fromCharCode.apply(null,n.allocBuffer(1)).length===1}catch{return!1}})()}};function y(d){var g=65536,u=i.getTypeOf(d),x=!0;if(u==="uint8array"?x=w.applyCanBeUsed.uint8array:u==="nodebuffer"&&(x=w.applyCanBeUsed.nodebuffer),x)for(;1<g;)try{return w.stringifyByChunk(d,u,g)}catch{g=Math.floor(g/2)}return w.stringifyByChar(d)}function p(d,g){for(var u=0;u<d.length;u++)g[u]=d[u];return g}i.applyFromCharCode=y;var b={};b.string={string:c,array:function(d){return _(d,new Array(d.length))},arraybuffer:function(d){return b.string.uint8array(d).buffer},uint8array:function(d){return _(d,new Uint8Array(d.length))},nodebuffer:function(d){return _(d,n.allocBuffer(d.length))}},b.array={string:y,array:c,arraybuffer:function(d){return new Uint8Array(d).buffer},uint8array:function(d){return new Uint8Array(d)},nodebuffer:function(d){return n.newBufferFrom(d)}},b.arraybuffer={string:function(d){return y(new Uint8Array(d))},array:function(d){return p(new Uint8Array(d),new Array(d.byteLength))},arraybuffer:c,uint8array:function(d){return new Uint8Array(d)},nodebuffer:function(d){return n.newBufferFrom(new Uint8Array(d))}},b.uint8array={string:y,array:function(d){return p(d,new Array(d.length))},arraybuffer:function(d){return d.buffer},uint8array:c,nodebuffer:function(d){return n.newBufferFrom(d)}},b.nodebuffer={string:y,array:function(d){return p(d,new Array(d.length))},arraybuffer:function(d){return b.nodebuffer.uint8array(d).buffer},uint8array:function(d){return p(d,new Uint8Array(d.length))},nodebuffer:c},i.transformTo=function(d,g){if(g=g||"",!d)return g;i.checkSupport(d);var u=i.getTypeOf(g);return b[u][d](g)},i.resolve=function(d){for(var g=d.split("/"),u=[],x=0;x<g.length;x++){var $=g[x];$==="."||$===""&&x!==0&&x!==g.length-1||($===".."?u.pop():u.push($))}return u.join("/")},i.getTypeOf=function(d){return typeof d=="string"?"string":Object.prototype.toString.call(d)==="[object Array]"?"array":t.nodebuffer&&n.isBuffer(d)?"nodebuffer":t.uint8array&&d instanceof Uint8Array?"uint8array":t.arraybuffer&&d instanceof ArrayBuffer?"arraybuffer":void 0},i.checkSupport=function(d){if(!t[d.toLowerCase()])throw new Error(d+" is not supported by this platform")},i.MAX_VALUE_16BITS=65535,i.MAX_VALUE_32BITS=-1,i.pretty=function(d){var g,u,x="";for(u=0;u<(d||"").length;u++)x+="\\x"+((g=d.charCodeAt(u))<16?"0":"")+g.toString(16).toUpperCase();return x},i.delay=function(d,g,u){setImmediate(function(){d.apply(u||null,g||[])})},i.inherits=function(d,g){function u(){}u.prototype=g.prototype,d.prototype=new u},i.extend=function(){var d,g,u={};for(d=0;d<arguments.length;d++)for(g in arguments[d])Object.prototype.hasOwnProperty.call(arguments[d],g)&&u[g]===void 0&&(u[g]=arguments[d][g]);return u},i.prepareContent=function(d,g,u,x,$){return a.Promise.resolve(g).then(function(T){return t.blob&&(T instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(T))!==-1)&&typeof FileReader<"u"?new a.Promise(function(z,P){var D=new FileReader;D.onload=function(j){z(j.target.result)},D.onerror=function(j){P(j.target.error)},D.readAsArrayBuffer(T)}):T}).then(function(T){var z=i.getTypeOf(T);return z?(z==="arraybuffer"?T=i.transformTo("uint8array",T):z==="string"&&($?T=r.decode(T):u&&x!==!0&&(T=(function(P){return _(P,t.uint8array?new Uint8Array(P.length):new Array(P.length))})(T))),T):a.Promise.reject(new Error("Can't read the data of '"+d+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(m,e,i){"use strict";var t=m("./reader/readerFor"),r=m("./utils"),n=m("./signature"),a=m("./zipEntry"),c=m("./support");function _(w){this.files=[],this.loadOptions=w}_.prototype={checkSignature:function(w){if(!this.reader.readAndCheckSignature(w)){this.reader.index-=4;var y=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+r.pretty(y)+", expected "+r.pretty(w)+")")}},isSignature:function(w,y){var p=this.reader.index;this.reader.setIndex(w);var b=this.reader.readString(4)===y;return this.reader.setIndex(p),b},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var w=this.reader.readData(this.zipCommentLength),y=c.uint8array?"uint8array":"array",p=r.transformTo(y,w);this.zipComment=this.loadOptions.decodeFileName(p)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var w,y,p,b=this.zip64EndOfCentralSize-44;0<b;)w=this.reader.readInt(2),y=this.reader.readInt(4),p=this.reader.readData(y),this.zip64ExtensibleData[w]={id:w,length:y,value:p}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var w,y;for(w=0;w<this.files.length;w++)y=this.files[w],this.reader.setIndex(y.localHeaderOffset),this.checkSignature(n.LOCAL_FILE_HEADER),y.readLocalPart(this.reader),y.handleUTF8(),y.processAttributes()},readCentralDir:function(){var w;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(n.CENTRAL_FILE_HEADER);)(w=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(w);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var w=this.reader.lastIndexOfSignature(n.CENTRAL_DIRECTORY_END);if(w<0)throw this.isSignature(0,n.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(w);var y=w;if(this.checkSignature(n.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===r.MAX_VALUE_16BITS||this.diskWithCentralDirStart===r.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===r.MAX_VALUE_16BITS||this.centralDirRecords===r.MAX_VALUE_16BITS||this.centralDirSize===r.MAX_VALUE_32BITS||this.centralDirOffset===r.MAX_VALUE_32BITS){if(this.zip64=!0,(w=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(w),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,n.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var p=this.centralDirOffset+this.centralDirSize;this.zip64&&(p+=20,p+=12+this.zip64EndOfCentralSize);var b=y-p;if(0<b)this.isSignature(y,n.CENTRAL_FILE_HEADER)||(this.reader.zero=b);else if(b<0)throw new Error("Corrupted zip: missing "+Math.abs(b)+" bytes.")},prepareReader:function(w){this.reader=t(w)},load:function(w){this.prepareReader(w),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},e.exports=_},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(m,e,i){"use strict";var t=m("./reader/readerFor"),r=m("./utils"),n=m("./compressedObject"),a=m("./crc32"),c=m("./utf8"),_=m("./compressions"),w=m("./support");function y(p,b){this.options=p,this.loadOptions=b}y.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(p){var b,d;if(p.skip(22),this.fileNameLength=p.readInt(2),d=p.readInt(2),this.fileName=p.readData(this.fileNameLength),p.skip(d),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((b=(function(g){for(var u in _)if(Object.prototype.hasOwnProperty.call(_,u)&&_[u].magic===g)return _[u];return null})(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+r.pretty(this.compressionMethod)+" unknown (inner file : "+r.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,b,p.readData(this.compressedSize))},readCentralPart:function(p){this.versionMadeBy=p.readInt(2),p.skip(2),this.bitFlag=p.readInt(2),this.compressionMethod=p.readString(2),this.date=p.readDate(),this.crc32=p.readInt(4),this.compressedSize=p.readInt(4),this.uncompressedSize=p.readInt(4);var b=p.readInt(2);if(this.extraFieldsLength=p.readInt(2),this.fileCommentLength=p.readInt(2),this.diskNumberStart=p.readInt(2),this.internalFileAttributes=p.readInt(2),this.externalFileAttributes=p.readInt(4),this.localHeaderOffset=p.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");p.skip(b),this.readExtraFields(p),this.parseZIP64ExtraField(p),this.fileComment=p.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var p=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),p==0&&(this.dosPermissions=63&this.externalFileAttributes),p==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var p=t(this.extraFields[1].value);this.uncompressedSize===r.MAX_VALUE_32BITS&&(this.uncompressedSize=p.readInt(8)),this.compressedSize===r.MAX_VALUE_32BITS&&(this.compressedSize=p.readInt(8)),this.localHeaderOffset===r.MAX_VALUE_32BITS&&(this.localHeaderOffset=p.readInt(8)),this.diskNumberStart===r.MAX_VALUE_32BITS&&(this.diskNumberStart=p.readInt(4))}},readExtraFields:function(p){var b,d,g,u=p.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});p.index+4<u;)b=p.readInt(2),d=p.readInt(2),g=p.readData(d),this.extraFields[b]={id:b,length:d,value:g};p.setIndex(u)},handleUTF8:function(){var p=w.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=c.utf8decode(this.fileName),this.fileCommentStr=c.utf8decode(this.fileComment);else{var b=this.findExtraFieldUnicodePath();if(b!==null)this.fileNameStr=b;else{var d=r.transformTo(p,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(d)}var g=this.findExtraFieldUnicodeComment();if(g!==null)this.fileCommentStr=g;else{var u=r.transformTo(p,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(u)}}},findExtraFieldUnicodePath:function(){var p=this.extraFields[28789];if(p){var b=t(p.value);return b.readInt(1)!==1||a(this.fileName)!==b.readInt(4)?null:c.utf8decode(b.readData(p.length-5))}return null},findExtraFieldUnicodeComment:function(){var p=this.extraFields[25461];if(p){var b=t(p.value);return b.readInt(1)!==1||a(this.fileComment)!==b.readInt(4)?null:c.utf8decode(b.readData(p.length-5))}return null}},e.exports=y},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(m,e,i){"use strict";function t(b,d,g){this.name=b,this.dir=g.dir,this.date=g.date,this.comment=g.comment,this.unixPermissions=g.unixPermissions,this.dosPermissions=g.dosPermissions,this._data=d,this._dataBinary=g.binary,this.options={compression:g.compression,compressionOptions:g.compressionOptions}}var r=m("./stream/StreamHelper"),n=m("./stream/DataWorker"),a=m("./utf8"),c=m("./compressedObject"),_=m("./stream/GenericWorker");t.prototype={internalStream:function(b){var d=null,g="string";try{if(!b)throw new Error("No output type specified.");var u=(g=b.toLowerCase())==="string"||g==="text";g!=="binarystring"&&g!=="text"||(g="string"),d=this._decompressWorker();var x=!this._dataBinary;x&&!u&&(d=d.pipe(new a.Utf8EncodeWorker)),!x&&u&&(d=d.pipe(new a.Utf8DecodeWorker))}catch($){(d=new _("error")).error($)}return new r(d,g,"")},async:function(b,d){return this.internalStream(b).accumulate(d)},nodeStream:function(b,d){return this.internalStream(b||"nodebuffer").toNodejsStream(d)},_compressWorker:function(b,d){if(this._data instanceof c&&this._data.compression.magic===b.magic)return this._data.getCompressedWorker();var g=this._decompressWorker();return this._dataBinary||(g=g.pipe(new a.Utf8EncodeWorker)),c.createWorkerFrom(g,b,d)},_decompressWorker:function(){return this._data instanceof c?this._data.getContentWorker():this._data instanceof _?this._data:new n(this._data)}};for(var w=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],y=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},p=0;p<w.length;p++)t.prototype[w[p]]=y;e.exports=t},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(m,e,i){(function(t){"use strict";var r,n,a=t.MutationObserver||t.WebKitMutationObserver;if(a){var c=0,_=new a(b),w=t.document.createTextNode("");_.observe(w,{characterData:!0}),r=function(){w.data=c=++c%2}}else if(t.setImmediate||t.MessageChannel===void 0)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var d=t.document.createElement("script");d.onreadystatechange=function(){b(),d.onreadystatechange=null,d.parentNode.removeChild(d),d=null},t.document.documentElement.appendChild(d)}:function(){setTimeout(b,0)};else{var y=new t.MessageChannel;y.port1.onmessage=b,r=function(){y.port2.postMessage(0)}}var p=[];function b(){var d,g;n=!0;for(var u=p.length;u;){for(g=p,p=[],d=-1;++d<u;)g[d]();u=p.length}n=!1}e.exports=function(d){p.push(d)!==1||n||r()}}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(m,e,i){"use strict";var t=m("immediate");function r(){}var n={},a=["REJECTED"],c=["FULFILLED"],_=["PENDING"];function w(u){if(typeof u!="function")throw new TypeError("resolver must be a function");this.state=_,this.queue=[],this.outcome=void 0,u!==r&&d(this,u)}function y(u,x,$){this.promise=u,typeof x=="function"&&(this.onFulfilled=x,this.callFulfilled=this.otherCallFulfilled),typeof $=="function"&&(this.onRejected=$,this.callRejected=this.otherCallRejected)}function p(u,x,$){t(function(){var T;try{T=x($)}catch(z){return n.reject(u,z)}T===u?n.reject(u,new TypeError("Cannot resolve promise with itself")):n.resolve(u,T)})}function b(u){var x=u&&u.then;if(u&&(typeof u=="object"||typeof u=="function")&&typeof x=="function")return function(){x.apply(u,arguments)}}function d(u,x){var $=!1;function T(D){$||($=!0,n.reject(u,D))}function z(D){$||($=!0,n.resolve(u,D))}var P=g(function(){x(z,T)});P.status==="error"&&T(P.value)}function g(u,x){var $={};try{$.value=u(x),$.status="success"}catch(T){$.status="error",$.value=T}return $}(e.exports=w).prototype.finally=function(u){if(typeof u!="function")return this;var x=this.constructor;return this.then(function($){return x.resolve(u()).then(function(){return $})},function($){return x.resolve(u()).then(function(){throw $})})},w.prototype.catch=function(u){return this.then(null,u)},w.prototype.then=function(u,x){if(typeof u!="function"&&this.state===c||typeof x!="function"&&this.state===a)return this;var $=new this.constructor(r);return this.state!==_?p($,this.state===c?u:x,this.outcome):this.queue.push(new y($,u,x)),$},y.prototype.callFulfilled=function(u){n.resolve(this.promise,u)},y.prototype.otherCallFulfilled=function(u){p(this.promise,this.onFulfilled,u)},y.prototype.callRejected=function(u){n.reject(this.promise,u)},y.prototype.otherCallRejected=function(u){p(this.promise,this.onRejected,u)},n.resolve=function(u,x){var $=g(b,x);if($.status==="error")return n.reject(u,$.value);var T=$.value;if(T)d(u,T);else{u.state=c,u.outcome=x;for(var z=-1,P=u.queue.length;++z<P;)u.queue[z].callFulfilled(x)}return u},n.reject=function(u,x){u.state=a,u.outcome=x;for(var $=-1,T=u.queue.length;++$<T;)u.queue[$].callRejected(x);return u},w.resolve=function(u){return u instanceof this?u:n.resolve(new this(r),u)},w.reject=function(u){var x=new this(r);return n.reject(x,u)},w.all=function(u){var x=this;if(Object.prototype.toString.call(u)!=="[object Array]")return this.reject(new TypeError("must be an array"));var $=u.length,T=!1;if(!$)return this.resolve([]);for(var z=new Array($),P=0,D=-1,j=new this(r);++D<$;)F(u[D],D);return j;function F(W,K){x.resolve(W).then(function(k){z[K]=k,++P!==$||T||(T=!0,n.resolve(j,z))},function(k){T||(T=!0,n.reject(j,k))})}},w.race=function(u){var x=this;if(Object.prototype.toString.call(u)!=="[object Array]")return this.reject(new TypeError("must be an array"));var $=u.length,T=!1;if(!$)return this.resolve([]);for(var z=-1,P=new this(r);++z<$;)D=u[z],x.resolve(D).then(function(j){T||(T=!0,n.resolve(P,j))},function(j){T||(T=!0,n.reject(P,j))});var D;return P}},{immediate:36}],38:[function(m,e,i){"use strict";var t={};(0,m("./lib/utils/common").assign)(t,m("./lib/deflate"),m("./lib/inflate"),m("./lib/zlib/constants")),e.exports=t},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(m,e,i){"use strict";var t=m("./zlib/deflate"),r=m("./utils/common"),n=m("./utils/strings"),a=m("./zlib/messages"),c=m("./zlib/zstream"),_=Object.prototype.toString,w=0,y=-1,p=0,b=8;function d(u){if(!(this instanceof d))return new d(u);this.options=r.assign({level:y,method:b,chunkSize:16384,windowBits:15,memLevel:8,strategy:p,to:""},u||{});var x=this.options;x.raw&&0<x.windowBits?x.windowBits=-x.windowBits:x.gzip&&0<x.windowBits&&x.windowBits<16&&(x.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new c,this.strm.avail_out=0;var $=t.deflateInit2(this.strm,x.level,x.method,x.windowBits,x.memLevel,x.strategy);if($!==w)throw new Error(a[$]);if(x.header&&t.deflateSetHeader(this.strm,x.header),x.dictionary){var T;if(T=typeof x.dictionary=="string"?n.string2buf(x.dictionary):_.call(x.dictionary)==="[object ArrayBuffer]"?new Uint8Array(x.dictionary):x.dictionary,($=t.deflateSetDictionary(this.strm,T))!==w)throw new Error(a[$]);this._dict_set=!0}}function g(u,x){var $=new d(x);if($.push(u,!0),$.err)throw $.msg||a[$.err];return $.result}d.prototype.push=function(u,x){var $,T,z=this.strm,P=this.options.chunkSize;if(this.ended)return!1;T=x===~~x?x:x===!0?4:0,typeof u=="string"?z.input=n.string2buf(u):_.call(u)==="[object ArrayBuffer]"?z.input=new Uint8Array(u):z.input=u,z.next_in=0,z.avail_in=z.input.length;do{if(z.avail_out===0&&(z.output=new r.Buf8(P),z.next_out=0,z.avail_out=P),($=t.deflate(z,T))!==1&&$!==w)return this.onEnd($),!(this.ended=!0);z.avail_out!==0&&(z.avail_in!==0||T!==4&&T!==2)||(this.options.to==="string"?this.onData(n.buf2binstring(r.shrinkBuf(z.output,z.next_out))):this.onData(r.shrinkBuf(z.output,z.next_out)))}while((0<z.avail_in||z.avail_out===0)&&$!==1);return T===4?($=t.deflateEnd(this.strm),this.onEnd($),this.ended=!0,$===w):T!==2||(this.onEnd(w),!(z.avail_out=0))},d.prototype.onData=function(u){this.chunks.push(u)},d.prototype.onEnd=function(u){u===w&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=r.flattenChunks(this.chunks)),this.chunks=[],this.err=u,this.msg=this.strm.msg},i.Deflate=d,i.deflate=g,i.deflateRaw=function(u,x){return(x=x||{}).raw=!0,g(u,x)},i.gzip=function(u,x){return(x=x||{}).gzip=!0,g(u,x)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(m,e,i){"use strict";var t=m("./zlib/inflate"),r=m("./utils/common"),n=m("./utils/strings"),a=m("./zlib/constants"),c=m("./zlib/messages"),_=m("./zlib/zstream"),w=m("./zlib/gzheader"),y=Object.prototype.toString;function p(d){if(!(this instanceof p))return new p(d);this.options=r.assign({chunkSize:16384,windowBits:0,to:""},d||{});var g=this.options;g.raw&&0<=g.windowBits&&g.windowBits<16&&(g.windowBits=-g.windowBits,g.windowBits===0&&(g.windowBits=-15)),!(0<=g.windowBits&&g.windowBits<16)||d&&d.windowBits||(g.windowBits+=32),15<g.windowBits&&g.windowBits<48&&(15&g.windowBits)==0&&(g.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new _,this.strm.avail_out=0;var u=t.inflateInit2(this.strm,g.windowBits);if(u!==a.Z_OK)throw new Error(c[u]);this.header=new w,t.inflateGetHeader(this.strm,this.header)}function b(d,g){var u=new p(g);if(u.push(d,!0),u.err)throw u.msg||c[u.err];return u.result}p.prototype.push=function(d,g){var u,x,$,T,z,P,D=this.strm,j=this.options.chunkSize,F=this.options.dictionary,W=!1;if(this.ended)return!1;x=g===~~g?g:g===!0?a.Z_FINISH:a.Z_NO_FLUSH,typeof d=="string"?D.input=n.binstring2buf(d):y.call(d)==="[object ArrayBuffer]"?D.input=new Uint8Array(d):D.input=d,D.next_in=0,D.avail_in=D.input.length;do{if(D.avail_out===0&&(D.output=new r.Buf8(j),D.next_out=0,D.avail_out=j),(u=t.inflate(D,a.Z_NO_FLUSH))===a.Z_NEED_DICT&&F&&(P=typeof F=="string"?n.string2buf(F):y.call(F)==="[object ArrayBuffer]"?new Uint8Array(F):F,u=t.inflateSetDictionary(this.strm,P)),u===a.Z_BUF_ERROR&&W===!0&&(u=a.Z_OK,W=!1),u!==a.Z_STREAM_END&&u!==a.Z_OK)return this.onEnd(u),!(this.ended=!0);D.next_out&&(D.avail_out!==0&&u!==a.Z_STREAM_END&&(D.avail_in!==0||x!==a.Z_FINISH&&x!==a.Z_SYNC_FLUSH)||(this.options.to==="string"?($=n.utf8border(D.output,D.next_out),T=D.next_out-$,z=n.buf2string(D.output,$),D.next_out=T,D.avail_out=j-T,T&&r.arraySet(D.output,D.output,$,T,0),this.onData(z)):this.onData(r.shrinkBuf(D.output,D.next_out)))),D.avail_in===0&&D.avail_out===0&&(W=!0)}while((0<D.avail_in||D.avail_out===0)&&u!==a.Z_STREAM_END);return u===a.Z_STREAM_END&&(x=a.Z_FINISH),x===a.Z_FINISH?(u=t.inflateEnd(this.strm),this.onEnd(u),this.ended=!0,u===a.Z_OK):x!==a.Z_SYNC_FLUSH||(this.onEnd(a.Z_OK),!(D.avail_out=0))},p.prototype.onData=function(d){this.chunks.push(d)},p.prototype.onEnd=function(d){d===a.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=r.flattenChunks(this.chunks)),this.chunks=[],this.err=d,this.msg=this.strm.msg},i.Inflate=p,i.inflate=b,i.inflateRaw=function(d,g){return(g=g||{}).raw=!0,b(d,g)},i.ungzip=b},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(m,e,i){"use strict";var t=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";i.assign=function(a){for(var c=Array.prototype.slice.call(arguments,1);c.length;){var _=c.shift();if(_){if(typeof _!="object")throw new TypeError(_+"must be non-object");for(var w in _)_.hasOwnProperty(w)&&(a[w]=_[w])}}return a},i.shrinkBuf=function(a,c){return a.length===c?a:a.subarray?a.subarray(0,c):(a.length=c,a)};var r={arraySet:function(a,c,_,w,y){if(c.subarray&&a.subarray)a.set(c.subarray(_,_+w),y);else for(var p=0;p<w;p++)a[y+p]=c[_+p]},flattenChunks:function(a){var c,_,w,y,p,b;for(c=w=0,_=a.length;c<_;c++)w+=a[c].length;for(b=new Uint8Array(w),c=y=0,_=a.length;c<_;c++)p=a[c],b.set(p,y),y+=p.length;return b}},n={arraySet:function(a,c,_,w,y){for(var p=0;p<w;p++)a[y+p]=c[_+p]},flattenChunks:function(a){return[].concat.apply([],a)}};i.setTyped=function(a){a?(i.Buf8=Uint8Array,i.Buf16=Uint16Array,i.Buf32=Int32Array,i.assign(i,r)):(i.Buf8=Array,i.Buf16=Array,i.Buf32=Array,i.assign(i,n))},i.setTyped(t)},{}],42:[function(m,e,i){"use strict";var t=m("./common"),r=!0,n=!0;try{String.fromCharCode.apply(null,[0])}catch{r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{n=!1}for(var a=new t.Buf8(256),c=0;c<256;c++)a[c]=252<=c?6:248<=c?5:240<=c?4:224<=c?3:192<=c?2:1;function _(w,y){if(y<65537&&(w.subarray&&n||!w.subarray&&r))return String.fromCharCode.apply(null,t.shrinkBuf(w,y));for(var p="",b=0;b<y;b++)p+=String.fromCharCode(w[b]);return p}a[254]=a[254]=1,i.string2buf=function(w){var y,p,b,d,g,u=w.length,x=0;for(d=0;d<u;d++)(64512&(p=w.charCodeAt(d)))==55296&&d+1<u&&(64512&(b=w.charCodeAt(d+1)))==56320&&(p=65536+(p-55296<<10)+(b-56320),d++),x+=p<128?1:p<2048?2:p<65536?3:4;for(y=new t.Buf8(x),d=g=0;g<x;d++)(64512&(p=w.charCodeAt(d)))==55296&&d+1<u&&(64512&(b=w.charCodeAt(d+1)))==56320&&(p=65536+(p-55296<<10)+(b-56320),d++),p<128?y[g++]=p:(p<2048?y[g++]=192|p>>>6:(p<65536?y[g++]=224|p>>>12:(y[g++]=240|p>>>18,y[g++]=128|p>>>12&63),y[g++]=128|p>>>6&63),y[g++]=128|63&p);return y},i.buf2binstring=function(w){return _(w,w.length)},i.binstring2buf=function(w){for(var y=new t.Buf8(w.length),p=0,b=y.length;p<b;p++)y[p]=w.charCodeAt(p);return y},i.buf2string=function(w,y){var p,b,d,g,u=y||w.length,x=new Array(2*u);for(p=b=0;p<u;)if((d=w[p++])<128)x[b++]=d;else if(4<(g=a[d]))x[b++]=65533,p+=g-1;else{for(d&=g===2?31:g===3?15:7;1<g&&p<u;)d=d<<6|63&w[p++],g--;1<g?x[b++]=65533:d<65536?x[b++]=d:(d-=65536,x[b++]=55296|d>>10&1023,x[b++]=56320|1023&d)}return _(x,b)},i.utf8border=function(w,y){var p;for((y=y||w.length)>w.length&&(y=w.length),p=y-1;0<=p&&(192&w[p])==128;)p--;return p<0||p===0?y:p+a[w[p]]>y?p:y}},{"./common":41}],43:[function(m,e,i){"use strict";e.exports=function(t,r,n,a){for(var c=65535&t|0,_=t>>>16&65535|0,w=0;n!==0;){for(n-=w=2e3<n?2e3:n;_=_+(c=c+r[a++]|0)|0,--w;);c%=65521,_%=65521}return c|_<<16|0}},{}],44:[function(m,e,i){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(m,e,i){"use strict";var t=(function(){for(var r,n=[],a=0;a<256;a++){r=a;for(var c=0;c<8;c++)r=1&r?3988292384^r>>>1:r>>>1;n[a]=r}return n})();e.exports=function(r,n,a,c){var _=t,w=c+a;r^=-1;for(var y=c;y<w;y++)r=r>>>8^_[255&(r^n[y])];return-1^r}},{}],46:[function(m,e,i){"use strict";var t,r=m("../utils/common"),n=m("./trees"),a=m("./adler32"),c=m("./crc32"),_=m("./messages"),w=0,y=4,p=0,b=-2,d=-1,g=4,u=2,x=8,$=9,T=286,z=30,P=19,D=2*T+1,j=15,F=3,W=258,K=W+F+1,k=42,O=113,l=1,I=2,X=3,B=4;function ee(s,L){return s.msg=_[L],L}function U(s){return(s<<1)-(4<s?9:0)}function J(s){for(var L=s.length;0<=--L;)s[L]=0}function A(s){var L=s.state,R=L.pending;R>s.avail_out&&(R=s.avail_out),R!==0&&(r.arraySet(s.output,L.pending_buf,L.pending_out,R,s.next_out),s.next_out+=R,L.pending_out+=R,s.total_out+=R,s.avail_out-=R,L.pending-=R,L.pending===0&&(L.pending_out=0))}function E(s,L){n._tr_flush_block(s,0<=s.block_start?s.block_start:-1,s.strstart-s.block_start,L),s.block_start=s.strstart,A(s.strm)}function Y(s,L){s.pending_buf[s.pending++]=L}function V(s,L){s.pending_buf[s.pending++]=L>>>8&255,s.pending_buf[s.pending++]=255&L}function G(s,L){var R,v,f=s.max_chain_length,S=s.strstart,N=s.prev_length,M=s.nice_match,C=s.strstart>s.w_size-K?s.strstart-(s.w_size-K):0,q=s.window,H=s.w_mask,Z=s.prev,Q=s.strstart+W,ae=q[S+N-1],re=q[S+N];s.prev_length>=s.good_match&&(f>>=2),M>s.lookahead&&(M=s.lookahead);do if(q[(R=L)+N]===re&&q[R+N-1]===ae&&q[R]===q[S]&&q[++R]===q[S+1]){S+=2,R++;do;while(q[++S]===q[++R]&&q[++S]===q[++R]&&q[++S]===q[++R]&&q[++S]===q[++R]&&q[++S]===q[++R]&&q[++S]===q[++R]&&q[++S]===q[++R]&&q[++S]===q[++R]&&S<Q);if(v=W-(Q-S),S=Q-W,N<v){if(s.match_start=L,M<=(N=v))break;ae=q[S+N-1],re=q[S+N]}}while((L=Z[L&H])>C&&--f!=0);return N<=s.lookahead?N:s.lookahead}function se(s){var L,R,v,f,S,N,M,C,q,H,Z=s.w_size;do{if(f=s.window_size-s.lookahead-s.strstart,s.strstart>=Z+(Z-K)){for(r.arraySet(s.window,s.window,Z,Z,0),s.match_start-=Z,s.strstart-=Z,s.block_start-=Z,L=R=s.hash_size;v=s.head[--L],s.head[L]=Z<=v?v-Z:0,--R;);for(L=R=Z;v=s.prev[--L],s.prev[L]=Z<=v?v-Z:0,--R;);f+=Z}if(s.strm.avail_in===0)break;if(N=s.strm,M=s.window,C=s.strstart+s.lookahead,q=f,H=void 0,H=N.avail_in,q<H&&(H=q),R=H===0?0:(N.avail_in-=H,r.arraySet(M,N.input,N.next_in,H,C),N.state.wrap===1?N.adler=a(N.adler,M,H,C):N.state.wrap===2&&(N.adler=c(N.adler,M,H,C)),N.next_in+=H,N.total_in+=H,H),s.lookahead+=R,s.lookahead+s.insert>=F)for(S=s.strstart-s.insert,s.ins_h=s.window[S],s.ins_h=(s.ins_h<<s.hash_shift^s.window[S+1])&s.hash_mask;s.insert&&(s.ins_h=(s.ins_h<<s.hash_shift^s.window[S+F-1])&s.hash_mask,s.prev[S&s.w_mask]=s.head[s.ins_h],s.head[s.ins_h]=S,S++,s.insert--,!(s.lookahead+s.insert<F)););}while(s.lookahead<K&&s.strm.avail_in!==0)}function de(s,L){for(var R,v;;){if(s.lookahead<K){if(se(s),s.lookahead<K&&L===w)return l;if(s.lookahead===0)break}if(R=0,s.lookahead>=F&&(s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+F-1])&s.hash_mask,R=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h],s.head[s.ins_h]=s.strstart),R!==0&&s.strstart-R<=s.w_size-K&&(s.match_length=G(s,R)),s.match_length>=F)if(v=n._tr_tally(s,s.strstart-s.match_start,s.match_length-F),s.lookahead-=s.match_length,s.match_length<=s.max_lazy_match&&s.lookahead>=F){for(s.match_length--;s.strstart++,s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+F-1])&s.hash_mask,R=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h],s.head[s.ins_h]=s.strstart,--s.match_length!=0;);s.strstart++}else s.strstart+=s.match_length,s.match_length=0,s.ins_h=s.window[s.strstart],s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+1])&s.hash_mask;else v=n._tr_tally(s,0,s.window[s.strstart]),s.lookahead--,s.strstart++;if(v&&(E(s,!1),s.strm.avail_out===0))return l}return s.insert=s.strstart<F-1?s.strstart:F-1,L===y?(E(s,!0),s.strm.avail_out===0?X:B):s.last_lit&&(E(s,!1),s.strm.avail_out===0)?l:I}function ie(s,L){for(var R,v,f;;){if(s.lookahead<K){if(se(s),s.lookahead<K&&L===w)return l;if(s.lookahead===0)break}if(R=0,s.lookahead>=F&&(s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+F-1])&s.hash_mask,R=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h],s.head[s.ins_h]=s.strstart),s.prev_length=s.match_length,s.prev_match=s.match_start,s.match_length=F-1,R!==0&&s.prev_length<s.max_lazy_match&&s.strstart-R<=s.w_size-K&&(s.match_length=G(s,R),s.match_length<=5&&(s.strategy===1||s.match_length===F&&4096<s.strstart-s.match_start)&&(s.match_length=F-1)),s.prev_length>=F&&s.match_length<=s.prev_length){for(f=s.strstart+s.lookahead-F,v=n._tr_tally(s,s.strstart-1-s.prev_match,s.prev_length-F),s.lookahead-=s.prev_length-1,s.prev_length-=2;++s.strstart<=f&&(s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+F-1])&s.hash_mask,R=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h],s.head[s.ins_h]=s.strstart),--s.prev_length!=0;);if(s.match_available=0,s.match_length=F-1,s.strstart++,v&&(E(s,!1),s.strm.avail_out===0))return l}else if(s.match_available){if((v=n._tr_tally(s,0,s.window[s.strstart-1]))&&E(s,!1),s.strstart++,s.lookahead--,s.strm.avail_out===0)return l}else s.match_available=1,s.strstart++,s.lookahead--}return s.match_available&&(v=n._tr_tally(s,0,s.window[s.strstart-1]),s.match_available=0),s.insert=s.strstart<F-1?s.strstart:F-1,L===y?(E(s,!0),s.strm.avail_out===0?X:B):s.last_lit&&(E(s,!1),s.strm.avail_out===0)?l:I}function ne(s,L,R,v,f){this.good_length=s,this.max_lazy=L,this.nice_length=R,this.max_chain=v,this.func=f}function ce(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=x,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new r.Buf16(2*D),this.dyn_dtree=new r.Buf16(2*(2*z+1)),this.bl_tree=new r.Buf16(2*(2*P+1)),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new r.Buf16(j+1),this.heap=new r.Buf16(2*T+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new r.Buf16(2*T+1),J(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function oe(s){var L;return s&&s.state?(s.total_in=s.total_out=0,s.data_type=u,(L=s.state).pending=0,L.pending_out=0,L.wrap<0&&(L.wrap=-L.wrap),L.status=L.wrap?k:O,s.adler=L.wrap===2?0:1,L.last_flush=w,n._tr_init(L),p):ee(s,b)}function fe(s){var L=oe(s);return L===p&&(function(R){R.window_size=2*R.w_size,J(R.head),R.max_lazy_match=t[R.level].max_lazy,R.good_match=t[R.level].good_length,R.nice_match=t[R.level].nice_length,R.max_chain_length=t[R.level].max_chain,R.strstart=0,R.block_start=0,R.lookahead=0,R.insert=0,R.match_length=R.prev_length=F-1,R.match_available=0,R.ins_h=0})(s.state),L}function me(s,L,R,v,f,S){if(!s)return b;var N=1;if(L===d&&(L=6),v<0?(N=0,v=-v):15<v&&(N=2,v-=16),f<1||$<f||R!==x||v<8||15<v||L<0||9<L||S<0||g<S)return ee(s,b);v===8&&(v=9);var M=new ce;return(s.state=M).strm=s,M.wrap=N,M.gzhead=null,M.w_bits=v,M.w_size=1<<M.w_bits,M.w_mask=M.w_size-1,M.hash_bits=f+7,M.hash_size=1<<M.hash_bits,M.hash_mask=M.hash_size-1,M.hash_shift=~~((M.hash_bits+F-1)/F),M.window=new r.Buf8(2*M.w_size),M.head=new r.Buf16(M.hash_size),M.prev=new r.Buf16(M.w_size),M.lit_bufsize=1<<f+6,M.pending_buf_size=4*M.lit_bufsize,M.pending_buf=new r.Buf8(M.pending_buf_size),M.d_buf=1*M.lit_bufsize,M.l_buf=3*M.lit_bufsize,M.level=L,M.strategy=S,M.method=R,fe(s)}t=[new ne(0,0,0,0,function(s,L){var R=65535;for(R>s.pending_buf_size-5&&(R=s.pending_buf_size-5);;){if(s.lookahead<=1){if(se(s),s.lookahead===0&&L===w)return l;if(s.lookahead===0)break}s.strstart+=s.lookahead,s.lookahead=0;var v=s.block_start+R;if((s.strstart===0||s.strstart>=v)&&(s.lookahead=s.strstart-v,s.strstart=v,E(s,!1),s.strm.avail_out===0)||s.strstart-s.block_start>=s.w_size-K&&(E(s,!1),s.strm.avail_out===0))return l}return s.insert=0,L===y?(E(s,!0),s.strm.avail_out===0?X:B):(s.strstart>s.block_start&&(E(s,!1),s.strm.avail_out),l)}),new ne(4,4,8,4,de),new ne(4,5,16,8,de),new ne(4,6,32,32,de),new ne(4,4,16,16,ie),new ne(8,16,32,32,ie),new ne(8,16,128,128,ie),new ne(8,32,128,256,ie),new ne(32,128,258,1024,ie),new ne(32,258,258,4096,ie)],i.deflateInit=function(s,L){return me(s,L,x,15,8,0)},i.deflateInit2=me,i.deflateReset=fe,i.deflateResetKeep=oe,i.deflateSetHeader=function(s,L){return s&&s.state?s.state.wrap!==2?b:(s.state.gzhead=L,p):b},i.deflate=function(s,L){var R,v,f,S;if(!s||!s.state||5<L||L<0)return s?ee(s,b):b;if(v=s.state,!s.output||!s.input&&s.avail_in!==0||v.status===666&&L!==y)return ee(s,s.avail_out===0?-5:b);if(v.strm=s,R=v.last_flush,v.last_flush=L,v.status===k)if(v.wrap===2)s.adler=0,Y(v,31),Y(v,139),Y(v,8),v.gzhead?(Y(v,(v.gzhead.text?1:0)+(v.gzhead.hcrc?2:0)+(v.gzhead.extra?4:0)+(v.gzhead.name?8:0)+(v.gzhead.comment?16:0)),Y(v,255&v.gzhead.time),Y(v,v.gzhead.time>>8&255),Y(v,v.gzhead.time>>16&255),Y(v,v.gzhead.time>>24&255),Y(v,v.level===9?2:2<=v.strategy||v.level<2?4:0),Y(v,255&v.gzhead.os),v.gzhead.extra&&v.gzhead.extra.length&&(Y(v,255&v.gzhead.extra.length),Y(v,v.gzhead.extra.length>>8&255)),v.gzhead.hcrc&&(s.adler=c(s.adler,v.pending_buf,v.pending,0)),v.gzindex=0,v.status=69):(Y(v,0),Y(v,0),Y(v,0),Y(v,0),Y(v,0),Y(v,v.level===9?2:2<=v.strategy||v.level<2?4:0),Y(v,3),v.status=O);else{var N=x+(v.w_bits-8<<4)<<8;N|=(2<=v.strategy||v.level<2?0:v.level<6?1:v.level===6?2:3)<<6,v.strstart!==0&&(N|=32),N+=31-N%31,v.status=O,V(v,N),v.strstart!==0&&(V(v,s.adler>>>16),V(v,65535&s.adler)),s.adler=1}if(v.status===69)if(v.gzhead.extra){for(f=v.pending;v.gzindex<(65535&v.gzhead.extra.length)&&(v.pending!==v.pending_buf_size||(v.gzhead.hcrc&&v.pending>f&&(s.adler=c(s.adler,v.pending_buf,v.pending-f,f)),A(s),f=v.pending,v.pending!==v.pending_buf_size));)Y(v,255&v.gzhead.extra[v.gzindex]),v.gzindex++;v.gzhead.hcrc&&v.pending>f&&(s.adler=c(s.adler,v.pending_buf,v.pending-f,f)),v.gzindex===v.gzhead.extra.length&&(v.gzindex=0,v.status=73)}else v.status=73;if(v.status===73)if(v.gzhead.name){f=v.pending;do{if(v.pending===v.pending_buf_size&&(v.gzhead.hcrc&&v.pending>f&&(s.adler=c(s.adler,v.pending_buf,v.pending-f,f)),A(s),f=v.pending,v.pending===v.pending_buf_size)){S=1;break}S=v.gzindex<v.gzhead.name.length?255&v.gzhead.name.charCodeAt(v.gzindex++):0,Y(v,S)}while(S!==0);v.gzhead.hcrc&&v.pending>f&&(s.adler=c(s.adler,v.pending_buf,v.pending-f,f)),S===0&&(v.gzindex=0,v.status=91)}else v.status=91;if(v.status===91)if(v.gzhead.comment){f=v.pending;do{if(v.pending===v.pending_buf_size&&(v.gzhead.hcrc&&v.pending>f&&(s.adler=c(s.adler,v.pending_buf,v.pending-f,f)),A(s),f=v.pending,v.pending===v.pending_buf_size)){S=1;break}S=v.gzindex<v.gzhead.comment.length?255&v.gzhead.comment.charCodeAt(v.gzindex++):0,Y(v,S)}while(S!==0);v.gzhead.hcrc&&v.pending>f&&(s.adler=c(s.adler,v.pending_buf,v.pending-f,f)),S===0&&(v.status=103)}else v.status=103;if(v.status===103&&(v.gzhead.hcrc?(v.pending+2>v.pending_buf_size&&A(s),v.pending+2<=v.pending_buf_size&&(Y(v,255&s.adler),Y(v,s.adler>>8&255),s.adler=0,v.status=O)):v.status=O),v.pending!==0){if(A(s),s.avail_out===0)return v.last_flush=-1,p}else if(s.avail_in===0&&U(L)<=U(R)&&L!==y)return ee(s,-5);if(v.status===666&&s.avail_in!==0)return ee(s,-5);if(s.avail_in!==0||v.lookahead!==0||L!==w&&v.status!==666){var M=v.strategy===2?(function(C,q){for(var H;;){if(C.lookahead===0&&(se(C),C.lookahead===0)){if(q===w)return l;break}if(C.match_length=0,H=n._tr_tally(C,0,C.window[C.strstart]),C.lookahead--,C.strstart++,H&&(E(C,!1),C.strm.avail_out===0))return l}return C.insert=0,q===y?(E(C,!0),C.strm.avail_out===0?X:B):C.last_lit&&(E(C,!1),C.strm.avail_out===0)?l:I})(v,L):v.strategy===3?(function(C,q){for(var H,Z,Q,ae,re=C.window;;){if(C.lookahead<=W){if(se(C),C.lookahead<=W&&q===w)return l;if(C.lookahead===0)break}if(C.match_length=0,C.lookahead>=F&&0<C.strstart&&(Z=re[Q=C.strstart-1])===re[++Q]&&Z===re[++Q]&&Z===re[++Q]){ae=C.strstart+W;do;while(Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Z===re[++Q]&&Q<ae);C.match_length=W-(ae-Q),C.match_length>C.lookahead&&(C.match_length=C.lookahead)}if(C.match_length>=F?(H=n._tr_tally(C,1,C.match_length-F),C.lookahead-=C.match_length,C.strstart+=C.match_length,C.match_length=0):(H=n._tr_tally(C,0,C.window[C.strstart]),C.lookahead--,C.strstart++),H&&(E(C,!1),C.strm.avail_out===0))return l}return C.insert=0,q===y?(E(C,!0),C.strm.avail_out===0?X:B):C.last_lit&&(E(C,!1),C.strm.avail_out===0)?l:I})(v,L):t[v.level].func(v,L);if(M!==X&&M!==B||(v.status=666),M===l||M===X)return s.avail_out===0&&(v.last_flush=-1),p;if(M===I&&(L===1?n._tr_align(v):L!==5&&(n._tr_stored_block(v,0,0,!1),L===3&&(J(v.head),v.lookahead===0&&(v.strstart=0,v.block_start=0,v.insert=0))),A(s),s.avail_out===0))return v.last_flush=-1,p}return L!==y?p:v.wrap<=0?1:(v.wrap===2?(Y(v,255&s.adler),Y(v,s.adler>>8&255),Y(v,s.adler>>16&255),Y(v,s.adler>>24&255),Y(v,255&s.total_in),Y(v,s.total_in>>8&255),Y(v,s.total_in>>16&255),Y(v,s.total_in>>24&255)):(V(v,s.adler>>>16),V(v,65535&s.adler)),A(s),0<v.wrap&&(v.wrap=-v.wrap),v.pending!==0?p:1)},i.deflateEnd=function(s){var L;return s&&s.state?(L=s.state.status)!==k&&L!==69&&L!==73&&L!==91&&L!==103&&L!==O&&L!==666?ee(s,b):(s.state=null,L===O?ee(s,-3):p):b},i.deflateSetDictionary=function(s,L){var R,v,f,S,N,M,C,q,H=L.length;if(!s||!s.state||(S=(R=s.state).wrap)===2||S===1&&R.status!==k||R.lookahead)return b;for(S===1&&(s.adler=a(s.adler,L,H,0)),R.wrap=0,H>=R.w_size&&(S===0&&(J(R.head),R.strstart=0,R.block_start=0,R.insert=0),q=new r.Buf8(R.w_size),r.arraySet(q,L,H-R.w_size,R.w_size,0),L=q,H=R.w_size),N=s.avail_in,M=s.next_in,C=s.input,s.avail_in=H,s.next_in=0,s.input=L,se(R);R.lookahead>=F;){for(v=R.strstart,f=R.lookahead-(F-1);R.ins_h=(R.ins_h<<R.hash_shift^R.window[v+F-1])&R.hash_mask,R.prev[v&R.w_mask]=R.head[R.ins_h],R.head[R.ins_h]=v,v++,--f;);R.strstart=v,R.lookahead=F-1,se(R)}return R.strstart+=R.lookahead,R.block_start=R.strstart,R.insert=R.lookahead,R.lookahead=0,R.match_length=R.prev_length=F-1,R.match_available=0,s.next_in=M,s.input=C,s.avail_in=N,R.wrap=S,p},i.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(m,e,i){"use strict";e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(m,e,i){"use strict";e.exports=function(t,r){var n,a,c,_,w,y,p,b,d,g,u,x,$,T,z,P,D,j,F,W,K,k,O,l,I;n=t.state,a=t.next_in,l=t.input,c=a+(t.avail_in-5),_=t.next_out,I=t.output,w=_-(r-t.avail_out),y=_+(t.avail_out-257),p=n.dmax,b=n.wsize,d=n.whave,g=n.wnext,u=n.window,x=n.hold,$=n.bits,T=n.lencode,z=n.distcode,P=(1<<n.lenbits)-1,D=(1<<n.distbits)-1;e:do{$<15&&(x+=l[a++]<<$,$+=8,x+=l[a++]<<$,$+=8),j=T[x&P];t:for(;;){if(x>>>=F=j>>>24,$-=F,(F=j>>>16&255)===0)I[_++]=65535&j;else{if(!(16&F)){if((64&F)==0){j=T[(65535&j)+(x&(1<<F)-1)];continue t}if(32&F){n.mode=12;break e}t.msg="invalid literal/length code",n.mode=30;break e}W=65535&j,(F&=15)&&($<F&&(x+=l[a++]<<$,$+=8),W+=x&(1<<F)-1,x>>>=F,$-=F),$<15&&(x+=l[a++]<<$,$+=8,x+=l[a++]<<$,$+=8),j=z[x&D];i:for(;;){if(x>>>=F=j>>>24,$-=F,!(16&(F=j>>>16&255))){if((64&F)==0){j=z[(65535&j)+(x&(1<<F)-1)];continue i}t.msg="invalid distance code",n.mode=30;break e}if(K=65535&j,$<(F&=15)&&(x+=l[a++]<<$,($+=8)<F&&(x+=l[a++]<<$,$+=8)),p<(K+=x&(1<<F)-1)){t.msg="invalid distance too far back",n.mode=30;break e}if(x>>>=F,$-=F,(F=_-w)<K){if(d<(F=K-F)&&n.sane){t.msg="invalid distance too far back",n.mode=30;break e}if(O=u,(k=0)===g){if(k+=b-F,F<W){for(W-=F;I[_++]=u[k++],--F;);k=_-K,O=I}}else if(g<F){if(k+=b+g-F,(F-=g)<W){for(W-=F;I[_++]=u[k++],--F;);if(k=0,g<W){for(W-=F=g;I[_++]=u[k++],--F;);k=_-K,O=I}}}else if(k+=g-F,F<W){for(W-=F;I[_++]=u[k++],--F;);k=_-K,O=I}for(;2<W;)I[_++]=O[k++],I[_++]=O[k++],I[_++]=O[k++],W-=3;W&&(I[_++]=O[k++],1<W&&(I[_++]=O[k++]))}else{for(k=_-K;I[_++]=I[k++],I[_++]=I[k++],I[_++]=I[k++],2<(W-=3););W&&(I[_++]=I[k++],1<W&&(I[_++]=I[k++]))}break}}break}}while(a<c&&_<y);a-=W=$>>3,x&=(1<<($-=W<<3))-1,t.next_in=a,t.next_out=_,t.avail_in=a<c?c-a+5:5-(a-c),t.avail_out=_<y?y-_+257:257-(_-y),n.hold=x,n.bits=$}},{}],49:[function(m,e,i){"use strict";var t=m("../utils/common"),r=m("./adler32"),n=m("./crc32"),a=m("./inffast"),c=m("./inftrees"),_=1,w=2,y=0,p=-2,b=1,d=852,g=592;function u(k){return(k>>>24&255)+(k>>>8&65280)+((65280&k)<<8)+((255&k)<<24)}function x(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new t.Buf16(320),this.work=new t.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function $(k){var O;return k&&k.state?(O=k.state,k.total_in=k.total_out=O.total=0,k.msg="",O.wrap&&(k.adler=1&O.wrap),O.mode=b,O.last=0,O.havedict=0,O.dmax=32768,O.head=null,O.hold=0,O.bits=0,O.lencode=O.lendyn=new t.Buf32(d),O.distcode=O.distdyn=new t.Buf32(g),O.sane=1,O.back=-1,y):p}function T(k){var O;return k&&k.state?((O=k.state).wsize=0,O.whave=0,O.wnext=0,$(k)):p}function z(k,O){var l,I;return k&&k.state?(I=k.state,O<0?(l=0,O=-O):(l=1+(O>>4),O<48&&(O&=15)),O&&(O<8||15<O)?p:(I.window!==null&&I.wbits!==O&&(I.window=null),I.wrap=l,I.wbits=O,T(k))):p}function P(k,O){var l,I;return k?(I=new x,(k.state=I).window=null,(l=z(k,O))!==y&&(k.state=null),l):p}var D,j,F=!0;function W(k){if(F){var O;for(D=new t.Buf32(512),j=new t.Buf32(32),O=0;O<144;)k.lens[O++]=8;for(;O<256;)k.lens[O++]=9;for(;O<280;)k.lens[O++]=7;for(;O<288;)k.lens[O++]=8;for(c(_,k.lens,0,288,D,0,k.work,{bits:9}),O=0;O<32;)k.lens[O++]=5;c(w,k.lens,0,32,j,0,k.work,{bits:5}),F=!1}k.lencode=D,k.lenbits=9,k.distcode=j,k.distbits=5}function K(k,O,l,I){var X,B=k.state;return B.window===null&&(B.wsize=1<<B.wbits,B.wnext=0,B.whave=0,B.window=new t.Buf8(B.wsize)),I>=B.wsize?(t.arraySet(B.window,O,l-B.wsize,B.wsize,0),B.wnext=0,B.whave=B.wsize):(I<(X=B.wsize-B.wnext)&&(X=I),t.arraySet(B.window,O,l-I,X,B.wnext),(I-=X)?(t.arraySet(B.window,O,l-I,I,0),B.wnext=I,B.whave=B.wsize):(B.wnext+=X,B.wnext===B.wsize&&(B.wnext=0),B.whave<B.wsize&&(B.whave+=X))),0}i.inflateReset=T,i.inflateReset2=z,i.inflateResetKeep=$,i.inflateInit=function(k){return P(k,15)},i.inflateInit2=P,i.inflate=function(k,O){var l,I,X,B,ee,U,J,A,E,Y,V,G,se,de,ie,ne,ce,oe,fe,me,s,L,R,v,f=0,S=new t.Buf8(4),N=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!k||!k.state||!k.output||!k.input&&k.avail_in!==0)return p;(l=k.state).mode===12&&(l.mode=13),ee=k.next_out,X=k.output,J=k.avail_out,B=k.next_in,I=k.input,U=k.avail_in,A=l.hold,E=l.bits,Y=U,V=J,L=y;e:for(;;)switch(l.mode){case b:if(l.wrap===0){l.mode=13;break}for(;E<16;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(2&l.wrap&&A===35615){S[l.check=0]=255&A,S[1]=A>>>8&255,l.check=n(l.check,S,2,0),E=A=0,l.mode=2;break}if(l.flags=0,l.head&&(l.head.done=!1),!(1&l.wrap)||(((255&A)<<8)+(A>>8))%31){k.msg="incorrect header check",l.mode=30;break}if((15&A)!=8){k.msg="unknown compression method",l.mode=30;break}if(E-=4,s=8+(15&(A>>>=4)),l.wbits===0)l.wbits=s;else if(s>l.wbits){k.msg="invalid window size",l.mode=30;break}l.dmax=1<<s,k.adler=l.check=1,l.mode=512&A?10:12,E=A=0;break;case 2:for(;E<16;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(l.flags=A,(255&l.flags)!=8){k.msg="unknown compression method",l.mode=30;break}if(57344&l.flags){k.msg="unknown header flags set",l.mode=30;break}l.head&&(l.head.text=A>>8&1),512&l.flags&&(S[0]=255&A,S[1]=A>>>8&255,l.check=n(l.check,S,2,0)),E=A=0,l.mode=3;case 3:for(;E<32;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}l.head&&(l.head.time=A),512&l.flags&&(S[0]=255&A,S[1]=A>>>8&255,S[2]=A>>>16&255,S[3]=A>>>24&255,l.check=n(l.check,S,4,0)),E=A=0,l.mode=4;case 4:for(;E<16;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}l.head&&(l.head.xflags=255&A,l.head.os=A>>8),512&l.flags&&(S[0]=255&A,S[1]=A>>>8&255,l.check=n(l.check,S,2,0)),E=A=0,l.mode=5;case 5:if(1024&l.flags){for(;E<16;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}l.length=A,l.head&&(l.head.extra_len=A),512&l.flags&&(S[0]=255&A,S[1]=A>>>8&255,l.check=n(l.check,S,2,0)),E=A=0}else l.head&&(l.head.extra=null);l.mode=6;case 6:if(1024&l.flags&&(U<(G=l.length)&&(G=U),G&&(l.head&&(s=l.head.extra_len-l.length,l.head.extra||(l.head.extra=new Array(l.head.extra_len)),t.arraySet(l.head.extra,I,B,G,s)),512&l.flags&&(l.check=n(l.check,I,G,B)),U-=G,B+=G,l.length-=G),l.length))break e;l.length=0,l.mode=7;case 7:if(2048&l.flags){if(U===0)break e;for(G=0;s=I[B+G++],l.head&&s&&l.length<65536&&(l.head.name+=String.fromCharCode(s)),s&&G<U;);if(512&l.flags&&(l.check=n(l.check,I,G,B)),U-=G,B+=G,s)break e}else l.head&&(l.head.name=null);l.length=0,l.mode=8;case 8:if(4096&l.flags){if(U===0)break e;for(G=0;s=I[B+G++],l.head&&s&&l.length<65536&&(l.head.comment+=String.fromCharCode(s)),s&&G<U;);if(512&l.flags&&(l.check=n(l.check,I,G,B)),U-=G,B+=G,s)break e}else l.head&&(l.head.comment=null);l.mode=9;case 9:if(512&l.flags){for(;E<16;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(A!==(65535&l.check)){k.msg="header crc mismatch",l.mode=30;break}E=A=0}l.head&&(l.head.hcrc=l.flags>>9&1,l.head.done=!0),k.adler=l.check=0,l.mode=12;break;case 10:for(;E<32;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}k.adler=l.check=u(A),E=A=0,l.mode=11;case 11:if(l.havedict===0)return k.next_out=ee,k.avail_out=J,k.next_in=B,k.avail_in=U,l.hold=A,l.bits=E,2;k.adler=l.check=1,l.mode=12;case 12:if(O===5||O===6)break e;case 13:if(l.last){A>>>=7&E,E-=7&E,l.mode=27;break}for(;E<3;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}switch(l.last=1&A,E-=1,3&(A>>>=1)){case 0:l.mode=14;break;case 1:if(W(l),l.mode=20,O!==6)break;A>>>=2,E-=2;break e;case 2:l.mode=17;break;case 3:k.msg="invalid block type",l.mode=30}A>>>=2,E-=2;break;case 14:for(A>>>=7&E,E-=7&E;E<32;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if((65535&A)!=(A>>>16^65535)){k.msg="invalid stored block lengths",l.mode=30;break}if(l.length=65535&A,E=A=0,l.mode=15,O===6)break e;case 15:l.mode=16;case 16:if(G=l.length){if(U<G&&(G=U),J<G&&(G=J),G===0)break e;t.arraySet(X,I,B,G,ee),U-=G,B+=G,J-=G,ee+=G,l.length-=G;break}l.mode=12;break;case 17:for(;E<14;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(l.nlen=257+(31&A),A>>>=5,E-=5,l.ndist=1+(31&A),A>>>=5,E-=5,l.ncode=4+(15&A),A>>>=4,E-=4,286<l.nlen||30<l.ndist){k.msg="too many length or distance symbols",l.mode=30;break}l.have=0,l.mode=18;case 18:for(;l.have<l.ncode;){for(;E<3;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}l.lens[N[l.have++]]=7&A,A>>>=3,E-=3}for(;l.have<19;)l.lens[N[l.have++]]=0;if(l.lencode=l.lendyn,l.lenbits=7,R={bits:l.lenbits},L=c(0,l.lens,0,19,l.lencode,0,l.work,R),l.lenbits=R.bits,L){k.msg="invalid code lengths set",l.mode=30;break}l.have=0,l.mode=19;case 19:for(;l.have<l.nlen+l.ndist;){for(;ne=(f=l.lencode[A&(1<<l.lenbits)-1])>>>16&255,ce=65535&f,!((ie=f>>>24)<=E);){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(ce<16)A>>>=ie,E-=ie,l.lens[l.have++]=ce;else{if(ce===16){for(v=ie+2;E<v;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(A>>>=ie,E-=ie,l.have===0){k.msg="invalid bit length repeat",l.mode=30;break}s=l.lens[l.have-1],G=3+(3&A),A>>>=2,E-=2}else if(ce===17){for(v=ie+3;E<v;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}E-=ie,s=0,G=3+(7&(A>>>=ie)),A>>>=3,E-=3}else{for(v=ie+7;E<v;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}E-=ie,s=0,G=11+(127&(A>>>=ie)),A>>>=7,E-=7}if(l.have+G>l.nlen+l.ndist){k.msg="invalid bit length repeat",l.mode=30;break}for(;G--;)l.lens[l.have++]=s}}if(l.mode===30)break;if(l.lens[256]===0){k.msg="invalid code -- missing end-of-block",l.mode=30;break}if(l.lenbits=9,R={bits:l.lenbits},L=c(_,l.lens,0,l.nlen,l.lencode,0,l.work,R),l.lenbits=R.bits,L){k.msg="invalid literal/lengths set",l.mode=30;break}if(l.distbits=6,l.distcode=l.distdyn,R={bits:l.distbits},L=c(w,l.lens,l.nlen,l.ndist,l.distcode,0,l.work,R),l.distbits=R.bits,L){k.msg="invalid distances set",l.mode=30;break}if(l.mode=20,O===6)break e;case 20:l.mode=21;case 21:if(6<=U&&258<=J){k.next_out=ee,k.avail_out=J,k.next_in=B,k.avail_in=U,l.hold=A,l.bits=E,a(k,V),ee=k.next_out,X=k.output,J=k.avail_out,B=k.next_in,I=k.input,U=k.avail_in,A=l.hold,E=l.bits,l.mode===12&&(l.back=-1);break}for(l.back=0;ne=(f=l.lencode[A&(1<<l.lenbits)-1])>>>16&255,ce=65535&f,!((ie=f>>>24)<=E);){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(ne&&(240&ne)==0){for(oe=ie,fe=ne,me=ce;ne=(f=l.lencode[me+((A&(1<<oe+fe)-1)>>oe)])>>>16&255,ce=65535&f,!(oe+(ie=f>>>24)<=E);){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}A>>>=oe,E-=oe,l.back+=oe}if(A>>>=ie,E-=ie,l.back+=ie,l.length=ce,ne===0){l.mode=26;break}if(32&ne){l.back=-1,l.mode=12;break}if(64&ne){k.msg="invalid literal/length code",l.mode=30;break}l.extra=15&ne,l.mode=22;case 22:if(l.extra){for(v=l.extra;E<v;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}l.length+=A&(1<<l.extra)-1,A>>>=l.extra,E-=l.extra,l.back+=l.extra}l.was=l.length,l.mode=23;case 23:for(;ne=(f=l.distcode[A&(1<<l.distbits)-1])>>>16&255,ce=65535&f,!((ie=f>>>24)<=E);){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if((240&ne)==0){for(oe=ie,fe=ne,me=ce;ne=(f=l.distcode[me+((A&(1<<oe+fe)-1)>>oe)])>>>16&255,ce=65535&f,!(oe+(ie=f>>>24)<=E);){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}A>>>=oe,E-=oe,l.back+=oe}if(A>>>=ie,E-=ie,l.back+=ie,64&ne){k.msg="invalid distance code",l.mode=30;break}l.offset=ce,l.extra=15&ne,l.mode=24;case 24:if(l.extra){for(v=l.extra;E<v;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}l.offset+=A&(1<<l.extra)-1,A>>>=l.extra,E-=l.extra,l.back+=l.extra}if(l.offset>l.dmax){k.msg="invalid distance too far back",l.mode=30;break}l.mode=25;case 25:if(J===0)break e;if(G=V-J,l.offset>G){if((G=l.offset-G)>l.whave&&l.sane){k.msg="invalid distance too far back",l.mode=30;break}se=G>l.wnext?(G-=l.wnext,l.wsize-G):l.wnext-G,G>l.length&&(G=l.length),de=l.window}else de=X,se=ee-l.offset,G=l.length;for(J<G&&(G=J),J-=G,l.length-=G;X[ee++]=de[se++],--G;);l.length===0&&(l.mode=21);break;case 26:if(J===0)break e;X[ee++]=l.length,J--,l.mode=21;break;case 27:if(l.wrap){for(;E<32;){if(U===0)break e;U--,A|=I[B++]<<E,E+=8}if(V-=J,k.total_out+=V,l.total+=V,V&&(k.adler=l.check=l.flags?n(l.check,X,V,ee-V):r(l.check,X,V,ee-V)),V=J,(l.flags?A:u(A))!==l.check){k.msg="incorrect data check",l.mode=30;break}E=A=0}l.mode=28;case 28:if(l.wrap&&l.flags){for(;E<32;){if(U===0)break e;U--,A+=I[B++]<<E,E+=8}if(A!==(4294967295&l.total)){k.msg="incorrect length check",l.mode=30;break}E=A=0}l.mode=29;case 29:L=1;break e;case 30:L=-3;break e;case 31:return-4;case 32:default:return p}return k.next_out=ee,k.avail_out=J,k.next_in=B,k.avail_in=U,l.hold=A,l.bits=E,(l.wsize||V!==k.avail_out&&l.mode<30&&(l.mode<27||O!==4))&&K(k,k.output,k.next_out,V-k.avail_out)?(l.mode=31,-4):(Y-=k.avail_in,V-=k.avail_out,k.total_in+=Y,k.total_out+=V,l.total+=V,l.wrap&&V&&(k.adler=l.check=l.flags?n(l.check,X,V,k.next_out-V):r(l.check,X,V,k.next_out-V)),k.data_type=l.bits+(l.last?64:0)+(l.mode===12?128:0)+(l.mode===20||l.mode===15?256:0),(Y==0&&V===0||O===4)&&L===y&&(L=-5),L)},i.inflateEnd=function(k){if(!k||!k.state)return p;var O=k.state;return O.window&&(O.window=null),k.state=null,y},i.inflateGetHeader=function(k,O){var l;return k&&k.state?(2&(l=k.state).wrap)==0?p:((l.head=O).done=!1,y):p},i.inflateSetDictionary=function(k,O){var l,I=O.length;return k&&k.state?(l=k.state).wrap!==0&&l.mode!==11?p:l.mode===11&&r(1,O,I,0)!==l.check?-3:K(k,O,I,I)?(l.mode=31,-4):(l.havedict=1,y):p},i.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(m,e,i){"use strict";var t=m("../utils/common"),r=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],n=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],a=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],c=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(_,w,y,p,b,d,g,u){var x,$,T,z,P,D,j,F,W,K=u.bits,k=0,O=0,l=0,I=0,X=0,B=0,ee=0,U=0,J=0,A=0,E=null,Y=0,V=new t.Buf16(16),G=new t.Buf16(16),se=null,de=0;for(k=0;k<=15;k++)V[k]=0;for(O=0;O<p;O++)V[w[y+O]]++;for(X=K,I=15;1<=I&&V[I]===0;I--);if(I<X&&(X=I),I===0)return b[d++]=20971520,b[d++]=20971520,u.bits=1,0;for(l=1;l<I&&V[l]===0;l++);for(X<l&&(X=l),k=U=1;k<=15;k++)if(U<<=1,(U-=V[k])<0)return-1;if(0<U&&(_===0||I!==1))return-1;for(G[1]=0,k=1;k<15;k++)G[k+1]=G[k]+V[k];for(O=0;O<p;O++)w[y+O]!==0&&(g[G[w[y+O]]++]=O);if(D=_===0?(E=se=g,19):_===1?(E=r,Y-=257,se=n,de-=257,256):(E=a,se=c,-1),k=l,P=d,ee=O=A=0,T=-1,z=(J=1<<(B=X))-1,_===1&&852<J||_===2&&592<J)return 1;for(;;){for(j=k-ee,W=g[O]<D?(F=0,g[O]):g[O]>D?(F=se[de+g[O]],E[Y+g[O]]):(F=96,0),x=1<<k-ee,l=$=1<<B;b[P+(A>>ee)+($-=x)]=j<<24|F<<16|W|0,$!==0;);for(x=1<<k-1;A&x;)x>>=1;if(x!==0?(A&=x-1,A+=x):A=0,O++,--V[k]==0){if(k===I)break;k=w[y+g[O]]}if(X<k&&(A&z)!==T){for(ee===0&&(ee=X),P+=l,U=1<<(B=k-ee);B+ee<I&&!((U-=V[B+ee])<=0);)B++,U<<=1;if(J+=1<<B,_===1&&852<J||_===2&&592<J)return 1;b[T=A&z]=X<<24|B<<16|P-d|0}}return A!==0&&(b[P+A]=k-ee<<24|64<<16|0),u.bits=X,0}},{"../utils/common":41}],51:[function(m,e,i){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(m,e,i){"use strict";var t=m("../utils/common"),r=0,n=1;function a(f){for(var S=f.length;0<=--S;)f[S]=0}var c=0,_=29,w=256,y=w+1+_,p=30,b=19,d=2*y+1,g=15,u=16,x=7,$=256,T=16,z=17,P=18,D=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],j=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],F=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],W=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],K=new Array(2*(y+2));a(K);var k=new Array(2*p);a(k);var O=new Array(512);a(O);var l=new Array(256);a(l);var I=new Array(_);a(I);var X,B,ee,U=new Array(p);function J(f,S,N,M,C){this.static_tree=f,this.extra_bits=S,this.extra_base=N,this.elems=M,this.max_length=C,this.has_stree=f&&f.length}function A(f,S){this.dyn_tree=f,this.max_code=0,this.stat_desc=S}function E(f){return f<256?O[f]:O[256+(f>>>7)]}function Y(f,S){f.pending_buf[f.pending++]=255&S,f.pending_buf[f.pending++]=S>>>8&255}function V(f,S,N){f.bi_valid>u-N?(f.bi_buf|=S<<f.bi_valid&65535,Y(f,f.bi_buf),f.bi_buf=S>>u-f.bi_valid,f.bi_valid+=N-u):(f.bi_buf|=S<<f.bi_valid&65535,f.bi_valid+=N)}function G(f,S,N){V(f,N[2*S],N[2*S+1])}function se(f,S){for(var N=0;N|=1&f,f>>>=1,N<<=1,0<--S;);return N>>>1}function de(f,S,N){var M,C,q=new Array(g+1),H=0;for(M=1;M<=g;M++)q[M]=H=H+N[M-1]<<1;for(C=0;C<=S;C++){var Z=f[2*C+1];Z!==0&&(f[2*C]=se(q[Z]++,Z))}}function ie(f){var S;for(S=0;S<y;S++)f.dyn_ltree[2*S]=0;for(S=0;S<p;S++)f.dyn_dtree[2*S]=0;for(S=0;S<b;S++)f.bl_tree[2*S]=0;f.dyn_ltree[2*$]=1,f.opt_len=f.static_len=0,f.last_lit=f.matches=0}function ne(f){8<f.bi_valid?Y(f,f.bi_buf):0<f.bi_valid&&(f.pending_buf[f.pending++]=f.bi_buf),f.bi_buf=0,f.bi_valid=0}function ce(f,S,N,M){var C=2*S,q=2*N;return f[C]<f[q]||f[C]===f[q]&&M[S]<=M[N]}function oe(f,S,N){for(var M=f.heap[N],C=N<<1;C<=f.heap_len&&(C<f.heap_len&&ce(S,f.heap[C+1],f.heap[C],f.depth)&&C++,!ce(S,M,f.heap[C],f.depth));)f.heap[N]=f.heap[C],N=C,C<<=1;f.heap[N]=M}function fe(f,S,N){var M,C,q,H,Z=0;if(f.last_lit!==0)for(;M=f.pending_buf[f.d_buf+2*Z]<<8|f.pending_buf[f.d_buf+2*Z+1],C=f.pending_buf[f.l_buf+Z],Z++,M===0?G(f,C,S):(G(f,(q=l[C])+w+1,S),(H=D[q])!==0&&V(f,C-=I[q],H),G(f,q=E(--M),N),(H=j[q])!==0&&V(f,M-=U[q],H)),Z<f.last_lit;);G(f,$,S)}function me(f,S){var N,M,C,q=S.dyn_tree,H=S.stat_desc.static_tree,Z=S.stat_desc.has_stree,Q=S.stat_desc.elems,ae=-1;for(f.heap_len=0,f.heap_max=d,N=0;N<Q;N++)q[2*N]!==0?(f.heap[++f.heap_len]=ae=N,f.depth[N]=0):q[2*N+1]=0;for(;f.heap_len<2;)q[2*(C=f.heap[++f.heap_len]=ae<2?++ae:0)]=1,f.depth[C]=0,f.opt_len--,Z&&(f.static_len-=H[2*C+1]);for(S.max_code=ae,N=f.heap_len>>1;1<=N;N--)oe(f,q,N);for(C=Q;N=f.heap[1],f.heap[1]=f.heap[f.heap_len--],oe(f,q,1),M=f.heap[1],f.heap[--f.heap_max]=N,f.heap[--f.heap_max]=M,q[2*C]=q[2*N]+q[2*M],f.depth[C]=(f.depth[N]>=f.depth[M]?f.depth[N]:f.depth[M])+1,q[2*N+1]=q[2*M+1]=C,f.heap[1]=C++,oe(f,q,1),2<=f.heap_len;);f.heap[--f.heap_max]=f.heap[1],(function(re,ue){var xe,ge,we,le,Re,Be,be=ue.dyn_tree,it=ue.max_code,Ct=ue.stat_desc.static_tree,Et=ue.stat_desc.has_stree,It=ue.stat_desc.extra_bits,rt=ue.stat_desc.extra_base,ye=ue.stat_desc.max_length,Fe=0;for(le=0;le<=g;le++)re.bl_count[le]=0;for(be[2*re.heap[re.heap_max]+1]=0,xe=re.heap_max+1;xe<d;xe++)ye<(le=be[2*be[2*(ge=re.heap[xe])+1]+1]+1)&&(le=ye,Fe++),be[2*ge+1]=le,it<ge||(re.bl_count[le]++,Re=0,rt<=ge&&(Re=It[ge-rt]),Be=be[2*ge],re.opt_len+=Be*(le+Re),Et&&(re.static_len+=Be*(Ct[2*ge+1]+Re)));if(Fe!==0){do{for(le=ye-1;re.bl_count[le]===0;)le--;re.bl_count[le]--,re.bl_count[le+1]+=2,re.bl_count[ye]--,Fe-=2}while(0<Fe);for(le=ye;le!==0;le--)for(ge=re.bl_count[le];ge!==0;)it<(we=re.heap[--xe])||(be[2*we+1]!==le&&(re.opt_len+=(le-be[2*we+1])*be[2*we],be[2*we+1]=le),ge--)}})(f,S),de(q,ae,f.bl_count)}function s(f,S,N){var M,C,q=-1,H=S[1],Z=0,Q=7,ae=4;for(H===0&&(Q=138,ae=3),S[2*(N+1)+1]=65535,M=0;M<=N;M++)C=H,H=S[2*(M+1)+1],++Z<Q&&C===H||(Z<ae?f.bl_tree[2*C]+=Z:C!==0?(C!==q&&f.bl_tree[2*C]++,f.bl_tree[2*T]++):Z<=10?f.bl_tree[2*z]++:f.bl_tree[2*P]++,q=C,ae=(Z=0)===H?(Q=138,3):C===H?(Q=6,3):(Q=7,4))}function L(f,S,N){var M,C,q=-1,H=S[1],Z=0,Q=7,ae=4;for(H===0&&(Q=138,ae=3),M=0;M<=N;M++)if(C=H,H=S[2*(M+1)+1],!(++Z<Q&&C===H)){if(Z<ae)for(;G(f,C,f.bl_tree),--Z!=0;);else C!==0?(C!==q&&(G(f,C,f.bl_tree),Z--),G(f,T,f.bl_tree),V(f,Z-3,2)):Z<=10?(G(f,z,f.bl_tree),V(f,Z-3,3)):(G(f,P,f.bl_tree),V(f,Z-11,7));q=C,ae=(Z=0)===H?(Q=138,3):C===H?(Q=6,3):(Q=7,4)}}a(U);var R=!1;function v(f,S,N,M){V(f,(c<<1)+(M?1:0),3),(function(C,q,H,Z){ne(C),Z&&(Y(C,H),Y(C,~H)),t.arraySet(C.pending_buf,C.window,q,H,C.pending),C.pending+=H})(f,S,N,!0)}i._tr_init=function(f){R||((function(){var S,N,M,C,q,H=new Array(g+1);for(C=M=0;C<_-1;C++)for(I[C]=M,S=0;S<1<<D[C];S++)l[M++]=C;for(l[M-1]=C,C=q=0;C<16;C++)for(U[C]=q,S=0;S<1<<j[C];S++)O[q++]=C;for(q>>=7;C<p;C++)for(U[C]=q<<7,S=0;S<1<<j[C]-7;S++)O[256+q++]=C;for(N=0;N<=g;N++)H[N]=0;for(S=0;S<=143;)K[2*S+1]=8,S++,H[8]++;for(;S<=255;)K[2*S+1]=9,S++,H[9]++;for(;S<=279;)K[2*S+1]=7,S++,H[7]++;for(;S<=287;)K[2*S+1]=8,S++,H[8]++;for(de(K,y+1,H),S=0;S<p;S++)k[2*S+1]=5,k[2*S]=se(S,5);X=new J(K,D,w+1,y,g),B=new J(k,j,0,p,g),ee=new J(new Array(0),F,0,b,x)})(),R=!0),f.l_desc=new A(f.dyn_ltree,X),f.d_desc=new A(f.dyn_dtree,B),f.bl_desc=new A(f.bl_tree,ee),f.bi_buf=0,f.bi_valid=0,ie(f)},i._tr_stored_block=v,i._tr_flush_block=function(f,S,N,M){var C,q,H=0;0<f.level?(f.strm.data_type===2&&(f.strm.data_type=(function(Z){var Q,ae=4093624447;for(Q=0;Q<=31;Q++,ae>>>=1)if(1&ae&&Z.dyn_ltree[2*Q]!==0)return r;if(Z.dyn_ltree[18]!==0||Z.dyn_ltree[20]!==0||Z.dyn_ltree[26]!==0)return n;for(Q=32;Q<w;Q++)if(Z.dyn_ltree[2*Q]!==0)return n;return r})(f)),me(f,f.l_desc),me(f,f.d_desc),H=(function(Z){var Q;for(s(Z,Z.dyn_ltree,Z.l_desc.max_code),s(Z,Z.dyn_dtree,Z.d_desc.max_code),me(Z,Z.bl_desc),Q=b-1;3<=Q&&Z.bl_tree[2*W[Q]+1]===0;Q--);return Z.opt_len+=3*(Q+1)+5+5+4,Q})(f),C=f.opt_len+3+7>>>3,(q=f.static_len+3+7>>>3)<=C&&(C=q)):C=q=N+5,N+4<=C&&S!==-1?v(f,S,N,M):f.strategy===4||q===C?(V(f,2+(M?1:0),3),fe(f,K,k)):(V(f,4+(M?1:0),3),(function(Z,Q,ae,re){var ue;for(V(Z,Q-257,5),V(Z,ae-1,5),V(Z,re-4,4),ue=0;ue<re;ue++)V(Z,Z.bl_tree[2*W[ue]+1],3);L(Z,Z.dyn_ltree,Q-1),L(Z,Z.dyn_dtree,ae-1)})(f,f.l_desc.max_code+1,f.d_desc.max_code+1,H+1),fe(f,f.dyn_ltree,f.dyn_dtree)),ie(f),M&&ne(f)},i._tr_tally=function(f,S,N){return f.pending_buf[f.d_buf+2*f.last_lit]=S>>>8&255,f.pending_buf[f.d_buf+2*f.last_lit+1]=255&S,f.pending_buf[f.l_buf+f.last_lit]=255&N,f.last_lit++,S===0?f.dyn_ltree[2*N]++:(f.matches++,S--,f.dyn_ltree[2*(l[N]+w+1)]++,f.dyn_dtree[2*E(S)]++),f.last_lit===f.lit_bufsize-1},i._tr_align=function(f){V(f,2,3),G(f,$,K),(function(S){S.bi_valid===16?(Y(S,S.bi_buf),S.bi_buf=0,S.bi_valid=0):8<=S.bi_valid&&(S.pending_buf[S.pending++]=255&S.bi_buf,S.bi_buf>>=8,S.bi_valid-=8)})(f)}},{"../utils/common":41}],53:[function(m,e,i){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(m,e,i){(function(t){(function(r,n){"use strict";if(!r.setImmediate){var a,c,_,w,y=1,p={},b=!1,d=r.document,g=Object.getPrototypeOf&&Object.getPrototypeOf(r);g=g&&g.setTimeout?g:r,a={}.toString.call(r.process)==="[object process]"?function(T){process.nextTick(function(){x(T)})}:(function(){if(r.postMessage&&!r.importScripts){var T=!0,z=r.onmessage;return r.onmessage=function(){T=!1},r.postMessage("","*"),r.onmessage=z,T}})()?(w="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",$,!1):r.attachEvent("onmessage",$),function(T){r.postMessage(w+T,"*")}):r.MessageChannel?((_=new MessageChannel).port1.onmessage=function(T){x(T.data)},function(T){_.port2.postMessage(T)}):d&&"onreadystatechange"in d.createElement("script")?(c=d.documentElement,function(T){var z=d.createElement("script");z.onreadystatechange=function(){x(T),z.onreadystatechange=null,c.removeChild(z),z=null},c.appendChild(z)}):function(T){setTimeout(x,0,T)},g.setImmediate=function(T){typeof T!="function"&&(T=new Function(""+T));for(var z=new Array(arguments.length-1),P=0;P<z.length;P++)z[P]=arguments[P+1];var D={callback:T,args:z};return p[y]=D,a(y),y++},g.clearImmediate=u}function u(T){delete p[T]}function x(T){if(b)setTimeout(x,0,T);else{var z=p[T];if(z){b=!0;try{(function(P){var D=P.callback,j=P.args;switch(j.length){case 0:D();break;case 1:D(j[0]);break;case 2:D(j[0],j[1]);break;case 3:D(j[0],j[1],j[2]);break;default:D.apply(n,j)}})(z)}finally{u(T),b=!1}}}}function $(T){T.source===r&&typeof T.data=="string"&&T.data.indexOf(w)===0&&x(+T.data.slice(w.length))}})(typeof self>"u"?t===void 0?this:t:self)}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})});var De=class{constructor(e){this.hass=e}subscribe(e){return this.hass.connection.subscribeMessage(e,{type:"recipe_manager/subscribe"})}async getAllRecipes(){return this.hass.callWS({type:"recipe_manager/recipes/get_all"})}async getRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/get",recipe_id:e})}async scrapeRecipe(e,i=!1){return this.hass.callWS({type:"recipe_manager/recipes/scrape",url:e,enabled:i})}async addRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/add",...e})}async updateRecipe(e,i){return this.hass.callWS({type:"recipe_manager/recipes/update",recipe_id:e,...i})}async deleteRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/delete",recipe_id:e})}async toggleFavourite(e){return this.hass.callWS({type:"recipe_manager/recipes/toggle_favourite",recipe_id:e})}async downloadRecipeImage(e,i){if(!window.confirm("Allow MacroMate to download and privately normalize this remote image?"))throw{code:"invalid_request"};return this.hass.callWS({type:"recipe_manager/recipes/download_image",recipe_id:e,image_url:i,enabled:!0})}async getTags(){return this.hass.callWS({type:"recipe_manager/tags/get_all"})}async getMealPlan(e){let i={type:"recipe_manager/meal_plan/get"};return e&&(i.week_start=e),this.hass.callWS(i)}async addToMealPlan(e,i,t,r=1,n=null){let a={type:"recipe_manager/meal_plan/add",recipe_id:e,date:i,meal_type:t,servings:r};return n&&(a.notes=n),this.hass.callWS(a)}async removeFromMealPlan(e){return this.hass.callWS({type:"recipe_manager/meal_plan/remove",entry_id:e})}async clearMealPlanWeek(e){return this.hass.callWS({type:"recipe_manager/meal_plan/clear",week_start:e,confirm:!0})}async getGlobalTimers(){return this.hass.callWS({type:"recipe_manager/global_timers/get"})}async addGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/add",...e})}async updateGlobalTimer(e,i){return this.hass.callWS({type:"recipe_manager/global_timers/update",timer_id:e,...i})}async deleteGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/delete",timer_id:e})}async importRecipeKeeper(e){return this.hass.callWS({type:"recipe_manager/import/recipe_keeper",html_content:e})}async uploadRecipeImage(e,i){return this.hass.callWS({type:"recipe_manager/recipes/upload_image",recipe_id:e,image_data:i})}};var Oe=(m,e)=>`macromate:ui:${m.context.user}:${e}`;function at(m,e){try{let i=m.getItem(e);return i&&i.length<=131072?JSON.parse(i):null}catch{return null}}function st(m){if(!m.current()||!m.context.admin)return{};let e=at(sessionStorage,Oe(m,"view"))||{},i=at(localStorage,Oe(m,"timers")),t=Date.now();return{view:typeof e.view=="string"?e.view:null,recipeId:typeof e.recipeId=="string"?e.recipeId:null,recentIds:Array.isArray(e.recentIds)?e.recentIds.filter(r=>typeof r=="string"&&r.length<=128).slice(0,200):[],timers:Array.isArray(i)?i.slice(0,100).filter(r=>r&&typeof r.id=="string"&&typeof r.label=="string"&&r.label.length<=300&&Number.isFinite(r.total)&&r.total>0&&r.total<=604800&&Number.isFinite(r.remaining)&&Number.isFinite(r.savedAt)).map(r=>({id:r.id,label:r.label,total:r.total,remaining:Math.max(0,r.remaining-(r.running?Math.max(0,Math.floor((t-r.savedAt)/1e3)):0)),running:r.running===!0,presetId:r.presetId||null})).filter(r=>r.remaining>0):[]}}function ot(m,e,i){if(!(!m?.current()||!m.context.admin))try{sessionStorage.setItem(Oe(m,"view"),JSON.stringify(e)),localStorage.setItem(Oe(m,"timers"),JSON.stringify(i.filter(t=>!t.global).slice(0,100).map(t=>({id:t.id,label:t.label,total:t.total,remaining:t.remaining,running:t.running===!0,presetId:t.presetId||null,savedAt:Date.now()}))))}catch{}}var lt=["de","es","fr","it","nl","pt"],Le=["de","en","es","fr","it","nl","pt"];var{getLocale:Ft,setLocale:Dt}=nt({sourceLocale:"en",targetLocales:lt,loadLocale:m=>({de:()=>import("./chunks/de-L3JMCSON.js"),es:()=>import("./chunks/es-TYY2HB2B.js"),fr:()=>import("./chunks/fr-VRS6NLY6.js"),it:()=>import("./chunks/it-SW3BRMU2.js"),nl:()=>import("./chunks/nl-TAIPGW4J.js"),pt:()=>import("./chunks/pt-UPH64WCU.js")})[m]()});async function Se(m){let e=Le.includes(m)?m:"en";e!==Ft()&&await Dt(e)}var Te=new Set,je=new Set,_e=null,ze=null;function ve(){return typeof navigator<"u"&&"wakeLock"in navigator}function Ue(){let m=!!_e;je.forEach(e=>e(m))}async function dt(){if(ze)return ze;if(!(!ve()||_e)&&!(typeof document<"u"&&document.visibilityState!=="visible"))return ze=(async()=>{try{let m=await navigator.wakeLock.request("screen");if(!Te.size||document.visibilityState!=="visible"){await m.release();return}_e=m,_e.addEventListener("release",()=>{_e=null,Ue()}),Ue()}catch(m){console.warn("[RM] Wake Lock request failed:",m)}finally{ze=null}})(),ze}async function Ot(){if(_e){try{await _e.release()}catch{}_e=null,Ue()}}async function pt(){Te.size>0?await dt():await Ot()}typeof document<"u"&&document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&Te.size>0&&dt()});async function Pe(m){Te.add(m),await pt()}async function Ce(m){Te.delete(m),await pt()}function ht(m){return je.add(m),()=>je.delete(m)}var We=class extends he{static properties={recipes:{type:Array},allRecipes:{type:Array},tags:{type:Array},searchQuery:{type:String},activeTag:{type:String},columns:{type:Number},showFavourites:{type:Boolean},hideSidebar:{type:Boolean},scrollPos:{type:Number},recentRecipes:{type:Array},recentCount:{type:Number},_filterMode:{type:String},_starFilter:{type:Number},_sortByRating:{type:Boolean},_showRatingMenu:{type:Boolean},_selectedCourses:{type:Object},_selectedCategories:{type:Object},_selectedCollections:{type:Object},filterPreset:{type:Object}};constructor(){super(),this.recipes=[],this.allRecipes=[],this.tags=[],this.searchQuery="",this.activeTag=null,this.columns=3,this.showFavourites=!0,this.hideSidebar=!1,this.scrollPos=0,this.recentRecipes=[],this.recentCount=12,this._filterMode="all",this._starFilter=0,this._sortByRating=!1,this._showRatingMenu=!1,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,this._lastScrollPos=0,this._hasRestoredScroll=!1,this.filterPreset=null}_toggleChip(e,i){let t=e==="courses"?"_selectedCourses":e==="categories"?"_selectedCategories":"_selectedCollections",r=new Set(this[t]);r.has(i)?r.delete(i):r.add(i),this[t]=r}updated(e){if(e.has("filterPreset")&&this.filterPreset){let{filterMode:i,selectedValues:t}=this.filterPreset;this._filterMode=i,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,i==="courses"&&(this._selectedCourses=new Set(t)),i==="categories"&&(this._selectedCategories=new Set(t)),i==="collections"&&(this._selectedCollections=new Set(t))}e.has("scrollPos")&&(this._hasRestoredScroll=!1),this.scrollPos!=null&&!this._hasRestoredScroll&&(this._hasRestoredScroll=!0,this.updateComplete.then(()=>{requestAnimationFrame(()=>{let i=this.shadowRoot?.querySelector(".grid-scroll");i&&(i.scrollTop=this.scrollPos)})}))}_handleSearchInput(e){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:e.target.value},bubbles:!0,composed:!0}))}_handleClearSearch(){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:""},bubbles:!0,composed:!0}))}_handleTagClick(e){this.dispatchEvent(new CustomEvent("rm-tag-filter",{detail:{tag:e},bubbles:!0,composed:!0}))}_handleOpenRecipe(e){this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:e},bubbles:!0,composed:!0}))}_handleToggleFavourite(e,i){e.stopPropagation(),this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:i.id},bubbles:!0,composed:!0}))}_recipeMatchesTag(e,i){return i?e.tags?.includes(i)||e.courses?.includes(i)||e.categories?.includes(i)||e.collections?.includes(i):!0}_recipeMatchesSearch(e,i){let t=(i||"").trim().toLowerCase();return t?e.name?.toLowerCase().includes(t)||e.description?.toLowerCase().includes(t)||e.tags?.some(r=>r.toLowerCase().includes(t)):!0}_formatTime(e){if(!e)return null;if(e<60)return`${e}m`;let i=Math.floor(e/60),t=e%60;return t?`${i}h ${t}m`:`${i}h`}_getFilteredList(){let e=this._selectedCourses.size>0,i=this._selectedCategories.size>0,t=this._selectedCollections.size>0,r=e||i||t,n;switch(r?n=this.allRecipes.filter(a=>{let c=!e||(a.courses||[]).some(y=>this._selectedCourses.has(y)),_=!i||(a.categories||[]).some(y=>this._selectedCategories.has(y)),w=!t||(a.collections||[]).some(y=>this._selectedCollections.has(y));return c&&_&&w&&this._recipeMatchesSearch(a,this.searchQuery)}):n=this.recipes,this._filterMode){case"favourites":n=this.allRecipes.filter(a=>a.is_favourite).filter(a=>!r||n.some(c=>c.id===a.id));break;case"recent":n=this.recentRecipes.slice(0,this.recentCount).filter(a=>!r||n.some(c=>c.id===a.id));break}return n=n.filter(a=>this._recipeMatchesSearch(a,this.searchQuery)&&this._recipeMatchesTag(a,this.activeTag)),this._starFilter>0&&(n=n.filter(a=>(a.rating||0)>=this._starFilter)),this._sortByRating&&(n=[...n].sort((a,c)=>(c.rating||0)-(a.rating||0))),n}get _allCourses(){let e=new Set;return this.allRecipes.forEach(i=>(i.courses||[]).forEach(t=>e.add(t))),[...e].sort()}get _coursecounts(){let e={};return this.allRecipes.forEach(i=>(i.courses||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}get _allCategories(){let e=new Set;return this.allRecipes.forEach(i=>(i.categories||[]).forEach(t=>e.add(t))),[...e].sort()}get _categorycounts(){let e={};return this.allRecipes.forEach(i=>(i.categories||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}get _allCollections(){let e=new Set;return this.allRecipes.forEach(i=>(i.collections||[]).forEach(t=>e.add(t))),[...e].sort()}get _collectioncounts(){let e={};return this.allRecipes.forEach(i=>(i.collections||[]).forEach(t=>{e[t]=(e[t]||0)+1})),e}_renderStars(e){let i=e||0;return h`
      <div class="card-stars">
        ${[1,2,3,4,5].map(t=>h`<span class="card-star ${t<=i?"filled":""}">${t<=i?"\u2605":"\u2606"}</span>`)}
      </div>
    `}_renderRecipeCard(e){let i=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return h`
      <div class="recipe-card" @click=${()=>this._handleOpenRecipe(e)}>
        <div class="recipe-thumb">
          ${e.image_url?h`
            <img src="${e.image_url}" alt="${e.name}" loading="lazy" />
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
            <ha-icon icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"></ha-icon>
          </button>
        </div>
        <div class="recipe-info">
          <h3 class="recipe-name">${e.name}</h3>
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
      </div>
    `}_renderRatingMenu(){return h`
      <div class="rating-menu" @click=${e=>e.stopPropagation()}>
        <div class="rating-menu-section">${o("Filter by rating")}</div>
        ${[0,1,2,3,4,5].map(e=>h`
          <button class="rating-menu-item ${this._starFilter===e?"active":""}"
            @click=${()=>{this._starFilter=e,this._showRatingMenu=!1}}>
            ${e===0?o("All ratings"):o(te`${"\u2605".repeat(e)}${"\u2606".repeat(5-e)} ${e}+`)}
          </button>
        `)}
        <div class="rating-menu-section" style="margin-top:6px">${o("Sort")}</div>
        <button class="rating-menu-item ${this._sortByRating?"active":""}"
          @click=${()=>{this._sortByRating=!this._sortByRating,this._showRatingMenu=!1}}>
          ${o(te`${this._sortByRating?"\u2713 ":""}Sort by rating`)}
        </button>
      </div>
    `}render(){let e=this._getFilteredList(),i=this._filterMode==="all"&&this.showFavourites&&!this.activeTag&&!this.searchQuery&&!this._starFilter&&!this._sortByRating,t=i?e.filter(c=>c.is_favourite):[],r=i&&t.length?e.filter(c=>!c.is_favourite):e,n=`grid-template-columns: var(--rm-grid-columns, repeat(${this.columns}, minmax(0, 1fr)));`,a=this._starFilter>0||this._sortByRating;return h`
      <div class="grid-container" @click=${()=>{this._showRatingMenu&&(this._showRatingMenu=!1)}}>
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
                <button class="clear-btn" @click=${this._handleClearSearch}>
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
                class="rating-filter-btn ${a?"active":""}"
                @click=${c=>{c.stopPropagation(),this._showRatingMenu=!this._showRatingMenu}}
                title="${o("Filter/sort by rating")}"
              >
                <ha-icon icon="mdi:filter-menu-outline"></ha-icon>
                ${a?h`<span class="rating-filter-badge"></span>`:""}
              </button>
              ${this._showRatingMenu?this._renderRatingMenu():""}
            </div>
          </div>
        `:""}

        <!-- Sub-filter chips for Courses / Categories / Collections (multi-select) -->
        ${this.hideSidebar&&this._filterMode==="courses"&&this._allCourses.length?h`
          <div class="sub-filter-row">
            <button class="sub-chip ${this._selectedCourses.size?"":"active"}"
              @click=${()=>{this._selectedCourses=new Set}}>${o("All")}</button>
            ${this._allCourses.map(c=>h`
              <button
                class="sub-chip ${this._selectedCourses.has(c)?"active":""}"
                @click=${()=>this._toggleChip("courses",c)}
              >${c}<span class="sub-chip-count">${this._coursecounts[c]||0}</span></button>
            `)}
          </div>
        `:""}
        ${this.hideSidebar&&this._filterMode==="categories"&&this._allCategories.length?h`
          <div class="sub-filter-row">
            <button class="sub-chip ${this._selectedCategories.size?"":"active"}"
              @click=${()=>{this._selectedCategories=new Set}}>${o("All")}</button>
            ${this._allCategories.map(c=>h`
              <button
                class="sub-chip ${this._selectedCategories.has(c)?"active":""}"
                @click=${()=>this._toggleChip("categories",c)}
              >${c}<span class="sub-chip-count">${this._categorycounts[c]||0}</span></button>
            `)}
          </div>
        `:""}
        ${this.hideSidebar&&this._filterMode==="collections"&&this._allCollections.length?h`
          <div class="sub-filter-row">
            <button class="sub-chip ${this._selectedCollections.size?"":"active"}"
              @click=${()=>{this._selectedCollections=new Set}}>${o("All")}</button>
            ${this._allCollections.map(c=>h`
              <button
                class="sub-chip ${this._selectedCollections.has(c)?"active":""}"
                @click=${()=>this._toggleChip("collections",c)}
              >${c}<span class="sub-chip-count">${this._collectioncounts[c]||0}</span></button>
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
              >${c}</button>
            `)}
          </div>
        `:""}

        <!-- Active filter hint -->
        ${a?h`
          <div class="active-filter-bar">
            ${this._starFilter>0?h`<span>${o(te`⭐ ${this._starFilter}+ stars`)}</span>`:""}
            ${this._sortByRating?h`<span>${o("Sorted by rating")}</span>`:""}
            <button class="clear-filter-btn" @click=${()=>{this._starFilter=0,this._sortByRating=!1}}>
              <ha-icon icon="mdi:close"></ha-icon> ${o("Clear")}
            </button>
          </div>
        `:""}

        <!-- Recipe content -->
        <div class="grid-scroll" @scroll=${c=>{this._lastScrollPos=c.target.scrollTop}}>
          ${e.length===0?h`
            <div class="empty-state">
              <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
              <p>${this.searchQuery||this.activeTag?o("No matching recipes"):this._starFilter>0?o(te`No recipes with ${this._starFilter}+ stars`):this._filterMode==="favourites"?o("No favourites yet \u2014 heart a recipe!"):this._filterMode==="recent"?o("No recently viewed recipes yet."):o("No recipes yet \u2014 add one!")}</p>
            </div>
          `:h`
            ${i&&t.length?h`
              <div class="section-label">${o("Favourites")}</div>
              <div class="recipe-grid" style=${n}>
                ${t.map(c=>this._renderRecipeCard(c))}
              </div>
              ${r.length?h`<div class="section-label">${o("All Recipes")}</div>`:""}
            `:""}

            <div class="recipe-grid" style=${n}>
              ${r.map(c=>this._renderRecipeCard(c))}
            </div>
          `}
        </div>
      </div>
    `}static styles=pe`
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
  `};try{customElements.define("rm-recipe-grid",We)}catch{}var Lt={"\xBD":.5,"\xBC":.25,"\xBE":.75,"\u2153":.3333333333333333,"\u2154":.6666666666666666,"\u215B":.125,"\u215C":.375,"\u215D":.625,"\u215E":.875};function qe(m){if(m==null)return null;let e=String(m).trim().replace(",","."),i,t=e.match(/^(\d+)?\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/),r=e.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);if(t)i=Number(t[1]||0)+Lt[t[2]];else if(r){if(Number(r[3])===0)return null;i=Number(r[1]||0)+Number(r[2])/Number(r[3])}else if(/^\d+(?:\.\d+)?$/.test(e))i=Number(e);else return null;return Number.isFinite(i)&&i>=0&&i<=1e6?i:null}function ut(m,e){let i=qe(m);if(i===null||!Number.isFinite(e)||e<=0||e>1e4)return m;let t=i*e;return!Number.isFinite(t)||t>1e10?m:String(Number(t.toFixed(4)))}function Ee(m){return String(m).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map(e=>e.startsWith("**")?h`<strong>${e.slice(2,-2)}</strong>`:e.startsWith("`")?h`<code>${e.slice(1,-1)}</code>`:e.startsWith("*")?h`<em>${e.slice(1,-1)}</em>`:e)}function Ie(m){return String(m||"").split(`
`).map(e=>e.startsWith("### ")?h`<h3>${Ee(e.slice(4))}</h3>`:e.startsWith("## ")?h`<h2>${Ee(e.slice(3))}</h2>`:e.startsWith("# ")?h`<h1>${Ee(e.slice(2))}</h1>`:/^[-*] /.test(e)?h`<ul><li>${Ee(e.slice(2))}</li></ul>`:h`<p>${Ee(e)}</p>`)}var mt=pe`
 :host{display:block;color:var(--rm-text,#424242);font:inherit;height:100%;overflow:auto}section{padding:24px;max-width:1000px;margin:auto}h2{margin:0 0 20px}h3{font-size:16px}nav,.toolbar,.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}button,select,input,textarea{font:inherit;color:inherit;background:var(--rm-bg-surface,white);border:1px solid var(--rm-border,#ddd);border-radius:8px;padding:10px}button{cursor:pointer}button:hover,button.active{background:var(--rm-accent-soft,#eee)}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--rm-accent,#646cab);outline-offset:2px}button:disabled{opacity:.5;cursor:default}label{display:flex;flex-direction:column;gap:6px;margin:12px 0}input,textarea,select{max-width:100%;box-sizing:border-box}textarea{min-height:80px}pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:340px;overflow:auto}.record{padding:14px;background:var(--rm-bg-surface,white);border:1px solid var(--rm-border,#ddd);border-radius:12px;margin:8px 0}.muted{color:var(--rm-text-secondary,#666)}.row strong{flex:1}.checked strong{text-decoration:line-through}form{max-width:720px}.danger{color:#b74444}@media(max-width:600px){section{padding:12px}nav{gap:4px}nav button{padding:8px;font-size:13px}}
`;var Ze=class extends he{static properties={api:{attribute:!1},recipe:{attribute:!1},servings:{type:Number},open:{state:!0},error:{state:!0},result:{state:!0}};static styles=mt;constructor(){super(),this.servings=1,this.open=!1,this.error="",this.result=null}get de(){return this.api?.hass?.language?.startsWith("de")}async submit(e){e.preventDefault();let i=e.target,t={recipe_id:this.recipe.id,servings:Number(i.elements.servings.value),meal_type:i.elements.meal_type.value};i.elements.date.value&&(t.date=i.elements.date.value);try{this.result=await this.api.call("recipe_log",t),this.error="",this.open=!1}catch(r){this.error=r.message}}render(){let e=["per_serving","per_recipe"].includes(this.recipe?.nutrition_basis)&&Number.isFinite(this.recipe?.declared_nutrition?.calories);return h`<section style="padding:8px"><button @click=${()=>{this.open=!this.open}} ?disabled=${!e||!!this.api?.pending}>${this.de?"Portionen eintragen":"Log servings"}</button>${e?"":h`<small> ${this.de?"Deklarierte Kalorien und bekannte N\xE4hrwertbasis erforderlich.":"Declared calories and a known nutrition basis are required."}</small>`}${this.open?h`<form @submit=${this.submit}><label>${this.de?"Rezeptportionen":"Recipe servings"}<input aria-label="Recipe servings" name="servings" type="number" required min="0.001" max="10000" step="any" .value=${this.servings}></label><label>${this.de?"Mahlzeit":"Meal"}<select name="meal_type"><option value="breakfast">${this.de?"Fr\xFChst\xFCck":"Breakfast"}</option><option value="lunch">${this.de?"Mittagessen":"Lunch"}</option><option value="dinner" selected>${this.de?"Abendessen":"Dinner"}</option><option value="snack">${this.de,"Snack"}</option></select></label><label>${this.de?"Datum (leer = heute in Home Assistant)":"Date (empty = Home Assistant today)"}<input name="date" type="date"></label><p class="muted">${this.de?"Speichert einen unver\xE4nderlichen Rezept-N\xE4hrwert-Snapshot im Tagebuch.":"Saves an immutable snapshot of declared recipe nutrition in the diary."}</p><button type="submit" ?disabled=${!!this.api?.pending}>${this.de?"Best\xE4tigen und eintragen":"Confirm and log"}</button></form>`:""}${this.error?h`<p role="alert">${this.error}</p>`:""}${this.result?h`<p role="status">${this.de?"Tagebucheintrag gespeichert.":"Diary entry saved."}</p>`:""}</section>`}};customElements.define("mm-recipe-log",Ze);function Ne(m,e){return h`<fieldset><legend>Declared nutrition for diary logging</legend><p>Original nutrition text is retained separately. Enter numeric values only when declared by the recipe. Missing values stay unknown.</p><label>Nutrition basis<select aria-label="Nutrition basis" .value=${m.nutrition_basis||"unknown"} @change=${i=>e("nutrition_basis",i.target.value)}><option value="unknown">Unknown</option><option value="per_serving">Per serving</option><option value="per_recipe">Whole recipe</option></select></label>${["calories","protein","carbs","fat","fiber","sugar","sodium","saturated_fat"].map(i=>h`<label>Declared ${i.replaceAll("_"," ")} (${i==="calories"?"kcal":i==="sodium"?"mg":"g"})<input aria-label=${`Declared ${i.replaceAll("_"," ")} (${i==="calories"?"kcal":i==="sodium"?"mg":"g"})`} type="number" min="0" step="any" .value=${m.declared_nutrition?.[i]??""} @input=${t=>e("declared_nutrition",{...m.declared_nutrition,[i]:t.target.value})}></label>`)}</fieldset>`}function Me(m){return Object.fromEntries(Object.entries(m||{}).filter(([,e])=>e!==""&&e!==void 0).map(([e,i])=>[e,i===null?null:Number(i)]))}var ft="recipe-detail",gt=[{key:"calories",label:o("Calories"),unit:"kcal",bold:!0},{key:"fat",label:o("Total Fat"),unit:"g"},{key:"saturated_fat",label:o("Saturated Fat"),unit:"g",indent:!0},{key:"cholesterol",label:o("Cholesterol"),unit:"mg"},{key:"sodium",label:o("Sodium"),unit:"mg"},{key:"carbohydrates",label:o("Total Carbohydrate"),unit:"g"},{key:"fiber",label:o("Dietary Fiber"),unit:"g",indent:!0},{key:"sugar",label:o("Total Sugars"),unit:"g",indent:!0},{key:"protein",label:o("Protein"),unit:"g"}],bt=/(\d+\s*(?:hours?|hrs?)\s*(?:and\s*)?\d*\s*(?:minutes?|mins?)?|\d+\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?))/gi;function Pt(m){let e=m.toLowerCase(),i=0,t=e.match(/(\d+)\s*h(?:ours?|rs?)?/);t&&(i+=parseInt(t[1])*3600);let r=e.match(/(\d+)\s*m(?:in(?:utes?)?)?(?!\s*l)/);r&&(i+=parseInt(r[1])*60);let n=e.match(/(\d+)\s*s(?:ec(?:onds?)?)?/);if(n&&(i+=parseInt(n[1])),!i){let a=e.match(/^(\d+)$/);a&&(i=parseInt(a[1])*60)}return i||0}var Nt={calories:{label:o("Calories"),val:2e3,unit:"kcal"},fat:{label:o("Total Fat"),val:65,unit:"g"},saturated_fat:{label:o("Saturated Fat"),val:20,unit:"g"},cholesterol:{label:o("Cholesterol"),val:300,unit:"mg"},sodium:{label:o("Sodium"),val:2300,unit:"mg"},carbohydrates:{label:o("Total Carbohydrate"),val:300,unit:"g"},fiber:{label:o("Dietary Fiber"),val:28,unit:"g"},sugar:{label:o("Added Sugars"),val:50,unit:"g"},protein:{label:o("Protein"),val:50,unit:"g"}},vt={oz:{factor:28.3495,to:"g",toFull:"g"},lb:{factor:453.592,to:"g",toFull:"g",thresholdKg:500},cup:{factor:250,to:"ml",toFull:"ml"},cups:{factor:250,to:"ml",toFull:"ml"},"fl oz":{factor:29.5735,to:"ml",toFull:"ml"},pt:{factor:473.176,to:"ml",toFull:"ml"},qt:{factor:946.353,to:"ml",toFull:"ml"}};function Mt(m,e){if(!m||!e)return null;let i=qe(m);if(i===null)return null;let t=e.toLowerCase().trim(),r=vt[t];if(!r)return null;let n=i*r.factor,a=r.to;t==="lb"&&n>=500&&(n=n/1e3,a="kg"),a==="ml"&&n>=1e3&&(n=n/1e3,a="L");let c=n>=10?Math.round(n):Math.round(n*10)/10;return{amount:String(c),unit:a}}var Ge=class extends he{static properties={recipe:{type:Object},api:{type:Object},settings:{type:Object},wide:{type:Boolean},_editing:{type:Boolean},_editData:{type:Object},_servingMult:{type:Number},_activeTab:{type:String},_confirmDelete:{type:Boolean},_downloading:{type:Boolean},_photoUrlInput:{type:String},_addingPhotoUrl:{type:Boolean},_metricMode:{type:Boolean},_wakeActive:{type:Boolean},_completedSteps:{type:Object},_editIngInput:{type:String},_editStepInput:{type:String},_nutritionExpanded:{type:Boolean},_dragIngOver:{type:Number},_dragStepOver:{type:Number},_editImageUploading:{type:Boolean},_slideIdx:{type:Number},allTags:{type:Array},allCourses:{type:Array},allCategories:{type:Array},allCollections:{type:Array},_tagPickerField:{type:String},_tagPickerInput:{type:String},_editIngEdit:{type:Object}};constructor(){super(),this.recipe=null,this.api=null,this.settings={},this.wide=!1,this._editing=!1,this._editData={},this._servingMult=1,this._activeTab="ingredients",this._confirmDelete=!1,this._downloading=!1,this._photoUrlInput="",this._addingPhotoUrl=!1,this._metricMode=this.settings?.unitSystem==="metric",this._wakeActive=!1,this._completedSteps=new Set,this._editIngInput="",this._editStepInput="",this._nutritionExpanded=!1,this._dragIngOver=-1,this._dragStepOver=-1,this._dragIngFrom=-1,this._dragStepFrom=-1,this._editImageUploading=!1,this._slideIdx=0,this.allTags=[],this.allCourses=[],this.allCategories=[],this.allCollections=[],this._tagPickerField=null,this._tagPickerInput="",this._editIngEdit=null,this._slideTimer=null,this._slideTouchStartX=null,this._wakeLockTimeout=null,this._wakeLockUnsubscribeFn=null}connectedCallback(){super.connectedCallback(),this._wakeLockUnsubscribeFn=ht(e=>{this._wakeActive=e})}disconnectedCallback(){super.disconnectedCallback(),this._releaseWakeLock(),this._wakeLockUnsubscribeFn?.(),this._wakeLockUnsubscribeFn=null,this._stopSlideTimer()}async _requestWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await Pe(ft);let e=this.settings?.wakeLockDuration??60;this._wakeLockTimeout=setTimeout(()=>this._releaseWakeLock(),e*6e4)}async _releaseWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await Ce(ft)}updated(e){if(e.has("recipe")&&this.recipe){let i=e.get("recipe"),t=!i||i.id!==this.recipe.id;this._servingMult=1,t&&(this._editing=!1,this._confirmDelete=!1,this._photoUrlInput="",this._metricMode=this.settings?.unitSystem==="metric",this._completedSteps=new Set),this._slideIdx=0,this._startSlideTimer()}e.has("settings")&&this._startSlideTimer(),(e.has("recipe")||e.has("settings"))&&this.recipe&&(this.settings?.keepScreenOn?this._requestWakeLock():this._releaseWakeLock()),e.has("recipe")&&!this.recipe&&this._releaseWakeLock()}_formatTime(e){if(!e)return null;if(e<60)return o(te`${e} min`);let i=Math.floor(e/60),t=e%60;return t?o(te`${i}h ${t}m`):o(te`${i}h`)}_scaleAmount(e){return ut(e,this._servingMult)}_startEdit(){let e=this.recipe.nutrition||{};this._editData={nutrition_basis:this.recipe.nutrition_basis||"unknown",declared_nutrition:{...this.recipe.declared_nutrition||{}},name:this.recipe.name||"",description:this.recipe.description||"",source_url:this.recipe.source_url||"",servings:this.recipe.servings||"",prep_time:this.recipe.prep_time||"",cook_time:this.recipe.cook_time||"",tags:[...this.recipe.tags||[]],courses:[...this.recipe.courses||[]],categories:[...this.recipe.categories||[]],collections:[...this.recipe.collections||[]],notes:this.recipe.notes||"",rating:this.recipe.rating||0,image_url:this.recipe.media_refs?.image_url??this.recipe.image_url??"",photos:[...this.recipe.media_refs?.photos??this.recipe.photos??[]],ingredients:[...this.recipe.ingredients||[]],instructions:[...this.recipe.instructions||[]],cal:e.calories??"",fat:e.fat??"",satf:e.saturated_fat??"",chol:e.cholesterol??"",sod:e.sodium??"",carb:e.carbohydrates??"",fib:e.fiber??"",sug:e.sugar??"",prot:e.protein??""},this._editing=!0}_cancelEdit(){this._editing=!1,this._editData={}}_handleEditField(e,i){this._editData={...this._editData,[e]:i}}_renderListPicker(e,i,t){let r=this._editData[e]||[],n=this._tagPickerField===e,a=(t||[]).filter(_=>!r.includes(_)),c=n?this._tagPickerInput:"";return h`
      <div class="edit-field list-picker-field">
        <label>${i}</label>
        <div class="list-picker-wrap">
          <!-- Selected chips -->
          <div class="list-picker-chips">
            ${r.map(_=>h`
              <span class="list-chip selected">
                ${_}
                <button class="list-chip-remove" @click=${()=>this._toggleListValue(e,_)} title="${o("Remove")}">×</button>
              </span>
            `)}
            <button class="list-chip-add-btn" @click=${()=>{this._tagPickerField=n?null:e,this._tagPickerInput=""}} title="${o(te`Add ${i.toLowerCase()}`)}">
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
          <!-- Picker dropdown -->
          ${n?h`
            <div class="list-picker-dropdown">
              ${a.length?h`
                <div class="list-picker-existing">
                  ${a.map(_=>h`
                    <span class="list-chip available" @click=${()=>{this._toggleListValue(e,_)}}>
                      ${_}
                    </span>
                  `)}
                </div>
              `:""}
              <div class="list-picker-new-row">
                <input class="list-picker-input" type="text" placeholder="${o(te`New ${i.toLowerCase()}…`)}"
                  .value=${c}
                  @input=${_=>{this._tagPickerInput=_.target.value}}
                  @keydown=${_=>{_.key==="Enter"&&(_.preventDefault(),this._addListValue(e,this._tagPickerInput)),_.key==="Escape"&&(this._tagPickerField=null)}}
                />
                <button class="list-picker-new-btn" @click=${()=>this._addListValue(e,this._tagPickerInput)}
                  ?disabled=${!this._tagPickerInput.trim()}>
                  ${o("Add")}
                </button>
              </div>
            </div>
          `:""}
        </div>
      </div>
    `}_toggleListValue(e,i){let t=this._editData[e]||[],r=t.includes(i)?t.filter(n=>n!==i):[...t,i];this._editData={...this._editData,[e]:r}}_addListValue(e,i){let t=(i||"").trim();if(!t)return;let r=this._editData[e]||[];r.includes(t)||(this._editData={...this._editData,[e]:[...r,t]}),this._tagPickerInput="",this._tagPickerField=null}_startEditIngredient(e){let i=(this._editData.ingredients||[])[e];if(i)if(i.is_heading||i.name?.startsWith("#")){let t=i.name?.startsWith("#")?i.name.slice(1).trim():i.name;this._editIngEdit={idx:e,heading:!0,name:t}}else this._editIngEdit={idx:e,heading:!1,amount:i.amount||"",unit:i.unit||"",name:i.name||""}}_saveEditIngredient(){let e=this._editIngEdit;if(!e)return;let i=[...this._editData.ingredients||[]];e.heading?i[e.idx]={name:`# ${e.name}`,is_heading:!0}:i[e.idx]={amount:e.amount,unit:e.unit,name:e.name},this._editData={...this._editData,ingredients:i},this._editIngEdit=null}_cancelEditIngredient(){this._editIngEdit=null}_editAddIngredient(){let e=this._editIngInput.trim();if(!e)return;let i;if(e.startsWith("#"))i={name:e,is_heading:!0};else{let t=e.split(/\s+/),r="",n="",a="";t.length>=3&&!isNaN(parseFloat(t[0]))?(r=t[0],n=t[1],a=t.slice(2).join(" ")):t.length===2&&!isNaN(parseFloat(t[0]))?(r=t[0],a=t[1]):a=e,i={amount:r,unit:n,name:a}}this._editData={...this._editData,ingredients:[...this._editData.ingredients||[],i]},this._editIngInput=""}_editRemoveIngredient(e){this._editData={...this._editData,ingredients:(this._editData.ingredients||[]).filter((i,t)=>t!==e)}}_editMoveIngredient(e,i){let t=[...this._editData.ingredients||[]],r=e+i;r<0||r>=t.length||([t[e],t[r]]=[t[r],t[e]],this._editData={...this._editData,ingredients:t})}_editMoveStep(e,i){let t=[...this._editData.instructions||[]],r=e+i;r<0||r>=t.length||([t[e],t[r]]=[t[r],t[e]],this._editData={...this._editData,instructions:t})}_editDropIngredient(e,i){if(e===i||e<0||i<0)return;let t=[...this._editData.ingredients||[]],[r]=t.splice(e,1);t.splice(i,0,r),this._editData={...this._editData,ingredients:t},this._dragIngOver=-1,this._dragIngFrom=-1}_editDropStep(e,i){if(e===i||e<0||i<0)return;let t=[...this._editData.instructions||[]],[r]=t.splice(e,1);t.splice(i,0,r),this._editData={...this._editData,instructions:t},this._dragStepOver=-1,this._dragStepFrom=-1}_editAddStep(e){e.trim()&&(this._editData={...this._editData,instructions:[...this._editData.instructions||[],e.trim()]})}_editRemoveStep(e){this._editData={...this._editData,instructions:(this._editData.instructions||[]).filter((i,t)=>t!==e)}}async _editUploadImage(e){if(!e||!this.recipe?.id)return;this._editImageUploading=!0;let i=new FileReader;i.onload=async t=>{let r=t.target.result.split(",")[1];try{let n=await this.api.uploadRecipeImage(this.recipe.id,r),a=n?.image_url||n?.local_url;a&&(this._editData={...this._editData,image_url:this._editData.image_url||a,photos:[...new Set([...this._editData.photos||[],a])]})}catch(n){console.warn("Image upload failed:",n)}finally{this._editImageUploading=!1}},i.readAsDataURL(e)}async _saveEdit(){let e=this._editData,i={},t={cal:"calories",fat:"fat",satf:"saturated_fat",chol:"cholesterol",sod:"sodium",carb:"carbohydrates",fib:"fiber",sug:"sugar",prot:"protein"},r=!1;for(let[a,c]of Object.entries(t))e[a]!==""&&e[a]!=null&&(i[c]=e[a],r=!0);let n={name:e.name,description:e.description,source_url:e.source_url,image_url:e.image_url||null,servings:e.servings===""?null:Number(e.servings),prep_time:e.prep_time===""?null:Number(e.prep_time),cook_time:e.cook_time===""?null:Number(e.cook_time),tags:Array.isArray(e.tags)?e.tags:[],courses:Array.isArray(e.courses)?e.courses:[],categories:Array.isArray(e.categories)?e.categories:[],collections:Array.isArray(e.collections)?e.collections:[],notes:e.notes,rating:e.rating||null,photos:e.photos||[],ingredients:e.ingredients||[],instructions:e.instructions||[],nutrition:r?i:null,nutrition_basis:e.nutrition_basis||"unknown",declared_nutrition:Me(e.declared_nutrition)};try{await this.api.updateRecipe(this.recipe.id,n),this._editing=!1,this.dispatchEvent(new CustomEvent("rm-recipe-saved",{bubbles:!0,composed:!0}))}catch(a){this._saveError=a.message,this.requestUpdate()}}_handleToggleFav(){this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}async _handleDownloadImage(){if(this.recipe.image_url){this._downloading=!0;try{let e=await this.api.downloadRecipeImage(this.recipe.id,this.recipe.image_url);e?.local_url&&this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e.local_url}},bubbles:!0,composed:!0}))}catch(e){console.warn("Image download failed:",e)}finally{this._downloading=!1}}}_handleDeleteRecipe(){if(!this._confirmDelete){this._confirmDelete=!0,setTimeout(()=>{this._confirmDelete=!1},3e3);return}this.dispatchEvent(new CustomEvent("rm-delete-recipe",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}_handleQuickRate(e){let i=this.recipe.rating===e?null:e;this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{rating:i}},bubbles:!0,composed:!0}))}_handleShowPlanner(){this.dispatchEvent(new CustomEvent("rm-show-planner",{bubbles:!0,composed:!0}))}_handleChipNav(e,i){this.dispatchEvent(new CustomEvent("rm-chip-nav",{detail:{filterMode:e,value:i},bubbles:!0,composed:!0}))}_fireTimer(e,i){let t=this.recipe?.name,r=t?o(te`${t} — ${i}`):i;this.dispatchEvent(new CustomEvent("rm-start-timer",{detail:{seconds:e,label:r},bubbles:!0,composed:!0}))}async _handleAddPhotoUrl(){let e=this._photoUrlInput.trim();if(e){this._addingPhotoUrl=!0;try{let r={photos:[...this.recipe.photos||[],e]};this.recipe.image_url||(r.image_url=e),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:r},bubbles:!0,composed:!0})),this._photoUrlInput=""}finally{this._addingPhotoUrl=!1}}}_handleCameraCapture(e){let i=e.target.files?.[0];if(!i)return;let t=new FileReader;t.onload=async r=>{let n=r.target.result.split(",")[1];try{await this.api.uploadRecipeImage(this.recipe.id,n)}catch(a){console.warn("Camera upload failed:",a)}},t.readAsDataURL(i)}_setMainPhoto(e){this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e}},bubbles:!0,composed:!0}))}_removePhoto(e){let i=(this.recipe.photos||[]).filter(r=>r!==e),t={photos:i};this.recipe.image_url===e&&(t.image_url=i[0]||null),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:t},bubbles:!0,composed:!0}))}_getSlideImages(){let e=this.recipe;if(!e)return[];let i=[e.image_url,...e.photos||[]].filter(Boolean);return[...new Set(i)]}_prevSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx-1+e.length)%e.length,this._startSlideTimer())}_nextSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx+1)%e.length,this._startSlideTimer())}_startSlideTimer(){this._stopSlideTimer();let e=this.settings?.slideshowInterval??5;e<=0||this._getSlideImages().length<2||(this._slideTimer=setInterval(()=>{this._slideIdx=(this._slideIdx+1)%this._getSlideImages().length},e*1e3))}_stopSlideTimer(){this._slideTimer&&(clearInterval(this._slideTimer),this._slideTimer=null)}_slideTouchStart(e){this._slideTouchStartX=e.touches[0]?.clientX??null}_slideTouchEnd(e){if(this._slideTouchStartX==null)return;let i=(e.changedTouches[0]?.clientX??0)-this._slideTouchStartX;this._slideTouchStartX=null,!(Math.abs(i)<50)&&(i<0?this._nextSlide():this._prevSlide())}_renderSlideshow(e){let i=this._getSlideImages(),t=Math.min(this._slideIdx,i.length-1),r=i.length>1,n=i[t]||null;return h`
      <div class="wide-image-square"
        @touchstart=${r?this._slideTouchStart:null}
        @touchend=${r?this._slideTouchEnd:null}>
        ${n?h`<img src="${this.api.transport.previewURL(n)||$e}" alt="${e.name}" />`:h`
          <div class="hero-placeholder">
            <ha-icon icon="mdi:food"></ha-icon>
          </div>
        `}
        ${r?h`
          <button class="slide-btn slide-prev" @click=${this._prevSlide} title="${o("Previous")}">
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <button class="slide-btn slide-next" @click=${this._nextSlide} title="${o("Next")}">
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </button>
          <div class="slide-dots">
            ${i.map((a,c)=>h`<span class="slide-dot ${c===t?"active":""}"></span>`)}
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
        ${i.length?h`
          <div class="chip-group-row">
            <span class="chip chip-label">${o("Course:")}</span>
            ${i.map(n=>h`<button class="chip chip-course chip-nav" @click=${()=>this._handleChipNav("courses",n)} title="${o(te`Filter by course: ${n}`)}">${n}</button>`)}
          </div>`:""}
        ${t.length?h`
          <div class="chip-group-row">
            <span class="chip chip-label">${o("Category:")}</span>
            ${t.map(n=>h`<button class="chip chip-category chip-nav" @click=${()=>this._handleChipNav("categories",n)} title="${o(te`Filter by category: ${n}`)}">${n}</button>`)}
          </div>`:""}
        ${r.length?h`
          <div class="chip-group-row">
            <span class="chip chip-label">${o("Collection:")}</span>
            ${r.map(n=>h`<button class="chip chip-collection chip-nav" @click=${()=>this._handleChipNav("collections",n)} title="${o(te`Filter by collection: ${n}`)}">${n}</button>`)}
          </div>`:""}
      </div>
    `}_renderMetaRow(e){if(!(e.servings||e.prep_time||e.cook_time||e.total_time))return"";let t=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null,r=(e.prep_time||0)+(e.cook_time||0),n=t&&t!==r;return h`
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
        ${n?h`
          <span class="meta-chip-icon">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            ${this._formatTime(t)}
          </span>
        `:""}
      </div>
    `}_renderQuickRating(e){let i=e.rating||0;return h`
      <div class="quick-rating">
        ${[1,2,3,4,5].map(t=>h`
          <span class="qr-star ${t<=i?"filled":""}"
            @click=${()=>this._handleQuickRate(t)}>★</span>
        `)}
      </div>
    `}_renderActionButtons(e){return h`
      <div class="action-btns-row">
        <button class="action-icon-btn ${e.is_favourite?"fav-active":""}"
          @click=${this._handleToggleFav}
          title="${e.is_favourite?o("Remove from favourites"):o("Add to favourites")}">
          <span class="btn-icon"><ha-icon icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"></ha-icon></span>
          <span>${o("Favourite")}</span>
        </button>
        <button class="action-icon-btn" @click=${this._handleShowPlanner} title="${o("Add to meal plan")}">
          <span class="btn-icon"><ha-icon icon="mdi:calendar-plus"></ha-icon></span>
          <span>${o("Plan")}</span>
        </button>
        ${e.source_url?h`
          <a class="action-icon-btn" href="${e.source_url}" target="_blank" rel="noopener" title="${o("Open source")}">
            <span class="btn-icon"><ha-icon icon="mdi:open-in-new"></ha-icon></span>
            <span>${o("Source")}</span>
          </a>
        `:""}
        <button class="action-icon-btn" @click=${this._startEdit} title="${o("Edit recipe")}">
          <span class="btn-icon"><ha-icon icon="mdi:pencil-outline"></ha-icon></span>
          <span>${o("Edit")}</span>
        </button>
      </div>
    `}_renderScaler(){return this.recipe?.servings?h`
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
    `:""}_renderWakeLock(){return this.settings?.keepScreenOn?ve()?h`
      <div class="wakelock-row">
        <button class="wakelock-btn ${this._wakeActive?"active":""}"
          @click=${()=>this._wakeActive?this._releaseWakeLock():this._requestWakeLock()}
          title="${this._wakeActive?o("Release screen lock"):o("Keep screen on")}">
          <ha-icon icon="${this._wakeActive?"mdi:eye":"mdi:eye-off-outline"}"></ha-icon>
          ${this._wakeActive?o("Screen on"):o("Keep screen on")}
        </button>
      </div>
    `:h`
        <div class="wakelock-row">
          <span class="wakelock-unsupported"
            title="${o("Requires a secure (HTTPS) connection and a browser that supports the Wake Lock API")}">
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
          <div class="wide-image-card">
            ${this._renderSlideshow(e)}
          </div>

          <!-- col 2: info card -->
          <div class="wide-info-card">
            <h1 class="wide-title">${e.name}</h1>
            ${this._renderActionButtons(e)}
            <mm-recipe-log .api=${this.api.transport} .recipe=${e} .servings=${(e.servings||1)*this._servingMult}></mm-recipe-log>
            ${e.description?h`<div class="wide-desc md-content">${Ie(e.description)}</div>`:""}
            ${this._renderMetaRow(e)}
            ${this._renderChipGroups(e)}
          </div>

          </div><!-- end wide-row 1 -->

          <!-- row 2: ingredients (1/3) + directions (2/3) -->
          <div class="wide-row">

          <!-- col 1: ingredients column -->
          <div class="wide-ing-col">
            <!-- Ingredient serving controls -->
            <div class="wide-ing-controls">
              ${this._renderScaler()}
            </div>

            ${i.map(t=>h`
              <div class="wide-section-card">
                ${t.header?h`<div class="wide-section-title">${t.header}</div>`:""}
                ${t.items.length?h`
                  <ul class="ingredient-list">
                    ${t.items.map(r=>{let{amount:n,unit:a}=this._getDisplayAmount(r);return h`
                        <li class="ingredient-item">
                        <span class="ing-amount">${n} ${a}</span>
                          <span class="ing-name">${r.name}${r.notes?h` <em class="ing-notes">(${r.notes})</em>`:""}</span>
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
            ${(e.instructions||[]).length?(e.instructions||[]).map((t,r)=>{let n=this._completedSteps.has(r);return h`
                <div class="wide-section-card wide-step-card ${n?"step-done":""}">
                  <span class="step-num ${n?"done":""}"
                    @click=${a=>{a.stopPropagation(),this._toggleStepComplete(r)}}
                    title="${n?o("Mark incomplete"):o("Mark complete")}"
                  >${n?h`<ha-icon icon="mdi:check"></ha-icon>`:r+1}</span>
                  <span class="step-text">${this._renderStepWithTimers(t)}</span>
                </div>
              `}):h`<p class="empty-tab">${o("No directions listed.")}</p>`}
            ${e.notes?h`
              <div class="wide-section-card">
                <div class="wide-section-title">${o("Notes")}</div>
                <div class="notes-text md-content">${Ie(e.notes)}</div>
              </div>
            `:""}
          </div>

          </div><!-- end wide-row 2 -->

        </div>

        <!-- Edit overlay -->
        ${this._editing?this._renderEditPanel():""}
      </div>
    `}_renderNarrow(e){let i=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return h`
      <div class="detail-container">
        <!-- Hero image -->
        <div class="hero ${e.image_url?"":"no-image"}">
          ${e.image_url?h`
            <img src="${this.api.transport.previewURL(e.image_url)||$e}" alt="${e.name}" />
            <div class="hero-overlay"></div>
          `:h`
            <div class="hero-placeholder">
              <ha-icon icon="mdi:food"></ha-icon>
            </div>
          `}
          <div class="hero-actions">
            <button class="hero-btn ${e.is_favourite?"fav-active":""}" @click=${this._handleToggleFav}
              title="${e.is_favourite?o("Remove from favourites"):o("Add to favourites")}">
              <ha-icon icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"></ha-icon>
            </button>
            ${e.source_url?h`
              <a class="hero-btn" href="${e.source_url}" target="_blank" rel="noopener" title="${o("Open source")}">
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
            ${e.description?h`<div class="detail-desc md-content">${Ie(e.description)}</div>`:""}

            <div class="meta-row">
              ${e.prep_time?h`
                <div class="meta-item">
                  <span class="meta-label">${o("Prep")}</span>
                  <span class="meta-val">${this._formatTime(e.prep_time)}</span>
                </div>
              `:""}
              ${e.cook_time?h`
                <div class="meta-item">
                  <span class="meta-label">${o("Cook")}</span>
                  <span class="meta-val">${this._formatTime(e.cook_time)}</span>
                </div>
              `:""}
              ${i?h`
                <div class="meta-item">
                  <span class="meta-label">${o("Total")}</span>
                  <span class="meta-val">${this._formatTime(i)}</span>
                </div>
              `:""}
              ${e.servings?h`
                <div class="meta-item">
                  <span class="meta-label">${o("Serves")}</span>
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
            ${[["ingredients",o("Ingredients")],["directions",o("Directions")],["notes",o("Notes")],["nutrition",o("Nutrition")],["photos",o("Photos")]].map(([t,r])=>h`
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
    `}_getDisplayAmount(e){if(this._metricMode){let i=Mt(this._scaleAmount(e.amount),e.unit);if(i)return i}return{amount:this._scaleAmount(e.amount)||"",unit:e.unit||""}}_groupIngredients(e){let i=[],t={header:null,items:[]};for(let r of e||[])r.is_heading||r.name?.startsWith("#")?((t.items.length>0||t.header!==null)&&i.push(t),t={header:(r.name?.startsWith("#")?r.name.slice(1).trim():r.name)||"",items:[]}):t.items.push(r);return(t.items.length>0||t.header!==null)&&i.push(t),i.length?i:[{header:null,items:e||[]}]}_renderIngredients(e){let i=(e.ingredients||[]).some(t=>t.unit&&vt[t.unit.toLowerCase().trim()]);return h`
      ${this.settings?.showUnitConversion&&i?h`
        <div class="metric-toggle-row">
          <button class="metric-btn ${this._metricMode?"active":""}"
            @click=${()=>{this._metricMode=!this._metricMode}}>
            <ha-icon icon="mdi:swap-horizontal"></ha-icon>
            ${this._metricMode?o("Showing metric"):o("Convert to metric")}
          </button>
        </div>
      `:""}

      ${e.ingredients?.length?h`
        <ul class="ingredient-list">
          ${e.ingredients.map((t,r)=>{if(t.is_heading||t.name?.startsWith("#")){let c=t.name?.startsWith("#")?t.name.slice(1).trim():t.name;return h`<li class="ing-heading">${c}</li>`}let{amount:n,unit:a}=this._getDisplayAmount(t);return h`
              <li class="ingredient-item">
              <span class="ing-amount">${n} ${a}</span>
                <span class="ing-name">${t.name}${t.notes?h` <em class="ing-notes">(${t.notes})</em>`:""}</span>
              </li>
            `})}
        </ul>
      `:h`<p class="empty-tab">${o("No ingredients listed.")}</p>`}

    `}_toggleStepComplete(e){let i=new Set(this._completedSteps);i.has(e)?i.delete(e):i.add(e),this._completedSteps=i}_renderDirections(e){return e.instructions?.length?h`
      <ol class="steps-list">
        ${e.instructions.map((i,t)=>{let r=this._completedSteps.has(t);return h`
            <li class="step-item ${r?"step-done":""}">
              <span class="step-num ${r?"done":""}"
                @click=${n=>{n.stopPropagation(),this._toggleStepComplete(t)}}
                title="${r?o("Mark incomplete"):o("Mark complete")}"
              >${r?h`<ha-icon icon="mdi:check"></ha-icon>`:t+1}</span>
              <span class="step-text">${this._renderStepWithTimers(i)}</span>
            </li>
          `})}
      </ol>
    `:h`<p class="empty-tab">${o("No directions listed.")}</p>`}_renderStepWithTimers(e){let i=[],t=0,r;for(bt.lastIndex=0;(r=bt.exec(e))!==null;){r.index>t&&i.push(e.slice(t,r.index));let n=r[0],a=Pt(n);a>0?i.push(h`<button class="time-chip" @click=${c=>{c.stopPropagation(),this._fireTimer(a,n)}} title="${o(te`Start timer for ${n}`)}">
          <ha-icon icon="mdi:timer-outline"></ha-icon>${n}
        </button>`):i.push(n),t=r.index+r[0].length}return t<e.length&&i.push(e.slice(t)),i}_renderNotes(e){return h`
      ${e.notes?h`<div class="notes-text md-content">${Ie(e.notes)}</div>`:h`<p class="empty-tab">${o("No notes.")}</p>`}
    `}_renderNutrition(e){let i=e.nutrition||{};if(!gt.some(n=>i[n.key]!=null&&i[n.key]!==""))return h`
        <div class="empty-tab">
          <p>${o("No nutrition info. Add it via the edit panel.")}</p>
        </div>
      `;let r=e.servings?o(te`Per serving (${e.servings_text||e.servings})`):o("Per serving");return h`
      <div class="nutrition-panel">
        <div class="nutr-header">${o("Nutrition Facts")}</div>
        <div class="nutr-sub">${r}</div>
        <div class="nutr-divider thick"></div>
        ${gt.map(n=>{let a=i[n.key];return a==null||a===""?"":h`
            <div class="nutr-row ${n.bold?"nutr-bold":""} ${n.indent?"nutr-indent":""}">
              <span class="nutr-label">${n.label}</span>
              <span class="nutr-val">${a}${n.unit!=="kcal"?h`<em> ${n.unit}</em>`:""}</span>
            </div>
            <div class="nutr-divider"></div>
          `})}
      </div>
    `}_renderNutritionRing(e){let i=e?.declared_nutrition||{},t=I=>typeof I=="number"&&Number.isFinite(I)&&I>=0?I:null,r=t(i.calories),n=t(i.fat),a=t(i.carbs),c=t(i.protein),_=[n,a,c].every(I=>I!==null),w=n*9,y=a*4,p=c*4,b=_?w+y+p:0;if(![r,n,a,c].some(I=>I!==null))return h`
        <div class="nutr-card">
          <p class="empty-tab" style="margin:0;padding:8px 0;text-align:center">${o("No nutritional information available.")}</p>
        </div>${this._renderOriginalNutrition(e)}`;let g=[{label:o("Carbs"),val:a,cal:y,color:"#f59e0b"},{label:o("Total fat"),val:n,cal:w,color:"#3b82f6"},{label:o("Protein"),val:c,cal:p,color:"#22c55e"}],u=42,x=50,$=50,T=7,z=2*Math.PI*u,P=T+z*4/360,D=b>0?Math.max(0,y/b*z-P):0,j=b>0?Math.max(0,w/b*z-P):0,F=b>0?Math.max(0,p/b*z-P):0,W=-90,K=W+(b>0?y/b*360:0),k=K+(b>0?w/b*360:0),O=r!==null?Math.round(r):null,l=Object.entries(Nt).filter(([I])=>t(i[I==="carbohydrates"?"carbs":I])!==null&&e.nutrition_basis==="per_serving").map(([I,X])=>{let B=t(i[I==="carbohydrates"?"carbs":I]),ee=Math.min(Math.round(B/X.val*100),999);return{key:I,label:X.label,val:B,unit:X.unit,pct:ee}});return h`
      <div class="nutr-card">
        <!-- Top row: donut ring + macro columns -->
        <div class="nutr-top">
          <div class="nutr-ring-wrap">
            <svg width="90" height="90" viewBox="0 0 100 100" style="display:block">
              <!-- Background track — always visible -->
              <circle cx="${x}" cy="${$}" r="${u}" fill="none"
                stroke="var(--rm-border)" stroke-width="7"/>
              <!-- Colored arcs: all 3 inline in the same html template so they
                   inherit SVG namespace from the parser. Hidden via opacity when
                   there's no data. Dynamic values are attributes, not new elements. -->
              <circle cx="${x}" cy="${$}" r="${u}" fill="none"
                stroke="#f59e0b" stroke-width="7" stroke-linecap="round"
                stroke-dasharray="${D} ${z}"
                transform="rotate(${W} ${x} ${$})"
                opacity="${b>0&&D>0?.95:0}"/>
              <circle cx="${x}" cy="${$}" r="${u}" fill="none"
                stroke="#3b82f6" stroke-width="7" stroke-linecap="round"
                stroke-dasharray="${j} ${z}"
                transform="rotate(${K} ${x} ${$})"
                opacity="${b>0&&j>0?.95:0}"/>
              <circle cx="${x}" cy="${$}" r="${u}" fill="none"
                stroke="#22c55e" stroke-width="7" stroke-linecap="round"
                stroke-dasharray="${F} ${z}"
                transform="rotate(${k} ${x} ${$})"
                opacity="${b>0&&F>0?.95:0}"/>
              <text x="${x}" y="${$-2}" text-anchor="middle"
                fill="var(--rm-text)" font-size="16" font-weight="700" font-family="inherit">
                ${O??"\u2013"}
              </text>
              <text x="${x}" y="${$+12}" text-anchor="middle"
                fill="var(--rm-text-secondary)" font-size="9" font-family="inherit">${o("cals")}</text>
            </svg>
          </div>

          <div class="nutr-macro-cols">
            ${g.map(I=>{let X=b>0?Math.round(I.cal/b*100):0;return h`
                <div class="nutr-macro-col">
                  <span class="nutr-mcol-num" style="color:${I.color}">${I.val!==null?`${I.val} g`:"\u2014"}</span>
                  <span class="nutr-mcol-label">${I.label}</span>
                  ${X>0?h`<span class="nutr-mcol-pct" style="color:${I.color}">${X}% cals</span>`:""}
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
          <button class="nutr-rda-toggle" @click=${()=>{this._nutritionExpanded=!this._nutritionExpanded}}>
            <span class="nutr-rda-title">${o("Daily RDA Nutrition")}</span>
            <span class="nutr-rda-count">${l.length}</span>
            <ha-icon icon="${this._nutritionExpanded?"mdi:chevron-up":"mdi:chevron-down"}"></ha-icon>
          </button>
          ${this._nutritionExpanded?h`
            <div class="nutr-rda-rows">
              ${l.map(I=>h`
                <div class="nutr-rda-row">
                  <span class="nutr-rda-label">${I.label}</span>
                  <span class="nutr-rda-val">${I.val} ${I.unit}</span>
                  <span class="nutr-rda-pct">${I.pct}%</span>
                  <div class="nutr-rda-bar-wrap">
                    <div class="nutr-rda-bar ${I.pct>100?"over":""}" style="width:${Math.min(I.pct,100)}%"></div>
                  </div>
                </div>
              `)}
            </div>
          `:""}
        `:""}
      </div>${this._renderOriginalNutrition(e)}
    `}_renderOriginalNutrition(e){let i=Object.entries(e.nutrition||{}).filter(([,t])=>t!==null&&t!=="");return i.length?h`<details class="nutr-original" open><summary>Original nutrition text</summary>${i.map(([t,r])=>h`<p><strong>${t}</strong> <span>${typeof r=="object"?JSON.stringify(r):r}</span></p>`)}</details>`:""}_renderPhotos(e){let i=e.photos||[],t=e.image_url,r=t?[t,...i.filter(n=>n!==t)]:i;return h`
      <div class="photos-tab">
        ${r.length?h`
          <div class="photos-grid">
            ${r.map(n=>h`
              <div class="photo-item ${n===t?"main-photo":""}">
                <img src="${this.api.transport.previewURL(n)||$e}" alt="${o("Recipe photo")}" loading="lazy" />
                ${n===t?h`<span class="photo-badge">${o("Main")}</span>`:h`
                  <button class="photo-action set-main" @click=${()=>this._setMainPhoto(n)} title="${o("Set as main photo")}">
                    <ha-icon icon="mdi:star-outline"></ha-icon>
                  </button>
                `}
                <button class="photo-action remove-photo" @click=${()=>this._removePhoto(n)} title="${o("Remove photo")}">
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
              @input=${n=>{this._photoUrlInput=n.target.value}}
              @keydown=${n=>{n.key==="Enter"&&this._handleAddPhotoUrl()}}
            />
            <button class="action-btn primary" ?disabled=${!this._photoUrlInput.trim()||this._addingPhotoUrl}
              @click=${this._handleAddPhotoUrl}>
              ${o("Add")}
            </button>
          </div>
          <div class="camera-btns">
            <label class="camera-btn-split">
              <ha-icon icon="mdi:camera"></ha-icon>
              <span>${o("Take Photo")}</span>
              <input type="file" accept="image/*" capture="environment" class="camera-input"
                @change=${this._handleCameraCapture} />
            </label>
            <label class="camera-btn-split">
              <ha-icon icon="mdi:image-multiple-outline"></ha-icon>
              <span>${o("Choose from Library")}</span>
              <input type="file" accept="image/*" class="camera-input"
                @change=${this._handleCameraCapture} />
            </label>
          </div>
        </div>
      </div>
    `}_renderEditPanel(){let e=this._editData;return h`
      <div class="edit-overlay" @click=${i=>{i.target===i.currentTarget&&this._cancelEdit()}}>
        <div class="edit-panel">
          <div class="edit-header">
            <span>${o("Edit Recipe")}</span>
            <button class="icon-btn" @click=${this._cancelEdit}><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
          <div class="edit-body">

            ${this._renderField(o("Name"),"name","text")}

            <!-- Image section -->
            <div class="edit-section-label">${o("Image")}</div>
            <div class="edit-photo-row">
              ${(()=>{let i=[...new Set([e.image_url,...e.photos||[]].filter(Boolean))];return h`
                  ${i.map(t=>h`
                    <div class="edit-photo-thumb ${t===e.image_url?"selected":""}"
                      @click=${()=>this._handleEditField("image_url",t)}
                      title="${o("Set as main image")}">
                      <img src="${this.api.transport.previewURL(t)||$e}" alt="" />
                      ${t===e.image_url?h`<span class="edit-thumb-badge"><ha-icon icon="mdi:check"></ha-icon></span>`:""}
                    </div>
                  `)}
                  <label class="edit-photo-add ${this._editImageUploading?"loading":""}" title="${o("Upload photo")}">
                    <input type="file" accept="image/*" style="display:none"
                      @change=${t=>{let r=t.target.files?.[0];r&&this._editUploadImage(r),t.target.value=""}} />
                    <ha-icon icon="${this._editImageUploading?"mdi:loading":"mdi:plus"}"></ha-icon>
                  </label>
                `})()}
            </div>
            <div class="edit-field">
              <label>${o("Or paste image URL")}</label>
              <input type="url" .value=${e.image_url??""}
                @input=${i=>this._handleEditField("image_url",i.target.value)}
                placeholder="https://…" />
            </div>

            ${this._renderField(o("Description"),"description","textarea")}
            ${this._renderField(o("Source URL"),"source_url","url")}
            ${this._saveError?h`<p role="alert">${this._saveError}</p>`:""}
            ${Ne(e,(i,t)=>this._handleEditField(i,t))}

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
                  <span class="edit-star ${i<=(e.rating||0)?"filled":""}"
                    @click=${()=>this._handleEditField("rating",e.rating===i?0:i)}
                  >★</span>
                `)}
              </div>
            </div>

            ${this._renderListPicker("tags",o("Tags"),this.allTags)}
            ${this._renderListPicker("courses",o("Courses"),this.allCourses)}
            ${this._renderListPicker("categories",o("Categories"),this.allCategories)}
            ${this._renderListPicker("collections",o("Collections"),this.allCollections)}
            ${this._renderField(o("Notes"),"notes","textarea")}

            <!-- Ingredients editor -->
            <div class="edit-section-label">${o(te`Ingredients (${(e.ingredients||[]).length})`)}</div>
            ${(e.ingredients||[]).length?h`
              <ul class="edit-ing-list">
                ${(e.ingredients||[]).map((i,t)=>{let r=this._editIngEdit?.idx===t,n=i.is_heading||i.name?.startsWith("#");if(r){let a=this._editIngEdit;return h`
                      <li class="edit-ing-inline-edit ${n?"edit-ing-heading":""}">
                        ${a.heading?h`
                          <input class="ing-inline-input ing-inline-name" type="text" placeholder="${o("Section header")}"
                            .value=${a.name}
                            @input=${c=>{this._editIngEdit={...a,name:c.target.value}}}
                            @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                        `:h`
                          <input class="ing-inline-input ing-inline-amt" type="text" placeholder="${o("Amt")}"
                            .value=${a.amount}
                            @input=${c=>{this._editIngEdit={...a,amount:c.target.value}}}
                            @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                          <input class="ing-inline-input ing-inline-unit" type="text" placeholder="${o("Unit")}"
                            .value=${a.unit}
                            @input=${c=>{this._editIngEdit={...a,unit:c.target.value}}}
                            @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                          <input class="ing-inline-input ing-inline-name" type="text" placeholder="${o("Ingredient")}"
                            .value=${a.name}
                            @input=${c=>{this._editIngEdit={...a,name:c.target.value}}}
                            @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                          />
                        `}
                        <button class="ing-inline-save" @click=${this._saveEditIngredient} title="${o("Save")}">
                          <ha-icon icon="mdi:check"></ha-icon>
                        </button>
                        <button class="ing-inline-cancel" @click=${this._cancelEditIngredient} title="${o("Cancel")}">
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      </li>
                    `}return h`
                    <li
                      draggable="true"
                      class="${n?"edit-ing-heading":""} ${this._dragIngOver===t?"drag-over":""}"
                      @dragstart=${a=>{this._dragIngFrom=t,a.dataTransfer.effectAllowed="move",a.dataTransfer.setData("text/plain",String(t))}}
                      @dragover=${a=>{a.preventDefault(),a.dataTransfer.dropEffect="move",this._dragIngOver!==t&&(this._dragIngOver=t)}}
                      @dragleave=${()=>{this._dragIngOver===t&&(this._dragIngOver=-1)}}
                      @drop=${a=>{a.preventDefault(),this._editDropIngredient(this._dragIngFrom,t)}}
                      @dragend=${()=>{this._dragIngOver=-1,this._dragIngFrom=-1}}
                    >
                      <ha-icon icon="mdi:drag-vertical" class="drag-handle"></ha-icon>
                      <span class="edit-ing-text" @click=${()=>this._startEditIngredient(t)} title="${o("Click to edit")}">
                        ${n?h`<strong>${i.name?.startsWith("#")?i.name.slice(1).trim():i.name}</strong>`:h`${i.amount?`${i.amount}${i.unit?" "+i.unit:""} `:""}${i.name}`}
                      </span>
                      <div class="edit-reorder-btns">
                        <button class="edit-move-btn" ?disabled=${t===0} @click=${()=>this._editMoveIngredient(t,-1)} title="${o("Move up")}">
                          <ha-icon icon="mdi:chevron-up"></ha-icon>
                        </button>
                        <button class="edit-move-btn" ?disabled=${t===e.ingredients.length-1} @click=${()=>this._editMoveIngredient(t,1)} title="${o("Move down")}">
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
                placeholder="${o('e.g. "2 cups flour" or "# Section Header"')}"
              />
              <button class="edit-add-btn" @click=${this._editAddIngredient}>${o("Add")}</button>
            </div>

            <!-- Instructions editor -->
            <div class="edit-section-label">${o(te`Directions (${(e.instructions||[]).length} steps)`)}</div>
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
                    <ha-icon icon="mdi:drag-vertical" class="drag-handle"></ha-icon>
                    <span class="edit-ing-text">${i}</span>
                    <div class="edit-reorder-btns">
                      <button class="edit-move-btn" ?disabled=${t===0} @click=${()=>this._editMoveStep(t,-1)} title="${o("Move up")}">
                        <ha-icon icon="mdi:chevron-up"></ha-icon>
                      </button>
                      <button class="edit-move-btn" ?disabled=${t===e.instructions.length-1} @click=${()=>this._editMoveStep(t,1)} title="${o("Move down")}">
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
                placeholder="${o("Type a step, press Enter to add\u2026")}"
              ></textarea>
              <button class="edit-add-btn" @click=${()=>{this._editAddStep(this._editStepInput),this._editStepInput=""}}>${o("Add")}</button>
            </div>

            <!-- Nutrition section -->
            <div class="edit-section-label">${o("Nutrition Facts (per serving)")}</div>
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
            <button class="action-btn danger-outline" @click=${this._handleDeleteRecipe}
              title="${this._confirmDelete?o("Click again to confirm delete"):o("Delete recipe")}">
              <ha-icon icon="${this._confirmDelete?"mdi:alert":"mdi:trash-can-outline"}"></ha-icon>
              ${this._confirmDelete?o("Confirm?"):o("Delete")}
            </button>
            <div class="edit-footer-right">
              <button class="action-btn" @click=${this._cancelEdit}>${o("Cancel")}</button>
              <button class="action-btn primary" @click=${this._saveEdit}>${o("Save")}</button>
            </div>
          </div>
        </div>
      </div>
    `}_renderField(e,i,t){let r=this._editData[i]??"";return t==="textarea"?h`
        <div class="edit-field">
          <label>${e}</label>
          <textarea
            .value=${r}
            @input=${n=>this._handleEditField(i,n.target.value)}
            rows="3"
          ></textarea>
        </div>
      `:h`
      <div class="edit-field">
        <label>${e}</label>
        <input
          type="${t}"
          .value=${String(r)}
          @input=${n=>this._handleEditField(i,n.target.value)}
        />
      </div>
    `}static styles=pe`
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

  `};try{customElements.define("rm-recipe-detail",Ge)}catch{}var wt=Rt(xt(),1);var He=class extends he{static properties={api:{type:Object},asPanel:{type:Boolean},inlineMode:{type:Boolean},_mode:{type:String},_url:{type:String},_scraping:{type:Boolean},_remoteConsent:{type:Boolean},_scrapeError:{type:String},_form:{type:Object},_saving:{type:Boolean},_ingredientInput:{type:String},_ratingHover:{type:Number},_importFile:{type:Object},_importing:{type:Boolean},_importResult:{type:Object},_importError:{type:String},_importDownloadImages:{type:Boolean}};constructor(){super(),this.api=null,this.asPanel=!1,this.inlineMode=!1,this._mode="url",this._url="",this._scraping=!1,this._scrapeError=null,this._saving=!1,this._ingredientInput="",this._ratingHover=0,this._remoteConsent=!1,this._form=this._emptyForm(),this._importFile=null,this._importing=!1,this._importResult=null,this._importError=null,this._importDownloadImages=!0}_emptyForm(){return{nutrition_basis:"unknown",declared_nutrition:{},name:"",description:"",source_url:"",servings:"",prep_time:"",cook_time:"",image_url:"",tags:"",courses:"",categories:"",collections:"",rating:0,notes:"",ingredients:[],instructions:[],cal:"",fat:"",satf:"",chol:"",sod:"",carb:"",fib:"",sug:"",prot:""}}_close(){this.dispatchEvent(new CustomEvent("rm-close",{bubbles:!0,composed:!0}))}async _handleScrape(){if(!(!this._url.trim()||this._scraping||!this._remoteConsent)){this._scraping=!0,this._scrapeError=null;try{let e=await this.api.scrapeRecipe(this._url.trim(),this._remoteConsent);if(e?.recipe){let i=e.recipe;this._importedRecipe=structuredClone(i);let t=i.nutrition||{};this._form={nutrition_basis:i.nutrition_basis||"unknown",declared_nutrition:{...i.declared_nutrition||{}},name:i.name||"",description:i.description||"",source_url:i.source_url||this._url.trim(),servings:i.servings||"",prep_time:i.prep_time||"",cook_time:i.cook_time||"",image_url:i.media_refs?.image_url??i.image_url??"",tags:(i.tags||[]).join(", "),courses:(i.courses||[]).join(", "),categories:(i.categories||[]).join(", "),collections:(i.collections||[]).join(", "),rating:i.rating||0,notes:i.notes||"",ingredients:i.ingredients||[],instructions:i.instructions||[],cal:t.calories??"",fat:t.fat??"",satf:t.saturated_fat??"",chol:t.cholesterol??"",sod:t.sodium??"",carb:t.carbohydrates??"",fib:t.fiber??"",sug:t.sugar??"",prot:t.protein??""},this._mode="manual"}else this._scrapeError=e?.error||o("Could not extract recipe from this URL.")}catch(e){this._scrapeError=e.message||o("Scraping failed.")}finally{this._scraping=!1}}}_handleImportFileChange(e){this._importFile=e.target.files[0]||null,this._importResult=null,this._importError=null}async _handleImport(){if(!(!this._importFile||this._importing)){this._importing=!0,this._importError=null,this._importResult=null;try{if(this._importFile.size>8e6)throw new Error("Archive exceeds the 8 MB upload limit.");let e;if(this._importDownloadImages){let i=await new Promise((t,r)=>{let n=new FileReader;n.onload=()=>t(String(n.result).split(",")[1]),n.onerror=()=>r(new Error("File could not be read.")),n.readAsDataURL(this._importFile)});e=await this.api.transport.call("recipe_keeper_import",{base64_data:i})}else{let i=await wt.default.loadAsync(this._importFile),t=Object.values(i.files);if(t.length>2e3||t.some(a=>[a.name,a.unsafeOriginalName].filter(Boolean).some(c=>c.startsWith("/")||c.includes("\\")||c.split("/").includes(".."))))throw new Error("Unsafe archive members.");let r=t.find(a=>!a.dir&&a.name.endsWith(".html"));if(!r||!Number.isFinite(r._data?.uncompressedSize)||r._data.uncompressedSize>8e6||r._data.uncompressedSize/Math.max(1,r._data.compressedSize)>100)throw new Error("Missing or oversized Recipe Keeper HTML.");let n=await r.async("text");if(n.length>8e6)throw new Error("Recipe Keeper HTML exceeds the limit.");e=await this.api.importRecipeKeeper(n)}this._importResult=e,e.imported>0&&this.dispatchEvent(new CustomEvent("rm-import-done",{bubbles:!0,composed:!0}))}catch(e){this._importError=e.code?e.message:"Archive could not be read safely."}finally{this._importing=!1}}}async _handleSave(){if(!(!this._form.name.trim()||this._saving)){this._saving=!0;try{let e=this._form,i=_=>_?_.split(",").map(w=>w.trim()).filter(Boolean):[],t={cal:"calories",fat:"fat",satf:"saturated_fat",chol:"cholesterol",sod:"sodium",carb:"carbohydrates",fib:"fiber",sug:"sugar",prot:"protein"},r={},n=!1;for(let[_,w]of Object.entries(t))e[_]!==""&&e[_]!=null&&(r[w]=e[_],n=!0);let c={...Object.fromEntries(Object.entries(this._importedRecipe||{}).filter(([_])=>Object.hasOwn(this.api.transport.actions.recipes_add?.schema.properties||{},_))),name:e.name,description:e.description,source_url:e.source_url,image_url:e.image_url,servings:e.servings===""?null:Number(e.servings),prep_time:e.prep_time===""?null:Number(e.prep_time),cook_time:e.cook_time===""?null:Number(e.cook_time),tags:i(e.tags),courses:i(e.courses),categories:i(e.categories),collections:i(e.collections),rating:e.rating||null,notes:e.notes,ingredients:e.ingredients,instructions:e.instructions,nutrition:n?r:null,nutrition_basis:e.nutrition_basis||"unknown",declared_nutrition:Me(e.declared_nutrition)};await this.api.addRecipe(c),this.dispatchEvent(new CustomEvent("rm-import-done",{bubbles:!0,composed:!0})),this._importedRecipe=null,this._form=this._emptyForm()}catch(e){this._saveError=e.message,this.requestUpdate()}finally{this._saving=!1}}}_setField(e,i){this._form={...this._form,[e]:i}}_addIngredient(){let e=this._ingredientInput.trim();if(!e)return;let i;if(e.startsWith("#"))i={name:e,is_heading:!0};else{let t=e.split(/\s+/),r="",n="",a="";t.length>=3&&!isNaN(parseFloat(t[0]))?(r=t[0],n=t[1],a=t.slice(2).join(" ")):t.length===2&&!isNaN(parseFloat(t[0]))?(r=t[0],a=t[1]):a=e,i={amount:r,unit:n,name:a}}this._form={...this._form,ingredients:[...this._form.ingredients,i]},this._ingredientInput=""}_addIngredientsBulk(e){let t=e.split(`
`).map(r=>r.trim()).filter(Boolean).map(r=>{if(r.startsWith("#"))return{name:r,is_heading:!0};let n=r.split(/\s+/),a="",c="",_="";return n.length>=3&&!isNaN(parseFloat(n[0]))?(a=n[0],c=n[1],_=n.slice(2).join(" ")):n.length===2&&!isNaN(parseFloat(n[0]))?(a=n[0],_=n[1]):_=r,{amount:a,unit:c,name:_}});t.length&&(this._form={...this._form,ingredients:[...this._form.ingredients,...t]})}_removeIngredient(e){this._form={...this._form,ingredients:this._form.ingredients.filter((i,t)=>t!==e)}}_addStep(e){e.trim()&&(this._form={...this._form,instructions:[...this._form.instructions,e.trim()]})}_removeStep(e){this._form={...this._form,instructions:this._form.instructions.filter((i,t)=>t!==e)}}_renderPanelContent(){return h`
      <div class="dialog-header">
        <div class="mode-toggle">
          <button class="mode-btn ${this._mode==="url"?"active":""}" @click=${()=>{this._mode="url"}}>
            <ha-icon icon="mdi:link-variant"></ha-icon> ${o("From URL")}
          </button>
          <button class="mode-btn ${this._mode==="manual"?"active":""}" @click=${()=>{this._mode="manual"}}>
            <ha-icon icon="mdi:pencil-outline"></ha-icon> ${o("Manual")}
          </button>
          <button class="mode-btn ${this._mode==="import"?"active":""}" @click=${()=>{this._mode="import"}}>
            <ha-icon icon="mdi:import"></ha-icon> ${o("Import")}
          </button>
        </div>
        ${this.inlineMode?"":h`<button class="icon-btn" @click=${this._close}><ha-icon icon="mdi:close"></ha-icon></button>`}
      </div>

      <div class="dialog-body">
        ${this._mode==="url"?this._renderUrlMode():""}
        ${this._mode==="import"?this._renderImportMode():""}
        ${this._mode==="manual"?this._renderManualMode():""}
      </div>

      ${this._mode==="manual"?h`
        <div class="dialog-footer">
          <button class="action-btn" @click=${this._close}>${o("Cancel")}</button>
          <button
            class="action-btn primary"
            ?disabled=${!this._form.name.trim()||this._saving}
            @click=${this._handleSave}
          >
            ${this._saving?h`<ha-circular-progress active size="tiny"></ha-circular-progress>`:h`<ha-icon icon="mdi:content-save-outline"></ha-icon>`}
            ${o("Save Recipe")}
          </button>
        </div>
      `:""}
    `}render(){return this.inlineMode?h`<div class="dialog-panel inline-panel">${this._renderPanelContent()}</div>`:h`
      <div class="dialog-overlay ${this.asPanel?"panel-mode":""}" @click=${e=>{e.target===e.currentTarget&&this._close()}}>
        <div class="dialog-panel">${this._renderPanelContent()}</div>
      </div>
    `}_renderImportMode(){return h`
      <div class="import-mode">
        <div class="import-info">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div>
            <strong>${o("Recipe Keeper import")}</strong><br/>
            ${o(h`Export your recipes from the Recipe Keeper app
            (<em>Menu → Export → Recipe Keeper File</em>), then select the
            exported <code>.zip</code> file below. Recipe photos will be saved
            locally if available.`)}
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
          <div class="import-result ${this._importResult.failed>0?"partial":"success"}">
            <ha-icon icon="${this._importResult.failed>0?"mdi:alert-circle-outline":"mdi:check-circle-outline"}"></ha-icon>
            <div>
              <strong>${o(te`${this._importResult.imported} recipe${this._importResult.imported!==1?"s":""} imported`)}</strong>
              ${this._importResult.imagesSaved>0?h` ${o(te`with ${this._importResult.imagesSaved} photo${this._importResult.imagesSaved!==1?"s":""}`)}`:""}
              ${this._importResult.failed>0?h`<br/><small>${o(te`${this._importResult.failed} failed — check HA logs for details`)}</small>`:""}
            </div>
          </div>
        `:this._importError?h`
          <div class="import-result error">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <div><strong>${o("Import failed")}</strong><br/><small>${this._importError}</small></div>
          </div>
        `:""}

        <button
          class="action-btn primary import-btn"
          ?disabled=${!this._importFile||this._importing}
          @click=${this._handleImport}
        >
          ${this._importing?h`<ha-circular-progress active size="tiny"></ha-circular-progress> ${o("Importing\u2026")}`:h`<ha-icon icon="mdi:import"></ha-icon> ${o("Import Recipes")}`}
        </button>
      </div>
    `}_renderUrlMode(){return h`
      <div class="url-mode">
        <div class="url-hint">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          ${o("Paste a recipe URL to automatically extract the recipe details.")}
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
            ${this._scraping?h`<ha-circular-progress active size="tiny"></ha-circular-progress>`:h`<ha-icon icon="mdi:download-outline"></ha-icon>`}
            ${o("Fetch")}
          </button>
        </div>
        ${this._scrapeError?h`
          <div class="error-msg">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            ${this._scrapeError}
          </div>
          <button class="action-btn" @click=${()=>{this._mode="manual",this._form={...this._emptyForm(),source_url:this._url}}}>
            ${o("Enter manually instead")}
          </button>
        `:""}
      </div>
    `}_renderManualMode(){let e=this._form,i=this._ratingHover||e.rating||0;return h`
      <div class="manual-mode">
        ${this._saveError?h`<p role="alert">${this._saveError}</p>`:""}
        ${Ne(e,(t,r)=>this._setField(t,r))}

        <!-- Name -->
        <div class="field">
          <label>${o("Recipe Name *")}</label>
          <input type="text" .value=${e.name}
            @input=${t=>this._setField("name",t.target.value)}
            placeholder="${o("e.g. Spaghetti Bolognese")}" />
        </div>

        <!-- Description -->
        <div class="field">
          <label>${o("Description")}</label>
          <textarea rows="2" .value=${e.description}
            @input=${t=>this._setField("description",t.target.value)}
            placeholder="${o("Short description\u2026")}"></textarea>
        </div>

        <!-- Source URL + Image URL -->
        <div class="field-row">
          <div class="field">
            <label>${o("Source URL")}</label>
            <input type="url" .value=${e.source_url}
              @input=${t=>this._setField("source_url",t.target.value)}
              placeholder="https://…" />
          </div>
          <div class="field">
            <label>${o("Image URL")}</label>
            <input type="url" .value=${e.image_url}
              @input=${t=>this._setField("image_url",t.target.value)}
              placeholder="https://…/image.jpg" />
          </div>
        </div>

        <!-- Times + servings -->
        <div class="field-row-3">
          <div class="field">
            <label>${o("Prep (min)")}</label>
            <input type="number" .value=${String(e.prep_time)}
              @input=${t=>this._setField("prep_time",t.target.value)} placeholder="15" min="0" />
          </div>
          <div class="field">
            <label>${o("Cook (min)")}</label>
            <input type="number" .value=${String(e.cook_time)}
              @input=${t=>this._setField("cook_time",t.target.value)} placeholder="30" min="0" />
          </div>
          <div class="field">
            <label>${o("Servings")}</label>
            <input type="number" .value=${String(e.servings)}
              @input=${t=>this._setField("servings",t.target.value)} placeholder="4" min="1" />
          </div>
        </div>

        <!-- Rating -->
        <div class="field">
          <label>${o("Rating")}</label>
          <div class="star-row"
            @mouseleave=${()=>{this._ratingHover=0}}>
            ${[1,2,3,4,5].map(t=>h`
              <span
                class="star ${t<=i?"filled":""}"
                @mouseenter=${()=>{this._ratingHover=t}}
                @click=${()=>this._setField("rating",e.rating===t?0:t)}
              >★</span>
            `)}
            ${e.rating?h`<button class="clear-rating" @click=${()=>this._setField("rating",0)}>${o("Clear")}</button>`:""}
          </div>
        </div>

        <!-- Categorisation row -->
        <div class="field">
          <label>${o("Tags (comma-separated)")}</label>
          <input type="text" .value=${e.tags}
            @input=${t=>this._setField("tags",t.target.value)}
            placeholder="${o("quick, weeknight, family")}" />
        </div>

        <div class="field">
          <label>${o("Courses (comma-separated)")}</label>
          <input type="text" .value=${e.courses}
            @input=${t=>this._setField("courses",t.target.value)}
            placeholder="${o("Dinner, Main Course")}" />
        </div>

        <div class="field-row">
          <div class="field">
            <label>${o("Categories (comma-separated)")}</label>
            <input type="text" .value=${e.categories}
              @input=${t=>this._setField("categories",t.target.value)}
              placeholder="${o("Italian, Gluten Free")}" />
          </div>
          <div class="field">
            <label>${o("Collections (comma-separated)")}</label>
            <input type="text" .value=${e.collections}
              @input=${t=>this._setField("collections",t.target.value)}
              placeholder="${o("30 Minutes, Summer")}" />
          </div>
        </div>

        <!-- Ingredients -->
        <div class="field">
          <label>${o(te`Ingredients (${e.ingredients.length})`)}</label>
          ${e.ingredients.length?h`
            <ul class="ing-list">
              ${e.ingredients.map((t,r)=>h`
                <li class="${t.is_heading||t.name?.startsWith("#")?"ing-heading":""}">
                  <span class="ing-text">
                    ${t.is_heading||t.name?.startsWith("#")?h`<strong>${t.name?.startsWith("#")?t.name.slice(1).trim():t.name}</strong>`:h`${t.amount?`${t.amount}${t.unit?" "+t.unit:""} `:""}${t.name}`}
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
              placeholder='${o('e.g. "2 cups flour", "salt", or "# Section"')}'
            />
            <button class="action-btn sm" @click=${this._addIngredient}>${o("Add")}</button>
          </div>
          <div class="bulk-hint">
            ${o(h`Tip: Use <code>#Section Name</code> to add a section header. Or paste multiple lines at once:`)}
            <button class="action-btn sm bulk-btn" @click=${()=>{let t=prompt(o("Paste ingredients (one per line, use # for headers):"));t&&this._addIngredientsBulk(t)}}>
              <ha-icon icon="mdi:text-box-multiple-outline"></ha-icon> ${o("Bulk paste")}
            </button>
          </div>
        </div>

        <!-- Directions -->
        <div class="field">
          <label>${o(te`Directions (${e.instructions.length} steps)`)}</label>
          ${e.instructions.length?h`
            <ol class="steps-edit">
              ${e.instructions.map((t,r)=>h`
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
              placeholder="${o("Type a step, press Enter to add\u2026")}"
            ></textarea>
            <button class="action-btn sm" @click=${t=>{let r=t.target.closest(".add-row").querySelector("textarea");this._addStep(r.value),r.value=""}}>${o("Add")}</button>
          </div>
        </div>

        <!-- Notes -->
        <div class="field">
          <label>${o("Notes")}</label>
          <textarea rows="2" .value=${e.notes}
            @input=${t=>this._setField("notes",t.target.value)}
            placeholder="${o("Variations, tips\u2026")}"></textarea>
        </div>

        <!-- Nutrition -->
        <div class="section-divider">${o("Nutrition Facts (per serving \u2014 optional)")}</div>
        <div class="field-row-3">
          <div class="field">
            <label>${o("Calories (kcal)")}</label>
            <input type="number" .value=${String(e.cal)}
              @input=${t=>this._setField("cal",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${o("Protein (g)")}</label>
            <input type="number" .value=${String(e.prot)}
              @input=${t=>this._setField("prot",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${o("Fat (g)")}</label>
            <input type="number" .value=${String(e.fat)}
              @input=${t=>this._setField("fat",t.target.value)} placeholder="0" min="0" />
          </div>
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>${o("Saturated Fat (g)")}</label>
            <input type="number" .value=${String(e.satf)}
              @input=${t=>this._setField("satf",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${o("Carbohydrates (g)")}</label>
            <input type="number" .value=${String(e.carb)}
              @input=${t=>this._setField("carb",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${o("Dietary Fiber (g)")}</label>
            <input type="number" .value=${String(e.fib)}
              @input=${t=>this._setField("fib",t.target.value)} placeholder="0" min="0" />
          </div>
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>${o("Sugars (g)")}</label>
            <input type="number" .value=${String(e.sug)}
              @input=${t=>this._setField("sug",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${o("Sodium (mg)")}</label>
            <input type="number" .value=${String(e.sod)}
              @input=${t=>this._setField("sod",t.target.value)} placeholder="0" min="0" />
          </div>
          <div class="field">
            <label>${o("Cholesterol (mg)")}</label>
            <input type="number" .value=${String(e.chol)}
              @input=${t=>this._setField("chol",t.target.value)} placeholder="0" min="0" />
          </div>
        </div>

      </div>
    `}static styles=pe`
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
      background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
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
  `};try{customElements.define("rm-add-recipe-dialog",He)}catch{}var Bt=["breakfast","lunch","dinner","snack"],Ke=class extends he{static properties={api:{type:Object},recipes:{type:Array},settings:{type:Object},fromRecipe:{type:Object},_weekStart:{type:String},_plan:{type:Array},_loading:{type:Boolean},_showPicker:{type:Boolean},_pickerTarget:{type:Object},_pickerSearch:{type:String},_pickerServings:{type:Number}};constructor(){super(),this.api=null,this.recipes=[],this.settings={},this.fromRecipe=null,this._plan=[],this._loading=!1,this._showPicker=!1,this._pickerTarget=null,this._pickerSearch="",this._pickerServings=2,this._weekStart=this._getMondayISO(new Date)}updated(e){(e.has("api")||e.has("_weekStart"))&&this.api&&this._loadPlan()}_getMondayISO(e){let i=e.getDay(),t=i===0?-6:1-i,r=new Date(e);r.setDate(r.getDate()+t);let n=r.getFullYear(),a=String(r.getMonth()+1).padStart(2,"0"),c=String(r.getDate()).padStart(2,"0");return`${n}-${a}-${c}`}_addDays(e,i){let t=new Date(e+"T00:00:00Z");return t.setUTCDate(t.getUTCDate()+i),t.toISOString().split("T")[0]}_formatDisplayDate(e){return new Date(e+"T00:00:00Z").getUTCDate().toString()}_formatMonthYear(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{month:"long",year:"numeric",timeZone:"UTC"})}_formatDayName(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{weekday:"short",timeZone:"UTC"})}_prevWeek(){this._weekStart=this._addDays(this._weekStart,-7)}_nextWeek(){this._weekStart=this._addDays(this._weekStart,7)}_isCurrentWeek(){return this._weekStart===this._getMondayISO(new Date)}async _loadPlan(){this._loading=!0;try{let e=await this.api.getMealPlan(this._weekStart);this._plan=e?.entries??[]}catch{this._plan=[]}finally{this._loading=!1}}_getEntriesForSlot(e,i){return this._plan.filter(t=>t.date===e&&t.meal_type===i)}_openPicker(e,i){this._pickerTarget={date:e,mealType:i},this._pickerSearch="",this._pickerServings=2,this._showPicker=!0}async _handlePickRecipe(e){this._pickerTarget&&(await this.api.addToMealPlan(e.id,this._pickerTarget.date,this._pickerTarget.mealType,this._pickerServings),this._showPicker=!1,await this._loadPlan())}async _handleRemoveEntry(e){await this.api.removeFromMealPlan(e),await this._loadPlan()}async _handleClearWeek(){await this.api.clearMealPlanWeek(this._weekStart),await this._loadPlan()}_openRecipeDetail(e){let i=this.recipes.find(t=>t.id===e.recipe_id);i&&this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:i},bubbles:!0,composed:!0}))}_mealTypeLabel(e){switch(e){case"breakfast":return o("Breakfast");case"lunch":return o("Lunch");case"dinner":return o("Dinner");case"snack":return o("Snack");default:return e}}get _pickerFiltered(){let e=this._pickerSearch.trim().toLowerCase();return e?this.recipes.filter(i=>i.name?.toLowerCase().includes(e)||i.tags?.some(t=>t.toLowerCase().includes(e))):this.recipes}render(){let e=Array.from({length:7},(t,r)=>this._addDays(this._weekStart,r)),i=new Date().toISOString().split("T")[0];return h`
      <div class="planner-container">
        ${this.fromRecipe?h`
          <div class="back-to-recipe">
            <button class="back-recipe-btn" @click=${()=>this.dispatchEvent(new CustomEvent("rm-back-to-recipe",{bubbles:!0,composed:!0}))}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
              <span>${o(te`Back to ${this.fromRecipe.name}`)}</span>
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
            ${this._isCurrentWeek()?h`<span class="today-badge">${o("This week")}</span>`:h`
              <button class="text-link" @click=${()=>{this._weekStart=this._getMondayISO(new Date)}}>${o("Today")}</button>
            `}
          </div>
          <button class="nav-btn" @click=${this._nextWeek}>
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </button>
        </div>

        <!-- Day headers -->
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
            <div class="plan-loading"><ha-circular-progress active></ha-circular-progress></div>
          `:h`
            ${Bt.map(t=>h`
              <div class="meal-row">
                <div class="meal-label">${this._mealTypeLabel(t)}</div>
                <div class="meal-cells">
                  ${e.map(r=>{let n=this._getEntriesForSlot(r,t);return h`
                      <div class="meal-cell ${r===i?"today":""}">
                        ${n.map(a=>{let c=this.recipes.find(_=>_.id===a.recipe_id);return h`
                            <div class="meal-entry" @click=${()=>this._openRecipeDetail(a)}>
                              ${c?.image_url?h`
                                <img src="${c.image_url}" alt="${c?.name||""}" class="entry-thumb" />
                              `:h`
                                <div class="entry-thumb entry-placeholder"><ha-icon icon="mdi:food"></ha-icon></div>
                              `}
                              <span class="entry-name">${c?.name??o("Unknown")}</span>
                              ${a.servings&&a.servings!==1?h`
                                <span class="entry-servings">×${a.servings}</span>
                              `:""}
                              <button
                                class="entry-remove"
                                @click=${_=>{_.stopPropagation(),this._handleRemoveEntry(a.id)}}
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
          ${this._plan.length?h`
            <div class="clear-row">
              <button class="text-danger-btn" @click=${this._handleClearWeek}>
                <ha-icon icon="mdi:calendar-remove-outline"></ha-icon>
                ${o("Clear this week")}
              </button>
            </div>
          `:""}
        </div>

        <!-- Recipe picker dialog -->
        ${this._showPicker?this._renderPicker():""}
      </div>
    `}_renderPicker(){let e=this._pickerTarget;return h`
      <div class="picker-overlay" @click=${i=>{i.target===i.currentTarget&&(this._showPicker=!1)}}>
        <div class="picker-panel">
          <div class="picker-header">
            <span>${o(te`Add to ${this._mealTypeLabel(e.mealType)}`)}</span>
            <button class="icon-btn" @click=${()=>{this._showPicker=!1}}><ha-icon icon="mdi:close"></ha-icon></button>
          </div>
          <div class="picker-servings-row">
            <span class="picker-label">${o("Servings:")}</span>
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
              placeholder="${o("Search recipes\u2026")}"
              .value=${this._pickerSearch}
              @input=${i=>{this._pickerSearch=i.target.value}}
            />
          </div>
          <div class="picker-list">
            ${this._pickerFiltered.length===0?h`
              <div class="picker-empty">${o("No recipes found")}</div>
            `:this._pickerFiltered.map(i=>h`
              <div class="picker-item" @click=${()=>this._handlePickRecipe(i)}>
                ${i.image_url?h`
                  <img src="${i.image_url}" alt="${i.name}" class="picker-thumb" />
                `:h`
                  <div class="picker-thumb picker-placeholder"><ha-icon icon="mdi:food"></ha-icon></div>
                `}
                <div class="picker-info">
                  <span class="picker-name">${i.name}</span>
                  ${i.tags?.length?h`<span class="picker-tags">${i.tags.slice(0,2).join(", ")}</span>`:""}
                </div>
                ${i.is_favourite?h`<ha-icon icon="mdi:heart" class="picker-fav"></ha-icon>`:""}
              </div>
            `)}
          </div>
        </div>
      </div>
    `}static styles=pe`
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
      min-height: 44px;
      min-width: 44px;
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
      background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
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
  `};try{customElements.define("rm-meal-planner",Ke)}catch{}var yt="unified",jt=[["en","English"],["es","Espa\xF1ol"],["fr","Fran\xE7ais"],["de","Deutsch"],["pt","Portugu\xEAs"],["nl","Nederlands"],["it","Italiano"]],Qe=class extends he{static properties={hass:{type:Object},settings:{type:Object},_activeTab:{type:String},_rmVersion:{type:String},_rmcVersion:{type:String},_backupState:{type:String}};constructor(){super(),this.settings={},this._activeTab="appearance",this._rmVersion="\u2026",this._rmcVersion="\u2026",this._backupState=null}updated(e){e.has("hass")&&this.hass&&this._rmVersion==="\u2026"&&this._fetchVersionsFromHacs()}async _backup(){if(this._backupState!=="loading"){this._backupState="loading";try{let e=await this.hass.callWS({type:"recipe_manager/backup"}),i=JSON.stringify(e,null,2),t=new Blob([i],{type:"application/json"}),r=URL.createObjectURL(t),n=document.createElement("a");n.href=r,n.download=`macromate-backup-${new Date().toISOString().slice(0,10)}.json`,n.click(),URL.revokeObjectURL(r),this._backupState="done"}catch(e){console.error("[RM] Backup failed:",e),this._backupState="error"}setTimeout(()=>{this._backupState=null},3e3)}}_fetchVersionsFromHacs(){this.hass&&(this._rmVersion="\u2026",this._rmcVersion="\u2026",this.hass.callWS({type:"recipe_manager/get_info"}).then(e=>{this._rmVersion=e.version||"\u2014",this._rmcVersion=yt}).catch(()=>{this._rmVersion="\u2014",this._rmcVersion=yt}))}_update(e){let i={...this.settings,...e};this.dispatchEvent(new CustomEvent("rm-settings-change",{detail:{settings:i},bubbles:!0,composed:!0}))}render(){let e=this.settings;return h`
      <div class="settings-root">
        <div class="tab-bar">
          ${[["appearance","mdi:palette-outline",o("Appearance")],["advanced","mdi:tune-variant",o("Advanced")],["sync","mdi:cloud-sync-outline",o("Sync")],["help","mdi:help-circle-outline",o("Help")]].map(([i,t,r])=>h`
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
    `}_renderAppearance(e){let i=e.theme==="midnight"||e.theme==="ember"||e.theme==="neon",t=e.theme==="arctic"||e.theme==="meadow"||e.theme==="ocean"||e.theme==="glass-wave",r=i||t;return h`
      <!-- ── Language & Units ── -->
      <div class="section">
        <div class="section-label">${o("Language & Units")}</div>

        <div class="setting-row">
          <span class="setting-name">${o("Language")}</span>
          <select class="theme-select" @change=${n=>this._update({language:n.target.value})}>
            ${jt.map(([n,a])=>h`
              <option value="${n}" ?selected=${(e.language??"en")===n}>${a}</option>
            `)}
          </select>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Preferred units")}</span>
          <div class="btn-group">
            ${[["imperial",o("Imperial")],["metric",o("Metric")]].map(([n,a])=>h`
              <button class="seg-btn ${(e.unitSystem??"imperial")===n?"active":""}"
                @click=${()=>this._update({unitSystem:n})}>${a}</button>
            `)}
          </div>
        </div>
      </div>

      <!-- ── Theme ── -->
      <div class="section">
        <div class="section-label">${o("Theme")}</div>

        <div class="setting-row">
          <span class="setting-name">${o("Colour theme")}</span>
          <select class="theme-select" @change=${n=>this._update({theme:n.target.value})}>
            <optgroup label="${o("Adaptive")}">
              <option value="soft"     ?selected=${e.theme==="soft"||!e.theme}>${o("\u{1F3A8} Soft Pastel")}</option>
              <option value="blossom"  ?selected=${e.theme==="blossom"}>${o("\u{1F338} Blossom")}</option>
            </optgroup>
            <optgroup label="${o("Light Themes")}">
              <option value="glass-wave" ?selected=${e.theme==="glass-wave"}>Glass Wave</option>
              <option value="arctic"   ?selected=${e.theme==="arctic"}>${o("\u{1F9CA} Arctic")}</option>
              <option value="meadow"   ?selected=${e.theme==="meadow"}>${o("\u{1F33F} Meadow")}</option>
              <option value="ocean"    ?selected=${e.theme==="ocean"}>${o("\u{1F30A} Ocean Blue")}</option>
            </optgroup>
            <optgroup label="${o("Dark Themes")}">
              <option value="midnight" ?selected=${e.theme==="midnight"}>${o("\u{1F319} Midnight Ocean")}</option>
              <option value="ember"    ?selected=${e.theme==="ember"}>${o("\u{1F525} Ember")}</option>
              <option value="neon"     ?selected=${e.theme==="neon"}>${o("\u{1F347} Purple & Cyan")}</option>
            </optgroup>
          </select>
        </div>

        ${r?h`
          <div class="setting-row muted-row">
            <span class="setting-name">${o("Dark mode")}</span>
            <span class="muted-note">${i?o("Always dark for this theme"):o("Always light for this theme")}</span>
          </div>
        `:h`
          <div class="setting-row">
            <span class="setting-name">${o("Dark mode")}</span>
            <div class="btn-group">
              ${[["off",o("Light")],["system",o("Auto")],["on",o("Dark")]].map(([n,a])=>h`
                <button class="seg-btn ${e.darkMode===n?"active":""}"
                  @click=${()=>this._update({darkMode:n})}>${a}</button>
              `)}
            </div>
          </div>
        `}

        <div class="setting-row">
          <span class="setting-name">${o("Text size")}</span>
          <div class="btn-group">
            ${[["small",o("S")],["medium",o("M")],["large",o("L")]].map(([n,a])=>h`
              <button class="seg-btn ${e.fontSize===n?"active":""}"
                @click=${()=>this._update({fontSize:n})}>${a}</button>
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
            ${[2,3,4,5,8,10].map(n=>h`
              <button class="seg-btn ${e.columns===n?"active":""}"
                @click=${()=>this._update({columns:n})}>${n}</button>
            `)}
          </div>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Favourites section")}</span>
          <label class="toggle">
            <input type="checkbox" ?checked=${e.showFavourites}
              @change=${n=>this._update({showFavourites:n.target.checked})} />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Recent recipes count")}</span>
            <span class="setting-hint">${o("Recipes shown in the Recent filter tab")}</span>
          </div>
          <div class="btn-group">
            ${[6,12,24].map(n=>h`
              <button class="seg-btn ${(e.recentCount??12)===n?"active":""}"
                @click=${()=>this._update({recentCount:n})}>${n}</button>
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
            <input type="checkbox" ?checked=${e.showPlanner}
              @change=${n=>this._update({showPlanner:n.target.checked})} />
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
          <select class="theme-select" @change=${i=>this._update({timerSound:i.target.value})}>
            <option value="beep"  ?selected=${(e.timerSound??"beep")==="beep"}>${o("Beep")}</option>
            <option value="ding"  ?selected=${e.timerSound==="ding"}>${o("Ding")}</option>
            <option value="alarm" ?selected=${e.timerSound==="alarm"}>${o("Alarm (3 beeps)")}</option>
            <option value="none"  ?selected=${e.timerSound==="none"}>${o("Silent")}</option>
            <option value="file"  ?selected=${e.timerSound==="file"}>${o("Custom file\u2026")}</option>
          </select>
        </div>

        ${e.timerSound==="file"?h`
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">${o("Sound file")}</span>
              <span class="setting-hint">${e.timerSoundFileName||o("No file selected")}</span>
            </div>
            <label class="file-label">
              <input type="file" accept="audio/*" class="file-input"
                @change=${this._handleSoundFileChange} />
              <ha-icon icon="mdi:folder-music-outline"></ha-icon>
              ${e.timerSoundFile?o("Change"):o("Choose file")}
            </label>
          </div>
        `:""}

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Test sound")}</span>
            <span class="setting-hint">${o("Play a preview of the selected alarm")}</span>
          </div>
          <button class="seg-btn active" @click=${()=>this._testSound(e.timerSound??"beep",e.timerSoundFile)}>
            <ha-icon icon="mdi:volume-high"></ha-icon> ${o("Play")}
          </button>
        </div>
      </div>

      <!-- ── Keep Screen On ── -->
      <div class="section">
        <div class="section-label">${o("Keep Screen On")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Keep screen on while viewing a recipe")}</span>
            <span class="setting-hint">${o("Uses the Wake Lock API \u2014 engages automatically while a recipe is open")}</span>
          </div>
          <label class="toggle">
            <input type="checkbox" ?checked=${e.keepScreenOn}
              @change=${i=>this._update({keepScreenOn:i.target.checked})} />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        ${e.keepScreenOn&&!ve()?h`
          <div class="setting-row muted-row">
            <span class="setting-hint">${o(`Not available in this browser/connection \u2014 the Wake Lock API requires a secure (HTTPS) connection to Home Assistant. This is the most common reason "keep screen on" doesn't work.`)}</span>
          </div>
        `:""}

        ${e.keepScreenOn?h`
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">${o("Auto-release after")}</span>
              <span class="setting-hint">${o("Screen lock released after this many minutes")}</span>
            </div>
            <div class="btn-group">
              ${[15,30,45,60].map(i=>h`
                <button class="seg-btn ${(e.wakeLockDuration??60)===i?"active":""}"
                  @click=${()=>this._update({wakeLockDuration:i})}>${i}m</button>
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
            <span class="setting-name">${o("Show metric conversion button")}</span>
            <span class="setting-hint">${o("Button in Ingredients tab converts oz/lb/cups/fl oz \u2192 g/ml/kg")}</span>
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
        <div class="section-label">${o("Image Slideshow")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Auto-advance interval")}</span>
            <span class="setting-hint">${o("Seconds between slides when a recipe has multiple images (0 = off)")}</span>
          </div>
          <div class="btn-group">
            ${[0,3,5,10,15].map(i=>h`
              <button class="seg-btn ${(e.slideshowInterval??5)===i?"active":""}"
                @click=${()=>this._update({slideshowInterval:i})}>${i===0?o("Off"):`${i}s`}</button>
            `)}
          </div>
        </div>
      </div>

    `}_handleSoundFileChange(e){let i=e.target.files?.[0];if(!i)return;let t=new FileReader;t.onload=r=>{this._update({timerSoundFile:r.target.result,timerSoundFileName:i.name})},t.readAsDataURL(i)}_testSound(e,i){if(e==="file"){typeof i=="string"&&i.length<=2e6&&/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(i)&&new Audio(i).play().catch(r=>console.warn("Could not play file:",r));return}try{let t=new(window.AudioContext||window.webkitAudioContext);if(e==="ding"){let r=t.createOscillator(),n=t.createGain();r.connect(n),n.connect(t.destination),r.type="sine",r.frequency.setValueAtTime(1046,t.currentTime),n.gain.setValueAtTime(.6,t.currentTime),n.gain.exponentialRampToValueAtTime(.001,t.currentTime+1),r.start(t.currentTime),r.stop(t.currentTime+1)}else if(e==="alarm")for(let r=0;r<3;r++){let n=t.currentTime+r*.35,a=t.createOscillator(),c=t.createGain();a.connect(c),c.connect(t.destination),a.type="square",a.frequency.setValueAtTime(660,n),c.gain.setValueAtTime(.3,n),c.gain.exponentialRampToValueAtTime(.001,n+.2),a.start(n),a.stop(n+.2)}else if(e!=="none"){let r=t.createOscillator(),n=t.createGain();r.connect(n),n.connect(t.destination),r.type="sine",r.frequency.setValueAtTime(880,t.currentTime),n.gain.setValueAtTime(.5,t.currentTime),n.gain.exponentialRampToValueAtTime(.001,t.currentTime+.5),r.start(t.currentTime),r.stop(t.currentTime+.5)}}catch(t){console.warn("Audio test failed:",t)}}_renderSync(){let e=this._backupState==="loading"?o("Backing up\u2026"):this._backupState==="done"?o("Downloaded \u2713"):this._backupState==="error"?o("Failed \u2717"):o("Download backup");return h`
      <div class="section">
        <div class="section-label">${o("Backup")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${o("Export recipes")}</span>
            <span class="setting-hint">${o("Download all recipes and meal plans as a JSON file")}</span>
          </div>
          <button
            class="seg-btn backup-btn ${this._backupState||""}"
            ?disabled=${this._backupState==="loading"}
            @click=${()=>this._backup()}
          >${e}</button>
        </div>
      </div>
    `}_renderHelp(){return h`
      <div class="section">
        <div class="section-label">${o("FAQ & Support")}</div>

        <a class="help-link" href="https://github.com/thekiwismarthome/recipe-manager/wiki" target="_blank">
          <ha-icon icon="mdi:help-circle-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${o("FAQ")}</span>
            <span class="setting-hint">${o("Frequently asked questions")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a class="help-link" href="https://github.com/thekiwismarthome/recipe-manager/issues" target="_blank">
          <ha-icon icon="mdi:bug-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${o("Report a Problem")}</span>
            <span class="setting-hint">${o("Submit an issue on GitHub")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a class="help-link" href="https://github.com/thekiwismarthome/recipe-manager" target="_blank">
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
          <span class="setting-name">${o("Recipe Manager")}</span>
          <span class="muted-note">${o(te`Integration version ${this._rmVersion}`)}</span>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("RM Card")}</span>
          <span class="muted-note">${o(te`Card version ${this._rmcVersion}`)}</span>
        </div>

        <div class="setting-row">
          <span class="setting-name">${o("Refresh versions")}</span>
          <button class="seg-btn" @click=${()=>this._fetchVersionsFromHacs()}>
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
    .seg-btn.active { background: var(--rm-accent); color: var(--rm-accent-text,#111); }
    .theme-select, .seg-btn, .toggle { min-height: var(--rm-touch-target,auto); }
    @media(max-width:480px) { .setting-row { flex-wrap:wrap; } .btn-group { max-width:100%; flex-wrap:wrap; } }
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
  `};try{customElements.define("rm-settings-view",Qe)}catch{}import{MacroMateNutritionBase as Wt}from"../nutrition-base.js";var kt={"Name oder Barcode":"Name or barcode","Lebensmittelname oder EAN":"Food name or EAN",Aktivkalorien:"Active calories","Nicht verf\xFCgbar":"Unavailable","F\xFCr den Schnelleintrag zuerst einen Namen eingeben.":"Enter a name first, then choose Quick entry.","Name oder Barcode eingeben. F\xFCr eigene N\xE4hrwerte einen Namen eingeben und Schnelleintrag w\xE4hlen.":"Enter a name or barcode. For your own nutrients, enter a name and choose Quick entry.","Name suchen oder Barcode eingeben. F\xFCr eigene N\xE4hrwerte Schnelleintrag w\xE4hlen. Standard: nur lokal. Online nur nach Absenden und Freigabe in der Integrationskonfiguration.":"Search by name or barcode. Choose Quick entry for your own nutrients. Local only by default; online requires submission and consent in integration settings.","Lesen fehlgeschlagen. Verbindung pr\xFCfen und erneut laden.":"Reading failed. Check the connection and reload.","Verbindung unterbrochen. Bitte erneut laden.":"Connection interrupted. Please reload.","Dein Tagebuch":"Your diary",Tagebuch:"Diary",Tagebuchdatum:"Diary date",Tag:"Day",Heute:"Today","Vorheriger Tag":"Previous day","N\xE4chster Tag":"Next day",Schnelleintrag:"Quick entry","Eintrag bearbeiten":"Edit entry","Eintrag kopieren":"Copy entry","Eintrag l\xF6schen":"Delete entry","Lebensmitteleintrag bearbeiten":"Edit food entry",Mahlzeiten:"Meals",Fr\u00FChst\u00FCck:"Breakfast",Mittagessen:"Lunch",Abendessen:"Dinner",Snacks:"Snacks",Mahlzeit:"Meal","Ern\xE4hrung heute":"Nutrition today",\u00DCbrig:"Remaining","\xDCber dem Ziel":"Over target",Kalorien:"Calories",Gegessen:"Consumed",Tagesziel:"Daily target",Makron\u00E4hrstoffe:"Macronutrients",Kohlenhydrate:"Carbohydrates",Fett:"Fat",Unbekannt:"Unknown",Unvollst\u00E4ndig:"Incomplete","Ziel unbekannt":"Unknown target","Werte fehlen":"Values missing","Profil einrichten":"Set up profile","Keine sichere Bilanz":"No reliable balance",Lebensmittel:"Foods","Lebensmittel suchen":"Search foods","Eigenes Lebensmittel":"Custom food","Eigenes Lebensmittel anlegen":"Create custom food","Eigenes Lebensmittel bearbeiten":"Edit custom food",Filter:"Filter",Alle:"All",Favoriten:"Favorites","Zuletzt erfasst":"Recently logged","Eigene Lebensmittel":"Custom foods","Online-Suche (Open Food Facts)":"Online search (Open Food Facts)",Suchen:"Search","Barcode suchen":"Search barcode","EAN scannen":"Scan barcode","Lebensmittel eintragen":"Log food","Favorit entfernen":"Remove favorite","Portion als Favorit speichern":"Save portion as favorite",N\u00E4hrwerte:"Nutrients","Alle Tagesn\xE4hrwerte":"All daily nutrients","N\xE4hrwerte der gew\xE4hlten Portion":"Selected portion nutrients",Bearbeiten:"Edit",Kopieren:"Copy",L\u00F6schen:"Delete",Speichern:"Save",Abbrechen:"Cancel","Endg\xFCltig l\xF6schen":"Confirm deletion","Noch keine Eintr\xE4ge":"No entries yet","Kein gespeichertes Tagesziel":"No saved daily target",Ballaststoffe:"Fiber",Zucker:"Sugar","Ges\xE4ttigte Fetts\xE4uren":"Saturated fat",Salz:"Salt",Energie:"Energy",Portion:"Serving",Anzahl:"Quantity",Mengenmodus:"Quantity mode","Bisherige Portion":"Previous serving",Zieldatum:"Target date",Hersteller:"Producer",Basiseinheit:"Base unit",Portionen:"Servings","Gespeichert.":"Saved.","Gleiche Anfrage erneut senden":"Retry same request","Bitte Eingaben pr\xFCfen.":"Check the submitted fields.","Verbindung unterbrochen. Schreibstatus eventuell ungekl\xE4rt.":"Connection interrupted. Write status may be uncertain.","Gesamtn\xE4hrwerte dieses Eintrags. Leere optionale Felder bleiben unbekannt. Beim Bearbeiten l\xF6scht ein leeres Feld den bisherigen N\xE4hrwert.":"Total nutrients of this entry. Empty optional fields remain unknown. When editing, an empty field clears its previous value.","N\xE4hrwerte werden aus dem gespeicherten Eintrag skaliert, nicht aus dem heutigen Produkt.":"Nutrients are scaled from the recorded entry snapshot, not the current product.","Standard: nur lokal. Online nur nach Absenden und Freigabe in der Integrationskonfiguration.":"Local only by default. Online lookup requires submission and consent in integration settings."};function Ut(m){return kt[m]?kt[m]:m.replace(/^Menge \(/,"Amount (").replace(/^Gewählt: /,"Selected: ").replace(/^von /,"of ").replace(/ g bekannt · weitere Werte unbekannt$/," g known \xB7 additional values unknown").replace(/ bearbeiten$/," edit").replace(/ kopieren$/," copy").replace(/ löschen$/," delete")}var $t=new WeakMap;function St(m,e,i,t="text"){let r=$t.get(m);r||(r=new Map,$t.set(m,r));let n=r.get(t);(!n||e!==n.output)&&(n={original:e,output:e});let a=i?.startsWith("de")?n.original:Ut(n.original);return r.set(t,{original:n.original,output:a}),a}function Ae(m,e){let i=document.createTreeWalker(m,NodeFilter.SHOW_TEXT);for(;i.nextNode();){let t=i.currentNode;if(t.parentElement?.closest(".entry strong,.food-detail h3,.food-detail .muted,.results button,option[data-food-serving],[data-user-content]"))continue;let r=St(t,t.textContent,e);r!==t.textContent&&(t.textContent=r)}for(let t of m.querySelectorAll("[aria-label],[title],[placeholder]"))for(let r of["aria-label","title","placeholder"]){let n=t.getAttribute(r);if(n!==null){let a=St(t,n,e,r);a!==n&&t.setAttribute(r,a)}}}var Xe=class extends Wt{set hass(e){super.hass=e,this.initialized&&Ae(this.shadowRoot,e.language)}get hass(){return super.hass}initialize(){super.initialize();let e=document.createElement("style");e.textContent=":host{flex:1;overflow-y:auto;overscroll-behavior-y:contain;background:var(--rm-bg-main);color:var(--rm-text);min-height:0;color-scheme:inherit;--primary-text-color:var(--rm-text);--secondary-text-color:var(--rm-text-secondary);--ha-card-background:var(--rm-bg-surface);--jade:var(--rm-success,#26936d);--amber:var(--rm-warning,#d0a34c);--coral:var(--rm-error,#d88b79);--violet:var(--rm-primary,#a18bcc);--divider-color:var(--rm-border)}.card,.metric,.date-nav,dialog{background:var(--rm-bg-surface);border-color:var(--rm-border);color:var(--rm-text)}.metric.calories{background:var(--rm-accent-soft)}dialog{background:var(--rm-dialog-bg,var(--rm-bg-surface))}.card{border-radius:var(--rm-radius,12px);box-shadow:var(--rm-shadow)}.eyebrow,.muted,small{color:var(--rm-text-secondary)}input,select,textarea,button{background:var(--rm-bg-elevated);color:var(--rm-text);border-color:var(--rm-border)}button:hover{background:var(--rm-accent-soft)}button.primary{background:var(--rm-primary,#20633f);color:white}button,select,input{min-height:var(--rm-touch-target,44px)}.dialog-status{color:var(--rm-text,#443700)}",this.shadowRoot.append(e),this.translationObserver=new MutationObserver(()=>{Ae(this.shadowRoot,this.hass.language)}),this.translationObserver.observe(this.shadowRoot,{subtree:!0,childList:!0,characterData:!0}),Ae(this.shadowRoot,this.hass.language)}disconnectedCallback(){this.translationObserver?.disconnect(),super.disconnectedCallback()}renderDiary(){super.renderDiary();let e=document.createElement("mm-summary");e.data=this.data;let i=e.renderEnergy(),t=e.renderMacros(),r=document.createElement("link");r.rel="stylesheet",r.href=new URL("../macromate-card.css",import.meta.url).href,this.diaryNode.prepend(r,i,t);let n=this.data.recommendation;if(n?.fallback_reasons?.includes("weight_unavailable")){let a=document.createElement("p");a.className="weight-fallback",a.setAttribute("role","status"),a.textContent=this.hass.language==="de"?`Gewichtssensor nicht verf\xFCgbar. Gespeichertes Profilgewicht: ${n.weight_kg} kg (kein Live-Messwert).`:`Weight sensor unavailable. Saved profile weight: ${n.weight_kg} kg (not live).`,this.diaryNode.prepend(a)}Ae(this.shadowRoot,this.hass.language)}};customElements.define("mm-nutrition",Xe);var Ye="manual-toggle";var zt=["grid","detail","settings","planner"];function qt(){return null}function Zt(){return[]}var Gt={theme:"soft",darkMode:"system",fontSize:"medium",columns:3,showFavourites:!0,showPlanner:!0,recentCount:12,timerSound:"beep",keepScreenOn:!1,keepScreenOnMins:30,showUnitConversion:!1,language:"en",unitSystem:"imperial"},Tt={soft:{light:{"--rm-bg-main":"#fafbfc","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#ffffff","--rm-text":"#424242","--rm-text-secondary":"#757575","--rm-text-muted":"#9e9e9e","--rm-accent":"#9fa8da","--rm-accent-soft":"rgba(159,168,218,0.15)","--rm-border":"#e8eaf6","--rm-shadow":"0 2px 6px rgba(0,0,0,0.08)"},dark:{"--rm-bg-main":"#14161a","--rm-bg-surface":"#1b1f25","--rm-bg-elevated":"#232833","--rm-text":"#e4e7ec","--rm-text-secondary":"#a8b0bd","--rm-text-muted":"#7a8594","--rm-accent":"#9fa8da","--rm-accent-soft":"rgba(159,168,218,0.18)","--rm-border":"#2b313c","--rm-shadow":"0 2px 6px rgba(0,0,0,0.3)"}},arctic:{light:{"--rm-bg-main":"#f0f4f8","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#ffffff","--rm-text":"#1a2332","--rm-text-secondary":"#526070","--rm-text-muted":"#8097aa","--rm-accent":"#2979ff","--rm-accent-soft":"rgba(41,121,255,0.12)","--rm-border":"#dce6f0","--rm-shadow":"0 2px 6px rgba(26,35,50,0.1)"}},meadow:{light:{"--rm-bg-main":"#f4f7f0","--rm-bg-surface":"#fefffe","--rm-bg-elevated":"#fefffe","--rm-text":"#2d3a2a","--rm-text-secondary":"#6b7c64","--rm-text-muted":"#96a98e","--rm-accent":"#4caf50","--rm-accent-soft":"rgba(76,175,80,0.12)","--rm-border":"#dde8d8","--rm-shadow":"0 2px 6px rgba(45,58,42,0.1)"}},blossom:{light:{"--rm-bg-main":"#fdf8fb","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#fff8fc","--rm-text":"#3d1f35","--rm-text-secondary":"#8c5e79","--rm-text-muted":"#b48fa5","--rm-accent":"#c2668a","--rm-accent-soft":"rgba(194,102,138,0.12)","--rm-border":"#f0d6e8","--rm-shadow":"0 2px 6px rgba(61,31,53,0.1)"},dark:{"--rm-bg-main":"#1a0d12","--rm-bg-surface":"#241420","--rm-bg-elevated":"#2e1a28","--rm-text":"#f8d0de","--rm-text-secondary":"#c070a0","--rm-text-muted":"#603050","--rm-accent":"#f48fb1","--rm-accent-soft":"rgba(244,143,177,0.15)","--rm-border":"rgba(248,208,222,0.08)","--rm-shadow":"0 2px 8px rgba(0,0,0,0.4)"}},"glass-wave":{light:{"--rm-bg-main":"transparent","--rm-bg-surface":"rgba(253, 248, 239, 0.72)","--rm-bg-elevated":"rgba(253, 248, 239, 0.72)","--rm-text":"#263B47","--rm-text-secondary":"#53666E","--rm-text-muted":"#53666E","--rm-accent":"#416F8F","--rm-accent-soft":"rgba(65, 111, 143, 0.12)","--rm-border":"rgba(255, 255, 255, 0.8)","--rm-shadow":"0 3px 12px rgba(38, 59, 71, 0.08)"}},ocean:{light:{"--rm-bg-main":"#f0f7ff","--rm-bg-surface":"#ffffff","--rm-bg-elevated":"#f9fbff","--rm-text":"#1a3a5f","--rm-text-secondary":"#4a6b8c","--rm-text-muted":"#7a9bbd","--rm-accent":"#0077ff","--rm-accent-soft":"rgba(0,119,255,0.12)","--rm-border":"#d0e1f2","--rm-shadow":"0 2px 6px rgba(26,58,95,0.1)"}},midnight:{dark:{"--rm-bg-main":"#0d1117","--rm-bg-surface":"#161b22","--rm-bg-elevated":"#1c2333","--rm-text":"#c9d1d9","--rm-text-secondary":"#8b949e","--rm-text-muted":"#6e7681","--rm-accent":"#58a6ff","--rm-accent-soft":"rgba(88,166,255,0.15)","--rm-border":"#21262d","--rm-shadow":"0 2px 8px rgba(0,0,0,0.5)"}},ember:{dark:{"--rm-bg-main":"#111111","--rm-bg-surface":"#1c1a17","--rm-bg-elevated":"#242018","--rm-text":"#f5f0e8","--rm-text-secondary":"#a89880","--rm-text-muted":"#7a6a55","--rm-accent":"#f0a500","--rm-accent-soft":"rgba(240,165,0,0.15)","--rm-border":"rgba(245,240,232,0.08)","--rm-shadow":"0 2px 8px rgba(0,0,0,0.5)"}},neon:{dark:{"--rm-bg-main":"#0a0b10","--rm-bg-surface":"#121420","--rm-bg-elevated":"#1a1d2e","--rm-text":"#e0e0f0","--rm-text-secondary":"#a0a5c0","--rm-text-muted":"#6a6f8e","--rm-accent":"#bb86fc","--rm-accent-soft":"rgba(187,134,252,0.15)","--rm-border":"#2a2d45","--rm-shadow":"0 2px 8px rgba(0,0,0,0.6)"}}},Vt={small:"13px",medium:"15px",large:"17px"};function Ht(){return{...Gt}}function Kt(){return!1}function Qt(){return[]}function Xt(){return[]}function Je(m){let e=Math.floor(m/3600),i=Math.floor(m%3600/60),t=m%60;return e>0?`${e}:${String(i).padStart(2,"0")}:${String(t).padStart(2,"0")}`:`${i}:${String(t).padStart(2,"0")}`}function et(m){try{let e=new(window.AudioContext||window.webkitAudioContext);e.createGain().connect(e.destination);let t=(r,n,a,c=.6)=>{let _=e.createOscillator(),w=e.createGain();_.connect(w),w.connect(e.destination),_.frequency.value=r,w.gain.setValueAtTime(c,e.currentTime+n),w.gain.exponentialRampToValueAtTime(.001,e.currentTime+n+a),_.start(e.currentTime+n),_.stop(e.currentTime+n+a+.05)};if(m==="beep")t(880,0,.15),t(880,.2,.15),t(880,.4,.15);else if(m==="ding")t(1318,0,.8,.5),t(1047,.1,.6,.3);else if(m==="alarm")for(let r=0;r<5;r++)t(880,r*.25,.12),t(660,r*.25+.13,.1)}catch{}}var tt=class extends he{static properties={hass:{type:Object},_config:{type:Object},_view:{type:String},_recipes:{type:Array},_tags:{type:Array},_selectedRecipe:{type:Object},_loading:{type:Boolean},_error:{type:String},_searchQuery:{type:String},_activeTag:{type:String},_settings:{type:Object},_wide:{type:Boolean},_sidebarCollapsed:{type:Boolean},_gridScrollPos:{type:Number},_recentRecipeIds:{type:Array},_timers:{type:Array},_timerAlarm:{type:Object},_timerAlarmQueue:{type:Array},_timersPrevView:{type:String},_customTimerInput:{type:String},_hdrStarHover:{type:Number},_mobileMenuOpen:{type:Boolean},_navDirection:{type:String},_closingDetail:{type:Boolean},_gridFilterPreset:{type:Object},_timerPresets:{type:Array},_presetNameInput:{type:String},_presetMinsInput:{type:String},_alarmAddInput:{type:String},_plannerFromRecipe:{type:Object},_globalMode:{type:Boolean},_quickTimerLabel:{type:String},_globalWakeActive:{type:Boolean}};constructor(){super(),this._pendingViewRestore=qt(),this._view="grid",this._recipes=[],this._tags=[],this._selectedRecipe=null,this._loading=!1,this._error=null,this._searchQuery="",this._activeTag=null,this._settings=Ht(),this._languageAutoDetectPending=!Kt(),Se(this._settings.language),this._wide=!1,this._sidebarCollapsed=!1,this._gridScrollPos=0,this._recentRecipeIds=Qt(),this._timers=Xt(),this._timerAlarm=null,this._timerAlarmQueue=[],this._timersPrevView=null,this._customTimerInput="",this._hdrStarHover=0,this._mobileMenuOpen=!1,this._navDirection="forward",this._closingDetail=!1,this._gridFilterPreset=null,this._timerPresets=Zt(),this._presetNameInput="",this._presetMinsInput="",this._alarmAddInput="",this._plannerFromRecipe=null,this._globalMode=!1,this._quickTimerLabel="",this._alarmLoopActive=!1,this._alarmInterval=null,this._alarmTimeout=null,this._alarmAudio=null,this._unsubscribe=null,this._refreshGeneration=0,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._recipeRefreshDeferred=!1,this._darkModeQuery=null,this._resizeObserver=null,this._timerTick=null,this._globalWakeActive=!1,this._globalWakeUnsubscribeFn=null}setConfig(e){this._config=e}static getStubConfig(){return{}}getCardSize(){return 6}_updateHeight(){requestAnimationFrame(()=>requestAnimationFrame(()=>{let e=this.getBoundingClientRect().top,i=window.innerHeight-Math.max(e,0);i>100&&(this.style.height=`${i}px`)}))}connectedCallback(){super.connectedCallback(),this._darkModeQuery=window.matchMedia("(prefers-color-scheme: dark)"),this._darkModeQuery.addEventListener("change",this._onSystemDark),this._applyTheme(),this._resizeObserver=new ResizeObserver(e=>{let i=e[0]?.contentRect?.width??0;this._wide=i>=620}),this._resizeObserver.observe(this),this._onViewportResize=()=>this._updateHeight(),window.visualViewport?.addEventListener("resize",this._onViewportResize),window.addEventListener("resize",this._onViewportResize),this._updateHeight(),this._timerTick=setInterval(()=>this._tickTimers(),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._refreshGeneration++,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null),this._darkModeQuery?.removeEventListener("change",this._onSystemDark),this._resizeObserver?.disconnect(),window.visualViewport?.removeEventListener("resize",this._onViewportResize),window.removeEventListener("resize",this._onViewportResize),this._timerTick&&(clearInterval(this._timerTick),this._timerTick=null),this._timerAlarm&&(this._stopAlarmLoop(),this._timerAlarm=null),this._timerAlarmQueue=[],this._timers,this._globalWakeActive&&Ce(Ye)}_onSystemDark=()=>{this._settings.darkMode==="system"&&this._applyTheme()};updated(e){if(e.has("hass")&&this.hass&&!this._api&&(this._api=new De(this.hass),this._api.transport=this.transport,this._init()),e.has("hass")&&this.hass&&this._languageAutoDetectPending){this._languageAutoDetectPending=!1;let i=(this.hass.language||"").split("-")[0].toLowerCase(),t=Le.includes(i)?i:this._settings.language;this._settings={...this._settings,language:t},this._settings,Se(t)}e.has("hass")&&this._api&&(this._api.hass=this.hass),e.has("_settings")&&this._applyTheme(),(e.has("_view")||e.has("_selectedRecipe")||e.has("_timers")||e.has("_recentRecipeIds"))&&this._saveViewState(),(e.has("_view")||e.has("_closingDetail"))&&this._recipeRefreshDeferred&&!this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail")&&this._queueRefresh()}_saveViewState(){if(!this._cacheBootstrapped||!this.transport?.current())return;let e=zt.includes(this._view)?this._view:"grid";ot(this.transport,{view:e,recipeId:e==="detail"&&this._selectedRecipe?.id||null,recentIds:this._recentRecipeIds},this._timers)}_restoreViewState(){let e=this._pendingViewRestore;if(this._pendingViewRestore=null,!(!e||!zt.includes(e.view)))if(e.view==="detail"&&e.recipeId){let i=this._recipes.find(t=>t.id===e.recipeId);i&&(this._selectedRecipe=i,this._view="detail")}else e.view!=="detail"&&(this._view=e.view)}_applyTheme(){let e=this._settings;this.toggleAttribute("glass-wave",e.theme==="glass-wave");let i=Tt[e.theme]??Tt.soft,t=!i.light,r=!i.dark,n=t;!t&&!r?e.darkMode==="on"?n=!0:e.darkMode==="off"?n=!1:n=this._darkModeQuery?.matches??!1:r&&(n=!1);let a=n?i.dark??i.light:i.light??i.dark;for(let[c,_]of Object.entries(a))this.style.setProperty(c,_);this.style.setProperty("--rm-font-size-base",Vt[e.fontSize]??"15px"),this.style.setProperty("--rm-grid-columns",`repeat(${e.columns??3}, minmax(0, 1fr))`)}async _init(){if(this._loading=!0,this._error=null,!this._cacheBootstrapped&&this.hass.user.is_admin){let e=st(this.transport);this._pendingViewRestore=e,this._recentRecipeIds=e.recentIds||[],this._timers=e.timers||[],this._cacheBootstrapped=!0}if(!this.hass.user.is_admin){this._view="settings",this._loading=!1;return}try{await Promise.all([this._loadRecipes(),this._loadTags(),this._loadGlobalTimers()]),this._restoreViewState();let e=await this.transport.call("preferences_get");e.preferences?.recipe_settings&&(this._settings={...this._settings,...e.preferences.recipe_settings},await Se(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade()),await this._loadPresets(),await this._subscribe()}catch(e){this._error=e.message||o("Failed to load recipes")}finally{this._loading=!1}}async _loadGlobalTimers(){try{let{timers:e}=await this._api.getGlobalTimers(),i=Date.now()/1e3;this._timers=[...this._timers.filter(t=>!t.global),...(e||[]).map(t=>this._globalTimerToLocal(t,i))]}catch{}}_globalTimerToLocal(e,i=Date.now()/1e3){let t=e.running?Math.max(0,e.duration-(i-e.start_time)):e.paused_remaining??e.duration;return{id:e.id,label:e.label,total:e.duration,remaining:Math.round(t),running:e.running&&t>0,alarming:e.running&&t<=0,presetId:e.preset_id||null,global:!0,duration:e.duration,start_time:e.start_time,paused_remaining:e.paused_remaining}}async _loadRecipes(){let e=await this._api.getAllRecipes();this._recipes=e?.recipes??[]}async _loadTags(){let e=await this._api.getTags();this._tags=e?.tags??[]}async _subscribe(){if(this._unsubscribe)return;let e=this._refreshGeneration,i=await this._api.subscribe(()=>this._queueRefresh());!this.isConnected||e!==this._refreshGeneration||!this.transport.current()?i():this._unsubscribe=i}_queueRefresh(){if(this._refreshRequested=!0,this._refreshScheduled||this._refreshRunning)return;this._refreshScheduled=!0;let e=this._refreshGeneration;queueMicrotask(()=>{e===this._refreshGeneration&&(this._refreshScheduled=!1,this._refreshLive())})}async _refreshLive(){let e=this.transport;if(!this._refreshRequested||!this.isConnected||!e?.current()||e.pending)return;this._refreshRequested=!1,this._refreshRunning=!0;let i=this._refreshGeneration,t=()=>!!this.shadowRoot.querySelector("rm-add-recipe-dialog, rm-recipe-detail"),r=t();try{let[n,a,c]=await Promise.all([r?null:this._api.getAllRecipes(),r?null:this._api.getTags(),r?null:this._api.getGlobalTimers()]);if(!this.isConnected||i!==this._refreshGeneration||this.transport!==e||!e.current())return;if(e.pending){this._refreshRequested=!0;return}this._recipeRefreshDeferred=r||t(),r&&!t()&&(this._refreshRequested=!0),this._recipeRefreshDeferred||(this._recipes=n?.recipes??[],this._tags=a?.tags??[],this._timers=[...this._timers.filter(_=>!_.global),...(c?.timers||[]).map(_=>this._globalTimerToLocal(_))])}catch{}finally{i===this._refreshGeneration&&(this._refreshRunning=!1,this._refreshRequested&&!e.pending&&e.current()&&this._queueRefresh())}}get _filteredRecipes(){let e=this._recipes;if(this._activeTag&&(e=e.filter(i=>i.tags?.includes(this._activeTag)||i.courses?.includes(this._activeTag)||i.categories?.includes(this._activeTag)||i.collections?.includes(this._activeTag))),this._searchQuery.trim()){let i=this._searchQuery.trim().toLowerCase();e=e.filter(t=>t.name?.toLowerCase().includes(i)||t.description?.toLowerCase().includes(i)||t.tags?.some(r=>r.toLowerCase().includes(i)))}return e}get _recentRecipes(){let e=this._settings.recentCount??12;return this._recentRecipeIds.slice(0,e).map(i=>this._recipes.find(t=>t.id===i)).filter(Boolean)}async _handleSettingsChange(e){let i=this._settings.language;if(this._settings=e.detail.settings,this._settings,this._settings.language!==i){await Se(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade(),this.requestUpdate();for(let t of this.shadowRoot.querySelectorAll("*"))t.requestUpdate?.()}try{await this.transport.call("preferences_update",{preferences:{recipe_settings:this._settings}}),this._error=null}catch(t){this._error=this._settings.language==="de"?t.code==="uncertain"?"Speicherstatus unklar. Gleiche Anfrage nur ausdr\xFCcklich erneut senden.":t.code==="pending"?"Zuerst die unklare Anfrage kl\xE4ren.":"Einstellungen konnten nicht gespeichert werden. Felder und Berechtigungen pr\xFCfen.":t.message}}async _toggleGlobalWakeLock(){ve()&&(this._globalWakeActive?(await Ce(Ye),this._globalWakeActive=!1):(await Pe(Ye),this._globalWakeActive=!0))}_tickTimers(){if(!this._timers.length)return;let e=!1,i=[],t=Date.now()/1e3,r=this._timers.map(n=>{if(n.alarming||!n.running)return n;let a=n.global?Math.max(0,n.duration-(t-n.start_time)):n.remaining-1;if(e=!0,a<=0){if(n.presetId)return{...n,remaining:0,running:!1,alarming:!0};i.push({id:n.id,label:n.label})}return{...n,remaining:Math.round(a),running:a>0}});e&&(this._timers=r,this._timers,void 0),i.length&&(this._timerAlarm||(this._timerAlarm=i.shift(),this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile)),i.length&&(this._timerAlarmQueue=[...this._timerAlarmQueue,...i]))}async _startTimer(e,i,t=null,r=!1){if(!Number.isFinite(e)||e<=0||e>604800||i&&String(i).length>300)return;let n=i||o(te`${Math.floor(e/60)} min timer`);if(r&&this._api)try{let c=Date.now()/1e3;await this._api.addGlobalTimer({label:n,duration:e,start_time:c,running:!0,paused_remaining:null,...t?{preset_id:t}:{}}),await this._loadGlobalTimers();return}catch(c){this._error=c.message;return}let a=crypto.randomUUID();this._timers=[...this._timers,{id:a,label:n,total:e,remaining:e,running:!0,presetId:t||null}],this._timers}async _stopTimer(e){if(this._timers.find(t=>t.id===e)?.global){try{await this._api.deleteGlobalTimer(e),await this._loadGlobalTimers()}catch(t){this._error=t.message}return}this._timers=this._timers.filter(t=>t.id!==e)}async _pauseTimer(e){let i=this._timers.find(t=>t.id===e);if(i){if(i.global){try{await this._api.updateGlobalTimer(e,i.running?{running:!1,paused_remaining:i.remaining}:{running:!0,start_time:Date.now()/1e3-(i.duration-i.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(t){this._error=t.message}return}this._timers=this._timers.map(t=>t.id===e?{...t,running:!t.running}:t)}}async _addTimeToTimer(e,i){let t=this._timers.find(r=>r.id===e);if(t){if(t.global){try{await this._api.updateGlobalTimer(e,{duration:t.duration+i,running:!0,start_time:Date.now()/1e3-(t.duration-t.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(r){this._error=r.message}return}this._timers=this._timers.map(r=>r.id===e?{...r,total:r.total+i,remaining:r.remaining+i,running:!0,alarming:!1}:r)}}_dismissAlarm(){this._timerAlarm&&(this._stopAlarmLoop(),this._stopTimer(this._timerAlarm.id),this._timerAlarm=this._timerAlarmQueue.length?this._timerAlarmQueue.shift():null,this._timerAlarm&&this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile))}async _loadPresets(){let e=await this.transport.call("timer_presets_get");this._timerPresets=e.presets||[]}async _addPresetTimer(){let e=this._presetNameInput.trim(),i=Number(this._presetMinsInput);if(!(!e||!Number.isFinite(i)||i<=0))try{await this.transport.call("timer_presets_add",{name:e,seconds:Math.round(i*60)}),await this._loadPresets(),this._presetNameInput="",this._presetMinsInput=""}catch(t){this._error=t.message}}async _removePreset(e){try{await this.transport.call("timer_presets_delete",{preset_id:e}),await this._loadPresets()}catch(i){this._error=i.message}}_startAlarmLoop(e,i){if(this._stopAlarmLoop(),e!=="none"&&!(e==="file"&&(typeof i!="string"||i.length>2e6||!/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(i))))if(e==="file"&&i){this._alarmLoopActive=!0;let t=()=>{this._alarmLoopActive&&(this._alarmAudio=new Audio(i),this._alarmAudio.onended=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(t,2e3))},this._alarmAudio.onerror=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(()=>et("beep"),2e3))},this._alarmAudio.play().catch(()=>{}))};t()}else et(e),this._alarmInterval=setInterval(()=>et(e),4e3)}_stopAlarmLoop(){this._alarmLoopActive=!1,this._alarmInterval&&(clearInterval(this._alarmInterval),this._alarmInterval=null),this._alarmTimeout&&(clearTimeout(this._alarmTimeout),this._alarmTimeout=null),this._alarmAudio&&(this._alarmAudio.pause(),this._alarmAudio.onended=null,this._alarmAudio.onerror=null,this._alarmAudio=null)}_handleStartTimer(e){let{seconds:i,label:t}=e.detail;this._startTimer(i,t,null,this._globalMode)}_handleSearch(e){this._searchQuery=e.detail?.query??""}_handleTagFilter(e){let i=e.detail?.tag;this._activeTag=this._activeTag===i?null:i}_handleChipNav(e){let{filterMode:i,value:t}=e.detail;this._navDirection="back",i==="tags"?(this._activeTag=t,this._gridFilterPreset=null):(this._activeTag=null,this._gridFilterPreset={filterMode:i,selectedValues:[t]}),this._view="grid"}_handleBack(){this._closingDetail||(this._view==="detail"&&this._selectedRecipe&&!this._closingDetail?(this._closingDetail=!0,this._view="grid",window.matchMedia("(prefers-reduced-motion: reduce)").matches&&(this._closingDetail=!1,this._selectedRecipe=null)):(this._navDirection="back",this._view="grid",this._selectedRecipe=null,this._closingDetail=!1))}_onDetailTransitionEnd(e){e.target===e.currentTarget&&e.propertyName==="transform"&&this._closingDetail&&(this._closingDetail=!1,this._selectedRecipe=null)}_handleShowGrid(){this._navDirection="back",this._view="grid",this._selectedRecipe=null}_handleShowPlanner(){this._plannerFromRecipe=this._selectedRecipe||null,this._navDirection="forward",this._view="planner"}_handleBackToRecipe(){this._plannerFromRecipe&&(this._selectedRecipe=this._plannerFromRecipe,this._plannerFromRecipe=null,this._navDirection="back",this._view="detail")}_handleOpenRecipe(e){let i=this.shadowRoot?.querySelector("rm-recipe-grid");if(i){let r=i.shadowRoot?.querySelector(".grid-scroll");this._gridScrollPos=r?.scrollTop??0}let t=e.detail?.recipe;if(this._closingDetail=!1,this._navDirection="forward",this._selectedRecipe=t,this._view="detail",t?.id){let r=[t.id,...this._recentRecipeIds.filter(n=>n!==t.id)].slice(0,50);this._recentRecipeIds=r}}async _handleToggleFavourite(e){try{let{recipeId:i}=e.detail;await this._api.toggleFavourite(i),await this._loadRecipes(),this._selectedRecipe?.id===i&&(this._selectedRecipe=this._recipes.find(t=>t.id===i)??this._selectedRecipe)}catch{}}async _handleDeleteRecipe(e){try{await this._api.deleteRecipe(e.detail.recipeId),await this._loadRecipes(),await this._loadTags(),this._navDirection="back",this._view="grid",this._selectedRecipe=null}catch{}}async _handleUpdateRecipe(e){try{let{recipeId:i,data:t}=e.detail;await this._api.updateRecipe(i,t),await this._loadRecipes(),await this._loadTags(),this._selectedRecipe?.id===i&&(this._selectedRecipe=this._recipes.find(r=>r.id===i)??null)}catch{}}async _handleAddRecipe(e){try{await this._api.addRecipe(e.detail.data),this._navDirection="back",this._view="grid",await this._loadRecipes(),await this._loadTags()}catch(i){console.error("[Recipe Manager] Failed to save recipe:",i)}}async _handleImportDone(){this._navDirection="back",this._view="grid",await this._loadRecipes(),await this._loadTags()}_renderStars(e){let i=e||0,t=this._hdrStarHover,r=t>0?t:i;return h`
      <div class="header-stars"
        @mouseleave=${()=>{this._hdrStarHover=0}}
        title="${t>0?o(te`Set rating: ${t}★`):i>0?o(te`Rating: ${i}★ — click to change`):o("Click to rate")}">
        ${[1,2,3,4,5].map(n=>h`
          <span class="hdr-star ${n<=r?"filled":""}"
            @mouseover=${()=>{this._hdrStarHover=n}}
            @click=${()=>this._handleRateRecipe(n)}>★</span>
        `)}
      </div>
    `}async _handleRateRecipe(e){try{if(!this._selectedRecipe)return;let i=this._selectedRecipe.rating===e?null:e;this._hdrStarHover=0,await this._handleUpdateRecipe({detail:{recipeId:this._selectedRecipe.id,data:{rating:i}}})}catch{}}_renderSidebar(){if(!this.hass?.user?.is_admin)return h`<nav class="rm-sidebar"><div class="sb-nav"><button class="sb-item active" @click=${()=>{this._view="settings"}}>${o("Settings")}</button></div></nav>`;let e=this._view,i=this._sidebarCollapsed,t=(r,n,a,c=!1,_=null)=>h`
      <button
        class="sb-item ${e===a?"active":""} ${c?"placeholder":""}"
        title="${c?o(te`${n} — coming soon`):n}"
        @click=${c?void 0:_||(()=>{this._navDirection="forward",this._view=a,this._selectedRecipe=null})}
        ?disabled=${c}
      >
        <ha-icon icon="${r}"></ha-icon>
        ${i?"":h`<span>${n}</span>`}
      </button>
    `;return h`
      <nav class="rm-sidebar ${i?"collapsed":""}">
        <div class="sb-top">
          <div class="sb-logo-row">
            <button class="sb-collapse-btn" @click=${()=>{this._sidebarCollapsed=!this._sidebarCollapsed}}
              title="${i?o("Expand sidebar"):o("Collapse sidebar")}">
              <ha-icon icon="${i?"mdi:menu-close":"mdi:menu-open"}"></ha-icon>
            </button>
          </div>

          ${i?h`
            <button class="sb-icon-only-btn" @click=${()=>{this._view="add"}} title="${o("New Recipe")}">
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
                <button class="sb-search-clear" @click=${()=>{this._searchQuery=""}}>
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `:""}
            </div>

            <button class="sb-new-btn" @click=${()=>{this._view="add"}}>
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
          <button class="sb-item placeholder" disabled title="${o("Sync \u2014 coming soon")}">
            <ha-icon icon="mdi:cloud-sync-outline"></ha-icon>${i?"":h`<span>${o("Sync")}</span>`}
          </button>
          <button class="sb-item placeholder" disabled title="${o("Help \u2014 coming soon")}">
            <ha-icon icon="mdi:help-circle-outline"></ha-icon>${i?"":h`<span>${o("Help")}</span>`}
          </button>
          <button class="sb-item ${e==="settings"?"active":""}"
            @click=${()=>{this._view="settings"}}>
            <ha-icon icon="mdi:cog-outline"></ha-icon>${i?"":h`<span>${o("Settings")}</span>`}
          </button>
        </div>
      </nav>
    `}_renderHeader(){let e=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe,i=this._view==="settings",t=this._view==="add",r=this._view==="timers",n=this._wide,a=i?o("Settings"):t?o("New Recipe"):r?o("Timers"):e?"":this._view==="planner"?o("Meal Planner"):this._view==="nutrition"?this._settings.language==="de"?"Ern\xE4hrung":"Nutrition":o("Recipes");return h`
      <div class="rm-header">
        <div class="rm-header-left">
          ${e||t?h`
            <button class="icon-btn" @click=${this._handleBack} title="${o("Back")}">
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>
          `:r&&this._timersPrevView==="detail"?h`
            <button class="icon-btn"
              @click=${()=>{this._navDirection="back",this._view="detail",this._timersPrevView=null}}
              title="${o("Back to recipe")}">
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>
          `:!n&&this._view!=="grid"&&!i&&!r?h`
            <button class="icon-btn" @click=${this._handleShowGrid}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>
          `:""}
          <div class="rm-title">
            <ha-icon icon="mdi:chef-hat"></ha-icon>
            <span>${a}</span>
          </div>
        </div>

        <div class="rm-header-right">
          <!-- Timer pills (compact, shown when timers are running, not in timer view) -->
          ${this._timers.length&&this._view!=="timers"?h`
            <div class="timer-pills" @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}>
              ${this._timers.slice(0,3).map(c=>h`
                <div class="timer-pill ${c.running?"":"paused"}">
                  <ha-icon icon="mdi:timer-outline"></ha-icon>
                  <span>${Je(c.remaining)}</span>
                </div>
              `)}
              ${this._timers.length>3?h`<span class="timer-more">+${this._timers.length-3}</span>`:""}
            </div>
          `:""}

          ${e?this._renderStars(this._selectedRecipe.rating):""}

          <button class="icon-btn wake-toggle-btn ${this._globalWakeActive?"active":""}"
            @click=${this._toggleGlobalWakeLock}
            ?disabled=${!ve()}
            title="${ve()?this._globalWakeActive?o("Screen awake \u2014 click to allow sleep"):o("Keep screen awake"):o("Keep screen awake \u2014 requires a secure (HTTPS) connection and a supported browser")}">
            <ha-icon icon="${this._globalWakeActive?"mdi:eye":"mdi:eye-off-outline"}"></ha-icon>
          </button>

          ${i||t||r?h`
            <button class="icon-btn" @click=${this._handleShowGrid}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          `:n?"":h`
            <button class="icon-btn"
              @click=${()=>{this._mobileMenuOpen=!this._mobileMenuOpen}}
              title="${this._mobileMenuOpen?o("Close menu"):o("Menu")}">
              <ha-icon icon="${this._mobileMenuOpen?"mdi:close":"mdi:menu"}"></ha-icon>
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
      <div class="rm-loading"><ha-circular-progress active size="large"></ha-circular-progress></div>
    `;if(this._error)return h`
      <div class="rm-error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <p>${this._error}</p>
        <button class="text-btn" @click=${this._init.bind(this)}>${o("Retry")}</button>
      </div>
    `;let i=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe;return h`
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
    `}_renderTimersView(){let e=this._customTimerInput.trim(),i=this._presetNameInput.trim()&&this._presetMinsInput.trim(),t=[{label:"+30s",secs:30},{label:"+1m",secs:60},{label:"+5m",secs:300},{label:"+10m",secs:600}],r=this._timers.filter(a=>!a.presetId),n=263.9;return h`
      <div class="timers-view">

        <!-- Active timers (non-preset): horizontal wrap of square arc tiles -->
        ${r.length?h`
          <div class="timer-list">
            ${r.map(a=>{let c=a.remaining<60?"#f59e0b":"var(--rm-accent)",_=n*(1-a.remaining/a.total);return h`
                <div class="timer-card">
                  <button class="preset-remove" @click=${()=>this._stopTimer(a.id)} title="${o("Remove")}">
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                  ${a.global?h`<ha-icon class="timer-global-badge" icon="mdi:earth" title="${o("Global timer")}"></ha-icon>`:""}
                  <span class="timer-card-name">${a.label}</span>
                  <div class="preset-arc-wrap">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rm-border)" stroke-width="6"/>
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke="${c}" stroke-width="6" stroke-linecap="round"
                        stroke-dasharray="${n}" stroke-dashoffset="${_}"
                        transform="rotate(-90 50 50)"
                        style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"/>
                    </svg>
                    <div class="preset-arc-center">
                      <span class="preset-arc-time">${Je(a.remaining)}</span>
                    </div>
                  </div>
                  <div class="preset-arc-btns">
                    <button class="timer-ctrl-btn" @click=${()=>this._pauseTimer(a.id)} title="${a.running?o("Pause"):o("Resume")}">
                      <ha-icon icon="${a.running?"mdi:pause":"mdi:play"}"></ha-icon>
                    </button>
                    <button class="timer-ctrl-btn danger" @click=${()=>this._stopTimer(a.id)} title="${o("Stop")}">
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
            <p class="timer-empty-hint">${o("Tap a highlighted time in a recipe's directions to start one.")}</p>
          </div>
        `}

        <!-- Spacer pushes add+presets to bottom -->
        <div style="flex:1"></div>

        <!-- Add timer section -->
        <div class="timer-add-section">
          <div class="timer-add-header">
            <span class="timer-add-title">${o("Add Timer")}</span>
            <label class="timer-global-toggle ${this._globalMode?"active":""}" title="${o("Sync timer across all devices via Home Assistant")}">
              <input type="checkbox" .checked=${this._globalMode}
                @change=${a=>{this._globalMode=a.target.checked}}
              />
              <ha-icon icon="mdi:earth"></ha-icon>
              ${o("Global")}
            </label>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${o("Quick start")}</div>
            <div class="timer-add-row">
              <input type="text" class="timer-input" placeholder="${o("Label (optional)")}"
                .value=${this._quickTimerLabel}
                @input=${a=>{this._quickTimerLabel=a.target.value}}
                @keydown=${a=>{a.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <input type="number" class="timer-input timer-mins-input" placeholder="${o("min")}" min="0.5" step="0.5"
                .value=${this._customTimerInput}
                @input=${a=>{this._customTimerInput=a.target.value}}
                @keydown=${a=>{a.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <button class="action-btn primary" ?disabled=${!e}
                @click=${()=>{this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel=""}}>
                <ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon> ${o("Start")}
              </button>
            </div>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${o("Save preset")}</div>
            <div class="timer-add-row">
              <input type="text" class="timer-input" placeholder="${o("Preset name")}"
                .value=${this._presetNameInput}
                @input=${a=>{this._presetNameInput=a.target.value}}
                @keydown=${a=>{a.key==="Enter"&&this._addPresetTimer()}}
              />
              <input type="number" class="timer-input timer-mins-input" placeholder="${o("min")}" min="0.5" step="0.5"
                .value=${this._presetMinsInput}
                @input=${a=>{this._presetMinsInput=a.target.value}}
                @keydown=${a=>{a.key==="Enter"&&this._addPresetTimer()}}
              />
              <button class="action-btn" ?disabled=${!i} @click=${this._addPresetTimer}>${o("+ Preset")}</button>
            </div>
          </div>
        </div>

        <!-- Preset timers grid (bottom) -->
        ${this._timerPresets.length?h`
          <div class="timer-presets-grid">
            ${this._timerPresets.map(a=>{let c=this._timers.find(g=>g.presetId===a.id),_=c&&c.running,w=c&&c.alarming,y=c?c.remaining:a.seconds,p=c?c.total:a.seconds,b=w?"var(--error-color, #cf6679)":y<60&&c?"#f59e0b":"var(--rm-accent)",d=w?0:c?n*(1-y/p):n;return h`
                <div class="timer-preset-card ${w?"alarming":""}">
                  <button class="preset-remove" @click=${()=>{c&&this._stopTimer(c.id),this._removePreset(a.id)}} title="${o("Remove")}">
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                  <span class="preset-arc-name">${a.name}</span>
                  <div class="preset-arc-wrap">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="var(--rm-border)" stroke-width="7"/>
                      <circle cx="50" cy="50" r="44" fill="none"
                        stroke="${b}" stroke-width="7" stroke-linecap="round"
                        stroke-dasharray="${n}" stroke-dashoffset="${d}"
                        transform="rotate(-90 50 50)"
                        style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"/>
                    </svg>
                    <div class="preset-arc-center">
                      ${w?h`
                        <span class="preset-arc-time" style="color:var(--error-color,#cf6679)">${o("Done!")}</span>
                      `:h`
                        <span class="preset-arc-time">${Je(y)}</span>
                      `}
                    </div>
                  </div>
                  <div class="preset-arc-btns">
                    ${w?h`
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(c.id,30)}>${o("+30s")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(c.id,60)}>${o("+1m")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(c.id,300)}>${o("+5m")}</button>
                      <button class="preset-arc-btn stop" @click=${()=>this._stopTimer(c.id)}>${o("Stop")}</button>
                    `:_?h`
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(c.id,30)}>${o("+30s")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._addTimeToTimer(c.id,60)}>${o("+1m")}</button>
                      <button class="preset-arc-btn" @click=${()=>this._pauseTimer(c.id)}>
                        <ha-icon icon="mdi:pause" style="--mdc-icon-size:12px;vertical-align:middle"></ha-icon>
                      </button>
                      <button class="preset-arc-btn stop" @click=${()=>this._stopTimer(c.id)}>${o("Stop")}</button>
                    `:c?h`
                      <button class="preset-arc-btn" @click=${()=>this._pauseTimer(c.id)}>${o("Resume")}</button>
                      <button class="preset-arc-btn stop" @click=${()=>this._stopTimer(c.id)}>${o("Stop")}</button>
                    `:h`
                      <button class="preset-arc-btn play" @click=${()=>this._startTimer(a.seconds,a.name,a.id)}>
                        <ha-icon icon="mdi:play" style="--mdc-icon-size:14px;vertical-align:middle"></ha-icon> ${o("Start")}
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
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,30)}>${o("+30s")}</button>
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,60)}>${o("+1 min")}</button>
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,300)}>${o("+5 min")}</button>
            <button class="alarm-btn" @click=${()=>this._addTimeToTimer(e.id,600)}>${o("+10 min")}</button>
            <div class="alarm-custom-row">
              <input type="number" class="alarm-custom-input" placeholder="${o("min")}" min="1"
                .value=${this._alarmAddInput}
                @input=${i=>{this._alarmAddInput=i.target.value}}
                @keydown=${i=>{if(i.key==="Enter"&&this._alarmAddInput){let t=parseInt(this._alarmAddInput);t>0&&this._addTimeToTimer(e.id,t*60),this._alarmAddInput=""}}}
              />
              <button class="alarm-btn accent" ?disabled=${!this._alarmAddInput}
                @click=${()=>{let i=parseInt(this._alarmAddInput);i>0&&this._addTimeToTimer(e.id,i*60),this._alarmAddInput=""}}>${o("+min")}</button>
            </div>
            <button class="alarm-btn stop" @click=${this._dismissAlarm}>${o("Stop")}</button>
          </div>
        </div>
      </div>
    `:""}_renderBottomNav(){if(!this.hass?.user?.is_admin)return h`<nav class="rm-bottom-nav"><button class="rm-bn-btn active" @click=${()=>{this._view="settings"}}>${o("Settings")}</button></nav>`;let e=this._view,i=(t,r,n,a)=>h`
      <button class="rm-bn-btn ${e===n?"active":""}"
        @click=${a||(()=>{this._navDirection="forward",this._view=n,this._selectedRecipe=null})}
        title="${r}">
        <ha-icon icon="${t}"></ha-icon>
        <span>${r}</span>
      </button>
    `;return h`
      <nav class="rm-bottom-nav">
        ${i("mdi:home",o("Home"),"grid",()=>{this._navDirection="back",this._view="grid",this._selectedRecipe=null})}
        ${i("mdi:heart-pulse",this._settings.language==="de"?"Ern\xE4hrung":"Nutrition","nutrition")}
        <button class="rm-bn-btn rm-bn-add"
          @click=${()=>{this._navDirection="forward",this._view="add"}}
          title="${o("New Recipe")}">
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        ${i("mdi:calendar-week",o("Planner"),"planner",()=>{this._plannerFromRecipe=null,this._navDirection="forward",this._view="planner",this._selectedRecipe=null})}
        <button class="rm-bn-btn ${e==="timers"?"active":""}"
          @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}
          title="${o("Timers")}">
          <ha-icon icon="mdi:timer-outline"></ha-icon>
          <span>${o("Timers")}</span>
          ${this._timers.length?h`<span class="rm-bn-badge">${this._timers.length}</span>`:""}
        </button>
      </nav>
    `}_renderMobileMenu(){return h`
      <div class="rm-mobile-overlay" @click=${()=>{this._mobileMenuOpen=!1}}>
        <nav class="rm-mobile-menu" @click=${e=>e.stopPropagation()}>
          <div class="rm-mm-header">
            <ha-icon icon="mdi:chef-hat" class="rm-mm-logo"></ha-icon>
            <span class="rm-mm-title">${o("Recipes")}</span>
            <button class="icon-btn" @click=${()=>{this._mobileMenuOpen=!1}}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="rm-mm-items">
            <button class="rm-mm-item" @click=${()=>{this._view="settings",this._mobileMenuOpen=!1}}>
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
          <div class="rm-body" data-nav="${this._navDirection}">${this._renderBody()}</div>
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

    :host([glass-wave]) {
      color-scheme: light;
      --rm-dialog-bg: #F9EFDA;
      --rm-success: #576C65;
      --rm-primary: #416F8F;
      --rm-accent-text: #fff;
      --rm-danger: #B46F52;
      --rm-touch-target: 44px;
      --rm-warning: #C19A3F;
      --rm-error: #B46F52;
      --rm-radius: 18px;
      --rm-radius-sm: 12px;
    }
    :host([glass-wave]) ha-card.rm-card { border: 1px solid var(--rm-border); border-radius: 18px; box-shadow: var(--rm-shadow); }
    :host([glass-wave]) button, :host([glass-wave]) select { min-height: 44px; }

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

  `};try{customElements.define("mm-unified-app",tt)}catch{}export{tt as UnifiedApp};
