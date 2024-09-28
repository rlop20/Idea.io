export const toggleNode = (d) => {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  };
  
  export const createDiagonalPath = (s, d) => {
    return `M${s.y},${s.x}
            C${(s.y + d.y) / 2},${s.x}
            ${(s.y + d.y) / 2},${d.x}
            ${d.y},${d.x}`;
  };
  