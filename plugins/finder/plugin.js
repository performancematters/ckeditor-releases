// Register the plugin within the editor.

CKEDITOR.plugins.add('finder', {
	// Register the icon used for the toolbar button. It must be the same
	// as the name of the widget.
	icons: 'finder',

	// The plugin initialization logic goes inside this method.
	init: function (editor) {

		var self = this;

		editor.addCommand('finder', {
			exec: function (editor) {
				var width  = screen.availWidth *2/3;
				var height = screen.availHeight*2/3;
				var left = (screen.width /2)-(width /2);
				var top  = (screen.height/2)-(height/2);
				left += screen.availLeft;
				top  += screen.availTop ;
				var href = self.path + "index.jsp";
				var finderWindow = window.open(href, "finder", "width="+width+",height="+height+",left="+left+",top="+top);
window.finderWindow = finderWindow;
				finderWindow.focus();
				$(finderWindow).load(function () {
					finderWindow.$('#finder').on('finder-select', function (e, path) {
						console.log(e, this, path);
					});
				});

			}
		});

		editor.ui.addButton('Finder', {
			label: 'Finder!',
			command: 'finder',
			toolbar: 'insert,50'
		});

	}
});

// Local Variables:
// tab-width: 4
// End:
