// Register the plugin within the editor.

CKEDITOR.plugins.add('mathmleditor', {
	// This plugin requires the Widgets System defined in the 'widget' plugin.
	requires: 'widget',

	// Register the icon used for the toolbar button. It must be the same
	// as the name of the widget.
	icons: 'mathmleditor',

	// The plugin initialization logic goes inside this method.
	init: function (editor) {
		// Load our CSS
		var href = this.path + "mathmleditor.css";
		if ($('link[href="' + href + '"]').length == 0) {
			var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
			$("head").append(cssLink);
		}

		// Register the editing dialog.
		CKEDITOR.dialog.add('mathmleditor-dialog', this.path + 'mathmleditor-dialog.js');

		// Register the mathmleditor widget.
		editor.widgets.add('mathmleditor', {
			// Allow all HTML elements, classes, and styles that this widget requires.
			// Read more about the Advanced Content Filter here:
			// * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
			// * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
			//allowedContent: 'span(!mathmleditor); span(!mathmleditor-label); br; span(!mathmleditor-content);',

			// Minimum HTML which is required by this widget to work.
			//requiredContent: 'span(mathmleditor)',

			// Define the template of a new mathmleditor widget.
			// The template will be used when creating new instances of the mathmleditor widget.
			template:
			'<span class="mathmleditor">' +
				'<span class="mathmleditor-label"></span>' +
				'<span class="mathmleditor-content"></span>' +
			'</span>',

			// Define the label for a widget toolbar button which will be automatically
			// created by the Widgets System. This button will insert a new widget instance
			// created from the template defined above, or will edit selected widget
			// (see second part of this tutorial to learn about editing widgets).
			//
			// Note: In order to be able to translate your widget you should use the
			// editor.lang.mathmleditor.* property. A string was used directly here to simplify this tutorial.
			button: 'Typeset mathematics',

			// Set the widget dialog window name. This enables the automatic widget-dialog binding.
			// This dialog window will be opened when creating a new widget or editing an existing one.
			dialog: 'mathmleditor-dialog',

			pathName: 'math',

			// Check the elements that need to be converted to widgets.
			//
			// Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
			// so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
			// during data processing which is done on DOM represented by JavaScript objects.
			upcast: function (element, data) {
				if (element.name != 'math')
					return false;

				//
				// Wrap mathml with mathmleditor widgets.
				//
				// <math>...</math> ==> <span class="mathmleditor">...</span>
				//

				//console.log('mathmleditor.upcast!');

				data.mathML = element.getOuterHtml();

				var label = new CKEDITOR.htmlParser.element('span', { class: 'mathmleditor-label' });

				var content = new CKEDITOR.htmlParser.element('span', { class: 'mathmleditor-content' });
				content.add(new CKEDITOR.htmlParser.text(data.mathML));

				var outer = new CKEDITOR.htmlParser.element('span', { class: 'mathmleditor' });
				element.replaceWith(outer);
				outer.add(label);
				outer.add(content);

				data.mathML = data.mathML.replace('&', '&amp;'); // Wow. But we were losing less-than signs without this.

				return outer;
			},

			downcast: function (element) {
				//
				// Unwrap mathmleditor widgets leaving just the mathml inside.
				//
				// <span class="mathmleditor">...</span> ==> <math>...</math>
				//

				var mathML = this.data.mathML;
				mathML = mathML.replace(/<math>/, '<math xmlns="http://www.w3.org/1998/Math/MathML">');
				var result = new CKEDITOR.htmlParser.text(mathML);
				//console.log('mathmleditor.downcast!', result);
				return result;
			},

			init: function () {
				//console.log('mathmleditor.init!');

				// Repair widget if necessary. This happens on paste, probably a widget bug.
				if (!$(this.element.$).is(':has(.mathmleditor-label)'))
					$(this.element.$).prepend('<span class="mathmleditor-label" />');
			},

			// Listen on the widget#data event which is fired
			// every time the widget data changes and updates the
			// widget's view.  Data may be changed by using the
			// widget.setData() method, which we use in the dialog
			// window.
			data: function () {
				//console.log('mathmleditor.data!');
				if (this.data && this.data.mathML) {
					var mathMLContent = $(this.element.$).find('> .mathmleditor-content');
					mathMLContent.html(this.data.mathML);
					typesetMath(mathMLContent);
				}
			}
		});
	}
});

// Local Variables:
// tab-width: 4
// End:
