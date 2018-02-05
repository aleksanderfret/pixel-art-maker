$(document).ready(function() {
	/*VARIABLES*/
	const myCanvas = $("#pixelCanvas");
	const cell = $("td");
	const colorPicker = $("#colorPicker");
	const swatches = $(".swatches");
	const swatchColor = ".swatchColor";
	let selectedColor = "#000000";
	const submitButton = $("#submitButton");
	const clearCanvas = $("#clearButton");
	const deleteCanvas = $("#deleteCanvasButton");
	const instructions = $("#instButton");
	const bucket = $("#paintCanvas");
	const hashtag = $("#toggleLinesButton");
	const canvasBkg = $("#canvasBkgColor");
	const downloadBtn = $("#downloadButton");
	const body = $("body");

	/*FUNCTIONS*/

	// function to make canvas
	function makeGrid() {
		//store values height and width
		let width = $("#canvasWidth").val();
		let height = $("#canvasHeight").val();
		// If value is >100, alert
		if (width <= 0 || width > 50 || height <= 0 || height > 50) {
			alert("Please insert values between 5 and 50!");
			return true;
		}
		//remove any previous canvas
		myCanvas.children().remove();
		//Create canvas : a table is created by iterrating over its rows and (nested for loop) columns
		for (var r = 0; r < height; r++) {
			myCanvas.append("<tr></tr>");
			for (var c = 0; c < width; c++) {
				myCanvas
					.children()
					.last()
					.append("<td></td>");
			}
		}
	}

	/*EVENT LISTENERS*/

	/*toggle dropdowns*/

	//Toggle open/close dropdown button -> instructions
	instructions.on("click", function(e) {
		e.preventDefault();
		$(".dropdown")
			.stop()
			.slideToggle(750);
	});

	//Toggle open/close canvasMenu (dropdown button -> left bar)
	$("#canvasMenuButton").on("click", function(e) {
		e.preventDefault();
		$(".barHiddenL")
			.stop()
			.slideToggle(750);
	});

	//Toggle open/close colorMenu (dropdown button -> right bar)
	$("#colorMenuButton").on("click", function(e) {
		e.preventDefault();
		$(".barHiddenR")
			.stop()
			.slideToggle(750);
	});

	//Open canvasMenu and colorMenu when clicked on setUp Button
	$("#setUpButton").on("click", function(e) {
		e.preventDefault();
		$(".barHiddenL")
			.stop()
			.slideToggle(750);
		$(".barHiddenR")
			.stop()
			.slideToggle(750);
	});

	/*submit-> create canvas*/

	//Event listener-> on click on submit button -> create canvas
	submitButton.click(function(e) {
		e.preventDefault();
		makeGrid();
	});

	/*left bar*/

	/*-------------drawing options-------------------*/
	//Event listener-> stroke drawing with mousedown & mousemove combo

	myCanvas.on("mousedown", "td", function(event) {
		event.preventDefault();
		let selectedColor = $("#colorPicker").val();
		$(this).css("background-color", selectedColor);
		$(this).css("cursor", "url(images\brush-png.png), auto");
		if (event.which == 3) {
			$(this).css("background-color", "");
		}
	});

	myCanvas.on("mouseover", "td", function(event) {
		if (event.buttons == 1) {
			let selectedColor = $("#colorPicker").val();
			$(this).css("background-color", selectedColor);
			$(this).css("cursor", "url(images\brush-png.png), auto");
		} else if (event.buttons == 2) {
			$(this).css("background-color", "");
			myCanvas.css;
		}
	});

	myCanvas.on("dragstart", function(event) {
		event.preventDefault();
	});

	//Event listener-> on double-click remove the filled color from the cell
	myCanvas.on("dblclick", "td", function() {
		$(this).css("background-color", "");
	});

	//Event listener-> on click paint whole canvas
	bucket.on("click", function() {
		let selectedColor = $("#colorPicker").val();
		myCanvas.attr("style", "background-color: " + selectedColor + ";");
	});

	/*------------canvas view options--------------------*/
	//Event listener-> set cell size
	// small
	$(".cellS").on("click", function() {
		$("tr").css("height", "10px");
		$("td").css("width", "10px");
	});

	// medium
	$(".cellM").on("click", function() {
		$("tr").css("height", "15px");
		$("td").css("width", "15px");
	});

	//  big
	$(".cellL").on("click", function() {
		$("tr").css("height", "20px");
		$("td").css("width", "20px");
	});

	//Event listener-> on click show/hide lines
	hashtag.on("click", function() {
		$("td").toggleClass("hiddenLines");
	});

	//Event listener-> on click on table color button button -> toggle white/transparent
	canvasBkg.on("click", function() {
		$("tr").toggleClass("canvasBkg");
	});

	//Event listener-> on click on clear button -> remove drawing
	clearCanvas.click(function() {
		$("td").each(function() {
			$("td").css("background-color", "");
		});
	});

	/*-------------actions-------------------*/

	//Event listener-> on click on delete button -> remove canvas
	deleteCanvas.click(function() {
		$("#canvasHeight, #canvasWidth").val("");
		myCanvas.empty();
	});

	//Event listener-> on click save masterpiece!
	//  -- needs a HTML2CANVAS plugin; not working here----still trying to figure it out ¯\_(ツ)_/¯
  $("#downloadButton").click(function() {
    html2canvas(document.querySelector("#pixelCanvas")).then(canvas => {

      let link = document.createElement('a');
      link.download = "YourPixelMasterpiece.png";
      link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      link.click();
    });
  });

	/*right bar*/
	//swatches

	//create color palette
	swatches.each(function(color) {
		color = [
			"#00529a",
			"#433980",
			"#4c2468",
			"#af1f6a",
			"#be1e2d",
			"#ee3023",
			"#f37320",
			"#ffca2b",
			"#fbee35",
			"#add036",
			"#087b3e",
			"#fff",
			"#bbbdc0",
			"#000"
		];
		let palette = "";
		for (let i = 0; i < color.length; i++) {
			palette +=
				'<li class="swatchColor" title=" ' +
				color[i] +
				'" data-color="' +
				color[i] +
				'" style="background-color: ' +
				color[i] +
				';"></li>';
		}
		$(this).append(palette);
	});

	//function to pick swatch
	function pickSwatch(swatchColor, selectedColor) {
		selectedColor = $(swatchColor).attr("data-color");
		console.log("hex : " + selectedColor);
		colorPicker.val(selectedColor);
	}
	//Event listener-> on click pick swatch
	swatches.on("click", swatchColor, function() {
		pickSwatch(this);
	});
	//show swatch as selected color in color Picker
	colorPicker.val(selectedColor);

	//function to fill cell with color
	function draw(cell, color) {
		color = colorPicker.val();
		$(cell).css("background-color", color);
	}
	//function to remove color from cell
	function erease(cell) {
		$(cell).css("background-color", "");
	}

	/*hidden features*/
	// Event Handler  -> prevent right-click menu
	$(document).bind("contextmenu", function(e) {
		return false;
	});
}); //jQ doc-ready closing

/*-------------THE ᕕ( ᐛ )ᕗ END-----------------*/
