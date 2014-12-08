CKEDITOR.dialog.add('gapmatchelement-dialog', function (editor) {

	function randomIdentifier() {
		return "ABCDEFGHJKMNPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 23)) + Math.floor(Math.random() * 1e8);
	}

	function getPlaceholder($element) {
		return $element.find('.gapmatchelement-placeholder');
	}

    return {
		title: 'Gap Match Element',
		minWidth: 380,
		minHeight: 80,

		onLoad: function (evt) {
			var dialog = this;
			var element = dialog.getContentElement('tab-gapmatchelement', 'placeholder');
			var $element = $(element.getElement().$);
		},

		contents: [
			{
				id: 'tab-gapmatchelement',
				label: 'Gap Match Element',
				title: 'Gap Match Element',
				elements: [
					{
						id: 'placeholder',
						type: 'html',
						html: '<div class="gapmatchelement-dialog">' +
							'<div class="gapmatchelement-header">Type in a placeholder label for the gap match element (Optional)</div>' +
							'<input type="text" class="gapmatchelement-placeholder"></input><br />' +
							'<div class="gapmatchelement-note">If you do not define a placeholder, then it will be auto-generated.</div>' +
							'</div>',
						setup: function (widget) {
							var $element = $('#' + this.domId);
							var placeholderText = (widget.data.gapMatchElementData && widget.data.gapMatchElementData.placeholder) ? widget.data.gapMatchElementData.placeholder : "";
						},
						commit: function (widget) {
							var $element = $('#' + this.domId);
							var $placeholder = getPlaceholder($element);
							var identifier = $placeholder.attr('data-identifier') || randomIdentifier();
							widget.setData('gapMatchElementData', {
								identifier: identifier,
								placeholder: $placeholder.val()
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
