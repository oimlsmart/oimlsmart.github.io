// ── OIML SMART — global interactions ─────────────────────────────────
// Progressive enhancement: must run AFTER DOMContentLoaded. No external dependencies.

(function () {
  // ── Count-up animation ────────────────────────────────────────────
  // For each [data-target] element, animate from 0 → target when visible.
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0')
    const format = el.dataset.format || 'int' // 'int' | 'comma' | 'decimal'
    const duration = parseInt(el.dataset.duration || '1200', 10)
    const start = performance.now()

    function formatValue(value) {
      if (format === 'comma') return Math.round(value).toLocaleString('en-US')
      if (format === 'decimal') return value.toFixed(1)
      return String(Math.round(value))
    }

    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      el.textContent = formatValue(target * eased)
      if (t < 1) requestAnimationFrame(tick)
      else el.textContent = formatValue(target)
    }
    requestAnimationFrame(tick)
  }

  // ── Reveal on scroll ──────────────────────────────────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -10% 0px' }
  )

  // ── Counter on scroll ─────────────────────────────────────────────
  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateCounter(entry.target)
          counterObserver.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.4 }
  )

  function init() {
    // bp-reveal — fade-up on scroll
    document.querySelectorAll('.bp-reveal').forEach((el) => {
      revealObserver.observe(el)
    })

    // bp-counter (with data-target)
    document.querySelectorAll('.bp-counter[data-target]').forEach((el) => {
      counterObserver.observe(el)
    })

    // bp-magnetic — translate the element toward the cursor on hover
    document.querySelectorAll('.bp-magnetic').forEach((el) => {
      const strength = parseFloat(el.dataset.magneticStrength || '0.25')
      let raf = 0
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--mx', `${x * strength}px`)
          el.style.setProperty('--my', `${y * strength}px`)
        })
      })
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf)
        el.style.setProperty('--mx', '0px')
        el.style.setProperty('--my', '0px')
      })
    })

    // Copy-to-clipboard for [data-copy]
    document.querySelectorAll('[data-copy]').forEach((el) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'bp-uri__copy'
      btn.setAttribute('aria-label', 'Copy to clipboard')
      btn.innerHTML = copyIcon()
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const text = el.getAttribute('data-copy') || el.textContent || ''
        try {
          await navigator.clipboard.writeText(text)
          btn.classList.add('copied')
          btn.innerHTML = checkIcon()
          setTimeout(() => {
            btn.classList.remove('copied')
            btn.innerHTML = copyIcon()
          }, 1800)
        } catch {
          // ignore — clipboard may not be available
        }
      })
      el.appendChild(btn)
    })

    // Keyboard nav for [data-keyboard-list] — arrow keys move focus
    document.querySelectorAll('[data-keyboard-list]').forEach((list) => {
      const items = Array.from(list.querySelectorAll('[data-keyboard-item]'))
      list.addEventListener('keydown', (e) => {
        const current = document.activeElement
        const idx = items.indexOf(current)
        if (idx === -1) return
        if (e.key === 'ArrowDown' && idx < items.length - 1) {
          e.preventDefault()
          items[idx + 1].focus()
        } else if (e.key === 'ArrowUp' && idx > 0) {
          e.preventDefault()
          items[idx - 1].focus()
        }
      })
    })
  }

  function copyIcon() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
  }
  function checkIcon() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
