function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1)
    .fill()
    .map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function normalizePath(path) {
  const parts = path.split("/");
  return parts
    .map((part) => {
      if (/^[A-Z]{3}-[A-Z0-9]{4}-[A-Z]{3}$/i.test(part)) {
        return part.toUpperCase();
      }
      return part.toLowerCase().replace(/[^a-z0-9]/g, "");
    })
    .join("/");
}

function adjustDistance(requestPath, availablePath, baseDistance) {
  let distance = baseDistance;
  const reqEndpoint = requestPath.split("/").pop();
  const availEndpoint = availablePath.split("/").pop();

  if (reqEndpoint.endsWith("s") && availEndpoint === reqEndpoint.slice(0, -1)) {
    distance -= 0.5;
  }
  if (
    reqEndpoint.match(/(.)\1/) &&
    availEndpoint === reqEndpoint.replace(/(.)\1/g, "$1")
  ) {
    distance -= 0.5;
  }

  const reqParts = requestPath.split("/");
  const availParts = availablePath.split("/");
  const commonLength = Math.min(reqParts.length, availParts.length);
  let exactMatchCount = 0;

  for (let i = 0; i < commonLength - 1; i++) {
    if (reqParts[i] === availParts[i]) {
      exactMatchCount++;
      if (/^[A-Z]{3}-[A-Z0-9]{4}-[A-Z]{3}$/i.test(reqParts[i])) {
        exactMatchCount += 2;
      }
    }
  }

  if (exactMatchCount > 0) {
    distance -= 0.5 * exactMatchCount;
  }

  return distance;
}

function findClosestPath(requestPath, availablePaths) {
  const normalizedRequestPath = requestPath;
  let closestPath = null;
  let minDistance = Infinity;

  for (const path of availablePaths) {
    const normalizedPath = path.replace(
      ":serial",
      requestPath.split("/")[1] || ":serial"
    );

    const distance = levenshteinDistance(normalizedRequestPath, normalizedPath);
    const adjustedDistance = adjustDistance(requestPath, path, distance);

    if (
      normalizedPath.split("/").length === requestPath.split("/").length &&
      adjustedDistance < minDistance
    ) {
      minDistance = adjustedDistance;
      closestPath = path;
    }
  }

  return minDistance < 2
    ? closestPath.replace(":serial", requestPath.split("/")[1])
    : null;
}

module.exports = { findClosestPath };
