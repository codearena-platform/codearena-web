/**
 * CodeArena Arena Schema Exporter
 * Translates visual Three.js grids and dropped modules into a
 * deterministic JSON schema for the Go Simulation Engine.
 */

export interface GridItem {
  id: string;
  type: "wall" | "heal" | "energy" | "hazard" | "spawn_point";
  position: { x: number; y: number; z: number }; // z is the depth/height
  rotation?: number;
  properties?: Record<string, any>;
}

export interface ArenaSettings {
  name: string;
  width: number;
  height: number;
  theme: string;
  gravity: number;
}

export interface ArenaSchema {
  version: string;
  settings: ArenaSettings;
  entities: GridItem[];
}

/**
 * Normalizes Three.js continuous coordinates to discrete Engine grid coordinates.
 * In the engine, typical grids are 1x1 unit blocks.
 */
function normalizeToGrid(val: number): number {
  return Math.round(val);
}

/**
 * Exports the current state of the 3D Studio to an Engine-readable JSON.
 * @param settings Overall arena configuration.
 * @param visualItems The objects currently placed in the WebGL scene.
 * @returns Serialized JSON string ready for download or API submission.
 */
export function exportToEngineSchema(
  settings: ArenaSettings,
  visualItems: GridItem[]
): string {
  
  // Normalize positions to exact integer grids to prevent floating point non-determinism in the backend engine.
  const mappedEntities = visualItems.map((item) => ({
    ...item,
    position: {
      x: normalizeToGrid(item.position.x),
      y: normalizeToGrid(item.position.y),
      z: normalizeToGrid(item.position.z),
    },
	// Ensure rotation is clamped to 90-degree intervals if building a grid-based arena
    rotation: item.rotation ? Math.round(item.rotation / 90) * 90 : 0
  }));

  const schema: ArenaSchema = {
    version: "1.0",
    settings: settings,
    entities: mappedEntities,
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Triggers a browser download of the generated schema.
 */
export function downloadArenaSchema(schemaJson: string, filename: string = "arena_custom.json") {
  const blob = new Blob([schemaJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
