import { SETDEX_SV as HARDCORE_SETDEX } from "@data/hardcore"
import { SETDEX_SV as VGC_SETDEX } from "@data/movesets"
import { SETDEX_SV as NORMAL_SETDEX } from "@data/normal"
import { Stats } from "@lib/types"

export interface PokemonSetData {
  ability?: string
  nature?: string
  teraType?: string
  evs?: Partial<Stats>
  moves?: string[]
  items?: string[]
}

export interface SelectablePokemonEntry {
  displayName: string
  baseName: string
  setData: PokemonSetData
}

type TrainerSetdex = Record<string, Record<string, PokemonSetData>>

type SetdexEntry = [string, PokemonSetData]

const combinedSetdex: Record<string, SelectablePokemonEntry> = {}
const selectablePokemonNames: string[] = []
const selectablePokemonEntries: SelectablePokemonEntry[] = []

const normalizeTrainerKey = (trainerKey: string) => {
  if (trainerKey.startsWith("*")) {
    return trainerKey.slice(1).trim()
  }

  return trainerKey
}

const addEntry = (entry: SelectablePokemonEntry) => {
  if (combinedSetdex[entry.displayName]) {
    return
  }

  combinedSetdex[entry.displayName] = entry
  selectablePokemonNames.push(entry.displayName)
  selectablePokemonEntries.push(entry)
}

const addVgcEntries = (entries: SetdexEntry[]) => {
  entries.forEach(([pokemonName, setData]) => {
    addEntry({ displayName: pokemonName, baseName: pokemonName, setData })
  })
}

const addTrainerEntries = (trainerSetdex: TrainerSetdex) => {
  Object.entries(trainerSetdex).forEach(([pokemonName, trainerSets]) => {
    Object.entries(trainerSets).forEach(([trainerKey, setData]) => {
      const trainerDisplayName = normalizeTrainerKey(trainerKey)
      const displayName = `${pokemonName} (${trainerDisplayName})`

      addEntry({ displayName, baseName: pokemonName, setData })
    })
  })
}

const stripTrainerSuffix = (pokemonName: string) => {
  const trainerSuffixMatch = pokemonName.match(/^(.*)\s+\([^()]+\)$/)
  return trainerSuffixMatch ? trainerSuffixMatch[1] : pokemonName
}

const resolveBasePokemonName = (pokemonName: string) => {
  return combinedSetdex[pokemonName]?.baseName ?? stripTrainerSuffix(pokemonName)
}

addVgcEntries(Object.entries(VGC_SETDEX))
addTrainerEntries(NORMAL_SETDEX)
addTrainerEntries(HARDCORE_SETDEX)

export { combinedSetdex, resolveBasePokemonName, selectablePokemonEntries, selectablePokemonNames }
