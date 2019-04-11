(function ($){
    $.fn.circle = function(options){
		var that = this;
		this.svgNS;
		this.svgContext;
		this.colors = ['#5DA5FA', '#FAA43A', '#60BD68', '#959595', '#B2812F', '#1585AC', '#E9967A', '#B20612', '#ADD8E6', '#DECFFF', '#006400', '#F15854', '#4D4D4D', '#17BECF', '#BCBD22', '#E377C2', '#8C56FF', '#9467BD', '#2CA02C', '#FF7F0E'];
		this.pie_center={};
		this.pie_radius;

		var slices = [];
		var offsetX, offsetY;
		var total_value = 0;
		var pieGroup;
		var pieExplodeDelta;
		var indicatorRadius;
		var height3D = 30;
		var transition = "transform 0.5s linear";

		// options for chart. all options are optional.
		this.settings = $.extend({
			type: "pie", // pie for pie chart and donut for donut chart. default is pie.
			is3D: false, // true for 3D chart, false for 2D chart. default is false.
			id: "canvas_"+Date.now(), // id of chart element. default is "canvas_" + Date.now()
			title: "", // title for the chart. default is empty.
			titleColor: "black", // color of the title. default is black.
			height: 200, // width of chart in pixels. default is 200.
			width: 200, // height of chart in pixels. default is 200.
			donutHoleSize: 0.5, // size (1 is 100%) of the donut hole for donut charts. default is 0.5. has no meaning if type is pie.
			showIndicator: true, // true to show indicator on mouseover, false to nor show indicator on mouseover. default is true.
			explodeAll: true, // true to explode all borders on click, false to explode only one border at a time (others will be normal). default is true.
			sliceBorders: true, // true to show slice borders or false to hide slice borders. default is true.
            colors: this.colors, // colors for chart slices.
			showTooltip: true, // true or false. default is true.
			showLabel: "", // 'percent' or 'value' (any other value will remove the label). default is none "".
			labelColor: "white", // 'normal' for slice color, 'invert' for inverted slice color or specific color. default is white.
			isLabelInside: true, // true to show label inside slice, false to show outside slice. default is true.
			showLegend: true, // true or false. default is true.
			legendColor: "black", // 'normal' for slice color, 'invert' for inverted slice color or specific color. default is black.
            background: "#FCFCFC", // background color of chart. default is #FCFCFC.
			data: [] // data for the chart slices.
        }, options);

		function invertCSSColor(color){
			var rgb = invertColor(HEX2RGB(color));
			return RGB2HEX(rgb);
		}

		function invertColor(rgb){
			var yuv = RGB2YUV(rgb);
			var factor = 180;
			var threshold = 100;
			yuv.y = clamp(yuv.y + (yuv.y > threshold ? -factor : factor));
			return YUV2RGB(yuv);
		}
    
		function RGB2HEX(rgb){
			return '#' + DEC2HEX(rgb.r) + DEC2HEX(rgb.g) + DEC2HEX(rgb.b);
		}
    
		function HEX2RGB(color){
			if(color[0] == "#"){
				color = color.slice(1);
			}
			return {
				r: parseInt(color.substring(0, 2), 16),
				g: parseInt(color.substring(2, 4), 16),
				b: parseInt(color.substring(4, 6), 16)
			};
		}
    
		function RGB2HEX(rgb){
			return '#' + DEC2HEX(rgb.r) + DEC2HEX(rgb.g) + DEC2HEX(rgb.b);
		}
    
		function DEC2HEX(n){
			var hex = n.toString(16);
			if(hex.length < 2)
				return '0' + hex;
			return hex;
		}

		function RGB2YUV(rgb){
			var y = clamp(rgb.r * 0.29900 + rgb.g * 0.587 + rgb.b * 0.114);
			var u = clamp(rgb.r * -0.16874 + rgb.g * -0.33126 + rgb.b * 0.50000 + 128);
			var v = clamp(rgb.r * 0.50000 + rgb.g * -0.41869 + rgb.b * -0.08131 + 128);
			return {
				y:y,
				u:u,
				v:v
			};
		}

		function YUV2RGB(yuv){
			var y = yuv.y;
			var u = yuv.u;
			var v = yuv.v;
			var r = clamp(y + (v - 128) *  1.40200);
			var g = clamp(y + (u - 128) * -0.34414 + (v - 128) * -0.71414);
			var b = clamp(y + (u - 128) *  1.77200);
			return {
				r:r,
				g:g,
				b:b
			};
		}

		function clamp(n){
			if(n < 0) return 0;
			if(n > 255) return 255;
			return Math.floor(n);
		}

		var modifyColor = function(color, amt){
			var usePound = false;
			if(color[0] == "#"){
				color = color.slice(1);
				usePound = true;
			}

			var R = parseInt(color.substring(0, 2), 16) + amt;
			var G = parseInt(color.substring(2, 4), 16) + amt;
			var B = parseInt(color.substring(4, 6), 16) + amt;

			if(R > 255)
				R = 255;
			else if(R < 0)
				R = 0;

			if(G > 255)
				G = 255;
			else if(G < 0)
				G = 0;

			if(B > 255)
				B = 255;
			else if(B < 0)
				B = 0;

			var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
			var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
			var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

			return (usePound ? "#" : "") + RR + GG + BB;
		}
		
		var getPercent = function(value, total, precision){
			return Math.ceil(value / total_value * (100 * Math.pow(10, precision))) / Math.pow(10, precision) + "%";
		}

		var pieSliceExplode = function(slice){
			//var $pie_slice = $("#" + slice.id);
			var $pie_slice = $("[id|='" + slice.id + "']");
			var $pie_slice_label = $("#" + slice.id.replace("_slice_", "_label_"));
			removeIndicator();
			
			if(!that.settings.explodeAll){
				for(counter in slices){
					if(slice.id != slices[counter].id)
						$("#" + slices[counter].id).attr("transform", "translate(0, 0)").attr("pie-exploded", "0");
				}
			}

			if($pie_slice.attr("pie-exploded") == "0"){
				var explode_angle = (slice.start_angle + slice.end_angle) / 2;
				explode = getPoints(that.pie_center, explode_angle, that.pie_radius + pieExplodeDelta);
				normal = getPoints(that.pie_center, explode_angle, that.pie_radius);

				var delta = {x: explode.x - normal.x, y: explode.y - normal.y};
				//$pie_slice.attr("transform", "translate(" + delta.x + ", " + delta.y + ")").attr("pie-exploded", "1");
				$pie_slice.css({"transform": "translate(" + delta.x + "px, " + delta.y + "px)"}).attr("pie-exploded", "1");
				if(that.settings.isLabelInside){
					//$pie_slice_label.attr("transform", "translate(" + delta.x + ", " + delta.y + ")");
					$pie_slice_label.css({"transform": "translate(" + delta.x + "px, " + delta.y + "px)"});
				}
			}else{
				//$pie_slice.attr("transform", "translate(0, 0)").attr("pie-exploded", "0");
				$pie_slice.css({"transform": "translate(0px, 0px)"}).attr("pie-exploded", "0");
				if(that.settings.isLabelInside){
					//$pie_slice_label.attr("transform", "translate(0, 0)");
					$pie_slice_label.css({"transform": "translate(0px, 0px)"});
				}
				if(that.settings.showIndicator)
					showIndicator(slice);
				else
					highlightSlice(slice);
			}
		}

		var removeIndicator = function(){
			if($("#" + that.settings.id + "_indicator").length > 0)
				$("#" + that.settings.id + "_indicator").remove();
		}

		var showIndicator = function(slice){
			if(that.settings.is3D){
				if($("#" + slice.id + "-T").attr("pie-exploded") == "0"){
					var start_angle = slice.start_angle;
					var end_angle = slice.end_angle;
			
					var sliceOuterStart = getPoints(that.pie_center, start_angle, indicatorRadius+10);
					var sliceOuterEnd = getPoints(that.pie_center, end_angle, indicatorRadius+10);
					path = [];
					path.push("M", sliceOuterStart.x, height3D+sliceOuterStart.y, "A", indicatorRadius - that.settings.donutHoleSize, indicatorRadius - that.settings.donutHoleSize, "0 0 1", sliceOuterEnd.x, height3D+sliceOuterEnd.y, "L", sliceOuterEnd.x,sliceOuterEnd.y, "A", indicatorRadius - that.settings.donutHoleSize, indicatorRadius - that.settings.donutHoleSize, "0 0 0", sliceOuterStart.x, sliceOuterStart.y, "z")
					slicePath = $(document.createElementNS(that.svgNS, "path"));
					slicePath.attr("id", that.settings.id + "_indicator");
					slicePath.attr("d", path.join(" "));
					slicePath.attr("stroke", modifyColor(slice.color, -40));
					slicePath.attr("stroke-width", 2);
					slicePath.attr("opacity", 0.60);
					slicePath.attr("fill", slice.color);
					pieGroup[0].appendChild(slicePath[0]);
				}
			}else{
				if($("#" + slice.id).attr("pie-exploded") == "0"){
					//var indicatorRadius = that.pie_radius + 6;
					var start = getPoints(that.pie_center, slice.start_angle, indicatorRadius);
					var end = getPoints(that.pie_center, slice.end_angle, indicatorRadius);
					var large_slice = (((slice.end_angle - slice.start_angle) / Math.PI) > 1) ? 1 : 0;

					slicePath = $(document.createElementNS(that.svgNS, "path"));
					
					slicePath.attr("id", that.settings.id + "_indicator");
					slicePath.attr("d", "M" + start.x + "," + start.y +" A" + indicatorRadius + "," + indicatorRadius + " 0 " + large_slice + ",1 " + end.x + "," + end.y + " A" + indicatorRadius + "," + indicatorRadius + " 0 " + large_slice + ",0 " + start.x + "," + start.y + " z");
					slicePath.attr("stroke", slice.color);
					slicePath.attr("stroke-width", 10);
					slicePath.attr("opacity", 0.30);
					slicePath.attr("fill", slice.color);

					//that.svgContext.append(slicePath);
					pieGroup[0].appendChild(slicePath[0]);
				}
			}
		}

		var highlightSlice = function(slice){
			for(counter in slices){
				if(slice.id == slices[counter].id || slice.id == 0){
					if(that.settings.is3D){
						$("#" + slices[counter].id + "-I").attr("opacity", "1");
						$("#" + slices[counter].id + "-T").attr("opacity", "1");
						$("#" + slices[counter].id + "-O").attr("opacity", "1");
					}else{
						$("#" + slices[counter].id).attr("opacity", "1");
					}
				}else{
					if(that.settings.is3D){
						$("#" + slices[counter].id + "-I").attr("opacity", "0.5");
						$("#" + slices[counter].id + "-T").attr("opacity", "0.5");
						$("#" + slices[counter].id + "-O").attr("opacity", "0.5");
					}else{
						$("#" + slices[counter].id).attr("opacity", "0.5");
					}
				}
			}
		}

		var removeTooltip = function(){
			if($("#" + that.settings.id + "_tooltip").length > 0){
				$("#" + that.settings.id + "_tooltip").remove();
				$("#" + that.settings.id + "_tooltipText").remove();
			}
		}

		var showTooltip = function(slice_index, e){
			var box;
			if($("#" + that.settings.id + "_tooltip").length == 0){
				var target = e.target.id.split("_")[1];
				var tooltipOpacity = 1;
				var tooltipBG = slices[slice_index].color;
				if(target == "slice"){
					tooltipOpacity = 0.75;
					modifyColor(tooltipBG, 60);
				}

				tooltip = $(document.createElementNS(that.svgNS, "rect"));
				tooltip.attr("id", that.settings.id + '_tooltip');
				tooltip.attr("fill", tooltipBG);
				tooltip.attr("stroke", modifyColor(slices[slice_index].color, -60));
				tooltip.attr("opacity", tooltipOpacity);
				that.svgContext.append(tooltip);

				tooltipText = $(document.createElementNS(that.svgNS, "text"));
				tooltipText.attr("id", that.settings.id + '_tooltipText');
				tooltipText.attr("fill", invertCSSColor(slices[slice_index].color));
				tooltipText.attr("font-family", "Calibri");
				tooltipText.attr("font-size", "12");
				tspan = $(document.createElementNS(that.svgNS, "tspan"));
				tspan.attr('x','0');
				tspan.attr('dy','0');
				tooltipText[0].appendChild(tspan[0]);
				tspan[0].textContent = that.settings.data[slice_index].label + ": " + that.settings.data[slice_index].value;
				tspan = $(document.createElementNS(that.svgNS, "tspan"));
				tspan.attr('x','0');
				tspan.attr('dy','12');
				tooltipText[0].appendChild(tspan[0]);
				//tspan[0].textContent = Math.ceil(that.settings.data[slice_index].value / total_value * 10000) / 100 + "%";
				tspan[0].textContent = getPercent(that.settings.data[slice_index].value, total_value, 2);
				that.svgContext.append(tooltipText);

				box = tooltipText[0].getBBox();
				tooltip.attr("width", box.width * 1.25);
				tooltip.attr("height", box.height * 1.25);
			}

			tooltip = $("#" + that.settings.id + "_tooltip");
			box = tooltip[0].getBoundingClientRect();
			var pos_x = e.clientX + 5;
			var pos_y = e.clientY + 15;
			if((e.clientX + 10 + box.width) > that.settings.width){
				pos_x = that.settings.width - box.width;
			}
			if((e.clientY + 15 + box.height) > that.settings.height){
				pos_y = that.settings.height - box.height;
			}
			
			$("#" + that.settings.id + "_tooltip")
				.attr("transform", "translate(" + pos_x + "," + pos_y + ")")
				.attr("visibility", "visible");
			$("#" + that.settings.id + "_tooltipText")
				.attr("transform", "translate(" + (pos_x + 5) + "," + (pos_y + 15) + ")")
				.attr("visibility", "visible");
			
		}

		var showLabels = function(){
			var mid_angle, rotate_angle, X;
			var labelContent;
			var labelColor = that.settings.labelColor;
			for (counter in slices){
				mid_angle = (slices[counter].start_angle + slices[counter].end_angle) / 2;
				X = mid_angle / Math.PI;
				if(that.settings.isLabelInside)
					label_pos = getPoints(that.pie_center, mid_angle, that.pie_radius - 30);
				else
					label_pos = getPoints(that.pie_center, mid_angle, that.pie_radius + 10);

				label = $(document.createElementNS(that.svgNS, "text"));
				label.attr("id", that.settings.id + '_label_' + counter);
				if(that.settings.labelColor == "invert")
					label.attr("fill", invertCSSColor(slices[counter].color));
				else if(that.settings.labelColor == "normal")
					label.attr("fill", slices[counter].color);
				else
					label.attr("fill", labelColor);
				label.attr("font-family", "Calibri");
				label.attr("font-size", "12");
				label.attr('x', label_pos.x);
				label.attr('y', label_pos.y);
				label.css({"transition": transition});
				if(that.settings.isLabelInside)
					label.attr('text-anchor', "middle");
				else
					if((X > 1.5) || (X < 0.5))
						label.attr('text-anchor', "start");
					else
						label.attr('text-anchor', "end");
				label.attr('pointer-events', "none");
				tspan = $(document.createElementNS(that.svgNS, "tspan"));
				tspan.attr('x', label_pos.x);
				tspan.attr('y', label_pos.y);
				label[0].appendChild(tspan[0]);
				if(that.settings.showLabel == "percent")
					labelContent = getPercent(that.settings.data[counter].value, total_value, 2);
				else if(that.settings.showLabel == "value")
					labelContent = that.settings.data[counter].value;
				else
					labelContent = "";
				tspan[0].textContent = labelContent;
				pieGroup[0].appendChild(label[0]);
				//that.svgContext.append(label);

				//var box = label[0].getBBox();
			}
		}

		var showLegend = function(){
			var box;
			var legendColor = that.settings.legendColor;
			var g = $(document.createElementNS(that.svgNS, "g"));
			that.svgContext.append(g);

			legendText = $(document.createElementNS(that.svgNS, "text"));
			legendText.attr("id", that.settings.id + '_legendText');
			legendText.attr("x", that.settings.width + 10);
			legendText.attr("y", 0);
			legendText.attr("fill", that.settings.legendColor);
			legendText.attr('cursor', "pointer");
			legendText.attr("font-family", "Calibri");
			legendText.attr("font-weight", "bold");
			legendText.attr("font-size", "12");
			g[0].appendChild(legendText[0]);

			for(counter in slices){
				var dy = 20;
				if(counter == 0){
					dy = 0;
				}
				rect = $(document.createElementNS(that.svgNS, "rect"));
				rect.attr("id", that.settings.id + "_rect_" + counter);
				rect.attr('x', that.settings.width + 10);
				rect.attr('y', counter * dy + 50);
				rect.attr('width', 10);
				rect.attr('height', 10);
				rect.attr('cursor', "pointer");
				rect.attr("fill", slices[counter].color);
				rect.attr("stroke", modifyColor(slices[counter].color, -40));
				//rect.setAttribute("stroke-width", 2);
				g[0].appendChild(rect[0]);

				tspan = $(document.createElementNS(that.svgNS, "tspan"));
				tspan.attr('id', that.settings.id + "_text_" + counter);
				tspan.attr('x', that.settings.width + 30);
				tspan.attr('y', counter * dy + 60);
				//labelColor = slices[counter].color;
				if(that.settings.legendColor == "invert")
					legendColor = invertCSSColor(slices[counter].color);
				else if(that.settings.legendColor == "normal")
					legendColor = slices[counter].color;
				tspan.attr("fill", legendColor);
				legendText[0].appendChild(tspan[0]);
				tspan[0].textContent = that.settings.data[counter].label;

				rect.mousemove(function(e){handleMouseMove(e);});
				rect.mouseenter(function(e){handleMouseMove(e);});
				rect.mouseleave(function(e){handleMouseMove(e);});
				rect.click(function(e){handleMouseMove(e);});
				tspan.mousemove(function(e){handleMouseMove(e);});
				tspan.mouseenter(function(e){handleMouseMove(e);});
				tspan.mouseleave(function(e){handleMouseMove(e);});
				tspan.click(function(e){handleMouseMove(e);});
			}
			box = g[0].getBBox();
			var gy = (that.settings.height - box.height - box.y - 40) / 2;
			g.attr("transform", "translate(0, " + gy + ")");
		}

		var showTitle = function(){
			titleText = $(document.createElementNS(that.svgNS, "text"));
			titleText.attr("id", that.settings.id + '_titleText');
			titleText.attr("x", 0);
			titleText.attr("y", 0);
			titleText.attr("fill", that.settings.titleColor);
			titleText.attr("font-family", "Calibri");
			titleText.attr("font-weight", "bold");
			titleText.attr("font-size", "14");			

			tspan = $(document.createElementNS(that.svgNS, "tspan"));
			tspan.attr('id', that.settings.id + "_titleText_inner");
			tspan.attr('x', 0);
			tspan.attr('y', 10);
			tspan.attr("fill", that.settings.titleColor);
			titleText[0].appendChild(tspan[0]);
			tspan[0].textContent = that.settings.title;

			that.svgContext.append(titleText);
			
			box = titleText[0].getBBox();
			var gx = (that.settings.width - box.width - box.x) / 2;
			titleText.attr("transform", "translate(" + gx + ", 0)");
		}
		
		var draw3DSlice = function(slice, type){
			var borderColor = "none";
			var large_slice = (slice.end_angle - slice.start_angle) > Math.PI ? 1: 0;
			var path = [];

			donut_radius = that.pie_radius * that.settings.donutHoleSize
			donut_start = getPoints(that.pie_center, slice.start_angle, donut_radius);
			donut_end = getPoints(that.pie_center, slice.end_angle, donut_radius);
/*
			if($("#" + slice.id + "_slicegroup").length == 0){
				sliceGroup = $(document.createElementNS(that.svgNS, "g"));
				sliceGroup.attr("id", slice.id + "_slicegroup");
				pieGroup[0].appendChild(sliceGroup[0]);
			}else{
				sliceGroup = $("#" + slice.id + "_slicegroup");
			}
*/
			if(type == "I"){
				//var start_angle = (slice.start_angle < Math.PI ? Math.PI : slice.start_angle);
				//var end_angle = (slice.end_angle < Math.PI ? Math.PI : slice.end_angle);
				var start_angle = slice.start_angle;
				var end_angle = slice.end_angle;

				var sliceInnerStart = getPoints(that.pie_center, start_angle, that.pie_radius * that.settings.donutHoleSize);
				var sliceInnerEnd = getPoints(that.pie_center, end_angle, that.pie_radius * that.settings.donutHoleSize);
				path = [];
				path.push("M", sliceInnerStart.x, sliceInnerStart.y, "A",that.settings.donutHoleSize*(that.pie_radius+that.settings.donutHoleSize), that.settings.donutHoleSize*(that.pie_radius+that.settings.donutHoleSize), "0 0 1", sliceInnerEnd.x, sliceInnerEnd.y, "L", sliceInnerEnd.x, height3D+sliceInnerEnd.y, "A", that.settings.donutHoleSize*(that.pie_radius+that.settings.donutHoleSize), that.settings.donutHoleSize*(that.pie_radius+that.settings.donutHoleSize), "0 0 0", sliceInnerStart.x, height3D+sliceInnerStart.y, "z");
				slicePath = $(document.createElementNS(that.svgNS, "path"));
				slicePath.attr("id", slice.id + "-I");
				slicePath.attr("d", path.join(" "));
				if(that.settings.sliceBorders){
					borderColor = modifyColor(slice.color, -40);
				}
				slicePath.attr("stroke", borderColor);
				slicePath.attr("stroke-width", 2);
				//slicePath.attr("stroke-opacity", 0.5);
				slicePath.attr("opacity", 1);
				slicePath.attr("fill", modifyColor(slice.color, -40));
				slicePath.attr("pie-exploded", "0");
				slicePath.css({"transition": transition});
				slicePath.mousemove(function(e){handleMouseMove(e);});
				slicePath.mouseenter(function(e){handleMouseMove(e);});
				slicePath.mouseleave(function(e){handleMouseMove(e);});
				slicePath.click(function(e){handleMouseMove(e);});
				pieGroup[0].appendChild(slicePath[0]);
			}

			if(type == "T"){
				var sliceInnerStart = getPoints(that.pie_center, slice.start_angle, that.pie_radius * that.settings.donutHoleSize);
				var sliceInnerEnd = getPoints(that.pie_center, slice.end_angle, that.pie_radius * that.settings.donutHoleSize);
				var sliceTopStart = getPoints(that.pie_center, slice.start_angle, that.pie_radius);
				var sliceTopEnd = getPoints(that.pie_center, slice.end_angle, that.pie_radius);
				path = [];
				if(slice.end_angle - slice.start_angle == 0 )
					path.push("M 0 0");
				else{
					path.push("M", sliceTopStart.x, sliceTopStart.y, "A", that.pie_radius, that.pie_radius, "0", large_slice, "1", sliceTopEnd.x, sliceTopEnd.y, "L", sliceInnerEnd.x, sliceInnerEnd.y);
					path.push("A", that.settings.donutHoleSize*that.pie_radius, that.settings.donutHoleSize*that.pie_radius, "0", large_slice, "0", sliceInnerStart.x, sliceInnerStart.y, "z");
				}
				slicePath = $(document.createElementNS(that.svgNS, "path"));
				slicePath.attr("id", slice.id + "-T");
				slicePath.attr("d", path.join(" "));
				if(that.settings.sliceBorders){
					borderColor = modifyColor(slice.color, -40);
				}
				slicePath.attr("stroke", borderColor);
				slicePath.attr("stroke-width", 2);
				//slicePath.attr("stroke-opacity", 0.5);
				slicePath.attr("opacity", 1);
				slicePath.attr("fill", slice.color);
				slicePath.attr("pie-exploded", "0");
				slicePath.css({"transition": transition});
				slicePath.mousemove(function(e){handleMouseMove(e);});
				slicePath.mouseenter(function(e){handleMouseMove(e);});
				slicePath.mouseleave(function(e){handleMouseMove(e);});
				slicePath.click(function(e){handleMouseMove(e);});
				pieGroup[0].appendChild(slicePath[0]);
			}

			if(type == "O"){
				//var start_angle = (slice.start_angle > Math.PI ? Math.PI : slice.start_angle);
				//var end_angle = (slice.end_angle > Math.PI ? Math.PI : slice.end_angle);
				var start_angle = slice.start_angle;
				var end_angle = slice.end_angle;
		
				var sliceOuterStart = getPoints(that.pie_center, start_angle, that.pie_radius);
				var sliceOuterEnd = getPoints(that.pie_center, end_angle, that.pie_radius);
				path = [];
				path.push("M", sliceOuterStart.x, height3D+sliceOuterStart.y, "A", that.pie_radius - that.settings.donutHoleSize, that.pie_radius - that.settings.donutHoleSize, "0 0 1", sliceOuterEnd.x, height3D+sliceOuterEnd.y, "L", sliceOuterEnd.x,sliceOuterEnd.y, "A", that.pie_radius - that.settings.donutHoleSize, that.pie_radius - that.settings.donutHoleSize, "0 0 0", sliceOuterStart.x, sliceOuterStart.y, "z")
				slicePath = $(document.createElementNS(that.svgNS, "path"));
				slicePath.attr("id", slice.id + "-O");
				slicePath.attr("d", path.join(" "));
				if(that.settings.sliceBorders){
					borderColor = modifyColor(slice.color, -40);
				}
				slicePath.attr("stroke", borderColor);
				slicePath.attr("stroke-width", 2);
				//slicePath.attr("stroke-opacity", 0.5);
				slicePath.attr("opacity", 1);
				slicePath.attr("fill", modifyColor(slice.color, -40));
				slicePath.attr("pie-exploded", "0");
				slicePath.css({"transition": transition});
				slicePath.mousemove(function(e){handleMouseMove(e);});
				slicePath.mouseenter(function(e){handleMouseMove(e);});
				slicePath.mouseleave(function(e){handleMouseMove(e);});
				slicePath.click(function(e){handleMouseMove(e);});
				pieGroup[0].appendChild(slicePath[0]);
			}

			if(type == "R"){
				//var start_angle = (slice.start_angle > Math.PI ? Math.PI : slice.start_angle);
				//var end_angle = (slice.end_angle > Math.PI ? Math.PI : slice.end_angle);
				var start_angle = slice.start_angle;
				var end_angle = slice.end_angle;
		
				var sliceOuterStart = getPoints(that.pie_center, start_angle, that.pie_radius);
				var sliceInnerStart = getPoints(that.pie_center, start_angle, that.pie_radius * that.settings.donutHoleSize);
				path = [];
				path.push("M", sliceOuterStart.x, height3D+sliceOuterStart.y, "L", sliceOuterStart.x, sliceOuterStart.y, "L", sliceInnerStart.x, sliceInnerStart.y, "L", sliceInnerStart.x, height3D+sliceInnerStart.y, "z")
				slicePath = $(document.createElementNS(that.svgNS, "path"));
				slicePath.attr("id", slice.id + "-O");
				slicePath.attr("d", path.join(" "));
				if(that.settings.sliceBorders){
					borderColor = modifyColor(slice.color, -40);
				}
				slicePath.attr("stroke", borderColor);
				slicePath.attr("stroke-width", 2);
				//slicePath.attr("stroke-opacity", 0.5);
				slicePath.attr("opacity", 1);
				slicePath.attr("fill", modifyColor(slice.color, -40));
				slicePath.attr("pie-exploded", "0");
				slicePath.css({"transition": transition});
				slicePath.mousemove(function(e){handleMouseMove(e);});
				slicePath.mouseenter(function(e){handleMouseMove(e);});
				slicePath.mouseleave(function(e){handleMouseMove(e);});
				slicePath.click(function(e){handleMouseMove(e);});
				pieGroup[0].appendChild(slicePath[0]);
			}

			if(type == "L"){
				//var start_angle = (slice.start_angle > Math.PI ? Math.PI : slice.start_angle);
				//var end_angle = (slice.end_angle > Math.PI ? Math.PI : slice.end_angle);
				var start_angle = slice.start_angle;
				var end_angle = slice.end_angle;
		
				var sliceOuterEnd = getPoints(that.pie_center, end_angle, that.pie_radius);
				var sliceInnerEnd = getPoints(that.pie_center, end_angle, that.pie_radius * that.settings.donutHoleSize);
				path = [];
				path.push("M", sliceOuterEnd.x, height3D+sliceOuterEnd.y, "L", sliceOuterEnd.x, sliceOuterEnd.y, "L", sliceInnerEnd.x, sliceInnerEnd.y, "L", sliceInnerEnd.x, height3D+sliceInnerEnd.y, "z")
				slicePath = $(document.createElementNS(that.svgNS, "path"));
				slicePath.attr("id", slice.id + "-O");
				slicePath.attr("d", path.join(" "));
				if(that.settings.sliceBorders){
					borderColor = modifyColor(slice.color, -40);
				}
				slicePath.attr("stroke", borderColor);
				slicePath.attr("stroke-width", 2);
				//slicePath.attr("stroke-opacity", 0.5);
				slicePath.attr("opacity", 1);
				slicePath.attr("fill", modifyColor(slice.color, -40));
				slicePath.attr("pie-exploded", "0");
				slicePath.css({"transition": transition});
				slicePath.mousemove(function(e){handleMouseMove(e);});
				slicePath.mouseenter(function(e){handleMouseMove(e);});
				slicePath.mouseleave(function(e){handleMouseMove(e);});
				slicePath.click(function(e){handleMouseMove(e);});
				pieGroup[0].appendChild(slicePath[0]);
			}
		}

		var drawDonutSlice = function(slice){
			var borderColor = "none";
			var large_slice = (((slice.end_angle - slice.start_angle) / Math.PI) > 1) ? 1 : 0;

			donut_radius = that.pie_radius * that.settings.donutHoleSize
			donut_start = getPoints(that.pie_center, slice.start_angle, donut_radius);
			donut_end = getPoints(that.pie_center, slice.end_angle, donut_radius);

			slicePath = $(document.createElementNS(that.svgNS, "path"));
			slicePath.attr("id", slice.id);
			slicePath.attr("d", "M" + donut_start.x + "," + donut_start.y +" L" + slice.start.x + "," + slice.start.y + " A" + that.pie_radius + "," + that.pie_radius + " 0 " + large_slice + ",1 " + slice.end.x + "," + slice.end.y + " L" + donut_end.x + "," + donut_end.y + " A" + donut_radius + "," + donut_radius + " 0 " + large_slice + ",0 " + donut_start.x + "," + donut_start.y + " z");
			if(that.settings.sliceBorders){
				borderColor = modifyColor(slice.color, -40);
			}
			slicePath.attr("stroke", borderColor);
			slicePath.attr("stroke-width", 2);
			slicePath.attr("opacity", 1);
			slicePath.attr("fill", slice.color);
			slicePath.attr("pie-exploded", "0");
			slicePath.css({"transition": transition});

			slicePath.mousemove(function(e){handleMouseMove(e);});
			slicePath.mouseenter(function(e){handleMouseMove(e);});
			slicePath.mouseleave(function(e){handleMouseMove(e);});
			slicePath.click(function(e){handleMouseMove(e);});

			pieGroup[0].appendChild(slicePath[0]);
		}

		var drawPieSlice = function(slice){
			var borderColor = "none";
			var large_slice = (((slice.end_angle - slice.start_angle) / Math.PI) > 1) ? 1 : 0;

			slicePath = $(document.createElementNS(that.svgNS, "path"));
			slicePath.attr("id", slice.id);
			slicePath.attr("d", "M" + that.pie_center.x + "," + that.pie_center.y +" L" + slice.start.x + "," + slice.start.y + "  A" + that.pie_radius + "," + that.pie_radius + " 0 " + large_slice + ",1 " + slice.end.x + "," + slice.end.y + " z");
			if(that.settings.sliceBorders){
				borderColor = modifyColor(slice.color, -40);
			}
			slicePath.attr("stroke", borderColor);
			slicePath.attr("stroke-width", 2);
			//slicePath.attr("stroke-opacity", 0.5);
			slicePath.attr("opacity", 1);
			slicePath.attr("fill", slice.color);
			slicePath.attr("pie-exploded", "0");

			slicePath.mousemove(function(e){handleMouseMove(e);});
			slicePath.mouseenter(function(e){handleMouseMove(e);});
			slicePath.mouseleave(function(e){handleMouseMove(e);});
			slicePath.click(function(e){handleMouseMove(e);});

			//that.svgContext.append(slicePath);
			pieGroup[0].appendChild(slicePath[0]);
		}

		var drawPie = function(){
			pieGroup = $(document.createElementNS(that.svgNS, "g"));
			pieGroup.attr("id", that.settings.id + "_pie");
			that.svgContext.append(pieGroup);
			if(that.settings.is3D){
				for (counter in slices){
					draw3DSlice(slices[counter], "R");
				}
				for (counter in slices){
					draw3DSlice(slices[counter], "L");
				}
				for (counter in slices){
					draw3DSlice(slices[counter], "I");
				}
				for (counter in slices){
					draw3DSlice(slices[counter], "O");
				}
				for (counter in slices){
					draw3DSlice(slices[counter], "T");
				}
			}else{
				for (counter in slices){
					if(that.settings.type == "donut"){
						drawDonutSlice(slices[counter]);
					}else{
						drawPieSlice(slices[counter]);
					}
				}
			}
			
			if(that.settings.is3D){
				// rotate the whole chart by X 45% to acheive the 3D effect.
				//pieGroup.css({"transform": "translateY(15%) rotateX(45deg)", "transform-style": "preserve-3d"});
			}
		}

		var getPoints = function(pie_center, angle, radius){
			return {x: pie_center.x + radius * Math.cos(angle), y: pie_center.x + radius * Math.sin(angle)};
		}

		var handleMouseMove = function(e){
			//var X = e.target.id.split("_");
			var X = e.target.id.split("-")[0].split("_");
			var slice_index = X[X.length-1];
			mouseX = parseInt(e.clientX - that.offsetX);
			mouseY = parseInt(e.clientY - that.offsetY);

			if(e.type == "mouseenter"){
				//pieSliceExplode(slices[slice_index]);
				if(that.settings.showIndicator)
					showIndicator(slices[slice_index]);
				else
					highlightSlice(slices[slice_index]);
			}else if(e.type == "mouseleave"){
				//pieSliceExplode(slices[slice_index]);
				if(that.settings.showIndicator)
					removeIndicator();
				else
					highlightSlice({id:0});
				removeTooltip();
			}else if(e.type == "mousemove"){
				if(that.settings.showTooltip)
					showTooltip(slice_index, e);
			}else if(e.type == "click"){
				pieSliceExplode(slices[slice_index]);
			}
		}

		this.refresh = function(){
			var color_index = 0;
			var svg_width = that.settings.width, svg_height = that.settings.height;

			if(that.settings.showLegend)
				svg_width*= 1.5;

			that.append("<svg id='" + that.settings.id + "' width='" + svg_width  + "' height='" + svg_height + "' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='100%' height='100%' fill='" + that.settings.background + "' /></svg>");
			that.svgNS = "http://www.w3.org/2000/svg";
			that.svgContext = $("#" + that.settings.id);

			var canvasOffset = $("#" + that.settings.id).offset();
			offsetX = canvasOffset.left;
			offsetY = canvasOffset.top;

			that.pie_center.x = that.settings.width / 2;
			that.pie_center.y = that.settings.height / 2;
			if(that.settings.is3D){
				that.pie_radius = Math.min(that.settings.width / 2.75, that.settings.height / 2.75);
			}else{
				that.pie_radius = Math.min(that.settings.width / 2.5, that.settings.height / 2.5);
			}
			pieExplodeDelta = 5 * Math.min(that.settings.width, that.settings.height) / 100; // 5% of either width or height (which ever is smaller).
			indicatorRadius = that.pie_radius + (5 * that.pie_radius / 100); // 105% of pie radius.
			
			if(that.settings.type == "pie")
				that.settings.donutHoleSize = 0; // if the chart type is pie, set the donut hole size to zero.

			for (var counter in that.settings.data){
				total_value +=  that.settings.data[counter].value;
			}

			var start_angle = 0;
			for (counter in that.settings.data){
				slice_val = that.settings.data[counter].value;
				var slice_angle = 2 * Math.PI * (slice_val / total_value);
				var slice_id = that.settings.id + "_slice_" + counter;

				slices.push({id: slice_id, start: getPoints(that.pie_center, start_angle, that.pie_radius), end: getPoints(that.pie_center, start_angle + slice_angle, that.pie_radius), start_angle: start_angle, end_angle: start_angle + slice_angle, color: that.settings.colors[color_index%that.settings.colors.length]})

				start_angle += slice_angle;
				color_index++;
			}
			console.log(slices)
			drawPie();

			if(that.settings.showLabel != ""){
				showLabels();
			}

			if(that.settings.showLegend){
				showLegend();
			}
			
			if(that.settings.title != ""){
				showTitle();
			}
		}

		this.refresh();

        return this;
    };
}(jQuery));