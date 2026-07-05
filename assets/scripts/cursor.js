(function () {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return; // disable on touch devices

    document.documentElement.classList.add('use-custom-cursor');
    document.body.classList.add('use-custom-cursor');

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    // particles container
    const particleContainer = document.createElement('div');
    particleContainer.style.position = 'fixed';
    particleContainer.style.left = '0';
    particleContainer.style.top = '0';
    particleContainer.style.width = '0';
    particleContainer.style.height = '0';
    particleContainer.style.pointerEvents = 'none';
    document.body.appendChild(particleContainer);

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

    // immediate movement using left/top to preserve CSS translate(-50%,-50%) centering
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
        ring.style.left = `${mouseX}px`;
        ring.style.top = `${mouseY}px`;
        spawnParticle(mouseX, mouseY);
    });

    // hover feedback for interactive elements
    const interactive = 'a, button, input, textarea, select, .card, .go-link';
    function addHoverHandlers(el) {
        el.addEventListener('mouseenter', () => {
            ring.style.width = '52px';
            ring.style.height = '52px';
            ring.style.borderColor = 'rgba(157,78,221,0.12)';
            dot.style.transform = 'translate(-50%, -50%) scale(0.9)';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width = '';
            ring.style.height = '';
            ring.style.borderColor = '';
            dot.style.transform = '';
        });
    }

    document.querySelectorAll(interactive).forEach(addHoverHandlers);

    // click pulse
    window.addEventListener('mousedown', () => {
        dot.animate([
            { transform: 'translate(-50%, -50%) scale(1)' },
            { transform: 'translate(-50%, -50%) scale(0.6)' },
            { transform: 'translate(-50%, -50%) scale(1)' }
        ], { duration: 220, easing: 'ease-out' });
    });

    // particles / symbol drops
    const symbols = ['★', '✦', '✶', '✺', '✹', '•', '✳'];
    const maxParticles = 28;
    let particles = [];
    let lastSpawn = 0;
    const spawnInterval = 60; // ms

    function spawnParticle(x, y) {
        const now = performance.now();
        if (now - lastSpawn < spawnInterval) return;
        lastSpawn = now;
        if (particles.length >= maxParticles) return;

        const el = document.createElement('div');
        el.className = 'cursor-particle';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = 'translate(-50%, -50%)';
        el.style.opacity = '1';
        particleContainer.appendChild(el);
        particles.push(el);

        // random horizontal drift
        const drift = (Math.random() - 0.5) * 40;
        const rotate = (Math.random() - 0.5) * 30;
        el.style.transition = 'transform 900ms cubic-bezier(.2,.7,.3,1), opacity 900ms linear';
        requestAnimationFrame(() => {
            el.style.transform = `translate(${drift}px, 88px) rotate(${rotate}deg) scale(0.7)`;
            el.style.opacity = '0';
        });

        // cleanup
        setTimeout(() => {
            try { particleContainer.removeChild(el); } catch (e) { }
            particles = particles.filter(p => p !== el);
        }, 1000);
    }

})();
