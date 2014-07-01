// Register the plugin within the editor.

CKEDITOR.plugins.add('passage', {
	// This plugin requires the Widgets System defined in the 'widget' plugin.
	requires: 'widget',

	// Register the icon used for the toolbar button. It must be the same
	// as the name of the widget.
	icons: 'passage',

	// The plugin initialization logic goes inside this method.
	init: function (editor) {
		// Load our CSS
		var href = this.path + "passage.css";
		if ($('link[href="' + href + '"]').length == 0) {
			var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
			$("head").append(cssLink);
		}

		// Register the editing dialog.
		CKEDITOR.dialog.add('passage-dialog', this.path + 'passage-dialog.js');

		// Register the passage widget.
		editor.widgets.add('passage', {
			// Allow all HTML elements, classes, and styles that this widget requires.
			// Read more about the Advanced Content Filter here:
			// * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
			// * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
			allowedContent: 'object[data,type]',

			// Minimum HTML which is required by this widget to work.
			requiredContent: 'object[data,type]',

			// Define the template of a new passage widget.
			// The template will be used when creating new instances of the passage widget.
			template:
			'<div class="passage">' +
				'<span class="passage-label"></span>' +
				'<div class="passage-content"></div>' +
				'<div class="passage-preview"><iframe src=""></div>' +
			'</div>',

			// Define the label for a widget toolbar button which will be automatically
			// created by the Widgets System. This button will insert a new widget instance
			// created from the template defined above, or will edit selected widget
			// (see second part of this tutorial to learn about editing widgets).
			//
			// Note: In order to be able to translate your widget you should use the
			// editor.lang.passage.* property. A string was used directly here to simplify this tutorial.
			button: 'Insert passage',

			// Set the widget dialog window name. This enables the automatic widget-dialog binding.
			// This dialog window will be opened when creating a new widget or editing an existing one.
			dialog: 'passage-dialog',

			pathName: 'object',

			// Check the elements that need to be converted to widgets.
			//
			// Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
			// so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
			// during data processing which is done on DOM represented by JavaScript objects.
			upcast: function(element, data) {
				if (element.name != 'cke:object')
					return false;
				if (element.attributes.type != 'text/html')
					return false;

				//console.log('passage.upcast!');

				data.uri = element.attributes.data || '';

				var label = new CKEDITOR.htmlParser.element('span', { class: 'passage-label' });

				var content = new CKEDITOR.htmlParser.element('div', { class: 'passage-content' });
				content.add(new CKEDITOR.htmlParser.text(data.uri));

				var preview = new CKEDITOR.htmlParser.element('div', { class: 'passage-preview' });
				var iframe = new CKEDITOR.htmlParser.element('iframe', { src: data.uri });
				preview.add(iframe);

				var outer = new CKEDITOR.htmlParser.element('div', { class: 'passage' });
				element.replaceWith(outer);
				outer.add(label);
				outer.add(content);
				outer.add(preview);

				return outer;
			},

			downcast: function (element) {
				var objectElement = new CKEDITOR.htmlParser.element('object', { type: 'text/html', data: this.data.uri || '' });
				//console.log('passage.downcast!', objectElement);
				return objectElement;
			},

			init: function () {
				//console.log('passage.init!');

				// Repair widget if necessary. This happens on paste, probably a widget bug.
				if (!$(this.element.$).is(':has(.passage-label)'))
					$(this.element.$).prepend('<span class="passage-label" />');
			},

			// Listen on the widget#data event which is fired
			// every time the widget data changes and updates the
			// widget's view.  Data may be changed by using the
			// widget.setData() method, which we use in the dialog
			// window.
			data: function () {
				//console.log('passage.data!', this.data);
				var content = $(this.element.$).find('> .passage-content');
				var iframe = $(this.element.$).find('> .passage-preview > iframe');
				if (this.data && this.data.uri && this.data.uri.length > 0) {
					content.html(this.data.uri);
					iframe.attr('src', this.data.uri);
				}
				else {
					content.html('&nbsp;'); // This is important. We see crazy bugs in ckeditor on getData() calls without this.
					iframe.attr('src', '');
				}
			}
		});
	}
});

// Local Variables:
// tab-width: 4
// End:
