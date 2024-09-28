import * as d3 from 'd3';
import { toggleNode, createDiagonalPath } from './TreeUtility';
import { editNodeText } from './NodeEditor';

export class TreeRenderer {
  constructor(container, data, setData) {
    this.container = container;
    this.data = data;
    this.setData = setData;
    this.i = 0;
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
      .attr('transform', d => `translate(${source.y0},${source.x0})`);

    // Add circle for each node
    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 10)
      .attr('fill', d => d._children ? "lightsteelblue" : "#fff")
      .attr('stroke', d => d._children ? "steelblue" : "lightsteelblue")
      .on('click', (event, d) => {
        toggleNode(d);
        this.update(d);
      });

    // Add text for each node
    nodeEnter.append('text')
      .attr('d', '.35em')
      .attr('x', d => d.children || d._children ? -13 : 13)
      .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
      .text(d => d.data.name)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        editNodeText(d, event.target);
      });

    // Add "+" sign to add child nodes
    nodeEnter.append('text')
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .attr('cursor', 'pointer')
      .text('+')
      .on('click', (event, d) => {
        event.stopPropagation();
        this.addChildNode(d);
      });

    // Add "x" sign to delete the node
    nodeEnter.append('text')
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('cursor', 'pointer')
      .text('x')
      .on('click', (event, d) => {
        event.stopPropagation();
        this.deleteNode(d);
      });

    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate.transition().duration(750)
      .attr('transform', d => `translate(${d.y},${d.x})`);

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

  addChildNode(parentNode) {
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

  deleteNode(nodeToDelete) {
    // Find and remove the node from its parent's children array
    const parent = nodeToDelete.parent;
    if (parent) {
      parent.data.children = parent.data.children.filter(child => child !== nodeToDelete.data);
    } else {
      // If the node to delete is the root, do nothing or handle accordingly
      console.error("Cannot delete the root node.");
      return;
    }

    // Update the data and visualize the changes
    this.setData({ ...this.data });
    this.update(parent);
  }
}
