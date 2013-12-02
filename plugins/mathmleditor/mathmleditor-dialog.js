CKEDITOR.dialog.add('mathmleditor-dialog', function (editor) {
    var wirisEditor;
	var wirisCodeLoadAjax = null;

	function loadWirisCode(done) {
		if ('com' in window && 'wiris' in window.com)
			// wiris code is already loaded.
			done();
		else {
			// Load wiris code.
			if (wirisCodeLoadAjax == null)
				wirisCodeLoadAjax = $.getScript("http://www.wiris.net/demo/editor/editor");
			wirisCodeLoadAjax.done(function () {
				wirisCodeLoadAjax = null;
				done();
			});
		}
	}

    return {
		title: 'Math Editor',
		minWidth: 400,
		minHeight: 300,

		contents: [
			{
				id: 'tab-mathml',
				label: 'MathML',
				title: 'MathML',
				elements: [
					{
						type: 'html',
						html: '<div class="mathmleditor-dialog" />',
						onLoad: function (a) {
							var $this = $('#' + this.domId);

							// ckeditor workarounds
							$this.parents('div[role="tabpanel"]').css('height', '100%');
							$this.parents('table').first().css('height', '100%');
							$this.css('height', '100%');

							loadWirisCode(function () {
								wirisEditor = com.wiris.jsEditor.JsEditor.newInstance({'language': 'en'});
								wirisEditor.insertInto($this[0]);
							});

						},
						// When setting up this field, set its value from widget data.
						setup: function (widget) {
							loadWirisCode(function () {
								wirisEditor.setMathML('mathML' in widget.data && widget.data.mathML.length > 0 ?
													  widget.data.mathML :
													  '<math xmlns="http://www.w3.org/1998/Math/MathML" />');
							});
						},
						// When committing (saving) this field, set its value to the widget data.
						commit: function (widget) {
							widget.setData('mathML', wirisEditor.getMathML());
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
