JSM.SVGViewer = function ()
{
	this.canvas = null;
	this.cameraMove = null;
	this.settings = null;
	this.bodies = null;
	this.hiddenLine = null;
	this.mouse = null;
	this.touch = null;
};

JSM.SVGViewer.prototype =
{
	Start : function (canvasName, settings, hiddenLine)
	{
		if (!this.InitCanvas (canvasName)) {
			return false;
		}

		if (!this.InitSettings (settings, hiddenLine)) {
			return false;
		}
		
		if (!this.InitCamera ()) {
			return false;
		}

		if (!this.InitEvents ()) {
			return false;
		}

		return true;
	},

	InitCanvas : function (canvasName)
	{
		this.bodies = [];
		this.canvas = document.getElementById (canvasName);
        if (!this.canvas) {
			return false;
		}
		return true;
	},
	
	InitSettings : function (settings, hiddenLine)
	{
		this.settings = {
			'cameraEyePosition' : [1.0, 1.0, 1.0],
			'cameraCenterPosition' : [0.0, 0.0, 0.0],
			'cameraUpVector' : [0.0, 0.0, 1.0],
			'fieldOfView' : 45.0,
			'nearClippingPlane' : 0.1,
			'farClippingPlane' : 1000.0
		};
		this.hiddenLine = false;
	
		if (settings != undefined) {
			if (settings['cameraEyePosition'] !== undefined) this.settings['cameraEyePosition'] = settings['cameraEyePosition'];
			if (settings['cameraCenterPosition'] !== undefined) this.settings['cameraCenterPosition'] = settings['cameraCenterPosition'];
			if (settings['cameraUpVector'] !== undefined) this.settings['cameraUpVector'] = settings['cameraUpVector'];
			if (settings['fieldOfView'] !== undefined) this.settings['fieldOfView'] = settings['fieldOfView'];
			if (settings['nearClippingPlane'] !== undefined) this.settings['nearClippingPlane'] = settings['nearClippingPlane'];
			if (settings['farClippingPlane'] !== undefined) this.settings['farClippingPlane'] = settings['farClippingPlane'];
			if (hiddenLine !== undefined) this.hiddenLine = hiddenLine;
		}
		
		return true;
	},

	InitCamera : function (canvasName)
	{
		this.cameraMove = new JSM.Camera (this.settings['cameraEyePosition'], this.settings['cameraCenterPosition'], this.settings['cameraUpVector']);
		if (!this.cameraMove) {
			return false;
		}

		return true;
	},

	InitEvents : function ()
	{
		this.mouse = new JSM.Mouse ();
		if (!this.mouse) {
			return false;
		}

		this.touch = new JSM.Touch ();
		if (!this.touch) {
			return false;
		}

		var myThis = this;
		
		if (document.addEventListener) {
			document.addEventListener ('mousemove', function (event) {myThis.OnMouseMove (event);});
			document.addEventListener ('mouseup', function (event) {myThis.OnMouseUp (event);});
		}

		if (this.canvas.addEventListener) {
			this.canvas.addEventListener ('mousedown', function (event) {myThis.OnMouseDown (event);}, false);
			this.canvas.addEventListener ('DOMMouseScroll', function (event) {myThis.OnMouseWheel (event);}, false);
			this.canvas.addEventListener ('mousewheel', function (event) {myThis.OnMouseWheel (event);}, false);
			this.canvas.addEventListener ('touchstart', function (event) {myThis.OnTouchStart (event);}, false);
			this.canvas.addEventListener ('touchmove', function (event) {myThis.OnTouchMove (event);}, false);
			this.canvas.addEventListener ('touchend', function (event) {myThis.OnTouchEnd (event);}, false);
		}
		
		return true;
	},

	AddBody : function (body, materials)
	{
		this.bodies.push ([body, materials]);
	},
	
	RemoveBodies : function ()
	{
		this.bodies = [];
    },

	Resize : function ()
	{
		this.Draw ();
	},

	Draw : function ()
	{
		var i, bodies;
		var svgSettings = new JSM.SVGSettings (this.cameraMove, this.settings['fieldOfView'], this.settings['nearClippingPlane'], this.settings['farClippingPlane'], this.hiddenLine);
		
		svgSettings.clear = false;
		while (this.canvas.lastChild) {
			this.canvas.removeChild (this.canvas.lastChild);
		}
		
		for (i = 0; i < this.bodies.length; i++) {
			body = this.bodies[i];
			JSM.ExportBodyToSVG (body[0], body[1], svgSettings, this.canvas);
		}

		return true;
	},
	
	OnMouseDown : function (event)
	{
		this.mouse.Down (event);
	},

	OnMouseMove : function (event)
	{
		this.mouse.Move (event);
		if (!this.mouse.down) {
			return;
		}
		
		var ratio = -0.5;
		this.cameraMove.Orbit (this.mouse.diffX * ratio, this.mouse.diffY * ratio);
		
		this.Draw ();
	},
	
	OnMouseUp : function (event)
	{
		this.mouse.Up (event);
	},
	
	OnMouseOut : function (event)
	{
		this.mouse.Out (event);
	},

	OnMouseWheel : function (event)
	{
		var eventParameters = event;
		if (eventParameters === null) {
			eventParameters = window.event;
		}
		
		var delta = 0;
		if (eventParameters.detail) {
			delta = -eventParameters.detail;
		} else if (eventParameters.wheelDelta) {
			delta = eventParameters.wheelDelta / 40;
		}
	
		var zoomIn = delta > 0;
		this.cameraMove.Zoom (zoomIn);
		this.Draw ();
	},
	
	OnTouchStart : function (event)
	{
		this.touch.Start (event);
	},

	OnTouchMove : function (event)
	{
		this.touch.Move (event);
		if (!this.touch.down) {
			return;
		}
		
		var ratio = -0.5;
		this.cameraMove.Orbit (this.touch.diffX * ratio, this.touch.diffY * ratio);
		
		this.Draw ();
	},

	OnTouchEnd : function (event)
	{
		this.touch.End (event, this.canvas);
	}
};
