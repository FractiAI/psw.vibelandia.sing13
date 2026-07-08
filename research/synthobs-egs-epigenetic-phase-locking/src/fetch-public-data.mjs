import { GTEX_DATASET_ID, ENCODE_TARGET } from "./constants.mjs";

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function fetchText(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

export async function fetchGTExReferenceBySymbol(symbol) {
  const url = `https://gtexportal.org/api/v2/reference/gene?geneId=${encodeURIComponent(symbol)}`;
  const payload = await fetchJson(url);
  const row = (payload.data || [])[0];
  if (!row) {
    throw new Error(`No GTEx reference record for ${symbol}`);
  }
  return row;
}

export async function fetchGTExMedianExpression(gencodeId) {
  const url =
    `https://gtexportal.org/api/v2/expression/medianGeneExpression?datasetId=${encodeURIComponent(GTEX_DATASET_ID)}` +
    `&gencodeId=${encodeURIComponent(gencodeId)}`;
  const payload = await fetchJson(url);
  return payload.data || [];
}

export async function searchEncodePancreasAtacExperiments(limit = 5) {
  const query =
    "https://www.encodeproject.org/search/" +
    `?type=Experiment&assay_title=${encodeURIComponent(ENCODE_TARGET.assay)}` +
    `&biosample_ontology.term_name=${encodeURIComponent(ENCODE_TARGET.tissue)}` +
    `&status=released&limit=${limit}&format=json`;
  const payload = await fetchJson(query, { headers: { accept: "application/json" } });
  return payload["@graph"] || [];
}

export async function fetchEncodeExperiment(accession) {
  const url = `https://www.encodeproject.org/experiments/${encodeURIComponent(accession)}/?format=json`;
  try {
    return await fetchJson(url, { headers: { accept: "application/json" } });
  } catch (err) {
    return null;
  }
}

export async function fetchEncodeBedFile(fileHref) {
  const url = `https://www.encodeproject.org${fileHref}`;
  return fetchText(url, { headers: { accept: "text/plain" } });
}
