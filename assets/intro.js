/* --- INTRO VIDEO — valeriofrancini.it ---
   Mostra il video una sola volta per sessione (sessionStorage).
   Salta l'intro se già mostrato, se il video non parte in 5s, o su errore.
*/
(function () {
    if (sessionStorage.getItem('vf_intro_shown')) return;

    var VIDEO_SRC   = '/images/vid/intro_valeriofrancini.mp4';
    var FADE_MS     = 700;
    var FALLBACK_MS = 5000;

    function build() {
        /* Overlay */
        var overlay = document.createElement('div');
        overlay.id = 'vf-intro-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:999999',
            'background:#000', 'opacity:1',
            'transition:opacity ' + FADE_MS + 'ms ease'
        ].join(';');

        /* Video */
        var video = document.createElement('video');
        video.src       = VIDEO_SRC;
        video.autoplay  = true;
        video.muted     = true;
        video.playsInline = true;
        video.setAttribute('playsinline', ''); /* iOS */
        video.style.cssText = [
            'position:absolute', 'inset:0',
            'width:100%', 'height:100%',
            'object-fit:cover', 'pointer-events:none'
        ].join(';');

        /* Skip button */
        var skip = document.createElement('button');
        skip.textContent = 'SKIP ↗';
        skip.style.cssText = [
            'position:absolute', 'bottom:28px', 'right:28px',
            'background:none', 'border:1px solid rgba(255,255,255,0.4)',
            'color:rgba(255,255,255,0.55)',
            "font-family:'Roboto Mono',monospace",
            'font-size:0.72em', 'letter-spacing:1.5px',
            'padding:7px 14px', 'cursor:pointer', 'z-index:2',
            'transition:color 0.2s,border-color 0.2s'
        ].join(';');
        skip.addEventListener('mouseover', function () {
            skip.style.color = '#fff';
            skip.style.borderColor = '#fff';
        });
        skip.addEventListener('mouseout', function () {
            skip.style.color = 'rgba(255,255,255,0.55)';
            skip.style.borderColor = 'rgba(255,255,255,0.4)';
        });

        /* Dismiss logic */
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
            }, FADE_MS + 50);
        }

        /* Fallback: se il video non parte entro FALLBACK_MS */
        var fallback = setTimeout(dismiss, FALLBACK_MS);

        video.addEventListener('playing', function () { clearTimeout(fallback); });
        video.addEventListener('ended',   dismiss);
        video.addEventListener('error',   dismiss);
        skip.addEventListener('click',    dismiss);

        overlay.appendChild(video);
        overlay.appendChild(skip);
        document.body.style.overflow = 'hidden';
        document.body.appendChild(overlay);

        /* Forza il play (alcuni browser richiedono .play() esplicito) */
        var p = video.play();
        if (p && p.catch) p.catch(dismiss);
    }

    /* Esegui appena il DOM è pronto */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
