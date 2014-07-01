CKEDITOR.dialog.add('passage-dialog', function (editor) {
    return {
		title: 'Passage Properties',
		minWidth: 400,
		minHeight: 200,

		contents: [
			{
				id: 'tab-passage',
				label: 'Passage',
				title: 'Passage',
				elements: [
					{
						id: 'uri',
						type: 'text',
						style: 'width: 100%;',
						label: 'URL',
						'default': '',
						required: true,
						setup: function (widget) {
							this.setValue(widget.data.uri);
						},
						commit: function (widget) {
							widget.setData('uri', this.getValue());
						}
					},
					{
						id: 'browse',
						type: 'button',
						label: 'Browse Server',
						title: 'Browse Server',
						onClick: function () {
							var button = this;
							var width  = screen.availWidth *2/3;
							var height = screen.availHeight*2/3;
							var left = (screen.width /2)-(width /2);
							var top  = (screen.height/2)-(height/2);
							left += screen.availLeft;
							top  += screen.availTop ;
							var href = "/sasam/finder/index.jsp";
							var finderWindow = window.open(href, "finder", "width="+width+",height="+height+",left="+left+",top="+top);
							window.finderWindow = finderWindow;
							finderWindow.focus();
							$(finderWindow).load(function () {
								finderWindow.$('#finder').on('finder-select', function (e, path) {
									//console.log(e, this, path);

									var url = '/sasam/external/resource';
									for (var i=2; i<path.length; ++i)
										url += '/' + path[i];

									var dialog = button.getDialog();
									var uri = dialog.getContentElement('tab-passage', 'uri');
									uri.setValue(url);

									finderWindow.close();
								});
							});
						}
					}
				]
			}
		]
    };
});

// Local Variables:
// tab-width: 4
// End:
