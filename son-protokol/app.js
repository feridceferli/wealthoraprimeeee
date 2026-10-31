/*
 * SON PROTOKOL — güvenli, çevrimdışı çalışabilen bulmaca simülasyonu.
 * Gerçek dosya sistemi / işletim sistemi / donanım erişimi YOKTUR.
 * Terminal, aşağıdaki beyaz listedeki oyun komutlarından başka işlem yapmaz.
 */
'use strict';

(() => {
  const $ = (id) => document.getElementById(id);
  const fileNames = ['olay.txt', 'sifreleme.txt', 'sinyal.txt', 'protokol.txt'];
  const documents = [
    [
      '## SANAL GÜVENLİK GÜNLÜĞÜ  //  001',
      '',
      'KAYIT: Kırmızı ışık sönmeden önce...',
      '',
      'SİLİNMİŞ SANAL LOG PARÇALARI:',
      '  03:12:07  > ÜÇÜNCÜ kapı: 1',
      '  03:10:09  > BİRİNCİ kapı: 7',
      '  03:11:04  > İKİNCİ kapı: 3',
      '',
      'İPUCU: Kapıların sırası önemlidir.',
      'Sırala. Birleştir. İlk kilidi aç.'
    ].join('\n'),
    [
      '## ŞİFRELEME NOTU  //  002',
      '',
      'ALFABE: ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'KAYDIRMA: +3',
      '',
      'ŞİFRELİ KELİME:',
      '  DQDKWDU',
      '',
      'Her harf, İngilizce A-Z alfabesinde',
      'üç basamak ileri kaydırıldı.',
      'Özgün kelimeyi bulabilmek için',
      'üç basamak GERİ git.'
    ].join('\n'),
    [
      '## DİJİTAL SİNYAL  //  003',
      '',
      'FREKANS PAKETİ:',
      '  100101',
      '',
      'Bu sayı ikilik (binary) tabandadır.',
      'Onda birlik (decimal) tabana dönüştür.',
      '',
      'İstersen sanal terminalde şu',
      'oyun komutunu kullanabilirsin:',
      '  convert 100101',
      '',
      'NOT: Bu komut yalnızca oyunun içindedir.'
    ].join('\n'),
    [
      '## SON PROTOKOL  //  004',
      '',
      'İLK KİLİT:    [ 731 ]',
      'İKİNCİ KİLİT: [ ANAHTAR ]',
      'ÜÇÜNCÜ KİLİT: [ 37 ]',
      '',
      'SON FORMÜL:',
      '  ILK-IKINCI-UCUNCU',
      '',
      'Örnek biçim: 123-KELIME-45',
      '',
      'Kelimeleri değil, bulduğun',
      'gerçek oyun cevaplarını gir.',
      'Dört kilit açılırsa protokol biter.'
    ].join('\n')
  ];
  const steps = [
    {
      name: 'KAYIP LOG',
      description: 'Sanal güvenlik günlüğündeki üç kapı numarasını doğru sıraya diz. Birinci kapıdan üçüncüye kadar rakamları birleştir.',
      format: '3 HANELİ SAYI',
      placeholder: 'Örnek: 123',
      answer: '731',
      hint: 'Birinci kapı 7, ikinci kapı 3, üçüncü kapı 1. Cevabı araya boşluk koymadan yaz.',
      voice: 'İlk iz seni bekliyor. Sıralama, gerçeğin tek anahtarıdır.'
    },
    {
      name: 'ŞİFRELİ MESAJ',
      description: 'Sanal not defterindeki şifreli sözcüğü çöz. İngilizce A-Z alfabesinde her harfi üç konum geri kaydır.',
      format: 'BÜYÜK HARFLİ KELİME',
      placeholder: 'Çözdüğün kelime',
      answer: 'ANAHTAR',
      hint: 'DQDKWDU → ANAHTAR. D harfinden 3 geri gidince A harfine ulaşılır.',
      voice: 'Gördüğün harflere güvenme. Bazen ilerlemek için geri gitmelisin.'
    },
    {
      name: 'KIRIK FREKANS',
      description: '100101 ikilik sayısını onluk sisteme dönüştür. İstersen sanal terminalde convert komutunu kullan.',
      format: '2 HANELİ SAYI',
      placeholder: 'Onluk karşılığı',
      answer: '37',
      hint: 'İkilik 100101 = 32 + 4 + 1 = 37.',
      voice: 'Sıfır ve bir. Bütün dünya bu ikisinin arasında saklı.'
    },
    {
      name: 'SON ANAHTAR',
      description: 'Önceki üç kilidin cevaplarını sırayla tire ile birleştir. Son protokol dosyasında örnek biçim yer alıyor.',
      format: 'SAYI-KELİME-SAYI',
      placeholder: 'Örnek: 123-KELIME-45',
      answer: '731-ANAHTAR-37',
      hint: 'Tüm cevapları sıra ile yaz: 731-ANAHTAR-37.',
      voice: 'Son kapı açıldı. Peki ya anahtar? Hepsi zaten elindeydi.'
    }
  ];

  const state = {
    view: 'welcome',
    minutes: 10,
    step: 0,
    documentIndex: 0,
    mistakes: 0,
    secondsLeft: 600,
    deadline: 0,
    animationFrame: 0,
    audioEnabled: true,
    hintsShown: new Set(),
    audio: null,
    toneNodes: [],
    toastTimer: 0,
    flashTimer: 0
  };

  const audio = {
    async activate() {
      if (!state.audioEnabled) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      try {
        if (!state.audio) state.audio = new Ctx();
        if (state.audio.state === 'suspended') await state.audio.resume();
        if (state.toneNodes.length === 0) {
          const filter = state.audio.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 165;
          const gain = state.audio.createGain();
          gain.gain.value = 0.012;
          filter.connect(gain);
          gain.connect(state.audio.destination);
          for (const frequency of [55, 55.5, 82.4]) {
            const oscillator = state.audio.createOscillator();
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = frequency;
            oscillator.connect(filter);
            oscillator.start();
            state.toneNodes.push(oscillator);
          }
          state.toneNodes.push(gain);
        }
      } catch (err) {
        console.info('Ses cihazı desteklenmiyor veya izin verilmedi.', err);
      }
    },
    beep(frequency = 420, length = .09, volume = .065) {
      if (!state.audioEnabled || !state.audio || state.audio.state !== 'running') return;
      try {
        const osc = state.audio.createOscillator();
        const gain = state.audio.createGain();
        const now = state.audio.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency / 2), now + length);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(.0001, now + length);
        osc.connect(gain);
        gain.connect(state.audio.destination);
        osc.start(now);
        osc.stop(now + length + .005);
      } catch (err) {
        console.info('Ses efekti kullanılamıyor.', err);
      }
    },
    say(message) {
      if (!state.audioEnabled || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'tr-TR';
        utterance.pitch = .59;
        utterance.rate = .85;
        utterance.volume = .82;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.toLowerCase().startsWith('tr'));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.info('Konuşma sentezleyici kullanılamıyor.', err);
      }
    },
    stop() {
      try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (_) { /* no-op */ }
      if (state.audio?.state === 'running') {
        state.audio.suspend().catch(() => {});
      }
    }
  };

  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function formatTime(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
  }
  function toast(message) {
    clearTimeout(state.toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    state.toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500);
  }
  function flash() {
    const node = $('flashOverlay');
    node.classList.remove('active');
    void node.offsetWidth;
    node.classList.add('active');
    clearTimeout(state.flashTimer);
    state.flashTimer = setTimeout(() => node.classList.remove('active'), 500);
  }
  function showView(view) {
    state.view = view;
    $('welcomeView').classList.toggle('is-hidden', view !== 'welcome');
    $('gameView').classList.toggle('is-hidden', view !== 'game');
    $('endView').classList.toggle('is-hidden', view !== 'end');
    document.body.classList.remove('time-critical');
    document.title = view === 'game' ? 'SON PROTOKOL // OTURUM AÇIK' : 'SON PROTOKOL // Siber Gerilim Simülasyonu';
  }
  function renderFiles() {
    const list = $('fileList');
    list.replaceChildren();
    fileNames.forEach((file, index) => {
      const locked = index > state.step;
      const button = el('button', 'file-item' + (index === state.documentIndex ? ' active' : ''));
      button.type = 'button';
      button.disabled = locked;
      button.dataset.fileIndex = String(index);
      button.setAttribute('aria-label', `${file}, ${locked ? 'kilitli' : 'erişilebilir'}`);
      button.append(el('span', 'file-symbol', locked ? '♙' : '▤'));
      const text = el('span');
      text.append(el('strong', '', file));
      text.append(el('small', '', locked ? 'KİLİTLİ' : index < state.step ? 'ÇÖZÜLDÜ' : 'OKUNABİLİR'));
      button.append(text);
      button.addEventListener('click', () => openFile(index));
      list.append(button);
    });
  }
  function openFile(index) {
    if (state.view !== 'game') return;
    if (index > state.step || index < 0) { toast('Bu dosya henüz açılmadı.'); return; }
    state.documentIndex = index;
    $('editorTitle').textContent = fileNames[index];
    const lines = documents[index].split('\n');
    $('fileContent').textContent = documents[index];
    $('lineNumbers').textContent = lines.map((_, i) => String(i + 1).padStart(2, '0')).join('\n');
    renderFiles();
  }
  function appendTerminal(message, kind = 'info') {
    const output = $('terminalOutput');
    const line = el('div', `term-line term-${kind}`, message);
    output.append(line);
    while (output.childElementCount > 90) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }
  function runTerminal(raw) {
    if (state.view !== 'game') return;
    const command = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!command) return;
    appendTerminal(`sim@oyun:~$ ${raw.trim()}`, 'prompt');
    if (command === 'help' || command === 'yardim') {
      appendTerminal('İzin verilen oyun komutları: help, ls, status, whoami, clear, cat <dosya>, convert <ikilik-sayı>\nGerçek bir işletim sistemi kabuğu değildir.', 'ok');
    } else if (command === 'ls' || command === 'dir') {
      appendTerminal(fileNames.map((f,i) => `${i <= state.step ? '▤' : '⊠'}  ${f}${i > state.step ? ' [KİLİTLİ]' : ''}`).join('\n'));
    } else if (command === 'status') {
      appendTerminal(`OTURUM: SANAL\nKİLİT: ${state.step + 1}/4\nKALAN SÜRE: ${formatTime(state.secondsLeft)}\nDOSYA SİSTEMİ: yalnızca oyun belleği\nDONANIM ERİŞİMİ: yok`, 'ok');
    } else if (command === 'whoami') {
      appendTerminal('oyuncu // simülasyon modu', 'ok');
    } else if (command === 'clear') {
      $('terminalOutput').replaceChildren();
    } else if (command.startsWith('cat ')) {
      const file = command.slice(4).replace(/^\/simulasyon\/ipuclari\//, '').replace(/^\.\//, '');
      const index = fileNames.indexOf(file);
      if (index < 0) appendTerminal('Sanal dosya bulunamadı. ls komutunu dene.', 'error');
      else if (index > state.step) appendTerminal('Sanal dosya kilitli. Önce mevcut görevi çöz.', 'error');
      else { openFile(index); appendTerminal(documents[index]); }
    } else if (command.startsWith('convert ')) {
      const binary = command.slice(8);
      if (/^[01]{1,16}$/.test(binary)) {
        appendTerminal(`${binary} (ikilik) = ${parseInt(binary, 2)} (onluk)`, 'ok');
      } else appendTerminal('Kullanım: convert 100101 (1–16 ikili basamak)', 'error');
    } else {
      appendTerminal('Tanımsız oyun komutu. Bu terminal gerçek komut çalıştırmaz. help yaz.', 'error');
    }
  }
  function renderStage() {
    const step = steps[state.step];
    $('stepCounter').textContent = `${String(state.step + 1).padStart(2,'0')} / 04`;
    $('missionNo').textContent = String(state.step + 1).padStart(3,'0');
    $('missionTitle').textContent = step.name;
    $('missionDescription').textContent = step.description;
    $('answerFormat').textContent = step.format;
    $('answerInput').placeholder = step.placeholder;
    $('answerInput').value = '';
    $('feedback').textContent = '';
    $('feedback').classList.remove('success');
    $('hintText').classList.add('is-hidden');
    $('hintText').textContent = '';
    $('hintBtn').disabled = false;
    $('hintBtn').replaceChildren(document.createTextNode('◈ İPUCU GÖSTER '), el('span', '', '−15 SN'));
    $('progressLabel').innerHTML = `${String(state.step).padStart(2, '0')} <i>/ 04</i>`;
    $('progressTrack').setAttribute('aria-valuenow', String(state.step));
    $('progressFill').style.width = `${state.step * 25}%`;
    openFile(state.step);
  }
  function updateTimer() {
    if (state.view !== 'game') return;
    const remaining = Math.max(0, (state.deadline - performance.now()) / 1000);
    state.secondsLeft = remaining;
    $('timer').textContent = formatTime(remaining);
    document.body.classList.toggle('time-critical', remaining <= 60);
    if (remaining <= 0) { finish(false); return; }
    state.animationFrame = requestAnimationFrame(updateTimer);
  }
  function applyPenalty(seconds) {
    state.deadline -= seconds * 1000;
    state.secondsLeft = Math.max(0, (state.deadline - performance.now()) / 1000);
    $('timer').textContent = formatTime(state.secondsLeft);
    if (state.secondsLeft <= 0) finish(false);
  }
  function start() {
    if (state.view === 'game') return;
    cancelAnimationFrame(state.animationFrame);
    state.step = 0;
    state.mistakes = 0;
    state.documentIndex = 0;
    state.hintsShown = new Set();
    state.secondsLeft = state.minutes * 60;
    state.deadline = performance.now() + state.secondsLeft * 1000;
    $('terminalOutput').replaceChildren();
    $('mistakeLabel').textContent = '00';
    showView('game');
    renderStage();
    appendTerminal('SON PROTOKOL v2.0 // GÜVENLİ OYUN KABUĞU', 'ok');
    appendTerminal('Hoş geldin oyuncu. İpuçları için ls, komutlar için help yaz.');
    appendTerminal('Bu arayüz gerçek komutları çalıştırmaz, dosyalara erişmez.', 'info');
    $('statusMessage').textContent = 'SİSTEM: 1. KİLİT AKTİF';
    updateTimer();
    void audio.activate();
    audio.beep(120, .35, .06);
    audio.say('Merhaba oyuncu. Kontrolü ele geçirdiğimi sanıyorsun. Dört kilidin var. Zaman akıyor. Bakalım cevapları bulabilecek misin?');
  }
  function normalize(value) {
    return value.trim().toLocaleUpperCase('tr-TR').replace(/\s+/g, '').replace(/[‐‑‒–—−]/g, '-');
  }
  function answer() {
    if (state.view !== 'game') return;
    const userAnswer = normalize($('answerInput').value);
    if (!userAnswer) return;
    if (userAnswer === steps[state.step].answer) {
      audio.beep(800, .22, .075);
      flash();
      appendTerminal(`KİLİT 0${state.step + 1} DOĞRULANDI.`, 'ok');
      if (state.step === steps.length - 1) { finish(true); return; }
      state.step += 1;
      renderStage();
      $('statusMessage').textContent = `SİSTEM: ${state.step + 1}. KİLİT AKTİF`;
      $('feedback').textContent = '✓ Önceki kilit açıldı. Sıradaki görev hazır.';
      $('feedback').classList.add('success');
      audio.say(steps[state.step].voice);
    } else {
      state.mistakes += 1;
      $('mistakeLabel').textContent = String(state.mistakes).padStart(2,'0');
      $('feedback').textContent = '× Yanlış şifre. 12 saniye ceza uygulandı.';
      $('feedback').classList.remove('success');
      appendTerminal('GEÇERSİZ ŞİFRE // 12 SANİYE CEZA (oyun içi)', 'error');
      flash();
      audio.beep(150, .24);
      applyPenalty(12);
    }
  }
  function revealHint() {
    if (state.view !== 'game' || state.hintsShown.has(state.step)) return;
    const index = state.step;
    state.hintsShown.add(index);
    $('hintText').textContent = steps[index].hint;
    $('hintText').classList.remove('is-hidden');
    $('hintBtn').disabled = true;
    $('hintBtn').textContent = '✓ İPUCU AÇILDI';
    toast('İpucu gösterildi. 15 saniye düşürüldü.');
    audio.beep(320, .12);
    applyPenalty(15);
  }
  function finish(won) {
    if (state.view !== 'game') return;
    cancelAnimationFrame(state.animationFrame);
    state.secondsLeft = Math.max(0, state.secondsLeft);
    showView('end');
    $('endView').classList.toggle('failure', !won);
    $('endEyebrow').textContent = won ? 'ERİŞİM RESTORE EDİLDİ // SİMÜLASYON' : 'SÜRE DOLDU // SİMÜLASYON';
    $('endIcon').textContent = won ? '✓' : '×';
    $('endTitle').textContent = won ? 'SİSTEM GÜVENDE.' : 'PROTOKOL SONLANDI.';
    $('endDescription').textContent = won
      ? 'Dört kilidi çözdün. Kurgusal sistem yeniden senin kontrolünde. Bu defa zaman senin tarafındaydı.'
      : 'Süre doldu. Kurgusal ekran kartı arızası, mavi ekran ve veri kaybı yalnızca bu oyun penceresinde canlandırılıyor.';
    $('resultTime').textContent = formatTime(state.secondsLeft);
    $('resultLocks').textContent = `${won ? 4 : state.step} / 4`;
    $('resultMistakes').textContent = String(state.mistakes);
    $('mockCrash').classList.toggle('is-hidden', won);
    audio.stop();
    void audio.activate().then(() => {
      if (state.view !== 'end' || !state.audioEnabled) return;
      audio.beep(won ? 630 : 90, .6);
      audio.say(won
        ? 'Güzel oyun. Şifreyi buldun, dört kilidi açtın. Bu kez özgürsün, oyuncu.'
        : 'Zaman doldu. Bu yalnızca bir simülasyondu. Gerçek dosyaların ve donanımın güvende. Tekrar oynamak ister misin?');
    });
    if (!won) flash();
  }
  function leave() {
    cancelAnimationFrame(state.animationFrame);
    audio.stop();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    showView('welcome');
    $('endView').classList.remove('failure');
    toast('Simülasyondan güvenle çıkıldı.');
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast('Tarayıcın tam ekran API’sini desteklemiyor.');
    } catch (_) {
      toast('Tam ekran isteği reddedildi. Oyuna normal şekilde devam edebilirsin.');
    }
  }
  function toggleSound() {
    state.audioEnabled = !state.audioEnabled;
    $('audioBtn').setAttribute('aria-pressed', String(state.audioEnabled));
    $('audioLabel').textContent = state.audioEnabled ? 'SES AÇIK' : 'SES KAPALI';
    if (state.audioEnabled) void audio.activate();
    else audio.stop();
  }
  function setup() {
    $('startBtn').addEventListener('click', start);
    $('restartBtn').addEventListener('click', start);
    $('exitBtn').addEventListener('click', leave);
    $('brand').addEventListener('click', e => { e.preventDefault(); leave(); });
    $('fullscreenBtn').addEventListener('click', toggleFullscreen);
    $('audioBtn').addEventListener('click', toggleSound);
    $('hintBtn').addEventListener('click', revealHint);
    $('answerForm').addEventListener('submit', e => { e.preventDefault(); answer(); });
    $('terminalForm').addEventListener('submit', e => {
      e.preventDefault();
      runTerminal($('terminalInput').value);
      $('terminalInput').value = '';
    });
    document.querySelectorAll('.difficulty').forEach(button => {
      button.addEventListener('click', () => {
        state.minutes = Number(button.dataset.minutes);
        document.querySelectorAll('.difficulty').forEach(choice => {
          const selected = choice === button;
          choice.classList.toggle('selected', selected);
          choice.setAttribute('aria-pressed', String(selected));
        });
      });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && state.view === 'game') {
        // Timer gerçek zamana bağlıdır; sekme arka plandayken durmaz.
        toast('Oyun sürüyor. Çıkış düğmesi her zaman kullanılabilir.');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.view === 'game' && !document.fullscreenElement) {
        toast('Oyunu bırakmak için sağ üstteki ÇIKIŞ düğmesini kullan.');
      }
    });
    document.addEventListener('fullscreenchange', () => {
      $('fullscreenBtn').setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
    });
    $('timer').textContent = formatTime(state.minutes * 60);
  }
  setup();
  // Manuel test için yalnızca okuma yapan küçük tanılama API'si (üretimde zararsız).
  Object.defineProperty(window, 'SonProtokolDebug', {value: Object.freeze({
    snapshot: () => Object.freeze({view:state.view,step:state.step,secondsLeft:state.secondsLeft,mistakes:state.mistakes,audioEnabled:state.audioEnabled})
  }), writable:false, configurable:false});
})();
