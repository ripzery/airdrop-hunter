import fs from 'fs'

export function saveToFile(json: object, outputPath: string) {
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2))
}
