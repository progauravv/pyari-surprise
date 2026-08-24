/**
 * Pyari — Studio Controller & State Engine
 */
(function () {
  'use strict';

  const state = {
    currentStep: 1,
    occasion: 'birthday',
    style: 'prank',
    ceremony: 'gift_box',
    soundtrack: 'birthday_funny',
    photoDataUrl: '',
    recipientName: '',
    senderName: '',
    customMessage: '',
    generatedLink: ''
  };

  let supabaseClient = null;

  function initDatabase() {
    if (window.isSupabaseConfigured && window.isSupabaseConfigured() && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
      } catch (err) {
        supabaseClient = null;
      }
    }
  }

  function renderOccasions() {
    const grid = document.getElementById('occasions-grid');
    if (!grid || !window.OCCASIONS) return;
    grid.innerHTML = '';

    Object.values(window.OCCASIONS).forEach((occ) => {
      const card = document.createElement('div');
      card.className = `bento-choice-card ${state.occasion === occ.id ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="tile-top-row">
          <span class="tile-emoji">${occ.emoji || '🎁'}</span>
          <span class="tile-badge">${occ.badge}</span>
        </div>
        <div class="tile-title">${occ.label}</div>
        <div class="tile-nepali-title">${occ.nepali}</div>
      `;

      card.addEventListener('click', () => {
        state.occasion = occ.id;
        if (occ.defaultAudio) state.soundtrack = occ.defaultAudio;
        renderSoundtracks();
        document.querySelectorAll('#occasions-grid .bento-choice-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        if (window.soundEngine) window.soundEngine.playPop();
        updateLivePreview();
      });

      grid.appendChild(card);
    });
  }

  function renderStyles() {
    const grid = document.getElementById('styles-grid');
    if (!grid || !window.STYLES) return;
    grid.innerHTML = '';

    Object.values(window.STYLES).forEach((st) => {
      const card = document.createElement('div');
      card.className = `bento-choice-card ${state.style === st.id ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="tile-top-row">
          <span class="tile-emoji">${st.emoji}</span>
          <span class="tile-badge">${st.previewBadge}</span>
        </div>
        <div class="tile-title">${st.name}</div>
        <div class="tile-nepali-title">${st.nepaliTitle}</div>
        <div class="tile-desc">${st.description}</div>
        <div class="tile-nepali-desc">${st.nepaliDesc}</div>
      `;

      card.addEventListener('click', () => {
        state.style = st.id;
        document.querySelectorAll('#styles-grid .bento-choice-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        if (window.soundEngine) window.soundEngine.playPop();
        updateLivePreview();
      });

      grid.appendChild(card);
    });
  }

  function renderSoundtracks() {
    const grid = document.getElementById('soundtrack-grid');
    if (!grid || !window.SOUND_TRACKS) return;
    grid.innerHTML = '';

    window.SOUND_TRACKS.forEach((track) => {
      const item = document.createElement('div');
      item.className = `soundtrack-item ${state.soundtrack === track.id ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="sound-title">${track.title}</div>
        <div class="sound-desc">${track.desc}</div>
      `;

      item.addEventListener('click', () => {
        state.soundtrack = track.id;
        document.querySelectorAll('.soundtrack-item').forEach((b) => b.classList.remove('selected'));
        item.classList.add('selected');
        if (window.soundEngine) {
          window.soundEngine.init();
          window.soundEngine.playTheme(track.id);
        }
      });

      grid.appendChild(item);
    });
  }

  function updateLivePreview() {
    const occ = (window.getOccasion && window.getOccasion(state.occasion)) || (window.OCCASIONS ? window.OCCASIONS.birthday : { label: 'Birthday', emoji: '🎂', defaultMessage: 'Happy Birthday!' });
    const name = state.recipientName.trim() || 'Maya';
    const sender = state.senderName.trim() || 'Rohan';
    const msg = state.customMessage.trim() || occ.defaultMessage;

    const occTag = document.getElementById('preview-occ-tag');
    if (occTag) occTag.textContent = `${occ.emoji || '🎂'} ${(occ.label || 'Birthday').toUpperCase()}`;
    
    const prevTitle = document.getElementById('preview-title');
    if (prevTitle) prevTitle.textContent = (occ.defaultTitle || 'Happy Birthday!').replace('!', `, ${name}!`);
    
    const prevQuote = document.getElementById('preview-quote');
    if (prevQuote) prevQuote.textContent = `"${msg}"`;
    
    const prevSender = document.getElementById('preview-sender');
    if (prevSender) prevSender.textContent = sender;

    const simPhotoBox = document.getElementById('sim-photo-box');
    const simPhotoImg = document.getElementById('sim-photo-img');
    if (simPhotoBox && simPhotoImg) {
      if (state.photoDataUrl) {
        simPhotoBox.style.display = 'block';
        simPhotoImg.src = state.photoDataUrl;
      } else {
        simPhotoBox.style.display = 'none';
      }
    }
  }

  function goToStep(step) {
    state.currentStep = step;
    for (let i = 1; i <= 4; i++) {
      document.getElementById(`step-view-${i}`)?.classList.toggle('active', i === step);
      document.getElementById(`step-btn-${i}`)?.classList.toggle('active', i === step);
    }
  }

  function renderQRCode(url) {
    const container = document.getElementById('qr-code-container');
    if (!container || !window.QRCode) return;
    container.innerHTML = '';
    try {
      new QRCode(container, {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#0A0A0C',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.warn('QR Code generation skipped due to payload size:', e);
      container.innerHTML = '<p style="font-size: 0.75rem; color: #8E8C87; padding: 1rem;">Direct link available above</p>';
    }
  }

  async function generateCard(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const recInput = document.getElementById('recipient-name');
    const senInput = document.getElementById('sender-name');
    const rec = recInput ? recInput.value.trim() : '';
    const sen = senInput ? senInput.value.trim() : '';

    if (!rec) {
      alert('Please enter a recipient name.');
      recInput?.focus();
      return;
    }
    if (!sen) {
      alert('Please enter your name / signature.');
      senInput?.focus();
      return;
    }

    state.recipientName = rec;
    state.senderName = sen;
    const msgInput = document.getElementById('custom-message');
    state.customMessage = msgInput ? msgInput.value.trim() : '';

    const defaultOccMsg = (window.getOccasion && window.getOccasion(state.occasion)?.defaultMessage) || 'Wishing you infinite happiness and smiles!';

    const payload = {
      id: (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
          const random = Math.random() * 16 | 0;
          const value = char === 'x' ? random : (random & 0x3 | 0x8);
          return value.toString(16);
        }),
      occasion: state.occasion,
      style: state.style,
      ceremony: state.ceremony,
      soundtrack: state.soundtrack,
      photo_url: state.photoDataUrl,
      recipient_name: state.recipientName,
      sender_name: state.senderName,
      custom_message: state.customMessage || defaultOccMsg,
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('cards').insert([payload]);
        if (error) throw error;
      } catch (err) {
        console.error('Could not save card:', err);
        const reason = err?.message ? `\n\nDatabase says: ${err.message}` : '';
        alert(`The surprise could not be saved. Please check the database setup and try again.${reason}`);
        return;
      }
    }

    try {
      localStorage.setItem(`pyari_card_${payload.id}`, JSON.stringify(payload));
    } catch (err) {}

    const origin = window.location.origin.includes('http')
      ? window.location.origin + window.location.pathname.replace('index.html', '')
      : '';
    // Keep the share URL small. The card data, including any photo, is loaded by id.
    const finalUrl = `${origin}card.html?id=${encodeURIComponent(payload.id)}`;
    state.generatedLink = finalUrl;

    const linkInput = document.getElementById('shareable-link-input');
    if (linkInput) linkInput.value = finalUrl;

    const previewLink = document.getElementById('preview-surprise-link-btn');
    if (previewLink) previewLink.href = finalUrl;

    renderQRCode(finalUrl);

    if (window.soundEngine) {
      window.soundEngine.init();
      window.soundEngine.playTheme(state.soundtrack);
    }
    goToStep(4);
  }

  function setupPhotoUpload() {
    const fileInput = document.getElementById('photo-file-input');
    const dropArea = document.getElementById('image-drop-area');
    const placeholder = document.getElementById('upload-placeholder-content');
    const previewBox = document.getElementById('upload-preview-container');
    const previewImg = document.getElementById('photo-preview-img');
    const removeBtn = document.getElementById('remove-photo-btn');

    dropArea?.addEventListener('click', (e) => {
      if (e.target !== removeBtn) fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compress on Canvas to 480px max dimension & 0.65 quality (fits within URL limits)
          const canvas = document.createElement('canvas');
          const MAX_DIM = 480;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.65);
            state.photoDataUrl = compressed;
            if (previewImg) previewImg.src = compressed;
            if (placeholder) placeholder.style.display = 'none';
            if (previewBox) previewBox.style.display = 'flex';
            updateLivePreview();
          }
        };
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    });

    removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      state.photoDataUrl = '';
      if (fileInput) fileInput.value = '';
      if (previewImg) previewImg.src = '';
      if (placeholder) placeholder.style.display = 'flex';
      if (previewBox) previewBox.style.display = 'none';
      updateLivePreview();
    });
  }

  function attachListeners() {
    document.getElementById('next-to-step-2')?.addEventListener('click', () => goToStep(2));
    document.getElementById('back-to-step-1')?.addEventListener('click', () => goToStep(1));
    document.getElementById('next-to-step-3')?.addEventListener('click', () => goToStep(3));
    document.getElementById('back-to-step-2')?.addEventListener('click', () => goToStep(2));

    document.getElementById('recipient-name')?.addEventListener('input', (e) => {
      state.recipientName = e.target.value;
      updateLivePreview();
    });
    document.getElementById('sender-name')?.addEventListener('input', (e) => {
      state.senderName = e.target.value;
      updateLivePreview();
    });
    document.getElementById('custom-message')?.addEventListener('input', (e) => {
      state.customMessage = e.target.value;
      updateLivePreview();
    });

    document.getElementById('preview-audio-btn')?.addEventListener('click', () => {
      if (window.soundEngine) {
        window.soundEngine.init();
        window.soundEngine.playTheme(state.soundtrack);
      }
    });

    document.querySelectorAll('.ceremony-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ceremony-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.ceremony = btn.dataset.ceremony;
        if (window.soundEngine) window.soundEngine.playPop();
      });
    });

    document.getElementById('details-form')?.addEventListener('submit', generateCard);

    document.getElementById('copy-link-btn')?.addEventListener('click', () => {
      const input = document.getElementById('shareable-link-input');
      if (!input) return;
      input.select();
      navigator.clipboard.writeText(input.value);
      const btn = document.getElementById('copy-link-btn');
      if (btn) {
        btn.textContent = 'COPIED!';
        setTimeout(() => (btn.textContent = 'COPY LINK'), 2000);
      }
    });

    document.getElementById('share-whatsapp-btn')?.addEventListener('click', () => {
      const text = encodeURIComponent(`Hey ${state.recipientName}! I created a bespoke surprise for you ✨ Open it here: ${state.generatedLink}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });

    // QR Modal controls
    const qrModal = document.getElementById('qr-modal');
    document.getElementById('open-qr-btn')?.addEventListener('click', () => {
      if (qrModal) qrModal.classList.add('active');
      if (state.generatedLink) renderQRCode(state.generatedLink);
    });
    document.getElementById('close-qr-btn')?.addEventListener('click', () => qrModal?.classList.remove('active'));
    document.getElementById('modal-done-btn')?.addEventListener('click', () => qrModal?.classList.remove('active'));

    document.getElementById('create-another-btn')?.addEventListener('click', () => {
      document.getElementById('details-form')?.reset();
      state.photoDataUrl = '';
      const fInput = document.getElementById('photo-file-input');
      if (fInput) fInput.value = '';
      const placeholder = document.getElementById('upload-placeholder-content');
      if (placeholder) placeholder.style.display = 'flex';
      const prevBox = document.getElementById('upload-preview-container');
      if (prevBox) prevBox.style.display = 'none';
      goToStep(1);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    renderOccasions();
    renderStyles();
    renderSoundtracks();
    setupPhotoUpload();
    updateLivePreview();
    attachListeners();
  });
})();