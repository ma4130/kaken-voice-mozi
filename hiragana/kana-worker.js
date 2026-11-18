let readingsPromise=null;
const READINGS_URL=new URL('readings.json',self.location.href).href;
function init(){if(readingsPromise)return readingsPromise;readingsPromise=fetch(READINGS_URL,{cache:'force-cache'}).then(response=>{if(!response.ok)throw Error('読み辞書を取得できません');return response.json()});return readingsPromise}
function kanaToHiragana(value){return value.replace(/[ァ-ヶ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-96))}
self.onmessage=async e=>{const m=e.data||{};try{const readings=await init();if(m.type==='init'){self.postMessage({type:'ready'});return}if(m.type==='convert'){const text=String(m.text||'').trim().split(/\s+/).map(word=>readings[word]||kanaToHiragana(word)).join('').replace(/[^\p{Script=Hiragana}]/gu,'');self.postMessage({type:'result',id:m.id,text})}}catch(error){self.postMessage({type:'error',id:m.id||0,message:error?.message||'ひらがな変換に失敗しました'})}}
