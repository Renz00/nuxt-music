<template>
  <div class="container">
    <div class="row justify-content-center align-items-center">
      <div class="col-6 mt-3">
        <Card :pt="{ root: { class: 'bg-image' } }">
          <template #title>
            Song name
            <div class="float-end">
              <Button :icon="isFav ? 'pi pi-heart-fill' : 'pi pi-heart'" severity="warning" text rounded
                aria-label="Favorite" @click="toggleFav" />
            </div>
          </template>
          <template #subtitle> Artists </template>
          <template #footer>
            <div class="row align-items-center">
              <div class="col-auto">
                <Button icon="pi pi-stop" severity="danger" aria-label="stop" size="small" outlined />
                <Button class="ms-2" :icon="isPlaying ? 'pi pi-pause' : 'pi pi-caret-right'" severity="warning"
                  aria-label="play" size="small" outlined @click="togglePlay" :loading="isLoading" />
                <Button class="ms-2" severity="primary" aria-label="Playback speed" :label="`x${playbackSpeed}`"
                  size="small" outlined @click="changeSpeed" />
              </div>
              <div class="col-8">
                <Slider v-model="duration" :min="min" :max="max" class="w-full" />
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

// @ts-ignore
import { Howl, Howler } from 'howler';
import music from '~/assets/audio/music.mp3';

const sound = new Howl({
  src: [music],
  autoSuspend: true,
  onend: () => {
    console.log('Finished!');
    isPlaying.value = false
  }
});

const duration = ref<number>(0);
const isPlaying = ref<boolean>(false);
const isFav = ref<boolean>(false);
const playbackSpeed = ref<number>(1);
const trackID = ref<number>()
const min = ref<number>(0)
const max = ref<number>(0)
const isLoading = ref<boolean>(false)

const togglePlay = () => {
  isLoading.value = true
  if (!isPlaying.value) {
    trackID.value = sound.play()
    max.value = parseInt(sound.duration(trackID.value))
    isLoading.value = false
    setInterval(() => {
      duration.value = parseInt(sound.seek(null, trackID.value))
    }, 1000);
  }
  else {
    sound.pause();
  }
  isPlaying.value = !isPlaying.value
}

const toggleFav = () => {
  isFav.value = !isFav.value
}

const changeSpeed = () => {
  if (playbackSpeed.value >= 3) {
    playbackSpeed.value = 1
  }
  else {
    playbackSpeed.value++
  }
}

onMounted(() => {
})

</script>

<style lang="css">
@import 'primeicons/primeicons.css';

.bg-image {
  background-image:
    linear-gradient(to bottom, rgba(27, 0, 32, 0.52), rgba(0, 0, 0, 0.73)),
    url(https://picsum.photos/1920/1080);

  width: 550px;
  height: 220px;
  background-size: cover;
}
</style>