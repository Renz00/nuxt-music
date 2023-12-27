<template>
  <div class="container">
    <div class="row justify-content-center align-items-center">
      <div class="col-6 mt-3">
        <Card :pt="{ root: { class: 'bg-image' } }">
          <template #title>
            {{ title }}
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
              }">&nbsp;{{ artists }}
            </a>
          </template>
          <template #footer>
            <div class="row justify-content-start align-items-center">
              <div class="col-auto float-start">
                <Button icon="pi pi-stop" severity="danger" aria-label="stop" size="small" outlined @click="stopPlayback"
                  :disabled="isLoading" />
                <Button class="ms-2" :icon="isPlaying ? 'pi pi-pause' : 'pi pi-caret-right'" severity="warning"
                  aria-label="play" size="small" outlined @click="togglePlay" :disabled="isLoading" />
                <!-- <Button class="ms-2" severity="primary" aria-label="Playback speed" :label="`x${rate}`" size="small"
                  outlined @click="" :disabled="isLoading" /> -->
              </div>
              <div class="col-8">
                <div class="mt-2">
                  <Slider v-model="duration" @update:modelValue="seekTime()" :min="min" :max="max" class="w-full"
                    :disabled="isLoading" style="cursor: pointer;" :pt="{
                      root: { stlye: 'width:328px;' },
                      handle: { style: 'display:none;' }
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
                  rangeColor="var(--yellow-300)" valueColor="var(--yellow-50)" :showValue="false" :strokeWidth="15"
                  :size="40" :disabled="isLoading" v-tooltip="{ value: 'Change Volume', pt: { text: 'tt-text' } }" />
              </div>
            </div>
          </template>
        </Card>
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
import music from '~/assets/audio/my song.mp3';

const sound = new Howl({
  src: [music],
  onplay: () => {
    isPlaying.value = true
    max.value = parseInt(sound.duration(trackID.value))
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
});

const title = ref<string>('Everything Goes On (Kanta Remix)')
const artists = ref<string>('Porter Robinson')
const vol = ref<number>(100)
const volMax = ref<number>(100)
const volMin = ref<number>(0)
const duration = ref<number>(0);
const isPlaying = ref<boolean>(false);
const isFav = ref<boolean>(false);
const trackID = ref<number>()
const min = ref<number>(0)
const max = ref<number>(0)
const isLoading = ref<boolean>(true)
const intervalID = ref<any>()
const playbackTime = ref<string>('00:00')
const rate = ref<number>(1)

const getPlaybackTime = (maxDuration: number, currDuration: number) => {
  let seconds: number = maxDuration - currDuration
  let minutes: number | string = Math.floor(seconds / 60);
  let extraSeconds: number | string = seconds % 60;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
  playbackTime.value = minutes + ':' + extraSeconds
}

const updateTime = () => {

  getPlaybackTime(max.value, duration.value)

  return setInterval(() => {
    getPlaybackTime(max.value, duration.value)
    duration.value = parseInt(sound.seek(null, trackID.value))
  }, 1000);
}

const seekTime = () => {
  sound.seek(duration.value, trackID.value)
}

const setVolume = () => {
  const newVol = vol.value / 100
  sound.volume(newVol)
}

const togglePlay = () => {
  if (sound !== null) {
    isLoading.value = true
    if (!isPlaying.value) {
      trackID.value = sound.play();
    }
    else {
      sound.pause(trackID.value);
    }
    isLoading.value = false
  }
}

const stopPlayback = () => {
  if (sound !== null) {
    sound.stop(trackID.value)
  }
}

const toggleFav = () => {
  isFav.value = !isFav.value
}

const changeSpeed = () => {
  if (sound !== null && isPlaying.value) {
    if (rate.value >= 2) {
      rate.value = 1
    }
    else {
      rate.value += 0.5
    }
    sound.rate(rate.value.toFixed(1), trackID.value)
  }
}

onMounted(() => {
  Howler.autoUnlock = false;
  isLoading.value = false
})

</script>

<style lang="css">
@import 'primeicons/primeicons.css';

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