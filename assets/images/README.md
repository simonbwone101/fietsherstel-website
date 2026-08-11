# Afbeeldingen voor de website

Plaats hier de foto's die op de website gebruikt worden: `assets/images/`.

Aanbevelingen:
- Formaten: JPG/JPEG, PNG of WebP (WebP geeft vaak kleinere bestanden).
- Afmetingen: max breedte ~1920px voor hero-afbeeldingen; maak ook kleinere versies voor mobiel als je responsive afbeeldingen gebruikt.
- Bestandsnaam: gebruik kleine letters en koppeltekens, geen spaties of speciale tekens (bijv. `fiets-reparatie-voor.jpg`).
- Compressie: optimaliseer afbeeldingen (bv. met Squoosh, ImageOptim of andere tools) voor snellere laadtijden.

Hoe te gebruiken in HTML:

```html
<!-- Eenvoudig img-element -->
<img src="/assets/images/voorbeeld.jpg" alt="Beschrijving van de foto">

<!-- Responsive via srcset -->
<img src="/assets/images/voorbeeld-800.jpg" srcset="/assets/images/voorbeeld-400.jpg 400w, /assets/images/voorbeeld-800.jpg 800w, /assets/images/voorbeeld-1200.jpg 1200w" sizes="(max-width: 600px) 400px, 800px" alt="Beschrijving">

<!-- Picture-element voor WebP fallback -->
<picture>
  <source type="image/webp" srcset="/assets/images/voorbeeld.webp">
  <img src="/assets/images/voorbeeld.jpg" alt="Beschrijving">
</picture>
```

Hoe te gebruiken in CSS:

```css
.header { background-image: url('/assets/images/hero.jpg'); }
```

Tip: voeg thumbnails of kleinere kopieën toe voor gebruik in lijsten of gallerijen om bandbreedte te besparen.

Als je wilt, kan ik ook een eenvoudige uploadpagina of een script toevoegen waarmee je foto's vanaf je computer direct naar deze map kunt toevoegen.
