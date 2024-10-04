import * as d3 from 'd3';
import { toggleNode, createDiagonalPath } from './TreeUtility';
import { editNodeText } from './NodeEditor';

export class TreeRenderer {
  constructor(container, data, setData) {
    this.container = container;
    this.data = data;
    this.setData = setData;
    this.i = 0;

    // Bind methods to ensure they retain the correct context
    this.initializeTree = this.initializeTree.bind(this);
    this.update = this.update.bind(this);
    this.addChildNode = this.addChildNode.bind(this);
    this.deleteNode = this.deleteNode.bind(this);
    this.setSelectedNode = this.setSelectedNode.bind(this);

    this.initializeTree();
  }

  initializeTree() {
    d3.select(this.container).selectAll("*").remove();

    this.svg = d3.select(this.container)
      .attr('width', 960)
      .attr('height', 500)
      .append('g')
      .attr('transform', 'translate(120,20)');

    this.root = d3.hierarchy(this.data);
    this.root.x0 = 250;
    this.root.y0 = 0;

    this.treeLayout = d3.tree().size([500, 800]);

    this.update(this.root);
  }

  update(source) {
    const treeData = this.treeLayout(this.root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    nodes.forEach(d => d.y = d.depth * 180);

    const node = this.svg.selectAll('g.node')
      .data(nodes, d => d.id || (d.id = ++this.i));

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${source.y0},${source.x0})`)
      .on('click', (event, d) => {
        event.stopPropagation();
        this.setSelectedNode(d); // Set selected node on single-click
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        toggleNode(d); // Toggle children on double-click
        this.update(d);
      });

    // Add circle for each node
    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 10)
      .attr('fill', d => d === this.selectedNode ? "#89CFF0" : (d._children ? "lightsteelblue" : "#fff"))
      .attr('stroke', d => d._children ? "steelblue" : "lightsteelblue");

// Add foreignObject for dynamic text rendering
nodeEnter.append('foreignObject')
  .attr('x', -75)
  .attr('y', 15)
  .attr('width', 150)
  .attr('height', 100)
  .append('xhtml:div')
  .attr('class', 'node-text-box')
  .style('overflow', 'auto')
  .style('height', '100%')
  .style('width', '100%')
  .style('font-size', '12px')
  .style('color', 'black')
  .text(d => d.data.name)
  .on('click', (event, d) => {
    event.stopPropagation();
    editNodeText(d, event.target); // Enable editing on text click
  });


    const nodeUpdate = nodeEnter.merge(node);

    // Update nodes to reflect correct color and position
    nodeUpdate.transition().duration(750)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle')
      .attr('fill', d => d === this.selectedNode ? "#89CFF0" : (d._children ? "lightsteelblue" : "#fff"));

    node.exit().transition().duration(750)
      .attr('transform', d => `translate(${source.y},${source.x})`)
      .remove();

    const link = this.svg.selectAll('path.link')
      .data(links, d => d.target.id);

    const linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', d => {
        const o = { x: source.x0, y: source.y0 };
        return createDiagonalPath(o, o);
      })
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', '2px');

    link.merge(linkEnter).transition().duration(750)
      .attr('d', d => createDiagonalPath(d.source, d.target));

    link.exit().transition().duration(750)
      .attr('d', d => {
        const o = { x: source.x, y: source.y };
        return createDiagonalPath(o, o);
      })
      .remove();

    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  addChildNode() {
    if (!this.selectedNode) {
      console.error("No node selected to add a child to.");
      return;
    }

    const parentNode = this.selectedNode;

    if (!parentNode.data.children) {
      parentNode.data.children = [];
    }

    const newTaskNumber = parentNode.data.children.length + 1;
    const newNode = {
      name: `Edit Task ${newTaskNumber}`,
    };

    parentNode.data.children.push(newNode);
    this.setData({ ...this.data });
    this.update(parentNode);
  }

  deleteNode() {
    if (!this.selectedNode) {
      console.error("No node selected to delete.");
      return;
    }

    const nodeToDelete = this.selectedNode;
    const parent = nodeToDelete.parent;

    if (parent) {
      parent.data.children = parent.data.children.filter(child => child !== nodeToDelete.data);
    } else {
      console.error("Cannot delete the root node.");
      return;
    }

    this.setSelectedNode(null); // Clear the selected node reference
    this.setData({ ...this.data });
    this.update(this.root);
  }

  setSelectedNode(node) {
    this.selectedNode = node;
    this.update(this.root); // Update the tree to reflect the selected node visually
  }
}
