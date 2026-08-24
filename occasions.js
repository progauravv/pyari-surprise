/**
 * Pyari — Occasions, Atmospheres, Audio & Presets Registry
 */

const OCCASIONS = {
  birthday: {
    id: 'birthday',
    label: 'Birthday',
    nepali: 'जन्मदिनको शुभकामना',
    emoji: '🎂',
    icon: '🎂',
    badge: 'Popular',
    defaultAudio: 'birthday_funny',
    defaultTitle: 'Happy Birthday!',
    defaultMessage: 'Wishing you endless happiness, laughter, and your biggest dreams fulfilled! Here is to celebrating another year of you being wonderful.'
  },
  anniversary: {
    id: 'anniversary',
    label: 'Anniversary',
    nepali: 'वार्षिकोत्सव (मायाको दिन)',
    emoji: '💍',
    icon: '💍',
    badge: 'Milestone',
    defaultAudio: 'romantic_strings',
    defaultTitle: 'Happy Anniversary!',
    defaultMessage: 'Every day with you is a gift. Thank you for filling my world with boundless love and quiet joy.'
  },
  friendship: {
    id: 'friendship',
    label: 'Best Friends',
    nepali: 'सबैभन्दा मिल्ने साथी',
    emoji: '💖',
    icon: '💖',
    badge: 'Affection',
    defaultAudio: 'retro_arcade',
    defaultTitle: 'You are so special!',
    defaultMessage: 'Life is infinitely brighter and warmer with you around. Thank you for always being my safe place.'
  },
  congrats: {
    id: 'congrats',
    label: 'Congratulations',
    nepali: 'बधाई तथा सफलता',
    emoji: '🏆',
    icon: '🏆',
    badge: 'Achievement',
    defaultAudio: 'celebration_fanfare',
    defaultTitle: 'Huge Congratulations!',
    defaultMessage: 'So proud of your incredible achievement! Your hard work and dedication made this happen.'
  },
  apology: {
    id: 'apology',
    label: 'Apology & Peace',
    nepali: 'माफी र मिलाप',
    emoji: '🥺',
    icon: '🥺',
    badge: 'Heartfelt',
    defaultAudio: 'sad_trombone',
    defaultTitle: 'I am so sorry...',
    defaultMessage: 'I know I messed up, but you mean the world to me. Can we please hit restart with snacks on me?'
  },
  just_because: {
    id: 'just_because',
    label: 'Special Moment',
    nepali: 'मायाको मीठो उपहार',
    emoji: '✨',
    icon: '✨',
    badge: 'Custom',
    defaultAudio: 'celebration_fanfare',
    defaultTitle: 'A Special Delivery!',
    defaultMessage: 'Just wanted to take a moment to celebrate you and remind you that you are deeply cherished.'
  }
};

const STYLES = {
  prank: {
    id: 'prank',
    name: 'Prank',
    nepaliTitle: 'हँसाउने र झुक्याउने',
    emoji: '😈',
    previewBadge: 'Prank',
    description: 'Funny fake error countdown that flips into love',
    nepaliDesc: 'सुरुमा झुक्याउने र त्यसपछि हँसाउने'
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    nepaliTitle: 'मायालु र रोमान्टिक',
    emoji: '🌹',
    previewBadge: 'Romantic',
    description: 'Gentle warm glow and floating hearts',
    nepaliDesc: 'मन छुने मीठो माया र भावना'
  },
  celebration: {
    id: 'celebration',
    name: 'Celebration',
    nepaliTitle: 'धमाकेदार खुसीयाली',
    emoji: '✨',
    previewBadge: 'Joyful',
    description: 'Golden fanfare and sparkling party confetti',
    nepaliDesc: 'भव्य उत्सव र रमाइलो'
  },
  confusing: {
    id: 'confusing',
    name: 'Mystery',
    nepaliTitle: 'रोमाञ्चक रहस्य',
    emoji: '🧩',
    previewBadge: 'Mystery',
    description: 'Cryptic cipher that unscrambles into your note',
    nepaliDesc: 'रहस्यमयी तरिकाले खुल्ने'
  }
};

/**
 * 🎵 6 EASILY CUSTOMIZABLE SOUNDTRACK PRESETS:
 * To replace with a local audio file or URL, set audioUrl: 'audio/yourfile.mp3' or 'https://...'
 * If empty '', it automatically plays the built-in procedural synthesizer.
 */
const SOUND_TRACKS = [
  {
    id: 'birthday_funny',
    title: '🎂 Funny 8-Bit Happy Birthday',
    desc: 'Playful chiptune birthday song',
    audioUrl: 'happy-birthday.mp3'
  },
  {
    id: 'birthday_clown',
    title: '🤡 Circus Party Tune',
    desc: 'Goofy boing party fanfare',
    audioUrl: 'special-moment.mp3'
  },
  {
    id: 'sad_trombone',
    title: '🎺 Meme Sad Trombone',
    desc: 'Comedic fail: Wah-wah-wah-waaah',
    audioUrl: 'sorry_sorry.mp3'
  },
  {
    id: 'celebration_fanfare',
    title: '🎷 Victory Brass Fanfare',
    desc: 'Joyful triumphant celebration',
    audioUrl: 'congratulations.mp3'
  },
  {
    id: 'romantic_strings',
    title: '🌹 Romantic Twilight Strings',
    desc: 'Lush emotional ambient chords',
    audioUrl: 'anniversary.mp3'
  },
  {
    id: 'retro_arcade',
    title: '👾 8-Bit Arcade Power-Up',
    desc: 'Retro game victory chimes',
    audioUrl: 'best_friend.mp3'
  }
];

function getOccasion(id) {
  return OCCASIONS[id] || OCCASIONS.birthday;
}

if (typeof window !== 'undefined') {
  window.OCCASIONS = OCCASIONS;
  window.STYLES = STYLES;
  window.SOUND_TRACKS = SOUND_TRACKS;
  window.getOccasion = getOccasion;
}