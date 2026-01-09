import { Component, computed, inject, input, output } from "@angular/core"
import { ABILITY_DETAILS } from "@data/abiliity-details"
import { selectablePokemonEntries } from "@data/combined-movesets"
import { POKEMON_DETAILS, PokemonDetail, SpeciesData } from "@data/pokemon-details"
import { CalculatorStore } from "@data/store/calculator-store"
import { FilterableTableComponent } from "@features/pokemon-build/tables/filterable-table/filterable-table.component"
import { ColumnConfig, TableData } from "@features/pokemon-build/tables/filterable-table/filtered-table-types"
import { Pokemon } from "@lib/model/pokemon"

type PokemonTableEntry = PokemonDetail & { baseName: string }

@Component({
  selector: "app-pokemon-table",
  imports: [FilterableTableComponent],
  templateUrl: "./pokemon-table.component.html",
  styleUrl: "./pokemon-table.component.scss"
})
export class PokemonTableComponent {
  pokemonId = input.required<string>()
  dataFilter = input.required<string>()
  haveFocus = input.required<boolean>()

  pokemonSelected = output<string>()
  firstPokemonFromList = output<string>()
  escapeWasPressed = output()

  store = inject(CalculatorStore)

  pokemon = computed(() => this.store.findPokemonById(this.pokemonId()))

  actualPokemon = computed(() => {
    return [this.store.displayName(this.pokemonId())]
  })

  pokemonData = this.buildGroupedPokemonData()

  pokemonColumns: ColumnConfig<PokemonTableEntry>[] = [
    new ColumnConfig<PokemonTableEntry>({
      field: "name",
      isImageColumn: true,
      displayFn: (item: PokemonTableEntry) => `assets/sprites/pokemon-home/${item.baseName}.png`,
      alignLeft: true,
      width: "small"
    }),
    new ColumnConfig<PokemonTableEntry>({ field: "name", header: "Name", sortable: true, alignLeft: true, width: "medium" }),
    new ColumnConfig<PokemonTableEntry>({ field: "types", header: "Types", isPokemonType: true, width: "medium" }),
    new ColumnConfig<PokemonTableEntry>({ field: "abilities", header: "Abilities", width: "auto" }),
    new ColumnConfig<PokemonTableEntry>({ field: "hp", header: "HP", showHeaderInCell: true, sortable: true, width: "verysmall" }),
    new ColumnConfig<PokemonTableEntry>({ field: "atk", header: "Atk", showHeaderInCell: true, sortable: true, width: "verysmall" }),
    new ColumnConfig<PokemonTableEntry>({ field: "def", header: "Def", showHeaderInCell: true, sortable: true, width: "verysmall" }),
    new ColumnConfig<PokemonTableEntry>({ field: "spa", header: "SpA", showHeaderInCell: true, sortable: true, width: "verysmall" }),
    new ColumnConfig<PokemonTableEntry>({ field: "spd", header: "SpD", showHeaderInCell: true, sortable: true, width: "verysmall" }),
    new ColumnConfig<PokemonTableEntry>({ field: "spe", header: "Spe", showHeaderInCell: true, sortable: true, width: "verysmall" }),
    new ColumnConfig<PokemonTableEntry>({ field: "bst", header: "BST", showHeaderInCell: true, sortable: true, width: "verysmall" })
  ]

  buildGroupedPokemonData(): TableData<PokemonTableEntry>[] {
    const detailsByName = new Map(Object.values(POKEMON_DETAILS).map(p => [p.name, p]))

    const allPokemon = selectablePokemonEntries
      .map(entry => {
        const details =
          detailsByName.get(entry.baseName) ??
          ({
            name: entry.baseName,
            abilities: [],
            learnset: [],
            group: "Regular"
          } satisfies SpeciesData)

        const pokemon = new Pokemon(entry.baseName)
        const abilities = details.abilities.map(ability => ABILITY_DETAILS[ability].name).filter((ability): ability is string => Boolean(ability))

        return {
          name: entry.displayName,
          baseName: entry.baseName,
          types: [pokemon.type1, pokemon.type2],
          abilities: abilities,
          hp: pokemon.baseHp,
          atk: pokemon.baseAtk,
          def: pokemon.baseDef,
          spa: pokemon.baseSpa,
          spd: pokemon.baseSpd,
          spe: pokemon.baseSpe,
          bst: pokemon.bst,
          group: details.group
        } as PokemonTableEntry
      })

    const groupedData = allPokemon.reduce(
      (acc, pokemon) => {
        const groupName = pokemon.group

        if (!acc[groupName]) {
          acc[groupName] = []
        }

        acc[groupName].push(pokemon)
        return acc
      },
      {} as Record<PokemonDetail["group"], PokemonTableEntry[]>
    )

    const result: TableData<PokemonTableEntry>[] = Object.keys(groupedData).map(groupName => ({
      group: groupName as PokemonDetail["group"],
      data: groupedData[groupName as PokemonDetail["group"]]
    }))

    const orderedResult: TableData<PokemonTableEntry>[] = [result.find(data => data.group == "Meta"), result.find(data => data.group == "Low usage"), result.find(data => data.group == "Regular")].filter((group): group is TableData<PokemonTableEntry> => Boolean(group))

    return orderedResult
  }
}
