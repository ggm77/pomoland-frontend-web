import type { MapDto, MapTileDto, Tile, TileState } from '../types'

export function mapDtoToTiles(map: MapDto, myUserId: number | null): Tile[] {
  const byKey = new Map<string, MapTileDto>()
  for (const dto of map.map) byKey.set(`${dto.x},${dto.y}`, dto)

  const isMine = (x: number, y: number) => byKey.get(`${x},${y}`)?.ownerId === myUserId

  const tiles: Tile[] = []
  for (let y = 0; y < map.sizeY; y++) {
    for (let x = 0; x < map.sizeX; x++) {
      const dto = byKey.get(`${x},${y}`)
      const state: TileState =
        !dto || dto.ownerId == null ? 'empty' : dto.ownerId === myUserId ? 'mine' : 'other'
      tiles.push({
        key: `${x},${y}`,
        col: x,
        row: y,
        state,
        capturable:
          state === 'empty' &&
          (isMine(x - 1, y) || isMine(x + 1, y) || isMine(x, y - 1) || isMine(x, y + 1)),
        owner: state === 'mine' ? '나' : state === 'other' ? String(dto?.ownerId) : undefined,
        defense: state !== 'empty' ? dto?.defensePower : undefined,
      })
    }
  }

  return tiles
}
