(function (window) {
	// LOSING BATTLE HERE YO

	var data = {
		eval: undefined,
		safeEval: undefined,
		setInterval: undefined,
		setTimeout: undefined,
		Function: undefined,
		document: undefined,
	};

	function safeEval(code) {
		var error = false;
		setRunningTimeout();
		data.me = document.playerCommands;

		try {
			if (code === "") {
				return;
			} else {
				code = checkCode(code);
				if (code) {
					window.data = data;
					var safeCode = "with(data){" + code + "};";
					eval(safeCode);
				}
			}	
		} catch (e) {
			console.error(e);
			error = true;
		} finally {
			window.data = undefined;
		}
		return error;
	}


	function canThisCodeRun(code) {
		var braceStack = [];
		var parenStack = [];
		var bracketStack = [];
		var quotes = false;
		var singleQuotes = false;

		for (var i = 0; i < code.length; i++) {
			if (code[i] === "\"" && code[i - 1] === "\\" && !singleQuotes) {
				quotes = !quotes;
			} else if (code[i] === "\"" && code[i - 1] === "\\" && !quotes) {
				singleQuotes = !singleQuotes;
			} else if (code[i] === "{" && code[i - 1] !== "\\{"
				&& !quotes && !singleQuotes) {
				braceStack.push("{");
			} else if (code[i] === "(" && code[i - 1] !== "\\("
				&& !quotes && !singleQuotes) {
				parenStack.push("(");
			} else if (code[i] === "[" && code[i - 1] !== "\\["
				&& !quotes && !singleQuotes) {
				bracketStack.push("[");
			} else if (code[i] === "}" && !quotes && !singleQuotes && braceStack.pop() === undefined) {
				return true; // Errors out
			} else if (code[i] === "]" && !quotes && !singleQuotes && bracketStack.pop() === undefined) {
				return true; // Errors out
			} else if (code[i] === ")" && !quotes && !singleQuotes && parenStack.pop() === undefined) {
				return true; // Errors out
			}
		}

		if (braceStack.length > 0 || parenStack.length > 0 || bracketStack > 0) {
			return false;
		} else {
			return true;
		}
	}


	// Checks if there is a } bracket that closes the with 
	function checkCode(code) {
		var stack = [];
		var quotes = false;
		var singleQuotes = false;
		for (var i = 0; i < code.length; i++) {
			if (code[i] === "\"" && code[i - 1] === "\\" && !singleQuotes) {
				quotes = !quotes;
			} else if (code[i] === "\"" && code[i - 1] === "\\" && !quotes) {
				singleQuotes = !singleQuotes;
			} else if (code[i] === "{" && code[i - 1] !== "\\{") {
				if (!quotes && !singleQuotes) {
					stack.push("{");
					code = code.slice(0, i + 1) + ";checkTimeout();" + code.slice(i + 1, code.length);
				}
			} else if (code[i] === "}" && !quotes && !singleQuotes && stack.pop() === undefined) {
				return false;
			}
		}
		return code;
	}

	var timeout;

	function setRunningTimeout() {
		timeout = new Date();
	}

	function insertTimeout(code) {
		var bracesStack = [];
		for (var i = 0; i < code.length; i++) {
			if (code[i] === "{") {
				bracesStack.push("{");
			} else if (code[i] === "}") {
				bracesStack.push("}");
			}
		}
	}

	function checkTimeout() {
		if (new Date() - timeout > 1000) {
			throw new Error("Breaking out of function due to timeout");
		}
	}

    var $repl = document.getElementById('textarea');
    $(function() { 
        cm = CodeMirror.fromTextArea($repl, {
            lineNumbers: true,
            matchBrackets: true, 
            mode: 'javascript',
            theme: 'twilight',
            lineWrapping: true
        });
    	cm.lastLineRun = 0;
        cm.setSize(null, 400);
    });

    var $codeMirror;

    function getValue (cm) {
    	var result = "";
    	for (var i = cm.lastLineRun; i < cm.lastLine(); i++) {
    		result += cm.getLine(i);
    	}
    	return result;
    }
    $codeMirror = document.querySelector('.textarea-container');
    $codeMirror.addEventListener("keydown", function (e) {
    	cm.save();

    	var code = getValue(cm);
    	var ENTER = 13;
    	if (e.keyCode === ENTER) {
    		if (!canThisCodeRun(code)) {
    			return;
    		} else {
    			var err = safeEval(code);
    			var replLines = $('.CodeMirror-code > div');
    			if (!err) {
	    			replLines.each(function (index) {
	    				if (index === replLines.length) {
	    					return;
	    				} else if (!$(this).hasClass('run')) {
	    					$(this).addClass('run');
	    				}
	    			});	
    			} else {
					replLines.each(function (index) {
	    				if (index === replLines.length + 1) {
	    					return;
	    				} else if (!$(this).hasClass('run')) {
	    					$(this).addClass('run err');
	    				}
	    			});
    			}
    			
    			replLines.addClass('run');
    			$(replLines[replLines.length]).removeClass('run');
    			// TODO: Not add the class for lines that have not been run
    			cm.lastLineRun = cm.lastLine();
    		}
    	}
    });

    function count(str, char) {
    	var result = 0;
    	for (var i = 0; i < str.length; i++) {
    		if (str[i] === char) {
    			result++;
    		}
    	}
    	return result;
    }

	window.checkTimeout = checkTimeout;
	window.safeEval = safeEval;
	window.canThisCodeRun = canThisCodeRun;

	// TODO: Prevent __defineSetter__ and __defineGetter__ from messing around with code

})(window);