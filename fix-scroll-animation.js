// Fix pentru animația de scroll - cercul care se mișcă pe path
(function() {
    console.log('%c🔧 Loading scroll animation fix...', 'color: #B07AF2; font-weight: bold;');
    
    let checkCount = 0;
    const maxChecks = 50;
    
    // Așteaptă ca GSAP, ScrollTrigger și site-ul să fie complet încărcate
    function waitForInit() {
        checkCount++;
        
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            console.log('%c✅ GSAP loaded', 'color: green');
            
            // Așteaptă ca animațiile site-ului să fie inițializate
            setTimeout(() => {
                fixScrollAnimation();
            }, 2000);
        } else if (checkCount < maxChecks) {
            console.log(`⏳ Waiting for GSAP... (${checkCount}/${maxChecks})`);
            setTimeout(waitForInit, 200);
        } else {
            console.error('❌ GSAP failed to load after multiple attempts');
        }
    }
    
    function fixScrollAnimation() {
        console.log('%c🎯 Attempting to fix scroll animations...', 'color: #B07AF2');
        
        // Refresh toate ScrollTrigger-ele
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh(true);
            console.log('✓ ScrollTrigger refreshed');
        }
        
        // Găsește toate cercurile animate
        const circles = document.querySelectorAll('[data-story-circle]');
        console.log(`Found ${circles.length} animated circles:`, circles);
        
        circles.forEach((circle, index) => {
            const circleName = circle.getAttribute('data-story-circle');
            console.log(`  ${index + 1}. Circle: "${circleName}"`, circle);
            
            // Verifică dacă cercul are animații GSAP
            const gsapData = gsap.getProperty(circle, 'gsap');
            if (gsapData) {
                console.log(`    ✓ Circle "${circleName}" has GSAP data`);
            } else {
                console.log(`    ⚠ Circle "${circleName}" missing GSAP data`);
            }
        });
        
        // Verifică path-urile SVG
        const paths = {
            mobile: document.querySelector('[data-mobile-svg] path') || document.querySelector('[data-mobile-path]'),
            desktop: document.querySelector('[data-path-continue]'),
            forBall: document.querySelector('[data-path-for-ball]'),
            forBallMobile: document.querySelector('[data-path-for-ball-mobile]')
        };
        
        console.log('SVG Paths found:', {
            mobile: !!paths.mobile,
            desktop: !!paths.desktop,
            forBall: !!paths.forBall,
            forBallMobile: !!paths.forBallMobile
        });
        
        // Verifică toate ScrollTrigger-ele active
        const triggers = ScrollTrigger.getAll();
        console.log(`Found ${triggers.length} ScrollTrigger instances`);
        
        triggers.forEach((trigger, index) => {
            if (trigger.vars.trigger) {
                const triggerEl = typeof trigger.vars.trigger === 'string' 
                    ? document.querySelector(trigger.vars.trigger) 
                    : trigger.vars.trigger;
                console.log(`  Trigger ${index + 1}:`, {
                    element: triggerEl?.tagName || 'unknown',
                    start: trigger.vars.start,
                    end: trigger.vars.end,
                    scrub: trigger.vars.scrub
                });
            }
        });
        
        // Forțează o nouă refresh după un scurt delay
        setTimeout(() => {
            ScrollTrigger.refresh(true);
            console.log('%c🔄 Final ScrollTrigger refresh complete', 'color: green; font-weight: bold;');
            
            // Log starea finală
            console.log('%c📊 Final Status:', 'color: #B07AF2; font-weight: bold;');
            console.log(`  - Circles: ${circles.length}`);
            console.log(`  - ScrollTriggers: ${ScrollTrigger.getAll().length}`);
            console.log(`  - Window size: ${window.innerWidth}x${window.innerHeight}`);
        }, 500);
    }
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh(true);
                console.log('🔄 ScrollTrigger refreshed on resize');
            }
        }, 250);
    });
    
    // Pornește verificarea când DOM-ul este gata
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForInit);
    } else {
        waitForInit();
    }
    
    // Debug helper - poți să apeși pe cercuri pentru a vedea starea lor
    setTimeout(() => {
        document.querySelectorAll('[data-story-circle]').forEach(circle => {
            circle.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('%c🔍 Circle Debug:', 'color: orange; font-weight: bold;');
                console.log('  Element:', this);
                console.log('  Name:', this.getAttribute('data-story-circle'));
                console.log('  Computed style:', window.getComputedStyle(this));
                console.log('  GSAP properties:', gsap.getProperty(this));
            });
        });
    }, 3000);
})();
