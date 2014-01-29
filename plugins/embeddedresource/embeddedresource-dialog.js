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
						id: 'uri',
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
					},
					{
						id: 'type',
						type: 'text',
						style: 'width: 100%;',
						label: 'Type',
						'default': '',
						required: true,
						setup: function (widget) {
							this.setValue(widget.data.type);
						},
						commit: function (widget) {
							widget.setData('type', this.getValue());
						}
					},
					{
						type: 'html',
						html: '<div class="embeddedresource-dialog" />',
						onLoad: function (a) {
							//debugger;
							var self = this;
							var $this = $('#' + this.domId);
							$this.resourceFinder({
								select: function (props) {
									//console.log('select!', props);
									self.getDialog().getContentElement('resource', 'uri').setValue(props.fullpath);
									self.getDialog().getContentElement('resource', 'type').setValue(props.mimetype);
								}
							});
						},
						// When setting up this field, set its value from widget data.
						setup: function (widget) {
							//debugger;
						},
						// When committing (saving) this field, set its value to the widget data.
						commit: function (widget) {
							//debugger;
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
