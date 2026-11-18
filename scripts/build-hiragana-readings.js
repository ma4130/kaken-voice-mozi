const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const kuromoji = require(path.join(ROOT, '.cache', 'hiragana', 'node_modules', 'kuromoji'));
const wordsPath = path.join(ROOT, '.cache', 'hiragana', 'vosk-words.txt');
const dictPath = path.join(ROOT, '.cache', 'hiragana', 'node_modules', 'kuromoji', 'dict');
const outputPath = path.join(ROOT, 'hiragana', 'readings.json');

function kanaToHiragana(value) {
  return value.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 96));
}
function expandLongVowels(value) {
  const groups = [
    ['ぁあかがさざただなはばぱまゃやらゎわ', 'あ'],
    ['ぃいきぎしじちぢにひびぴみりゐ', 'い'],
    ['ぅうくぐすずつづぬふぶぷむゅゆるゔ', 'う'],
    ['ぇえけげせぜてでねへべぺめれゑ', 'え'],
    ['ぉおこごそぞとどのほぼぽもょよろを', 'お'],
  ];
  let result = '';
  for (const ch of value) {
    if (ch !== 'ー') { result += ch; continue; }
    const previous = Array.from(result).at(-1) || '';
    const match = groups.find(([chars]) => chars.includes(previous));
    if (match) result += match[1];
  }
  return result;
}

const words = fs.readFileSync(wordsPath, 'utf8')
  .split(/\r?\n/)
  .map(line => line.replace(/\s+\d+$/, ''))
  .filter(word => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(word));

kuromoji.builder({ dicPath: dictPath }).build((error, tokenizer) => {
  if (error) throw error;
  const readings = Object.create(null);
  for (const word of words) {
    const reading = tokenizer.tokenize(word)
      .map(token => token.reading || token.surface_form)
      .join('');
    const hiragana = expandLongVowels(kanaToHiragana(reading))
      .replace(/[^\p{Script=Hiragana}]/gu, '');
    if (hiragana) readings[word] = hiragana;
  }
  fs.writeFileSync(outputPath, JSON.stringify(readings));
  console.log(`Created ${Object.keys(readings).length} hiragana readings at ${outputPath}.`);
});
