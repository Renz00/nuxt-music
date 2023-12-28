<template>
  <div class="container">
    <div class="row justify-content-center align-items-center">
      <div class="col-auto">
        <Button label="prev" @click="prevTrack"></Button>
      </div>
      <div class="col-6 mt-3">
        <Card :pt="{ root: { class: 'bg-image' } }">
          <template #title>
            {{ selectedSong.title }}
            <div class="float-end">
              <Button :icon="isFav ? 'pi pi-heart-fill' : 'pi pi-heart'" severity="warning" text rounded
                aria-label="Favorite" @click="toggleFav" v-tooltip.bottom="{
                  value: 'Add to favorites',
                  pt: { text: 'tt-text' }
                }" />
            </div>
          </template>
          <template #subtitle>
            <div class="row align-items-center"></div>
            <i class="pi pi-star"></i>
            <a class="text-light" href="https://en.wikipedia.org/wiki/Porter_Robinson" target="_blank"
              style="text-decoration: none;" v-tooltip.bottom="{
                value: 'Go to artist page',
                pt: { text: 'tt-text' }
              }">&nbsp;{{ selectedSong.artists }}
            </a>
          </template>
          <template #footer>
            <div class="row justify-content-start align-items-center">
              <div class="col-auto float-start">
                <Button icon="pi pi-stop" severity="danger" aria-label="stop" size="small" outlined @click="stopTrack"
                  :disabled="isLoading" />
                <Button class="ms-2" icon="pi pi-caret-right" severity="warning" aria-label="play" size="small" outlined
                  @click="playTrack" :disabled="isLoading" v-if="!isPlaying" />
                <Button class="ms-2" icon="pi pi-pause" severity="warning" aria-label="play" size="small" outlined
                  @click="pauseTrack" :disabled="isLoading" v-else />
                <!-- <Button class="ms-2" severity="primary" aria-label="Playback speed" :label="`x${rate}`" size="small"
                  outlined @click="" :disabled="isLoading" /> -->
              </div>
              <div class="col-8">
                <div class="mt-2">
                  <Slider v-model="duration" @update:modelValue="seekTime()" :min="min" :max="max" class="w-full"
                    :disabled="isLoading || !isPlaying" style="cursor: pointer;" :pt="{
                      root: { stlye: 'width:328px;' },
                      handle: { style: 'display:none;' },
                      range: { class: 'slider-red' }
                    }" />
                </div>
                <div class=" mt-1">
                  <small class="text-light float-start">{{ playbackTime }}</small>
                  <small class="text-light rate-text float-end" style="cursor: pointer;" @click="changeSpeed"
                    v-tooltip.bottom="{
                      value: 'Change the playback rate',
                      pt: { text: 'tt-text' }
                    }">x{{ rate }}</small>
                </div>
              </div>
              <div class="col-auto">
                <Knob class="float-end" v-model="vol" @update:modelValue="setVolume" :min="volMin" :max="volMax"
                  rangeColor="var(--red-100)" valueColor="var(--yellow-200)" :showValue="false" :strokeWidth="15"
                  :size="40" :disabled="isLoading" v-tooltip="{ value: 'Change Volume', pt: { text: 'tt-text' } }" />
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-auto">
        <Button label="next" @click="nextTrack"></Button>
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
const vol = ref<number>(100)
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

type Music = {
  id: number;
  title: string;
  artists: string;
  fname: string;
}

const music = ref<Array<Music>>([
  {
    id: 1,
    title: 'Everything Goes On (Kanta Remix)',
    artists: 'Porter Robinson',
    fname: 'Everything Goes On Kanta Remix.mp3'
  },
  {
    id: 2,
    title: 'Inside',
    artists: 'Kanta',
    fname: 'Inside.mp3'
  },
  {
    id: 3,
    title: 'City Nights',
    artists: 'Kanta',
    fname: 'Kanta - City Nights.mp3'
  },
])

const selectedSong = ref<Music>(music.value[0])
const sound = ref<any>()

const initHowl = () => {
  sound.value = new Howl({
    src: [`/_nuxt/assets/audio/${selectedSong.value.fname}`],
    preload: true,
    onplay: () => {
      isPlaying.value = true
      max.value = sound.value.duration(trackID.value)
      intervalID.value = updateTime()
    },
    onpause: () => {
      isPlaying.value = false
      clearInterval(intervalID.value)
    },
    onend: () => {
      isPlaying.value = false
      rate.value = 1
      clearInterval(intervalID.value)

    },
    onseek: () => {
      intervalID.value = updateTime()
    },
    onstop: () => {
      isPlaying.value = false
      duration.value = 0
      rate.value = 1
      playbackTime.value = '00:00'
      clearInterval(intervalID.value)
    }
  })
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
  if (songIndex.value <= music.value.length - 1) {
    songIndex.value = 0
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
  const newVol = vol.value / 100
  sound.value.volume(newVol)
}

const playTrack = () => {
  isLoading.value = true
  trackID.value = sound.value.play();
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

.bg-image {
  background-image:
    linear-gradient(to bottom, rgba(27, 0, 32, 0.52), rgba(40, 13, 53, 0.73)),
    url(https://picsum.photos/1920/1080);

  width: 550px;
  height: 220px;
  background-size: cover;
}
</style>