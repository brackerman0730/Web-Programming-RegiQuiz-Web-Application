// Each pattern is a small dot-grid tracing that Regi's eye markings. Coordinates
// are 0-indexed (x = column, y = row); dots default to the theme's color unless
// they specify their own (Regigigas has three differently-colored eye pairs).
const REGI_LOADER_PATTERNS = {
    regirock: {
        color: 'var(--theme-accent)',
        dots: [
            { x: 1, y: 0 }, { x: 3, y: 0 },
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
            { x: 1, y: 2 }, { x: 3, y: 2 }
        ]
    },
    regice: {
        color: 'var(--theme-accent-dark)',
        dots: [
            { x: 2, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 2, y: 2 }
        ]
    },
    registeel: {
        color: 'var(--theme-accent-dark)',
        dots: [
            { x: 1, y: 0 }, { x: 3, y: 0 },
            { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 },
            { x: 1, y: 2 }, { x: 3, y: 2 }
        ]
    },
    regigigas: {
        dots: [
            { x: 0, y: 0, color: '#cc3333' }, { x: 6, y: 0, color: '#cc3333' },
            { x: 1, y: 1, color: '#3366cc' }, { x: 5, y: 1, color: '#3366cc' },
            { x: 2, y: 2, color: '#888888' }, { x: 4, y: 2, color: '#888888' }
        ]
    },
    regieleki: {
        color: 'var(--theme-accent-dark)',
        dots: [
            { x: 1, y: 0 }, { x: 5, y: 0 },
            { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 1, y: 2 }, { x: 5, y: 2 }
        ]
    },
    regidrago: {
        color: 'var(--theme-accent-dark)',
        dots: [
            { x: 0, y: 0 }, { x: 4, y: 0 },
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 }
        ]
    }
};

const REGI_LOADER_DOT_SIZE = 26;

function renderRegiLoader(theme) {
    let pattern = REGI_LOADER_PATTERNS[theme] || REGI_LOADER_PATTERNS.regirock;

    // Crop to the dots' actual bounding box instead of trusting a hand-typed
    // width/height. That way there's never leftover empty grid space on one
    // side pushing the shape off-center - it doesn't matter where you start
    // numbering (x=0 or not), it always hugs the shape exactly.
    let xs = pattern.dots.map(function(d) { return d.x; });
    let ys = pattern.dots.map(function(d) { return d.y; });
    let minX = Math.min.apply(null, xs);
    let minY = Math.min.apply(null, ys);
    let width = Math.max.apply(null, xs) - minX + 1;
    let height = Math.max.apply(null, ys) - minY + 1;

    // All dots share one animation-delay (none) so the whole shape pulses
    // together in unison, instead of a staggered chase that leaves some dots
    // dim at any given moment and makes the pattern read as jumbled.
    let dotsHtml = pattern.dots.map(function(dot) {
        let color = dot.color || pattern.color;
        return `<span class="regi-loader-dot" style="grid-column:${dot.x - minX + 1}; grid-row:${dot.y - minY + 1}; background-color:${color};"></span>`;
    }).join('');

    return `
        <div class="regi-loader-wrap">
          <div class="regi-loader" style="grid-template-columns: repeat(${width}, ${REGI_LOADER_DOT_SIZE}px); grid-template-rows: repeat(${height}, ${REGI_LOADER_DOT_SIZE}px);">
            ${dotsHtml}
          </div>
        </div>
    `;
}

function showRegiLoader(container) {
    container.innerHTML = renderRegiLoader(getSavedTheme());
}
