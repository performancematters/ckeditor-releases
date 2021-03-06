// Load our CSS
$.get(CKEDITOR.getUrl('plugins/inlinechoiceinteraction/inlinechoiceinteraction-widget.css'), CKEDITOR.addCss);

// Register the plugin within the editor.
CKEDITOR.plugins.add('inlinechoiceinteraction', {
    // This plugin requires the Widgets System defined in the 'widget' plugin.
    requires: 'widget',

    // Register the icon used for the toolbar button. It must be the same
    // as the name of the widget.
    icons: 'inlinechoiceinteraction',

    // The plugin initialization logic goes inside this method.
    init: function (editor) {
        var href = this.path + "inlinechoiceinteraction-dialog.css";
        if ($('link[href="' + href + '"]').length == 0) {
            var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
            $("head").append(cssLink);
        }

		// Register the editing dialog.
		CKEDITOR.dialog.add('inlinechoiceinteraction-dialog', this.path + 'inlinechoiceinteraction-dialog.js');

        // Register the inlinechoiceinteraction widget.
        editor.widgets.add('inlinechoiceinteraction', {
            // Allow all HTML elements, classes, and styles that this widget requires.
            // Read more about the Advanced Content Filter here:
            // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
            // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
            allowedContent: 'inlinechoiceinteraction[data-responsedeclaration,data-shuffle];inlinechoice[identifier,fixed]',

            // Minimum HTML which is required by this widget to work.
            requiredContent: 'inlinechoiceinteraction',

            // Define the template of a new inlinechoiceinteraction widget.
            // The template will be used when creating new instances of the inlinechoiceinteraction widget.
            template:
            '<span class="inlinechoiceinteraction">' +
                '<span class="inlinechoiceinteraction-label"></span>' +
                '<span class="inlinechoiceinteraction-content"></span>' +
            '</span>',

            // Define the label for a widget toolbar button which will be automatically
            // created by the Widgets System. This button will insert a new widget instance
            // created from the template defined above, or will edit selected widget
            // (see second part of this tutorial to learn about editing widgets).
            //
            // Note: In order to be able to translate your widget you should use the
            // editor.lang.inlinechoiceinteraction.* property. A string was used directly here to simplify this tutorial.
            button: 'Inline Choice Interaction',

            // Set the widget dialog window name. This enables the automatic widget-dialog binding.
            // This dialog window will be opened when creating a new widget or editing an existing one.
            dialog: 'inlinechoiceinteraction-dialog',

            pathName: 'inlineChoiceInteraction',

            // Check the elements that need to be converted to widgets.
            //
            // Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
            // so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
            // during data processing which is done on DOM represented by JavaScript objects.
            upcast: function (element, data) {
                if (element.name != 'inlinechoiceinteraction')
                    return false;

				data.interactionData = {};

				if (element.attributes && 'data-responsedeclaration' in element.attributes)
					data.interactionData.responseDeclaration = JSON.parse(element.attributes['data-responsedeclaration']);

				if (element.attributes && 'data-shuffle' in element.attributes)
					data.interactionData.shuffle = JSON.parse(element.attributes['data-shuffle']);

                var label = new CKEDITOR.htmlParser.element('span', { class: 'inlinechoiceinteraction-label' });

                var content = new CKEDITOR.htmlParser.element('span', { class: 'inlinechoiceinteraction-content' });
				content.add(new CKEDITOR.htmlParser.text('&nbsp;'));

                var outer = new CKEDITOR.htmlParser.element('span', { class: 'inlinechoiceinteraction' });
                element.replaceWith(outer);
                outer.add(label);
                outer.add(content);

				var choices = [];
				for (var i=0; i<element.children.length; ++i) {	
					var childElement = element.children[i];
					if (childElement instanceof CKEDITOR.htmlParser.element && childElement.name == 'inlinechoice') {
						var choice = { text: '' };

						if (childElement.attributes) {
							if ('data-identifier' in childElement.attributes)
								choice.identifier = childElement.attributes['data-identifier'];
							if ('fixed' in childElement.attributes)
								choice.fixed = childElement.attributes.fixed;
						}

						if (childElement.children.length > 0) {
							var textElement = childElement.children[0];
							if (textElement instanceof CKEDITOR.htmlParser.text)
								choice.text = textElement.value;
						}

						choices.push(choice);
					}
				}
				data.interactionData.choices = choices;

                return outer;
            },

            downcast: function (element) {
				var inlineChoiceInteractionElement = new CKEDITOR.htmlParser.element('inlinechoiceinteraction');

				if (this.data && this.data.interactionData && this.data.interactionData.responseDeclaration)
					inlineChoiceInteractionElement.attributes['data-responsedeclaration'] = JSON.stringify(this.data.interactionData.responseDeclaration);

				if (this.data && this.data.interactionData && 'shuffle' in this.data.interactionData)
					inlineChoiceInteractionElement.attributes['data-shuffle'] = JSON.stringify(this.data.interactionData.shuffle);

				if (this.data && this.data.interactionData && this.data.interactionData.choices) {
					var choices = this.data.interactionData.choices;
					for (var i=0; i<choices.length; ++i) {
						var choice = choices[i];
						var attributes = { identifier: choice.identifier };
						if (choice.fixed)
							attributes.fixed = true;
						var inlineChoiceElement = new CKEDITOR.htmlParser.element('inlinechoice', attributes);
						inlineChoiceElement.add(new CKEDITOR.htmlParser.text(choice.text));
						inlineChoiceInteractionElement.add(inlineChoiceElement);
					}
				}

				return inlineChoiceInteractionElement;
            },

            init: function () {
                // Repair widget if necessary. This happens on paste, probably a widget bug.
                if (!$(this.element.$).is(':has(.inlinechoiceinteraction-label)'))
                    $(this.element.$).prepend('<span class="inlinechoiceinteraction-label" />');
            },

            // Listen on the widget#data event which is fired
            // every time the widget data changes and updates the
            // widget's view.  Data may be changed by using the
            // widget.setData() method, which we use in the dialog
            // window.
            data: function () {
                var content = $(this.element.$).find('> .inlinechoiceinteraction-content');
                if (this.data && this.data.interactionData && this.data.interactionData.choices) {
					var description;
					switch (this.data.interactionData.choices.length) {
					case 0:
						description = '<i>No answers</i>';
						break;
					case 1:
						description = '<i>One answer</i>';
						break;
					default:
						description = '<i>' + this.data.interactionData.choices.length + ' possible answers</i>';
						break;
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
