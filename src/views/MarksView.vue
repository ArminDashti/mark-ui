<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  createMark,
  deleteMark,
  fetchMarks,
  markImageUrl,
  updateMark,
  type MarkKind,
  type MarkRow,
} from '@/lib/auth'

const props = defineProps<{
  kind: MarkKind
}>()

const items = ref<MarkRow[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const query = ref('')
const dialogOpen = ref(false)
const submitting = ref(false)
const editing = ref<MarkRow | null>(null)
const name = ref('')
const slug = ref('')
const file = ref<File | null>(null)
const jpegWarning = ref(false)
const copiedId = ref<string | null>(null)
const slugTouched = ref(false)

const title = computed(() => kindTitle(props.kind))
const plural = computed(() => kindPlural(props.kind))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (row) => row.name.toLowerCase().includes(q) || row.slug.toLowerCase().includes(q),
  )
})

function kindTitle(kind: MarkKind): string {
  switch (kind) {
    case 'logo':
      return 'Logo'
    case 'icon':
      return 'Icon'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function kindPlural(kind: MarkKind): string {
  switch (kind) {
    case 'logo':
      return 'Logos'
    case 'icon':
      return 'Icons'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function load() {
  loading.value = true
  errorMessage.value = null
  try {
    items.value = await fetchMarks(props.kind)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Could not load marks'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  name.value = ''
  slug.value = ''
  file.value = null
  jpegWarning.value = false
  slugTouched.value = false
  errorMessage.value = null
  dialogOpen.value = true
}

function openEdit(row: MarkRow) {
  editing.value = row
  name.value = row.name
  slug.value = row.slug
  file.value = null
  jpegWarning.value = row.original_mime === 'image/jpeg'
  slugTouched.value = true
  errorMessage.value = null
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

function onNameInput(value: string) {
  name.value = value
  if (!slugTouched.value && !editing.value) {
    slug.value = toSlug(value)
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const next = input.files?.[0] ?? null
  file.value = next
  jpegWarning.value = Boolean(
    next && (next.type === 'image/jpeg' || /\.jpe?g$/i.test(next.name)),
  )
}

async function onSave() {
  errorMessage.value = null
  submitting.value = true
  try {
    const form = new FormData()
    form.set('kind', props.kind)
    form.set('name', name.value.trim())
    form.set('slug', slug.value.trim())
    if (file.value) {
      form.set('file', file.value)
    }
    if (editing.value) {
      await updateMark(editing.value.id, form)
    } else {
      if (!file.value) {
        throw new Error('file is required')
      }
      await createMark(form)
    }
    dialogOpen.value = false
    await load()
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Save failed'
  } finally {
    submitting.value = false
  }
}

async function onDelete(row: MarkRow) {
  if (!window.confirm(`Delete ${row.name}?`)) return
  errorMessage.value = null
  try {
    await deleteMark(row.id)
    await load()
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Delete failed'
  }
}

async function copyUrl(row: MarkRow) {
  const url = `${window.location.origin}${markImageUrl(row.kind, row.slug, 128)}`
  await navigator.clipboard.writeText(url)
  copiedId.value = row.id
  window.setTimeout(() => {
    if (copiedId.value === row.id) copiedId.value = null
  }, 1500)
}

onMounted(() => {
  void load()
})

watch(
  () => props.kind,
  () => {
    query.value = ''
    void load()
  },
)
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-4 py-8">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">{{ plural }}</h1>
        <p class="text-sm text-muted-foreground">
          Upload {{ plural.toLowerCase() }} and serve them as transparent PNGs at any size.
        </p>
      </div>
      <Button @click="openCreate">Upload {{ title }}</Button>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <Input
        v-model="query"
        class="max-w-sm"
        :placeholder="`Search ${plural.toLowerCase()}…`"
      />
      <p v-if="loading" class="text-sm text-muted-foreground">Loading…</p>
    </div>

    <p v-if="errorMessage && !dialogOpen" class="text-sm text-red-600 dark:text-red-400">
      {{ errorMessage }}
    </p>

    <div v-if="!loading && filtered.length === 0" class="text-sm text-muted-foreground">
      No {{ plural.toLowerCase() }} yet.
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="row in filtered" :key="row.id">
        <CardHeader class="pb-2">
          <CardTitle class="truncate">{{ row.name }}</CardTitle>
          <CardDescription class="font-mono text-xs">/m/{{ row.kind }}/{{ row.slug }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            class="flex h-36 items-center justify-center rounded-md border border-dashed bg-[linear-gradient(45deg,#9992_25%,transparent_25%),linear-gradient(-45deg,#9992_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#9992_75%),linear-gradient(-45deg,transparent_75%,#9992_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]"
          >
            <img
              :src="markImageUrl(row.kind, row.slug, 128)"
              :alt="row.name"
              class="max-h-32 max-w-full object-contain"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            {{ row.width }}×{{ row.height }}
            <span v-if="!row.has_alpha"> · no transparency</span>
          </p>
          <div class="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" @click="copyUrl(row)">
              {{ copiedId === row.id ? 'Copied' : 'Copy URL' }}
            </Button>
            <Button size="sm" variant="secondary" @click="openEdit(row)">Edit</Button>
            <Button size="sm" variant="destructive" @click="onDelete(row)">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog
      :open="dialogOpen"
      :title="editing ? `Edit ${title}` : `Upload ${title}`"
      :description="`PNG, WebP, or SVG preferred. JPEG is kept without invented transparency.`"
      @close="closeDialog"
    >
      <form class="space-y-3" @submit.prevent="onSave">
        <label class="block space-y-1 text-sm">
          <span>Name</span>
          <Input :model-value="name" required @update:model-value="onNameInput" />
        </label>
        <label class="block space-y-1 text-sm">
          <span>Slug</span>
          <Input
            v-model="slug"
            required
            class="font-mono"
            @input="slugTouched = true"
          />
        </label>
        <label class="block space-y-1 text-sm">
          <span>{{ editing ? 'Replace file (optional)' : 'File' }}</span>
          <input
            class="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5"
            type="file"
            accept="image/png,image/webp,image/svg+xml,image/jpeg,.png,.webp,.svg,.jpg,.jpeg"
            :required="!editing"
            @change="onFileChange"
          />
        </label>
        <p v-if="jpegWarning" class="text-sm text-amber-600 dark:text-amber-400">
          JPEG has no alpha channel. The served PNG will not gain a transparent background.
        </p>
        <p v-if="errorMessage && dialogOpen" class="text-sm text-red-600 dark:text-red-400">
          {{ errorMessage }}
        </p>
        <div class="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
          <Button type="submit" :disabled="submitting">
            {{ submitting ? 'Saving…' : 'Save' }}
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
