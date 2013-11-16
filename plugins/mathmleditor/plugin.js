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
	    var cssLink = $("<link rel='stylesheet' type='text/css' href='" + this.path + "mathmleditor.css'>");
	    $("head").append(cssLink); 

	    // Register the editing dialog.
	    CKEDITOR.dialog.add('mathmleditor-dialog', this.path + 'mathmleditor-dialog.js');

	    // Register the mathmleditor widget.
	    editor.widgets.add('mathmleditor', {
		// Allow all HTML elements, classes, and styles that this widget requires.
		// Read more about the Advanced Content Filter here:
		// * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
		// * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
		allowedContent: 'span(!mathmleditor);',

		// Minimum HTML which is required by this widget to work.
		requiredContent: 'span(mathmleditor)',

		// Define nested editable areas.
		editables: { },

		// Define the template of a new pm_mathml widget.
		// The template will be used when creating new instances of the pm_mathml widget.
		template: '<span class="mathmleditor" />',

		// Define the label for a widget toolbar button which will be automatically
		// created by the Widgets System. This button will insert a new widget instance
		// created from the template defined above, or will edit selected widget
		// (see second part of this tutorial to learn about editing widgets).
		//
		// Note: In order to be able to translate your widget you should use the
		// editor.lang.pm_mathml.* property. A string was used directly here to simplify this tutorial.
		button: 'Typeset mathematics',

		// Set the widget dialog window name. This enables the automatic widget-dialog binding.
		// This dialog window will be opened when creating a new widget or editing an existing one.
		dialog: 'mathmleditor-dialog',

		// Check the elements that need to be converted to widgets.
		//
		// Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
		// so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
		// during data processing which is done on DOM represented by JavaScript objects.
		upcast: function(element) {
		    // Return "true" (that element needs to converted to a matheditor widget)
		    // for all <span> elements with a "mathmleditor" class.
		    return element.name == 'span' && element.hasClass('mathmleditor');
		},

		// When a widget is being initialized, we need to read the data
		// from DOM and set it by using the widget.setData() method.
		init: function() {
		    this.setData('mathML', $(this.element.$).html());
		},

		// Listen on the widget#data event which is fired
		// every time the widget data changes and updates the
		// widget's view.  Data may be changed by using the
		// widget.setData() method, which we use in the dialog
		// window.
		data: function() {
		    if (this.data && this.data.mathML) {
			var mathMLContainer = $(this.element.$);
			mathMLContainer.html(this.data.mathML);
			typesetMath(mathMLContainer);
		    }
		}
	    } );
	}
} );
