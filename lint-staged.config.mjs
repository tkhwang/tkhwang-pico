import path from "node:path";

const WORKSPACES = [
  {
    dir: "apps/web",
    extensions: ["js", "jsx", "ts", "tsx"],
  },
  {
    dir: "apps/mobile-queue",
    extensions: ["js", "jsx", "ts", "tsx"],
  },
  {
    dir: "apps/mastra",
    extensions: ["js", "ts"],
  },
  {
    dir: "apps/nest",
    extensions: ["js", "ts"],
  },
  {
    dir: "apps/langchain",
    extensions: ["js", "ts"],
  },
];

const quote = (filePath) => `"${filePath.replace(/(["\\`$])/g, "\\$1")}"`;

const ROOT_DIR = process.cwd();

const makeCommand = (dir, files) => {
  const configPath = quote(path.resolve(ROOT_DIR, dir, "eslint.config.mjs"));
  const fileArgs = files.map(quote).join(" ");
  return `node --no-warnings ./node_modules/.bin/eslint --config ${configPath} --max-warnings=0 --fix ${fileArgs}`;
};

const workspaceConfigEntries = WORKSPACES.map(({ dir, extensions }) => {
  const absoluteDir = path.resolve(ROOT_DIR, dir);
  const pattern = `**/${dir}/**/*.{${extensions.join(",")}}`;

  return [
    pattern,
    (files) => {
      const rootRelativeFiles = files
        .map((file) => path.resolve(ROOT_DIR, file))
        .filter(
          (absoluteFile) =>
            absoluteFile && absoluteFile.startsWith(`${absoluteDir}${path.sep}`)
        )
        .map((absoluteFile) => path.relative(ROOT_DIR, absoluteFile));

      if (rootRelativeFiles.length === 0) return [];

      return [makeCommand(dir, rootRelativeFiles)];
    },
  ];
});

export default Object.fromEntries(workspaceConfigEntries);
