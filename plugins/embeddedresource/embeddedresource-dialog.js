CKEDITOR.dialog.add('embeddedresource-dialog', function (editor) {
    return {
		title: 'Attachment Editor',
		minWidth: 400,
		minHeight: 300,

		contents: [
			{
				id: 'resource',
				label: 'Resource',
				title: 'Resource',
				elements: [
					{
						id: 'name',
						type: 'text',
						style: 'width: 100%;',
						label: 'Path',
						'default': '',
						required: true,
						setup: function (widget) {
							this.setValue(widget.data.uri);
						},
						commit: function (widget) {
							widget.setData('uri', this.getValue());
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
