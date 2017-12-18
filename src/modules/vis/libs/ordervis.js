import css from './ordervis.css';

const ONZOOM = 'zoom';
const ONMOUSEOVER = 'mouseover';
const ONMOUSEOUT = 'mouseout';
const ONMOUSECLICK = 'click';
const METADATA1 = 1;
const METADATA2 = 1;
const CHILDDATA = 1;

// private functions
let helper = {
	axisStyleUpdate: function(selection) {
		let xaxisContainer = selection.select('.x.axis');
		xaxisContainer.select('.domain')
			.classed(css.axisDomain, true);
		xaxisContainer.selectAll('.tick line')
			.classed(css.xaxisTickLine, true);
		xaxisContainer.selectAll('.tick text')
			.classed(css.axisText, true);

		let yaxisContainer = selection.select('.y.axis');
		yaxisContainer.select('.domain')
			.classed(css.axisDomain, true);
		yaxisContainer.selectAll('.tick line')
			.classed(css.yaxisInnerTickLine, true);
		yaxisContainer.selectAll('.tick text')
			.classed(css.axisText, true)
			.attr('dy', -4);
	}
};



export default class OrderVis {
	static get METADATA1() {
		return METADATA1;
	}
	static get METADATA2() {
		return METADATA2;
	}
	static get CHILDDATA() {
		return CHILDDATA;
	}
	constructor(selector) {
		this._container = selector ? d3.select(selector) : null;
		this._width = 800;
		this._height = 300;
		this._margin = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 10
		};
		this._duration = 400; // animation duration
		this._zoom = d3.zoom();

		this._xs = d3.scaleLinear();
		this._ys = d3.scaleLinear();
		this._cs = d3.scaleOrdinal()
			.range(['#00B5AD']);

		this._csm1 = d3.scaleOrdinal()
			.range(['#f2711c']);
		this._csm2 = d3.scaleOrdinal()
			.range(['#a333c8']);

		this._xaxis = d3.axisTop();
		this._yaxis = d3.axisLeft();
		this._xtitle = 'Narrative order →';
		this._ytitle = '← Story order';

		this._palette = ['#00B5AD'];

		this._listners = new Map();

		this._highlights = [];

		this._tip = d3.tip()
			.attr('class', css.d3Tip)
			.offset([0, 10])
			.direction('e')
			.html(this._tipFormat);
	}
	draw(data) {
		if (this._container.empty()) {
			return;
		}

		this._container.datum(data);

		// console.log('---------- OrderVis ----------');

		let width = this._width - this._margin.left - this._margin.right;
		let height = this._height - this._margin.top - this._margin.bottom;
		let xpadding = 80; //axes padding
		let ypadding = 40; //axes padding
		let markHeight = 8;

		// create root container
		let svg = this._container.select('svg');
		if (svg.empty()) { // init
			svg = this._container.append('svg');
			svg.append('g')
				.attr('class', 'visarea')
				.append('defs')
				.append('clipPath')
				.attr('id', 'clipID' + Date.now())
				.append('rect')
				.attr('x', xpadding)
				.attr('y', ypadding);
			// svg.append('defs')
			// 	.append('pattern')
			// 	.attr('id', 'crosshatch')
			// 	.attr('width', 8)
			// 	.attr('height', 8)
			// 	.attr('patternUnits', 'userSpaceOnUse')
			// 	.append('image')
			// 	.attr('xlink:href', 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><path fill="#fff" d="M0 0h8v8h-8z"/><path d="M0 0l8 8zm8 0l-8 8z" stroke-width=".5" stroke="#aaa"/></svg>')
			// 	.attr('vector-effect', 'non-scaling-stroke')
			// 	.attr('x', 0)
			// 	.attr('y', 0)
			// 	.attr('width', 8)
			// 	.attr('height', 8);



			svg.call(this._tip);

		}
		let g = svg.select('.visarea');
		// update vis size
		svg.attr('width', this._width)
			.attr('height', this._height);
		g.attr('transform',
			'translate(' + this._margin.left + ',' + this._margin.top + ')');
		g.select('clipPath').select('rect')
			.attr('width', width - xpadding)
			.attr('height', height - ypadding + markHeight);

		// strong assumption: there should be one svg per selection!
		// svg = svgEnter.merge(svg);
		// let tooltip = d3.select(this).select('.tooltip');
		// if (tooltip.empty()) {
		// 	this.createTooltip(d3.select(this)); //replace with d3.tip
		// }

		// define scales
		this._xs.domain([0, d3.sum(data, this._size)])
			.range([xpadding, width]);

		this._ys.domain([0, d3.max(data, this._orderY)])
			.range([ypadding, height - markHeight]);

		// let categories = d3.set(data.reduce((acc, d)=>
		// 	acc.concat(this._children(d).map(
		// 		c=>this._childCategory(c))),[])).values();
		// // console.log(categories);
		// this._cs.domain(categories.sort())
		// 	.range(this._palette);
		// compute layout
		let cursor = 0;
		let markData = data.sort((d1, d2) => {
			return this._orderX(d1) - this._orderX(d2);
		}).map(d => {
			let x0 = this._xs(cursor);
			cursor += this._size(d);
			let x1 = this._xs(cursor);
			let y = this._ys(this._orderY(d));
			// children layout
			let children = this._children(d).map((c, i) => {
				return {
					orgData: c,
					parentOrgDdata: d,
					x0: x0,
					x1: x1,
					y: y + i * markHeight
				};
			});
			return {
				orgData: d,
				children: children,
				x0: x0,
				x1: x1,
				y: y,
				id: this._orderX(d),
				xo: this._orderX(d),
				yo: this._orderY(d)
			};
		});

		// construct axes
		let xaxisContainer = g.select('.x.axis');
		if (xaxisContainer.empty()) {
			xaxisContainer = g.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + ypadding + ')');
		}

		this._xaxis.scale(this._xs);
		xaxisContainer.call(this._xaxis);

		let yaxisContainer = g.select('.y.axis');
		if (yaxisContainer.empty()) {
			yaxisContainer = g.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(' + xpadding + ',0)');
		}

		let ydivide = Math.round(d3.max(markData.map(d => d.yo)) / 3);

		this._yaxis.scale(this._ys)
			.tickValues([ydivide, 2 * ydivide, 3 * ydivide])
			.tickSizeInner(-(width - xpadding))
			.tickSizeOuter(0);
		yaxisContainer.call(this._yaxis);

		helper.axisStyleUpdate(this._container);

		// draw axis labels
		if (g.select('.' + css.bgLine).empty()) {
			g.append('line')
				.attr('class', css.bgLine)
				.attr('x1', 0)
				.attr('x2', xpadding)
				.attr('y1', ypadding)
				.attr('y2', ypadding);
		}

		let axisTitles = g.selectAll('.' + css.axisLegend)
			.data([
				[width, 0, 0, this._xtitle, 'end'],
				[0, height - 10, -90, this._ytitle, 'start']
			]);
		axisTitles.enter()
			.append('text')
			.attr('class', css.axisLegend)
			.merge(axisTitles)
			.text(d => d[3])
			.attr('text-anchor', d => d[4])
			.attr('transform',
				d => 'translate(' + (d[0]) + ',' + (d[1]) + ')rotate(' + (d[2]) + ')');

		// draw background
		let bandSize = this._ys(ydivide) - ypadding;
		let bgdata = [
			[0, 0.04, 'Beginning'],
			[bandSize, 0.12, 'Middle'],
			[2 * bandSize, 0.2, 'End']
		];

		let bgpanels = g.selectAll('.bgpanel')
			.data(bgdata);

		let bgpanelEnter = bgpanels.enter()
			.append('g')
			.attr('class', 'bgpanel');

		// bgpanelEnter.append('rect')
		// 	.style('fill', '#9E9E9E')
		// 	.merge(bgpanels.select('rect'))
		// 	.style('fill-opacity', d=>d[1])
		// 	.attr('x', xpadding)
		// 	.attr('y', d=>ypadding+d[0])
		// 	.attr('height', bandSize)
		// 	.attr('width', width-xpadding);

		bgpanelEnter.append('text')
			.text(d => d[2])
			.attr('class', css.bgText)
			.merge(bgpanels.select('text'))
			.attr('transform',
				d => 'translate(' + (xpadding / 2) + ',' + (ypadding + d[0] + bandSize / 2.0) + ')');

		bgpanelEnter.append('line')
			.attr('class', css.bgLine)
			.merge(bgpanels.select('line'))
			.attr('stroke-dasharray', '3,3')
			.attr('x1', 20)
			.attr('x2', xpadding)
			.attr('y1', d => ypadding + d[0] + bandSize)
			.attr('y2', d => ypadding + d[0] + bandSize);

		// main group containing marks (to be zoomed and panned)
		let main = g.select('.main');
		if (main.empty()) {
			main = g.append('g')
				.attr('clip-path', 'url(#' + g.select('clipPath').attr('id') + ')')
				.append('g')
				.attr('class', 'main');
		}

		// draw line connecting marks
		let lineData = markData.reduce((l, d) => {
			l.push([d.x0, d.y]);
			l.push([d.x1, d.y]);
			return l;
		}, []);

		let line = d3.line()
			.x(d => d[0])
			.y(d => d[1]);

		let linePath = main.select('.' + css.connectLine);
		if (linePath.empty()) {
			linePath = main.append('path')
				.attr('class', css.connectLine)
				.attr('stroke', 'url(#svgGradient)');
		}
		linePath.datum(lineData)
			.attr('d', line);

		// draw rect marks
		let sceneUpdate = main.selectAll('.sceneGroup')
			.data(markData, d => d.id);

		sceneUpdate.exit().remove();


		let sceneEnter = sceneUpdate.enter()
			.append('g')
			.attr('class', 'sceneGroup');

		sceneEnter.append('rect')
			.attr('class', css.overlay)
			.on(ONMOUSEOVER, (d, i, ns) => this._onMouseOver(d, i, ns))
			.on(ONMOUSEOUT, (d, i, ns) => this._onMouseOut(d, i, ns))
			.on(ONMOUSECLICK, (d, i, ns) => this._onMouseClick(d, i, ns));

		sceneEnter.append('rect')
			.attr('class', css.overlayHorz);

		sceneEnter.append('rect')
			.attr('pointer-events', 'none')
			.attr('class', css.longBand);

		sceneEnter.append('rect')
			.attr('pointer-events', 'none')
			.attr('class', css.shortBand);

		// multiple children
		sceneEnter.append('g')
			.attr('class', 'characters');

		sceneUpdate = sceneEnter.merge(sceneUpdate);

		sceneUpdate.select('.' + css.overlay)
			.attr('x', d => d.x0)
			.attr('y', ypadding)
			.attr('height', height - ypadding - markHeight)
			.attr('width', d => d.x1 - d.x0);

		sceneUpdate.select('.' + css.overlayHorz)
			.attr('x', xpadding)
			.attr('y', d => d.y)
			.attr('height', markHeight)
			.attr('width', width);

		sceneUpdate.select('.' + css.shortBand)
			.attr('x', d => d.x0)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: METADATA1,
						data: this._metadata1(d.orgData)
					},
					d.orgData, this._highlights) ? 1.0 : 0.0)
			.style('fill', d =>this._csm1(this._metadata1(d.orgData)))//d =>
			.attr('y', d => d.y)
			.attr('width', 0)
			.attr('height', 0)
			.transition()
			.attr('y', d => d.y - 5 * markHeight)
			.duration(this._duration)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', markHeight * 11); //d=>markHeight*(this._children(d.orgData).length+10))

		sceneUpdate.select('.' + css.longBand)
			.attr('x', d => d.x0)
			.attr('y', ypadding)
			.attr('width', d => d.x1 - d.x0)
			.style('fill', d => this._csm2(this._metadata2(d.orgData)))
			.style('fill-opacity',
				d => this._isHighlighted({
						type: METADATA2,
						data: this._metadata2(d.orgData)
					},
					d.orgData, this._highlights) ? 0.25 : 0.0)
			.attr('height', 0)
			.transition()
			.duration(this._duration)
			.attr('height', height - ypadding - markHeight);


		let characters = sceneUpdate.select('.characters').selectAll('.' + css.mark)
			.data(d => d.children);

		characters.exit().remove();

		characters.enter().append('rect')
			.attr('class', css.mark)
			.attr('pointer-events', 'none')
			.attr('x', d => d.x0)
			.attr('y', d => d.y)
			.merge(characters)
			.transition()
			.duration(this._duration)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: CHILDDATA,
						data: d.orgData
					},
					d.parentOrgDdata, this._highlights) ? 1.0 : 0.15)
			.attr('fill', d => this._cs(this._childCategory(d.orgData, d.parentOrgDdata)))
			.attr('x', d => d.x0)
			.attr('y', d => d.y)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', markHeight)
			.attr('y', d => d.y);

		// zoom setting
		g.call(this._zoom); //attach zoom to the vis area

		this._zoom.extent([
				[xpadding, 0],
				[width, height]
			])
			.translateExtent([
				[xpadding, 0],
				[width, height]
			])
			.scaleExtent([1, 15]);

		this._zoom.on('zoom', () => this._onZoom());

	}
	_children(d, i) {
		return ['scene-' + i];
	}
	_childCategory(d) {
		return d;
	}
	_metadata1(d) {
		return d.scene_metadata.location;
	}
	_metadata2(d) {
		return d.scene_metadata.time;
	}
	_orderX(d) {
		return d.narrative_order;
	}
	_orderY(d) {
		return d.story_order;
	}
	_size(d) {
		return d.scene_metadata.size;
	}
	_onZoom() {
		this._transformVis(d3.event.transform);
		if (this._listners[ONZOOM]) {
			this._listners[ONZOOM].call(this, d3.event.transform);
		}
	}

	_transformVis(transform) {
		this._tip.hide();
		this._container.select('.x.axis')
			.call(this._xaxis.scale(transform.rescaleX(this._xs)));

		this._container.select('.main')
			.attr('transform',
				'translate(' + transform.x + ',0)scale(' + transform.k + ',1)');

		helper.axisStyleUpdate(this._container);
	}

	transform(op, param) { // does not call callback
		this._zoom.on('zoom', null);
		//update zoom state
		let zoomContainer = this._container.select('.visarea');
		this._container.select('.visarea')
			.call(this._zoom[op], param);
		// update vis
		let transform = d3.zoomTransform(zoomContainer.node());
		this._transformVis(transform);
		this._zoom.on('zoom', () => this._onZoom());
		return this;
	}
	_onMouseClick() {
		if (this._listners[ONMOUSECLICK]) {
			this._listners[ONMOUSECLICK].apply(this, arguments);
		}
	}
	_onMouseOver() {
		this.highlightOn(arguments[0].xo);

		if (this._listners[ONMOUSEOVER]) {
			this._listners[ONMOUSEOVER].apply(this, arguments);
		}
	}
	_onMouseOut() {
		this.highlightOff(arguments[0].xo);

		if (this._listners[ONMOUSEOUT]) {
			this._listners[ONMOUSEOUT].apply(this, arguments);
		}
	}
	_tipFormat(d) {
		let content = '<table>';
		content += ('<tr><td><span style="color:#FBBD08">(X,Y)</span></td><td>&nbsp; ' + d.xo + ', ' + d.yo + '</td></tr>');
		// content += ('<tr><td><span style="color:#767676">S.order</span></td><td>&nbsp; ' + d.so + '</td></tr>');
		content += '</table>';
		return content;
	}
	highlightOn(xo) {
		let g = this._container.selectAll('.sceneGroup')
			.filter((d) => d.xo == xo)
			.raise();

		g.select('.' + css.overlay)
			.style('fill-opacity', 0.2);
		g.select('.' + css.overlayHorz)
			.style('fill-opacity', 0.2);
		g.select('.' + css.shortBand)
			.each((d, i, ns) => this._tip.show(d, ns[i]));


		g.selectAll('.' + css.mark)
			.classed(css.highlight, true);

		// if (!this._highlights){
		// 	return;
		// }
		// // retrieve all characters
		// let coappear = this._container.selectAll('.sceneGroup')
		// 	.filter((d) => this._isHighlighted(d.scene, this._highlights));
		//
		// coappear.select('.'+css.mark)
		// 	.classed(css.coappeared, true);
	}
	highlightOff(xo) {
		let g = this._container.selectAll('.sceneGroup')
			.filter((d) => d.xo == xo)
			.raise();
		g.select('.' + css.overlay)
			.style('fill-opacity', 0.0);
		g.select('.' + css.overlayHorz)
			.style('fill-opacity', 0.0);
		g.select('.' + css.shortBand)
			.each((d, i, ns) => this._tip.hide(d, ns[i]));
		g.selectAll('.' + css.mark)
			.classed(css.highlight, false);
	}
	_isHighlighted(d, highlights) {
		return highlights.length == 0 ? true :
			highlights.every(h =>
				h.type == 'characters' ? d[h.type].includes(h.filter) :
				d.scene_metadata[h.type] == h.filter);
	}
	highlights(_) {
		if (!arguments.length) return this._highlights;
		this._highlights = _;

		//highlight marks
		this._container.selectAll('.sceneGroup')
			.select('.' + css.shortBand)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: METADATA1,
						data: this._metadata1(d.orgData)
					},
					d.orgData, this._highlights) ? 1.0 : 0.0);

		this._container.selectAll('.sceneGroup')
			.select('.' + css.longBand)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: METADATA2,
						data: this._metadata2(d.orgData)
					},
					d.orgData, this._highlights) ? 0.25 : 0.0);

		this._container.selectAll('.sceneGroup')
			.select('.characters')
			.selectAll('.' + css.mark)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: CHILDDATA,
						data: d.orgData
					},
					d.parentOrgDdata, this._highlights) ? 1.0 : 0.15);

		return this;
	}
	isHighlighted(_) {
		if (!arguments.length) return this._isHighlighted;
		this._isHighlighted = _;
		return this;
	}
	tipFormat(_) {
		if (!arguments.length) return this._tipFormat;
		this._tipFormat = _;
		return this;
	}
	xtitle(_) {
		if (!arguments.length) return this._xtitle;
		this._xtitle = _;
		return this;
	}
	ytitle(_) {
		if (!arguments.length) return this._ytitle;
		this._ytitle = _;
		return this;
	}
	children(_) {
		if (!arguments.length) return this._children;
		this._children = _;
		return this;
	}
	childCategory(_) {
		if (!arguments.length) return this._childCategory;
		this._childCategory = _;
		return this;
	}
	categoryScale(_) {
		if (!arguments.length) return this._cs;
		this._cs = _;
		return this;
	}
	meta1ColorScale(_) {
		if (!arguments.length) return this._csm1;
		this._csm1 = _;
		return this;
	}
	meta2ColorScale(_) {
		if (!arguments.length) return this._csm2;
		this._csm2 = _;
		return this;
	}
	metadata1(_) {
		if (!arguments.length) return this._metadata1;
		this._metadata1 = _;
		return this;
	}
	metadata2(_) {
		if (!arguments.length) return this._metadata2;
		this._metadata2 = _;
		return this;
	}
	orderX(_) {
		if (!arguments.length) return this._orderX;
		this._orderX = _;
		return this;
	}
	orderY(_) {
		if (!arguments.length) return this._orderY;
		this._orderY = _;
		return this;
	}
	width(_) {
		if (!arguments.length) return this._width;
		this._width = _;
		return this;
	}
	height(_) {
		if (!arguments.length) return this._height;
		this._height = _;
		return this;
	}
	size(_) {
		if (!arguments.length) return this._size;
		this._size = _;
		return this;
	}
	container(selector) {
		if (!arguments.length) return this._container;
		this._container = d3.select(selector);
		return this;
	}
	on(name, callback) {
		this._listners[name] = callback;
		return this;
	}
}
