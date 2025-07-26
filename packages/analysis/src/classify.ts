import type { SvgAst, SvgAnalysisResult, NodeCount, SvgFlag } from '@motif/schema';

/**
 * Classifies an SVG AST to determine its structure and features
 */
export function classifySvg(ast: SvgAst): SvgAnalysisResult['metadata'] {
  const nodeCount: NodeCount = {
    path: 0,
    g: 0
  };
  
  const flags: SvgFlag[] = [];
  let hasStrokeElements = false;
  let hasGroups = false;
  
  // Recursive node counter
  function countNodes(node: SvgAst) {
    if (node.type === 'element') {
      const tag = node.tagName;
      if (tag) {
        nodeCount[tag] = (nodeCount[tag] || 0) + 1;
      }
      
      // Check for stroke-based elements
      if (node.properties) {
        const hasStroke = node.properties.stroke && node.properties.stroke !== 'none';
        const hasFill = node.properties.fill && node.properties.fill !== 'none';
        
        if (hasStroke && !hasFill) {
          hasStrokeElements = true;
        }
      }
      
      if (tag === 'g') {
        hasGroups = true;
      }
      
      // Recurse into children
      if (node.children) {
        node.children.forEach(countNodes);
      }
    }
  }
  
  countNodes(ast);
  
  // Determine classification
  const totalElements = Object.values(nodeCount).reduce((sum, count) => sum + count, 0);
  const isStructured = hasGroups && nodeCount.g >= 1;
  const classification = isStructured ? 'structured' : 'flattened';
  
  // Set flags
  if (classification === 'flattened') {
    flags.push('isFlattened');
  }
  if (classification === 'structured') {
    flags.push('isStructured');
  }
  if (hasStrokeElements) {
    flags.push('isStrokeBased');
  }
  
  return {
    classification,
    flags,
    nodeCount
  };
} 