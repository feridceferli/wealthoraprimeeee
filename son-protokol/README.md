# SON PROTOKOL — Tarayıcı Gerilim Oyunu

**Konsept:** Bir bilgisayarın ele geçirildiği izlenimi veren, ancak gerçek sistemle etkileşmeyen korku-bulmaca oyunu. Kurgusal dosyalardaki dört ipucunu çözerek zaman dolmadan dört haneli şifreyi gir.

## Oynama

1. `index.html` dosyasını Chrome, Edge, Firefox veya Safari'de aç.
2. Zorluk seç ve **Oyunu Başlat** düğmesine bas.
3. Soldaki dört kurgusal dosyayı açıp bilmeceleri çöz.
4. Dört rakamı dosya sırasına göre sağdaki terminale gir.

**Kontroller:** Fare/dokunmatik, klavye veya ekrandaki rakamlar. `ESC` ile menüye dön. Ses aç/kapat mevcut. Sesli anlatım tarayıcının Türkçe ses desteğine bağlıdır.

## Güvenlik ve gizlilik

- Tamamen istemci tarafında çalışır; sunucu, hesap, API veya ağ isteği yoktur.
- Yerel dosyalara erişmez, okumaz, yazmaz ve hiçbir şeyi silmez.
- Donanımı zorlamaz veya ekran kartını yönetmez.
- Gerçek zararlı yazılım, otomatik başlangıç, kalıcılık veya sistem engelleme içermez.
- "Dosya kaybı" ve "sistem bütünlüğü" yalnızca oyundaki görsel simülasyondur.

## Değiştirme

`index.html` içindeki `CASES` dizisinde 3 ayrı bilmece seti, süre seçimi ve anlatım metinleri vardır. Yeni bölümler eklenebilir.