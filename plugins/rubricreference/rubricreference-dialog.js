CKEDITOR.dialog.add('rubricreference-dialog', function (editor) {
	var $this = null;

    return {
		title: 'Rubric Finder',
		minWidth: 700,
		minHeight: 400,

		onFocus: function (a) {
			return $this.find('input').first();
		},

		contents: [
			{
				id: 'tab-rubricreference',
				label: '',
				title: '',
				elements: [
					{
						type: 'html',
						html: '<div class="rubricreference-dialog" />',
						onLoad: function (a) {
							$this = $('#' + this.domId);

							var dialog = this.getDialog();

							// ckeditor workarounds
							$this.parents('div[role="tabpanel"]').css('height', '100%');
							$this.parents('table').first().css('height', '100%');
							$this.css('height', '100%');

							$this.rubricFinder({
								select: function () {
									dialog.enableButton('ok');
								},
								commit: function () {
									dialog.click('ok');
								}
							});

							dialog.disableButton('ok');
						},

						setup: function (widget) {
							if (widget.data.rubricid)
								$this.rubricFinder('rubricId', widget.data.rubricid);
						},

						commit: function (widget) {
							var rubricId = $this.rubricFinder('rubricId');
							widget.setData('rubricid', rubricId);
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
