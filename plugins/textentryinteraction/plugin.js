// Load our CSS
$.get(CKEDITOR.getUrl('plugins/textentryinteraction/textentryinteraction-widget.css'), CKEDITOR.addCss);

// Register the plugin within the editor.
CKEDITOR.plugins.add('textentryinteraction', {
    // This plugin requires the Widgets System defined in the 'widget' plugin.
    requires: 'widget',

    // Register the icon used for the toolbar button. It must be the same
    // as the name of the widget.
    icons: 'textentryinteraction',

    // The plugin initialization logic goes inside this method.
    init: function (editor) {
        var href = this.path + "textentryinteraction-dialog.css";
        if ($('link[href="' + href + '"]').length == 0) {
            var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
            $("head").append(cssLink);
        }

		// Register the editing dialog.
		CKEDITOR.dialog.add('textentryinteraction-dialog', this.path + 'textentryinteraction-dialog.js');

        // Register the textentryinteraction widget.
        editor.widgets.add('textentryinteraction', {
            // Allow all HTML elements, classes, and styles that this widget requires.
            // Read more about the Advanced Content Filter here:
            // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
            // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
            allowedContent: 'textentryinteraction[data-responsedeclaration]',

            // Minimum HTML which is required by this widget to work.
            requiredContent: 'textentryinteraction',

            // Define the template of a new textentryinteraction widget.
            // The template will be used when creating new instances of the textentryinteraction widget.
            template:
            '<span class="textentryinteraction">' +
                '<span class="textentryinteraction-label"></span>' +
                '<span class="textentryinteraction-content"></span>' +
            '</span>',

            // Define the label for a widget toolbar button which will be automatically
            // created by the Widgets System. This button will insert a new widget instance
            // created from the template defined above, or will edit selected widget
            // (see second part of this tutorial to learn about editing widgets).
            //
            // Note: In order to be able to translate your widget you should use the
            // editor.lang.textentryinteraction.* property. A string was used directly here to simplify this tutorial.
            button: 'Text Entry Interaction',

            // Set the widget dialog window name. This enables the automatic widget-dialog binding.
            // This dialog window will be opened when creating a new widget or editing an existing one.
            dialog: 'textentryinteraction-dialog',

            pathName: 'textEntryInteraction',

            // Check the elements that need to be converted to widgets.
            //
            // Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
            // so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
            // during data processing which is done on DOM represented by JavaScript objects.
            upcast: function (element, data) {
                if (element.name != 'textentryinteraction')
                    return false;

				if (element.attributes && 'data-responsedeclaration' in element.attributes)
					data.responseDeclaration = JSON.parse(element.attributes['data-responsedeclaration']);

                var label = new CKEDITOR.htmlParser.element('span', { class: 'textentryinteraction-label' });

                var content = new CKEDITOR.htmlParser.element('span', { class: 'textentryinteraction-content' });
				content.add(new CKEDITOR.htmlParser.text('&nbsp;'));

                var outer = new CKEDITOR.htmlParser.element('span', { class: 'textentryinteraction' });
                element.replaceWith(outer);
                outer.add(label);
                outer.add(content);

                return outer;
            },

            downcast: function (element) {
				var textEntryInteractionElement = new CKEDITOR.htmlParser.element('textentryinteraction');

				if (this.data && this.data.responseDeclaration)
					textEntryInteractionElement.attributes['data-responsedeclaration'] = JSON.stringify(this.data.responseDeclaration);

				return textEntryInteractionElement;
            },

            init: function () {
                // Repair widget if necessary. This happens on paste, probably a widget bug.
                if (!$(this.element.$).is(':has(.textentryinteraction-label)'))
                    $(this.element.$).prepend('<span class="textentryinteraction-label" />');
            },

            // Listen on the widget#data event which is fired
            // every time the widget data changes and updates the
            // widget's view.  Data may be changed by using the
            // widget.setData() method, which we use in the dialog
            // window.
            data: function () {
                var content = $(this.element.$).find('> .textentryinteraction-content');
                if (this.data && this.data.responseDeclaration && this.data.responseDeclaration.correctResponse) {
					if (this.data.responseDeclaration.correctResponse.length == 0)
						content.html('&nbsp;');
					else
						content.text(this.data.responseDeclaration.correctResponse);
				}
                else if (this.data && this.data.responseDeclaration && this.data.responseDeclaration.mapping) {
					var description;
					switch (this.data.responseDeclaration.mapping.length) {
					case 0:
						description = '<i>No answers</i>';
						break;
					case 1:
						description = this.data.responseDeclaration.mapping[0].mapKey;
						break;
					default:
						description = '<i>' + this.data.responseDeclaration.mapping.length + ' possible answers</i>';
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
