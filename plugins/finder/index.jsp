<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	String contextPath = getServletContext().getContextPath();
	String CKEditor = request.getParameter("CKEditor");
	String CKEditorFuncNum = request.getParameter("CKEditorFuncNum");
	String langCode = request.getParameter("langCode");
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Resource Finder</title>
    <link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css" />
	<link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="<%=contextPath%>/finder/finder.css" />
    <script type="text/javascript" src="//code.jquery.com/jquery-1.11.0.min.js"></script>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/finder/finder.js"></script>
    <script>
		$(document).ready(function () {
			$('#finder').finder({ contextPath: '<%=contextPath%>' });
			$('#finder').on('finder-select', function (e, selection) {
				console.log(e, this, selection);
				window.opener.CKEDITOR.tools.callFunction(<%=CKEditorFuncNum%>, selection.contextPath + selection.pathString);
				window.close();
			});
      });
    </script>
	<style>
		body {
			font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
			font-size: 11px;
		}

		#finder {
			border: 1px solid #ccc;
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			margin: 8px;
		}
	</style>
  </head>
  <body>
    <div id="finder">
    </div>
  </body>
</html>

<%-- Local Variables: --%>
<%-- tab-width: 4 --%>
<%-- End: --%>
