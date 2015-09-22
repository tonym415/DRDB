// initialize recipe object
var theme = 'ui-sunny'
var recipe = { } 

var recipeApp = angular.module("recipeApp", ["jqwidgets"]);



recipeApp.controller("RecipeController", function($scope){
	$scope.theme = theme
	$scope.lists = ['categories', 'ingredients', 'ingredient_descriptors','measurements'] // add 'source' after creative dev complete
	$scope.recipeDisplayData = [
		'recipeTitle',
		'image',
		'drp_categories',
		'description',
		'servingSize',
		'recipeSource',
		'ttc',
		'hands_on_time'
		]
	// image upload settings
	$scope.imgUploadSettings = { 
		width: 300, 
		fileInputName: 'imgUpload', 
		uploadUrl: 'cgi-bin/recipe.py', 
		accept: 'image/*', 
		multipleFilesUpload: false
	}
																												 
	// generic button settings
	$scope.genButtonsSettings = { 
		theme: $scope.theme,
		width: '150'	
	};

	$scope.setRecipeInfo = function(){
	// updates the recipe object with values from the "info" popup
		$.each($scope.recipeDisplayData,function(idx, val){
			// handle combobox and non-combobox entries
			if( $('#' + val).attr('role') == 'combobox'){
				// get all selected items
				var items = $("#" + val).jqxComboBox('getSelectedItems');
				// create a container for id's of the text values
				var itemIDs = []
				var str = "";
				for (var i = 0; i < items.length; i++) {
					// add to item 'id' array
					itemIDs.push(items[i].value)
					// create comma separated string of values selected
					str += items[i].label;
					if (i < items.length - 1) str += ", ";
				}
				// create place in recipe for additions
				recipe[val] = str;
				recipe[val.slice(4)] = itemIDs
			}else{
				recipe[val] = $('#' + val).val();
			}
		});
		localStorage.setItem('recipe', JSON.stringify(recipe))
		$scope.updateTemplate();
	//	closePopup()
	};

	$scope.updateTemplate = function(){
	// updates the ui with the current values of the recipe object
		$.each($scope.recipeDisplayData,function(idx, val){
			if (recipe[val] != undefined){
				$('#display_' + val).text(recipe[val]);
				if (recipe[val] != ""){
					$('#' + val + '_info').show();
				}else{
					$('#' + val + '_info').hide();
				}
			}else{
				$('#' + val + '_info').hide();
			}
		});
	}

	// init combo
	$scope.ingredientsData = function(){
	// send the config data for the ingredients combobox
		var data = {
			'function' : 'select',
			'entity': "ingredients",
			'cols': ["ingredient_id", "ingredient_name"]
		}
		return $scope.getConfig(data)
	};

	$scope.measurementsData = function(){
	// send the config data for the ingredients combobox
		var data = {
			'function' : 'select',
			'entity': "measurements",
			'cols': ["measurement_id", "measurement_name", "abbreviation"]
		}
		return $scope.getConfig(data)
	};


	$scope.ingredient_descriptorsData = function(){
	// send the config data for the ingredients combobox
		var data = {
			'function' : 'select',
			'entity': "ingredient_descriptors",
			'cols': ["ingredient_descriptor_id", "descriptor_text"]
		}
		return $scope.getConfig(data)
	};

	$scope.categoriesData = function(){
	// send the config data for the ingredients combobox
		var data = {
			'function' : 'select',
			'entity': "categories",
			'cols': ["category_id", "category_name"]
		}
		return $scope.getConfig(data)
	};

	// special configs for comboboxes
	$scope.ingredientsConfig = function(){
		return { 
			multiSelect: true,
			placeHolder: 'Choose an ingredient'
		}
	};

	$scope.categoriesConfig = function(){
		return { 
			multiSelect: true,
			placeHolder: 'Choose one or more categories'
		}
	};

	$scope.ingredient_descriptorsConfig = function(){
		return { 
			multiSelect: true,
			placeHolder: 'Choose one or more descriptors'
		}
	};

	$scope.measurementsConfig = function(){
		return {
			placeHolder: 'Choose a measurement',
			renderer: function(index, label, value){
				var dataRecord = this.records[index]
				if (typeof dataRecord != 'undefined'){
				var table = '<table><tr><td>' + dataRecord.measurement_name + '</td><td>(' + dataRecord.abbreviation + ')</td></tr></table'
				return table
				}
			}
		}
	};

	$scope.getAdapter = function(source){
		// returns a dataadapter prepacked with source data
		var dataAdapter = new $.jqx.dataAdapter(source,
		{
			loadServerData: function(serverData, source, callback){
				$.ajax({
					dataType: source.datatype,
					type: 'POST',
					async: false,
					url: source.url,
					data: source.data,
					success: function(data, status, xhr){
						callback({records: data[0].data})
					}
				});
			}
		});
		return dataAdapter
	};

	$scope.getConfig = function(data){		
		// creates the config structure for combobox
		datafields = function(info){
			// create datafield array for the combobox adapter 
			fields = []
			for (var i = 0; i < info.length; i++){
				fields.push({name : info[i] })
			}
			return fields
		}

		var config = {
			type: 'POST',
			datatype: "json",
			datafields: datafields(data.cols),
			url: "cgi-bin/recipe.py",
			data: {'send': JSON.stringify(data)} 
		};
		return config
	};


	$scope.loadCmb = function(cmbName){
	// load combobox with specific config for the dataadapter
			config = $scope[cmbName + "Data"]()
			adapter =  $scope.getAdapter(config)
			// get displayMember and valueMember
			display = ""
			value  = ""
			for (var i = 0; i < config.datafields.length; i++){
				if (config.datafields[i]['name'].slice(-3) == '_id') {
					value = config.datafields[i]['name'] 
				} else {
					display = config.datafields[i]['name'] 
				}
				if (value != "" && display != "") { break; }	
			}
			// generic combobox settings
			comboSettings = { 
				width: '100%', 
				animationType: 'fade',
				autoComplete: true,
				theme: $scope.theme,
				source: adapter,
				displayMember: display,
				valueMember: value
			}
			// add additional configurations
			if (typeof $scope[cmbName + "Config"] != 'undefined'){
				// merge generic with specific settings
				$.extend(comboSettings, $scope[cmbName + "Config"]())
			}
			// create combo
			$('#drp_' + cmbName).jqxComboBox(comboSettings);
	};

	$scope._initCombos = function(){
		for (var i = 0; i < $scope.lists.length; i++){
			$scope.loadCmb($scope.lists[i]);
		}
	};

	$scope.submitData = function(ev){
		// submits the administrative data by parsing the structure of the fieldset
		reloadCmb = false
		obj = ev.currentTarget
		// create data dictionary too send to backend for processing
		data = {}
		// find parent fieldset id
		var parentID = $(obj).parents('fieldset')[0].id 
		var entity = data["entity"] = parentID.slice(0, -5) // cut off '_data' from the id string
		data["function"] = $(obj).val() 
		data["cols"] = []

		// test to see if the entity is in the combobox array and need to be reloaded
		reloadCmb =  ($scope.lists.indexOf(entity) > -1)

		// retrieve all inputs not including the button element
		elData = $('#' + parentID + ' :input').not(':button')
		$.each(elData, function(idx, val){
			// add data to the dictionary
			if (val.id != val.value){
					itm = {}
					itm[val.id] = val.value
					data['cols'].push(itm)
						
					// clear value from form
					$(val).val('')
			}else{
				data['id'] = val.value
			}
		});
		//console.log(JSON.stringify(data))

		// stringify data to preserve column array structure
		senddata = JSON.stringify(data)
		
		// create object to send as posted data
		sData = { 'send' : senddata } 
		
		// send data to db
		$.ajax({
			url: 'cgi-bin/recipe.py',
			data: sData,
			type: 'POST',
			datatype: 'json',
			complete: function(returnData){
				data = JSON.parse(returnData.responseText)[0]
				$('#message').jqxNotification({
						theme: theme, 
						appendContainer: '#' + parentID,
						width: 250, opacity: 0.8,
						autoOpen: false, animationOpenDelay: 800, autoClose: true, 
						autoCloseDelay: 3000,
						template: data.status
				});
				if (typeof(data) == 'object'){
					$('#message').text(data.message);	
				}else{
					$('#message').html(returnData.responseText);	
				}
				$('#message').jqxNotification('open');
			}
		});
		//
		if (reloadCmb){
			$scope.loadCmb(entity)
		}
	};

	// admin buttons
	$('.admin').jqxButton($scope.genButtonsSettings);
	$('.admin').click({ param: this}, $scope.submitData);
	$("#navigationBar").jqxNavigationBar({ theme: $scope.theme, width: 500, height: 600, expandMode: 'toggle' });

	
	// initialize tabs
	$("#jqxTabs").jqxTabs({theme: $scope.theme});
	
	// initialize image upload inputs
	// $('#recipe_img, #recipe_directions_image').each(function(){
	// 	$(this).jqxFileUpload($scope.imgUploadSettings);
	// });

	// initialize wizard
	$('#wizWindow').jqxWindow({ 
				theme: $scope.theme,
				title: "Recipe Entry Wizard", 
				height: '400px', 
				width: '700px', 
				isModal: true, 
				modalOpacity: '0.2', 
				initContent: function(){
					$('#wizTabs').jqxTabs({ theme: $scope.theme, height: '100%', width: '100%'});
				}
			});

	$('#init_wizard').jqxButton($scope.genButtonsSettings);
	$('#init_wizard').on('click',function(){
			$('#wizWindow').jqxWindow('open');
			$('#wizWindow').jqxWindow('focus')
	});

	$(':button').jqxButton($scope.genButtonsSettings);
	$('#submitRecipeInfo').on('click', $scope.setRecipeInfo)
	$('#sv_ingredients').jqxScrollView({ buttonsOffset: [0,0]})
	$("input[name='ingredients_crud']:checked").on('checked', function(event){
		$('#sv_ingredients').jqxScrollView('changePage', parseInt( $(this).val))
	});

	// initialize form validator
	$('#rInfoForm').jqxValidator({
		hintType: 'label',
		onError: function(event) { return false; },
		onSuccess: function(event) {  
			$scope.setRecipeInfo();
		},
		rules: [{
			input: '#recipeTitle',
			message: 'Recipe name required',
			action: 'keyup, blur',
			rule: 'required'
		},{
			input: '#servingSize',
			message: 'Serving size must be numeric',
			action: 'keyup, blur',
			rule: function(){
				return $.isNumeric( $('#servingSize').val());
			}
		},{
			input: '#hands_on_time',
			message: 'Hands on time must be numeric',
			action: 'keyup, blur',
			rule: function(){
				return ($.isNumeric( $('#hands_on_time').val()));
			}
		},{
			input: '#ttc',
			message: 'Time to cook must be numeric',
			action: 'keyup, blur',
			rule: function(){
				return $.isNumeric( $('#ttc').val());
			}
		}]
	});

	// initialize combo boxes in forms
	$scope._initCombos()

	$scopeclearForm = function(form){
		// clears all from input elements 
		$.each($('#' + form + ' :input')
			.not(':button, :submit, :reset, :hidden'), function(idx, val){ $(val).val('')});
		}
});


