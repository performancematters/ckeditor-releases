// Load our CSS
$.get(CKEDITOR.getUrl('plugins/hottextinteraction/hottextinteraction-widget.css'), CKEDITOR.addCss);

// Register the plugin within the editor.
CKEDITOR.plugins.add('hottextinteraction', {
    // This plugin requires the Widgets System defined in the 'widget' plugin.
    requires: 'widget',

    // Register the icon used for the toolbar button. It must be the same
    // as the name of the widget.
    icons: 'hottextinteraction',

    // The plugin initialization logic goes inside this method.
    init: function (editor) {
        var href = this.path + "hottextinteraction-dialog.css";
        if ($('link[href="' + href + '"]').length == 0) {
            var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
            $("head").append(cssLink);
        }

		// Register the editing dialog.
		CKEDITOR.dialog.add('hottextinteraction-dialog', this.path + 'hottextinteraction-dialog.js');

        // Register the hottextinteraction widget.
        editor.widgets.add('hottextinteraction', {
            // Allow all HTML elements, classes, and styles that this widget requires.
            // Read more about the Advanced Content Filter here:
            // * http://docs.ckeditor.com/#!/guide/dev_advanced_content_filter
            // * http://docs.ckeditor.com/#!/guide/plugin_sdk_integration_with_acf
            allowedContent: 'hottextinteraction[data-responsedeclaration];hottext[identifier]',

            // Minimum HTML which is required by this widget to work.
            requiredContent: 'hottextinteraction',

            // Define the template of a new hottextinteraction widget.
            // The template will be used when creating new instances of the hottextinteraction widget.
            template:
            '<span class="hottextinteraction">' +
                '<span class="hottextinteraction-label"></span>' +
                '<span class="hottextinteraction-content"></span>' +
            '</span>',

            // Define the label for a widget toolbar button which will be automatically
            // created by the Widgets System. This button will insert a new widget instance
            // created from the template defined above, or will edit selected widget
            // (see second part of this tutorial to learn about editing widgets).
            //
            // Note: In order to be able to translate your widget you should use the
            // editor.lang.hottextinteraction.* property. A string was used directly here to simplify this tutorial.
            button: 'Hot Text Interaction',

            // Set the widget dialog window name. This enables the automatic widget-dialog binding.
            // This dialog window will be opened when creating a new widget or editing an existing one.
            dialog: 'hottextinteraction-dialog',

            pathName: 'hottextinteraction',

            // Check the elements that need to be converted to widgets.
            //
            // Note: The "element" argument is an instance of http://docs.ckeditor.com/#!/api/CKEDITOR.htmlParser.element
            // so it is not a real DOM element yet. This is caused by the fact that upcasting is performed
            // during data processing which is done on DOM represented by JavaScript objects.
            upcast: function (element, data) {
                if (element.name != 'hottext')
                    return false;

				data.interactionData = {};

				if (element.attributes && 'data-responsedeclaration' in element.attributes)
					data.interactionData.responseDeclaration = JSON.parse(element.attributes['data-responsedeclaration']);

                var label = new CKEDITOR.htmlParser.element('span', { class: 'hottextinteraction-label' });

                var content = new CKEDITOR.htmlParser.element('span', { class: 'hottextinteraction-content' });
				content.add(new CKEDITOR.htmlParser.text('&nbsp;'));

                var outer = new CKEDITOR.htmlParser.element('span', { class: 'hottextinteraction' });
                element.replaceWith(outer);
                outer.add(label);
                outer.add(content);

				var choices = [];
				var choice = { text: '' };

				if (element.attributes && 'identifier' in element.attributes) 
							choice.identifier = element.attributes.identifier;
							

				if (element.children.length > 0) {
					var textElement = element.children[0];
					if (textElement instanceof CKEDITOR.htmlParser.text)
						choice.text = textElement.value;
				}

				choices.push(choice);
					
				
				data.interactionData.choices = choices;

                return outer;
            },

            downcast: function (element) {
				var hottextinteractionElement = new CKEDITOR.htmlParser.element('hottext');

				if (this.data && this.data.interactionData && this.data.interactionData.responseDeclaration)
					hottextinteractionElement.attributes['data-responsedeclaration'] = JSON.stringify(this.data.interactionData.responseDeclaration);

				//if (this.data && this.data.interactionData && 'shuffle' in this.data.interactionData)
				//	hottextinteractionElement.attributes['data-shuffle'] = JSON.stringify(this.data.interactionData.shuffle);
				var inlineChoiceElement = null;
				if (this.data && this.data.interactionData && this.data.interactionData.choices) {
					var choices = this.data.interactionData.choices;
					var isCorrectResponse = false;
					
					
					for (var i=0; i<choices.length; ++i) {
						var choice = choices[i];
						var attributes = { identifier: choice.identifier };
						if(this.data.interactionData.responseDeclaration 
								&& this.data.interactionData.responseDeclaration.correctResponse
									&& this.data.interactionData.responseDeclaration.correctResponse.value){
							var correctResponseVal = this.data.interactionData.responseDeclaration.correctResponse.value;
							var temp = new Array();
							if(!correctResponseVal instanceof Array)
								temp.push(correctResponseVal);
							else
								temp = correctResponseVal;
							
							for(var i=0; i< temp.length ; i++)
								if(temp[i] == choice.identifier)
									isCorrectResponse = true;
						}
						
						
						inlineChoiceElement = new CKEDITOR.htmlParser.element('hottext', attributes);
						inlineChoiceElement.add(new CKEDITOR.htmlParser.text(choice.text));
						if(isCorrectResponse)
							inlineChoiceElement.addClass("isCorrect-true");
						
					}
				}

				return inlineChoiceElement;
            },

            init: function () {
                // Repair widget if necessary. This happens on paste, probably a widget bug.
                if (!$(this.element.$).is(':has(.hottextinteraction-label)'))
                    $(this.element.$).prepend('<span class="hottextinteraction-label" />');
            },

            // Listen on the widget#data event which is fired
            // every time the widget data changes and updates the
            // widget's view.  Data may be changed by using the
            // widget.setData() method, which we use in the dialog
            // window.
            data: function () {
                var content = $(this.element.$).find('> .hottextinteraction-content');
                if (this.data && this.data.interactionData && this.data.interactionData.choices) {
					var description;
					switch (this.data.interactionData.choices.length) {
					case 0:
						description = '<i>No answers</i>';
						break;
					case 1:
						description = '<i>'+this.data.interactionData.choices[0].text+'</i>';
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
