CKEDITOR.dialog.add('gapmatchelement-dialog', function (editor) {

	var choiceTemplate =
		'<tr>' +
			'<td class="gapmatchelement-mapping">' +
				'<input class="gapmatchelement-points" type="text">' +
			'</td>' +
			'<td class="gapmatchelement-correctness gapmatchelement-eee gapmatchelement-incorrect  gapmatchelement-correct">' +
				'<span class="icon"></span>' +
				'<span class="label"></span>' +
			'</td>' +
			'<td>' +
			'<input class="gapmatchelement-textinput" type="text" disabled>' +
			'</td>' +
		'</tr>';

	function randomIdentifier() {
		return "ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 23)) + Math.floor(Math.random() * 1e8);
	}

	function showHidePoints(instance, show) {
		instance.find('.gapmatchelementinteraction-points').css('visibility', show ? '' : 'hidden');
	}



	function addNewChoice($element, text, id, mappingFlag, score, defaultValue) {
		var newChoice = $(choiceTemplate);
		newChoice.find('.gapmatchelement-textinput').val(text);
		newChoice.find('.gapmatchelement-correctness').attr('data-identifier', id);
		if (!mappingFlag) {
			newChoice.find('.gapmatchelement-mapping').hide();
			newChoice.find('.gapmatchelement-correctness').toggleClass('gapmatchelement-correct', score);
			newChoice.find('.gapmatchelement-correctness').toggleClass('gapmatchelement-incorrect', !score);
		} else {
			newChoice.find('.gapmatchelement-correctness').hide();
			newChoice.find('.gapmatchelement-points').attr('data-identifier', id);
			if (typeof(score) == 'string')
				newChoice.find('.gapmatchelement-points').val(score)
			if (typeof(defaultValue) == 'string')
				newChoice.find('.gapmatchelement-points').attr('placeholder', defaultValue);

		}

		$element.find('.gapmatchelement-score-table > tbody').append(newChoice);
		return newChoice;
	}

	function fixTabOrder(dialog) {
		var element = dialog.getContentElement('tab-gapmatchelement', 'correctAnswerControls');
		var $element = $(element.getElement().$);
		var focusIndex = 0;

		// Remove all our own inputs from focusList leaving only ok and cancel buttons.
		dialog._.focusList.splice(0, dialog._.focusList.length-2);

		// Add our inputs back in
		$element.find('li').each(function () {
			if (!$(this).is('.gapmatchelement-inactive'))
				dialog.addFocusable(new CKEDITOR.dom.element($(this).find('.gapmatchelement-correctness')[0]), focusIndex++);
			dialog.addFocusable(new CKEDITOR.dom.element($(this).find('.gapmatchelement-textinput')[0]), focusIndex++);
		});

		var addPointValue = $element.find('.gapmatchelement-addpointvalue');
		//dialog.addFocusable(new CKEDITOR.dom.element(addPointValue[0]), focusIndex++);

		// Must fix focusIndex of every focusable item.
		for (var i=0; i<dialog._.focusList.length; ++i)
			dialog._.focusList[i].focusIndex = i;
	}

	function fixDialogFocus(dialog, newFocus) {
		for (var i=0; i<dialog._.focusList.length; ++i) {
			var focusable = dialog._.focusList[i];
			if (focusable.element && focusable.element.$ == newFocus) {
				dialog._.currentFocusIndex = i;
				return;
			}
		}
	}

    /**
     * Get score for choiceIdentifier
     * @param {String} widgetIdentifier
     * @param {boolean} mappingFlag
     * @param {Array} scoreData
     * @param {String} choiceIdentifier
     * @return {String} score value (correctResponse is boolean value; mapping is null or integer).
     */
	function getScore(widgetIdentifier, mappingFlag, scoreData, choiceIdentifier) {
		var result = (mappingFlag) ? null : false;
		if (scoreData != null) {
			for (var i=0; i<scoreData.length; ++i) {
				var answer = scoreData[i];
				if (mappingFlag && (answer.mapKey.indexOf(widgetIdentifier) > -1)) {
					if (choiceIdentifier == answer.mapKey.replace(widgetIdentifier, "").trim()) {
						return answer.mappedValue;
					}
				} else if (!mappingFlag && (answer.indexOf(widgetIdentifier) > -1)) {
					if (choiceIdentifier == answer.replace(widgetIdentifier, "").trim()) {
						return true;
					}
				}
			}
		}
		return result;
	}




	    /**
     * Get score for choiceIdentifier
     * @param {String} widgetIdentifier
     * @param {boolean} mappingFlag
     * @param {Array} scoreData
     * @return {String} score value (correctResponse is boolean value; mapping is null or integer).
     */
	function removeAllPreviousDirectedPairsForWidgetIdentifier(widgetIdentifier, mappingFlag, scoreData) {
		var result = [];
		if (scoreData != null) {
			for (var i=0; i<scoreData.length; ++i) {
				var answer = scoreData[i];
				if (mappingFlag && (answer.mapKey.indexOf(widgetIdentifier) == -1)) {
					result.push(answer);
				} else if (!mappingFlag && (answer.indexOf(widgetIdentifier) == -1)) {
					result.push(answer);
				}
			}
		}
		return result;
	}

    /**
     * Create an object of answer choices
     * @param {Array} gapText entries
     * @return {Ovject} where key is identifier and value is value.
     */
	function getChoiceObj(gapText) {
		var result = {};
		for (var i=0; i<gapText.length; ++i) {
			result[gapText[i].identifier] = gapText[i].value.trim();
		}
		return result;
	}

    return {
		title: 'Gap Match Element',
		minWidth: 400,
		minHeight: 300,

		onLoad: function (evt) {
			var dialog = this;
			var element = dialog.getContentElement('tab-gapmatchelement', 'correctAnswerControls');
			var $element = $(element.getElement().$);

			$element.off('click', '.gapmatchelement-correctness').on('click', '.gapmatchelement-correctness', function (e) {
				if ($(this).closest('li').is('.gapmatchelement-inactive'))
					return false;

				// If going from incorrect to correct, then move any other rows marked correct to incorrect.
				if ($(this).is('.gapmatchelement-incorrect'))
					$element.find('.gapmatchelement-correct').toggleClass('gapmatchelement-correct gapmatchelement-incorrect');
				$(this).toggleClass('gapmatchelement-correct gapmatchelement-incorrect');

				this.focus();

				return false;
			});

			$element.off('keypress', '.gapmatchelement-correctness').on('keypress', '.gapmatchelement-correctness', function (e) {
				if (e.charCode == 32)
					$(this).click();
			});

			$element.off('click', '.ui-icon-close').on('click', '.ui-icon-close', function (e) {
				$(this).closest('li').remove();
				fixTabOrder(dialog);
			});

			$element.off('click', '.gapmatchelement-addpointvalue').on('click', '.gapmatchelement-addpointvalue', function (e) {
				showHidePoints($element, this.checked);
			});

			$element
				.off('focus', '.gapmatchelement-correctness,.gapmatchelement-textinput,.gapmatchelement-addpointvalue')
				.on('focus', '.gapmatchelement-correctness,.gapmatchelement-textinput,.gapmatchelement-addpointvalue', function (e) {
				fixDialogFocus(dialog, this);
			});
		},

		onFocus: function () {
			var dialog = this;
			var element = dialog.getContentElement('tab-gapmatchelement', 'correctAnswerControls');
			var firstTextInput = $(element.getElement().$).find('.gapmatchelement-textinput')[0];
			dialog._.currentFocusIndex = 0;
			return firstTextInput;
		},

		contents: [
			{
				id: 'tab-gapmatchelement',
				label: 'Gap Match Element',
				title: 'Gap Match Element',
				elements: [
					{
						id: 'correctAnswerControls',
						type: 'html',
						html: '<div class="gapmatchelement-dialog">' +
								'<div class="gapmatchelement-header">Correct Response</div>' +
								'<table class="gapmatchelement-score-table">' +
								'<thead>' +
								'<tr>' +
									'<th class="gapmatchelement-header-score">Score</th>' +
									'<th>Answer</th>' +
								'</tr>' +
								'</thead>' +
								'<tbody>' +
								'</tbody></table>' +
								'<div class="gapmatchelement-notes"></div>' +
							'</div>',
						setup: function (widget) {
							var $element = $('#' + this.domId);
							if ( widget.data.gapProps && widget.data.gapText ) {
								var gapProps = JSON.parse(widget.data.gapProps);
								var gapText = JSON.parse(widget.data.gapText);
								var choiceObj = getChoiceObj(gapText);
								var mappingFlag = (gapProps.points && gapProps.points == 'false') ? false : true;
								var template = (gapProps.points && gapProps.points == 'false') ? 'match_correct' : 'map_response';

								// Clear choices and notes; and build a new list
								$element.find('tbody').empty();
								$element.find('.gapmatchelement-notes').empty();

								// Perform a one time validation check for loading existing data.
								var existingData = (widget.data && widget.data.interactionData && widget.data.interactionData.identifier
													&& widget.data.interactionData.responseDeclaration)

								// Set/Load the gap match element identifier
								var widgetIdentifier = (existingData) ? widget.data.interactionData.identifier : randomIdentifier();
								widget.setData('widgetIdentifier', widgetIdentifier);

								// Update heading for "point value scoring"
								if (mappingFlag) {
									$element.find('.gapmatchelement-header').html("Point Value Scoring");
								}

								// Prep for loading existing score data
								var scoreData = null;
								if (existingData) {
									if (widget.data.interactionData.responseDeclaration.correctResponse) {
										scoreData = widget.data.interactionData.responseDeclaration.correctResponse;
									} else if (widget.data.interactionData.responseDeclaration.mapping && widget.data.interactionData.responseDeclaration.mapping.mapEntry) {
										scoreData = widget.data.interactionData.responseDeclaration.mapping.mapEntry;
									}
								}

								for (var choiceIdentifier in choiceObj) {
									// Get either the boolean/point value for existing score data, if exists.
									var score = getScore(widgetIdentifier, mappingFlag, scoreData, choiceIdentifier);
									var defaultValue = (gapProps.defaultValue) ? gapProps.defaultValue : null;
									var row = addNewChoice($element, choiceObj[choiceIdentifier], choiceIdentifier, mappingFlag, score, defaultValue);
								}

								if (gapProps.defaultValue)
									$element.find('.gapmatchelement-notes').append('<div>Default Value: ' + gapProps.defaultValue + '</div>');
								if (gapProps.lowerBound)
									$element.find('.gapmatchelement-notes').append('<div>Lower Bound: ' + gapProps.lowerBound + '</div>');
								if (gapProps.upperBound)
									$element.find('.gapmatchelement-notes').append('<div>Upper Bound: ' + gapProps.upperBound + '</div>');

								//fixTabOrder(this.getDialog());
							}
						},
						commit: function (widget) {
							var $element = $('#' + this.domId);

							if ( widget.data.gapProps && widget.data.gapText ) {
								var gapProps = JSON.parse(widget.data.gapProps);
								var gapText = JSON.parse(widget.data.gapText);
								var template = (gapProps.points && gapProps.points == 'false') ? 'match_correct' : 'map_response';

								// Perform a one time validation check for loading existing data.
								var existingData = (widget.data && widget.data.interactionData && widget.data.interactionData.identifier
													&& widget.data.interactionData.responseDeclaration);
								// Prep for loading existing score data
								var scoreData = null;
								if (existingData) {
									if (widget.data.interactionData.responseDeclaration.correctResponse) {
										scoreData = widget.data.interactionData.responseDeclaration.correctResponse;
									} else if (widget.data.interactionData.responseDeclaration.mapping && widget.data.interactionData.responseDeclaration.mapping.mapEntry) {
										scoreData = widget.data.interactionData.responseDeclaration.mapping.mapEntry;
									}
								}

								var responseDeclaration = { identifier: 'RESPONSE', baseType: 'identifier', cardinality: 'single' };

								// Get the existing result, if exists, and remove an directedPair for this widgetIdentifier
								var widgetIdentifier = widget.data.widgetIdentifier;
								var scoreResult = removeAllPreviousDirectedPairsForWidgetIdentifier(widgetIdentifier, (template=='map_response'), scoreData);

								// Retrieve the score for this widgetIdentifier, and add it to the scoreResult
								switch (template) {
								case 'match_correct':
									$element.find('.gapmatchelement-correct').each(function () {
										scoreResult.push($(this).attr('data-identifier') + " " + widgetIdentifier);
									});
									responseDeclaration.correctResponse = (scoreResult.length == 1) ? scoreResult[0] : scoreResult;
									break;

								case 'map_response':
									var mapping = {};
									if (gapProps.defaultValue)
										mapping.defaultValue = gapProps.defaultValue;
									if (gapProps.lowerBound)
										mapping.lowerBound = gapProps.lowerBound;
									if (gapProps.upperBound)
										mapping.upperBound = gapProps.upperBound;
									$element.find('.gapmatchelement-points').each(function () {
										var points = ($(this).val().trim().length > 0) ? parseInt($(this).val()) : null;
										if (typeof(points) == 'number') {
											// Rule out a score of defaultValue
											var defaultValue = (gapProps.defaultValue) ? gapProps.defaultValue : null;
											if (defaultValue != null && (points == parseInt(defaultValue))) {
												points = null;
											}
											if (points != null) {
												var mapKey = widgetIdentifier + " " + $(this).attr('data-identifier');
												var mappedValue = $(this).val().trim();
												scoreResult.push({ mapKey: mapKey, mappedValue: mappedValue });
											}
										}
									});
									if (scoreResult.length > 0) {
										mapping.mapEntry = (scoreResult.length == 1) ? scoreResult[0] : scoreResult;
										responseDeclaration.mapping = mapping;
									}
									break;

								default:
									throw new Error("Unimplemented");
								}

								// Adjust cardinality if necessary
								responseDeclaration.cardinality = (scoreResult.length > 1) ? 'multiple' : 'single';

								widget.setData('interactionData', {
									identifier: widgetIdentifier,
									responseDeclaration: responseDeclaration
								});
							}
						}
					}
				]
			}
		]
    };
});

// Local Variables:
// tab-width: 4
// End:
