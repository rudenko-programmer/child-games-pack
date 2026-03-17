export type LetterType = 'vowel' | 'consonant';
export interface Letter { char: string; type: LetterType; }

export const VOWELS: Letter[] = ['А', 'Е', 'Є', 'И', 'І', 'Ї', 'О', 'У', 'Ю', 'Я'].map(char => ({ char, type: 'vowel' }));
export const CONSONANTS: Letter[] = ['Б', 'В', 'Г', 'Ґ', 'Д', 'Ж', 'З', 'Й', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ'].map(char => ({ char, type: 'consonant' }));
export const ALL_LETTERS = [...VOWELS, ...CONSONANTS];

let activeAudio: HTMLAudioElement | null = null;
const lastPraiseIndices: number[] = [];
const lastErrorIndices: number[] = [];

const stopCurrentAudio = () => {
    if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
    }
    window.speechSynthesis.cancel();
};

export const speakLetter = (letter: Letter) => {
    stopCurrentAudio();
    // Крапка перед шляхом (./) критично важлива для Electron!
    activeAudio = new Audio(`./audio/${letter.char.toLowerCase()}.mp3`);
    activeAudio.play().catch(() => {
        const ut = new SpeechSynthesisUtterance(letter.char.toLowerCase());
        ut.lang = 'uk-UA';
        window.speechSynthesis.speak(ut);
    });
};

export const playRandomFeedback = (success: boolean) => {
    stopCurrentAudio();
    const count = success ? 21 : 10; // Додав 21-й індекс для фінальної фрази
    const history = success ? lastPraiseIndices : lastErrorIndices;
    const limit = 5;

    let randomIndex: number;
    do {
        randomIndex = Math.floor(Math.random() * count);
    } while (history.includes(randomIndex) && count > limit);

    history.push(randomIndex);
    if (history.length > limit) history.shift();

    const prefix = success ? 'praise' : 'error';
    const filename = `${prefix}_${randomIndex}.mp3`;
    
    activeAudio = new Audio(`./audio/${filename}`);
    activeAudio.play().catch(() => {
        const msg = success ? "Молодець, Ксенія!" : "Спробуй ще раз, Ксюня!";
        const ut = new SpeechSynthesisUtterance(msg);
        ut.lang = 'uk-UA';
        window.speechSynthesis.speak(ut);
    });
};

export const initSpeech = () => {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(' '));
};
