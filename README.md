# ATN bv - website

Website voor ATN bv in De Haan: verwarming, sanitair, ventilatie,
airconditioning en koeltechniek.

## Lokaal starten

Vereist Node.js 24 of nieuwer. De website heeft geen productieafhankelijkheden.

```sh
npm run build
npm start
```

Open http://127.0.0.1:4173. De gegenereerde website staat in `dist/`.

## Inhoud

- `build.mjs`: pagina's en navigatie.
- `comfort-page.mjs`: keuzehulp, interactief huis en comfortstudio.
- `seo.mjs`: lokale diensteninhoud en zoekmachinegegevens.
- `dist/assets/`: vormgeving, browserinteracties en beeldmateriaal.
- `LEESMIJ.txt`: gebruik, contactformulier en verificatiestatus.
- `SEO-OPLEVERING.txt`: resterende stappen voor publieke lancering en Google-opzet.

## Controleren

```sh
npm install --prefix .local linkedom@0.18.13 --no-audit --no-fund
node test-site.mjs
```

De controles gebruiken DOM-emulatie en vervangen geen visuele browsertest.

## Publiceren

Deze repository publiceert de website niet automatisch. De voorvertoning is
standaard `noindex`. Het definitieve domein wordt met ATN gekozen.

Stel bij de publieke bouw `SITE_ORIGIN` in op het definitieve HTTPS-domein en
`SEO_INDEXABLE=true`. Voer daarna `npm run build` uit en publiceer `dist/`.
Volg de overige stappen in `SEO-OPLEVERING.txt`.

Het contactformulier maakt momenteel een e-mailconcept dat de bezoeker zelf
verstuurt. Domeinlancering, rechtstreeks verzenden, eenvoudig beheer en de
Google-koppelingen horen bij de nog af te werken definitieve oplevering.

## Beeldmateriaal

Zie `ASSETS.txt` voor de bronnen. Dienstbeelden zijn sfeerbeelden;
het portret is een bewerking van de aangeleverde foto van de zaakvoerder.
