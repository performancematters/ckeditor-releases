// Load our CSS
$.get(CKEDITOR.getUrl('plugins/gap/gap-widget.css'), CKEDITOR.addCss);

// Register the plugin within the editor.
CKEDITOR.plugins.add('gap', {
    // This plugin requires the Widgets System defined in the 'widget' plugin.
    requires: 'widget',

    // Register the icon used for the toolbar button. It must be the same
    // as the name of the widget.
    icons: 'gap',

    // The plugin initialization logic goes inside this method.
    init: function (editor) {
        var href = this.path + "gap-dialog.css";
        if ($('link[href="' + href + '"]').length === 0) {
            var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
            $("head").append(cssLink);
        }

		// Register the editing dialog.
		CKEDITOR.dialog.add('gap-dialog', this.path + 'gap-dialog.js');

        // Register the gap widget.
        editor.widgets.add('gap', {
            // Allow all HTML elements, classes, and styles that this widget requires.
            // Read more about the Advanced Content Filter here:
            // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
            // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
            allowedContent: 'gap[identifier,data-responsedeclaration]',

            // Minimum HTML which is required by this widget to work.
            requiredContent: 'gap',

            // Define the template of a new gap widget.
            // The template will be used when creating new instances of the gap widget.
            template:
            '<span class="gap">' +
                '<span class="gap-label"></span>' +
                '<span class="gap-content"></span>' +
            '</span>',

            editables: {
                title: {
                    selector: '.gap-label',
                    allowedContent: ''
                },
                content: {
                    selector: '.gap-content',
                    allowedContent: ''
                }
            },

            // Define the label for a widget toolbar button which will be automatically
            // created by the Widgets System. This button will insert a new widget instance
            // created from the template defined above, or will edit selected widget
            // (see second part of this tutorial to learn about editing widgets).
            //
            // Note: In order to be able to translate your widget you should use the
            // editor.lang.gap.* property. A string was used directly here to simplify this tutorial.
            button: 'Gap',

            // Set the widget dialog window name. This enables the automatic widget-dialog binding.
            // This dialog window will be opened when creating a new widget or editing an existing one.
            dialog: 'gap-dialog',

            pathName: 'gap',

            // Check the elements that need to be converted to widgets.
            //
            // Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
            // so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
            // during data processing which is done on DOM represented by JavaScript objects.
            upcast: function (element, data) {
                if (element.name != 'gap')
                    return false;

				data.answer = {};

				if (element.attributes && 'data-mapentries' in element.attributes) {
					data.answer.mapEntries = JSON.parse(element.attributes['data-mapentries']);
				}
				if (element.attributes && 'data-correctresponse' in element.attributes) {
					data.answer.correctResponse = JSON.parse(element.attributes['data-correctresponse']);
				}

				if (element.attributes && 'identifier' in element.attributes)
					data.identifier = element.attributes['identifier'];

				if (element.attributes && 'data-gaptext' in element.attributes) {
					data.gapText = JSON.parse(element.attributes['data-gaptext']);
				}

				if (element.attributes && 'data-gapprops' in element.attributes) {
					data.gapProps = JSON.parse(element.attributes['data-gapprops']);
				}

				if (element.attributes && 'data-answer' in element.attributes) {
					data.answer = JSON.parse(element.attributes['data-answer']);
				}

                var label = new CKEDITOR.htmlParser.element('span', { class: 'gap-label' });

                var content = new CKEDITOR.htmlParser.element('span', { class: 'gap-content' });
				content.add(new CKEDITOR.htmlParser.text('&nbsp;'));

                var outer = new CKEDITOR.htmlParser.element('span', { class: 'gap' });
                element.replaceWith(outer);
                outer.add(label);
                outer.add(content);

                return outer;
            },

            downcast: function (element) {
				var gap = new CKEDITOR.htmlParser.element('gap');

				if (this.data && this.data.answer)
					gap.attributes['data-answer'] = JSON.stringify(this.data.answer);

				if (this.data && 'identifier' in this.data)
					gap.attributes['identifier'] = this.data.identifier;


				return gap;
            },

            init: function (data) {
                // Repair widget if necessary. This happens on paste, probably a widget bug.
                if (!$(this.element.$).is(':has(.gap-label)'))
                    $(this.element.$).prepend('<span class="gap-label" />');
            },

            // Listen on the widget#data event which is fired
            // every time the widget data changes and updates the
            // widget's view.  Data may be changed by using the
            // widget.setData() method, which we use in the dialog
            // window.
            data: function () {
                var content = $(this.element.$).find('> .gap-content');
                if (this.data && this.data.identifier && this.data.answer && this.data.gapText && this.data.gapProps) {
                    var widgetIdentifier = this.data.identifier;
					var description = '<i>No answers</i>';
                    var mappingFlag = (this.data.gapProps.points && this.data.gapProps.points === 'false') ? false : true;
                    var responseCount = 0;
                    if (mappingFlag && this.data.answer.mapEntries) {
                        // Iterate to count answers for this particular gap Element (widgetIdentifier)
                        var mapEntries = this.data.answer.mapEntries;
                        for (i = 0; i < mapEntries.length; i++) {
                            var mapEntry = mapEntries[i];
                            if (mapEntry.mapKey.indexOf(widgetIdentifier) > -1) {
                                answer = mapEntry.mapKey.replace(widgetIdentifier, "").trim();
								for (k = 0; k < this.data.gapText.length; k++) {
									if (this.data.gapText[k].identifier === answer) {
										var value = parseInt(mapEntry.mappedValue);
										description = '<i>' + this.data.gapText[k].text + " (" + value + "pt" + ((value > 1) ? "s" : "") + ')</i>';
										break;
									}
								}
                            }
                        }
                    } else if (this.data.answer.correctResponse && this.data.answer.correctResponse.value) {
                        // the correctResponse is collective for all gap elements
                        // if single cardinality convert correctResponse into array,
                        // then iterate correctResponse to match on this particular gap Element identifier.
                        var correctResponse = this.data.answer.correctResponse.value;
                        var answerList = (typeof correctResponse === 'string') ? [correctResponse] : correctResponse;
                        for (i = 0; i < answerList.length; i++) {
                            var answer = answerList[i];
                            if (answer.indexOf(widgetIdentifier) > -1) {
                                answer = answer.replace(widgetIdentifier, "").trim();
                                for (k = 0; k < this.data.gapText.length; k++) {
                                    if (this.data.gapText[k].identifier === answer) {
                                        description = '<i>' + this.data.gapText[k].text + '</i>';
                                        break;
                                    }
                                }
                            }
                        }
                    }
					content.html(description);
                }
                else
                    content.html('&nbsp;');
                }
        });
    }
});

// Local Variables:
// tab-width: 4
// End:
