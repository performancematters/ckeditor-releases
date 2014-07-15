CKEDITOR.dialog.add('passage-dialog', function (editor) {

	function recoverCommon() {
		// I really wish I knew a better way to recover the 'common' object than this.

		// Remove any custom requirejs error handler so we can handle errors here.
		var orignalRequireJSErrorHandler = requirejs.onError;
		requirejs.onError = null;

		try {
			// This succeeds in the testing environment without all of Unify loaded but fails with full Unify.
			return require('./common');
		} catch (e) {
			// This succeeds in full Unify but fails in the testing environment.
			return require('pmQtiLib/common');
		} finally {
			// Restore any custom requirejs error handler.
			requirejs.onError = orignalRequireJSErrorHandler;
		}
	}

    return {
		title: 'Passage Properties',
		minWidth: 400,
		minHeight: 240,

		onLoad: function (evt) {
			//
			// We go through some trouble to make sure that tabbing through the dialog works as expected.
			//

			var urlElement = this.getContentElement('tab-passage', 'url');
			var heightElement = this.getContentElement('tab-passage', 'height');
			var fontElement = this.getContentElement('tab-passage', 'font');

			var urlInput = $(urlElement.getElement().$).find('input');
			this.addFocusable(new CKEDITOR.dom.element(urlInput[0]), 0);

			var expandInput = $(heightElement.getElement().$).find('input[value="expand"]');
			this.addFocusable(new CKEDITOR.dom.element(expandInput[0]), 2);

			var fixedInput = $(heightElement.getElement().$).find('input[value="fixed"]');
			this.addFocusable(new CKEDITOR.dom.element(fixedInput[0]), 3);

			var heightInput = $(heightElement.getElement().$).find('input[name="height"]');
			this.addFocusable(new CKEDITOR.dom.element(heightInput[0]), 4);

			var fontInput = $(fontElement.getElement().$).find('input[name="font"]');
			this.addFocusable(new CKEDITOR.dom.element(fontInput[0]), 5);
		},

		contents: [
			{
				id: 'tab-passage',
				label: 'Passage',
				title: 'Passage',
				elements: [
					{
						id: 'url',
						type: 'html',
						html: '<div>' +
								'<div style="font-weight:bold;margin-bottom:2px;">URL</div>' +
								'<input type="text" name="height" style="border:1px solid #aaa;padding:4px;width:98%;border-radius:3px;">' +
								'<div style="margin-top:2px;">Note: URLs to external sources will become inactive over time.</div>' +
							'</div>',
						setup: function (widget) {
							var input = $(this.getElement().$).find('input');
							input.val(widget.data.url);
						},
						commit: function (widget) {
							var input = $(this.getElement().$).find('input');
							widget.setData('url', input.val());
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
							var urlElement = dialog.getContentElement('tab-passage', 'url');
							var urlInput = $(urlElement.getElement().$).find('input');

							var common = recoverCommon();
							common.openFinderDialogWindow({
								contextPath: editor.config.contextPath,
								load: function () {
									var finderDialogWindow = this;
									var finder = finderDialogWindow.$('#finder');
									finder.finder({
										contextPath: editor.config.contextPath,
										initialSelection: urlInput.val()
									})
									.on('finder-select', function (event, selection) {
										finderDialogWindow.close();
										urlInput.val(selection.contextPath + selection.pathString);
									})
									.on('finder-cancel', function (event) {
										finderDialogWindow.close();
									});
								}
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
								'<div style="margin-left:30px;"><label>Display height:<input type="text" name="height" style="border:1px solid #aaa;padding:4px;width:50px;margin:0 4px;border-radius:3px;">pixels</label></div>' +
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
