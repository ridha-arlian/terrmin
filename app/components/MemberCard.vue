<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { X, Minus } from '@lucide/vue';
  import { Button } from '@/components/ui/button'
  import { getLocalTimeString, getMemberColor } from '@/utils/timezone'
  import type { TeamMember } from '@/utils/timezone'

  const props = defineProps<{ member: TeamMember }>()
  const emit = defineEmits<{ remove: [id: string] }>()

  const now = ref(getLocalTimeString(props.member.timezone))
  let interval: ReturnType<typeof setInterval>

  const memberColor = computed(() => getMemberColor(props.member.id))

  onMounted(() => {
    interval = setInterval(() => {
      now.value = getLocalTimeString(props.member.timezone)
    }, 1000)
  })
  onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="flex items-center justify-between border rounded-lg p-3 bg-card">
    <div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full shrink-0 border border-background shadow-sm"
          :style="{ backgroundColor: memberColor }"
        />
        <p class="font-medium">
          {{ member.name }}
        </p>
      </div>
      <p class="text-xs text-muted-foreground mt-0.5">
        {{ member.timezone }} · {{ member.workStart }}<Minus/>{{ member.workEnd }}
      </p>
    </div>
    <div class="flex items-center gap-3">
      <span class="font-mono text-lg">{{ now }}</span>
      <Button variant="ghost" size="icon" @click="emit('remove', member.id)">
        <X class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>