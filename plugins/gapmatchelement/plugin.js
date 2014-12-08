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
            allowedContent: 'gapmatchelement[data-placeholder,data-identifier]',

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

				data.gapMatchElementData = {};

				if (element.attributes && 'data-identifier' in element.attributes)
					data.gapMatchElementData.responseDeclaration = JSON.parse(element.attributes['data-identifier']);

				if (element.attributes && 'data-placeholder' in element.attributes)
					data.gapMatchElementData.placeholder = JSON.parse(element.attributes['data-placeholder']);

                var label = new CKEDITOR.htmlParser.element('span', { class: 'gapmatchelement-label' });

                var content = new CKEDITOR.htmlParser.element('span', { class: 'gapmatchelement-content' });
				content.add(new CKEDITOR.htmlParser.text('&nbsp;'));

                var outer = new CKEDITOR.htmlParser.element('span', { class: 'gapmatchelement' });
                element.replaceWith(outer);
                outer.add(label);
                outer.add(content);

                return outer;
            },

            downcast: function (element) {
				var gapMatchElement = new CKEDITOR.htmlParser.element('gapmatchelement');

				if (this.data && this.data.gapMatchElementData && this.data.gapMatchElementData.responseDeclaration)
					gapMatchElement.attributes['data-identifier'] = JSON.stringify(this.data.gapMatchElementData.identifier);

				if (this.data && this.data.gapMatchElementData && 'placeholder' in this.data.gapMatchElementData)
					gapMatchElement.attributes['data-placeholder'] = JSON.stringify(this.data.gapMatchElementData.placeholder);

				return gapMatchElement;
            },

            init: function () {
                // Repair widget if necessary. This happens on paste, probably a widget bug.
                if (!$(this.element.$).is(':has(.gapmatchelement-label)'))
                    $(this.element.$).prepend('<span class="gapmatchelement-label" />');
            },

            // Listen on the widget#data event which is fired
            // every time the widget data changes and updates the
            // widget's view.  Data may be changed by using the
            // widget.setData() method, which we use in the dialog
            // window.
            data: function () {
                var content = $(this.element.$).find('> .gapmatchelement-content');
				if (this.data && this.data.gapMatchElementData && this.data.gapMatchElementData.placeholder) {
					content.html('<i>' + this.data.gapMatchElementData.placeholder + '</i>');
				} else {
					content.html('<i>Word</i>');
				}
            }
        });
    }
});

// Local Variables:
// tab-width: 4
// End:
