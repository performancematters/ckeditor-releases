CKEDITOR.dialog.add('textentryinteraction-dialog', function (editor) {
	var singleInputFocusIndex = null;
	var firstMapKeyFocusIndex = null;

    return {
		title: 'Text Entry Interaction',
		minWidth: 400,
		minHeight: 300,

		onLoad: function (evt) {
			//
			// Make sure tabbing through the dialog works as expected.
			//

			var dialog = this;
			var focusIndex = 0;
			var element = dialog.getContentElement('tab-textentryinteraction', 'correctAnswerControls');

			var templateInput = $(element.getElement().$).find('input[name="template"]');
			dialog.addFocusable(new CKEDITOR.dom.element(templateInput[0]), focusIndex++);

			var singleInput = $(element.getElement().$).find('input[name="single"]')[0];
			singleInputFocusIndex = focusIndex++;
			dialog.addFocusable(new CKEDITOR.dom.element(singleInput), singleInputFocusIndex);

			var mapEntries = $(element.getElement().$).find('table.mapEntries > tbody > tr');
			mapEntries.each(function () {
				var mappedValue = $(this).find('.mappedValue');
				var mapKey = $(this).find('.mapKey');
				var caseSensitive = $(this).find('.caseSensitive');
				dialog.addFocusable(new CKEDITOR.dom.element(mappedValue[0]), focusIndex++);
				if (firstMapKeyFocusIndex == null)
					firstMapKeyFocusIndex = focusIndex;
				dialog.addFocusable(new CKEDITOR.dom.element(mapKey[0]), focusIndex++);
				dialog.addFocusable(new CKEDITOR.dom.element(caseSensitive[0]), focusIndex++);
			});
		},

		onFocus: function () {
			var dialog = this;
			var element = dialog.getContentElement('tab-textentryinteraction', 'correctAnswerControls');
			var template = $(element.getElement().$).find('input[name="template"]:checked').attr('value');
			switch (template) {
			case 'match_correct':
				var singleInput = $(element.getElement().$).find('input[name="single"]')[0];
				dialog._.currentFocusIndex = singleInputFocusIndex;
				return singleInput;
			case 'map_response':
				var mapKey = $(element.getElement().$).find('input.mapKey')[0];
				dialog._.currentFocusIndex = firstMapKeyFocusIndex;
				return mapKey;
			default:
				return false;
			}
		},

		contents: [
			{
				id: 'tab-textentryinteraction',
				label: 'Text Entry Interaction',
				title: 'Text Entry Interaction',
				elements: [
					{
						id: 'correctAnswerControls',
						type: 'html',
						html: '<div class="textentryinteraction-dialog">' +
								'<div style="font-weight:bold;margin-bottom:6px;">Correct Answers</div>' +
								'<div style="margin-bottom:4px;"><label><input type="radio" name="template" value="match_correct" checked>This interaction has exactly one correct answer, always case-sensitive.</label></div>' +
								'<div style="margin-left:30px;margin-bottom:6px;"><label>Correct answer:</label><input type="text" name="single"></div>' +
								'<div style="margin-bottom:6px;"><label><input type="radio" name="template" value="map_response">This interaction has more than one correct or partially correct answer.</label></div>' +
									'<table class="mapEntries">' +
									'<thead>' +
									'<tr>' +
										'<th>Points</th>' +
										'<th>Answer</th>' +
										'<th>Case<br/>sensitive</th>' +
									'</tr>' +
									'</thead>' +
									'<tbody>' +
									'<tr>' +
										'<td><input type="text" class="mappedValue"></td>' +
										'<td><input type="text" class="mapKey"></td>' +
										'<td><input type="checkbox" class="caseSensitive"></td>' +
									'</tr>' +
									'<tr>' +
										'<td><input type="text" class="mappedValue"></td>' +
										'<td><input type="text" class="mapKey"></td>' +
										'<td><input type="checkbox" class="caseSensitive"></td>' +
									'</tr>' +
									'<tr>' +
										'<td><input type="text" class="mappedValue"></td>' +
										'<td><input type="text" class="mapKey"></td>' +
										'<td><input type="checkbox" class="caseSensitive"></td>' +
									'</tr>' +
									'<tr>' +
										'<td><input type="text" class="mappedValue"></td>' +
										'<td><input type="text" class="mapKey"></td>' +
										'<td><input type="checkbox" class="caseSensitive"></td>' +
									'</tr>' +
									'<tr>' +
										'<td><input type="text" class="mappedValue"></td>' +
										'<td><input type="text" class="mapKey"></td>' +
										'<td><input type="checkbox" class="caseSensitive"></td>' +
									'</tr>' +
									'</tbody></table>' +
							'</div>',
						setup: function (widget) {
							var instance = $('#' + this.domId);

							// Clear everything
							instance.find('input[name="single"]').val('');
							instance.find('tbody > tr').each(function () {
								$(this).find('.mapKey').val('');
								$(this).find('.mappedValue').val('');
								$(this).find('.caseSensitive')[0].checked = false;
							});

							var dataWasSet = false;
							if (widget.data.responseDeclaration) {
								var responseDeclaration = widget.data.responseDeclaration;
								if (responseDeclaration.correctResponse) {
									instance.find('input[value="match_correct"]')[0].checked = 1;
									instance.find('input[name="single"]').val(responseDeclaration.correctResponse);
									dataWasSet = true;
								}
								else if (responseDeclaration.mapping) {
									instance.find('input[value="map_response"]')[0].checked = 1;
									var mapping = responseDeclaration.mapping;
									var controlRows = instance.find('tbody > tr');
									for (var i=0; i<mapping.length; ++i) {
										var row = $(controlRows[i]);
										row.find('.mapKey').val(mapping[i].mapKey);
										row.find('.mappedValue').val(mapping[i].mappedValue);
										row.find('.caseSensitive')[0].checked = mapping[i].caseSensitive;
									}
									dataWasSet = true;
								}
							}
							if (!dataWasSet)
								instance.find('input[value="match_correct"]')[0].checked = 1;
						},
						commit: function (widget) {
							var instance = $('#' + this.domId);
							var template = instance.find('input[name="template"]:checked').attr('value');
							switch (template) {
							case 'match_correct':
								var singleInput = instance.find('input[name="single"]');
								widget.setData('responseDeclaration', { identifier: 'RESPONSE', baseType: 'string', cardinality: 'single', correctResponse: singleInput.val() });
								break;

							case 'map_response':
								var mapping = [];
								instance.find('tbody > tr').each(function () {
									var mapKey = $(this).find('.mapKey').val().trim();
									var mappedValue = $(this).find('.mappedValue').val().trim();
									var caseSensitive = $(this).find('.caseSensitive')[0].checked;
									if (mapKey.length > 0)
										mapping.push({ mapKey: mapKey, mappedValue: mappedValue, caseSensitive: caseSensitive });
								});
								widget.setData('responseDeclaration', { identifier: 'RESPONSE', baseType: 'string', cardinality: 'single', mapping: mapping });
								break;

							default:
								throw new Error("Unimplemented");
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
