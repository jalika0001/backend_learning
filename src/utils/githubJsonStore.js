const { Octokit } = require("@octokit/rest");

const normalize = (value) => (value || "").trim();

const getConfig = () => {
  const token = normalize(process.env.GITHUB_TOKEN);
  const owner = normalize(process.env.OWNER);
  const repo = normalize(process.env.REPO).replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "");

  if (!token || !owner || !repo) {
    throw new Error("Missing GitHub config: GITHUB_TOKEN, OWNER, REPO are required");
  }

  return { token, owner, repo };
};

const getOctokit = () => {
  const { token } = getConfig();
  return new Octokit({ auth: token });
};

const getFile = async (filePath) => {
  const { owner, repo } = getConfig();
  const octokit = getOctokit();

  return octokit.repos.getContent({
    owner,
    repo,
    path: filePath
  });
};

const getFileByPath = async (filePath) => {
  try {
    const { data } = await getFile(filePath);
    if (Array.isArray(data)) {
      return null;
    }

    return data;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
};

exports.readJsonFile = async (filePath, fallbackData = []) => {
  try {
    const { data } = await getFile(filePath);
    const encoded = Array.isArray(data) ? "" : data.content;

    if (!encoded) {
      return fallbackData;
    }

    const raw = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.status === 404) {
      return fallbackData;
    }

    throw error;
  }
};

exports.writeJsonFile = async (filePath, jsonData, message) => {
  const { owner, repo } = getConfig();
  const octokit = getOctokit();

  const content = Buffer.from(JSON.stringify(jsonData, null, 2)).toString("base64");

  let sha;
  try {
    const { data } = await getFile(filePath);
    sha = Array.isArray(data) ? undefined : data.sha;
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message,
    content,
    sha
  });
};

exports.ensureFile = async (filePath, contentString, message) => {
  const existing = await getFileByPath(filePath);
  if (existing) {
    return;
  }

  const content = Buffer.from(contentString, "utf-8").toString("base64");
  const { owner, repo } = getConfig();
  const octokit = getOctokit();

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message,
    content
  });
};

exports.uploadBufferFile = async (filePath, buffer, message) => {
  const { owner, repo } = getConfig();
  const octokit = getOctokit();
  const existing = await getFileByPath(filePath);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message,
    content: buffer.toString("base64"),
    sha: existing ? existing.sha : undefined
  });
};

exports.readFileBuffer = async (filePath) => {
  const data = await getFileByPath(filePath);

  if (!data) {
    return null;
  }

  return {
    buffer: Buffer.from(data.content, "base64"),
    sha: data.sha
  };
};

exports.deleteFile = async (filePath, message) => {
  const { owner, repo } = getConfig();
  const octokit = getOctokit();
  const existing = await getFileByPath(filePath);

  if (!existing) {
    return;
  }

  await octokit.repos.deleteFile({
    owner,
    repo,
    path: filePath,
    message,
    sha: existing.sha
  });
};

exports.ensureJsonFile = async (filePath, defaultData, message) => {
  try {
    await getFile(filePath);
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }

    await exports.writeJsonFile(filePath, defaultData, message);
  }
};