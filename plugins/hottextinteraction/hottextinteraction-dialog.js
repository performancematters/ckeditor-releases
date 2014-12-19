CKEDITOR.dialog.add('hottextinteraction-dialog', function (editor) {

	var choiceTemplate =
		'<li>' +
			'<a href="#" class="hottextinteraction-correctness hottextinteraction-eee hottextinteraction-incorrect">' +
				'<span class="icon"></span>' +
				'<span class="label"></span>' +
			'</a>' +
			'<input class="hottextinteraction-textinput" type="text">' +
			'<span class="hottextinteraction-eee hottextinteraction-rowcontrols">' +
				'<span class="ui-icon ui-icon-close ui-state-disabled" title="Delete choice"></span>' +
				'</span>' +
		'</li>';

	function randomIdentifier() {
		return "ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 23)) + Math.floor(Math.random() * 1e8);
	}

	function showHideLocks(instance, show) {
		instance.find('.hottextinteraction-fixed').css('visibility', show ? '' : 'hidden');
	}

    function rowControlsInactive(row) {
		row.addClass('hottextinteraction-inactive');
	}

    function rowControlsActive(row) {
		row.removeClass('hottextinteraction-inactive');
	}

	function getShuffle($element) {
		return false;
		//return $element.find('.hottextinteraction-shuffleinput')[0].checked;
	}

	function setShuffle($element, shuffle) {
		//$element.find('.hottextinteraction-shuffleinput')[0].checked = shuffle;
	}

	function addNewChoice($element, active) {
		var newChoice = $(choiceTemplate);
		if (!getShuffle($element))
			newChoice.find('.hottextinteraction-fixed').css('visibility', 'hidden');
		if (active)
			rowControlsActive(newChoice);
		else
			rowControlsInactive(newChoice);
		$element.find('ul').append(newChoice);
		return newChoice;
	}

	function fixTabOrder(dialog) {
		var element = dialog.getContentElement('tab-hottextinteraction', 'correctAnswerControls');
		var $element = $(element.getElement().$);
		var focusIndex = 0;

		// Remove all our own inputs from focusList leaving only ok and cancel buttons.
		dialog._.focusList.splice(0, dialog._.focusList.length-2);

		// Add our inputs back in
		$element.find('li').each(function () {
			if (!$(this).is('.hottextinteraction-inactive'))
				dialog.addFocusable(new CKEDITOR.dom.element($(this).find('.hottextinteraction-correctness')[0]), focusIndex++);
			dialog.addFocusable(new CKEDITOR.dom.element($(this).find('.hottextinteraction-textinput')[0]), focusIndex++);
		});

		var shuffleInput = $element.find('.hottextinteraction-shuffleinput');
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
		title: 'Hot text Interaction',
		minWidth: 400,
		minHeight: 300,

		onLoad: function (evt) {
			var dialog = this;
			var element = dialog.getContentElement('tab-hottextinteraction', 'correctAnswerControls');
			var $element = $(element.getElement().$);

			var unorderedList = $element.find('ul');
			var focusBeforeSort;
			unorderedList.sortable({
                handle: '.hottextinteraction-grip',
                axis: 'y',
                items: 'li:not(.hottextinteraction-inactive)'
			}).on("sortstart", function (event, ui) {
				focusBeforeSort = null;
				if (document.activeElement && ($(document.activeElement).is('.hottextinteraction-correctness') || $(document.activeElement).is('.hottextinteraction-textinput')))
					focusBeforeSort = document.activeElement;
			}).on("sortupdate", function (event, ui) {
				// fixTabOrder(dialog);
				if (focusBeforeSort) {
					focusBeforeSort.focus();
					fixDialogFocus(dialog, focusBeforeSort);
				}
			});

			$element.off('click', '.hottextinteraction-correctness').on('click', '.hottextinteraction-correctness', function (e) {
				if ($(this).closest('li').is('.hottextinteraction-inactive'))
					return false;

			    $(this).toggleClass('hottextinteraction-correct hottextinteraction-incorrect');

				this.focus();

				return false;
			});

			$element.off('keypress', '.hottextinteraction-correctness').on('keypress', '.hottextinteraction-correctness', function (e) {
				if (e.charCode == 32)
					$(this).click();
			});

			$element.off('click', '.ui-icon-close').on('click', '.ui-icon-close', function (e) {
				$(this).closest('li').remove();
				// fixTabOrder(dialog);
			});

			$element.off('click', '.hottextinteraction-fixed').on('click', '.hottextinteraction-fixed', function (e) {
				$(this).toggleClass('ui-icon-locked ui-icon-unlocked');
			});

			$element.off('click', '.hottextinteraction-shuffleinput').on('click', '.hottextinteraction-shuffleinput', function (e) {
				showHideLocks($element, this.checked);
			});

			$element
				.off('focus', '.hottextinteraction-correctness,.hottextinteraction-textinput,.hottextinteraction-shuffleinput')
				.on('focus', '.hottextinteraction-correctness,.hottextinteraction-textinput,.hottextinteraction-shuffleinput', function (e) {
				fixDialogFocus(dialog, this);
			});

			$element.off('change input', '.hottextinteraction-textinput').on('change input', '.hottextinteraction-textinput', function (e) {
				// When user starts editing the last available choice, add another.
				//var li = $(this).closest('li');
				//if (li.is(':last-child') && $(this).val().length > 0)
				//	addNewChoice($element, false);
				//rowControlsActive(li);
				//fixTabOrder(dialog);
			});
		},

		onFocus: function () {
			var dialog = this;
			var element = dialog.getContentElement('tab-hottextinteraction', 'correctAnswerControls');
			var firstTextInput = $(element.getElement().$).find('.hottextinteraction-textinput')[0];
			dialog._.currentFocusIndex = 0;
			return firstTextInput;
		},

		contents: [
			{
				id: 'tab-hottextinteraction',
				label: 'Hot Text Interaction',
				title: 'Hot Text Interaction',
				elements: [
					{
						id: 'correctAnswerControls',
						type: 'html',
						html: '<div class="hottextinteraction-dialog">' +
							'<div class="hottextinteraction-header">Response Choices</div>' +
							'<ul></ul>' +
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

								for (var i=0; i<1; ++i) {
									var row = addNewChoice($element, true);
									var input = row.find('.hottextinteraction-textinput');
									input.val(choices[i].text.trim());
									input.attr('data-identifier', choices[i].identifier);
									if (choices[i].identifier == identifierOfCorrectResponse)
										row.find('.hottextinteraction-correctness').toggleClass('hottextinteraction-correct hottextinteraction-incorrect');
									if (choices[i].fixed)
										row.find('.hottextinteraction-fixed').toggleClass('ui-icon-locked ui-icon-unlocked');
								}
								//addNewChoice($element, false);
							}

							// If this is a new instance, add some blank rows.
							if ($element.find('li').length == 0)
								for (var i=0; i<1; ++i)
									addNewChoice($element, true);

							// fixTabOrder(this.getDialog());
						},
						commit: function (widget) {
							var $element = $('#' + this.domId);

							var choices = [];
							var identifierOfCorrectResponse = null;
							$element.find('li').each(function () {
								var input = $(this).find('.hottextinteraction-textinput');
								var text = input.val().trim();
								if (text.length > 0) {
									var identifier = input.attr('data-identifier') || randomIdentifier();
									var inlineChoice = { identifier: identifier, text: text };
									
									choices.push(inlineChoice);

									var correct = $(this).find('.hottextinteraction-correct').length == 1;
									if (correct)
										identifierOfCorrectResponse = identifier;
								}
							});

							var responseDeclaration = { identifier: 'RESPONSE', baseType: 'identifier', cardinality: 'single', correctResponse : {} };
							if (identifierOfCorrectResponse != null)
								responseDeclaration.correctResponse.value = identifierOfCorrectResponse;

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
