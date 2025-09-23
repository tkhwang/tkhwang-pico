import path from 'node:path';

const WORKSPACES = [
  {
    dir: 'apps/web',
    workspace: '@tkhwang-pico/web',
    extensions: ['js', 'jsx', 'ts', 'tsx'],
  },
  {
    dir: 'apps/mobile-queue',
    workspace: '@tkhwang-pico/mobile-queue',
    extensions: ['js', 'jsx', 'ts', 'tsx'],
  },
  {
    dir: 'apps/mastra',
    workspace: '@tkhwang-pico/mastra',
    extensions: ['js', 'ts'],
  },
  {
    dir: 'apps/nest',
    workspace: 'nest',
    extensions: ['js', 'ts'],
  },
  {
    dir: 'apps/langchain',
    workspace: '@tkhwang-pico/langchain',
    extensions: ['js', 'ts'],
  },
];

const quote = (filePath) => `"${filePath.replace(/(["\\`$])/g, '\\$1')}"`;

const makeCommand = (workspace, files) => {
  const fileArgs = files.map(quote).join(' ');
  return `yarn workspace ${workspace} exec eslint --max-warnings=0 --fix ${fileArgs}`;
};

const workspaceConfigEntries = WORKSPACES.map(({ dir, workspace, extensions }) => {
  const absoluteDir = path.resolve(process.cwd(), dir);
  const pattern = `${dir}/**/*.{${extensions.join(',')}}`;

  return [pattern, (files) => {
    const relativeFiles = files
      .map((file) => path.relative(absoluteDir, path.resolve(process.cwd(), file)))
      .filter((relativePath) => relativePath && !relativePath.startsWith('..'));

    if (relativeFiles.length === 0) {
      return [];
    }

    return [makeCommand(workspace, relativeFiles)];
  }];
});

export default Object.fromEntries(workspaceConfigEntries);
