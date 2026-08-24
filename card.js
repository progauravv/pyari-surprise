/**
 * Pyari — Recipient Reveal Engine with Photo & Audio
 */
(function () {
  'use strict';

  let confettiEngine = null;

  function decodePayload(str) {
    try {
      let clean = str;
      let base64 = clean.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const decoded = atob(base64);
      const json = decodeURIComponent(
        Array.prototype.map
          .call(decoded, (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch (e) {
      try {
        return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(str)))));
      } catch (err) {
        return null;
      }
    }
  }

  function getFallbackCardData() {
    return {
      recipient_name: 'Pyari Friend',
      sender_name: 'Someone Special',
      occasion: 'birthday',
      ceremony: 'gift_box',
      soundtrack: 'birthday_funny',
      custom_message: 'Wishing you endless joy, laughter, and your biggest dreams fulfilled!'
    };
  }

  async function getCardData() {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    if (d) {
      const decoded = decodePayload(d);
      if (decoded) return decoded;
    }
    const id = params.get('id');
    if (id) {
      if (window.isSupabaseConfigured?.() && window.supabase && window.CONFIG) {
        try {
          const client = window.supabase.createClient(
            window.CONFIG.SUPABASE_URL,
            window.CONFIG.SUPABASE_ANON_KEY
          );
          const { data, error } = await client.from('cards').select('*').eq('id', id).maybeSingle();
          if (!error && data) return data;
        } catch (e) {}
      }

      try {
        const local = localStorage.getItem(`pyari_card_${id}`);
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return getFallbackCardData();
  }

  let card = getFallbackCardData();

  function populateCardInfo() {
    const heroName = document.getElementById('hero-recipient-name');
    if (heroName) heroName.textContent = card.recipient_name;

    const occ = (window.getOccasion && window.getOccasion(card.occasion)) || { label: 'Birthday', emoji: '🎂' };
    
    document.getElementById('card-occ-emoji').textContent = occ.emoji || '🎂';
    document.getElementById('card-occ-text').textContent = `${(occ.label || 'Special').toUpperCase()} EDITION`;
    document.getElementById('card-headline').textContent = `${occ.defaultTitle || 'Special Moments for'} ${card.recipient_name}!`;
    document.getElementById('card-message-body').textContent = card.custom_message;
    document.getElementById('card-sender-name').textContent = card.sender_name.toUpperCase();
    document.getElementById('sig-monogram-badge').textContent = (card.sender_name[0] || 'P').toUpperCase();

    // Show attached photo if present
    if (card.photo_url) {
      const photoContainer = document.getElementById('card-photo-container');
      const photoImg = document.getElementById('card-photo-img');
      if (photoContainer && photoImg) {
        photoContainer.style.display = 'block';
        photoImg.src = card.photo_url;
      }
    }

    const trackNames = {
      birthday_funny: 'PLAYING: 8-BIT HAPPY BIRTHDAY 🎂',
      birthday_clown: 'PLAYING: CIRCUS PARTY BOING 🤡',
      sad_trombone: 'PLAYING: MEME SAD TROMBONE 🎺',
      celebration_fanfare: 'PLAYING: VICTORY BRASS FANFARE 🎷',
      romantic_strings: 'PLAYING: ROMANTIC STRINGS 🌹',
      retro_arcade: 'PLAYING: RETRO 8-BIT ARCADE 👾'
    };
    document.getElementById('track-name-label').textContent = trackNames[card.soundtrack] || 'PLAYING: BESPOKE SOUNDTRACK';
  }

  function setupCeremony() {
    const ceremony = card.ceremony || 'gift_box';
    document.getElementById('artifact-gift-box').style.display = ceremony === 'gift_box' ? 'flex' : 'none';
    document.getElementById('artifact-wax-seal').style.display = ceremony === 'wax_seal' ? 'flex' : 'none';
    document.getElementById('artifact-scratch').style.display = ceremony === 'scratch_card' ? 'flex' : 'none';
    document.getElementById('artifact-balloons').style.display = ceremony === 'balloons_pop' ? 'flex' : 'none';

    if (ceremony === 'scratch_card') initScratch();
    if (ceremony === 'balloons_pop') initBalloons();

    document.getElementById('gift-box-trigger')?.addEventListener('click', triggerReveal);
    document.getElementById('envelope-trigger')?.addEventListener('click', triggerReveal);
  }

  function initScratch() {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 280;
    canvas.height = 160;
    ctx.fillStyle = '#C59A4E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FAF8F5';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH WITH FINGER ✨', 140, 85);

    let isScratching = false;
    let count = 0;

    function scratchAt(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      count++;
      if (count > 25) triggerReveal();
    }

    canvas.addEventListener('mousedown', () => (isScratching = true));
    window.addEventListener('mouseup', () => (isScratching = false));
    canvas.addEventListener('mousemove', (e) => {
      if (!isScratching) return;
      const r = canvas.getBoundingClientRect();
      scratchAt(e.clientX - r.left, e.clientY - r.top);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      scratchAt(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
    });
  }

  function initBalloons() {
    const grid = document.getElementById('balloons-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const emojis = ['🎈', '🎉', '✨', '💖'];
    let popped = 0;

    emojis.forEach((emoji, idx) => {
      const b = document.createElement('div');
      b.className = 'balloon-item';
      b.style.backgroundColor = ['#FF3E00', '#E5B25D', '#FF2A55', '#8C5CFF'][idx];
      b.textContent = emoji;
      b.addEventListener('click', () => {
        b.classList.add('popped');
        popped++;
        if (window.soundEngine) window.soundEngine.playPop();
        if (popped >= 4) setTimeout(triggerReveal, 350);
      });
      grid.appendChild(b);
    });
  }

  function triggerReveal() {
    document.getElementById('unboxing-stage').style.display = 'none';
    document.getElementById('celebration-stage').style.display = 'block';

    if (window.soundEngine) {
      window.soundEngine.init();
      window.soundEngine.playTheme(card.soundtrack || 'birthday_funny');
    }

    if (!confettiEngine) confettiEngine = new window.ConfettiEngine('confetti-canvas');
    confettiEngine.grandFinaleBurst();
  }

  function setupSoundHUD() {
    document.getElementById('sound-toggle-btn')?.addEventListener('click', () => {
      if (window.soundEngine) {
        window.soundEngine.init();
        const isMuted = window.soundEngine.toggleMute();
        document.getElementById('sound-icon').textContent = isMuted ? '🔇' : '🔊';
        document.getElementById('sound-label').textContent = isMuted ? 'SOUND OFF' : 'SOUND ON';
      }
    });

    document.getElementById('pop-more-confetti-btn')?.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playPop();
      if (confettiEngine) confettiEngine.burst(60);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    getCardData().then((loadedCard) => {
      card = loadedCard;
      populateCardInfo();
      setupCeremony();
      setupSoundHUD();
    });
  });
})();