CKEDITOR.dialog.add('gapmatchelement-dialog', function (editor) {

	var choiceTemplate =
		'<li>' +
			'<a href="#" class="gapmatchelement-correctness gapmatchelement-eee gapmatchelement-incorrect">' +
				'<span class="icon"></span>' +
				'<span class="label"></span>' +
			'</a>' +
			'<input class="gapmatchelement-textinput" type="text">' +
		'</li>';

	function randomIdentifier() {
		return "ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 23)) + Math.floor(Math.random() * 1e8);
	}

	function showHidePoints(instance, show) {
		instance.find('.inlinechoiceinteraction-points').css('visibility', show ? '' : 'hidden');
	}



	function addNewChoice($element, text, id) {
		var newChoice = $(choiceTemplate);
		// TODO: Load point values
		/*
		var mapping = false;
		if (mapping)
			newChoice.find('.inlinechoiceinteraction-points').css('visibility', 'hidden');
		*/
		newChoice.find('.gapmatchelement-textinput').val(text);
		newChoice.find('.gapmatchelement-textinput').attr('data-identifier', id);

		$element.find('ul').append(newChoice);
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
							'<div class="gapmatchelement-header">Response Choices</div>' +
							'<ul></ul>' +
							'</div>',
						setup: function (widget) {
							var $element = $('#' + this.domId);
							if ( widget.data.gapProps && widget.data.gapText ) {
								var gapProps = JSON.parse(widget.data.gapProps);
								var gapText = JSON.parse(widget.data.gapText);
								var mappingFlag = (gapProps.points && gapProps.points == 'false') ? false : true;
								if (widget.data.interactionData && 'correctResponse' in widget.data.interactionData) {
									var pointValueFlag = (widget.data.interactionData.responseDeclaration.correctResponse) ? false : true;
								}

								// Clear choices and build a new list
								$element.find('ul').empty();

								var identifierOfCorrectResponse = null;
								if (widget.data.interactionData && widget.data.interactionData.responseDeclaration && widget.data.interactionData.responseDeclaration.correctResponse)
									identifierOfCorrectResponse = widget.data.interactionData.responseDeclaration.correctResponse;

								for (var i=0; i<gapText.length; ++i) {
									var row = addNewChoice($element, gapText[i].value.trim(), gapText[i].identifier);
									// TODO: check for mappingFlag and interaction.data.correctResponse and populate answer choices.
								}

								fixTabOrder(this.getDialog());
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
