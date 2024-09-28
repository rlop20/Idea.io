import * as d3 from 'd3';

export const editNodeText = (d, textElement) => {
  const bbox = textElement.getBBox();
  const parent = d3.select(textElement.parentNode);

  const input = parent.append('foreignObject')
    .attr('x', bbox.x - 3)
    .attr('y', bbox.y - 3)
    .attr('width', bbox.width + 16)
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
};
