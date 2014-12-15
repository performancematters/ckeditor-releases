CKEDITOR.dialog.add('gap-dialog', function (editor) {
	var firstFocusIndex = null;
	var choiceTemplate =
	    '<tr>' +
		'<td class="gap-mapping">' +
		    '<input class="gap-points" type="text">' +
		'</td>' +
		'<td class="gap-correctness gap-eee gap-incorrect  gap-correct">' +
		    '<span class="icon"></span>' +
		    '<span class="label"></span>' +
		'</td>' +
		'<td>' +
		'<div class="gap-correct-text">' +
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
	    newChoice.find('.gap-correct-text').html(text);
	    newChoice.find('.gap-correctness').attr('data-identifier', id);
	if (!mappingFlag) {
	    newChoice.find('.gap-mapping').hide();
	    newChoice.find('.gap-correctness').toggleClass('gap-correct', score);
	    newChoice.find('.gap-correctness').toggleClass('gap-incorrect', !score);
	} else {
	    newChoice.find('.gap-correctness').hide();
	    newChoice.find('.gap-points').attr('data-identifier', id);
	    if (typeof(score) === 'string')
		newChoice.find('.gap-points').val(score);
	    if (defaultValue)
	    	newChoice.find('.gap-points').attr('data-default', defaultValue);
	}

	$element.find('.gap-score-table > tbody').append(newChoice);
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
		    if (choiceIdentifier === answer.mapKey.replace(widgetIdentifier, "").trim()) {
			return answer.mappedValue;
		    }
		} else if (!mappingFlag && (answer.indexOf(widgetIdentifier) > -1)) {
		    if (choiceIdentifier === answer.replace(widgetIdentifier, "").trim()) {
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
		if (mappingFlag && (answer.mapKey.indexOf(widgetIdentifier) === -1)) {
		    result.push(answer);
		} else if (!mappingFlag && (answer.indexOf(widgetIdentifier) === -1)) {
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
	var element = dialog.getContentElement('tab-gap', 'correctAnswerControls');

	var mapEntries = $(element.getElement().$).find('input.gap-points');
	mapEntries.each(function () {
		dialog.addFocusable(new CKEDITOR.dom.element($(this)[0]), focusIndex++);
	});

	$element.off('keypress', '.gap-correctness').on('keypress', '.gap-correctness', function (e) {
	    if (e.charCode === 32)
		$(this).click();
	});
    }

    return {
	title: 'Gap',
	minWidth: 400,
	minHeight: 300,

	onLoad: function (evt) {
	    var dialog = this;
	    var element = dialog.getContentElement('tab-gap', 'correctAnswerControls');
	    var $element = $(element.getElement().$);

	    $element.off('click', '.gap-correctness').on('click', '.gap-correctness', function (e) {
		if ($(this).closest('li').is('.gap-inactive'))
		    return false;

		// If going from incorrect to correct, then move any other rows marked correct to incorrect.
		if ($(this).is('.gap-incorrect'))
		    $element.find('.gap-correct').toggleClass('gap-correct gap-incorrect');
		$(this).toggleClass('gap-correct gap-incorrect');

		this.focus();

		return false;
	    });

	    $element.off('keypress', '.gap-correctness').on('keypress', '.gap-correctness', function (e) {
		if (e.charCode === 32)
		    $(this).click();
	    });
	},

	onFocus: function () {
	    var dialog = this;
	    var element = dialog.getContentElement('tab-gap', 'correctAnswerControls');
	    var points = $(element.getElement().$).find('input.gap-points')[0];
	    if (points) {
		dialog._.currentFocusIndex = firstFocusIndex;
		return points;
	    }
	    else return false;
	},

	contents: [
	    {
		id: 'tab-gap',
		label: 'Gap Element',
		title: 'Gap Element',
		elements: [
		    {
			id: 'correctAnswerControls',
			type: 'html',
			html: '<div class="gap-dialog">' +
				    '<div class="gap-header">Correct Response</div>' +
				    '<table class="gap-score-table">' +
				    '<thead>' +
				    '<tr>' +
					'<th class="gap-header-score" style="text-align:center;padding:4px 0px;">Score</th>' +
					'<th>Answer</th>' +
				    '</tr>' +
				    '</thead>' +
				    '<tbody>' +
				    '</tbody></table>' +
				    '<div class="gap-notes"></div>' +
			    '</div>',
			validate: function (widget) {
			    var instance = $('#' + this.domId);
			    var template = (instance.find('.gap-header').text() === 'Correct Response') ? 'match_correct' : 'map_response';
			    switch (template) {
			    case 'match_correct':
				var correctAnswer = instance.find('.gap-correct');
				return CKEDITOR.dialog.validate.notEmpty("A correct answer is required.")(correctAnswer.toArray());

			    case 'map_response':
				var points = instance.find('.gap-points').map(function(){
				    if ($(this).val().trim())
					if ($(this).attr('data-default') && ($(this).val().trim() != $(this).attr('data-default')))
					    return $(this).val();
					else if (!$(this).attr('data-default')) return $(this).val();
				}).toArray();
				return CKEDITOR.dialog.validate.notEmpty("A point value is required for at least one answer choice.")(points);

			    default:
				    throw new Error("Unimplemented");
			    }
			},
			setup: function (widget) {
			    var $element = $('#' + this.domId);
			    if ( widget.data.gapProps && widget.data.gapText ) {
				var gapProps = JSON.parse(widget.data.gapProps);
				var gapText = JSON.parse(widget.data.gapText);
				var choiceObj = getChoiceObj(gapText);
				var mappingFlag = (gapProps.points && gapProps.points === 'false') ? false : true;
				var template = (gapProps.points && gapProps.points === 'false') ? 'match_correct' : 'map_response';

				// Clear choices and notes; and build a new list
				$element.find('tbody').empty();
				$element.find('.gap-notes').empty();

				// Perform a one time validation check for loading existing data.
				var existingData = (widget.data && widget.data.interactionData && widget.data.interactionData.identifier
							    && widget.data.interactionData.responseDeclaration)

				// Set/Load the gap match element identifier
				var widgetIdentifier = (existingData) ? widget.data.interactionData.identifier : randomIdentifier();
				widget.setData('widgetIdentifier', widgetIdentifier);

				// Map_Response addjustments
				if (template === 'map_response') {
					$element.find('.gap-header').html("Point Value Scoring");

				if (gapProps.defaultValue)
					$element.find('.gap-notes').append('<div>Default Value: ' + gapProps.defaultValue + '</div>');
				if (gapProps.lowerBound)
					$element.find('.gap-notes').append('<div>Lower Bound: ' + gapProps.lowerBound + '</div>');
				if (gapProps.upperBound)
					$element.find('.gap-notes').append('<div>Upper Bound: ' + gapProps.upperBound + '</div>');
				}

				// Prep for loading existing score data
				var scoreData = null;
				if (existingData) {
					if (widget.data.interactionData.responseDeclaration.correctResponse) {
						scoreData = widget.data.interactionData.responseDeclaration.correctResponse;
					} else if (widget.data.interactionData.responseDeclaration.mapping && widget.data.interactionData.responseDeclaration.mapping.mapEntry) {
						scoreData = widget.data.interactionData.responseDeclaration.mapping.mapEntry;
					}
					scoreData = (typeof(scoreData) === 'string') ? [scoreData] : scoreData;
				}

				for (var choiceIdentifier in choiceObj) {
					// Get either the boolean/point value for existing score data, if exists.
					var score = getScore(widgetIdentifier, (template==='map_response'), scoreData, choiceIdentifier);
					var defaultValue = (gapProps.defaultValue) ? gapProps.defaultValue : null;
					var row = addNewChoice($element, choiceObj[choiceIdentifier], choiceIdentifier, (template==='map_response'), score, defaultValue, this.getDialog());
				}

				loadTabFocus(this.getDialog(),$element);
			    }
			},
			commit: function (widget) {
			    var $element = $('#' + this.domId);

			    if ( widget.data.gapProps && widget.data.gapText ) {
				    var gapProps = JSON.parse(widget.data.gapProps);
				    var gapText = JSON.parse(widget.data.gapText);
				    var template = (gapProps.points && gapProps.points === 'false') ? 'match_correct' : 'map_response';

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
					    scoreData = (typeof(scoreData) === 'string') ? [scoreData] : scoreData;
				    }

				    var responseDeclaration = { identifier: 'RESPONSE', baseType: 'identifier' };

				    // Get the existing result, if exists, and remove an directedPair for this widgetIdentifier
				    var widgetIdentifier = widget.data.widgetIdentifier;
				    var scoreResult = [];

				    // Retrieve the score for this widgetIdentifier, and add it to the scoreResult
				    switch (template) {
				    case 'match_correct':
					    $element.find('.gap-correct').each(function () {
						    scoreResult.push($(this).attr('data-identifier') + " " + widgetIdentifier);
					    });
					    responseDeclaration.correctResponse = (scoreResult.length === 1) ? scoreResult[0] : scoreResult;
					    break;

				    case 'map_response':
					    var mapping = {};
					    if (gapProps.defaultValue)
						    mapping.defaultValue = gapProps.defaultValue;
					    if (gapProps.lowerBound)
						    mapping.lowerBound = gapProps.lowerBound;
					    if (gapProps.upperBound)
						    mapping.upperBound = gapProps.upperBound;
					    $element.find('.gap-points').each(function () {
						    var points = ($(this).val().trim().length > 0) ? parseInt($(this).val()) : null;
						    if (typeof(points) === 'number') {
							    // Remove a hardcoded score equal to defaultValue
							    var defaultValue = (gapProps.defaultValue) ? gapProps.defaultValue : null;
							    if (defaultValue != null && (points === parseInt(defaultValue))) {
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
						    mapping.mapEntry = scoreResult;
						    responseDeclaration.mapping = mapping;
					    }
					    break;

				    default:
					    throw new Error("Unimplemented");
				    }

				    // This is not the final cardinality result, since all the gap selectors are cumulative.
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
