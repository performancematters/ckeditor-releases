CKEDITOR.dialog.add('inlinechoiceinteraction-dialog', function (editor) {

	var choiceTemplate =
		'<li>' +
			'<a href="#" class="inlinechoiceinteraction-correctness inlinechoiceinteraction-eee inlinechoiceinteraction-incorrect">' +
				'<span class="icon"></span>' +
				'<span class="label"></span>' +
			'</a>' +
			'<input class="inlinechoiceinteraction-textinput" type="text">' +
			'<span class="inlinechoiceinteraction-eee inlinechoiceinteraction-rowcontrols">' +
				'<span class="ui-icon ui-icon-close ui-state-disabled" title="Delete choice"></span>' +
				'<span class="inlinechoiceinteraction-fixed ui-icon ui-icon-unlocked ui-state-disabled" title="Toggle shuffle/locked"></span>' +
				'<span class="inlinechoiceinteraction-grip"></span>' +
			'</span>' +
		'</li>';

	function randomIdentifier() {
		return "ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 23)) + Math.floor(Math.random() * 1e8);
	}

	function showHideLocks(instance, show) {
		instance.find('.inlinechoiceinteraction-fixed').css('visibility', show ? '' : 'hidden');
	}

    function rowControlsInactive(row) {
		row.addClass('inlinechoiceinteraction-inactive');
	}

    function rowControlsActive(row) {
		row.removeClass('inlinechoiceinteraction-inactive');
	}

	function getShuffle($element) {
		return $element.find('.inlinechoiceinteraction-shuffleinput')[0].checked;
	}

	function setShuffle($element, shuffle) {
		$element.find('.inlinechoiceinteraction-shuffleinput')[0].checked = shuffle;
	}

	function addNewChoice($element, active) {
		var newChoice = $(choiceTemplate);
		if (!getShuffle($element))
			newChoice.find('.inlinechoiceinteraction-fixed').css('visibility', 'hidden');
		if (active)
			rowControlsActive(newChoice);
		else
			rowControlsInactive(newChoice);
		$element.find('ul').append(newChoice);
		return newChoice;
	}

	function fixTabOrder(dialog) {
		var element = dialog.getContentElement('tab-inlinechoiceinteraction', 'correctAnswerControls');
		var $element = $(element.getElement().$);
		var focusIndex = 0;

		// Remove all our own inputs from focusList leaving only ok and cancel buttons.
		dialog._.focusList.splice(0, dialog._.focusList.length-2);

		// Add our inputs back in
		$element.find('li').each(function () {
			if (!$(this).is('.inlinechoiceinteraction-inactive'))
				dialog.addFocusable(new CKEDITOR.dom.element($(this).find('.inlinechoiceinteraction-correctness')[0]), focusIndex++);
			dialog.addFocusable(new CKEDITOR.dom.element($(this).find('.inlinechoiceinteraction-textinput')[0]), focusIndex++);
		});

		var shuffleInput = $element.find('.inlinechoiceinteraction-shuffleinput');
		dialog.addFocusable(new CKEDITOR.dom.element(shuffleInput[0]), focusIndex++);

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

    return {
		title: 'Inline Choice Interaction',
		minWidth: 400,
		minHeight: 300,

		onLoad: function (evt) {
			var dialog = this;
			var element = dialog.getContentElement('tab-inlinechoiceinteraction', 'correctAnswerControls');
			var $element = $(element.getElement().$);

			var unorderedList = $element.find('ul');
			var focusBeforeSort;
			unorderedList.sortable({
                handle: '.inlinechoiceinteraction-grip',
                axis: 'y',
                items: 'li:not(.inlinechoiceinteraction-inactive)'
			}).on("sortstart", function (event, ui) {
				focusBeforeSort = null;
				if (document.activeElement && ($(document.activeElement).is('.inlinechoiceinteraction-correctness') || $(document.activeElement).is('.inlinechoiceinteraction-textinput')))
					focusBeforeSort = document.activeElement;
			}).on("sortupdate", function (event, ui) {
				fixTabOrder(dialog);
				if (focusBeforeSort) {
					focusBeforeSort.focus();
					fixDialogFocus(dialog, focusBeforeSort);
				}
			});

			$element.off('click', '.inlinechoiceinteraction-correctness').on('click', '.inlinechoiceinteraction-correctness', function (e) {
				if ($(this).closest('li').is('.inlinechoiceinteraction-inactive'))
					return false;

				// If going from incorrect to correct, then move any other rows marked correct to incorrect.
				if ($(this).is('.inlinechoiceinteraction-incorrect'))
					$element.find('.inlinechoiceinteraction-correct').toggleClass('inlinechoiceinteraction-correct inlinechoiceinteraction-incorrect');
				$(this).toggleClass('inlinechoiceinteraction-correct inlinechoiceinteraction-incorrect');

				this.focus();

				return false;
			});

			$element.off('keypress', '.inlinechoiceinteraction-correctness').on('keypress', '.inlinechoiceinteraction-correctness', function (e) {
				if (e.charCode == 32)
					$(this).click();
			});

			$element.off('click', '.ui-icon-close').on('click', '.ui-icon-close', function (e) {
				$(this).closest('li').remove();
				fixTabOrder(dialog);
			});

			$element.off('click', '.inlinechoiceinteraction-fixed').on('click', '.inlinechoiceinteraction-fixed', function (e) {
				$(this).toggleClass('ui-icon-locked ui-icon-unlocked');
			});

			$element.off('click', '.inlinechoiceinteraction-shuffleinput').on('click', '.inlinechoiceinteraction-shuffleinput', function (e) {
				showHideLocks($element, this.checked);
			});

			$element
				.off('focus', '.inlinechoiceinteraction-correctness,.inlinechoiceinteraction-textinput,.inlinechoiceinteraction-shuffleinput')
				.on('focus', '.inlinechoiceinteraction-correctness,.inlinechoiceinteraction-textinput,.inlinechoiceinteraction-shuffleinput', function (e) {
				fixDialogFocus(dialog, this);
			});

			$element.off('change input', '.inlinechoiceinteraction-textinput').on('change input', '.inlinechoiceinteraction-textinput', function (e) {
				// When user starts editing the last available choice, add another.
				var li = $(this).closest('li');
				if (li.is(':last-child') && $(this).val().length > 0)
					addNewChoice($element, false);
				rowControlsActive(li);
				fixTabOrder(dialog);
			});
		},

		onFocus: function () {
			var dialog = this;
			var element = dialog.getContentElement('tab-inlinechoiceinteraction', 'correctAnswerControls');
			var firstTextInput = $(element.getElement().$).find('.inlinechoiceinteraction-textinput')[0];
			dialog._.currentFocusIndex = 0;
			return firstTextInput;
		},

		contents: [
			{
				id: 'tab-inlinechoiceinteraction',
				label: 'Inline Choice Interaction',
				title: 'Inline Choice Interaction',
				elements: [
					{
						id: 'correctAnswerControls',
						type: 'html',
						html: '<div class="inlinechoiceinteraction-dialog">' +
							'<div class="inlinechoiceinteraction-header">Response Choices</div>' +
							'<ul></ul>' +
							'<div class="inlinechoiceinteraction-shuffle"><label><input type="checkbox" class="inlinechoiceinteraction-shuffleinput">Shuffle unlocked choices when this item is presented.</label></div>' +
							'</div>',
						setup: function (widget) {
							var $element = $('#' + this.domId);

							if (widget.data.interactionData && 'shuffle' in widget.data.interactionData) {
								var shuffle = widget.data.interactionData.shuffle;
								setShuffle($element, shuffle);
								showHideLocks($element, shuffle);
							}

							// Clear choices and build a new list
							$element.find('ul').empty();

							if (widget.data.interactionData && widget.data.interactionData.choices) {
								var choices = widget.data.interactionData.choices;

								var identifierOfCorrectResponse = null;
								if (widget.data.interactionData.responseDeclaration && widget.data.interactionData.responseDeclaration.correctResponse)
									identifierOfCorrectResponse = widget.data.interactionData.responseDeclaration.correctResponse;

								for (var i=0; i<choices.length; ++i) {
									var row = addNewChoice($element, true);
									var input = row.find('.inlinechoiceinteraction-textinput');
									input.val(choices[i].text.trim());
									input.attr('data-identifier', choices[i].identifier);
									if (choices[i].identifier == identifierOfCorrectResponse)
										row.find('.inlinechoiceinteraction-correctness').toggleClass('inlinechoiceinteraction-correct inlinechoiceinteraction-incorrect');
									if (choices[i].fixed)
										row.find('.inlinechoiceinteraction-fixed').toggleClass('ui-icon-locked ui-icon-unlocked');
								}
								addNewChoice($element, false);
							}

							// If this is a new instance, add some blank rows.
							if ($element.find('li').length == 0)
								for (var i=0; i<4; ++i)
									addNewChoice($element, true);

							fixTabOrder(this.getDialog());
						},
						commit: function (widget) {
							var $element = $('#' + this.domId);

							var choices = [];
							var identifierOfCorrectResponse = null;
							$element.find('li').each(function () {
								var input = $(this).find('.inlinechoiceinteraction-textinput');
								var text = input.val().trim();
								if (text.length > 0) {
									var identifier = input.attr('data-identifier') || randomIdentifier();
									var inlineChoice = { identifier: identifier, text: text };
									if (getShuffle($element)) {
										var fixed = $(this).find('.ui-icon-locked').length == 1;
										if (fixed)
											inlineChoice.fixed = true;
									}
									choices.push(inlineChoice);

									var correct = $(this).find('.inlinechoiceinteraction-correct').length == 1;
									if (correct)
										identifierOfCorrectResponse = input.attr('data-identifier');
								}
							});

							var responseDeclaration = { identifier: 'RESPONSE', baseType: 'identifier', cardinality: 'single' };
							if (identifierOfCorrectResponse != null)
								responseDeclaration.correctResponse = identifierOfCorrectResponse;

							widget.setData('interactionData', {
								responseDeclaration: responseDeclaration,
								choices: choices,
								shuffle: getShuffle($element)
							});
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
