<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import uisLogo from './assets/uis-logo.svg'

type Slide = {
  kicker: string
  title: string
  body: string
}

type Video = {
  name: string
  src: string
}

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

const videoModules = import.meta.glob('./assets/videos/*.mp4', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const videos: Video[] = Object.entries(videoModules)
  .sort(([first], [second]) => first.localeCompare(second))
  .map(([path, src]) => ({
    name: path.split('/').pop()?.replace(/\.mp4$/i, '') || 'Campus video',
    src,
  }))

const activeSlide = ref(0)
const activeVideo = ref(0)
const videoError = ref(false)
const now = ref(new Date())
const pageRefreshInterval = 5 * 60 * 1000
let slideTimer: number | undefined
let clockTimer: number | undefined
let refreshTimer: number | undefined

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    slideTimer = window.setInterval(() => {
      activeSlide.value = (activeSlide.value + 1) % slides.length
    }, 8000)
  }
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
  refreshTimer = window.setInterval(() => { window.location.reload() }, pageRefreshInterval)
})

function selectSlide(index: number) {
  window.clearInterval(slideTimer)
  activeSlide.value = index
}

function selectVideo(index: number) {
  activeVideo.value = index
  videoError.value = false
}

function playNextVideo() {
  if (videos.length > 1) {
    selectVideo((activeVideo.value + 1) % videos.length)
  }
}

onBeforeUnmount(() => {
  window.clearInterval(slideTimer)
  window.clearInterval(clockTimer)
  window.clearInterval(refreshTimer)
})

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Oslo'
})
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Oslo'
})
const clock = computed(() => timeFormat.format(now.value))
const date = computed(() => dateFormat.format(now.value))
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
        <p class="eyebrow">Live Soon</p>
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

      <section class="data-panel" aria-label="Video player">
        <div class="panel-heading">
          <span class="preview-chip">{{ videos.length }} {{ videos.length === 1 ? 'video' : 'videos' }}</span>
        </div>

        <div v-if="videos.length" class="media-player">
          <div class="video-frame">
            <video
              :key="videos[activeVideo].src"
              :src="videos[activeVideo].src"
              controls
              autoplay
              muted
              playsinline
              @ended="playNextVideo"
              @error="videoError = true"
            >
              Your browser does not support video playback.
            </video>
            <p v-if="videoError" class="video-error">
              This video could not be played. Check that the MP4 uses a browser-supported codec.
            </p>
          </div>
          <div class="playlist" aria-label="Campus video playlist">
            <button
              v-for="(video, index) in videos"
              :key="video.src"
              type="button"
              :class="{ active: index === activeVideo }"
              :aria-current="index === activeVideo ? 'true' : undefined"
              @click="selectVideo(index)"
            >
              {{ video.name }}
            </button>
          </div>
        </div>
        <div v-else class="media-empty">
          <h3>No campus videos yet</h3>
          <p>Add MP4 files to <code>src/assets/videos/</code> and rebuild the site to make them available here.</p>
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
