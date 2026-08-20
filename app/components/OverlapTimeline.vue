<script setup lang="ts">
  import { getOverlapWindows } from '~/utils/timezone'
  import type { TeamMember } from '~/utils/timezone'

  const props = defineProps<{
    members: TeamMember[]
    userTimezone: string
  }>()

  const windows = computed(() => getOverlapWindows(props.members, props.userTimezone))
  const hasOverlap = computed(() => windows.value.length > 0)
</script>

<template>
  <div class="text-center">
    <div v-if="hasOverlap" class="border border-success rounded-lg bg-success px-4 py-5 space-y-2">
      <p class="text-sm font-medium font-display text-white">
        Kapan semua orang bisa meeting bareng?
      </p>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <span
          v-for="w in windows"
          :key="w.label"
          class="font-mono-data text-3xl font-medium tracking-wide text-white"
        >
          {{ w.label }}
        </span>
      </div>
    </div>

    <div v-else class="border border-success rounded-lg bg-[#2e2825] px-4 py-5 space-y-2">
      <p class="text-sm font-medium font-display text-white/90">
        Kapan semua orang bisa meeting bareng?
      </p>
      <p class="text-2xl font-medium text-white/90">
        Tidak ada jam yang cocok
      </p>
    </div>
  </div>
</template>