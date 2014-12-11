CKEDITOR.dialog.add('gapmatchelement-dialog', function (editor) {
	var firstFocusIndex = null;
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

    /**
     * Get score for choiceIdentifier
     * @param {jQuery selector} $element
     * @param {String} text of answer choice
     * @param {String} id of answer choice
     * @param {boolean} mappingFlag
     * @param {boolean/string} score (correctResponse/points)
     * @param {String} defaultValue
     * @return {String} score value (correctResponse is boolean value; mapping is null or integer).
     */
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

	function loadTabFocus(dialog, $element) {
		var focusIndex = 0;
		var element = dialog.getContentElement('tab-gapmatchelement', 'correctAnswerControls');

		var mapEntries = $(element.getElement().$).find('input.gapmatchelement-points');
		mapEntries.each(function () {
			dialog.addFocusable(new CKEDITOR.dom.element($(this)[0]), focusIndex++);
		});

		$element.off('keypress', '.gapmatchelement-correctness').on('keypress', '.gapmatchelement-correctness', function (e) {
			if (e.charCode == 32)
				$(this).click();
		});
	}

    return {
		title: 'Gap Match Element',
		minWidth: 400,
		minHeight: 300,

		onLoad: function (evt) {
		},

		onFocus: function () {
			var dialog = this;
			var element = dialog.getContentElement('tab-gapmatchelement', 'correctAnswerControls');
			var points = $(element.getElement().$).find('input.gapmatchelement-points')[0];
			if (points) {
				dialog._.currentFocusIndex = firstFocusIndex;
				return points;
			}
			else return false;
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

								// Map_Response addjustments
								if (template == 'map_response') {
									$element.find('.gapmatchelement-header').html("Point Value Scoring");

								if (gapProps.defaultValue)
									$element.find('.gapmatchelement-notes').append('<div>Default Value: ' + gapProps.defaultValue + '</div>');
								if (gapProps.lowerBound)
									$element.find('.gapmatchelement-notes').append('<div>Lower Bound: ' + gapProps.lowerBound + '</div>');
								if (gapProps.upperBound)
									$element.find('.gapmatchelement-notes').append('<div>Upper Bound: ' + gapProps.upperBound + '</div>');
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
									var score = getScore(widgetIdentifier, (template=='map_response'), scoreData, choiceIdentifier);
									var defaultValue = (gapProps.defaultValue) ? gapProps.defaultValue : null;
									var row = addNewChoice($element, choiceObj[choiceIdentifier], choiceIdentifier, (template=='map_response'), score, defaultValue, this.getDialog());
								}

								loadTabFocus(this.getDialog(),$element);
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

								var responseDeclaration = { identifier: 'RESPONSE', baseType: 'identifier' };

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
											// Remove a hardcoded score equal to defaultValue
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

								// This is not the final cardinality result, since all the gapMatchElement are cumulative.
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
