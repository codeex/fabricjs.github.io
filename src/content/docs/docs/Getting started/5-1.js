var canvas = new fabric.Canvas('step1');
canvas.add(new fabric.Rect({ width: 50, height: 50, fill: 'blue', angle: 10 }));
canvas.add(new fabric.Circle({ radius: 50, fill: 'red', top: 44, left: 80 }));
canvas.add(
	new fabric.Ellipse({ rx: 50, ry: 10, fill: 'yellow', top: 80, left: 35 })
);
canvas.add(
	new fabric.Rect({
		width: 50,
		height: 50,
		fill: 'purple',
		angle: -19,
		top: 70,
		left: 70,
	})
);
canvas.add(
	new fabric.Circle({ radius: 50, fill: 'green', top: 110, left: 30 })
);
canvas.add(
	new fabric.Ellipse({
		rx: 50,
		ry: 10,
		fill: 'orange',
		top: 12,
		left: 100,
		angle: 30,
	})
);
canvas.on('mouse:wheel', function (opt) {
	var delta = opt.e.deltaY;
	var zoom = canvas.getZoom();
	zoom *= 0.999 ** delta;
	if (zoom > 20) zoom = 20;
	if (zoom < 0.01) zoom = 0.01;
	canvas.setZoom(zoom);
	opt.e.preventDefault();
	opt.e.stopPropagation();
});
