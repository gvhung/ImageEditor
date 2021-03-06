(function($, _window){
	var settings = {
		contWidth : 0,
		contHeight : 0,
		minScale : 0.3,
		maxScale : 1
	};
	var coords = {};
	var SVG_START = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="{X}px" y="{Y}px" width="{W}px" height="{H}px">'
	var SVG_END = '</svg>';
	var RECT = '<rect x="{X}" y="{Y}" fill="{FILL}" stroke="{S}" stroke-width="{SW}" width="{W}" height="{H}"></rect>';
	var ROUND_RECT = '<rect x="{X}" y="{Y}" fill="{FILL}" stroke="{S}" stroke-width="{SW}" width="{W}" height="{H}" rx="{RX}" ry="{RY}"></rect>';
	var CIRCLE = '<circle fill="{FILL}" stroke="{S}" stroke-width="{SW}" cx="{X}" cy="{Y}" r="{R}"></circle>';
	var LINE = '<line x1="{X1}" y1="{Y1}" x2="{X2}" y2="{Y2}" marker-end="url(#triangle)" stroke="{S}" stroke-width="{SW}"></line>';
	var MARKER = '<marker xmlns="http://www.w3.org/2000/svg" id="triangle" refX="0" refY="5" markerUnits="strokeWidth" markerHeight="2" markerWidth="2"><path d="M 40 5 L 50 10 L 40 15 z"/></marker>';
	var REVMARKER = '<marker xmlns="http://www.w3.org/2000/svg" id="triangle" refX="0" refY="5" markerUnits="strokeWidth" markerHeight="2" markerWidth="2"><path d="M 0 10 L 10 5 L 10 15 z"/><path d="M 40 5 L 50 10 L 40 15 z"/></marker>';
	var fonts = ["Aclonica", "Acme", "Akronim", "Aladin", "Alegreya", "Allerta", "Allura", "Amita", "Arbutus", "Architects Daughter", "Archivo Black", "Atomic Age", "Aubrey", "Bangers", "Basic", "Baumans", "Belleza", "BenchNine", "Berkshire Swash", "Bigshot One", "Bilbo", "Butcherman", "Caesar Dressing", "Cambo", "Candal", "Capriola", "Carrois Gothic", "Carter One", "Caveat Brush", "Cherry Cream Soda", "Codystar", "Convergence", "Covered By Your Grace", "Croissant One", "Crushed", "Days One", "Devonshire", "Dhurjati", "Diplomata", "Droid Sans Mono", "Duru Sans", "Engagement", "Englebert", "Ewert", "Faster One", "Griffy", "Helvetica","Iceberg", "Jacques Francois", "Lato", "Londrina Outline", "Marko One", "Marvel", "Monoton", "Mrs Sheppards", "Mystery Quest", "Nosifer", "Nova Cut", "Open Sans", "Oregano", "Oswald", "Oxygen Mono", "Press Start 2P", "Quicksand", "Ribeye", "Roboto", "Rosario", "Russo One", "Shojumaru", "Source Code Pro", "Swanky and Moo Moo", "The Girl Next Door", "Ubuntu", "UnifrakturMaguntia", "Voces", "Zeyada"];
	var properties = {
		'default':{
			'angle' : 'number',
			'backgroundColor' : 'color',
			'fill' : 'color',
			'flipX' : 'checkbox',
			'flipY' : 'checkbox',
			'globalCompositeOperation' : ['source-over', 'source-atop', 'source-in', 'source-out', 'destination-over', 'destination-atop', 'destination-in', 'destination-out', 'lighter', 'copy', 'xor'],
			'height': 'number',
			'left' : 'number',
			'opacity' : 'range',
			'originX' : ['left', 'center', 'right'],
			'originY' : ['top', 'center', 'bottom'],
			'skewX' : 'number',
			'skewY' : 'number',
			'stroke' : 'color',
			'strokeDashArray' : [],
			'strokeLineCap' : ['round', 'butt', 'square'],
			'strokeLineJoin' : ['round', 'bevel', 'miter'],
			'strokeMiterLimit' : 'number',
			'strokeWidth' : 'number',
			'top' : 'number',
			'visible' : 'checkbox',
			'width' : 'number'
		},
		'i-text' : {
			'fontFamily' : fonts,
			'fontSize' : 'number',
			'fontStyle' : ['normal', 'italic', 'oblique'],
			'fontWeight' : ['normal', 'bold', '400', '600', '800'],
			'lineHeight' : 'number',
			'text' : 'text',
			'textAlign' : ['left', 'center', 'right', 'justify'],
			'textBackgroundColor' : 'color',
			'textDecoration' : ['', 'underline','overline','line-through']
		},
		'image' :{
			'alignX' : ['none', 'mid', 'min', 'max'],
			'alignY' : ['none', 'mid', 'min', 'max'],
			'crossOrigin' : ['', 'Anonymous', 'use-credentials'],
			'meetOrSlice' : ['meet', 'slice'],
			'src' : 'string'
		}
	};
	var controls = {'text':'fa-pencil-square-o', 'shape':'fa-square-o', 'crop':'fa-crop', 'measure':'fa-expand'};
	var shape_controls = {'arrow':'fa-long-arrow-right', 'double sided arrow':'fa-arrows-h', 'line':'fa-minus', 'rectangle':'fa-square-o', 'circle':'fa-circle-thin'};
	var canvas, selectedObj;
	$.fn.imageEdit = function(options){
		this.each(function(index, element){
			init.apply(element, [index, element, options]);
		});
		$("<div />",{"id":"image_editor_container"}).appendTo($("body"));
		$("<div />",{"id":"image_editor_controls"}).appendTo($("#image_editor_container"));
		for(var i in controls){
			var $div = $('<div />',{'class':'image_editor_control_icons '+i,'data-control-type':i})
			$div.append($('<i />',{'class':'fa '+controls[i],'aria-hidden':true}));
			$div.append($('<span />').text(i.toUpperCase()));
			$div.appendTo($("#image_editor_controls"));
		}
		$("<div />",{"id":"image_editor_shape_controls"}).appendTo($("#image_editor_container"));
		for(var i in shape_controls){
			var $div = $('<div />',{'class':'image_editor_control_icons '+i,'data-control-type':i})
			$div.append($('<i />',{'class':'fa '+shape_controls[i],'aria-hidden':true}));
			if(i == 'double sided arrow'){
				$div.append($('<span />',{'style':'font-size:10px;'}).text(i.toUpperCase()));
			} else {
				$div.append($('<span />').text(i.toUpperCase()));
			}
			$div.appendTo($("#image_editor_shape_controls"));
		}
		$("#image_editor_controls div").bind("click",function(){
			var control_type = $(this).attr('data-control-type');
			switch(control_type){
				case 'text':
					addText();
					break;
				case 'shape':
					$("#image_editor_shape_controls").addClass("active");
					break;
				case 'crop':
					canvas.discardActiveObject()
					croppedImage = canvas.toDataURL();
					$("#image_editor_crop_image_ops").css({width:$(".canvas-container").width(),height:$(".canvas-container").height(),left:$(".canvas-container").css("left")});
					$(".canvas-container").hide();
					$("#image_editor_crop_image_ops").show();
					$('#image_editor_image_el').css({width:canvas.width,height:canvas.height});
					$('#image_editor_image_el').attr("src",croppedImage);
					$('#image_editor_image_el').Jcrop({
						onSelect : updateCoords
					});
					initCrop();
					break;
				case 'measure':
					canvas.discardActiveObject()
					croppedImage = canvas.toDataURL();
					$("#image_editor_measure_image_ops").css({width:$(".canvas-container").width(),height:$(".canvas-container").height(),left:$(".canvas-container").css("left")});
					$(".canvas-container").hide();
					$("#image_editor_measure_image_ops").show();
					// croppedImage = 'http://farm8.staticflickr.com/7259/6956772778_2fa755a228.jpg';
					$('#image_editor_measure_image').attr("data-image-url",croppedImage);
					$("#image_editor_measure_image").addClass("canvas-area");
					$('.canvas-area[data-image-url]').canvasAreaDraw();
			}
		});
		$("#image_editor_shape_controls div").bind("click",function(){
			var shape_control_type = $(this).attr('data-control-type');
			switch(shape_control_type){
				case 'arrow':
					addArrow();
					break;
				case 'double sided arrow':
					addDoubleArrow();
					break;
				case 'line':
					addLine();
					break;
				case 'rectangle':
					addRectangle();
					break;
				case 'circle':
					addCircle();
					break;
			}
			$("#image_editor_shape_controls").removeClass("active");
		})
		$("<canvas />",{"id":"image_editor_canvas"}).appendTo($("#image_editor_container"));
		$('<div id="image_editor_crop_image_ops"><img id="image_editor_image_el" /></div>').appendTo($("#image_editor_container"));
		$('<div id="image_editor_measure_image_ops"><textarea id="image_editor_measure_image"></textarea></div>').appendTo($("#image_editor_container"));
		$('<div id="image_editor_coords_div"><div><textarea id="image_editor_points"></textarea><i></i></div></div>').appendTo($("#image_editor_container"));
		$("<div />",{"id":"image_editor_settings"}).appendTo($("#image_editor_container"));
		$("#image_editor_settings").append($("<input type='range' id='image_editor_scale' class='range-slider__range' min='0.1' step='0.01' />"))
		$("#image_editor_settings").append($("<div id='image_editor_close_icon'><i class='fa fa-times' aria-hidden='true'></i></div>"))
		$("<div />",{"id":"image_editor_properties_dialogs"}).appendTo($("#image_editor_container"));
		$("#image_editor_close_icon").bind("click",function(){
			closeEditor();
		});
		$("#image_editor_scale").on("input",function(){
			var scale = $(this).val();
			if(!$(this).data("isChangedProg")){
				$(".canvas-container").css("transform","scale("+scale+")");
			}
		});
		$("body").bind("keydown",function(e){
			var keyCode = e.keyCode;
			var preventDefault = false;
			if(selectedObj && e.target.nodeName == 'BODY'){
		        switch(keyCode){
		        	case 8:
		        		deleteSelectedObj();
		        		preventDefault = true;
		        		break;
				}
				if(preventDefault)
					eventHandler(e);
			}
		});
		$("#image_editor_coords_div i").bind("click",function(){
			$("#image_editor_coords_div").hide();
			$("#image_editor_measure_image_ops").hide();
			$(".canvas-container").show();
			$("#image_editor_measure_image_ops > *").not("textarea").remove();
			$("#image_editor_measure_image_ops textarea").removeAttr("data-image-url");
		})
		initSettings();
	}

	var init = function(index, element, options){
		$(element).bind("click",function(){
			var src = $(this).attr("src");
			if(src){
				var img = new Image();
				img.onload = function(){
					var imgWidth = img.naturalWidth;
					var imgHeight = img.naturalHeight;
					var canvasWidth = Math.min(imgWidth,settings.contWidth);
					var canvasHeight = Math.min(imgHeight,settings.contHeight);
					settings.imgWidth = imgWidth;
					settings.imgHeight = imgHeight;
					$("#image_editor_canvas").attr({Width:canvasWidth,Height:canvasHeight});
					canvas = new fabric.Canvas('image_editor_canvas');
					canvas.on("object:scaling",function(obj){
						var target = obj.target;
						if(target.type == 'i-text'){
							target.fontSize *= target.scaleX;
							target.scale(1);
							target.setCoords();
							canvas.renderAll();
						}
					});
					canvas.on("object:selected",function(event){
						selectedObj = canvas.getActiveObject();
						if(selectedObj){
							$("#image_editor_properties_dialogs").show();
							// selectedObj.bringToFront();
							showProperties();
							setProperties();
						} else {
							$("#image_editor_properties_dialogs").hide();
						}
					});
					canvas.on("selection:cleared",function(e){
						selectedObj = null;
					})
					canvas.on("object:modified",function(){
						if(selectedObj){
							setProperties();
						}
					})
					setPositionsOfInnerElements();
					getBase64(img.src,function(src){
						fabric.Image.fromURL(src,function(nimg){
							nimg.selectable = false;
							nimg.hasControls = false;
							nimg.hasBorders = false;
							nimg.mainImage = true;
							if((settings.contWidth - nimg.width)/2 < 0){
								var currentScale = (settings.contWidth/nimg.width).toFixed(2);
								nimg.scale(currentScale);
								// $(".canvas-container").css("transform","scale("+settings.maxScale+")");
								$(".canvas-container").css("transform","scale(1)");
							}
			            	canvas.add(nimg);
			                canvas.centerObject(nimg);
						    nimg.setCoords();
						    canvas.renderAll();
			            });
			            resetScaleLimit();
					});
		            
		            // if((settings.contWidth - imgWidth)/2 < 0){
		            // 	var currentScale = (settings.contWidth/imgWidth).toFixed(2);
		            // 	$(".canvas-container").css("transform","scale("+currentScale+")");
		            // }
				}
				img.crossOrigin = 'Anonymous';
				img.src = src;
			}
			$("#image_editor_container").addClass("active");
		});
		var options = $.extend(settings,options);
		$(element).data("ImageEdit",options);
		$(element).attr("crossOrigin","Anonymous");
	}
	var resetSize = function(){
		settings.contWidth = innerWidth*0.8;
		settings.contHeight = innerHeight*0.8;
	}
	var setPositionsOfInnerElements = function(){
		var containerWidth = $(".canvas-container").width()/2;
		var containerHeight = $(".canvas-container").height()/2;
        $(".canvas-container, #image_editor_crop_image_ops, #image_editor_measure_image_ops").css("left","calc(50% - "+containerWidth+"px)");
        $(".canvas-container, #image_editor_crop_image_ops, #image_editor_measure_image_ops").css("top","calc(50% - "+containerHeight+"px)");
	}
	var resetScaleLimit = function(){
		settings.maxScale = settings.contHeight/settings.imgHeight;
        $("#image_editor_scale").data("isChangedProg",true);
        $("#image_editor_scale").attr("max",settings.maxScale*2);
        $("#image_editor_scale").val(1);
        $("#image_editor_scale").data("isChangedProg","");
	}
	var initSettings = function(){
		resetSize();
		loadFonts(function(){
			createPropertyDialogs(function(){
				$("#search_el").bind("input",function(){
					var q = $(this).val();
					if(q == ""){
						$(".searchable").show();
					} else {
						q = q.toLowerCase();
						$(".searchable").hide();
						$(".searchable[title*='"+q+"']").show();
					}
				})
				$("#prop_head span").bind("mousedown",function(event){
					var clientX = event.offsetX;
					var clientY = event.offsetY;
					$("*").bind("mousemove",function(e){
						var left = e.pageX-clientX;
						var top = e.pageY-clientY;
						$("#image_editor_properties_dialogs").css('transform','translate3d('+left+'px,'+top+'px,0px)');
					});
					$("*").bind("mouseup",function(){
						$("*").unbind("mousemove mouseup");
					})
				})
				$(".prop_body input").bind("input",function(){
					var val = $(this).val();
					var el_prop = $(this).attr('title');
					if($(this).attr("type") == "number"){
						val = parseFloat(val);
					}
					applyProp(el_prop, val);
				})
				$(".prop_body input[type='checkbox']").bind("change",function(){
					var val = $(this).is(":checked");
					var el_prop = $(this).attr('title');
					applyProp(el_prop, val);
				})
				$(".prop_body select").bind("change",function(){
					var val = $(this).val();
					var el_prop = $(this).attr('title');
					applyProp(el_prop, val);
				})
			});
		})
	}
	var applyProp = function(el_prop, val){
		if(selectedObj){
			if(el_prop in selectedObj)
				selectedObj[el_prop] = val;
			if(selectedObj.type == 'path-group'){
				selectedObj.paths.forEach(function(a){
					if(el_prop in a){
						a[el_prop] = val;
						if(el_prop == 'fill' || el_prop == 'stroke'){
							a['fill'] = val;
							a['stroke'] = val;
						}
					}
				})
			}
			selectedObj.setCoords();
			canvas.renderAll();
			setTimeout(function(){
				if(canvas)
					canvas.renderAll();
			},1000);
		}
	}
	var deleteSelectedObj = function(){
	    var activeObject = canvas.getActiveObject(), activeGroup = canvas.getActiveGroup();
	    if(!activeObject.mainImage && confirm("Are you sure you want to remove this element?")){
		    if (activeGroup) {
		        var objectsInGroup = activeGroup.getObjects();
		        canvas.discardActiveGroup();
		        objectsInGroup.forEach(function(object) {
		            canvas.remove(object);
		        });
		    } else if (activeObject) {
		        canvas.remove(activeObject);
		    }
	    }
	}
	var closeEditor = function(){
		canvas.dispose();
		$("#image_editor_container").removeClass("active");
	}
	var addText = function(){
		var text = 'Enter Text Here';
	    var textSample = new fabric.IText(text, {
			fontFamily: 'Helvetica',
			angle: 0,
			fontSize: 20,
			fill: 'black',
			hasRotatingPoint: true,
			centerTransform: true,
			editable : true
	    });
	    makeCenterAndRedraw(textSample);
	}
	var makeCenterAndRedraw = function(elem){
		canvas.add(elem);
		canvas.centerObject(elem);
	    elem.setCoords();
	    canvas.setActiveObject(elem);
	    canvas.renderAll();
	}
	var createPropertyDialogs = function(callback){
		var mainPropEl = $('<div />',{'class':'prop_body'});
		for(var i in properties){
			var parentEl = $('<div />',{'class':i});
			var props = properties[i];
			for(var j in props){
				var val = props[j];
				var j_title = j.toLowerCase();
				switch(val){
					case 'number':
						parentEl.append($('<div class="searchable" title="'+j_title+'"><span>'+j+'</span><input type="number" title="'+j+'" min="0" /></div>'));
						break;
					case 'text':
						parentEl.append($('<div class="searchable" title="'+j_title+'"><span>'+j+'</span><input type="text" title="'+j+'" /></div>'));
						break;
					case 'checkbox':
						parentEl.append($('<div class="searchable" title="'+j_title+'"><span>'+j+'</span><input type="checkbox" title="'+j+'" /></div>'));
						break;
					case 'range':
						parentEl.append($('<div class="searchable" title="'+j_title+'"><span>'+j+'</span><input type="range" title="'+j+'" min="0" step="0.01" max="1" value="1" /></div>'));
						break;
					case 'color':
						parentEl.append($('<div class="searchable" title="'+j_title+'"><span>'+j+'</span><input type="color" title="'+j+'" /></div>'));
						break;
					default:
						if(typeof(val) == 'object' && val.length > 0){
							var subParentEl = $('<div />',{'class':'searchable','title':j});
							subParentEl.append($('<span />').text(j));
							var selectEl = $('<select />',{'title':j});
							for(var el in val){
								selectEl.append($('<option />',{'value':val[el]}).text(val[el]));
							}
							subParentEl.append(selectEl);
						}
						parentEl.append(subParentEl);
						break;
				}
			}
			mainPropEl.append(parentEl);
		}
		$("#image_editor_properties_dialogs").append('<div id="prop_head"><span>Properties</span><input type="search" id="search_el" placeholder="Search properties" /></div>');
		$("#image_editor_properties_dialogs").append(mainPropEl);
		setTimeout(function(){
			if(typeof callback == 'function'){
				callback();
			}
		},500);
	}

	var showProperties = function(){
		$(".prop_body > div").hide();
		switch(selectedObj.type){
			case 'i-text': 						// Editable text
				$(".prop_body .i-text").show();
				break;
			case 'image':
				$(".prop_body .image").show();
				break;
		}
		$(".prop_body .default").show();
	}

	function setProperties(){
		$(".searchable input, .searchable select").each(function(){
			var title = $(this).attr('title');
			var selectedVal = selectedObj[title];
			if($(this).is(":checkbox")){
				if(selectedVal){
					$(this).prop("checked",true);
				} else {
					$(this).removeAttr("checked");
				}
			}
			// console.log(title);
			if(selectedVal !== "" && selectedVal != null && selectedVal != undefined){
				if(this.type == 'color'){
					if(selectedVal.indexOf('rgb') == -1){
						var d = document.createElement("div");
						d.style.color = selectedVal;
						document.body.appendChild(d);
						selectedVal = window.getComputedStyle(d).color;
						document.body.removeChild(d);
					}
					selectedVal = rgbToHex(selectedVal);
				}
				$(this).val(selectedVal);
			}
		})
		$("#image_editor_properties_dialogs").css("transform","translate3d("+(innerWidth-220)+"px,60px,0)");
	}

	var loadFonts = function(callback){
	    var str = '';
	    fonts.forEach(function(font){
	    	font = font.replace(/ /g,'+');
	        str += font+":400,700|";
	    });
	    str = str.slice(0,-1);
	    $("<link href='https://fonts.googleapis.com/css?family="+str+"' rel='stylesheet' type='text/css' />").appendTo($('head'));
	    if(typeof callback == 'function'){
	        callback();
	    }
	}

	function initCrop(){
		setPositionsOfInnerElements();
		var target_el = $(".jcrop-holder > div:eq(0) > div:eq(0)");
		var tick_icon = $('<span />',{'class':'crop_icon tick'});
		var close_icon = $('<span />',{'class':'crop_icon close'});
		tick_icon.insertAfter(target_el);
		close_icon.insertAfter(target_el);
		close_icon.bind("click",function(){
			removeJcrop();
			$(".canvas-container").show();
			$("#image_editor_crop_image_ops").hide();
			$("#image_editor_scale").show();
		});
		tick_icon.bind("click",function(){
			var can = document.createElement('canvas');
			var img = new Image();
			img.onload = function(){
				can.width = img.naturalWidth;
				can.height = img.naturalHeight;
				var cxt = can.getContext('2d');
				cxt.drawImage(img,0,0);
				var data = cxt.getImageData(coords.x,coords.y,coords.w,coords.h);
				var temp_can = document.createElement('canvas');
				temp_can.width = coords.w;
				temp_can.height = coords.h;
				var temp_cxt = temp_can.getContext('2d');
				temp_cxt.putImageData(data,0,0);
				var croppedSrc = temp_can.toDataURL();
				$(".canvas-container").show();
				$("#image_editor_crop_image_ops").hide();
				// canvas.clear();
				fabric.Image.fromURL(croppedSrc,function(nimg){
					canvas.clear();
					canvas.setWidth(nimg.width);
					canvas.setHeight(nimg.height);
					nimg.selectable = false;
					nimg.hasControls = false;
					nimg.hasBorders = false;
					nimg.mainImage = true;
					settings.imgWidth = nimg.width;
					settings.imgHeight = nimg.height;
					canvas.add(nimg);
					resetSize();
					setTimeout(function(){
						setPositionsOfInnerElements();
			            removeJcrop();
					},300);
					// canvas.add(nimg);
					// canvas.centerObject(nimg);
					// nimg.setCoords();
					// canvas.setActiveObject(nimg);
					// canvas.renderAll();
	            })
			}
			// img.crossOrigin = 'Anonymous';
			img.src = croppedImage;
		});
		$("#image_editor_scale").hide();
	}

	var removeJcrop = function(){
		var jcrop_obj = $('#image_editor_image_el').data('Jcrop');
		jcrop_obj.destroy();
		$("#image_editor_crop_image_ops, #image_editor_image_el").removeAttr("style");
		$("#image_editor_image_el").removeAttr("src");
		resetScaleLimit();
		$("#image_editor_scale").show();
	}

	var updateCoords = function(e){
		coords = {
			x : e.x,
			y : e.y,
			w : e.w,
			h : e.h
		}
	}

	/*shapes*/

	var addArrow = function(){
		var obj = canvas.getCenter();
		var top = Math.round(obj.top);
		var left = Math.round(obj.left);
		var str = '';
		str += SVG_START.replace('{X}','0').replace('{Y}','0').replace('{W}','50').replace('{H}','20');
		str += MARKER+''+LINE.replace('{X1}',2).replace('{X2}',45).replace('{Y1}',10).replace('{Y2}',10).replace('{S}','black').replace('{SW}','5');
		str += SVG_END;
		fabric.loadSVGFromString(str,function(objects, options){
			var loadedObject = fabric.util.groupSVGElements(objects, options);
			makeCenterAndRedraw(loadedObject);
		})
	}

	var addDoubleArrow = function(){
		var obj = canvas.getCenter();
		var top = Math.round(obj.top);
		var left = Math.round(obj.left);
		var str = '';
		str += SVG_START.replace('{X}','0').replace('{Y}','0').replace('{W}','50').replace('{H}','20');
		str += REVMARKER+''+LINE.replace('{X1}',10).replace('{X2}',45).replace('{Y1}',10).replace('{Y2}',10).replace('{S}','black').replace('{SW}','5');
		str += SVG_END;
		fabric.loadSVGFromString(str,function(objects, options){
			var loadedObject = fabric.util.groupSVGElements(objects, options);
			makeCenterAndRedraw(loadedObject);
		})
	}

	var addLine = function(){
		var lineObj = new fabric.Line([ 0, 100, 100, 100], {
	      stroke : 'black',
	      strokeWidth : 2
	    });
	    makeCenterAndRedraw(lineObj);
	}

	var addRectangle = function(){
		var rectObj = new fabric.Rect({
	      // fill: 'transparent',
	      width: 150,
	      height: 100,
	      stroke : 'black',
	      strokeWidth : 2
	    })
	    makeCenterAndRedraw(rectObj);
	}

	var addCircle = function(){
		var cirObj = new fabric.Circle({
			// fill: 'transparent',
			radius: 50,
			stroke : 'black',
			strokeWidth : 2
		})
		makeCenterAndRedraw(cirObj);
	}
	var getBase64 = function(remote_src,callback){
		var img = new Image();
		img.onload = function(){
			var can = document.createElement('canvas');
			can.width = img.naturalWidth;
			can.height = img.naturalHeight;
			var cxt = can.getContext('2d');
			cxt.drawImage(img,0,0);
			callback(can.toDataURL());
		}
		img.crossOrigin = 'Anonymous';
		img.src = remote_src;
	}
	var rgbToHex = function(color) {
	    if (color.substr(0, 1) === "#") {
	        return color;
	    }
	    var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
	        r = parseInt(nums[2], 10).toString(16),
	        g = parseInt(nums[3], 10).toString(16),
	        b = parseInt(nums[4], 10).toString(16);
	    return "#"+ (
	        (r.length == 1 ? "0"+ r : r) +
	        (g.length == 1 ? "0"+ g : g) +
	        (b.length == 1 ? "0"+ b : b)
	    );
	}
	var eventHandler = function(e){
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		return false;
	}
	$(_window).on("resize",resetSize);
})(jQuery, window);