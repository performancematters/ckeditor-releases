CKEDITOR.dialog.add('passage-dialog', function (editor) {
    return {
		title: 'Passage Properties',
		minWidth: 400,
		minHeight: 240,

		contents: [
			{
				id: 'tab-passage',
				label: 'Passage',
				title: 'Passage',
				elements: [
					{
						id: 'url',
						type: 'text',
						style: 'width: 100%;',
						label: 'URL',
						'default': '',
						required: true,
						setup: function (widget) {
							this.setValue(widget.data.url);
						},
						commit: function (widget) {
							widget.setData('url', this.getValue());
						}
					},
					{
						id: 'browse',
						type: 'button',
						label: 'Browse Server',
						title: 'Browse Server',
						onClick: function () {
							var button = this;
							var dialog = button.getDialog();
							var url = dialog.getContentElement('tab-passage', 'url');

							var width  = screen.availWidth *2/3;
							var height = screen.availHeight*2/3;
							var left = (screen.width /2)-(width /2);
							var top  = (screen.height/2)-(height/2);
							left += screen.availLeft;
							top  += screen.availTop ;
							var href = editor.config.contextPath + '/finder/index.jsp?embedded';
							var finderWindow = window.open(href, "finder", "width="+width+",height="+height+",left="+left+",top="+top);
							finderWindow.focus();
							$(finderWindow).load(function () {
								var finder = finderWindow.$('#finder');

								finder.finder({
									contextPath: editor.config.contextPath,
									initialSelection: url.getValue()
								});

								finder.on('finder-select', function (e, selection) {
									url.setValue(selection.contextPath + selection.pathString);
									finderWindow.close();
								});
							});
						}
					},
					{
						id: 'height',
						type: 'html',
						html: '<div>' +
								'<div style="font-weight:bold;margin-bottom:2px;">Passage height</div>' +
								'<div><label><input type="radio" name="mode" value="expand" checked>Expand passage area as necessary to expose all content</label></div>' +
								'<div><label><input type="radio" name="mode" value="fixed">Limit passage area to a fixed height with scrollbar</label></div>' +
								'<div style="margin-left:30px;"><label>Display height:<input type="text" name="height" style="border:1px solid black;padding:2px;width:50px;margin:0 4px;">pixels</label></div>' +
							'</div>',
						setup: function (widget) {
							var expandControl = $(this.getElement().$).find('input[value="expand"]');
							var fixedControl = $(this.getElement().$).find('input[value="fixed"]');
							var heightControl = $(this.getElement().$).find('input[name="height"]');

							expandControl.add(fixedControl).off('change').on('change', function (event) {
								var expand = expandControl[0].checked;
								heightControl[0].disabled = expand;
								heightControl.css({ color: expand ? 'grey' : 'black' });
							});

							var expand = widget.data && (!('height' in widget.data) || widget.data.height == 'expand');
							expandControl[0].checked = expand;
							fixedControl[0].checked = !expand;
							heightControl.val(expand || !('height' in widget.data) ? '400' : widget.data.height);
							expandControl.trigger('change');
						},
						commit: function (widget) {
							var expandControl = $(this.getElement().$).find('input[value="expand"]');
							var heightControl = $(this.getElement().$).find('input[name="height"]');

							var height = expandControl[0].checked ? 'expand' : heightControl.val();
							widget.setData('height', height);
						}
					},
					{
						id: 'font',
						type: 'html',
						html: '<div>' +
								'<div style="font-weight:bold;margin-bottom:2px;">Font</div>' +
								'<div><label><input type="checkbox" name="font" checked>Blend surrounding font into passage</label></div>' +
							'</div>',
						setup: function (widget) {
							var fontblendControl = $(this.getElement().$).find('input');
							fontblendControl[0].checked = widget.data && widget.data.fontblend;
						},
						commit: function (widget) {
							var fontblendControl = $(this.getElement().$).find('input');
							widget.setData('fontblend', fontblendControl[0].checked);
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
