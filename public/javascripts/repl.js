(function (window) {
	// LOSING BATTLE HERE YO

	function safeEval(code) {
		setRunningTimeout();
		try {
			if (code === "") {
				return;
			} else {
				code = checkCode(code);
				if (code) {
					window.data = {
						eval: undefined,
						safeEval: undefined,
						setInterval: undefined,
						setTimeout: undefined,
						Function: undefined
					};
					var safeCode = "with(data){" + code + "};";
					eval(safeCode);
					window.data = undefined;	
				}
			}	
		} catch (e) {
			console.error(e);
		}
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


	window.checkTimeout = checkTimeout;
	window.safeEval = safeEval;
	window.canThisCodeRun = canThisCodeRun;

	// TODO: Prevent __defineSetter__ and __defineGetter__ from messing around with code

})(window);