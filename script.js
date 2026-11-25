/* =========================================
   0. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ========================================= */
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function scrambleEl(el) {
    const finalText = el.textContent.trim();
    const glyphs = 'ЕКАТЕРИНАQA01#/<>_*+=';
    const steps = finalText.split('').map((ch, i) => ({ ch, start: i * 2, end: i * 2 + 10 }));
    let frame = 0;
    const timer = setInterval(() => {
        let out = '';
        let done = 0;
        steps.forEach((s) => {
            if (frame >= s.end) { out += s.ch; done++; }
            else if (frame >= s.start) { out += glyphs[Math.floor(Math.random() * glyphs.length)]; }
            else { out += '\u00A0'; }
        });
        el.textContent = out;
        if (done === steps.length) clearInterval(timer);
        frame++;
    }, 40);
}

function flyWord(span) {
    const rect = span.getBoundingClientRect();
    if (!rect.width) return;
    const fly = document.createElement('div');
    fly.className = 'fly-word';
    fly.textContent = span.textContent;
    fly.style.left = (rect.left + rect.width / 2) + 'px';
    fly.style.top = (rect.top + rect.height / 2) + 'px';
    document.body.appendChild(fly);
    fly.addEventListener('animationend', () => fly.remove());
}

/* =========================================
   1. ЭКРАН ЗАГРУЗКИ
   ========================================= */
(function initPreloader() {
    const pre = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    const percentEl = document.getElementById('preloaderPercent');
    const nameEl = document.querySelector('.name');

    if (!pre || !fill) {
        if (nameEl) scrambleEl(nameEl);
        return;
    }

    document.body.classList.add('loading');

    let p = 0;
    const timer = setInterval(() => {
        p += Math.random() * 16 + 7;
        if (p >= 100) {
            p = 100;
            clearInterval(timer);
            fill.style.width = '100%';
            if (percentEl) percentEl.textContent = '100%';

            setTimeout(() => {
                pre.classList.add('hidden');
                document.body.classList.remove('loading');
                if (nameEl) scrambleEl(nameEl);
                setTimeout(() => pre.remove(), 700);
            }, 300);
        } else {
            fill.style.width = p + '%';
            if (percentEl) percentEl.textContent = Math.floor(p) + '%';
        }
    }, 120);
})();

/* =========================================
   2. КАСТОМНЫЙ КУРСОР: ТОЧКА + ПЛАЗМА
   ========================================= */
const cursorDot = document.querySelector('.cursor-dot');
const cursorPlasma = document.querySelector('.cursor-plasma');

if (cursorDot && cursorPlasma && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let lastPlasmaTime = 0;

    const plasmaColors = [
        'rgba(0, 212, 255, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(255, 255, 255, 0.9)'
    ];

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        cursorPlasma.style.left = mouseX + 'px';
        cursorPlasma.style.top = mouseY + 'px';
        document.body.style.setProperty('--mx', mouseX + 'px');
        document.body.style.setProperty('--my', mouseY + 'px');

        const now = Date.now();
        if (now - lastPlasmaTime > 30) {
            createPlasmaParticle(mouseX, mouseY);
            lastPlasmaTime = now;
        }
    });

    function createPlasmaParticle(x, y) {
        const count = Math.floor(Math.random() * 2) + 2;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'plasma-particle';
            
            const color = plasmaColors[Math.floor(Math.random() * plasmaColors.length)];
            particle.style.background = color;
            particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
            
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;
            particle.style.left = offsetX + 'px';
            particle.style.top = offsetY + 'px';
            
            const size = Math.random() * 8 + 4;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            cursorPlasma.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) particle.parentNode.removeChild(particle);
            }, 600);
        }
    }

    document.querySelectorAll('a, button, input, textarea, .badge, .skill-card, .project-card, .why-card').forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorDot.style.boxShadow = '0 0 20px var(--accent), 0 0 30px var(--accent)';
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorDot.style.boxShadow = '0 0 10px var(--accent), 0 0 20px var(--accent)';
        });
    });
}

/* =========================================
   3. МАГНИТНЫЕ НАДПИСИ
   ========================================= */
if (window.matchMedia('(pointer: fine)').matches) {
    const magnets = document.querySelectorAll('.magnetic');
    const RADIUS = 170;
    const PULL = 0.22;

    window.addEventListener('mousemove', (e) => {
        magnets.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.hypot(dx, dy);

            if (dist < RADIUS) {
                const force = (1 - dist / RADIUS) * PULL;
                el.style.translate = `${dx * force}px ${dy * force}px`;
            } else {
                el.style.translate = '0px 0px';
            }
        });
    });
}

/* =========================================
   4. СТРОКИ КОДА
   ========================================= */
const codeLines = [
    'def validate(payload):',
    '    data = json.loads(payload)',
    '    return clean(data)',
    'try:',
    '    send(form)',
    'except TimeoutError:',
    '    retry(count=3)',
    'SELECT bug, priority',
    'FROM qa_reports',
    "WHERE priority = 'critical';",
    'hash = md5(contact)',
    'if hash not in seen:',
    '    crm.create_lead(hash)',
    'agent = LLM(system=prompt)',
    'response = agent.parse(text)',
    'assert response.schema == OK',
    'for row in df.itertuples():',
    '    total += row.amount',
    'print(f"duplicates: {dupes}")',
    'pyinstaller app.py --onefile',
    '# build: app.exe готов к установке',
    'git commit -m "feat: portfolio"',
    'pytest tests/ -q   # 42 passed',
    'curl -X POST /api/leads',
    '# status: 200 OK'
];

/* =========================================
   5. ФОНОВЫЙ КОД НА ВСЮ СТРАНИЦУ
   ========================================= */
(function buildCodeBackground() {
    const bg = document.querySelector('.code-bg');
    if (!bg) return;

    const columns = 10;
    for (let i = 0; i < columns; i++) {
        const col = document.createElement('div');
        col.className = 'bg-col';

        let html = '';
        for (let r = 0; r < 120; r++) {
            html += '<div>' + escapeHtml(codeLines[(r + i * 7) % codeLines.length]) + '</div>';
        }
        col.innerHTML = '<div class="bg-col-inner">' + html + html + '</div>';

        const inner = col.querySelector('.bg-col-inner');
        inner.style.animationDuration = (55 + i * 7) + 's';
        inner.style.animationDelay = -(i * 9) + 's';

        bg.appendChild(col);
    }
})();

/* =========================================
   6. ЖИВОЙ КОД ПО КРАЯМ + СЛОВА-ВСПЫШКИ
   ========================================= */
const KEYWORDS = ['json', 'md5', 'LLM', 'crm', 'SELECT', 'pytest', 'git', 'curl', 'exe', 'validate', 'agent', 'bug'];

function buildPopHtml(text) {
    let html = escapeHtml(text);
    KEYWORDS.forEach((k) => {
        html = html.split(k).join('<span class="pop-word">' + k + '</span>');
    });
    return html;
}

function startCodeRain(selector, startOffset) {
    const box = document.querySelector(selector);
    if (!box) return;

    let lineIndex = startOffset;
    let charIndex = 0;
    let currentLine = null;

    function newLine() {
        currentLine = document.createElement('div');
        currentLine.className = 'rain-line';
        box.appendChild(currentLine);
        while (box.children.length > 4 && box.scrollHeight > box.clientHeight) {
            box.removeChild(box.firstChild);
        }
        charIndex = 0;
    }

    newLine();

    setInterval(() => {
        const text = codeLines[lineIndex % codeLines.length];
        if (charIndex < text.length) {
            currentLine.textContent += text[charIndex];
            charIndex++;
        } else {
            const finishedLine = currentLine;
            if (KEYWORDS.some((k) => text.includes(k)) && Math.random() < 0.85) {
                finishedLine.innerHTML = buildPopHtml(text);
                finishedLine.querySelectorAll('.pop-word').forEach((span) => flyWord(span));
                setTimeout(() => {
                    finishedLine.querySelectorAll('.pop-word').forEach((span) => span.classList.add('pop-done'));
                }, 900);
            }
            lineIndex++;
            newLine();
        }
    }, 45);
}

if (window.innerWidth > 1280) {
    startCodeRain('.code-rain-left', 0);
    startCodeRain('.code-rain-right', 9);
}

/* =========================================
   7. ПРОКРУТКА: прогресс-бар + столбцы кода
   ========================================= */
const progressBar = document.getElementById('scrollProgress');
let lastScrollY = window.scrollY;
const LINE_HEIGHT = 18;

window.addEventListener('scroll', () => {
    if (progressBar) {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        progressBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }

    const y = window.scrollY;
    const delta = y - lastScrollY;
    lastScrollY = y;
    if (delta > 0) {
        const lines = Math.min(Math.round(delta / LINE_HEIGHT), 6);
        document.querySelectorAll('.code-rain').forEach((box) => {
            for (let i = 0; i < lines; i++) {
                if (box.children.length > 8) box.removeChild(box.firstChild);
            }
        });
    }
}, { passive: true });

/* =========================================
   8. СТРЕЛКА НАВЕРХ
   ========================================= */
const toTop = document.getElementById('toTop');
if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* =========================================
   9. ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ + расшифровка
   ========================================= */
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            if (entry.target.classList.contains('section-title') && !entry.target.dataset.scrambled) {
                entry.target.dataset.scrambled = '1';
                scrambleEl(entry.target);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card, .skill-card, .why-card, .section-title, .about-content, .why-content, .contact-content, .hero-content').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

/* =========================================
   10. ФОРМА → GOOGLE APPS SCRIPT → TELEGRAM
       ИСПРАВЛЕНИЕ: показываем успех сразу,
       так как no-cors не даёт прочитать ответ
   ========================================= */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwaRRQM_3ct7q01_NidhxpT0PMGfiHjuKYvpwPScLSrHtAYNYEdSdaSZEy-h6QTDhjI/exec';
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(contactForm));
        formStatus.textContent = 'Отправляю...';
        formStatus.className = 'form-status';

        try {
            await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(data)
            });
            // При no-cors мы не можем прочитать ответ, но запрос уходит.
            // Показываем успех сразу после отправки.
            formStatus.textContent = '✓ Сообщение отправлено! Отвечу в Telegram.';
            formStatus.classList.add('success');
            contactForm.reset();
        } catch (err) {
            // Реальная ошибка сети (например, нет интернета)
            formStatus.textContent = '✗ Ошибка сети. Напишите напрямую в @katenka74';
            formStatus.classList.add('error');
        }
    });
}