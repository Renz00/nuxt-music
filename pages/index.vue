<template>
  <div class="main-bg">
    <div class="main-bg-image">
      <img class="bg-image" :src="`${assetPath}/images/${selectedSong.image}`" alt="background image">
    </div>

    <div class="container" style="position:relative; height:100vh;">
      <div class="row justify-content-center align-items-center h-50">
        <div class="col-12 w-75 mx-0 px-0">
          <Card :pt="{
            root: {
              class: 'shadow-lg',
              style: {
                backgroundImage: `linear-gradient(to bottom, rgba(27, 0, 32, 0.52), rgba(40, 13, 53, 0.73)), url(${assetPath}/images/${selectedSong.image})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }
            }
          }
            ">
            <template #title>
              {{ selectedSong.title }}
              <div class="float-end">
                <Button icon="pi pi-heart-fill" severity="warning" text rounded aria-label="Favorite" @click="toggleFav"
                  v-tooltip.bottom="{
                    value: 'Remove from favorites',
                    pt: { text: 'tt-text' }
                  }" v-if="isFav" />
                <Button icon="pi pi-heart" severity="warning" text rounded aria-label="Favorite" @click="toggleFav"
                  v-tooltip.bottom="{
                    value: 'Add to favorites',
                    pt: { text: 'tt-text' }
                  }
                    " v-else />
              </div>
            </template>
            <template #subtitle>
              <div class="row align-items-center"></div>
              <i class="pi pi-star"></i>
              <a class="text-light" :href="selectedSong.page" target="_blank" style="text-decoration: none;"
                v-tooltip.bottom="{
                  value: 'Go to artist page',
                  pt: { text: 'tt-text' }
                }
                  ">&nbsp;{{ selectedSong.artists }}
              </a>
            </template>
            <template #footer>
              <div class="row justify-content-center align-items-center">
                <div class="col-5 col-lg-auto order-2 order-lg-1">
                  <Button class="w-full" icon="pi pi-stop" severity="danger" aria-label="stop" text outlined
                    @click="stopTrack" :disabled="isLoading" />
                  <Button class="ms-2" icon="pi pi-caret-right" severity="warning" aria-label="play" text outlined
                    @click="playTrack" :disabled="isLoading" v-if="!isPlaying" />
                  <Button class="ms-2" icon="pi pi-pause" severity="warning" aria-label="play" text outlined
                    @click="pauseTrack" :disabled="isLoading" v-else />
                  <!-- <Button class="ms-2" severity="primary" aria-label="Playback speed" :label="`x${rate}`" size="small"
                  outlined @click="" :disabled="isLoading" /> -->
                </div>
                <div class="col-12 col-lg-8 order-1 order-lg-2">
                  <div class="mt-2">
                    <Slider v-model="duration" @update:modelValue="seekTime()" :min="min" :max="max"
                      :disabled="isLoading || !isPlaying" style="cursor: pointer;" :pt="{
                        root: { style: 'height:7px;' },
                        handle: { style: 'display:none;' },
                        range: { class: 'slider-red' }
                      }
                        " />
                  </div>
                  <div class="mt-1">
                    <small class="text-light float-start">{{ playbackTime }}</small>
                    <small class="text-light rate-text float-end" style="cursor: pointer;" @click="changeSpeed"
                      v-tooltip.bottom="{
                        value: 'Change the playback rate',
                        pt: { text: 'tt-text' }
                      }
                        ">x{{ rate }}</small>
                  </div>

                </div>
                <div class="col-7 col-lg-auto order-3">
                  <Button aria-label="prev" icon="pi pi-angle-double-left" severity="danger" size="small"
                    @click="prevTrack" text outlined></Button>
                  <Button class="ms-2" aria-label="next" icon="pi pi-angle-double-right" severity="danger" size="small"
                    @click="nextTrack" text outlined></Button>
                  <Knob class="ms-2 float-end" v-model="vol" @dblclick="toggleMuteTrack()" @update:modelValue="setVolume"
                    :min="volMin" :max="volMax" valueColor="var(--yellow-200)" :showValue="false" :strokeWidth="14"
                    :size="43" :disabled="isLoading"
                    v-tooltip="{ value: 'Change Volume.\nDouble Click to Mute.', pt: { text: { class: 'tt-text' }, range: { style: 'display: none;' }, svg: { style: 'display: none;' } } }" />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button';
import Card from 'primevue/card';
import Slider from 'primevue/slider';
import Knob from 'primevue/knob';

// @ts-ignore
import { Howl, Howler } from 'howler';

const songIndex = ref<number>(0)
const vol = ref<number>(75)
const tempVol = ref<number>(75)
const volMax = ref<number>(100)
const volMin = ref<number>(0)
const duration = ref<number>(0);
const isPlaying = ref<boolean>(false);
const isFav = ref<boolean>(false);
const trackID = ref<number>(0)
const min = ref<number>(0)
const max = ref<number>(0)
const isLoading = ref<boolean>(true)
const intervalID = ref<any>()
const playbackTime = ref<string>('00:00')
const rate = ref<number>(1)
const assetPath: string = "/_nuxt/assets"
const isMuted = ref<boolean>(false)

type Music = {
  id: number;
  title: string;
  artists: string;
  page: string;
  fname: string;
  image: string;
}

const music = ref<Array<Music>>([
  {
    id: 1,
    title: 'Everything Goes On (Kanta Remix)',
    artists: 'Porter Robinson',
    page: 'https://open.spotify.com/artist/3dz0NnIZhtKKeXZxLOxCam',
    fname: 'Everything Goes On Kanta Remix.mp3',
    image: 'one.jpg'
  },
  {
    id: 2,
    title: 'Inside',
    artists: 'Kanta',
    page: 'https://www.youtube.com/@Kanta001',
    fname: 'Inside.mp3',
    image: 'two.jpg'
  },
  {
    id: 3,
    title: 'City Nights',
    artists: 'Kanta',
    page: 'https://www.youtube.com/@Kanta001',
    fname: 'Kanta - City Nights.mp3',
    image: 'three.jpg'
  },
  {
    id: 4,
    title: 'Polar Quarantine',
    artists: 'Kanta',
    page: 'https://www.youtube.com/@Kanta001',
    fname: 'Kanta - Polar Quarantine.mp3',
    image: 'four.jpg'
  },
  {
    id: 5,
    title: 'Spring',
    artists: 'Kanta',
    page: 'https://www.youtube.com/@Kanta001',
    fname: 'Kanta - Spring.mp3',
    image: 'five.jpg'
  },
])

const selectedSong = ref<Music>(music.value[0])
const sound = ref<any>()

const initHowl = () => {
  sound.value = new Howl({
    src: [`${assetPath}/audio/${selectedSong.value.fname}`],
    preload: true,
    onplay: () => {
      isPlaying.value = true
      max.value = sound.value.duration(trackID.value)
      intervalID.value = updateTime()
    },
    onpause: () => {
      clearInterval(intervalID.value)
      isPlaying.value = false
    },
    onend: () => {
      // clearInterval(intervalID.value)
      // isPlaying.value = false
      rate.value = 1
      nextTrack()
    },
    onseek: () => {
      intervalID.value = updateTime()
    },
    onstop: () => {
      clearInterval(intervalID.value)
      isPlaying.value = false
      duration.value = 0
      rate.value = 1
      playbackTime.value = '00:00'
    }
  })
}

const toggleMuteTrack = () => {
  isMuted.value = !isMuted.value
  sound.value.mute(isMuted.value, trackID.value)

  if (isMuted.value) {
    tempVol.value = vol.value
    vol.value = 0
  }
  else {
    vol.value = tempVol.value
    setVolume()
  }

}

const nextTrack = () => {
  clearInterval(intervalID.value)
  sound.value.stop(trackID.value)
  if (songIndex.value >= music.value.length - 1) {
    songIndex.value = 0
  }
  else {
    songIndex.value++
  }
  selectedSong.value = music.value[songIndex.value]
  initHowl()
  playTrack()
}

const prevTrack = () => {
  clearInterval(intervalID.value)
  sound.value.stop(trackID.value)
  if (songIndex.value <= 0) {
    songIndex.value = music.value.length - 1
  }
  else {
    songIndex.value--
  }
  selectedSong.value = music.value[songIndex.value]
  initHowl()
  playTrack()
}

const getPlaybackTime = (maxDuration: number, currDuration: number) => {
  let seconds: number = maxDuration - currDuration
  let minutes: number | string = Math.trunc(Math.floor(seconds / 60));
  let extraSeconds: number | string = Math.trunc(seconds % 60);
  //formating the time string
  minutes = minutes < 10 ? "0" + minutes : minutes;
  extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
  //placing the formatted time to playbackTime variable
  playbackTime.value = minutes + ':' + extraSeconds
}

const updateTime = () => {
  getPlaybackTime(max.value, duration.value)
  return setInterval(() => {
    getPlaybackTime(max.value, duration.value)
    duration.value = sound.value.seek(trackID.value)
  }, 1000);
}

const seekTime = () => {
  sound.value.seek(duration.value, trackID.value)
}

const setVolume = () => {
  if (isMuted.value) toggleMuteTrack()

  const newVol = vol.value / 100
  sound.value.volume(newVol)
}

const playTrack = () => {
  isLoading.value = true

  trackID.value = sound.value.play();
  setVolume()

  if (isMuted.value) sound.value.mute(isMuted.value, trackID.value)

  isLoading.value = false
}

const pauseTrack = () => {
  sound.value.pause(trackID.value);
}

const stopTrack = () => {
  sound.value.stop(trackID.value)
}

const toggleFav = () => {
  isFav.value = !isFav.value
}

const changeSpeed = () => {
  if (isPlaying.value) {
    if (rate.value >= 2) {
      rate.value = 1
    }
    else {
      rate.value += 0.5
    }
    sound.value.rate(rate.value, trackID.value)
  }
}

onMounted(() => {
  initHowl()
  Howler.autoUnlock = false;
  isLoading.value = false
})

</script>

<style lang="css">
@import 'primeicons/primeicons.css';

.slider-red {
  background-color: var(--red-300);
}

.tt-text {
  font-size: 11px;
}

.rate-text:hover {
  color: black;
}

.main-bg {
  background-image: linear-gradient(rgba(26, 8, 41, 0.5) 0%, rgba(0, 0, 0, 0.5));
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
}

.bg-image {
  display: block;
  filter: blur(5px);
  width: 100vw;
  height: 100vh;
  margin: auto;
}

.main-bg-image {
  position: absolute;
  display: inline-block;
}

.main-bg-image::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: inline-block;
  opacity: 5;
  background: -moz-linear-gradient(top, rgba(26, 8, 41, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%);
  /* FF3.6+ */
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(26, 8, 41, 0.5)), color-stop(100%, rgba(0, 0, 0, 0.5)));
  /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, rgba(26, 8, 41, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%);
  /* Chrome10+,Safari5.1+ */
  background: -o-linear-gradient(top, rgba(26, 8, 41, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%);
  /* Opera 11.10+ */
  background: -ms-linear-gradient(top, rgba(26, 8, 41, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%);
  /* IE10+ */
  background: linear-gradient(to bottom, rgba(26, 8, 41, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%);
  /* W3C */
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#002f4b', endColorstr='#00000000', GradientType=0);
  /* IE6-9 */
}

/* .card-bg {
  background-size: cover;
  background-position: center;
} */
</style>