<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import uisLogo from './assets/uis-logo.svg'

type Metric = {
  label: string
  value: string
  unit: string
  note: string
}

type Slide = {
  kicker: string
  title: string
  body: string
}

const metrics: Metric[] = [
  { label: 'CO₂', value: '—', unit: 'ppm', note: 'Awaiting sensor' },
  { label: 'Temperature', value: '—', unit: '°C', note: 'Awaiting sensor' },
  { label: 'Humidity', value: '—', unit: '%', note: 'Awaiting sensor' },
  { label: 'Electrical load', value: '—', unit: 'A', note: 'Awaiting CT305' },
]

const slides: Slide[] = [
  {
    kicker: 'Observe',
    title: 'Understand campus conditions.',
    body: 'Track indoor CO₂, temperature, humidity and electrical-load patterns across monitored UiS spaces.'
  },
  {
    kicker: 'Discover',
    title: 'Find patterns worth investigating.',
    body: 'Turn time-series data into recurring episodes, historical baselines, anomalies and evidence-backed insights.'
  },
  {
    kicker: 'Improve',
    title: 'Measure whether changes work.',
    body: 'Compare before and after interventions to support better indoor conditions and more efficient campus operations.'
  }
]

const demo = [
  { t: '09:00', v: 590 }, { t: '10:00', v: 640 }, { t: '11:00', v: 710 },
  { t: '12:00', v: 790 }, { t: '13:00', v: 920 }, { t: '14:00', v: 1120 },
  { t: '15:00', v: 1280 }, { t: '16:00', v: 1080 }, { t: '17:00', v: 760 }
]

const activeSlide = ref(0)
const now = ref(new Date())
let slideTimer: number | undefined
let clockTimer: number | undefined

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    slideTimer = window.setInterval(() => {
      activeSlide.value = (activeSlide.value + 1) % slides.length
    }, 8000)
  }
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
})

function selectSlide(index: number) {
  window.clearInterval(slideTimer)
  activeSlide.value = index
}

onBeforeUnmount(() => {
  window.clearInterval(slideTimer)
  window.clearInterval(clockTimer)
})

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Oslo'
})
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Oslo'
})
const clock = computed(() => timeFormat.format(now.value))
const date = computed(() => dateFormat.format(now.value))

const plot = { left: 52, right: 556, top: 12, bottom: 174, min: 500, max: 1400 }
const yPosition = (value: number) => plot.bottom - (value - plot.min) /
  (plot.max - plot.min) * (plot.bottom - plot.top)
const readings = demo.map((reading, index) => ({
  ...reading,
  x: plot.left + index / (demo.length - 1) * (plot.right - plot.left),
  y: yPosition(reading.v),
}))
const chartPoints = readings.map(({ x, y }) => `${x},${y}`).join(' ')
const chartAreaPoints = `${plot.left},${plot.bottom} ${chartPoints} ${plot.right},${plot.bottom}`
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="page-width topbar-inner">
        <a class="university-link" href="https://www.uis.no/en">
          <img :src="uisLogo" width="176" height="66" alt="University of Stavanger" />
        </a>
        <div class="clock-wrap" aria-label="Stavanger local time">
          <time :datetime="now.toISOString()">{{ clock }}</time>
          <span>{{ date }}</span>
        </div>
      </div>
    </header>

    <main class="hero page-width">
      <section class="hero-copy" aria-labelledby="hero-title">
        <p class="eyebrow">Sensor network · Coming soon</p>
        <h1 id="hero-title">Making campus data useful</h1>
        <p>
          This student-built living laboratory helps us understand indoor conditions,
          electrical-load patterns and the impact of campus improvements.
        </p>

        <div class="rotator">
          <div class="slide-controls" role="group" aria-label="Project goals">
            <button
              v-for="(slide, index) in slides"
              :key="slide.kicker"
              type="button"
              :aria-pressed="index === activeSlide"
              @click="selectSlide(index)"
            >{{ slide.kicker }}</button>
          </div>
          <div class="slide-copy" aria-live="polite">
            <h2>{{ slides[activeSlide].title }}</h2>
            <p>{{ slides[activeSlide].body }}</p>
          </div>
        </div>
      </section>

      <section class="data-panel" aria-labelledby="monitoring-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Campus monitoring</p>
            <h2 id="monitoring-title">Awaiting deployment</h2>
          </div>
          <span class="preview-chip">Preview mode</span>
        </div>

        <div class="metric-grid">
          <article v-for="metric in metrics" :key="metric.label" class="metric-card">
            <h3>{{ metric.label }}</h3>
            <p class="metric-value">{{ metric.value }} <small>{{ metric.unit }}</small></p>
            <p class="metric-note">{{ metric.note }}</p>
          </article>
        </div>

        <div class="chart-card">
          <div class="chart-head">
            <h3>Example CO₂ trend</h3>
            <div class="demo-badge">Demo data · Not live</div>
          </div>

          <div class="chart-wrap">
            <span class="chart-unit" aria-hidden="true">ppm</span>
            <svg viewBox="0 0 580 208" role="img" aria-labelledby="chart-title chart-description">
              <title id="chart-title">Illustrative CO₂ trend in parts per million</title>
              <desc id="chart-description">{{ demo.map(({ t, v }) => `${t} ${v} ppm`).join(', ') }}.</desc>
              <polygon :points="chartAreaPoints" class="chart-area" />
              <g v-for="tick in [1400, 1100, 800, 500]" :key="tick" class="axis">
                <line :x1="plot.left" :x2="plot.right" :y1="yPosition(tick)" :y2="yPosition(tick)" />
                <text x="0" :y="yPosition(tick)" dominant-baseline="middle">{{ tick }}</text>
              </g>
              <polyline :points="chartPoints" class="chart-line" />
              <g v-for="(reading, index) in readings" :key="reading.t">
                <circle :cx="reading.x" :cy="reading.y" r="3.5" class="chart-point" />
                <text :x="reading.x" y="199" text-anchor="middle" :class="{ 'alternate-tick': index % 2 }">{{ reading.t }}</text>
              </g>
            </svg>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="page-width footer-inner">
        <div class="footer-copy">
          <strong>Built by students at the University of Stavanger</strong>
          <span>IoT · time-series analytics · sustainability · campus living lab</span>
        </div>
      </div>
    </footer>
  </div>
</template>
