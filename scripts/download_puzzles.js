import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const puzzleDir = path.join(__dirname, '../public/images/puzzles');

if (!fs.existsSync(puzzleDir)) {
    fs.mkdirSync(puzzleDir, { recursive: true });
}

// Використовуємо ГАРАНТОВАНО стабільні посилання на якісних щенят та єдинорогів
const puzzleImages = [
    // Рівні 1-10: Щенята (Paw Patrol spirit)
    "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=1000&q=80",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1000&q=80",
    "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1000&q=80",
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1000&q=80",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1000&q=80",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1000&q=80",
    "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1000&q=80",
    "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=1000&q=80",
    "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1000&q=80",
    "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=1000&q=80",

    // Рівні 11-20: Єдинороги та казкові герої
    "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1000&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&q=80",
    "https://images.unsplash.com/photo-1579546812127-5585673e8203?w=1000&q=80",
    "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1000&q=80",
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=1000&q=80",
    "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=1000&q=80",
    "https://images.unsplash.com/photo-1560160912-473e6593a153?w=1000&q=80",
    "https://images.unsplash.com/photo-1513360371669-4adaa101795d?w=1000&q=80",
    "https://images.unsplash.com/photo-1620421680010-0766ff230392?w=1000&q=80"
];

async function downloadImage(url, filename) {
    const filePath = path.join(puzzleDir, filename);
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            timeout: 15000
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Помилка: ${filename}`, error.message);
    }
}

async function run() {
    console.log('Завантаження картинок (Щенята та Єдинороги)...');

    for (let i = 0; i < puzzleImages.length; i++) {
        const filename = `${i + 1}.jpg`;
        await downloadImage(puzzleImages[i], filename);
        process.stdout.write(`${i + 1} `);
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n\nВсе завантажено! Можна перевіряти гру.');
}

run();
