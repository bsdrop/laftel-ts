const allowUnknown = true;
const UA = "Not Googlebot";

async function write(data) {
  const path = new URL("../src/types/constants.ts", import.meta.url);
  // if (typeof Deno !== "undefined") return await Deno.writeTextFile(path, data);

  const fs = await import("node:fs/promises"); // Bun, Deno 기준 됨
  return await fs.writeFile(path, data);
}

function toUnionType(name, arr) {
  if (!arr) {
    console.error(name, arr, "UB 발생. 개발자에게 로그 보고바람.");
    return `export type ${name} = string`;
  }

  const chunks = [];
  for (let i = 0; i < arr.length; i += 3) {
    const slice = arr.slice(i, i + 3);
    chunks.push(slice.map((v) => JSON.stringify(v)).join(" | "));
  }

  return `export type ${name} = ${allowUnknown ? "(string | {})" : ""}\n  | ${chunks.join("\n  | ")};\n\n`;
}

let file = "";

async function f1() {
  let res =
    (await (
      await fetch("https://api.laftel.net/api/v1.0/info/discover/", {
        headers: { "User-Agent": UA },
      })
    ).json()) || {};
  console.debug(res);

  file += toUnionType("Genre", res.genres);
  file += toUnionType("Brand", res.brands);
  file += toUnionType("Tag", res.tags);
  file += toUnionType("AnimeYear", res.years?.animation);
  file += toUnionType("Production", res.productions);
  return true;
}
async function f2() {
  let res =
    (await (
      await fetch("https://api.laftel.net/api/users/v1/banned_words/", {
        headers: { "User-Agent": UA },
      })
    ).json()) || {};
  console.debug(res);

  file += toUnionType("BannedWords", res.banned_word_list);
  return true;
}

try {
  await Promise.all([f1(), f2()]);
} catch (e) {
  console.error(e);
} finally {
  if (file) await write(file);
}
