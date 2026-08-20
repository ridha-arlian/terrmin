<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { Progress } from '@/components/ui/progress'
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  import { getLocalHourFraction, getMemberColor } from '@/utils/timezone'
  import type { TeamMember } from '@/utils/timezone'

  const props = defineProps<{ members: TeamMember[]; userTimezone: string }>()

  const isMounted = ref(false)
  
  const tick = ref(0)
  let interval: ReturnType<typeof setInterval>
  
  onMounted(() => {
    isMounted.value = true 
    interval = setInterval(() => tick.value++, 60 * 1000) 
  })
  
  onUnmounted(() => clearInterval(interval))

  const userHour = computed(() => { 
    tick.value;
    if (!isMounted.value) return 0 
    return getLocalHourFraction(props.userTimezone) 
  })
  
  const progressValue = computed(() => (userHour.value / 24) * 100)

  const markers = computed(() => {
    tick.value
    if (!isMounted.value) return [] 
    
    return props.members.map(m => {
      const hour = getLocalHourFraction(m.timezone)
      const hours = Math.floor(hour)
      const minutes = Math.floor((hour - hours) * 60)
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      return {
        id: m.id,
        name: m.name,
        hour,
        formattedTime,
        color: getMemberColor(m.id),
      }
    })
  })

  function positionPercent(hour: number) { return (hour / 24) * 100 }
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm font-medium font-display text-primary">
      Zona Waktu Tim
    </p>

    <div class="relative h-3 mt-3">
      <Progress
        :model-value="progressValue"
        class="h-3 bg-muted border border-border [&>div]:bg-primary"
      />

      <span
        v-for="h in [0, 3, 6, 9, 12, 15, 18, 21, 24]"
        :key="h"
        class="absolute font-mono-data text-[10px] text-muted-foreground -translate-x-1/2"
        :style="{ left: positionPercent(h) + '%', top: 'calc(100% + 6px)' }"
      >
        {{ h }}
      </span>

      <TooltipProvider v-for="m in markers" :key="m.id">
        <Tooltip>
          <TooltipTrigger as-child>
            <div
              class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-[1.5px] border-background shadow-sm cursor-pointer z-10 transition-transform hover:scale-125"
              :style="{ left: positionPercent(m.hour) + '%', backgroundColor: m.color }"
            />
          </TooltipTrigger>
          <TooltipContent side="top" class="text-xs">
            <span class="font-medium">{{ m.name }}</span> — {{ m.formattedTime }}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>