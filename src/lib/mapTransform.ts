import type { MapDto, MapTileDto, Tile, TileState } from '../types'

export function mapDtoToTiles(map: MapDto, myUserId: number | null): Tile[] {
  const byKey = new Map<string, MapTileDto>()
  for (const dto of map.map) byKey.set(`${dto.x},${dto.y}`, dto)

  const isMine = (x: number, y: number) => byKey.get(`${x},${y}`)?.ownerId === myUserId

  const tiles: Tile[] = []
  // y=0이 맨 아래, 위로 갈수록 y가 커지는 1사분면 형태로 렌더링되도록 y를 역순으로 순회
  for (let y = map.sizeY - 1; y >= 0; y--) {
    for (let x = 0; x < map.sizeX; x++) {
      const dto = byKey.get(`${x},${y}`)
      const isSpawnPoint = dto?.isSpawnPoint ?? false
      const state: TileState =
        !dto || dto.ownerId == null ? 'empty' : dto.ownerId === myUserId ? 'mine' : 'other'
      tiles.push({
        key: `${x},${y}`,
        col: x,
        row: y,
        state,
        capturable:
          !isSpawnPoint &&
          state !== 'mine' &&
          (isMine(x - 1, y) || isMine(x + 1, y) || isMine(x, y - 1) || isMine(x, y + 1)),
        owner: state === 'mine' ? '나' : state === 'other' ? String(dto?.ownerId) : undefined,
        defense: state !== 'empty' ? dto?.defensePower : undefined,
        isSpawnPoint,
      })
    }
  }

  return tiles
}
