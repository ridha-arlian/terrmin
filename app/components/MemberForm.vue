<script setup lang="ts">
  import * as z from 'zod'
  import { ref, computed } from 'vue'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import { Check, ChevronsUpDown } from '@lucide/vue'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Separator } from '@/components/ui/separator'
  import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
  import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  import { getAllTimezones } from '@/utils/timezone'
  import { cn } from '@/lib/utils'

  const emit = defineEmits<{
    add: [data: { name: string; timezone: string; workStart: number; workEnd: number }]
  }>()

  const timezones = getAllTimezones()
  const isTimezoneOpen = ref(false) 
  const searchQuery = ref('')

  const filteredTimezones = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) {
      return timezones.slice(0, 50)
    }
    return timezones.filter((tz) => 
      tz.label.toLowerCase().includes(q) || tz.value.toLowerCase().includes(q)
    )
  })

  const formSchema = toTypedSchema(
    z.object({
      name: z.string().min(1, 'Siapa nama anggota tim ini?'),
      timezone: z.string().min(1, 'Pilih lokasi zona waktu anggota tim'),
      workStart: z.coerce.number().min(0, 'Min 0').max(23, 'Max 23'),
      workEnd: z.coerce.number().min(0, 'Min 0').max(23, 'Max 23'),
    })
    .refine((data) => data.workStart !== data.workEnd, {
      message: 'Jam mulai dan selesai kerja tidak boleh sama',
      path: ['workEnd'],
    })
  )

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      name: '',
      timezone: userTimezone,
      workStart: 9,
      workEnd: 17,
    },
  })

  const selectedTzLabel = computed(() => {
    const found = timezones.find(t => t.value === form.values.timezone)
    return found ? found.label : form.values.timezone
  })

  const onSubmit = form.handleSubmit((values) => {
    emit('add', {
      name: values.name.trim(),
      timezone: values.timezone,
      workStart: values.workStart,
      workEnd: values.workEnd,
    })

    form.resetForm({
      values: {
        name: '',
        timezone: userTimezone,
        workStart: 9,
        workEnd: 17,
      }
    })
  })
</script>

<template>
  <TooltipProvider>
    <form class="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-start sm:gap-3" @submit="onSubmit">
      <FormField v-slot="{ componentField, errors }" name="name">
        <FormItem class="flex-1">
          <FormLabel>
            Nama
          </FormLabel>
          <Tooltip :open="!!errors.length">
            <TooltipTrigger as-child>
              <FormControl>
                <Input type="text" placeholder="Nama karyawan" v-bind="componentField" />
              </FormControl>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {{ errors[0] }}
            </TooltipContent>
          </Tooltip>
        </FormItem>
      </FormField>

      <FormField v-slot="{ field, errors }" name="timezone">
        <FormItem class="flex-[1.5]">
          <FormLabel>
            Timezone
          </FormLabel>
          <Tooltip :open="!!errors.length">
            <TooltipTrigger as-child>
              <Popover v-model:open="isTimezoneOpen">
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      :aria-expanded="isTimezoneOpen"
                      :class="cn('w-full justify-between font-normal', !field.value && 'text-muted-foreground')"
                    >
                      <span class="truncate">{{ selectedTzLabel || "Pilih timezone..." }}</span>
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-75 p-0" align="start">
                  <Command :filter-function="() => 1">
                    <CommandInput 
                      placeholder="Cari timezone..." 
                      :model-value="searchQuery" 
                      @input="(e: Event) => searchQuery = (e.target as HTMLInputElement).value" 
                    />
                    <CommandEmpty>
                      Timezone tidak ditemukan.
                    </CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          v-for="tz in filteredTimezones"
                          :key="tz.value"
                          :value="tz.value"
                          @select="() => {
                            field.onChange(tz.value)
                            isTimezoneOpen = false
                            searchQuery = ''
                          }"
                        >
                          <Check
                            :class="cn('mr-2 h-4 w-4', field.value === tz.value ? 'opacity-100' : 'opacity-0')"
                          />
                          {{ tz.label }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {{ errors[0] }}
            </TooltipContent>
          </Tooltip>
        </FormItem>
      </FormField>

      <div class="flex w-full items-start gap-2 sm:w-auto">
        <FormField v-slot="{ field, errors }" name="workStart">
          <FormItem class="flex-1 sm:w-28 sm:flex-none">
            <FormLabel>
              Mulai Kerja
            </FormLabel>
            <Tooltip :open="!!errors.length">
              <TooltipTrigger as-child>
                <FormControl>
                  <NumberField 
                    :model-value="field.value" 
                    :min="0" 
                    :max="23"
                    @update:model-value="field.onChange"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement class="cursor-pointer"/>
                      <NumberFieldInput />
                      <NumberFieldIncrement class="cursor-pointer"/>
                    </NumberFieldContent>
                  </NumberField>
                </FormControl>
              </TooltipTrigger>
              <TooltipContent side="top">
                {{ errors[0] }}
              </TooltipContent>
            </Tooltip>
          </FormItem>
        </FormField>

        <div class="flex h-9 items-center self-end pb-px">
          <Separator orientation="vertical" class="h-4 bg-border" />
        </div>

        <FormField v-slot="{ field, errors }" name="workEnd">
          <FormItem class="flex-1 sm:w-28 sm:flex-none">
            <FormLabel>
              Selesai Kerja
            </FormLabel>
            <Tooltip :open="!!errors.length">
              <TooltipTrigger as-child>
                <FormControl>
                  <NumberField 
                    :model-value="field.value" 
                    :min="0" 
                    :max="23"
                    @update:model-value="field.onChange"
                  >
                    <NumberFieldContent>
                      <NumberFieldDecrement class="cursor-pointer"/>
                      <NumberFieldInput />
                      <NumberFieldIncrement class="cursor-pointer"/>
                    </NumberFieldContent>
                  </NumberField>
                </FormControl>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {{ errors[0] }}
              </TooltipContent>
            </Tooltip>
          </FormItem>
        </FormField>
      </div>

      <div class="flex flex-col gap-2 sm:w-auto">
        <span class="hidden text-sm font-medium leading-none invisible sm:block">
          Tambah
        </span>
        <Button type="submit" class="w-full sm:w-auto cursor-pointer">
          Tambah
        </Button>
      </div>
    </form>
  </TooltipProvider>
</template>