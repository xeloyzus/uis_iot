<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import uisLogo from './assets/uis-logo.svg'

type Slide = {
  kicker: string
  title: string
  body: string
}

type Video = {
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
  .map(([, src]) => ({
    src,
  }))

const activeSlide = ref(0)
const activeVideo = ref(0)
const videoError = ref(false)
const now = ref(new Date())
const updateCheckInterval = 5 * 60 * 1000
const currentBuildAsset = document
  .querySelector<HTMLScriptElement>('script[type="module"][src]')
  ?.getAttribute('src')
let slideTimer: number | undefined
let clockTimer: number | undefined
let refreshTimer: number | undefined

async function checkForUpdate() {
  const response = await fetch(`./index.html?check=${Date.now()}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Update check failed with status ${response.status}`)
  }

  const latestHtml = await response.text()
  const latestDocument = new DOMParser().parseFromString(latestHtml, 'text/html')
  const latestBuildAsset = latestDocument
    .querySelector<HTMLScriptElement>('script[type="module"][src]')
    ?.getAttribute('src')

  if (currentBuildAsset && latestBuildAsset && currentBuildAsset !== latestBuildAsset) {
    window.location.reload()
  }
}

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    slideTimer = window.setInterval(() => {
      activeSlide.value = (activeSlide.value + 1) % slides.length
    }, 8000)
  }
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
  refreshTimer = window.setInterval(() => {
    void checkForUpdate().catch((error: unknown) => {
      console.warn('Could not check for a newer deployment.', error)
    })
  }, updateCheckInterval)
})

function selectSlide(index: number) {
  window.clearInterval(slideTimer)
  activeSlide.value = index
}

function playNextVideo() {
  if (videos.length > 1) {
    activeVideo.value = (activeVideo.value + 1) % videos.length
    videoError.value = false
  }
}

function setPlaybackSpeed(event: Event) {
  const video = event.currentTarget as HTMLVideoElement
  video.playbackRate = 0.5
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

      <section class="data-panel" aria-label="Campus video">
        <div v-if="videos.length" class="media-player">
          <div class="video-frame">
            <Transition name="video-fade" mode="out-in">
              <video
                :key="videos[activeVideo].src"
                :src="videos[activeVideo].src"
                autoplay
                preload="auto"
                muted
                playsinline
                :loop="videos.length === 1"
                @loadedmetadata="setPlaybackSpeed"
                @ended="playNextVideo"
                @error="videoError = true"
              >
                Your browser does not support video playback.
              </video>
            </Transition>
            <p v-if="videoError" class="video-error">
              This video could not be played. Check that the MP4 uses a browser-supported codec.
            </p>
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
