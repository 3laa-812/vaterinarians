import { Dog, Cat, Bird, Rabbit, PawPrint } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const speciesIcons: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
}

const palette = [
  'bg-primary/15 text-primary',
  'bg-secondary/15 text-secondary',
  'bg-tertiary/15 text-tertiary',
  'bg-primary-container/30 text-on-primary-container',
]

function pickColorFromId(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

interface AnimalAvatarProps {
  id: string
  species: string
  size?: number
}

export function AnimalAvatar({ id, species, size = 40 }: AnimalAvatarProps) {
  const Icon = speciesIcons[species.toLowerCase()] ?? PawPrint
  const colorClass = pickColorFromId(id)

  return (
    <div
      className={`flex items-center justify-center rounded-full flex-shrink-0 ${colorClass}`}
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.55} strokeWidth={2} />
    </div>
  )
}
