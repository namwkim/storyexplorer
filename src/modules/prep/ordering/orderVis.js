import styles from './orderVis.css';
export default class OrderVis {
	constructor() {
			// default configuration
			this.width = 200;
			this.height = 0; // calculated programmatically
			this.margin = {
				top: 15,
				left: 15,
				right: 5,
				bottom: 5
			};
			this.radius = 8;
			this.xpadding = 130;
			this.ypadding = 26;
			this.arcInnerRadius = this.radius;
			this.arcOuterRadius = this.radius + 4;
			this.data = null;
			this.svg = null;
			console.log(styles);
			this.tip = d3.tip()
				.attr('class', styles.d3Tip + ' ' + styles.n)
				.offset([-10, 0])
				.html(function (d) {
					let content = '<table>';
					content += ('<tr><td><span style="color:#E03997">Narrative Order</span></td><td>&nbsp; ' + d.showOrder + '</td></tr>');
					content += ('<tr><td><span style="color:#00B5AD">Story Order</span></td><td>&nbsp; ' + d.storyOrder + '</td></tr>');
					content += ('<tr><td><span style="color:#F2711C">Dialogue Size</span></td><td>&nbsp; ' + d.dialogueSize + '</td></tr>');
					content += ('<tr><td><span style="color:#DB2828">Character Size</span></td><td>&nbsp; ' + d.charSize + '</td></tr>');
					content += '</table>';
					return content;

				});
		}
		// data format
		// - data.showOrders
		// - data.storyOrders
		// - data.dialogueSize
		// - data.charSize
	update(selection, data) {
		console.log('updating orderVis');
		let chart = this;
		if (!data) return;
		chart.data = data; // save data;
		// const width = chart.width - chart.margin.left - chart.margin.right;
		const height = data.length * chart.ypadding;
		chart.height = height + chart.margin.top + chart.margin.bottom;
		// const height = chart.height - chart.margin.top - chart.margin.bottom;
		//  Select the svg element
		let svg = selection.selectAll('svg').data([data]);
		//  Enter SVG
		let svgEnter = svg.enter().append('svg');
		let gEnter = svgEnter.append('g');
		// gEnter.append('g').attr('class', 'guides');
		// gEnter.append('g').attr('class', 'labels');

		let marks = gEnter.append('g').attr('class', 'marks');
		marks.append('g').attr('class', 'connectLines');
		marks.append('g').attr('class', 'showCircles');
		marks.append('g').attr('class', 'storyCircles');
		marks.append('g').attr('class', 'dialogueArcs');
		marks.append('g').attr('class', 'characterArcs');


		if (svg.empty()) {
			svg = svgEnter;
			svg.call(chart.tip);
		}
		chart.svg = svg;
		// Update SVG and its dimensions
		svg.attr('width', chart.width)
			.attr('height', chart.height);
		// Container group
		svg.select('g')
			.attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

		//* * circles, labels
		[{
			group: svg.select('.showCircles'),
			x: chart.radius,
			r: chart.radius,
			key: (d) => d.showOrder,
			// y: ys1,
			color: '#E03997'
		}, {
			group: svg.select('.storyCircles'),
			x: chart.xpadding,
			r: chart.radius,
			key: (d) => d.storyOrder,
			// y: ys2,
			color: '#00B5AD'
		}].forEach(param => {
			// console.log("existing scene elements")
			// console.log(marks.select('.showCircles'));
			const circles = param.group.selectAll('.circle')
				.data(chart.data, param.key);

			circles.exit().remove();

			circles.enter().append('svg:circle')
				.attr('class', 'circle')
				.attr('cx', param.x)
				.attr('cy', (d) => param.key(d) * chart.ypadding)
				.attr('fill', param.color)
				.attr('r', 0)
				.on('mouseover', function (d, i) {
					chart.onMouseOverCircle(d, i, this);
				})
				.on('mouseout', function (d, i) {
					chart.onMouseOutCircle(d, i, this);
				})
				.transition()
				.duration(500)
				.attr('r', param.r);

			circles.transition().duration(500)
				.attr('cx', param.x)
				.attr('cy', (d) => param.key(d) * chart.ypadding);
			//
			// const texts = param.group.selectAll('.label')
			// 	.data(chart.data, param.key);
			//
			// texts.exit().remove();
			//
			// texts.enter().append('svg:text')
			// 	.attr('class', 'label')
			// 	.attr('text-anchor', 'middle')
			// 	.attr('dominant-baseline', 'central')
			// 	.attr('font-size', '9px')
			// 	.attr('fill', 'white')
			// 	.style('pointer-events', 'none')
			// 	.attr('font-family', 'sans-serif')
			// 	.attr('x', param.x)
			// 	.attr('y', (d) => param.key(d) * chart.ypadding)
			// 	.text(d => param.key(d));
			//
			// texts.attr('x', param.x)
			// 	.attr('y', (d) => param.key(d) * chart.ypadding)
			// 	.text(d => param.key(d));
		});
		//* * characters
		[{
			group: svg.select('.characterArcs'),
			key: (d) => d.charSize,
			x: chart.xpadding,
			arcInnerRadius: chart.arcInnerRadius,
			arcOuterRadius: chart.arcOuterRadius,
			dir: -1, // right
			color: '#DB2828'
		}, {
			group: svg.select('.dialogueArcs'),
			key: (d) => d.dialogueSize,
			x: chart.xpadding,
			arcInnerRadius: chart.arcInnerRadius,
			arcOuterRadius: chart.arcOuterRadius,
			dir: 1, // left
			color: '#F2711C'
		}].forEach(param => {
			const arc = d3.arc()
				.innerRadius(param.arcInnerRadius)
				.outerRadius(param.arcOuterRadius)
				.startAngle(0);
			const as = d3.scaleLinear()
				.range([0, param.dir * Math.PI])
				.domain(d3.extent(chart.data, param.key)); // scale swapped
			const arcs = param.group
				.selectAll('.arc')
				.data(data);

			arcs.exit().remove();

			arcs.enter().append('path')
				.attr('class', 'arc')
				.attr('transform', (d) => 'translate(' + param.x + ',' + d.storyOrder * chart.ypadding + ')')
				.attr('fill', param.color)
				.attr('d', () => arc.endAngle(0)())
				.transition()
				.duration(500)
				.attrTween('d', d => {
					const interp = d3.interpolate(0, as(param.key(d)));
					return (t) => arc.endAngle(interp(t))(); // interpolate end angle at t
				});

			arcs.transition()
				.duration(500)
				.attr('transform', (d) => 'translate(' + param.x + ',' + d.storyOrder * chart.ypadding + ')');

		});


		//* * connect lines
		const lines = svg.select('.connectLines')
			.selectAll('.connect-line')
			.data(data, d => d.showOrder + ',' + d.storyOrder);
		lines.exit().remove();

		const pathFunc = function pathFunc(d) {
			const x1 = chart.radius;
			const x2 = chart.xpadding;
			const y1 = d.showOrder * chart.ypadding;
			const y2 = d.storyOrder * chart.ypadding;
			const path = d3.path();
			path.moveTo(x1, y1);
			path.bezierCurveTo(
				x1 + (chart.xpadding / (2 * chart.radius)) * chart.radius, y1,
				x2 - (chart.xpadding / (2 * chart.radius)) * chart.radius, y2,
				x2, y2);
			// console.log(path.toString())
			return path.toString();
		};
		// console.log(lines)
		lines.enter().append('path')
			.attr('class', 'connect-line')
			.transition()
			.duration(500)
			.attr('d', pathFunc)
			.attr('stroke-width', 2)
			.attr('stroke', '#00B5AD')
			.attr('opacity', 0.5)
			.attr('fill', 'none');

		lines.transition().duration(500).attr('d', pathFunc);
	}
	onMouseOverCircle(d, i, elem) {
		this.highlightOn(d);
		this.tip.show.call(elem, d, i);

	}
	onMouseOutCircle(d, i, elem) {
		this.highlightOff(d);
		this.tip.hide.call(elem, d, i);
	}

	highlightOn(d) {
		// console.log(this.svg.empty());
		this.svg.select('.storyCircles').selectAll('.circle')
			.filter((v) => v.storyOrder == d.storyOrder)
			.transition()
			.duration(100)
			.attr('fill', '#FBBD08');
		this.svg.select('.showCircles').selectAll('.circle')
			.filter((v) => v.showOrder == d.showOrder)
			.transition()
			.duration(100)
			.attr('fill', '#FBBD08');
		this.svg.select('.connectLines').selectAll('.connect-line')
			.filter((v) => v.showOrder == d.showOrder)
			.transition()
			.duration(100)
			.attr('stroke', '#FBBD08');
	}
	highlightOff(d) {
		this.svg.select('.storyCircles').selectAll('.circle')
			.filter((v) => v.storyOrder == d.storyOrder)
			.transition()
			.duration(100)
			.attr('fill', '#00B5AD');
		this.svg.select('.showCircles').selectAll('.circle')
			.filter((v) => v.showOrder == d.showOrder)
			.transition()
			.duration(100)
			.attr('fill', '#E03997');
		this.svg.select('.connectLines').selectAll('.connect-line')
			.filter((v) => v.showOrder == d.showOrder)
			.transition()
			.duration(100)
			.attr('stroke', '#00B5AD');

	}

}
