# Cursor AI - Project Rules & Context (AGENTS.md)

## @Project Goal
Realizzare un sito web mobile-first per la visita digitale della Cattedrale di San Feliciano di Foligno (cattedralesanfeliciano.it) in lingua italiana. Il sito funge da biglietteria integrata e percorso museale digitale suddiviso in 5 sezioni sequenziali, accessibili unicamente dopo l'acquisto del biglietto.

## @Tech Stack
- **HTML5**: Struttura semantica, approccio multi-pagina.
- **CSS3**: CSS puro (nessun framework). Mobile-first (max-width 480px), layout fluido su desktop.
- **JavaScript (ES6+)**: Vanilla JS per logica di frontend, validazione token, e integrazione API di terze parti.
- **Integrazioni Esterne**: PayPal JavaScript SDK (pagamenti), EmailJS (invio email transazionali).

## @Context & Users
- **Utenti Target**: Turisti e visitatori della Cattedrale, che utilizzeranno il sito prevalentemente da dispositivi mobili (smartphone) durante la visita in loco o per consultazione da remoto.
- **Contesto Operativo**: L'accesso al museo digitale è protetto. Dopo il pagamento, l'utente riceve un'email con un link univoco contenente un token (`?token=SF2024`). Se il token è assente, l'utente deve essere reindirizzato alla Home.

## @Design References
- **Stile Visivo**: Design sobrio e sacrale.
- **Palette Colori**: Sfondo color pergamena (`#F5F0E8`), testo grigio scuro (`#2C2C2C`), accenti/dettagli dorati (`#C9A84C`).
- **Tipografia**: Google Font *Playfair Display* (elegante, con grazie) per i titoli.
- **UI Elements**: Pulsanti con bordo dorato e hover morbido. Card per le opere con bordo dorato, immagine in alto e testo in basso. Menu fisso in alto.
- **Assets**: Le immagini definitive andranno in una cartella locale dedicata (`/assets`). In fase di sviluppo, utilizzare placeholder (`https://via.placeholder.com/400x300`) e "Lorem Ipsum" (3-5 righe per opera).

## @Layout Screens
Nella cartella `/layouts` sono presenti le immagini di riferimento visivo per ogni pagina, generate da Google Stitch. Usale come riferimento fedele per struttura, proporzioni e stile di ogni schermata:

- `layouts/home.png` → riferimento visivo per `index.html`
- `layouts/parte-esterna.png` → riferimento visivo per `sezione1.html`
- `layouts/transetti-laterali.png` → riferimento visivo per `sezione2.html`
- `layouts/navata-centrale.png` → riferimento visivo per `sezione3.html`
- `layouts/abside.png` → riferimento visivo per `sezione4.html`
- `layouts/cripta.png` → riferimento visivo per `sezione5.html`

## @Architecture Rules
- **Pattern Architetturale**: Multi-pagina (MPA) tradizionale con risorse condivise.
- **Struttura File**:
  - `index.html`: Home page, intro, orari, contatti e checkout PayPal.
  - `sezione1.html` a `sezione5.html`: Le 5 aree del museo (Parte esterna, Transetti, Navata Centrale, Abside, Cripta). Include pulsanti "Vai alla sala successiva".
  - `conferma.html`: Pagina post-pagamento con istruzioni e link di accesso.
  - `style.css`: Foglio di stile globale.
  - `app.js`: Logica centralizzata (controllo token, logica PayPal, logica EmailJS).
- **Navigazione**: Il menu top-bar fisso deve essere replicato in tutte le pagine HTML.

## @Coding Standards
- **Protezione Pagine**: All'avvio di ogni pagina da `sezione1.html` a `sezione5.html`, esegui un controllo JavaScript che verifichi l'esistenza di `?token=SF2024` nell'URL prima di renderizzare o mostrare i contenuti. In caso negativo, usa `window.location.href` per forzare il redirect a `index.html`.
- **PayPal SDK**: Implementare usando le API standard con client-id segnaposto `[INSERIRE_PAYPAL_CLIENT_ID]`. Prezzo biglietto: `[INSERIRE PREZZO]`.
- **EmailJS**: Implementare l'invio post-pagamento con costanti segnaposto `[INSERIRE_EMAILJS_ID]` per `service_id`, `template_id` e `user_id`. Il template deve inviare il link esatto `cattedralesanfeliciano.it/museo?token=SF2024`.
- **Separazione delle Competenze**: Mantieni il markup in HTML, lo stile rigorosamente in `style.css` e la logica unicamente in `app.js`. Evita inline-styles o script inline dove possibile.