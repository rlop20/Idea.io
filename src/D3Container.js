/*
Author: Robert Lopez (robertlopezhome@gmail.com)
This component renders and manipulates the tree.

TODO:

- When a new node is added, do NOT re-render the tree. Needs fixing ASAP.
- 
*/
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import initialData from './data.json'; 

const D3Component = () => {
  const d3Container = useRef(null);
  let i = 0;

  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (d3Container.current) {
      d3.select(d3Container.current).selectAll("*").remove();

      const svg = d3.select(d3Container.current)
        .attr('width', 960)
        .attr('height', 500)
        .append('g')
        .attr('transform', 'translate(120,20)');

      const root = d3.hierarchy(data); 
      root.x0 = 250;
      root.y0 = 0;

      const treeLayout = d3.tree().size([500, 800]);

      update(root);

      /*
      Update the tree from the root node. Do this in the beginning only or on a refresh.
      */
      function update(source) {
        const treeData = treeLayout(root);
        const nodes = treeData.descendants();
        const links = treeData.links();

        nodes.forEach(d => d.y = d.depth * 180);

        const node = svg.selectAll('g.node')
          .data(nodes, d => d.id || (d.id = ++i));

        const nodeEnter = node.enter().append('g')
          .attr('class', 'node')
          .attr('transform', d => `translate(${source.y0},${source.x0})`);

        nodeEnter.append('circle')
          .attr('class', 'node')
          .attr('r', 10)
          .attr('fill', d => d._children ? "lightsteelblue" : "#fff")
          .attr('stroke', d => d._children ? "steelblue" : "lightsteelblue")
          .on('click', (event, d) => {
            toggle(d);
            update(d);
          });

        nodeEnter.append('text')
          .attr('d', '.35em') // this moves the text around. 'dy' is another option.
          .attr('x', d => d.children || d._children ? -13 : 13)
          .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
          .text(d => d.data.name)
          .attr('cursor', 'pointer')
          .on('click', (event, d) => {
            event.stopPropagation();
            editText(d, event.target);
          });

        // Add the '+' sign for each node to allow adding children
        nodeEnter.append('text')
          .attr('y', 30)
          .attr('text-anchor', 'middle')
          .attr('font-size', '24px')
          .attr('cursor', 'pointer')
          .text('+')
          .on('click', (event, d) => {
            event.stopPropagation();
            addChildNode(d);  // Pass the clicked node to addChildNode
          });

        const nodeUpdate = nodeEnter.merge(node);
        nodeUpdate.transition().duration(750)
          .attr('transform', d => `translate(${d.y},${d.x})`);

        const nodeExit = node.exit().transition().duration(750)
          .attr('transform', d => `translate(${source.y},${source.x})`)
          .remove();

        const link = svg.selectAll('path.link')
          .data(links, d => d.target.id);

        const linkEnter = link.enter().insert('path', 'g')
          .attr('class', 'link')
          .attr('d', d => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal(o, o);
          })
          .style('fill', 'none')
          .style('stroke', '#ccc')
          .style('stroke-width', '2px');

        link.merge(linkEnter).transition().duration(750)
          .attr('d', d => diagonal(d.source, d.target));

        link.exit().transition().duration(750)
          .attr('d', d => {
            const o = { x: source.x, y: source.y };
            return diagonal(o, o);
          })
          .remove();

        nodes.forEach(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });

        function diagonal(s, d) {
          return `M${s.y},${s.x}
                  C${(s.y + d.y) / 2},${s.x}
                  ${(s.y + d.y) / 2},${d.x}
                  ${d.y},${d.x}`;
        }
      }

      function toggle(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
      }

      function editText(d, textElement) {
        const bbox = textElement.getBBox();
        const parent = d3.select(textElement.parentNode);

        const input = parent.append('foreignObject')
          .attr('x', bbox.x - 3)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 6)
          .attr('height', bbox.height + 6)
          .append('xhtml:input')
          .attr('style', `width: ${bbox.width + 6}px;`)
          .attr('value', d.data.name)
          .on('blur', function () {
            const newValue = this.value;
            d.data.name = newValue;
            parent.select('text').text(newValue);
            parent.select('foreignObject').remove();
          })
          .on('keydown', function (event) {
            if (event.key === 'Enter') {
              this.blur();
            }
          });

        input.node().focus();
      }

      // Updated addChildNode to target the correct node
      function addChildNode(parentNode) {
        if (!parentNode.data.children) {
          parentNode.data.children = [];
        }

        const newTaskNumber = parentNode.data.children.length + 1;
        const newNode = {
          name: `Edit Task ${newTaskNumber}`,
        };

        parentNode.data.children.push(newNode);

        setData({ ...data });
        update(parentNode);  // Update only the parent node and its children
      }
    }
  }, [data]);

  return (
    <div>
      <h1>idea.io</h1>
      <h3>Click on Text to edit</h3>
      <h3>Click on circles to expand/contract</h3>
      <h3>Click on + sign to add more tasks</h3>
      <svg ref={d3Container}></svg>
    </div>
  );
};

export default D3Component;
