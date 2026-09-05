import { realpath, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { spawn } from 'node:child_process';

const forbiddenGitEnvironment = [
  'GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE',
  'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_CEILING_DIRECTORIES', 'GIT_DISCOVERY_ACROSS_FILESYSTEM'
];

export const command = (file, args, options = {}) => new Promise((resolveCommand, rejectCommand) => {
  const child = spawn(file, args, { ...options, shell: false });
  let stdout = ''; let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', rejectCommand);
  child.on('close', (code, signal) => resolveCommand({ code, signal, stdout: stdout.trim(), stderr: stderr.trim() }));
});

export const safeEnvironment = (candidate) => {
  const env = { ...process.env, CANDIDATE_ROOT: candidate };
  for (const key of forbiddenGitEnvironment) delete env[key];
  delete env.NODE_PATH;
  return env;
};

const inside = (path, ancestor) => {
  const rel = relative(ancestor, path);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !resolve(path).startsWith('..'));
};

export async function preflight(candidate, expectedHead, expectedTree, protectedRepositoryRoot) {
  const root = await realpath(candidate);
  const env = safeEnvironment(root);
  const runGit = async (args) => {
    const result = await command('git', ['-C', root, ...args], { env });
    if (result.code !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
    return result.stdout;
  };
  const top = await realpath(await runGit(['rev-parse', '--show-toplevel']));
  const gitDir = await realpath(resolve(root, await runGit(['rev-parse', '--git-dir'])));
  const commonDir = await realpath(resolve(root, await runGit(['rev-parse', '--git-common-dir'])));
  const head = await runGit(['rev-parse', 'HEAD']);
  const tree = await runGit(['rev-parse', 'HEAD^{tree}']);
  const status = await runGit(['status', '--porcelain=v1', '--untracked-files=all']);
  const remotes = await runGit(['remote']);
  const checks = {
    topLevelMatchesCandidate: top === root,
    gitDirMatchesCandidate: gitDir === resolve(root, '.git'),
    commonDirMatchesCandidate: commonDir === resolve(root, '.git'),
    pathsOutsideParentRepo: !inside(root, protectedRepositoryRoot) && !inside(gitDir, protectedRepositoryRoot) && !inside(commonDir, protectedRepositoryRoot),
    expectedHead: head === expectedHead,
    expectedTree: tree === expectedTree,
    clean: status === '',
    noRemote: remotes === '',
    forbiddenGitEnvironmentAbsent: forbiddenGitEnvironment.every((key) => !(key in env))
  };
  const pass = Object.values(checks).every(Boolean);
  return { pass, root, top, gitDir, commonDir, head, tree, status, remotes, checks, environment: Object.fromEntries(forbiddenGitEnvironment.map((key) => [key, null])) };
}

export async function writeRuntimeVerifier(candidate, expectedHead, expectedTree) {
  const verifier = `import { execFileSync } from 'node:child_process';\nimport { realpathSync } from 'node:fs';\nimport { resolve } from 'node:path';\nconst root = realpathSync(process.cwd());\nconst git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();\nconst expectedRoot = realpathSync(process.env.CANDIDATE_ROOT);\nconst absolute = (value) => realpathSync(resolve(root, value));\nconst result = { cwd: root, expectedRoot, top: realpathSync(git('rev-parse', '--show-toplevel')), gitDir: absolute(git('rev-parse', '--git-dir')), commonDir: absolute(git('rev-parse', '--git-common-dir')), head: git('rev-parse', 'HEAD'), tree: git('rev-parse', 'HEAD^{tree}') };\nresult.pass = result.cwd === expectedRoot && result.top === expectedRoot && result.gitDir === resolve(expectedRoot, '.git') && result.commonDir === resolve(expectedRoot, '.git') && result.head === '${expectedHead}' && result.tree === '${expectedTree}';\nconsole.log(JSON.stringify(result));\nprocess.exitCode = result.pass ? 0 : 1;\n`;
  await writeFile(resolve(candidate, 'verify-isolation.mjs'), verifier);
}

export async function readRuntimeVerifier(candidate, env) {
  const result = await command('node', ['verify-isolation.mjs'], { cwd: candidate, env });
  if (result.code !== 0) throw new Error(`candidate runtime isolation failed: ${result.stdout || result.stderr}`);
  return JSON.parse(result.stdout);
}

export async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}
