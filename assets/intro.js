/* --- INTRO VIDEO — valeriofrancini.it ---
   Sequenza: fake loader → video → fade out al sito
   SessionStorage: una sola volta per sessione.
*/
(function () {
    if (sessionStorage.getItem('vf_intro_shown')) return;

    var VIDEO_SRC   = '/images/vid/intro_valeriofrancini.mov';
    var FADE_MS     = 900;   /* dissolvenza overlay → sito */
    var FALLBACK_MS = 6000;  /* skip se il video non parte entro 6s */
    var FADE_BEFORE = 0.9;   /* inizia la dissolvenza X secondi prima della fine */

    function build() {

        /* ── Overlay ── */
        var overlay = document.createElement('div');
        overlay.id = 'vf-intro-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:999999',
            'background:#000', 'opacity:1',
            'transition:opacity ' + FADE_MS + 'ms ease'
        ].join(';');

        /* ── Video (nascosto durante il loader, poi fades in) ── */
        var video = document.createElement('video');
        video.muted      = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.preload    = 'auto';
        video.style.cssText = [
            'position:absolute', 'inset:0',
            'width:100%', 'height:100%',
            'object-fit:cover', 'pointer-events:none',
            'opacity:0', 'transition:opacity 0.5s ease'
        ].join(';');

        var src = document.createElement('source');
        src.src  = VIDEO_SRC;
        src.type = 'video/quicktime';
        video.appendChild(src);

        /* ── Fake loader ── */
        var loader = document.createElement('div');
        loader.style.cssText = [
            'position:absolute', 'inset:0',
            'display:flex', 'flex-direction:column',
            'align-items:center', 'justify-content:center',
            'z-index:2', 'pointer-events:none',
            'transition:opacity 0.45s ease'
        ].join(';');
        loader.innerHTML =
            '<div style="color:#fff;text-align:center;user-select:none;">' +
            '<div style="font-family:\'Inter\',-apple-system,sans-serif;' +
            'font-size:0.95em;letter-spacing:4px;text-transform:uppercase;' +
            'margin-bottom:18px;opacity:0.85;">valeriofrancini.it</div>' +
            '<div id="vf-intro-pct" style="font-family:\'Roboto Mono\',monospace;' +
            'font-size:0.72em;letter-spacing:5px;opacity:0.45;">0%</div>' +
            '</div>';

        /* ── Skip button (appare solo quando il video è in play) ── */
        var skip = document.createElement('button');
        skip.textContent = 'SKIP ↗';
        skip.style.cssText = [
            'position:absolute', 'bottom:28px', 'right:28px',
            'background:none', 'border:1px solid rgba(255,255,255,0.35)',
            'color:rgba(255,255,255,0.5)',
            "font-family:'Roboto Mono',monospace",
            'font-size:0.7em', 'letter-spacing:2px',
            'padding:7px 14px', 'cursor:pointer', 'z-index:3',
            'opacity:0', 'transition:opacity 0.4s,color 0.2s,border-color 0.2s'
        ].join(';');
        skip.addEventListener('mouseover', function () {
            skip.style.color = '#fff';
            skip.style.borderColor = 'rgba(255,255,255,0.8)';
        });
        skip.addEventListener('mouseout', function () {
            skip.style.color = 'rgba(255,255,255,0.5)';
            skip.style.borderColor = 'rgba(255,255,255,0.35)';
        });

        /* ── Dismiss: fade overlay → sito ── */
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

        /* ── Near-end: inizia il fade FADE_BEFORE secondi prima della fine ── */
        video.addEventListener('timeupdate', function () {
            if (video.duration && video.currentTime >= video.duration - FADE_BEFORE) {
                dismiss();
            }
        });
        video.addEventListener('ended', dismiss);
        video.addEventListener('error', dismiss);
        skip.addEventListener('click', dismiss);

        var fallback = setTimeout(dismiss, FALLBACK_MS);

        /* ── Fake loader counter ── */
        function runLoader() {
            var pctEl = document.getElementById('vf-intro-pct');
            var count = 0;
            var interval = setInterval(function () {
                count = Math.min(100, count + Math.floor(Math.random() * 4) + 1);
                if (pctEl) pctEl.textContent = count + '%';

                if (count >= 100) {
                    clearInterval(interval);
                    /* Pausa breve al 100%, poi nascondi loader e avvia video */
                    setTimeout(function () {
                        loader.style.opacity = '0';
                        video.style.opacity  = '1';
                        skip.style.opacity   = '1';
                        var p = video.play();
                        if (p && p.catch) p.catch(dismiss);
                        /* Resetta fallback timer: parte solo da quando il video inizia */
                        clearTimeout(fallback);
                        fallback = setTimeout(dismiss, FALLBACK_MS);
                    }, 350);
                }
            }, 28);
        }

        /* ── Monta nel DOM ── */
        overlay.appendChild(video);
        overlay.appendChild(loader);
        overlay.appendChild(skip);
        document.body.style.overflow = 'hidden';
        document.body.appendChild(overlay);

        video.load(); /* inizia buffering subito */
        runLoader();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
