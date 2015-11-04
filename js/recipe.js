//$(document).ready(function(){
		// initialize recipe object
		var recipe = { };

		var recipeApp = angular.module("recipeApp", ["jqwidgets"]);

		function hideMenu(id){
			// change css for menu wrapper
			$('#' + id).parents('div').css({
				'left': '-6px',
				'opacity': 0,
				'display' : 'none'
			});
			// change menu items
			$('#' + id).css('display', 'none');
			$('#' + id).siblings().css('display', 'none');
		}

		recipeApp.controller("RecipeController", function($scope){
			$scope.theme = "ui-sunny";
			$scope.objRecipe = {
				"Recipe_Title": "Recipe_Name"
			};

			$("#navigationBar").jqxNavigationBar({ theme: $scope.theme, width: 500, height: 600, expandMode: 'toggle' });
			/*$("#jqxMenu").jqxMenu({ theme: $scope.theme, autoCloseOnClick: true, width: '100%', height: '32px', autoSizeMainItems: true});
			$("#jqxMenu").jqxMenu('minimize');
			$("#jqxMenu").css('visibility', 'visible');
			*/
			// initialize tabs
			$("#jqxTabs").jqxTabs({theme: $scope.theme});
			$("#jqxTabs").on('selected', function(event){
				hideMenu('rInfo');
			});

			// init combo
			data = {
					'function' : 'select',
					'entity': "ingredients",
					'cols': ["ingredient_id", "ingredient_name"]
				};
			sendData = JSON.stringify(data);
			sdata = {'send': sendData};

			var source = {
				datatype: "json",
				datafields: [{
					id: 'ingredient_id',
					name: 'ingredient_name'
				}],
				url: "cgi-bin/recipe.py",
				data: sdata
			};
			var dataAdapter = new $.jqx.dataAdapter(source);
			$('#ingredients').jqxComboBox({
					width: 200, theme: $scope.theme,
					height: 25,
					source: dataAdapter,
					displayMember: "ingredient_name",
					valueMember: "ingredient_id"
			});


		});


		function submitData(obj){
				// create data dictionary to send to backend for processing
				data = {};
				// find parent fieldset id
				var parentID = $(obj).parents('fieldset')[0].id;
				data.entity = parentID.slice(0, -5); // cut off '_data' from the id string
				data.function = $(obj).val();
				data.cols = [];
				// retrieve all inputs not including the button element
				elData = $('#' + parentID + ' :input').not(':button');
				$.each(elData, function(idx, val){
					// add data to the dictionary
					if (val.id != val.value){
							itm = {};
							itm[val.id] = val.value;
							data.cols.push(itm);

							// clear value from form
							$(val).val('');
					}else{
						data.id = val.value;
					}
				});
				console.log(JSON.stringify(data));

				// stringify data to preserve column array structure
				senddata = JSON.stringify(data);

				// create object to send as posted data
				sData = { 'send' : senddata };

				// send data to db
				$.ajax({
					url: 'cgi-bin/recipe.py',
					data: sData,
					type: 'POST',
					datatype: 'jsonp',
					done: function(){

					},
					success: function(returnData){
						$('#message').jqxNotification({
								appendContainer: '#' + parentID,
								width: 250, opacity: 0.8,
								autoOpen: false, animationOpenDelay: 800, autoClose: true,
								autoCloseDelay: 3000,
								template: "success"
						});
						$('#message').text(JSON.parse(JSON.stringify(returnData)));
						//$('#message').text('Data saved</br>' + returnData);
						$('#message').jqxNotification('open');
					},
					error: function(returnData){
						$('#message').jqxNotification({
								appendContainer: '#' + parentID,
								width: 250, opacity: 0.8,
								autoOpen: false, animationOpenDelay: 800, autoClose: false,
								autoCloseDelay: 3000,
								template: "error"
						});
						if (typeof(returnData) == 'object'){
							$('#message').text(JSON.parse(JSON.stringify(returnData.responseText)));
						}else{
							$('#message').html(returnData.responseText);
						}
						$('#message').jqxNotification('open');
					}
				});
		}

		function openPopup(id){
			// hide menu
			hideMenu(id);
			// open data entry dialogs

			var title = "";
			switch(id){
				case 'rInfo':
					title = "Enter Recipe Info";
					break;
				case 'rImage':
					title = "Upload Recipe Image";
					break;
				case 'rIngredient':
					title = "Enter an ingredient";
					break;
				case 'rDirection':
					title = "Add Direction";
					break;
				default:
					title = "Info";
			}


			// run specific initialization function
			var func = 'init_' + id + '()';
			var tmpFunc = new Function(func);

			var el = $('#rPopup');

			// check to see if the form has already been loaded
			if (el.find('form#' + id + 'Form').length === 0){
					// retrieve popup content template
					$('#windowContent').load('templates.html #' + id + 'Form');

					el.jqxWindow({
						title: title,
						height: '350px',
						width: '675px',
						isModal: true,
						modalOpacity: '0.2'
					});
			}

			// open popup window
			el.jqxWindow('open');
			el.jqxWindow('focus');
			tmpFunc();
		}

		function setRecipeInfo(){
			// updates the recipe object with values from the "info" popup
			data = ['recipeTitle','description','servingSize','recipeSource','ttc','hands_on_time'];

			$.each(data,function(idx, val){
				recipe[val] = $('#' + val).val();
			});
			updateTemplate();
			closePopup();
		}

		function closePopup(){
			$('#rPopup').jqxWindow('close');
		}

		function clearForm(form){
			// clears all from input elements
			$.each($('#' + form + ' :input').not(':button, :submit, :reset, :hidden'), function(idx, val){ $(val).val('');});
		}

		function updateTemplate(){
			// updates the ui with the current values of the recipe object
			info = ['recipeTitle','description','servingSize','recipeSource','ttc','hands_on_time'];
			$.each(info, function(idx, val){
				if (recipe[val] !== undefined){
					$('#display_' + val).text(recipe[val]);
					if (recipe[val] !== ""){
						$('#' + val + '_info').show();
					}else{
						$('#' + val + '_info').hide();
					}
				}else{
					$('#' + val + '_info').hide();
				}
			});

		}


		function init_rInfo(){

				var parentWin = 'rPopup';
				$('#rInfoForm').jqxValidator('validate');

				// initialize form validator
				$('#rInfoForm').jqxValidator({
					hintType: 'label',
					onError: function(event) { return false; },
					onSuccess: function(event) {
						setRecipeInfo('rInfoForm');
						$("#" + parentWin).jqxWindow('close');
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
							return $.isNumeric( $('#hands_on_time').val());
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
		}

		function init_rIngredient(){
			var source = {
				datatype: 'jsonp',
				datafields: [{
					id: 'ingredient_id',
					name: 'ingredient_name'
				}],
				url: 'cgi-bin/recipe.py',
				data: {
					'entity': 'ingredients',
					'cols': ['ingredient_id', 'ingredient_name']
				}
			};
			var dataAdapter = new $.jqx.dataAdapter(source);
			$('#ingredients').jqxComboBox({
					width: 200,
					height: 25,
					source: dataAdapter,
					selectedIndex: 0,
					displayMember: 'ingredient_name',
					valueMember: 'ingredient_id'
			});
		}
//}
