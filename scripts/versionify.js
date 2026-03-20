import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function updateVersion(newVersion) {
  const targets = [
    path.resolve(__dirname, "../package.json"),
    path.resolve(__dirname, "../deno.json"),
  ];

  for (const filePath of targets) {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);

    const oldVersion = data.version;
    data.version = newVersion;

    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n");

    console.log(
      `   Success: ${path.basename(filePath)} (${oldVersion} -> ${newVersion})`,
    );
  }
  await fs.writeFile(
    path.resolve(__dirname, "../src/version.ts"),
    `export const v = "${newVersion}";\n`,
  );
}

updateVersion("0.0.0-alpha." + Math.floor((Date.now() - 17672256e5) / 1e3));
