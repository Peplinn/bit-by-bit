<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import * as NativeSelect from '$lib/components/ui/native-select'
  import { Textarea } from '$lib/components/ui/textarea'
  import { submitBusDescription } from './api'
  import { NEXT_STOP_DISPLAY_LABEL } from './format'
  import type { BusDescription, NextStopDisplay } from './types'
  import { busHref } from './view.svelte'

  let { vehicleId }: { vehicleId: number } = $props()

  let fields: Omit<BusDescription, 'vehicle_id'> = $state({
    make_model: '',
    seating_layout: '',
    seated_capacity: '',
    bike_rack: '',
    next_stop_display: '',
    appearance: '',
    notes: '',
  })
  let status: 'editing' | 'sending' | 'sent' = $state('editing')
  let error = $state('')

  const displayOptions = Object.entries(NEXT_STOP_DISPLAY_LABEL) as [NextStopDisplay, string][]

  async function handleSubmit(event: SubmitEvent) {
    // Stop the browser's default form submission, which would reload the page.
    event.preventDefault()
    if (Object.values(fields).every((value) => value.trim() === '')) {
      error = 'Fill in at least one detail before sending.'
      return
    }
    error = ''
    status = 'sending'
    await submitBusDescription({ vehicle_id: vehicleId, ...fields })
    status = 'sent'
  }
</script>

<Dialog.Header>
  <Dialog.Title>Help describe bus {vehicleId}</Dialog.Title>
  <Dialog.Description>
    Fill in whatever you know. Suggestions are reviewed before they appear.
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
      <Label for="seating_layout">Seating layout</Label>
      <Textarea
        id="seating_layout"
        placeholder="Which way the seats face, where the priority seats are…"
        bind:value={fields.seating_layout}
      />
    </div>
    <div class="space-y-1.5">
      <Label for="seated_capacity">Number of seats</Label>
      <Input id="seated_capacity" inputmode="numeric" bind:value={fields.seated_capacity} />
    </div>
    <div class="space-y-1.5">
      <Label for="bike_rack">Bike rack</Label>
      <Input id="bike_rack" placeholder="e.g. Front rack, 2 bikes" bind:value={fields.bike_rack} />
    </div>
    <div class="space-y-1.5">
      <Label for="next_stop_display">Next-stop display</Label>
      <NativeSelect.Root id="next_stop_display" bind:value={fields.next_stop_display}>
        <NativeSelect.Option value="">Not sure</NativeSelect.Option>
        {#each displayOptions as [value, label] (value)}
          <NativeSelect.Option {value}>{label}</NativeSelect.Option>
        {/each}
      </NativeSelect.Root>
    </div>
    <div class="space-y-1.5">
      <Label for="appearance">Appearance</Label>
      <Textarea
        id="appearance"
        placeholder="Livery, advertising wrap, anything that helps recognise it"
        bind:value={fields.appearance}
      />
    </div>
    <div class="space-y-1.5">
      <Label for="notes">Anything else</Label>
      <Textarea id="notes" bind:value={fields.notes} />
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
