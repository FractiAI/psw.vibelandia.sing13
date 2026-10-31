/**
 * Recursive Tree — hierarchical information / context / operations / nested data.
 * Implemented as an explicit nested node tree (not a silent rewrite of a flat dict).
 */
export function createTreeNode(id, value = null, children = []) {
  return { id, value, children: [...children], meta: {} };
}

export function insertChild(parent, child) {
  parent.children.push(child);
  return parent;
}

export function buildRecursiveTree(rootId, layers) {
  const root = createTreeNode(rootId, { layer: 0 });
  let frontier = [root];
  for (let depth = 1; depth <= layers.length; depth++) {
    const layer = layers[depth - 1];
    const next = [];
    for (const parent of frontier) {
      for (const item of layer) {
        const id = `${parent.id}/${item.id ?? item}`;
        const node = createTreeNode(id, typeof item === 'object' ? item : { label: item, layer: depth });
        insertChild(parent, node);
        next.push(node);
      }
    }
    frontier = next;
  }
  return root;
}

export function walkTree(node, visit, depth = 0) {
  visit(node, depth);
  for (const c of node.children) walkTree(c, visit, depth + 1);
}

export function flattenLeaves(node, out = []) {
  if (!node.children.length) out.push(node);
  else for (const c of node.children) flattenLeaves(c, out);
  return out;
}

export function treeNodeCount(node) {
  let n = 0;
  walkTree(node, () => {
    n += 1;
  });
  return n;
}
