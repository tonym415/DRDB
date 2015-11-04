/**
 *  The first JS file to be loaded. Takes care of setting up all of the 
 *  required paths
 */

// configure RequireJS
requirejs.config({
	baseURL: "assets/js",
	paths: {
		// global application object
		app: 'app',
		// The libraries to be used
		jquery: [
			'//jqueryvalidation.org/files/lib/jquery-1.11.1',
			//'//code.jquery.com/jquery-1.11.3.min',
			// if the CDN location fails, load from this location
			//'lib/jquery-1.11.3'
		],
		jqueryUI: [
			'//code.jquery.com/ui/1.11.4/jquery-ui.min',
			// if the CDN location fails, load from this location
			'lib/jquery-ui'
		],
		validate: [
			'//cdn.jsdelivr.net/jquery.validation/1.14.0/jquery.validate',
			//'//ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate',
			// if the CDN location fails, load from this location
			'lib/jquery.validate'	
		],
		// plugins
		flipclock: 'lib/flipclock',
		cookie: 'lib/jquery-cookie', 
		steps: 'lib/jquery.steps',
		jqGrid: 'lib/jquery.jqGrid',
		blockUI: 'lib/jquery.blockUI',
		avatar: 'lib/avatar'	
	}
});
