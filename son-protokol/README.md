# SON PROTOKOL — Güvenli Siber Gerilim Oyunu

Türkçe, sıfır bağımlılıklı, HTML/CSS/JS ile hazırlanmış, **gerçek sistemle etkileşmeyen** korku ve bulmaca oyunu. 3/5/10 dakikalık geri sayım, dört kilit, sanal terminal, isteğe bağlı tam ekran, Web Audio ile uğultu/efekt ve Web Speech ile Türkçe anlatıcı içerir.

## Dosya yapısı

```text
son-protokol-v2/
├── index.html    # Ekranlar ve semantik HTML
├── style.css     # Responsive kırmızı/siyah oyun arayüzü
├── app.js        # Oyun durumları, zamanlayıcı, bulmacalar ve ses
└── README.md     # Bu kılavuz
```

## Çalıştırma

1. ZIP'i açın ve `son-protokol-v2` klasörünü açın.
2. `index.html` dosyasını Chrome, Firefox, Edge veya Safari ile açın. Sunucu veya kurulum gerektirmez.
3. 3, 5 veya 10 dakika seçin ve **Protokolü Başlat** butonuna basın.
4. İpuçlarını sanal dosyalardan okuyun, terminal komutlarını deneyin, sırayla dört kodu girin.
5. Sesler yalnızca bir kullanıcı etkileşiminden sonra başlatılır. Bazı cihazlarda Türkçe TTS sesi bulunmayabilir; oyun yine çalışır.

Alternatif yerel sunucu:

```bash
cd son-protokol-v2
python -m http.server 8080
```

Sonra `http://localhost:8080` adresini açın.

## Render üzerinde yayınlama

1. `index.html`, `style.css`, `app.js` dosyalarını bir GitHub deposunun köküne veya `son-protokol-v2` klasörüne yükleyin.
2. Render > New > **Static Site** seçin ve depoyu bağlayın.
3. **Branch**: ilgili GitHub dalı.
4. **Build command**: `echo 'No build required'`
5. **Publish directory**: dosyalar kökteyse `.`; alt klasördeyse `son-protokol-v2`.
6. Deploy başlatın ve Render'ın verdiği HTTPS adresinde test edin. Veritabanı, sunucu ve secret gerekmez.

## Oyun senaryosu / dört aşama

- **01 — Kayıp Log:** Sanal güvenlik günlüğündeki kapı numaralarını sırala; cevap `731`.
- **02 — Şifreli Mesaj:** Sezar kaydırması ile `DQDKWDU` metnini 3 harf geri çöz; cevap `ANAHTAR`.
- **03 — Kırık Frekans:** `100101` ikilik sayısını onluğa çevir; cevap `37`.
- **04 — Son Anahtar:** Önceki cevapları tireyle birleştir; cevap `731-ANAHTAR-37`.

Her yanlış şifre 12 saniye, her gösterilen ipucu 15 saniye zaman kaybettirir. Süre dolunca **yalnızca arayüzde** sahte mavi ekran/GPU/oyun dosyası kaybı gösterilir. Kazanma ekranı kurtuluşu açıklar.

## Sanal terminalin izinli komutları

```text
help
ls
dir
status
whoami
clear
cat olay.txt
cat sifreleme.txt
cat sinyal.txt
cat protokol.txt
convert 100101
```

Terminal **hiçbir işletim sistemi komutunu çalıştırmaz**. Yalnızca JavaScript'teki sabit belge metinlerine bakar ve bellek içi cevap üretir.

## Güvenlik tasarımı

- **Malware yok:** Dosya sistemi, kamera, mikrofon, ağ, donanım, kayıt defteri, OS API erişimi yoktur.
- **Sanal dosyalar:** `olay.txt` vb. yalnızca `app.js` sabit metinleridir, gerçek disk üzerinde oluşturulmaz.
- **Sahte çöküş:** BSOD/GPU/dosya kaybı ekranı yalnızca CSS ve HTML'dir.
- **Çıkış serbest:** Her an ÇIKIŞ butonuyla ayrılabilir, tarayıcı kapatılabilir. Tam ekran isteğe bağlıdır; Esc ile normal şekilde çıkılır. Alt+F4 ve sağ tık engellenmez.
- **Tarayıcı ses izinleri:** Oyun butonuna basıldıktan sonra Web Audio başlar. TTS cihaz ve tarayıcı desteğine göre değişir.
- **Erişilebilirlik:** Klavye formları, canlı durum bildirimleri ve `prefers-reduced-motion` desteği bulunur.
- **Bağımlılık yok:** Harici CDN, font, JavaScript paketi veya üçüncü taraf kaynak çağrısı yapılmaz. İndirilen ZIP çevrimdışı kullanılabilir.

## Mimari

`index.html` statik arayüz -> `app.js` durum makinesi (`welcome`, `game`, `end`) -> sıralı bulmaca verileri -> doğrulama -> kazanma/kaybetme ekranı. Sayaç, `performance.now()` tabanlı son tarihe göre hesaplanır; arka plan sekmesinde sayım tutarlıdır. Kullanıcı girdileri `textContent` ile gösterilir, HTML olarak yorumlanmaz. Terminalde yalnızca sabit komutlar ayrıştırılır. Seslerin tamamı yerel Web Audio osilatörlerinden ve cihazın Web Speech seslendirmesinden üretilir.

## Yasal / kreatif not

Filmdeki özgün replikler, karakter ses kayıtları veya görseller kullanılmaz. Atmosfer, tamamen özgün Türkçe metin ve efektlerle kuruludur.