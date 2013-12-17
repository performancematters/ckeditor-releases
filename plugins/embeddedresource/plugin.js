// Register the plugin within the editor.

CKEDITOR.plugins.add('embeddedresource', {
	// This plugin requires the Widgets System defined in the 'widget' plugin.
	requires: 'widget',

	// Register the icon used for the toolbar button. It must be the same
	// as the name of the widget.
	icons: 'embeddedresource',

	// The plugin initialization logic goes inside this method.
	init: function (editor) {
		// Load our CSS
		var href = this.path + "embeddedresource.css";
		if ($('link[href="' + href + '"]').length == 0) {
			var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
			$("head").append(cssLink); 
		}

		// Register the editing dialog.
		CKEDITOR.dialog.add('embeddedresource-dialog', this.path + 'embeddedresource-dialog.js');

		// Register the embeddedresource widget.
		editor.widgets.add('embeddedresource', {
			// Allow all HTML elements, classes, and styles that this widget requires.
			// Read more about the Advanced Content Filter here:
			// * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
			// * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
			//allowedContent: 'span(!embeddedresource); span(!embeddedresource-label); br; span(!embeddedresource-content);',

			// Minimum HTML which is required by this widget to work.
			//requiredContent: 'span(embeddedresource)',

			// Define the template of a new embeddedresource widget.
			// The template will be used when creating new instances of the embeddedresource widget.
			template:
			'<span class="embeddedresource">' +
				'<span class="embeddedresource-label"></span>' +
				'<span class="embeddedresource-content"></span>' +
			'</span>',

			// Define the label for a widget toolbar button which will be automatically
			// created by the Widgets System. This button will insert a new widget instance
			// created from the template defined above, or will edit selected widget
			// (see second part of this tutorial to learn about editing widgets).
			//
			// Note: In order to be able to translate your widget you should use the
			// editor.lang.embeddedresource.* property. A string was used directly here to simplify this tutorial.
			button: 'Add attachment',

			// Set the widget dialog window name. This enables the automatic widget-dialog binding.
			// This dialog window will be opened when creating a new widget or editing an existing one.
			dialog: 'embeddedresource-dialog',

			pathName: 'object',

			// Check the elements that need to be converted to widgets.
			//
			// Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
			// so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
			// during data processing which is done on DOM represented by JavaScript objects.
			upcast: function(element, data) {
				if (element.name != 'cke:object')
					return false;

				console.log('embeddedresource.upcast!');

				data.uri = element.attributes.data || '';
				data.type = element.attributes.type || '';

				var label = new CKEDITOR.htmlParser.element('span', { class: 'embeddedresource-label' });

				var content = new CKEDITOR.htmlParser.element('span', { class: 'embeddedresource-content' });
				content.add(new CKEDITOR.htmlParser.text(data.uri + ' [' + data.type + ']'));

				var outer = new CKEDITOR.htmlParser.element('span', { class: 'embeddedresource' });
				element.replaceWith(outer);
				outer.add(label);
				outer.add(content);

				return outer;
			},

			downcast: function (element) {
				// Use http://tools.ietf.org/html/rfc4151 ?
				var objectElement = new CKEDITOR.htmlParser.element('object', { type: this.data.type || '', data: this.data.uri || '' });
				console.log('embeddedresource.downcast!', objectElement);
				return objectElement;
			},

			init: function () {
				console.log('embeddedresource.init!');

				// Repair widget if necessary. This happens on paste, probably a widget bug.
				if (!$(this.element.$).is(':has(.embeddedresource-label)'))
					$(this.element.$).prepend('<span class="embeddedresource-label" />');
			},

			// Listen on the widget#data event which is fired
			// every time the widget data changes and updates the
			// widget's view.  Data may be changed by using the
			// widget.setData() method, which we use in the dialog
			// window.
			data: function () {
				console.log('embeddedresource.data!', this.data);
				var content = $(this.element.$).find('> .embeddedresource-content');
				content.html(this.data.uri || '');
				if (this.data && this.data.uri && this.data.uri.length > 0 && this.data.type && this.data.type.length > 0)
					content.html(this.data.uri + ' [' + this.data.type + ']');
				else
					content.html('&nbsp;'); // This is important. We see crazy bugs in ckeditor on getData() calls without this.
			}
		});
	}
});

// Local Variables:
// tab-width: 4
// End:
