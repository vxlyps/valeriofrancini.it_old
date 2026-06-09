/* --- INTRO VIDEO — valeriofrancini.it ---
   Sequenza: fake loader → video → fade out al sito
   SessionStorage: una sola volta per sessione.
*/
(function () {
    if (sessionStorage.getItem('vf_intro_shown')) return;

    var VIDEO_SRC   = '/images/vid/intro_valeriofrancini.mp4';
    var VIDEO_SPEED = 1.4;   /* velocità riproduzione — aumenta per accorciare */
    var FADE_MS     = 900;
    var FALLBACK_MS = 6000;
    var FADE_BEFORE = 0.9;

    function build() {

        /* carica Inter weight 200 per il loader */
        var fontLink = document.createElement('link');
        fontLink.rel  = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@200&display=swap';
        document.head.appendChild(fontLink);

        /* ── Overlay ── */
        var overlay = document.createElement('div');
        overlay.id = 'vf-intro-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:999999',
            'background:#000', 'opacity:1',
            'transition:opacity ' + FADE_MS + 'ms ease'
        ].join(';');

        /* ── Video ── */
        var video = document.createElement('video');
        video.muted       = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.preload     = 'auto';
        video.style.cssText = [
            'position:absolute', 'inset:0',
            'width:100%', 'height:100%',
            'object-fit:cover', 'pointer-events:none',
            'opacity:0', 'transition:opacity 0.5s ease'
        ].join(';');
        var src = document.createElement('source');
        src.src  = VIDEO_SRC;
        src.type = 'video/mp4';
        video.appendChild(src);

        /* ── Loader ── */
        var loader = document.createElement('div');
        loader.style.cssText = [
            'position:absolute', 'inset:0',
            'display:flex', 'flex-direction:column',
            'align-items:center', 'justify-content:center',
            'z-index:2', 'pointer-events:none',
            'transition:opacity 0.45s ease'
        ].join(';');

        var inner = document.createElement('div');
        inner.style.cssText = 'display:flex;flex-direction:column;align-items:center;user-select:none;';

        /* nome sito — tiny, spaced */
        var title = document.createElement('div');
        title.textContent = 'valeriofrancini.it';
        title.style.cssText = [
            'color:rgba(255,255,255,0.35)',
            "font-family:'Inter',-apple-system,sans-serif",
            'font-size:0.55rem',
            'font-weight:300',
            'letter-spacing:0.5em',
            'text-transform:uppercase',
            'margin-bottom:40px'
        ].join(';');

        /* barra progress — 1px */
        var barWrap = document.createElement('div');
        barWrap.style.cssText = [
            'width:min(200px,52vw)',
            'height:1px',
            'background:rgba(255,255,255,0.1)',
            'position:relative',
            'overflow:hidden',
            'margin-bottom:30px'
        ].join(';');
        var barFill = document.createElement('div');
        barFill.style.cssText = [
            'position:absolute', 'top:0', 'left:0',
            'height:100%', 'width:0%',
            'background:rgba(255,255,255,0.55)'
        ].join(';');
        barWrap.appendChild(barFill);

        /* numero percentuale — hero */
        var pctEl = document.createElement('div');
        pctEl.id = 'vf-intro-pct';
        pctEl.textContent = '0%';
        pctEl.style.cssText = [
            'color:#fff',
            "font-family:'Inter',-apple-system,sans-serif",
            'font-size:clamp(5rem,14vw,11rem)',
            'font-weight:200',
            'line-height:1',
            'letter-spacing:-0.03em'
        ].join(';');

        inner.appendChild(title);
        inner.appendChild(barWrap);
        inner.appendChild(pctEl);
        loader.appendChild(inner);

        /* ── Skip — testo puro, nessun bordo ── */
        var skip = document.createElement('button');
        skip.textContent = 'skip';
        skip.style.cssText = [
            'position:absolute', 'bottom:32px', 'right:32px',
            'background:none', 'border:none',
            'color:rgba(255,255,255,0.22)',
            "font-family:'Inter',-apple-system,sans-serif",
            'font-size:0.58rem', 'font-weight:300',
            'letter-spacing:0.38em', 'text-transform:uppercase',
            'padding:8px 0', 'cursor:pointer', 'z-index:3',
            'opacity:0', 'transition:opacity 0.4s,color 0.25s'
        ].join(';');
        skip.addEventListener('mouseover', function () { skip.style.color = 'rgba(255,255,255,0.7)'; });
        skip.addEventListener('mouseout',  function () { skip.style.color = 'rgba(255,255,255,0.22)'; });

        /* ── Dismiss ── */
        var done = false;
        function dismiss() {
            if (done) return;
            done = true;
            clearTimeout(fallback);
            sessionStorage.setItem('vf_intro_shown', '1');
            document.body.style.overflow = '';
            overlay.style.opacity = '0';
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, FADE_MS + 60);
        }

        video.addEventListener('timeupdate', function () {
            if (video.duration && video.currentTime >= video.duration - FADE_BEFORE) dismiss();
        });
        video.addEventListener('ended', dismiss);
        video.addEventListener('error', dismiss);
        skip.addEventListener('click', dismiss);

        var fallback = setTimeout(dismiss, FALLBACK_MS);

        /* ── Fake counter ── */
        function runLoader() {
            var count = 0;
            var interval = setInterval(function () {
                count = Math.min(100, count + Math.floor(Math.random() * 4) + 1);
                pctEl.textContent = count + '%';
                barFill.style.width = count + '%';

                if (count >= 100) {
                    clearInterval(interval);
                    setTimeout(function () {
                        loader.style.opacity = '0';
                        video.style.opacity  = '1';
                        skip.style.opacity   = '1';
                        var p = video.play();
                        if (p && p.catch) p.catch(dismiss);
                        video.playbackRate = VIDEO_SPEED;
                        clearTimeout(fallback);
                        fallback = setTimeout(dismiss, FALLBACK_MS);
                    }, 350);
                }
            }, 28);
        }

        /* ── Mount ── */
        overlay.appendChild(video);
        overlay.appendChild(loader);
        overlay.appendChild(skip);
        document.body.style.overflow = 'hidden';
        document.body.appendChild(overlay);
        video.load();
        runLoader();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
