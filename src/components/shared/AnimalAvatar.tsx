import { Dog, Cat, Bird, Rabbit, PawPrint } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const speciesIcons: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
}

const palette = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-secondary/10 text-secondary border-secondary/20',
  'bg-tertiary/10 text-tertiary border-tertiary/20',
  'bg-teal-500/10 text-teal-600 border-teal-500/20',
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
      className={`flex items-center justify-center rounded-2xl flex-shrink-0 border shadow-sm ${colorClass}`}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.48)} strokeWidth={2} />
    </div>
  )
}
