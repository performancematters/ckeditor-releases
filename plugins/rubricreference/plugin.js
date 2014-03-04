// Register the plugin within the editor.

CKEDITOR.plugins.add('rubricreference', {
	// This plugin requires the Widgets System defined in the 'widget' plugin.
	requires: 'widget',

	// Register the icon used for the toolbar button. It must be the same
	// as the name of the widget.
	icons: 'rubricreference',

	// The plugin initialization logic goes inside this method.
	init: function (editor) {
		// Load our CSS
		var href = this.path + "rubricreference.css";
		if ($('link[href="' + href + '"]').length == 0) {
			var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
			$("head").append(cssLink);
		}

		// Register the editing dialog.
		CKEDITOR.dialog.add('rubricreference-dialog', this.path + 'rubricreference-dialog.js');

		// Register the rubricreference widget.
		editor.widgets.add('rubricreference', {
			// Allow all HTML elements, classes, and styles that this widget requires.
			// Read more about the Advanced Content Filter here:
			// * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
			// * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
			//allowedContent: 'span(!rubricreference); span(!rubricreference-label); br; span(!rubricreference-content);',

			// Minimum HTML which is required by this widget to work.
			//requiredContent: 'span(rubricreference)',

			// Define the template of a new rubricreference widget.
			// The template will be used when creating new instances of the rubricreference widget.
			template:
			'<span class="rubricreference">' +
				'<span class="rubricreference-label"></span>' +
				'<span class="rubricreference-description"></span>' +
			'</span>',

			// Define the label for a widget toolbar button which will be automatically
			// created by the Widgets System. This button will insert a new widget instance
			// created from the template defined above, or will edit selected widget
			// (see second part of this tutorial to learn about editing widgets).
			//
			// Note: In order to be able to translate your widget you should use the
			// editor.lang.rubricreference.* property. A string was used directly here to simplify this tutorial.
			button: 'Add a scoring rubric',

			// Set the widget dialog window name. This enables the automatic widget-dialog binding.
			// This dialog window will be opened when creating a new widget or editing an existing one.
			dialog: 'rubricreference-dialog',

			pathName: 'span',

			// Check the elements that need to be converted to widgets.
			//
			// Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
			// so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
			// during data processing which is done on DOM represented by JavaScript objects.
			upcast: function (element, data) {
				if (element.name != 'span')
					return false;

				data.rubricid = element.attributes['data-rubricid'];
				if (!data.rubricid)
					return false;

				//
				// Wrap span[@data-rubricid] with rubricreference widgets.
				//
				// <span data-rubricid="...">...</span> ==> <span class="rubricreference">...</span>
				//

				//console.log('rubricreference.upcast!');

				var label = new CKEDITOR.htmlParser.element('span', { class: 'rubricreference-label' });
				var description = new CKEDITOR.htmlParser.element('span', { class: 'rubricreference-description' });
				var outer = new CKEDITOR.htmlParser.element('span', { class: 'rubricreference' });
				element.replaceWith(outer);
				outer.add(label);
				outer.add(description);

				return outer;
			},

			downcast: function (element) {
				//
				// Unwrap rubricreference widgets leaving just the span inside.
				//
				// <span class="rubricreference">...</span> ==> <span data-rubricid="">...</span>
				//

				var spanElement = new CKEDITOR.htmlParser.element('span', { 'data-rubricid': this.data.rubricid });
				//console.log('rubricreference.downcast!', spanElement);
				return spanElement;
			},

			init: function () {
				//console.log('rubricreference.init!');

				// Repair widget if necessary. This happens on paste, probably a widget bug.
				if (!$(this.element.$).is(':has(.rubricreference-label)'))
					$(this.element.$).prepend('<span class="rubricreference-label" />');
			},

			// Listen on the widget#data event which is fired
			// every time the widget data changes and updates the
			// widget's view.  Data may be changed by using the
			// widget.setData() method, which we use in the dialog
			// window.
			data: function () {
				//console.log('rubricreference.data!', editor);
				if (this.data && this.data.rubricid) {
					var description = '<b>' + this.data.rubricid + '</b>';
					var descriptionElement = $(this.element.$).find('> .rubricreference-description');
					descriptionElement.html(description);

					editor.config.rubricDataSource.get(this.data.rubricid,
													   function (data) {
														   description += ' ' + data.title;
														   descriptionElement.html(description);
													   },
													   function (errorMessage) {
														   description += ' ?';
														   descriptionElement.html(description);
													   });
				}
			}
		});
	}
});

// Local Variables:
// tab-width: 4
// End:
