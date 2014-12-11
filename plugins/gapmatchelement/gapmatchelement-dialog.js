CKEDITOR.dialog.add('gapmatchelement-dialog', function (editor) {

	var choiceTemplate =
		'<tr>' +
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



	function addNewChoice($element, text, id, mappingFlag, score) {
		var newChoice = $(choiceTemplate);
		// TODO: Load point values
		/*
		var mapping = false;
		if (mapping)
			newChoice.find('.gapmatchelementinteraction-points').css('visibility', 'hidden');
		*/
		newChoice.find('.gapmatchelement-textinput').val(text);
		newChoice.find('.gapmatchelement-textinput').attr('data-identifier', id);
		if (!mappingFlag) {
			newChoice.find('.gapmatchelement-correctness').toggleClass('gapmatchelement-correct', score);
			newChoice.find('.gapmatchelement-correctness').toggleClass('gapmatchelement-incorrect', !score);
			console.log("hello");
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
		// the default score for correctResponse is false; for mapping it is null.
		var result = (mappingFlag) ? null : false;
		if (scoreData != null) {
			for (var i=0; i<scoreData.length; ++i) {
				var answer = scoreData[i];
				if (mappingFlag) {

				} else {
					if (answer.indexOf(widgetIdentifier) > -1) {
						answer = answer.replace(widgetIdentifier, "").trim();
						if (answer == choiceIdentifier) {
							return true;
						}
					}
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
							'</div>',
						setup: function (widget) {
							var $element = $('#' + this.domId);
							if ( widget.data.gapProps && widget.data.gapText ) {
								var gapProps = JSON.parse(widget.data.gapProps);
								var gapText = JSON.parse(widget.data.gapText);
								var choiceObj = getChoiceObj(gapText);
								var mappingFlag = (gapProps.points && gapProps.points == 'false') ? false : true;

								// Clear choices and build a new list
								$element.find('tbody').empty();

								// Perform a one time validation check for loading existing data.
								var existingData = (widget.data && widget.data.interactionData && widget.data.interactionData.identifier
													&& widget.data.interactionData.responseDeclaration)

								// Set/Load the gap match element identifier
								var widgetIdentifier = (existingData) ? widget.data.interactionData.identifier : randomIdentifier();

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
									var row = addNewChoice($element, choiceObj[choiceIdentifier], choiceIdentifier, mappingFlag, score);
								}

								//fixTabOrder(this.getDialog());
							}
						},
						commit: function (widget) {
							var $element = $('#' + this.domId);
							if ( widget.data.gapProps && widget.data.gapText ) {
								var gapProps = JSON.parse(widget.data.gapProps);
								var gapText = JSON.parse(widget.data.gapText);
								var mappingFlag = (gapProps.points && gapProps.points == 'false') ? false : true;

								var choices = [];
								var identifierOfCorrectResponse = null;
								$element.find('li').each(function () {
									var input = $(this).find('.gapmatchelement-textinput');
									var text = input.val().trim();
									if (text.length > 0) {
										var identifier = input.attr('data-identifier') || randomIdentifier();
										var gapMatchChoice = { identifier: identifier, text: text };
										choices.push(gapMatchChoice);

										var correct = $(this).find('.gapmatchelement-correct').length == 1;
										if (correct)
											identifierOfCorrectResponse = input.attr('data-identifier');
									}
								});

								var gapScore = ["W G1","Su G2"];

								var responseDeclaration = { identifier: 'RESPONSE', baseType: 'identifier', cardinality: 'single' };
								if (identifierOfCorrectResponse != null)
									responseDeclaration.correctResponse = identifierOfCorrectResponse;

								widget.setData('interactionData', {
									responseDeclaration: responseDeclaration,
									gapScore: gapScore
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
