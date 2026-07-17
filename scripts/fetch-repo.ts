/**
 * Shallow-clone or update kamyu104/LeetCode-Solutions into data/raw.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { RAW, DATA } from "./paths";

const REPO = "https://github.com/kamyu104/LeetCode-Solutions.git";

function main() {
  const parent = path.dirname(RAW);
  fs.mkdirSync(parent, { recursive: true });

  if (fs.existsSync(path.join(RAW, ".git"))) {
    console.log("Updating existing clone…");
    execSync("git fetch --depth 1 origin master && git reset --hard origin/master", {
      cwd: RAW,
      stdio: "inherit",
    });
  } else {
    if (fs.existsSync(RAW)) {
      fs.rmSync(RAW, { recursive: true, force: true });
    }
    console.log("Shallow cloning LeetCode-Solutions…");
    execSync(`git clone --depth 1 --single-branch --branch master ${REPO} "${RAW}"`, {
      stdio: "inherit",
    });
  }

  // Marker for pipeline freshness
  fs.writeFileSync(
    path.join(DATA, "raw", "fetch-meta.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), repo: REPO }, null, 2)
  );
  console.log("Fetch complete:", RAW);
}

main();
