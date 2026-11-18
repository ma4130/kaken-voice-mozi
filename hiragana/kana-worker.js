let enginePromise=null;
const BASE_URL=new URL('.',self.location.href);
const DICT_URL=new URL('dict/',BASE_URL).href;
function init(){if(enginePromise)return enginePromise;enginePromise=(async()=>{importScripts(new URL('vendor/kuroshiro.min.js',BASE_URL).href,new URL('vendor/kuroshiro-analyzer-kuromoji.min.js',BASE_URL).href);const engine=new Kuroshiro();await engine.init(new KuromojiAnalyzer({dictPath:DICT_URL}));return engine})();return enginePromise}
self.onmessage=async e=>{const m=e.data||{};try{const engine=await init();if(m.type==='init'){self.postMessage({type:'ready'});return}if(m.type==='convert'){const value=await engine.convert(String(m.text||''),{to:'hiragana'});const text=value.replace(/[ァ-ヶ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-96)).replace(/[^\p{Script=Hiragana}]/gu,'');self.postMessage({type:'result',id:m.id,text})}}catch(error){self.postMessage({type:'error',id:m.id||0,message:error?.message||'ひらがな変換に失敗しました'})}}
