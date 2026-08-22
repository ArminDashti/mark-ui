<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const localPart = ['arminonline', '71']
const domainParts = ['gmail', 'com']

const mailtoHref = computed(() => {
  const user = localPart.join('')
  const domain = `${domainParts[0]}.${domainParts[1]}`
  return `mailto:${user}@${domain}`
})

const visibleEmail = computed(
  () => `${localPart.join('')} [at] ${domainParts[0]} [dot] ${domainParts[1]}`,
)

const photoSrc = ref('/about-me/armin.png')
const photoOk = ref(false)

onMounted(() => {
  const img = new Image()
  img.onload = () => {
    photoOk.value = true
  }
  img.onerror = () => {
    photoOk.value = false
  }
  img.src = photoSrc.value
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8 px-4 py-10">
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">About Me</h1>
      <p class="text-muted-foreground">Armin Dashti — vibe coder, conductor of craft.</p>
    </header>

    <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div class="sm:w-48 sm:shrink-0">
        <img
          v-if="photoOk"
          :src="photoSrc"
          alt="Armin Dashti"
          class="h-auto w-full rounded-lg border border-border object-cover"
        />
        <div
          v-else
          class="flex h-40 items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 px-3 text-center text-xs text-muted-foreground"
        >
          Photo placeholder — add public/about-me/armin.png
        </div>
      </div>
      <div class="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Armin Dashti is a software engineer and vibe coder. He shapes intent with clarity and
          constraint, then lets Cursor’s agents compose the implementation. He reviews, refines,
          and ships what remains worthy.
        </p>
        <p>
          This application was written by AI agents—specifically Cursor—guided by Armin’s intent,
          then tempered by his review until fit to ship.
        </p>
      </div>
    </div>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold tracking-tight">Interests</h2>
      <p class="text-sm leading-relaxed text-muted-foreground">
        Cars, movies, vibe coding, coding, politics, military, jet fighters, and aircraft.
      </p>
    </section>

    <p class="text-sm text-muted-foreground">
      Contact:
      <a class="text-primary underline-offset-4 hover:underline" :href="mailtoHref">
        {{ visibleEmail }}
      </a>
    </p>

    <blockquote class="border-l-2 border-primary/40 pl-4 text-sm italic text-foreground">
      "Beware the quiet man. For while others speak, he watches. While others act, he plans. And
      when they finally rest, he strikes." — Anonymous
    </blockquote>
    <blockquote
      class="border-l-2 border-primary/40 pl-4 text-sm italic text-foreground"
      dir="rtl"
      lang="fa"
    >
      «از مرد خاموش برحذر باش. زیرا در حالی که دیگران سخن می‌گویند، او نظاره می‌کند. در حالی که
      دیگران عمل می‌کنند، او برنامه می‌ریزد. و هنگامی که سرانجام آرام می‌گیرند، او ضربه می‌زند.» —
      ناشناس
    </blockquote>
  </div>
</template>
