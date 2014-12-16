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

				data.interactionData = {};

				if (element.attributes && 'data-responsedeclaration' in element.attributes) {
					data.interactionData.responseDeclaration = JSON.parse(element.attributes['data-responsedeclaration']);
				}

				if (element.attributes && 'identifier' in element.attributes)
					data.interactionData.identifier = element.attributes['identifier'];

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

				if (this.data && this.data.interactionData && this.data.interactionData.responseDeclaration)
					gap.attributes['data-responsedeclaration'] = JSON.stringify(this.data.interactionData.responseDeclaration);

				if (this.data && this.data.interactionData && 'identifier' in this.data.interactionData)
					gap.attributes['identifier'] = JSON.stringify(this.data.interactionData.identifier);

				return gap;
            },

            init: function (data) {
                // Repair widget if necessary. This happens on paste, probably a widget bug.
                if (!$(this.element.$).is(':has(.gap-label)'))
                    $(this.element.$).prepend('<span class="gap-label" />');

                // retrieve data on ckeditor instance, and set as widget data.
                var gapProps = $(this.editor.element.$).prevAll('.qti-gmie-choice-list-area').attr('data-gapProps');
                if (gapProps)
                    this.setData('gapProps', gapProps);
                var gapText =$(this.editor.element.$).prevAll('.qti-gmie-choice-list-area').attr('data-gapText');
                if (gapText)
                    this.setData('gapText', gapText);

                console.log("done init");
            },

            // Listen on the widget#data event which is fired
            // every time the widget data changes and updates the
            // widget's view.  Data may be changed by using the
            // widget.setData() method, which we use in the dialog
            // window.
            data: function () {
                var content = $(this.element.$).find('> .gap-content');
                if (this.data && this.data.interactionData && this.data.interactionData && this.data.gapText && this.data.gapProps) {
                    var widgetIdentifier = this.data.interactionData.identifier;
					var description;
                    var gapPropsObj = JSON.parse(this.data.gapProps);
                    var gapTextArray = JSON.parse(this.data.gapText);
                    var mappingFlag = (gapPropsObj.points && gapPropsObj.points === 'false') ? false : true;
                    var responseCount = 0;
                    if (mappingFlag) {
                        // Iterate to count answers for this particular gap Element (widgetIdentifier)
                        var mapGapElementCount = 0;
                        var mapEntries = this.data.interactionData.responseDeclaration.mapping.mapEntry;
                        for (i = 0; i < mapEntries.length; i++) {
                            var mapEntry = mapEntries[i];
                            if (mapEntry.mapKey.indexOf(widgetIdentifier) > -1) {
                                mapGapElementCount++;
                                // Don't bother redefining a single answer, if there are multiple answers.
                                if (mapGapElementCount === 1) {
                                    answer = mapEntry.mapKey.replace(widgetIdentifier, "").trim();
                                    for (k = 0; k < gapTextArray.length; k++) {
                                        if (gapTextArray[k].identifier === answer) {
                                            var value = parseInt(mapEntry.mappedValue);
                                            description = '<i>' + gapTextArray[k].value + " (" + value + "pt" + ((value > 1) ? "s" : "") + ')</i>';
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        switch (mapGapElementCount) {
                        case 0:
                            description = '<i>No answers</i>';
                            break;
                        case 1:
                            // This has already been defined with answer text and point value
                            break;
                        default:
                            description = '<i>' + mapGapElementCount + ' possible answers</i>';
                            break;
                        }
                    } else {
                        // the correctResponse is collective for all gap elements
                        // if single cardinality convert correctResponse into array,
                        // then iterate correctResponse to match on this particular gap Element identifier.
                        var correctResponse = this.data.interactionData.responseDeclaration.correctResponse;
                        var answerList = (typeof correctResponse === 'string') ? [correctResponse] : correctResponse;
                        for (i = 0; i < answerList.length; i++) {
                            var answer = answerList[i];
                            if (answer.indexOf(widgetIdentifier) > -1) {
                                answer = answer.replace(widgetIdentifier, "").trim();
                                for (k = 0; k < gapTextArray.length; k++) {
                                    if (gapTextArray[k].identifier === answer) {
                                        description = '<i>' + gapTextArray[k].value + '</i>';
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
