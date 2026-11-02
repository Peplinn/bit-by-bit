<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import { submitBusDescription } from './api'
  import { BIKE_RACK_LABEL, EQUIPMENT_STATUS_LABEL, SEATING_LABEL } from './format'
  import type { BusDescription } from './types'
  import { busHref } from './view.svelte'

  let { vehicleId }: { vehicleId: number } = $props()

  // Tag groups hand back plain strings, so the form keeps strings and casts on submit.
  // The tags only offer valid values, so the cast is safe.
  let fields = $state({
    make_model: '',
    seating: [] as string[],
    seated_capacity: '',
    bike_racks: [] as string[],
    next_stop_display: '',
    next_stop_audio: '',
    appearance: '',
  })
  let status: 'editing' | 'sending' | 'sent' = $state('editing')
  let error = $state('')

  const seatingOptions = Object.entries(SEATING_LABEL)
  const bikeRackOptions = [...Object.entries(BIKE_RACK_LABEL), ['none', 'None']]
  const equipmentOptions = Object.entries(EQUIPMENT_STATUS_LABEL)

  // "None" can't be picked alongside a rack: picking None clears the racks, and picking a
  // rack clears None.
  function withExclusiveNone(previous: string[], next: string[]): string[] {
    const added = next.filter((value) => !previous.includes(value))
    return added.includes('none') ? ['none'] : next.filter((value) => value !== 'none')
  }

  const isBlank = (value: string | string[]) =>
    typeof value === 'string' ? value.trim() === '' : value.length === 0

  async function handleSubmit(event: SubmitEvent) {
    // Stop the browser's default form submission, which would reload the page.
    event.preventDefault()
    if (Object.values(fields).every(isBlank)) {
      error = 'Fill in at least one detail before sending.'
      return
    }
    error = ''
    status = 'sending'
    await submitBusDescription({
      vehicle_id: vehicleId,
      submitted_at: new Date().toISOString(),
      ...fields,
    } as BusDescription)
    status = 'sent'
  }
</script>

<Dialog.Header>
  <Dialog.Title>Help describe bus {vehicleId}</Dialog.Title>
  <Dialog.Description>
    Fill in whatever you know. Info is reviewed before being shown to users.
  </Dialog.Description>
</Dialog.Header>

{#if status === 'sent'}
  <p class="text-sm">Thanks! Your description of bus {vehicleId} will be reviewed.</p>
  <Dialog.Footer>
    <Button href={busHref(vehicleId)}>Back to bus {vehicleId}</Button>
  </Dialog.Footer>
{:else}
  <form class="space-y-4" onsubmit={handleSubmit}>
    <div class="space-y-1.5">
      <Label for="make_model">Make and model</Label>
      <Input id="make_model" placeholder="e.g. New Flyer XD40" bind:value={fields.make_model} />
    </div>

    <div class="space-y-1.5">
      <Label id="seating-label">Seating layout</Label>
      <ToggleGroup.Root
        type="multiple"
        variant="outline"
        spacing={1}
        aria-labelledby="seating-label"
        bind:value={fields.seating}
      >
        {#each seatingOptions as [value, label] (value)}
          <ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </div>

    <div class="space-y-1.5">
      <Label for="seated_capacity">Number of seats</Label>
      <Input id="seated_capacity" inputmode="numeric" bind:value={fields.seated_capacity} />
    </div>

    <div class="space-y-1.5">
      <Label id="bike-racks-label">Bike rack</Label>
      <!-- A function binding: Svelte reads with the first function and writes with the second,
           which lets withExclusiveNone adjust every change. -->
      <ToggleGroup.Root
        type="multiple"
        variant="outline"
        spacing={1}
        aria-labelledby="bike-racks-label"
        bind:value={
          () => fields.bike_racks,
          (next) => (fields.bike_racks = withExclusiveNone(fields.bike_racks, next))
        }
      >
        {#each bikeRackOptions as [value, label] (value)}
          <ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </div>

    <div class="space-y-1.5">
      <Label id="display-label">Next-stop information: display</Label>
      <ToggleGroup.Root
        type="single"
        variant="outline"
        spacing={1}
        aria-labelledby="display-label"
        bind:value={fields.next_stop_display}
      >
        {#each equipmentOptions as [value, label] (value)}
          <ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </div>

    <div class="space-y-1.5">
      <Label id="audio-label">Next-stop information: audio</Label>
      <ToggleGroup.Root
        type="single"
        variant="outline"
        spacing={1}
        aria-labelledby="audio-label"
        bind:value={fields.next_stop_audio}
      >
        {#each equipmentOptions as [value, label] (value)}
          <ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </div>

    <div class="space-y-1.5">
      <Label for="appearance">Appearance</Label>
      <Textarea
        id="appearance"
        placeholder="Livery, advertising wrap, anything that helps recognise it"
        bind:value={fields.appearance}
      />
    </div>

    {#if error}
      <p class="text-sm text-red-600" role="alert">{error}</p>
    {/if}

    <Dialog.Footer>
      <Button variant="outline" href={busHref(vehicleId)}>Cancel</Button>
      <Button type="submit" disabled={status === 'sending'}>Send for review</Button>
    </Dialog.Footer>
  </form>
{/if}
