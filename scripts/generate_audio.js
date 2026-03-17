import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const audioDir = path.join(__dirname, '../public/audio');

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const vowels = ['а', 'е', 'є', 'и', 'і', 'ї', 'о', 'у', 'ю', 'я'];
const continuants = ['м', 'н', 'л', 'р', 'в', 'й', 'с', 'з', 'ж', 'ш', 'х', 'ф'];
const plosives = ['б', 'п', 'г', 'ґ', 'д', 'т', 'к', 'ч', 'ц', 'щ'];

const praisePhrases = [
    "Ти велика молодець!", "Яка ти розу́мничка!", "Ти справжня зірочка!",
    "Ксенія, ти велика молодець!", "Як ти все це вивчила?", "Неймовірно! Ти так швидко вчишся!", 
    "Ти просто супер!", "Яка ти розу́мничка, Ксюня!", "Я тобою пиша́юся!", 
    "Ти справжня розу́мниця!", "Ти все знаєш! Молодець!", "Ого! Яка ти уважна!", 
    "Ти найкраща учениця, Ксенія!", "Ти просто чарівниця!", "Це було ідеально!", 
    "Ти робиш це дуже легко!", "Ти така розумна дівчинка!", "Ти просто диво, Ксюня!", 
    "Ти все правильно знайшла!", "Ти справжня майстриня літер!",
    "Ура! Ти відкрила картинку!"
];

const errorPhrases = [
    "Ні, це не та літера, спробуй ще раз!", 
    "На жаль, це помилка. Ксюня, спробуй іншу літеру.", 
    "Ні, ти помилилася. Подивися уважніше!", 
    "Це невірна відповідь. Спробуй ще, Ксенія!", 
    "Ні, це інша літера. Давай ще раз!", 
    "Помилка! Ксюня, будь уважнішою.", 
    "Ні, це не вона. Спробуй знайти потрібну літеру!", 
    "Неправильно. Спробуй ще раз, Ксенія!", 
    "Ні, Ксюня, це не та літера. Подумай ще!", 
    "На жаль, не вгадала. Спробуй іншу!"
];

async function downloadAudio(text, filename, fast = false) {
    const speed = fast ? '&ttsspeed=1.5' : ''; 
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=uk&client=tw-ob${speed}`;
    const filePath = path.join(audioDir, filename);
    try {
        const response = await axios({ method: 'get', url, responseType: 'stream', headers: { 'Referer': 'http://translate.google.com/', 'User-Agent': 'Mozilla/5.0' } });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve) => writer.on('finish', resolve));
    } catch (e) { console.error(`Помилка: ${filename}`, e.message); }
}

async function run() {
    console.log('Оновлення звуків (Р -> рррр)...');
    
    for (const l of vowels) {
        const text = (l === 'и') ? "и-и" : `${l}-${l}`;
        await downloadAudio(text, `${l}.mp3`, false);
        await new Promise(r => setTimeout(r, 400));
    }
    for (const l of continuants) {
        // Хак для "Р": використовуємо "рррр" для вібруючого звуку
        const text = (l === 'р') ? "рррр" : `${l}-${l}`;
        await downloadAudio(text, `${l}.mp3`, false);
        await new Promise(r => setTimeout(r, 400));
    }
    for (const l of plosives) {
        await downloadAudio(l, `${l}.mp3`, false);
        await new Promise(r => setTimeout(r, 400));
    }

    console.log('Оновлення фраз...');
    for (let i = 0; i < praisePhrases.length; i++) { await downloadAudio(praisePhrases[i], `praise_${i}.mp3`, true); await new Promise(r => setTimeout(r, 300)); }
    for (let i = 0; i < errorPhrases.length; i++) { await downloadAudio(errorPhrases[i], `error_${i}.mp3`, true); await new Promise(r => setTimeout(r, 300)); }
    
    console.log('\nГотово!');
}
run();
