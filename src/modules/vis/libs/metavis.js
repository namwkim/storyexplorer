import css from './metavis.css';

export const ONZOOM = 'zoom';
export const ONMOUSEOVER = 'mouseover';
export const ONMOUSEOUT = 'mouseout';
export const ONMOUSECLICK = 'click';
export const CLICK_ON_LABEL = 'click_on_label';

export default class MetaVis {
  constructor(selector) {
    this._container = d3.select(selector);
    this._width = 800;
    this._height = 14;
    this._margin = {
      top: 0, //60+5+15/2
      left: 0,
      right: 0,
      bottom: 0
    };
    this._duration = 400; // animation duration
    this._selected = false;

    this._cs = d3.scaleOrdinal()
      // .domain(['Negative', 'Neutral', 'Positive'])
      // .range(['#fc8d59', '#ffffbf', '#91cf60'])
      // .range(['#DB2828', '#767676', '#21BA45'])
      // .unknown('#EEEEEE');
      // let categoryScale = d3.scaleOrdinal()
        .domain([''])
        .range(['#00B5AD'])
        .unknown('#F5F5F5');
    this._tip = d3.tip()
			.attr('class', css.d3Tip)
			.offset([0, 10])
      .direction('e')
			.html(this._tipFormat);

    this._xs = d3.scaleLinear();
    this._zoom = d3.zoom();
    this._listners = new Map();
  }

  draw(data) {
    if (this._container.empty()){
			return;
		}
		this._container.datum(data);

    // console.log('---------- MetaVis:', data.filter);
    // console.log(data);
    let scenes = data.scenes;
    let filter = data.filter;

    let width = this._width - this._margin.left - this._margin.right;
    let height = this._height - this._margin.top - this._margin.bottom;

    let xpadding = 80; //left xpadding

    let markHeight = height-6;//subtract stroke width top and bottom

		// create root container
    let svg = this._container.select('svg');
		if (svg.empty()){// init
      svg = this._container.append('svg');
      svg.append('g')
        .attr('class', 'visarea')
        .append('defs')// clipPath for panning & zooming
        .append('clipPath')
        .attr('id', 'clipID'+Date.now())
        .append('rect')
        .attr('x', xpadding)
        .attr('y', 0);

      svg.call(this._tip);

    }
    let g = svg.select('.visarea');

    // update vis size
		svg.attr('width', this._width)
			.attr('height', this._height);
		g.attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');
		g.select('clipPath').select('rect')
      .attr('width', width-xpadding)
      .attr('height',height);

    // let tooltip = d3.select(this).select('.tooltip');
    // if (tooltip.empty()) {
    //   this.createTooltip(d3.select(this)); //replace with d3.tip
    // }

    // define scales
    this._xs.domain([0, d3.sum(scenes, this._size)])
      .range([xpadding, width]);

    let text = filter.charAt(0).toUpperCase() + filter.slice(1);
    text = text.length>15? text.slice(0, 14)+'...':text;
    // compute layout
    let cursor = 0;
    let markData = scenes.sort((d1, d2) => {
      return this._order(d1) - this._order(d2);
    }).map(d => {
      let x0 = this._xs(cursor);
      cursor += this._size(d);
      let x1 = this._xs(cursor);
      return {
        label: text,
        category: this._category(d, filter),
        x0: x0,
        x1: x1,
        order: this._order(d)
      };
    });
    // category domain may be specified by the user
    // if (this._cs.domain().length==0){
    //   let categories = markData.map(d => d.category);
    //   categories = d3.set(categories.filter(c => c != null)).values()
    //     .sort((a, b) => a.localeCompare(b));
    //   this._cs.domain(categories);
    // }
    // draw name

    let label = g.select('.' + css.label);
    if (label.empty()) {
      label = g.append('text')
        .attr('class', css.label)
        .on('mouseover', (d,i,ns)=>this._onMouseOverLabel(d,i,ns))
        .on('mouseout', (d,i,ns)=>this._onMouseOutLabel(d,i,ns))
        .on('click', (d,i,ns)=>{
          console.log('click');
          this._onMouseClickLabel(d,i,ns);
        });
    }
    label.text(text);

    // draw scenes
		let main = g.select('.main');
		if (main.empty()){
			main = g.append('g')
				.attr('clip-path', 'url(#'+g.select('clipPath').attr('id')+')')
				.append('g')
				.attr('class', 'main');
		}

    let marks = main.selectAll('.'+css.mark)
      .data(markData);

    marks.exit().remove();
    marks.enter()
      .append('rect')
      .attr('class', css.mark)
      .attr('height', markHeight)
      .on('mouseover', (d,i,ns)=>this._onMouseOver(d,i,ns))
      .on('mouseout', (d,i,ns)=>this._onMouseOut(d,i,ns))
      .on('click', (d,i,ns)=>this._onMouseClick(d,i,ns))
      .merge(marks)
      .style('fill', d => this._cs(d.category))
      .attr('y', -markHeight)
      .attr('x', d => d.x0)
      .attr('width', d => d.x1 - d.x0)
      .attr('pointer-events', 'none')
      .transition()
      .duration(this._duration)
      .attr('y', 2)
      .on('end', function() {
        d3.select(this).attr('pointer-events', null);
      });


		// zoom setting
    main.call(this._zoom); //attach zoom to the vis area

		this._zoom.on('zoom', ()=>this._onZoom());

    this._zoom.extent([[xpadding, 0],[width, height]])
      .translateExtent([[xpadding, 0],[width, height]])
      .scaleExtent([1, 15]);


  }

  _order(d) {
    return d.narrative_order;
  }

  _size(d) {
      return d.scene_metadata.size;
    }
  _category(d, filter) {
    let filtered = d.character_metadata.filter(d => d.name == filter);
    if (filtered.length != 1) {
      return null;
    }
    let sentiment = filtered[0].sentiment;
    return sentiment == 0 ? 'Neutral' : (sentiment > 0 ? 'Positive' : 'Negative');
  }
  _onZoom(){
    this._tip.hide();

    this._container.select('.main')
      .attr('transform', 'translate(' + d3.event.transform.x + ',0) scale(' + d3.event.transform.k + ',1)');

    if (this._listners[ONZOOM]){
			this._listners[ONZOOM].call(this, d3.event.transform);
		}
  }

  _onMouseOver(){
    this.highlightOn(arguments[0].order);

    if (this._listners[ONMOUSEOVER]){
			this._listners[ONMOUSEOVER].apply(this, arguments);
		}
	}
	_onMouseOut(){
    this.highlightOff(arguments[0].order);

    if (this._listners[ONMOUSEOUT]){
			this._listners[ONMOUSEOUT].apply(this, arguments);
		}
	}
  _onMouseClick(){
    if (this._listners[ONMOUSECLICK]){
			this._listners[ONMOUSECLICK].apply(this, arguments);
		}
  }
  _onMouseClickLabel(){
    console.log('_onMouseClickLabel');
    let elem = arguments[2][arguments[1]];
    this._selected = !this._selected;
    console.log(d3.select(elem).text(),this._selected);
    d3.select(elem)
      .classed(css.selected, this._selected);
    if (this._listners[CLICK_ON_LABEL]){
      this._listners[CLICK_ON_LABEL].apply(this, arguments);
    }
  }
  _onMouseOverLabel(){
    let elem = arguments[2][arguments[1]];
    d3.select(elem)
      .classed(css.selected, true);
  }
  _onMouseOutLabel(){
    let elem = arguments[2][arguments[1]];
    d3.select(elem)
      .classed(css.selected, this._selected);
  }
  _tipFormat(d){
    let content = '<table>';
    content += ('<tr><td><span style="color:#FBBD08">'+d.label+'</span></td><td>&nbsp; ' + d.category+ '</td></tr>');
    content += '</table>';
    return content;
  }
  tipFormat(_){
    if (!arguments.length) return this._tipFormat;
    this._tipFormat = _;
    return this;
  }
  selected(_){
    if (!arguments.length) return this._selected;
    this._selected = _;
    return this;
  }
  width(_){
    if (!arguments.length) return this._width;
    this._width = _;
    return this;
  }
  height(_){
    if (!arguments.length) return this._height;
    this._height = _;
    return this;
  }
  container(selector){
		if (!arguments.length) return this._container;
		this._container = d3.select(selector);
		return this;
	}
  size(_) {
    if (!arguments.length) return this._size;
    this._size = _;
    return this;
  }
  order(_) {
    if (!arguments.length) return this._order;
    this._order = _;
    return this;
  }
  category(_) {
    if (!arguments.length) return this._category;
    this._category = _;
    return this;
  }
  categoryScale(_) {
    if (!arguments.length) return this._cs;
    this._cs = _;
    return this;
  }
  transform(op, param){// does not call callback
    this._tip.hide();

		this._zoom.on('zoom',null);
		//update zoom state
		let zoomContainer = this._container.select('.main');
		this._container.select('.main')
			.call(this._zoom[op], param);
		// update vis
		let transform = d3.zoomTransform(zoomContainer.node());
    this._container.select('.main')
			.attr('transform',
				'translate('+transform.x+',0) scale(' + transform.k + ',1)');
		this._zoom.on('zoom', ()=>this._onZoom());
		return this;
  }

	highlightOn(order) {
    this._container.selectAll('.'+css.mark)
			.filter((d) => d.order == order)
      .raise()
      .style('stroke-width', '2px')
      .style('stroke', d=>d.category!=null? '#546E7A':'#CFD8DC')
      .each((d,i,ns)=>{
        if (d.category!=null){
          this._tip.show(d, ns[i]);
          // this._container.select('.' + css.label)
          //   .style('fill', '#FBBD08');
        }
      });

	}
	highlightOff(order) {
    this._container.selectAll('.'+css.mark)
      .filter((d) => d.order == order)
      .style('stroke-width', '0px')
      .each((d,i,ns)=>{
        if (d.category!=null){
          this._tip.hide(d, ns[i]);
          // this._container.select('.' + css.label)
          //   .style('fill', '#000000');
        }
      });
	}
  on(name, callback){
		this._listners[name] = callback;
    return this;
	}
}
