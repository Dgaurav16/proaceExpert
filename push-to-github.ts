import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;
  if (!xReplitToken) throw new Error('Token not found');
  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);
  return connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
}

const SKIP = new Set(['node_modules', '.git', 'dist', '.cache', '.config', '.local', '.upm', '.npm', '.nix-profile', 'backups', 'attached_assets', '.replit', 'replit.nix', '.replit.nix']);
const SKIP_EXT = new Set(['.zip']);

function getAllFiles(dir: string, base: string = ''): { path: string; fullPath: string }[] {
  const results: { path: string; fullPath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (SKIP.has(entry.name)) continue;
    if (SKIP_EXT.has(path.extname(entry.name))) continue;
    if (entry.isDirectory()) {
      results.push(...getAllFiles(path.join(dir, entry.name), relPath));
    } else {
      results.push({ path: relPath, fullPath: path.join(dir, entry.name) });
    }
  }
  return results;
}

async function main() {
  const token = await getAccessToken();
  const octokit = new Octokit({ auth: token });
  const owner = 'Dgaurav16';
  const repo = 'proaceExpert';

  // Check if repo exists, create if not
  try {
    await octokit.repos.get({ owner, repo });
    console.log('Repository exists');
  } catch {
    console.log('Creating repository...');
    await octokit.repos.createForAuthenticatedUser({
      name: repo,
      private: true,
      description: 'CricProAce - Cricket Prediction Platform (Backup)',
      auto_init: false
    });
    console.log('Repository created');
  }

  const projectDir = '/home/runner/workspace';
  const files = getAllFiles(projectDir);
  console.log(`Found ${files.length} files to push`);

  // Create blobs for all files
  const treeItems: any[] = [];
  let count = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.fullPath);
      const isBinary = content.some((byte: number) => byte === 0);
      
      let blob;
      if (isBinary) {
        blob = await octokit.git.createBlob({
          owner, repo,
          content: content.toString('base64'),
          encoding: 'base64'
        });
      } else {
        blob = await octokit.git.createBlob({
          owner, repo,
          content: content.toString('utf-8'),
          encoding: 'utf-8'
        });
      }

      treeItems.push({
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.data.sha
      });
      count++;
      if (count % 20 === 0) console.log(`Uploaded ${count}/${files.length} files...`);
    } catch (err: any) {
      console.error(`Error uploading ${file.path}: ${err.message}`);
    }
  }

  console.log(`All ${count} files uploaded. Creating tree...`);

  // Create tree
  const tree = await octokit.git.createTree({
    owner, repo,
    tree: treeItems
  });

  // Try to get existing ref for parent commit
  let parentSha: string | undefined;
  try {
    const ref = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
    parentSha = ref.data.object.sha;
  } catch {
    // No existing commits
  }

  // Create commit
  const commitData: any = {
    owner, repo,
    message: `CricProAce - Complete source code backup (Feb 2026)\n\nIncludes:\n- Full React frontend with TypeScript\n- Express.js backend\n- PostgreSQL schema (Drizzle ORM)\n- WordPress embedding support\n- Installation guide`,
    tree: tree.data.sha,
  };
  if (parentSha) commitData.parents = [parentSha];

  const commit = await octokit.git.createCommit(commitData);

  // Update or create ref
  try {
    await octokit.git.updateRef({
      owner, repo,
      ref: 'heads/main',
      sha: commit.data.sha,
      force: true
    });
  } catch {
    await octokit.git.createRef({
      owner, repo,
      ref: 'refs/heads/main',
      sha: commit.data.sha
    });
  }

  console.log(`\nDone! Code pushed to https://github.com/${owner}/${repo}`);
}

main().catch(err => console.error('Fatal error:', err.message));
