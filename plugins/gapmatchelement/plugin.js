// Load our CSS
$.get(CKEDITOR.getUrl('plugins/gapmatchelement/gapmatchelement-widget.css'), CKEDITOR.addCss);

// Register the plugin within the editor.
CKEDITOR.plugins.add('gapmatchelement', {
    // This plugin requires the Widgets System defined in the 'widget' plugin.
    requires: 'widget',

    // Register the icon used for the toolbar button. It must be the same
    // as the name of the widget.
    icons: 'gapmatchelement',

    // The plugin initialization logic goes inside this method.
    init: function (editor) {
        var href = this.path + "gapmatchelement-dialog.css";
        if ($('link[href="' + href + '"]').length == 0) {
            var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
            $("head").append(cssLink);
        }

		// Register the editing dialog.
		CKEDITOR.dialog.add('gapmatchelement-dialog', this.path + 'gapmatchelement-dialog.js');

        // Register the gapmatchelement widget.
        editor.widgets.add('gapmatchelement', {
            // Allow all HTML elements, classes, and styles that this widget requires.
            // Read more about the Advanced Content Filter here:
            // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
            // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
            allowedContent: 'gapmatchelement[data-responsedeclaration,data-identifier];gaptext[identifier,matchMax]',

            // Minimum HTML which is required by this widget to work.
            requiredContent: 'gapmatchelement',

            // Define the template of a new gapmatchelement widget.
            // The template will be used when creating new instances of the gapmatchelement widget.
            template:
            '<span class="gapmatchelement">' +
                '<span class="gapmatchelement-label"></span>' +
                '<span class="gapmatchelement-content"></span>' +
            '</span>',

            editables: {
                title: {
                    selector: '.gapmatchelement-label',
                    allowedContent: ''
                },
                content: {
                    selector: '.gapmatchelement-content',
                    allowedContent: ''
                }
            },

            // Define the label for a widget toolbar button which will be automatically
            // created by the Widgets System. This button will insert a new widget instance
            // created from the template defined above, or will edit selected widget
            // (see second part of this tutorial to learn about editing widgets).
            //
            // Note: In order to be able to translate your widget you should use the
            // editor.lang.gapmatchelement.* property. A string was used directly here to simplify this tutorial.
            button: 'Gap Match Element',

            // Set the widget dialog window name. This enables the automatic widget-dialog binding.
            // This dialog window will be opened when creating a new widget or editing an existing one.
            dialog: 'gapmatchelement-dialog',

            pathName: 'gapMatchElement',

            // Check the elements that need to be converted to widgets.
            //
            // Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
            // so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
            // during data processing which is done on DOM represented by JavaScript objects.
            upcast: function (element, data) {
                if (element.name != 'gapmatchelement')
                    return false;

				data.interactionData = {};

				if (element.attributes && 'data-responsedeclaration' in element.attributes) {
					data.interactionData.responseDeclaration = JSON.parse(element.attributes['data-responsedeclaration']);
				}

				if (element.attributes && 'data-identifier' in element.attributes)
					data.interactionData.identifier = element.attributes['data-identifier'];

                var label = new CKEDITOR.htmlParser.element('span', { class: 'gapmatchelement-label' });

                var content = new CKEDITOR.htmlParser.element('span', { class: 'gapmatchelement-content' });
				content.add(new CKEDITOR.htmlParser.text('&nbsp;'));

                var outer = new CKEDITOR.htmlParser.element('span', { class: 'gapmatchelement' });
                element.replaceWith(outer);
                outer.add(label);
                outer.add(content);

				var choices = [];
				for (var i=0; i<element.children.length; ++i) {
					var childElement = element.children[i];
					if (childElement instanceof CKEDITOR.htmlParser.element && childElement.name == 'gaptext') {
						var choice = { text: '' };

						if (childElement.attributes) {
							if ('identifier' in childElement.attributes)
								choice.identifier = childElement.attributes.identifier;
							if ('matchmax' in childElement.attributes)
								choice.fixed = childElement.attributes.matchmax;
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
				var gapMatchElement = new CKEDITOR.htmlParser.element('gapmatchelement');

				if (this.data && this.data.interactionData && this.data.interactionData.responseDeclaration)
					gapMatchElement.attributes['data-responsedeclaration'] = JSON.stringify(this.data.interactionData.responseDeclaration);

				if (this.data && this.data.interactionData && 'identifier' in this.data.interactionData)
					gapMatchElement.attributes['data-identifier'] = JSON.stringify(this.data.interactionData.identifier);

				if (this.data && this.data.interactionData && this.data.interactionData.choices) {
					var choices = this.data.interactionData.choices;
					for (var i=0; i<choices.length; ++i) {
						var choice = choices[i];
						var attributes = { identifier: choice.identifier };
						if (choice.matchmax)
							attributes.matchMax = true;
						var gapTextElement = new CKEDITOR.htmlParser.element('gaptext', attributes);
						gapTextElement.add(new CKEDITOR.htmlParser.text(choice.text));
						gapMatchElement.add(gapTextElement);
					}
				}

				return gapMatchElement;
            },

            init: function () {
                // Repair widget if necessary. This happens on paste, probably a widget bug.
                if (!$(this.element.$).is(':has(.gapmatchelement-label)'))
                    $(this.element.$).prepend('<span class="gapmatchelement-label" />');

                var gapScore = $(this.editor.element.$).attr('data-gapScore');
                gapScore = JSON.parse(gapScore);
                var gapText = $(this.editor.element.$).attr('data-gapText');
                gapText = JSON.parse(gapText);
                console.log("done init");
            },

            // Listen on the widget#data event which is fired
            // every time the widget data changes and updates the
            // widget's view.  Data may be changed by using the
            // widget.setData() method, which we use in the dialog
            // window.
            data: function () {
                var content = $(this.element.$).find('> .gapmatchelement-content');
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
