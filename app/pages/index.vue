<script setup lang="ts">
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { getLocalTimeString } from '@/utils/timezone'
  import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
  import { Separator } from '@/components/ui/separator'

  const { members, addMember, removeMember } = useTeamMembers()

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const userTime = ref(getLocalTimeString(userTimezone))
  let interval: ReturnType<typeof setInterval>

  onMounted(() => {
    interval = setInterval(() => {
      userTime.value = getLocalTimeString(userTimezone)
    }, 1000)
  })
  onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto py-12 px-4 space-y-10">
      <header class="text-center space-y-4">
        <div class="space-y-1 w-2/3 mx-auto">
          <div class="h-0.75 bg-primary" />
          <div class="h-[1.5px] bg-accent" />
        </div>

        <div>
          <h1 class="font-display text-4xl font-semibold tracking-tight text-primary">
            Terrmin
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Jadwal temu untuk tim lintas zona waktu
          </p>
        </div>

        <div class="border-2 border-primary rounded-lg py-7 bg-card">
          <p class="font-mono-data text-5xl font-medium tracking-widest text-foreground">
            {{ userTime }}
          </p>
          <p class="text-xs text-muted-foreground mt-2 tracking-wide uppercase">
            {{ userTimezone }}
          </p>
        </div>

        <Separator class="h-[1.5px] bg-primary w-full" />
      </header>

      <section>
        <NowTimeline :members="members" :user-timezone="userTimezone" />
      </section>

      <section v-if="members.length > 0">
        <OverlapTimeline :members="members" :user-timezone="userTimezone" />
      </section>

      <section class="space-y-4">
        <p class="text-sm font-medium font-display text-primary">
          Anggota tim
        </p>

        <div v-if="members.length === 0" class="space-y-4">
          <Empty class="rounded-lg border bg-card p-6">
            <EmptyHeader class="mb-4">
              <EmptyTitle>Belum ada anggota tim</EmptyTitle>
              <EmptyDescription>
                Tambahkan anggota tim pertama kamu di bawah ini.
              </EmptyDescription>
            </EmptyHeader>
            <MemberForm @add="addMember" />
          </Empty>
        </div>

        <div v-else class="space-y-4">
          <MemberForm @add="addMember" />

          <div class="max-h-90 w-full overflow-y-auto custom-scrollbar rounded-lg border p-4">
            <div class="space-y-2 pr-2">
              <MemberCard 
                v-for="m in members" 
                :key="m.id" 
                :member="m" 
                @remove="removeMember" 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>